import { useEffect, useState } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
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
    <div className="auth-login-card-shell w-full min-h-[1032px]">
      <div className="auth-login-card-content">
      <div className="auth-tab-row grid grid-cols-2 gap-7">
        <TabButton active={mode === 'login'} onClick={() => onTab('login')} label="登入" />
        <TabButton active={mode === 'register'} onClick={() => onTab('register')} label="註冊" />
      </div>

      <div className="text-center mb-6 auth-welcome-block">
        <SvgIcon name="appDog" size={48} />
        <div className="mt-2 text-[28px] font-extrabold leading-none" style={{ color: '#173b78' }}>
          {mode === 'login' ? '歡迎回來！' : '建立帳號'}
        </div>
        <div className="text-sm mt-3" style={{ color: '#8aa2c8' }}>
          {mode === 'login' ? '登入您的帳號繼續經營狗狗公司' : '註冊後即可同步雲端存檔'}
        </div>
      </div>

      {forced && FORCED_MSG[forced] && (
        <div
          className="mb-4 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between gap-2"
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

      <AuthForm
        mode={mode}
        loading={loading}
        error={error}
        onSubmit={mode === 'login' ? login : register}
      />

      {slowHint && (
        <div className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
          <SvgIcon name="restart" size={14} />
          伺服器喚醒中，首次開啟可能需要 15 秒...
        </div>
      )}
      </div>

      <style>{`
        .auth-login-card-shell {
          position: relative;
          min-height: min(1032px, calc(100vh - 210px));
          filter: drop-shadow(0 24px 50px rgba(46,104,180,0.2));
        }
        .auth-login-card-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          background: #ffffff;
          border: 1px solid rgba(202,221,247,0.95);
          border-radius: 18px;
          transform: skewX(-7deg);
          transform-origin: center;
        }
        .auth-login-card-content {
          position: relative;
          z-index: 1;
          min-height: min(1032px, calc(100vh - 210px));
          padding: 40px clamp(34px, 3vw, 54px) 56px clamp(34px, 3vw, 54px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .auth-tab-row {
          position: absolute;
          top: 78px;
          left: clamp(28px, 2.4vw, 42px);
          right: clamp(28px, 2.4vw, 42px);
          transform: translateX(clamp(18px, 1.7vw, 30px));
        }
        .auth-welcome-block {
          margin-top: 0;
        }
        @media (max-width: 1023px) {
          .auth-login-card-shell::before {
            transform: none;
          }
          .auth-login-card-content {
            min-height: auto;
            padding: 30px 22px 34px;
            justify-content: flex-start;
          }
          .auth-tab-row {
            position: static;
            transform: none;
            margin-bottom: 28px;
          }
          .auth-welcome-block {
            margin-top: 0;
          }
        }
        @media (max-width: 520px) {
          .auth-login-card-content {
            padding: 24px 14px 28px;
          }
          .auth-tab-row {
            gap: 18px;
            margin-bottom: 24px;
          }
        }
      `}</style>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 font-extrabold"
      style={{
        padding: '0 0 14px',
        fontSize: 22,
        lineHeight: 1,
        background: '#ffffff',
        color: active ? '#2f7de1' : '#8aa2c8',
        border: '0',
        borderBottom: active ? '3px solid #2f7de1' : '2px solid #d7e3f6',
        boxShadow: 'none',
        transition: 'color 0.18s ease, border-color 0.18s ease',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
