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
      className="achievement-viewer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="achievement-viewer__panel"
      >
        <div className="achievement-viewer__header">
          <span className="achievement-viewer__pin" aria-hidden="true" />
          <div className="achievement-viewer__title">
            <span>🏆</span>
            <strong>{achievement.title}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="achievement-viewer__close"
          >
            關閉
          </button>
        </div>
        <div className="achievement-viewer__image">
          <CgImage achievement={achievement} unlocked rounded={10} />
        </div>
        <div className="achievement-viewer__story">
          {achievement.storyBlurb}
        </div>
      </div>
    </div>
  );
}
