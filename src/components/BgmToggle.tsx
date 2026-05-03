import { useBgmStore } from '@/store/bgmStore';
import { HangingClipButton } from '@/features/hud/HangingClipButton';

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

export function BgmToggle() {
  const muted = useBgmStore((s) => s.muted);
  const toggleMute = useBgmStore((s) => s.toggleMute);

  return (
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
  );
}
