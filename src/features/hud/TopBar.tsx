import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/Panel';
import { SaveIndicator } from './SaveIndicator';
import { UserBadge } from './UserBadge';
import { RestartButton } from './RestartButton';
import { LeaderboardPanel } from '@/features/leaderboard/LeaderboardPanel';

export function TopBar() {
  const day = useGameStore((s) => s.day);
  const money = useGameStore((s) => s.money);
  const moneyGoal = useGameStore((s) => s.moneyGoal);
  const victoryAt = useGameStore((s) => s.victoryAt);
  const authedUser = useAuthStore((s) => s.user);
  const [lbOpen, setLbOpen] = useState(false);

  const progress = Math.min(100, (money / moneyGoal) * 100);

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
        {/* 資金目標進度條 */}
        <button
          type="button"
          onClick={() => setLbOpen(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer hover:opacity-90"
          style={{
            background: victoryAt !== null
              ? 'linear-gradient(90deg, #fff4dc, #ffe8bf)'
              : 'rgba(255,255,255,0.7)',
            border: victoryAt !== null ? '1.5px solid #e0c280' : '1px solid rgba(90,70,54,0.12)',
            minWidth: 180,
          }}
          title="點擊查看排行榜"
        >
          <span className="text-xs font-bold whitespace-nowrap" style={{ color: '#7a685a' }}>
            {victoryAt !== null ? '🏆' : '🎯'} 目標
          </span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#eadfce' }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: victoryAt !== null
                  ? 'linear-gradient(90deg, #f6c24b, #c9a064)'
                  : 'linear-gradient(90deg, #a8d8a8, #66bb6a)',
              }}
            />
          </div>
          <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: '#3d2f25' }}>
            ${money.toLocaleString()} / ${(moneyGoal / 1000).toFixed(0)}k
          </span>
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <button
          type="button"
          onClick={() => setLbOpen(true)}
          className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1"
          style={{
            background: 'linear-gradient(180deg, #fff7dd, #ffe8bf)',
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
