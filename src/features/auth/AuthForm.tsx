import { useState, type FormEvent } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import type { AuthError, Credentials } from '@/types/auth';
import { clearLastAccount, loadLastAccount, saveLastAccount } from '@/lib/authStorage';
import './auth.css';

type Mode = 'login' | 'register';

type Props = {
  mode: Mode;
  loading: boolean;
  error: AuthError | null;
  onSubmit: (c: Credentials) => Promise<void>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_RE = /^[a-z0-9_]{3,30}$/;

export function AuthForm({ mode, loading, error, onSubmit }: Props) {
  const [account, setAccount] = useState(() => loadLastAccount() ?? '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => loadLastAccount() !== null);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<AuthError | null>(null);

  function validate(): AuthError | null {
    const acc = account.trim().toLowerCase();
    if (!acc) return { message: '請輸入帳號或 email', field: 'account' };
    if (!EMAIL_RE.test(acc) && !USER_RE.test(acc)) {
      return { message: '帳號需為 email，或 3-30 字的英數字＋底線（小寫）', field: 'account' };
    }
    if (password.length < 8 || password.length > 72) {
      return { message: '密碼長度需 8-72 字元', field: 'password' };
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    const v = validate();
    if (v) {
      setLocalError(v);
      return;
    }
    setLocalError(null);
    const acc = account.trim().toLowerCase();
    if (remember) saveLastAccount(acc);
    try {
      await onSubmit({ account: acc, password });
    } catch {
      // parent 透過 error prop 顯示
    }
  }

  function notifyComingSoon(label: string) {
    // eslint-disable-next-line no-alert
    alert(`${label}準備中，敬請期待`);
  }

  const shown = localError ?? error;
  const accountErr = shown?.field === 'account' ? shown : null;
  const passwordErr = shown?.field === 'password' ? shown : null;
  const formErr = shown && shown.field === null ? shown : null;

  return (
    <form onSubmit={handleSubmit} className="auth-pink-form flex flex-col gap-3 text-left">
      <label className="flex flex-col gap-1.5">
        <span className="auth-pink-label">
          <span className="auth-pink-required" aria-hidden>•</span> 帳號 / Email
        </span>
        <div className="auth-pink-field" data-error={accountErr ? 'true' : 'false'}>
          <SvgIcon name="account" size={18} />
          <input
            type="text"
            value={account}
            onChange={(e) => {
              setAccount(e.target.value);
              if (localError?.field === 'account') setLocalError(null);
            }}
            autoComplete="username"
            disabled={loading}
            spellCheck={false}
            placeholder="請輸入帳號或電子郵件"
          />
        </div>
        {accountErr && <span className="auth-pink-err">{accountErr.message}</span>}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="auth-pink-label">
          <span className="auth-pink-required" aria-hidden>•</span> 密碼
        </span>
        <div className="auth-pink-field" data-error={passwordErr ? 'true' : 'false'}>
          <SvgIcon name="lock" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (localError?.field === 'password') setLocalError(null);
            }}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            disabled={loading}
            placeholder="請輸入密碼"
          />
          <button
            type="button"
            className="auth-pink-eye"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
          >
            <EyeIcon />
          </button>
        </div>
        {passwordErr && <span className="auth-pink-err">{passwordErr.message}</span>}
      </label>

      <div className="flex items-center justify-between gap-3 pt-0.5">
        <label className="auth-pink-remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => {
              const v = e.target.checked;
              setRemember(v);
              if (!v) clearLastAccount();
            }}
            disabled={loading}
            aria-label="記住我"
          />
          <span className="auth-paw-check" aria-hidden>
            <PawMark active={remember} />
          </span>
          <span>記住我（下次自動填入）</span>
        </label>
        <button
          type="button"
          className="auth-pink-forgot"
          onClick={() => notifyComingSoon('忘記密碼')}
        >
          忘記密碼？
        </button>
      </div>

      {formErr && (
        <div className="auth-pink-form-err">{formErr.message}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="auth-pink-submit"
        data-loading={loading ? 'true' : 'false'}
      >
        <PawIcon />
        <span>{loading ? '請稍候…' : mode === 'login' ? '登入遊戲' : '建立帳號'}</span>
      </button>

      <div className="auth-pink-divider">
        <span>其他方式</span>
      </div>

      <div className="auth-pink-sso grid grid-cols-2 gap-3">
        <button
          type="button"
          className="auth-pink-sso-btn"
          onClick={() => notifyComingSoon('Google 登入')}
        >
          <GoogleIcon />
          <span>Google</span>
        </button>
        <button
          type="button"
          className="auth-pink-sso-btn"
          onClick={() => notifyComingSoon('Apple 登入')}
        >
          <AppleIcon />
          <span>Apple</span>
        </button>
      </div>

    </form>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PawIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <ellipse cx="6" cy="9" rx="2" ry="2.6" />
      <ellipse cx="10.5" cy="6.5" rx="1.8" ry="2.4" />
      <ellipse cx="15" cy="6.5" rx="1.8" ry="2.4" />
      <ellipse cx="18" cy="9" rx="2" ry="2.6" />
      <path d="M12 11.5c-3.6 0-6 3-6 5.4 0 1.6 1.2 2.6 2.7 2.6 1 0 1.8-.5 3.3-.5s2.3.5 3.3.5c1.5 0 2.7-1 2.7-2.6 0-2.4-2.4-5.4-6-5.4Z" />
    </svg>
  );
}

function PawMark({ active }: { active: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden style={{ opacity: active ? 1 : 0.55 }} fill="currentColor">
      <ellipse cx="6" cy="9" rx="2" ry="2.6" />
      <ellipse cx="10.5" cy="6.5" rx="1.8" ry="2.4" />
      <ellipse cx="15" cy="6.5" rx="1.8" ry="2.4" />
      <ellipse cx="18" cy="9" rx="2" ry="2.6" />
      <path d="M12 11.5c-3.6 0-6 3-6 5.4 0 1.6 1.2 2.6 2.7 2.6 1 0 1.8-.5 3.3-.5s2.3.5 3.3.5c1.5 0 2.7-1 2.7-2.6 0-2.4-2.4-5.4-6-5.4Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.3l-6.2-5.2c-2 1.4-4.5 2.3-7.2 2.3-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.4-.4-3.5Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M16.5 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-2-3.7-2-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.2 10.1.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.2 3.1-2.5.7-1 1.1-2 1.5-3-3.2-1.2-3.9-3.5-3.9-3.7Zm-2.6-7.1c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.5 3-1.3Z" />
    </svg>
  );
}
