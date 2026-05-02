import { useEffect, useState } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import { useAuthStore } from '@/store/authStore';
import { AuthForm } from './AuthForm';
import './auth.css';

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
    <div className="auth-pawder-shell">
      <div className="auth-pawder-welcome">
        <span className="auth-welcome-mark">
          <img
            src={`${import.meta.env.BASE_URL}assets/login/cute-paw-welcome-icon.png`}
            alt="可愛狗掌"
            width={56}
            height={56}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </span>
        <h1>{mode === 'login' ? '歡迎回來，老闆！' : '建立帳號'}</h1>
        <p>
          {mode === 'login' ? (
            <>狗狗們都在等你打卡上班 <span aria-hidden>🐾</span></>
          ) : (
            '註冊後即可同步雲端存檔'
          )}
        </p>
      </div>

      <div className="auth-pawder-tabs grid grid-cols-2 gap-3">
        <TabButton active={mode === 'login'} onClick={() => onTab('login')} label="登入" />
        <TabButton active={mode === 'register'} onClick={() => onTab('register')} label="註冊" />
      </div>

      {forced && FORCED_MSG[forced] && (
        <div
          className="auth-pawder-forced mb-4 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between gap-2"
        >
          <span className="inline-flex items-center gap-1.5">
            <SvgIcon name="warning" size={14} />
            {FORCED_MSG[forced]}
          </span>
          <button
            type="button"
            onClick={clearForced}
            className="auth-pawder-forced-close text-xs font-extrabold underline"
          >
            關閉
          </button>
        </div>
      )}

      <AuthForm
        mode={mode}
        loading={loading}
        error={error}
        onSubmit={mode === 'login' ? login : register}
      />

      {slowHint && (
        <div className="auth-pawder-slow mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs">
          <SvgIcon name="restart" size={14} />
          伺服器喚醒中，首次開啟可能需要 15 秒...
        </div>
      )}

    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="auth-pawder-tab"
      data-active={active ? 'true' : 'false'}
    >
      {label}
    </button>
  );
}
