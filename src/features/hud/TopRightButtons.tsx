import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { useBgmStore } from '@/store/bgmStore';
import { SaveIndicator } from './SaveIndicator';
import { RestartButton } from './RestartButton';
import { LeaderboardPanel } from '@/features/leaderboard/LeaderboardPanel';
import { HangingClipButton } from './HangingClipButton';
import './topRightToolbar.css';

const TROPHY_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 4h8v4a4 4 0 0 1-8 0V4z" />
    <path d="M5 5H3v2a3 3 0 0 0 3 3" />
    <path d="M19 5h2v2a3 3 0 0 1-3 3" />
    <path d="M10 14h4v3l-1 3h-2l-1-3z" />
  </svg>
);

const GALLERY_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="M3 17l5-5 4 4 3-3 6 6" />
  </svg>
);

const WAND_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 4l6 6-11 11H3v-6z" />
    <path d="M13 5l6 6" />
  </svg>
);

const MUSIC_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 18V5l11-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="16" r="3" />
  </svg>
);

const MUTE_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 18V5l11-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="17" cy="16" r="3" />
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2.4" />
  </svg>
);

export function TopRightButtons() {
  const authedUser = useAuthStore((s) => s.user);
  const openSkinModal = useUiStore((s) => s.openSkinModal);
  const openAchievements = useUiStore((s) => s.openAchievements);
  const muted = useBgmStore((s) => s.muted);
  const toggleMute = useBgmStore((s) => s.toggleMute);
  const [lbOpen, setLbOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none absolute top-3 right-3 z-[700]">
        <div className="toprt-clothesline">
          <span className="toprt-knot toprt-knot--left" aria-hidden="true" />
          <span className="toprt-knot toprt-knot--right" aria-hidden="true" />
          <svg
            className="toprt-rope"
            viewBox="0 0 360 30"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M2 6 Q 90 22, 180 18 T 358 10"
              stroke="var(--toprt-rope)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M2 6 Q 90 22, 180 18 T 358 10"
              stroke="var(--toprt-rope-highlight)"
              strokeWidth="0.6"
              fill="none"
              strokeLinecap="round"
              opacity="0.6"
              transform="translate(0, -1)"
            />
          </svg>

          <div className="toprt-row">
            <HangingClipButton
              bgColor="#ffd97a"
              iconColor="#a37434"
              clipColor="#e8a868"
              tilt={-4}
              hangY={2}
              icon={TROPHY_ICON}
              label="排行榜"
              onClick={() => setLbOpen(true)}
              dataTutorial="leaderboard-button"
            />

            <HangingClipButton
              bgColor="#ffd0dc"
              iconColor="#c44a6a"
              clipColor="#d896a8"
              tilt={3}
              hangY={5}
              icon={GALLERY_ICON}
              label="成就 CG 收藏"
              onClick={openAchievements}
              dataTutorial="achievement-button"
            />

            <HangingClipButton
              bgColor="#e8d6f5"
              iconColor="#7a4ab0"
              clipColor="#b89ad0"
              tilt={-3}
              hangY={7}
              icon={WAND_ICON}
              label="更換辦公室造型"
              onClick={openSkinModal}
            />

            <HangingClipButton
              bgColor="#c8e6f5"
              iconColor={muted ? '#9aacc5' : '#3d7aa0'}
              clipColor="#90b6d0"
              tilt={4}
              hangY={6}
              icon={muted ? MUTE_ICON : MUSIC_ICON}
              label={muted ? '開啟音樂' : '關閉音樂'}
              onClick={toggleMute}
            />

            {authedUser && (
              <>
                <SaveIndicator />
                <RestartButton />
              </>
            )}
          </div>
        </div>
      </div>

      {lbOpen && <LeaderboardPanel onClose={() => setLbOpen(false)} />}
    </>
  );
}
