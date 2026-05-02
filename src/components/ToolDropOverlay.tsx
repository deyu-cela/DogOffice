import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { SvgIcon } from '@/components/SvgIcon';
import { TOOL_TRAIT_DEFS } from '@/constants/tools';
import type { Tool, ToolGrade } from '@/types';

type Drop = { id: string; projectId: string; tool: Tool };

const GRADE_GLOW: Record<ToolGrade, string> = {
  S: '0 0 24px 6px rgba(247,189,34,0.85)',
  A: '0 0 18px 4px rgba(176,102,232,0.7)',
  B: '0 0 12px 2px rgba(110,160,232,0.55)',
};

const GRADE_BG: Record<ToolGrade, string> = {
  S: 'linear-gradient(180deg, #ffd95a, #f0a818)',
  A: 'linear-gradient(180deg, #c9a4f0, #8a4ce0)',
  B: 'linear-gradient(180deg, #c8d8e8, #6a8aa8)',
};
const GRADE_TEXT: Record<ToolGrade, string> = {
  S: '#5a3d05',
  A: '#fff',
  B: '#fff',
};

export function ToolDropOverlay() {
  const drops = useGameStore((s) => s.pendingToolDrops);
  const consume = useGameStore((s) => s.consumeToolDrop);

  return (
    <>
      {drops.map((d) => (
        <ToolFlight key={d.id} drop={d} onDone={() => consume(d.id)} />
      ))}
      <ToolFlightStyles />
    </>
  );
}

function ToolFlight({ drop, onDone }: { drop: Drop; onDone: () => void }) {
  const [coords, setCoords] = useState<{
    sx: number;
    sy: number;
    tx: number;
    ty: number;
  } | null>(null);

  useEffect(() => {
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const srcEl = document.querySelector(
      `[data-project-id="${drop.projectId}"]`,
    ) as HTMLElement | null;
    let sx = center.x;
    let sy = center.y;
    if (srcEl) {
      const r = srcEl.getBoundingClientRect();
      sx = r.left + r.width / 2;
      sy = r.top + r.height / 2;
    }
    const tgtEl = document.querySelector('[data-tool-target="1"]') as HTMLElement | null;
    let tx = window.innerWidth - 80;
    let ty = window.innerHeight - 80;
    if (tgtEl) {
      const r = tgtEl.getBoundingClientRect();
      tx = r.left + r.width / 2;
      ty = r.top + r.height / 2;
    }
    setCoords({ sx, sy, tx, ty });
  }, [drop.projectId]);

  if (!coords) return null;

  const { sx, sy, tx, ty } = coords;
  const dx = tx - sx;
  const dy = ty - sy;

  const tool = drop.tool;
  const traitTexts = tool.traits.map((tid) => {
    const def = TOOL_TRAIT_DEFS[tid];
    return def ? `${def.emoji}${def.name}` : '';
  });

  return (
    <>
      <div
        className="tool-fly"
        style={{
          left: sx,
          top: sy,
          ['--target-x' as never]: `${dx}px`,
          ['--target-y' as never]: `${dy}px`,
          ['--glow' as never]: GRADE_GLOW[tool.grade],
        }}
        onAnimationEnd={(e) => {
          if ((e as React.AnimationEvent).animationName === 'toolFly') onDone();
        }}
      >
        <div className="tool-fly-icon">
          <SvgIcon name={tool.iconName} size={42} />
        </div>
      </div>
      <div
        className="tool-reward-label"
        style={{ left: sx, top: sy }}
      >
        <span
          className="tool-reward-grade"
          style={{ background: GRADE_BG[tool.grade], color: GRADE_TEXT[tool.grade] }}
        >
          {tool.grade}
        </span>
        <span className="tool-reward-name">{tool.name}</span>
        {traitTexts.length > 0 && (
          <span className="tool-reward-trait">{traitTexts.join(' ')}</span>
        )}
      </div>
    </>
  );
}

function ToolFlightStyles() {
  return (
    <style>{`
      @keyframes toolFly {
        0% {
          transform: translate(-50%, -50%) scale(0.2) rotate(-30deg);
          opacity: 0;
        }
        15% {
          transform: translate(-50%, -120%) scale(1.25) rotate(8deg);
          opacity: 1;
        }
        30% {
          transform: translate(calc(-50% + var(--target-x) * 0.18), calc(-50% + var(--target-y) * 0.18 - 60px)) scale(1.15) rotate(-4deg);
          opacity: 1;
        }
        70% {
          transform: translate(calc(-50% + var(--target-x) * 0.7), calc(-50% + var(--target-y) * 0.7 - 30px)) scale(0.95) rotate(180deg);
          opacity: 1;
        }
        100% {
          transform: translate(calc(-50% + var(--target-x)), calc(-50% + var(--target-y))) scale(0.45) rotate(360deg);
          opacity: 0;
        }
      }
      .tool-fly {
        position: fixed;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background:
          radial-gradient(circle at 35% 28%, rgba(255,255,255,0.96) 0 22%, transparent 24%),
          linear-gradient(180deg, #ffd0db, #ffa0b8);
        border: 1.5px solid rgba(255,255,255,0.72);
        box-shadow:
          var(--glow),
          0 6px 14px rgba(214,60,100,0.26),
          inset 0 -2px 0 rgba(180,80,100,0.14),
          inset 0 1px 0 rgba(255,255,255,0.72);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: toolFly 1500ms cubic-bezier(0.42, -0.05, 0.45, 1) 200ms forwards;
        pointer-events: none;
        z-index: 9998;
        will-change: transform, opacity;
        opacity: 0;
      }
      .tool-fly-icon {
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      }
      @keyframes toolRewardFloat {
        0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
        18% { transform: translate(-50%, -160%) scale(1.05); opacity: 1; }
        78% { transform: translate(-50%, -210%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -260%) scale(0.95); opacity: 0; }
      }
      .tool-reward-label {
        position: fixed;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        background:
          radial-gradient(rgba(228,160,170,0.08) 0.5px, transparent 1px) 0 0 / 4px 4px,
          linear-gradient(180deg, #fffdfb 0%, #fff5f5 100%);
        color: #5b382d;
        border: 1.5px dashed rgba(214,145,150,0.48);
        font-weight: 900;
        font-size: 13px;
        white-space: nowrap;
        animation: toolRewardFloat 1700ms cubic-bezier(0.2, 0.6, 0.3, 1) forwards;
        pointer-events: none;
        z-index: 9999;
        box-shadow:
          0 10px 20px rgba(166,91,85,0.18),
          inset 0 1px 0 rgba(255,255,255,0.68);
      }
      .tool-reward-grade {
        font-size: 11px;
        font-weight: 900;
        padding: 1px 6px;
        border-radius: 6px;
      }
      .tool-reward-name {
        font-size: 13px;
      }
      .tool-reward-trait {
        font-size: 11px;
        color: #d8456c;
      }
      @keyframes toolTargetPop {
        0% { transform: scale(1); }
        40% { transform: scale(1.25); }
        100% { transform: scale(1); }
      }
    `}</style>
  );
}
