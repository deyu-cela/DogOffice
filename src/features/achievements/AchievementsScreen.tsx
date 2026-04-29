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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background:
          'linear-gradient(180deg, rgba(243,250,255,0.96), rgba(225,240,255,0.96))',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '32px 28px 60px',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: '#173b78',
                letterSpacing: 0.4,
              }}
            >
              🏆 成就 CG 收藏
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: '#5a6f95',
                fontWeight: 700,
              }}
            >
              經營狗狗公司路上的高光時刻，每一張 CG 都是一段故事。
            </div>
          </div>
          <button
            type="button"
            onClick={closeAchievements}
            style={{
              background: '#ffffff',
              border: '1px solid #c8d2dc',
              borderRadius: 10,
              padding: '10px 22px',
              fontWeight: 900,
              color: '#3a4a66',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            返回
          </button>
        </header>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 24,
            border: '1px solid #d9e3f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            boxShadow: '0 8px 22px rgba(46,104,180,0.08)',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: '#173b78',
            }}
          >
            進度 {unlockedCount} / {total}
          </div>
          <div
            style={{
              flex: 1,
              maxWidth: 480,
              height: 12,
              borderRadius: 999,
              background: '#eef2f7',
              overflow: 'hidden',
              border: '1px solid #d9e3f0',
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #57a8ff, #257ee8)',
                transition: 'width 320ms ease',
              }}
            />
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: '#5a6f95',
              minWidth: 40,
              textAlign: 'right',
            }}
          >
            {percent}%
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 18,
          }}
        >
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
