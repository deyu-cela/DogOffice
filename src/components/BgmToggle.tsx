import { useBgmStore } from '@/store/bgmStore';

export function BgmToggle() {
  const muted = useBgmStore((s) => s.muted);
  const toggleMute = useBgmStore((s) => s.toggleMute);

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? '開啟音樂' : '關閉音樂'}
      title={muted ? '開啟音樂' : '關閉音樂'}
      className="bx-chip bx-shine bx-fade-up grid place-items-center rounded-xl text-lg"
      style={{
        width: 44,
        height: 44,
        padding: 0,
        color: muted ? '#9aacc5' : '#3a6fb5',
        animationDelay: '120ms',
      }}
    >
      {muted ? '🔇' : '🎵'}
    </button>
  );
}
