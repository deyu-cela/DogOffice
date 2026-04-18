import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/Panel';
import { SaveIndicator } from './SaveIndicator';
import { UserBadge } from './UserBadge';
import { RestartButton } from './RestartButton';

export function TopBar() {
  const day = useGameStore((s) => s.day);
  const authedUser = useAuthStore((s) => s.user);

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl p-3 md:p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,248,241,0.88))',
        border: '2px solid rgba(90,70,54,0.12)',
        boxShadow: '0 10px 30px rgba(90,70,54,0.08)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-wrap">
        <h1 className="text-lg md:text-xl font-extrabold whitespace-nowrap">🐶 狗狗公司</h1>
        <Badge>第 {day} 天</Badge>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {authedUser && (
          <>
            <SaveIndicator />
            <UserBadge />
            <RestartButton />
          </>
        )}
      </div>
    </div>
  );
}
