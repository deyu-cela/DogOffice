import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useWalkerStore } from '@/store/walkerStore';

// walker / 日常 tick 限速：15fps（66ms）就足夠看起來順暢，CPU/GPU 負擔降約 4 倍。
// 小遊戲（飛盤、翻牌）開啟時保持 60fps 才會手感好。
const SLOW_TICK_MS = 66;

export function useGameLoop() {
  const tick = useGameStore((s) => s.tick);
  const frisbeeTick = useGameStore((s) => s.frisbeeTick);
  const memoryTick = useGameStore((s) => s.memoryTick);
  const walkerTick = useWalkerStore((s) => s.tick);
  const lastRef = useRef(performance.now());
  const slowAccum = useRef(0);

  useEffect(() => {
    let raf = 0;
    const step = (now: number) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      const s = useGameStore.getState();

      // 小遊戲走 60fps（操作要靈敏）
      if (s.miniGame?.type === 'frisbee' && s.miniGame.running) frisbeeTick(dt / 1000);
      if (s.miniGame?.type === 'memory' && s.miniGame.running) memoryTick(dt / 1000);

      // 主場景的 walker / 日結算 tick：用累積方式 → 每 SLOW_TICK_MS 跑一次
      // page 隱藏時不跑（document.hidden 期間累積也歸零）
      if (typeof document !== 'undefined' && document.hidden) {
        slowAccum.current = 0;
      } else {
        slowAccum.current += dt;
        if (slowAccum.current >= SLOW_TICK_MS) {
          const stepDt = slowAccum.current;
          slowAccum.current = 0;
          const avgMorale = s.staff.length > 0
            ? s.staff.reduce((n, d) => n + d.morale, 0) / s.staff.length
            : 70;
          walkerTick(avgMorale, s.reputation);
          tick(stepDt);
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [tick, frisbeeTick, memoryTick, walkerTick]);
}
