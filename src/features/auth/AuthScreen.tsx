import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AuthForm } from './AuthForm';

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
        className="flex gap-2 mb-4 rounded-full p-1"
        style={{ background: 'rgba(255,255,255,0.75)', border: '2px solid rgba(90,70,54,0.12)' }}
      >
        <button
          type="button"
          onClick={() => onTab('login')}
          className="flex-1 text-sm font-bold py-2 rounded-full"
          style={{
            background: mode === 'login' ? 'linear-gradient(180deg, #ffc7d1, #eb93a3)' : 'transparent',
            color: mode === 'login' ? 'white' : '#7a685a',
          }}
        >
          登入
        </button>
        <button
          type="button"
          onClick={() => onTab('register')}
          className="flex-1 text-sm font-bold py-2 rounded-full"
          style={{
            background: mode === 'register' ? 'linear-gradient(180deg, #ffc7d1, #eb93a3)' : 'transparent',
            color: mode === 'register' ? 'white' : '#7a685a',
          }}
        >
          註冊
        </button>
      </div>

      {forced && FORCED_MSG[forced] && (
        <div
          className="mb-3 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-2"
          style={{ background: '#fff4d6', color: '#8a6a2a' }}
        >
          <span>{FORCED_MSG[forced]}</span>
          <button type="button" onClick={clearForced} className="underline">
            關閉
          </button>
        </div>
      )}

      <div
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.88)',
          border: '2px solid rgba(90,70,54,0.12)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <AuthForm
          mode={mode}
          loading={loading}
          error={error}
          onSubmit={mode === 'login' ? login : register}
        />
        {slowHint && (
          <div className="mt-3 text-xs text-center" style={{ color: '#7a685a' }}>
            ⏳ 伺服器喚醒中，首次開啟可能需要 15 秒…
          </div>
        )}
      </div>
    </div>
  );
}
