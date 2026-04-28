import { useState, type FormEvent } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import type { AuthError, Credentials } from '@/types/auth';
import { clearLastAccount, loadLastAccount, saveLastAccount } from '@/lib/authStorage';

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

  const shown = localError ?? error;
  const accountErr = shown?.field === 'account' ? shown : null;
  const passwordErr = shown?.field === 'password' ? shown : null;
  const formErr = shown && shown.field === null ? shown : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
      <label className="flex flex-col gap-1">
        <span className="auth-control-width auth-control-top text-sm font-extrabold" style={{ color: '#173b78' }}>
          帳號 / Email
        </span>
        <div
          className="auth-control-width auth-control-top auth-skew-field h-[58px]"
          style={{
            border: `1px solid ${accountErr ? 'var(--danger)' : 'var(--line)'}`,
          }}
        >
          <div className="auth-skew-content flex items-center gap-3 px-5 h-full">
            <SvgIcon name="account" size={22} />
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
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#173b78' }}
            />
          </div>
        </div>
        {accountErr && (
          <span className="text-xs font-bold" style={{ color: 'var(--danger)' }}>
            {accountErr.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="auth-control-width auth-control-mid text-sm font-extrabold" style={{ color: '#173b78' }}>
          密碼
        </span>
        <div
          className="auth-control-width auth-control-mid auth-skew-field h-[58px]"
          style={{
            border: `1px solid ${passwordErr ? 'var(--danger)' : 'var(--line)'}`,
          }}
        >
          <div className="auth-skew-content flex items-center gap-3 px-5 h-full">
            <SvgIcon name="lock" size={22} />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (localError?.field === 'password') setLocalError(null);
              }}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={loading}
              placeholder="請輸入密碼"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#173b78' }}
            />
            <span style={{ color: '#8aa2c8' }}>
              <EyeIcon />
            </span>
          </div>
        </div>
        {passwordErr && (
          <span className="text-xs font-bold" style={{ color: 'var(--danger)' }}>
            {passwordErr.message}
          </span>
        )}
      </label>

      <div className="flex items-center justify-between gap-3 pt-0.5">
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none font-bold" style={{ color: '#526b96' }}>
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => {
            const v = e.target.checked;
            setRemember(v);
            if (!v) clearLastAccount();
          }}
          disabled={loading}
          className="w-4 h-4 accent-blue-500"
        />
        <span>記住帳號（下次自動填入）</span>
      </label>
        <button
          type="button"
          className="text-sm font-extrabold"
          style={{ background: 'transparent', border: 0, boxShadow: 'none', color: '#2f7de1', padding: 0 }}
        >
          忘記密碼？
        </button>
      </div>

      {formErr && (
        <div
          className="px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: '#fff4f4', color: '#c75050', border: '1px solid rgba(231,108,108,0.24)' }}
        >
          {formErr.message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="auth-control-width auth-control-bottom auth-skew-submit px-6 py-4 text-lg font-extrabold mt-1"
        style={{
          background: loading
            ? 'linear-gradient(180deg, #b8c8e0, #8da4c4)'
            : 'linear-gradient(180deg, #3e8cf0, #1c63c8)',
          color: 'white',
          cursor: loading ? 'wait' : 'pointer',
          border: '1px solid rgba(36,107,208,0.32)',
          boxShadow: '0 8px 22px rgba(47,125,225,0.32)',
        }}
      >
        <span className="auth-skew-content block">
          {loading ? '請稍候…' : mode === 'login' ? '登入遊戲' : '註冊並登入'}
        </span>
      </button>

      <style>{`
        .auth-control-width {
          width: calc(100% + 40px);
          margin-left: -20px;
          margin-right: -20px;
          transform: translateX(var(--rail-x, 0px));
        }
        .auth-control-top {
          --rail-x: 17px;
        }
        .auth-control-mid {
          --rail-x: 6px;
        }
        .auth-control-bottom {
          --rail-x: -5px;
        }
        .auth-skew-field,
        .auth-skew-submit {
          border-radius: 9px;
          transform: translateX(var(--rail-x, 0px)) skewX(-7deg);
          transform-origin: center;
        }
        .auth-skew-field {
          background: rgba(255,255,255,0.92);
          box-shadow: inset 0 1px 2px rgba(46,104,180,0.08);
          overflow: hidden;
        }
        .auth-skew-content {
          transform: skewX(7deg);
          transform-origin: center;
        }
        @media (max-width: 1023px) {
          .auth-control-width {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
            --rail-x: 0px;
          }
          .auth-skew-field,
          .auth-skew-submit,
          .auth-skew-content {
            transform: none;
          }
        }
        @media (max-width: 520px) {
          .auth-skew-content {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      `}</style>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
