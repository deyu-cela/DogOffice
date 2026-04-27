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
  const cycleSpeed = () => setSpeed(speedMultiplier >= 3 ? 1 : speedMultiplier + 1);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>
            下一天 {remainingSec}s
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleSpeed}
            className="grid place-items-center rounded-lg"
            style={{
              height: 29,
              width: 29,
              padding: 0,
              background: 'linear-gradient(180deg, #4f95ef, #246bd0)',
              border: '1px solid rgba(36,107,208,0.22)',
              boxShadow: '0 6px 14px rgba(47,125,225,0.22)',
            }}
            title="切換倍速"
          >
            <span
              style={{
                width: 0,
                height: 0,
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderLeft: '8px solid white',
                marginLeft: 2,
              }}
            />
          </button>

          <div
            className="flex items-center gap-1.5 rounded-lg"
            style={{
              height: 29,
              padding: '0 10px',
              background: 'linear-gradient(180deg, #ffffff, #f4f9ff)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <span className="font-extrabold" style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1 }}>
              {speedMultiplier}x
            </span>
            <span className="font-bold" style={{ color: 'var(--muted)', fontSize: 11, lineHeight: 1 }}>
              倍速
            </span>
          </div>
        </div>
      </div>

      {hasCurrent && (
        <div>
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-extrabold"
            style={{
              background: '#fff2ec',
              color: '#ef5b5b',
              border: '1px solid rgba(239,91,91,0.18)',
            }}
          >
            候選人耐心 {candidatePatience} 天
          </span>
        </div>
      )}

      <div className="h-2 overflow-hidden rounded-full" style={{ background: '#dceafe' }}>
        <div
          className="h-full rounded-full transition-[width] duration-150"
          style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #2f7de1, #20c7b3)',
          }}
        />
      </div>
    </section>
  );
}
