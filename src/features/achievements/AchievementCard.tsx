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
      className={`achievement-card ${unlocked ? 'achievement-card--unlocked' : 'achievement-card--locked'}`}
      aria-disabled={!unlocked}
      aria-label={unlocked ? `查看 ${achievement.title}` : `${achievement.title} 尚未解鎖`}
    >
      <span className="achievement-card__pin" aria-hidden="true" />
      <span className="achievement-card__tape achievement-card__tape--left" aria-hidden="true" />
      <span className="achievement-card__tape achievement-card__tape--right" aria-hidden="true" />
      <div className="achievement-card__image">
        <CgImage achievement={achievement} unlocked={unlocked} rounded={8} />
      </div>
      <div className="achievement-card__body">
        <div className="achievement-card__title">
          <span className="achievement-card__status">{unlocked ? '🏆' : '🔒'}</span>
          <span>{unlocked ? achievement.title : '未解鎖'}</span>
        </div>
        <div className="achievement-card__text">
          {unlocked ? achievement.storyBlurb : achievement.hint}
        </div>
      </div>
    </button>
  );
}
