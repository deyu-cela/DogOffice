import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { LeaderboardPanel } from '@/features/leaderboard/LeaderboardPanel';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';

export function SplashScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const saveStatus = useSaveStore((s) => s.status);
  const cloud = useSaveStore((s) => s.cloud);
  const saveError = useSaveStore((s) => s.error);
  const base = import.meta.env.BASE_URL;
  const [lbOpen, setLbOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const authed = authStatus === 'authed' && !!user;
  const bootstrapping = authStatus === 'bootstrapping';
  const loadingSave = saveStatus === 'loading';
  const hasSave = !!cloud?.data;

  async function onLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center text-center p-8 overflow-auto"
      style={{
        backgroundImage: `linear-gradient(rgba(234,244,255,0.86), rgba(247,251,255,0.92)), url('${base}assets/start-screen.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mb-3 inline-flex items-center gap-3">
        <SvgIcon name="appDog" size={48} />
        <span className="text-5xl md:text-6xl font-extrabold drop-shadow-sm" style={{ color: 'var(--text)' }}>
          狗狗公司
        </span>
      </div>
      <div className="text-base md:text-xl mb-6" style={{ color: 'var(--muted)' }}>
        可愛又療癒的狗狗經營小遊戲
      </div>

      {bootstrapping && (
        <StatusPill icon="restart">正在確認登入狀態…</StatusPill>
      )}

      {!bootstrapping && authed && (
        <>
          <div className="mb-1 text-base md:text-lg" style={{ color: 'var(--text)' }}>
            歡迎回來，<span className="font-extrabold">{user?.account}</span>！
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="mb-3 inline-flex items-center gap-1.5 rounded-full font-extrabold"
            style={{
              padding: '6px 14px',
              fontSize: 12,
              lineHeight: 1,
              background: 'rgba(255,255,255,0.92)',
              color: 'var(--muted)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-soft)',
              cursor: loggingOut ? 'wait' : 'pointer',
            }}
          >
            <SvgIcon name="restart" size={12} />
            {loggingOut ? '登出中…' : '切換帳號 / 登出'}
          </button>

          {loadingSave && <StatusPill icon="save">讀取雲端存檔中…</StatusPill>}

          {!loadingSave && hasSave && cloud && (
            <IpoProgress
              day={cloud.data.day}
              money={cloud.data.money}
              reputation={cloud.data.reputation ?? 0}
              officeLevel={cloud.data.officeLevel}
              projectsCompleted={cloud.data.projectsCompleted ?? 0}
              ipoAchievedAt={cloud.data.ipoAchievedAt ?? null}
              bankrupt={cloud.data.bankrupt}
              staffCount={cloud.data.staff.length}
            />
          )}

          {!loadingSave && saveError && !hasSave && (
            <div
              className="mb-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: '#fff4f4', color: '#c75050', border: '1px solid rgba(231,108,108,0.24)' }}
            >
              <SvgIcon name="warning" size={16} />
              讀取存檔失敗，可以開新的公司繼續玩
            </div>
          )}

          {!hasSave && !loadingSave && (
            <div
              className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(255,255,255,0.92)',
                color: 'var(--text)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <SvgIcon name="target" size={16} />
              IPO 上市條件：信譽 80 + 資金 $50k + 辦公室 Lv5 + 完成 80 案
            </div>
          )}

          <button
            onClick={startGame}
            disabled={loadingSave}
            className="inline-flex items-center gap-2 px-12 py-4 text-2xl rounded-full font-extrabold"
            style={{
              background: loadingSave
                ? 'linear-gradient(180deg, #b8c8e0, #8da4c4)'
                : 'linear-gradient(180deg, #3e8cf0, #1c63c8)',
              color: 'white',
              cursor: loadingSave ? 'wait' : 'pointer',
              border: '1px solid rgba(36,107,208,0.32)',
              boxShadow: '0 12px 28px rgba(47,125,225,0.32)',
            }}
          >
            <SvgIcon name={loadingSave ? 'save' : hasSave ? 'restart' : 'appDog'} size={28} />
            {loadingSave ? '讀取中…' : hasSave ? '繼續經營' : '開始經營'}
          </button>

          <LeaderboardCardButton onClick={() => setLbOpen(true)} />
        </>
      )}

      {!bootstrapping && !authed && <AuthScreen />}

      {lbOpen && <LeaderboardPanel onClose={() => setLbOpen(false)} />}
    </div>
  );
}

function LeaderboardCardButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="查看排行榜"
      className="group mt-3 relative inline-flex flex-col items-center justify-center gap-1 overflow-hidden"
      style={{
        width: 101,
        padding: '8px 11px 7px',
        borderRadius: 18,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(244,249,255,0.92) 100%)',
        border: '1px solid rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px) saturate(140%)',
        WebkitBackdropFilter: 'blur(10px) saturate(140%)',
        boxShadow:
          '0 9px 20px rgba(46,104,180,0.18), 0 3px 8px rgba(46,104,180,0.12), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -2px 4px rgba(180,205,235,0.35)',
        color: 'var(--text)',
        transition: 'transform 0.18s ease, box-shadow 0.2s ease',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 60% at 50% -10%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 60%)',
          mixBlendMode: 'screen',
        }}
      />
      <MetallicTrophy size={34} />
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: 'var(--text)',
          textShadow: '0 1px 0 rgba(255,255,255,0.85)',
        }}
      >
        排行榜
      </span>
    </button>
  );
}

function MetallicTrophy({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      style={{
        filter: 'drop-shadow(0 6px 10px rgba(15,40,80,0.45)) drop-shadow(0 1px 0 rgba(255,255,255,0.35))',
      }}
    >
      <defs>
        <linearGradient id="cupGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfe5ff" />
          <stop offset="35%" stopColor="#7fb1e8" />
          <stop offset="70%" stopColor="#3a6fb5" />
          <stop offset="100%" stopColor="#1d3f7a" />
        </linearGradient>
        <linearGradient id="cupShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9bc4ec" />
          <stop offset="100%" stopColor="#2a5594" />
        </linearGradient>
        <radialGradient id="rim" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* 左右把手 */}
      <path
        d="M18 16c-6 0-9 4-9 9 0 6 4 11 11 12"
        fill="none"
        stroke="url(#cupGrad)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M46 16c6 0 9 4 9 9 0 6-4 11-11 12"
        fill="none"
        stroke="url(#cupGrad)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      {/* 杯身 */}
      <path
        d="M16 10h32v14c0 9-6 16-16 16s-16-7-16-16V10Z"
        fill="url(#cupGrad)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.8"
      />
      {/* 杯口高光 */}
      <ellipse cx="32" cy="11" rx="15" ry="2" fill="url(#rim)" />
      {/* 左側反光 */}
      <path d="M20 13h3v18c0 4 1 7 3 9-4-2-7-7-7-13V13Z" fill="url(#cupShine)" opacity="0.85" />
      {/* 右側暗緣 */}
      <path d="M44 13v15c0 5-3 9-7 11 5-1 9-6 9-12V13h-2Z" fill="rgba(15,40,80,0.32)" />

      {/* 杯底支柱 */}
      <rect x="29" y="40" width="6" height="8" rx="1.2" fill="url(#cupGrad)" />
      <rect x="29.5" y="40" width="1.6" height="8" fill="rgba(255,255,255,0.55)" />

      {/* 底座 */}
      <path
        d="M20 50h24l-2 6H22l-2-6Z"
        fill="url(#baseGrad)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.8"
      />
      <rect x="22" y="50" width="20" height="1.4" fill="rgba(255,255,255,0.55)" />

      {/* 中央亮星點綴 */}
      <circle cx="32" cy="22" r="2" fill="rgba(255,255,255,0.9)" />
      <circle cx="32" cy="22" r="0.9" fill="#fff" />
    </svg>
  );
}

function StatusPill({ icon, children }: { icon: SvgIconName; children: React.ReactNode }) {
  return (
    <div
      className="mb-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold"
      style={{
        background: 'rgba(255,255,255,0.92)',
        color: 'var(--text)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <SvgIcon name={icon} size={18} />
      {children}
    </div>
  );
}

const IPO_REPUTATION = 80;
const IPO_MONEY = 50000;
const IPO_OFFICE_LEVEL = 4;
const IPO_PROJECTS = 80;

function IpoProgress({
  day,
  money,
  reputation,
  officeLevel,
  projectsCompleted,
  ipoAchievedAt,
  bankrupt,
  staffCount,
}: {
  day: number;
  money: number;
  reputation: number;
  officeLevel: number;
  projectsCompleted: number;
  ipoAchievedAt: number | null;
  bankrupt: boolean;
  staffCount: number;
}) {
  const cleared = ipoAchievedAt !== null;
  const conditions: { icon: SvgIconName; label: string; cur: number; target: number; fmt: (v: number) => string }[] = [
    { icon: 'chart', label: '信譽', cur: reputation, target: IPO_REPUTATION, fmt: (v) => Math.round(v).toString() },
    { icon: 'money', label: '資金', cur: money, target: IPO_MONEY, fmt: (v) => `$${v.toLocaleString()}` },
    { icon: 'office', label: '辦公室', cur: officeLevel, target: IPO_OFFICE_LEVEL, fmt: (v) => `Lv${v + 1}` },
    { icon: 'trophy', label: '完成案', cur: projectsCompleted, target: IPO_PROJECTS, fmt: (v) => `${v} 件` },
  ];

  return (
    <div
      className="mb-5 px-4 py-3 rounded-2xl w-full max-w-md"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,249,255,0.92))',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-1.5 text-sm font-extrabold" style={{ color: 'var(--text)' }}>
          <SvgIcon name={cleared ? 'trophy' : 'target'} size={18} />
          {cleared ? '已 IPO 上市' : 'IPO 進度'}
        </div>
        <div className="text-[11px] font-bold" style={{ color: 'var(--muted)' }}>
          第 {day} 天 · {staffCount} 位員工
          {bankrupt && <span style={{ color: 'var(--danger)' }}>・已破產</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {conditions.map((c) => {
          const pct = Math.min(100, Math.round((c.cur / c.target) * 100));
          const done = c.cur >= c.target;
          return (
            <div key={c.label} className="text-left">
              <div className="flex justify-between items-center text-[11px] mb-0.5">
                <span className="inline-flex items-center gap-1 font-bold" style={{ color: 'var(--muted)' }}>
                  <SvgIcon name={c.icon} size={14} />
                  {c.label}
                </span>
                <span className="font-extrabold" style={{ color: done ? 'var(--ok)' : 'var(--text)' }}>
                  {c.fmt(c.cur)} / {c.fmt(c.target)} {done && '✓'}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#dceafe' }}>
                <div
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    background: done
                      ? 'linear-gradient(90deg, #6bd4a8, #29b98f)'
                      : 'linear-gradient(90deg, #45a3ff, #2f7de1)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
