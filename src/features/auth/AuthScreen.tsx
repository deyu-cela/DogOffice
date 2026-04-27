import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AuthForm } from './AuthForm';
import { SvgIcon } from '@/components/SvgIcon';

const FORCED_MSG: Record<string, string> = {
  refresh_rejected: '安全性登出：登入已失效，請重新登入。',
  no_refresh_token: '登入狀態已到期，請重新登入。',
};

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const forced = useAuthStore((s) => s.forcedLogoutReason);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const clearError = useAuthStore((s) => s.clearError);
  const clearForced = useAuthStore((s) => s.clearForcedLogoutReason);

  const loading = status === 'authenticating' || status === 'bootstrapping';

  const [slowHint, setSlowHint] = useState(false);
  useEffect(() => {
    if (!loading) {
      setSlowHint(false);
      return;
    }
    const t = setTimeout(() => setSlowHint(true), 3000);
    return () => clearTimeout(t);
  }, [loading]);

  function onTab(next: 'login' | 'register') {
    if (next === mode) return;
    setMode(next);
    clearError();
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        className="flex gap-1 mb-4 rounded-full p-1"
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <TabButton active={mode === 'login'} onClick={() => onTab('login')} label="登入" />
        <TabButton active={mode === 'register'} onClick={() => onTab('register')} label="註冊" />
      </div>

      {forced && FORCED_MSG[forced] && (
        <div
          className="mb-3 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-2"
          style={{ background: '#fff7e6', color: '#a36a14', border: '1px solid rgba(246,166,58,0.32)' }}
        >
          <span className="inline-flex items-center gap-1.5">
            <SvgIcon name="warning" size={14} />
            {FORCED_MSG[forced]}
          </span>
          <button
            type="button"
            onClick={clearForced}
            className="text-xs font-extrabold underline"
            style={{ background: 'transparent', border: 0, boxShadow: 'none', padding: 0 }}
          >
            關閉
          </button>
        </div>
      )}

      <div
        className="rounded-2xl p-5"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,249,255,0.92))',
          border: '1px solid var(--line)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <AuthForm
          mode={mode}
          loading={loading}
          error={error}
          onSubmit={mode === 'login' ? login : register}
        />
        {slowHint && (
          <div className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
            <SvgIcon name="restart" size={14} />
            伺服器喚醒中，首次開啟可能需要 15 秒…
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-full"
      style={{
        padding: '8px 0',
        fontSize: 14,
        fontWeight: 800,
        lineHeight: 1,
        background: active
          ? 'linear-gradient(180deg, #3e8cf0, #1c63c8)'
          : 'transparent',
        color: active ? 'white' : 'var(--muted)',
        border: '0',
        boxShadow: active ? '0 6px 16px rgba(47,125,225,0.28)' : 'none',
        transform: 'none',
        transition: 'background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
