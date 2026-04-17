import type { StoredAuth } from '@/types/auth';

const STORAGE_KEY = 'dogoffice:auth:v1';
const LAST_ACCOUNT_KEY = 'dogoffice:lastAccount:v1';

export function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAuth> | null;
    if (
      !parsed ||
      typeof parsed.access_token !== 'string' ||
      typeof parsed.refresh_token !== 'string' ||
      typeof parsed.access_expires_at !== 'string' ||
      typeof parsed.refresh_expires_at !== 'string' ||
      !parsed.user ||
      typeof parsed.user.account !== 'string' ||
      typeof parsed.user.userId !== 'number'
    ) {
      return null;
    }
    return parsed as StoredAuth;
  } catch {
    return null;
  }
}

export function saveAuth(data: StoredAuth): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage 無痕 / 爆滿時靜默跳過
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 同上
  }
}

export function loadLastAccount(): string | null {
  try {
    const v = localStorage.getItem(LAST_ACCOUNT_KEY);
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

export function saveLastAccount(account: string): void {
  try {
    localStorage.setItem(LAST_ACCOUNT_KEY, account);
  } catch {
    // 同上
  }
}

export function clearLastAccount(): void {
  try {
    localStorage.removeItem(LAST_ACCOUNT_KEY);
  } catch {
    // 同上
  }
}
