import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/Panel';
import { SaveIndicator } from './SaveIndicator';
import { UserBadge } from './UserBadge';
import { RestartButton } from './RestartButton';
import { LeaderboardPanel } from '@/features/leaderboard/LeaderboardPanel';

const IPO_REPUTATION = 80;
const IPO_MONEY = 50000;
const IPO_OFFICE_LEVEL = 3;
const IPO_PROJECTS = 30;

export function TopBar() {
  const day = useGameStore((s) => s.day);
  const money = useGameStore((s) => s.money);
  const reputation = useGameStore((s) => s.reputation);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);
  const ipoAchievedAt = useGameStore((s) => s.ipoAchievedAt);
  const authedUser = useAuthStore((s) => s.user);
  const [lbOpen, setLbOpen] = useState(false);

  const repProgress = Math.min(100, (reputation / IPO_REPUTATION) * 100);
  const moneyProgress = Math.min(100, (money / IPO_MONEY) * 100);
  const officeProgress = Math.min(100, (officeLevel / IPO_OFFICE_LEVEL) * 100);
  const projectProgress = Math.min(100, (projectsCompleted / IPO_PROJECTS) * 100);

  return (
    <>
      <div
        className="flex items-center justify-between gap-3 rounded-2xl p-3 md:p-4"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,248,241,0.88))',
          border: '2px solid rgba(90,70,54,0.12)',
          boxShadow: '0 10px 30px rgba(90,70,54,0.08)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-wrap flex-1">
          <h1 className="text-lg md:text-xl font-extrabold whitespace-nowrap">🐶 狗狗公司</h1>
          <Badge>第 {day} 天</Badge>
          {/* IPO 4 條件 mini progress */}
          <button
            type="button"
            onClick={() => setLbOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl cursor-pointer hover:opacity-90"
            style={{
              background: ipoAchievedAt !== null
                ? 'linear-gradient(90deg, #fff0f3, #fbd5db)'
                : 'rgba(255,255,255,0.7)',
              border: ipoAchievedAt !== null ? '1.5px solid #e0c280' : '1px solid rgba(90,70,54,0.12)',
              minWidth: 280,
            }}
            title="IPO 上市條件（點擊查看排行榜）"
          >
            <span className="text-xs font-bold whitespace-nowrap" style={{ color: '#7a685a' }}>
              {ipoAchievedAt !== null ? '🏆 IPO' : '🎯 IPO'}
            </span>
            <div className="flex-1 grid grid-cols-4 gap-1.5">
              <ProgressMini label="信譽" current={Math.round(reputation)} target={IPO_REPUTATION} progress={repProgress} color="#66bb6a" />
              <ProgressMini label="資金" current={`$${money}`} target={`$${IPO_MONEY / 1000}k`} progress={moneyProgress} color="#f6c24b" />
              <ProgressMini label="Lv" current={officeLevel} target={IPO_OFFICE_LEVEL} progress={officeProgress} color="#a36a3a" />
              <ProgressMini label="案數" current={projectsCompleted} target={IPO_PROJECTS} progress={projectProgress} color="#7b3a9f" />
            </div>
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => setLbOpen(true)}
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1"
            style={{
              background: 'linear-gradient(180deg, #fff0f3, #fbd5db)',
              border: '1.5px solid #e0c280',
              color: '#8a6a2a',
              boxShadow: '0 2px 6px rgba(224, 194, 128, 0.3)',
            }}
            title="查看排行榜"
          >
            🏆 <span className="hidden sm:inline">排行榜</span>
          </button>
          {authedUser && (
            <>
              <SaveIndicator />
              <UserBadge />
              <RestartButton />
            </>
          )}
        </div>
      </div>
      {lbOpen && <LeaderboardPanel onClose={() => setLbOpen(false)} />}
    </>
  );
}

function ProgressMini({
  label,
  current,
  target,
  progress,
  color,
}: {
  label: string;
  current: number | string;
  target: number | string;
  progress: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between gap-0.5 text-[9px] leading-tight" style={{ color: '#7a685a' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: '#3d2f25' }}>
          {current}/{target}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#eadfce' }}>
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}
