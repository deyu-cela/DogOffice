import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export function GameLog() {
  const log = useGameStore((s) => s.log);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [log.length]);

  return (
    <div
      ref={ref}
      className="max-h-48 overflow-y-auto text-xs leading-relaxed p-2.5 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.6)',
        border: '1px solid rgba(90,70,54,0.08)',
        color: 'var(--muted)',
      }}
    >
      {log.map((e, i) => (
        <div key={i} className="py-0.5">
          Day {e.day} · {e.msg}
        </div>
      ))}
    </div>
  );
}
