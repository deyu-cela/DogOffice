import { create } from 'zustand';
import type {
  AuthError,
  AuthStatus,
  AuthUser,
  Credentials,
  LoginResponse,
  MeResponse,
  RegisterResponse,
  StoredAuth,
  TokenPair,
} from '@/types/auth';
import { ApiError, NetworkError, TimeoutError, apiFetch, setAuthAdapter } from '@/lib/api';
import { clearAuth, loadAuth, saveAuth } from '@/lib/authStorage';

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  access_token: string | null;
  access_expires_at: string | null;
  refresh_token: string | null;
  refresh_expires_at: string | null;
  error: AuthError | null;
  forcedLogoutReason: string | null;
};

type AuthActions = {
  bootstrap: () => Promise<void>;
  login: (c: Credentials) => Promise<void>;
  register: (c: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearForcedLogoutReason: () => void;
};

const initialState: AuthState = {
  status: 'idle',
  user: null,
  access_token: null,
  access_expires_at: null,
  refresh_token: null,
  refresh_expires_at: null,
  error: null,
  forcedLogoutReason: null,
};

function toAuthError(err: unknown, action: 'login' | 'register'): AuthError {
  if (err instanceof ApiError) {
    if (action === 'register' && err.status === 409) {
      return { message: '這個帳號已經被註冊過了', field: 'account' };
    }
    if (action === 'login' && err.status === 401) {
      return { message: '帳號或密碼錯誤', field: null };
    }
    if (err.status === 400) {
      return { message: err.message || '輸入格式不正確', field: null };
    }
    if (err.status >= 500) {
      return { message: '伺服器忙碌中，請稍後再試', field: null };
    }
    return { message: err.message || `發生錯誤 (${err.status})`, field: null };
  }
  if (err instanceof TimeoutError) {
    return { message: err.message, field: null };
  }
  if (err instanceof NetworkError) {
    return { message: err.message, field: null };
  }
  return { message: '發生未預期的錯誤', field: null };
}

let bootstrapPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  bootstrap: () => {
    if (bootstrapPromise) return bootstrapPromise;
    const run = async () => {
      set({ status: 'bootstrapping', error: null });
      const stored = loadAuth();
      if (!stored) {
        set({ status: 'idle' });
        return;
      }
      const refreshExpMs = new Date(stored.refresh_expires_at).getTime();
      if (!Number.isFinite(refreshExpMs) || refreshExpMs <= Date.now()) {
        clearAuth();
        set({ ...initialState, status: 'idle' });
        return;
      }
      set({
        access_token: stored.access_token,
        access_expires_at: stored.access_expires_at,
        refresh_token: stored.refresh_token,
        refresh_expires_at: stored.refresh_expires_at,
        user: stored.user,
      });
      try {
        const me = await apiFetch<MeResponse>('/auth/me', { auth: true });
        const user: AuthUser = { userId: me.user_id, account: me.account };
        const latest = get();
        if (latest.access_token && latest.refresh_token) {
          saveAuth({
            access_token: latest.access_token,
            access_expires_at: latest.access_expires_at ?? stored.access_expires_at,
            refresh_token: latest.refresh_token,
            refresh_expires_at: latest.refresh_expires_at ?? stored.refresh_expires_at,
            user,
          });
        }
        set({ user, status: 'authed' });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // adapter.onForceLogout 已處理清除
          return;
        }
        // 其他錯誤（網路、逾時）：保留 token，讓使用者自己決定是否重試
        set({ status: 'idle' });
      }
    };
    bootstrapPromise = run().finally(() => {
      bootstrapPromise = null;
    });
    return bootstrapPromise;
  },

  login: async (c) => {
    set({ status: 'authenticating', error: null, forcedLogoutReason: null });
    try {
      const tokens = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { account: c.account.trim().toLowerCase(), password: c.password },
      });
      set({
        access_token: tokens.access_token,
        access_expires_at: tokens.access_expires_at,
        refresh_token: tokens.refresh_token,
        refresh_expires_at: tokens.refresh_expires_at,
      });
      const me = await apiFetch<MeResponse>('/auth/me', { auth: true });
      const user: AuthUser = { userId: me.user_id, account: me.account };
      saveAuth({ ...tokens, user });
      set({ user, status: 'authed', error: null });
    } catch (err) {
      set({ status: 'idle', error: toAuthError(err, 'login') });
      throw err;
    }
  },

  register: async (c) => {
    set({ status: 'authenticating', error: null, forcedLogoutReason: null });
    try {
      await apiFetch<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: { account: c.account.trim().toLowerCase(), password: c.password },
      });
      await get().login(c);
    } catch (err) {
      // 如果 register 成功但 login 失敗，login 已經 set 過 error 了
      if (get().status !== 'idle' || !get().error) {
        set({ status: 'idle', error: toAuthError(err, 'register') });
      }
      throw err;
    }
  },

  logout: async () => {
    const token = get().refresh_token;
    if (token) {
      try {
        await apiFetch<unknown>('/auth/logout', {
          method: 'POST',
          body: { refresh_token: token },
          timeoutMs: 8000,
        });
      } catch {
        // 冪等，失敗也繼續清本地
      }
    }
    clearAuth();
    set({ ...initialState, status: 'idle' });
  },

  clearError: () => set({ error: null }),
  clearForcedLogoutReason: () => set({ forcedLogoutReason: null }),
}));

setAuthAdapter({
  getAccessToken: () => useAuthStore.getState().access_token,
  getAccessExpiresAt: () => useAuthStore.getState().access_expires_at,
  getRefreshToken: () => useAuthStore.getState().refresh_token,
  applyTokens: (pair: TokenPair) => {
    const state = useAuthStore.getState();
    useAuthStore.setState({
      access_token: pair.access_token,
      access_expires_at: pair.access_expires_at,
      refresh_token: pair.refresh_token,
      refresh_expires_at: pair.refresh_expires_at,
    });
    if (state.user) {
      const next: StoredAuth = { ...pair, user: state.user };
      saveAuth(next);
    }
  },
  onForceLogout: (reason: string) => {
    clearAuth();
    useAuthStore.setState({ ...initialState, status: 'idle', forcedLogoutReason: reason });
  },
});
