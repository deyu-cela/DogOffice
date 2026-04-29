import type { Achievement } from './achievementConfigs';
import { CgImage } from './CgPlaceholder';

type Props = {
  achievement: Achievement;
  unlocked: boolean;
  onClick: () => void;
};

export function AchievementCard({ achievement, unlocked, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: unlocked ? '#ffffff' : '#eef2f7',
        border: unlocked ? '2px solid #4fb7ff' : '2px solid #c8d2dc',
        borderRadius: 14,
        padding: 12,
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: unlocked
          ? '0 8px 22px rgba(79,183,255,0.18)'
          : '0 4px 12px rgba(60,80,110,0.08)',
        transition: 'transform 120ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ aspectRatio: '4 / 3', width: '100%' }}>
        <CgImage achievement={achievement} unlocked={unlocked} rounded={10} />
      </div>
      <div>
        <div
          style={{
            fontWeight: 900,
            fontSize: 16,
            color: unlocked ? '#173b78' : '#6f83a5',
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{unlocked ? '🏆' : '🔒'}</span>
          <span>{unlocked ? achievement.title : '未解鎖'}</span>
        </div>
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: unlocked ? '#4f6890' : '#8898ad',
            minHeight: 36,
          }}
        >
          {unlocked ? achievement.storyBlurb : achievement.hint}
        </div>
      </div>
    </button>
  );
}
