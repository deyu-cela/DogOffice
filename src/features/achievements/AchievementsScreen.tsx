import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { ACHIEVEMENTS } from './achievementConfigs';
import { AchievementCard } from './AchievementCard';
import { AchievementCgViewer } from './AchievementCgViewer';

export function AchievementsScreen() {
  const closeAchievements = useUiStore((s) => s.closeAchievements);
  const unlockedIds = useGameStore((s) => s.unlockedAchievementIds);
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, []);

  const unlockedSet = new Set(unlockedIds);
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).length;
  const total = ACHIEVEMENTS.length;
  const percent = Math.round((unlockedCount / total) * 100);

  const viewing = viewingId ? ACHIEVEMENTS.find((a) => a.id === viewingId) ?? null : null;

  return (
    <div className="achievements-page">
      <div className="achievements-page__shell">
        <header className="achievements-hero">
          <div className="achievements-hero__copy">
            <span className="achievements-hero__pin" aria-hidden="true" />
            <div className="achievements-hero__eyebrow">達成成長</div>
            <h1 className="achievements-hero__title">成就 CG 收藏</h1>
            <p className="achievements-hero__subtitle">
              經營狗狗公司路上的高光時刻，每一張 CG 都是一段故事。
            </p>
          </div>
          <button
            type="button"
            onClick={closeAchievements}
            className="achievements-hero__close"
          >
            返回
          </button>
        </header>

        <section className="achievements-progress" aria-label="成就進度">
          <span className="achievements-progress__pin" aria-hidden="true" />
          <div className="achievements-progress__label">
            <span className="achievements-progress__icon">🏆</span>
            <span>收藏進度</span>
            <strong>
              {unlockedCount} / {total}
            </strong>
          </div>
          <div className="achievements-progress__track">
            <div
              className="achievements-progress__fill"
              style={{ width: `${percent}%` }}
            />
          </div>
          <strong className="achievements-progress__percent">{percent}%</strong>
        </section>

        <div className="achievements-grid">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedSet.has(a.id);
            return (
              <AchievementCard
                key={a.id}
                achievement={a}
                unlocked={unlocked}
                onClick={() => {
                  if (unlocked) setViewingId(a.id);
                }}
              />
            );
          })}
        </div>
      </div>

      {viewing && (
        <AchievementCgViewer achievement={viewing} onClose={() => setViewingId(null)} />
      )}
    </div>
  );
}
