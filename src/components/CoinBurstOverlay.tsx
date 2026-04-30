import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { projectCardRectCache } from '@/lib/cardRectCache';

type Burst = { id: string; projectId: string; reward: number };

export function CoinBurstOverlay() {
  const bursts = useGameStore((s) => s.pendingCoinBursts);
  const consume = useGameStore((s) => s.consumeCoinBurst);

  return (
    <>
      {bursts.map((b) => (
        <CoinFlight key={b.id} burst={b} onDone={() => consume(b.id)} />
      ))}
      <CoinFlightStyles />
    </>
  );
}

function CoinFlight({ burst, onDone }: { burst: Burst; onDone: () => void }) {
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = document.querySelector('[data-money-target]') as HTMLElement | null;
    if (el) {
      const r = el.getBoundingClientRect();
      setTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    } else {
      setTarget({ x: window.innerWidth - 60, y: 80 });
    }
  }, []);

  // 沒有快取 rect（極少見：初次載入、card 還沒 mount 就完成）→ 直接 dismiss
  const sourceRect = projectCardRectCache.get(burst.projectId);
  useEffect(() => {
    if (!sourceRect) {
      const t = setTimeout(onDone, 50);
      return () => clearTimeout(t);
    }
  }, [sourceRect, onDone]);

  if (!sourceRect || !target) return null;

  const sx = sourceRect.left + sourceRect.width / 2;
  const sy = sourceRect.top + sourceRect.height / 2;
  const dx = target.x - sx;
  const dy = target.y - sy;

  const NUM_COINS = 12;
  const coins = Array.from({ length: NUM_COINS }, (_, i) => i);

  return (
    <>
      {coins.map((i) => {
        const delay = i * 38;
        const angle = (i / NUM_COINS) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 36 + Math.random() * 24;
        const burstX = Math.cos(angle) * dist;
        const burstY = Math.sin(angle) * dist - 18; // 略往上偏
        const scale = 0.8 + Math.random() * 0.6;
        return (
          <div
            key={i}
            className="coin-fly"
            style={{
              left: sx,
              top: sy,
              animationDelay: `${delay}ms`,
              ['--burst-x' as never]: `${burstX}px`,
              ['--burst-y' as never]: `${burstY}px`,
              ['--target-x' as never]: `${dx}px`,
              ['--target-y' as never]: `${dy}px`,
              ['--coin-scale' as never]: scale.toFixed(2),
            }}
            onAnimationEnd={i === NUM_COINS - 1 ? onDone : undefined}
          >
            <span className="coin-fly-text">$</span>
          </div>
        );
      })}
      <div
        className="coin-reward-label"
        style={{ left: sx, top: sy }}
      >
        +${burst.reward.toLocaleString()}
      </div>
    </>
  );
}

function CoinFlightStyles() {
  return (
    <style>{`
      @keyframes coinFly {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
        }
        12% {
          transform: translate(calc(-50% + var(--burst-x) * 0.5), calc(-50% + var(--burst-y) * 0.5)) scale(calc(var(--coin-scale) * 1.1));
          opacity: 1;
        }
        28% {
          transform: translate(calc(-50% + var(--burst-x)), calc(-50% + var(--burst-y))) scale(var(--coin-scale));
          opacity: 1;
        }
        92% {
          opacity: 1;
        }
        100% {
          transform: translate(calc(-50% + var(--target-x)), calc(-50% + var(--target-y))) scale(calc(var(--coin-scale) * 0.55));
          opacity: 0;
        }
      }
      .coin-fly {
        position: fixed;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 28%, #fff3a8 0%, #ffd35a 35%, #f0a818 65%, #b86d0d 100%);
        box-shadow: 0 0 10px rgba(255,196,68,0.85), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 3px rgba(120,60,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: coinFly 1200ms cubic-bezier(0.42, -0.18, 0.45, 1) forwards;
        pointer-events: none;
        z-index: 9998;
        will-change: transform, opacity;
      }
      .coin-fly-text {
        color: #6a3d05;
        font-weight: 900;
        font-size: 13px;
        line-height: 1;
        text-shadow: 0 1px 0 rgba(255,255,255,0.4);
      }
      @keyframes coinRewardFloat {
        0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
        18% { transform: translate(-50%, -120%) scale(1.05); opacity: 1; }
        70% { transform: translate(-50%, -180%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -260%) scale(0.95); opacity: 0; }
      }
      .coin-reward-label {
        position: fixed;
        font-weight: 900;
        font-size: 22px;
        color: #d68a0a;
        text-shadow: 0 2px 0 rgba(255,255,255,0.85), 0 4px 14px rgba(214,138,10,0.55);
        animation: coinRewardFloat 1300ms cubic-bezier(0.2, 0.6, 0.3, 1) forwards;
        pointer-events: none;
        z-index: 9999;
        white-space: nowrap;
      }
    `}</style>
  );
}
