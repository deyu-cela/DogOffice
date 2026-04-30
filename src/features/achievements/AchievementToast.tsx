import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ACHIEVEMENT_BY_ID } from './achievementConfigs';
import { CgImage } from './CgPlaceholder';

const ENTER_MS = 320;
const HOLD_MS = 4200;
const EXIT_MS = 320;

type Phase = 'enter' | 'hold' | 'exit';

export function AchievementToast() {
  const pending = useGameStore((s) => s.pendingAchievementToasts);
  const dismiss = useGameStore((s) => s.dismissAchievementToast);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('enter');

  // 從 queue 拉下一個
  useEffect(() => {
    if (activeId) return;
    const next = pending[0];
    if (!next) return;
    setActiveId(next);
    setPhase('enter');
  }, [pending, activeId]);

  // 動畫狀態機：enter → hold → exit → dismiss
  useEffect(() => {
    if (!activeId) return;
    if (phase === 'enter') {
      const t = setTimeout(() => setPhase('hold'), ENTER_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'hold') {
      const t = setTimeout(() => setPhase('exit'), HOLD_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'exit') {
      const t = setTimeout(() => {
        const id = activeId;
        setActiveId(null);
        dismiss(id);
      }, EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [activeId, phase, dismiss]);

  if (!activeId) return null;
  const ach = ACHIEVEMENT_BY_ID[activeId];
  if (!ach) {
    // 防呆：unknown id 直接清掉
    dismiss(activeId);
    return null;
  }

  const slideIn = phase === 'enter' || phase === 'hold';

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 950,
        pointerEvents: 'auto',
        transform: slideIn ? 'translateX(0)' : 'translateX(120%)',
        opacity: slideIn ? 1 : 0,
        transition: `transform ${slideIn ? ENTER_MS : EXIT_MS}ms ease, opacity ${slideIn ? ENTER_MS : EXIT_MS}ms ease`,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 12,
          background: 'linear-gradient(180deg, #1e2a3d, #0e1828)',
          color: 'white',
          padding: 12,
          borderRadius: 12,
          boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(120,160,255,0.2)',
          width: 340,
          maxWidth: '90vw',
          border: '1px solid rgba(120,160,255,0.25)',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
            background: '#000',
          }}
        >
          <CgImage achievement={ach} unlocked rounded={8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1.2,
              color: '#7fb6ff',
              textTransform: 'uppercase',
            }}
          >
            🏆 成就解鎖
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              marginTop: 3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {ach.title}
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#a9bbd5',
              marginTop: 4,
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {ach.storyBlurb}
          </div>
        </div>
      </div>
    </div>
  );
}
