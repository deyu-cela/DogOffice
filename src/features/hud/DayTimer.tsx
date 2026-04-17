import { useGameStore } from '@/store/gameStore';
import { BASE_DAY_MS } from '@/constants/officeLevels';

export function DayTimer() {
  const dayElapsed = useGameStore((s) => s.dayElapsed);
  const speedMultiplier = useGameStore((s) => s.speedMultiplier);
  const candidatePatience = useGameStore((s) => s.candidatePatience);
  const hasCurrent = useGameStore((s) => !!s.current);
  const setSpeed = useGameStore((s) => s.setSpeed);

  const progress = Math.min(dayElapsed / BASE_DAY_MS, 1);
  const remainingMs = Math.max(0, BASE_DAY_MS - dayElapsed) / speedMultiplier;
  const remainingSec = (remainingMs / 1000).toFixed(1);

  const patienceCls = !hasCurrent
    ? ''
    : candidatePatience <= 1
      ? 'bg-red-100 text-red-700 animate-pulse'
      : candidatePatience <= 2
        ? 'bg-orange-100 text-orange-700'
        : 'bg-green-100 text-green-700';

  return (
    <div className="mt-3">
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#eadfce' }}>
        <div
          className="h-full transition-[width] duration-150"
          style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #a8d8a8, #66bb6a)' }}
        />
      </div>
      <div className="flex justify-between items-center mt-1.5 text-xs" style={{ color: 'var(--muted)' }}>
        <span>下一天 {remainingSec}s</span>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-3 py-1 text-xs rounded-lg font-bold`}
              style={{
                background: speedMultiplier === s ? '#ffb347' : '#fff',
                color: speedMultiplier === s ? 'white' : 'var(--text)',
                boxShadow: 'none',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
      {hasCurrent && (
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1.5 ${patienceCls}`}>
          候選人耐心 {candidatePatience} 天
        </span>
      )}
    </div>
  );
}
