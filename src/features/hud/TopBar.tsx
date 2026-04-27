import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { SaveIndicator } from './SaveIndicator';
import { UserBadge } from './UserBadge';
import { RestartButton } from './RestartButton';
import { LeaderboardPanel } from '@/features/leaderboard/LeaderboardPanel';
import { SvgIcon } from '@/components/SvgIcon';

const IPO_REPUTATION = 80;
const IPO_MONEY = 50000;
const IPO_OFFICE_LEVEL = 4;
const IPO_PROJECTS = 80;

function moneyShort(value: number): string {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 10000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function TopBar() {
  const day = useGameStore((s) => s.day);
  const money = useGameStore((s) => s.money);
  const reputation = useGameStore((s) => s.reputation);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);
  const staff = useGameStore((s) => s.staff);
  const ipoAchievedAt = useGameStore((s) => s.ipoAchievedAt);
  const authedUser = useAuthStore((s) => s.user);
  const [lbOpen, setLbOpen] = useState(false);

  const repProgress = Math.min(100, (reputation / IPO_REPUTATION) * 100);
  const moneyProgress = Math.min(100, (money / IPO_MONEY) * 100);
  const officeProgress = Math.min(100, (officeLevel / IPO_OFFICE_LEVEL) * 100);
  const projectProgress = Math.min(100, (projectsCompleted / IPO_PROJECTS) * 100);
  const ipoProgress = Math.round((repProgress + moneyProgress + officeProgress + projectProgress) / 4);

  return (
    <>
      <header
        className="grid grid-cols-1 gap-3 rounded-2xl p-3 xl:grid-cols-[auto_minmax(360px,1fr)_auto] xl:items-center"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.97), rgba(246,251,255,0.93))',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
            style={{
              background: 'linear-gradient(180deg, #ffffff, #e3f1ff)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <SvgIcon name="appDog" size={30} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-extrabold leading-tight md:text-2xl">
                狗狗公司
              </h1>
              <span
                className="rounded-lg px-2 py-1 text-xs font-extrabold"
                style={{ background: '#eaf4ff', color: 'var(--accent)', border: '1px solid var(--line)' }}
              >
                第 {day} 天
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold" style={{ color: 'var(--muted)' }}>
              <span>Lv. {officeLevel + 1}</span>
              <span>員工 {staff.length}</span>
              <span>IPO {ipoAchievedAt !== null ? '已達成' : `${ipoProgress}%`}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setLbOpen(true)}
          className="flex min-w-0 flex-wrap items-center gap-2 rounded-none px-0 py-0 text-left"
          style={{
            background: 'transparent',
            border: 0,
            boxShadow: 'none',
            transform: 'none',
          }}
          title="查看 IPO 條件進度"
        >
          <span
            className="hidden h-10 w-px rotate-[14deg] xl:block"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(121,164,224,0.52), transparent)' }}
          />
          <span className="mr-1 whitespace-nowrap text-sm font-extrabold" style={{ color: 'var(--text)' }}>
            IPO
          </span>
          <ConditionItem kind="reputation" value={`${Math.round(reputation)}/${IPO_REPUTATION}`} done={repProgress >= 100} />
          <ConditionItem kind="money" value={`${moneyShort(money)}/50K`} done={moneyProgress >= 100} />
          <ConditionItem kind="office" value={`${officeLevel + 1}/${IPO_OFFICE_LEVEL + 1}`} done={officeProgress >= 100} />
          <ConditionItem kind="projects" value={`${projectsCompleted}/${IPO_PROJECTS}`} done={projectProgress >= 100} />
          <span className="whitespace-nowrap text-xs font-extrabold" style={{ color: 'var(--accent)' }}>
            {ipoAchievedAt !== null ? '達成' : `${ipoProgress}%`}
          </span>
        </button>

        <div className="flex min-w-0 flex-wrap items-center justify-start gap-2 xl:justify-end">
          <button
            type="button"
            onClick={() => setLbOpen(true)}
            className="topbar-action h-12 rounded-xl px-4 text-sm font-extrabold"
            style={{
              background: 'linear-gradient(180deg, #ffffff, #eaf4ff)',
              border: '1px solid rgba(121, 164, 224, 0.34)',
              color: 'var(--text)',
              boxShadow: '0 4px 12px rgba(46,104,180,0.1), inset 0 1px 0 rgba(255,255,255,0.95)',
            }}
            title="排行榜"
          >
            <TrophyIcon />
            <span className="hidden sm:inline">排行榜</span>
          </button>
          {authedUser && (
            <>
              <SaveIndicator />
              <UserBadge />
              <RestartButton />
            </>
          )}
        </div>

      </header>
      {lbOpen && <LeaderboardPanel onClose={() => setLbOpen(false)} />}
    </>
  );
}

function ConditionItem({ kind, value, done }: { kind: 'reputation' | 'money' | 'office' | 'projects'; value: string; done: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="hidden h-10 w-px rotate-[14deg] sm:block"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(121,164,224,0.48), transparent)' }}
      />
      <ConditionIcon kind={kind} />
      <span className="whitespace-nowrap text-sm font-extrabold tabular-nums" style={{ color: '#17356f' }}>
        {value}
      </span>
      <span className="text-xl font-extrabold leading-none" style={{ color: done ? '#20b79c' : '#2f7de1' }}>
        {done ? '✓' : '+'}
      </span>
    </span>
  );
}

function ConditionIcon({ kind }: { kind: 'reputation' | 'money' | 'office' | 'projects' }) {
  const common = {
    blue: '#1d5fb8',
    lightBlue: '#4f95ef',
  };

  if (kind === 'reputation') {
    return (
      <svg width="25" height="25" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M7 24h18" stroke={common.blue} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M9 21V12M16 21V8M23 21v-6" stroke={common.lightBlue} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M8 13l8-6 7 5" fill="none" stroke={common.blue} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 8v5h-5" fill="none" stroke={common.blue} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === 'money') {
    return (
      <svg width="25" height="25" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="5" y="9" width="22" height="14" rx="2.5" fill="#ffd96a" stroke={common.blue} strokeWidth="2" transform="rotate(-16 16 16)" />
        <circle cx="16" cy="16" r="3.2" fill="#fff7c7" stroke="#f6a63a" strokeWidth="1.4" />
        <path d="M8.5 15.5h2M21.5 16.5h2" stroke={common.blue} strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'office') {
    return (
      <svg width="25" height="25" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M8 25V8h11v17M19 13h5v12" fill="#eaf4ff" stroke={common.blue} strokeWidth="2" strokeLinejoin="round" />
        <path d="M11 12h2M15 12h2M11 16h2M15 16h2M11 20h2M15 20h2M22 17h1" stroke={common.lightBlue} strokeWidth="2" strokeLinecap="round" />
        <path d="M6 25h20" stroke={common.blue} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="25" height="25" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M10 6h12v5.4c0 4.4-2.4 7.2-6 7.2s-6-2.8-6-7.2V6Z" fill="#ffd96a" stroke={common.blue} strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 8H7c-.7 0-1.2.5-1.2 1.2 0 3.3 1.8 5.5 4.4 6M22 8h3c.7 0 1.2.5 1.2 1.2 0 3.3-1.8 5.5-4.4 6" fill="none" stroke={common.blue} strokeWidth="2" strokeLinecap="round" />
      <path d="M16 18.5v4M12 26h8M13.5 22.5h5" fill="none" stroke={common.blue} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true" className="inline-block align-middle">
      <defs>
        <linearGradient id="topbar-trophy-gold" x1="0" x2="0" y1="4" y2="24">
          <stop stopColor="#ffd96a" />
          <stop offset="1" stopColor="#f6a63a" />
        </linearGradient>
        <linearGradient id="topbar-trophy-blue" x1="0" x2="0" y1="3" y2="29">
          <stop stopColor="#4f95ef" />
          <stop offset="1" stopColor="#1d5fb8" />
        </linearGradient>
      </defs>
      <path
        d="M10 6h12v5.4c0 4.4-2.4 7.2-6 7.2s-6-2.8-6-7.2V6Z"
        fill="url(#topbar-trophy-gold)"
        stroke="url(#topbar-trophy-blue)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 8H6.8c-.7 0-1.2.5-1.2 1.2 0 3.8 2.1 6.2 5.1 6.7M22 8h3.2c.7 0 1.2.5 1.2 1.2 0 3.8-2.1 6.2-5.1 6.7"
        fill="none"
        stroke="url(#topbar-trophy-blue)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 18.5v4.2M11.5 26h9M13 22.7h6" fill="none" stroke="#1d5fb8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
