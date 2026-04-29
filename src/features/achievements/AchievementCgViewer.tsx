import type { Achievement } from './achievementConfigs';
import { CgImage } from './CgPlaceholder';

type Props = {
  achievement: Achievement;
  onClose: () => void;
};

export function AchievementCgViewer({ achievement, onClose }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(8, 32, 77, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 18,
          maxWidth: 980,
          width: '100%',
          maxHeight: '92vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            background: '#08204d',
            color: 'white',
            padding: '14px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🏆</span>
            <span style={{ fontWeight: 900, fontSize: 18 }}>{achievement.title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.18)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            關閉
          </button>
        </div>
        <div
          style={{
            background: '#000',
            aspectRatio: '4 / 3',
            width: '100%',
            maxHeight: '64vh',
          }}
        >
          <CgImage achievement={achievement} unlocked rounded={0} />
        </div>
        <div style={{ padding: '18px 24px 22px' }}>
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: '#3a4a66',
              fontWeight: 600,
            }}
          >
            {achievement.storyBlurb}
          </div>
        </div>
      </div>
    </div>
  );
}
