import type { CommonResponseBody, TokenPair } from '@/types/auth';

export class ApiError extends Error {
  readonly status: number;
  readonly code: number;
  readonly data: unknown;

  constructor(status: number, code: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message = '連不上伺服器，請檢查網路或稍後再試') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message = '伺服器回應逾時，請稍後再試') {
    super(message);
    this.name = 'TimeoutError';
  }
}

type AuthAdapter = {
  getAccessToken: () => string | null;
  getAccessExpiresAt: () => string | null;
  getRefreshToken: () => string | null;
  applyTokens: (pair: TokenPair) => void;
  onForceLogout: (reason: string) => void;
};

let adapter: AuthAdapter | null = null;

export function setAuthAdapter(a: AuthAdapter): void {
  adapter = a;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const PROACTIVE_REFRESH_MS = 5 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 35000;

let refreshPromise: Promise<void> | null = null;

async function rawFetch(path: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  if (!API_BASE) {
    throw new NetworkError('未設定 VITE_API_BASE_URL');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...init.headers,
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new TimeoutError();
    }
    throw new NetworkError();
  } finally {
    clearTimeout(timer);
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  let body: Partial<CommonResponseBody<T>> = {};
  try {
    body = (await res.json()) as Partial<CommonResponseBody<T>>;
  } catch {
    // 空 body 或非 JSON，留空
  }
  if (!res.ok) {
    throw new ApiError(
      res.status,
      typeof body.code === 'number' ? body.code : res.status,
      typeof body.message === 'string' && body.message ? body.message : `HTTP ${res.status}`,
      body.data,
    );
  }
  return (body.data ?? ({} as T)) as T;
}

async function runRefresh(): Promise<void> {
  if (!adapter) throw new Error('auth adapter 尚未註冊');
  const refreshToken = adapter.getRefreshToken();
  if (!refreshToken) {
    adapter.onForceLogout('no_refresh_token');
    throw new ApiError(401, 401, 'missing refresh token');
  }
  try {
    const res = await rawFetch(
      '/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) },
      DEFAULT_TIMEOUT_MS,
    );
    const pair = await parseResponse<TokenPair>(res);
    adapter.applyTokens(pair);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 400 || err.status === 401)) {
      adapter.onForceLogout('refresh_rejected');
    }
    throw err;
  }
}

export function ensureRefresh(): Promise<void> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = runRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  auth?: boolean;
  timeoutMs?: number;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  if (auth && adapter) {
    const expiresAt = adapter.getAccessExpiresAt();
    if (expiresAt) {
      const expMs = new Date(expiresAt).getTime();
      if (Number.isFinite(expMs) && expMs - Date.now() < PROACTIVE_REFRESH_MS) {
        try {
          await ensureRefresh();
        } catch {
          // proactive refresh 失敗：讓下面照常送，收 401 再處理
        }
      }
    }
  }

  const send = (): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (auth && adapter) {
      const token = adapter.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return rawFetch(
      path,
      {
        method,
        body: body === undefined ? undefined : JSON.stringify(body),
        headers,
      },
      timeoutMs,
    );
  };

  let res = await send();
  if (res.status === 401 && auth && adapter) {
    await ensureRefresh();
    res = await send();
  }
  return parseResponse<T>(res);
}
