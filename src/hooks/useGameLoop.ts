import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useWalkerStore } from '@/store/walkerStore';

export function useGameLoop() {
  const tick = useGameStore((s) => s.tick);
  const frisbeeTick = useGameStore((s) => s.frisbeeTick);
  const memoryTick = useGameStore((s) => s.memoryTick);
  const walkerTick = useWalkerStore((s) => s.tick);
  const lastRef = useRef(performance.now());

  useEffect(() => {
    let raf = 0;
    const step = (now: number) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      const s = useGameStore.getState();
      walkerTick(s.morale, s.health);
      tick(dt);
      if (s.miniGame?.type === 'frisbee' && s.miniGame.running) frisbeeTick(dt / 1000);
      if (s.miniGame?.type === 'memory' && s.miniGame.running) memoryTick(dt / 1000);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [tick, frisbeeTick, memoryTick, walkerTick]);
}
