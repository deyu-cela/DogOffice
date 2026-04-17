import { useState, type FormEvent } from 'react';
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold" style={{ color: '#5b3c2b' }}>
          帳號 / Email
        </span>
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
          placeholder="your@mail.com 或 my_account"
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'white',
            border: `2px solid ${accountErr ? '#d75d5d' : 'rgba(90,70,54,0.15)'}`,
          }}
        />
        {accountErr && (
          <span className="text-xs" style={{ color: '#d75d5d' }}>
            {accountErr.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold" style={{ color: '#5b3c2b' }}>
          密碼
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (localError?.field === 'password') setLocalError(null);
          }}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          disabled={loading}
          placeholder="8-72 字元"
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'white',
            border: `2px solid ${passwordErr ? '#d75d5d' : 'rgba(90,70,54,0.15)'}`,
          }}
        />
        {passwordErr && (
          <span className="text-xs" style={{ color: '#d75d5d' }}>
            {passwordErr.message}
          </span>
        )}
      </label>

      <label className="flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: '#5b3c2b' }}>
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => {
            const v = e.target.checked;
            setRemember(v);
            if (!v) clearLastAccount();
          }}
          disabled={loading}
          className="w-4 h-4 accent-orange-400"
        />
        <span>記住帳號（下次自動填入）</span>
      </label>

      {formErr && (
        <div
          className="px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: '#ffe6e6', color: '#a03d3d' }}
        >
          {formErr.message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 text-base rounded-full font-extrabold mt-1"
        style={{
          background: loading ? '#c9a57b' : 'linear-gradient(180deg, #ffcf6b, #ff9f43)',
          color: 'white',
          cursor: loading ? 'wait' : 'pointer',
          boxShadow: '0 6px 18px rgba(255,159,67,0.35)',
        }}
      >
        {loading ? '請稍候…' : mode === 'login' ? '登入' : '註冊並登入'}
      </button>
    </form>
  );
}
