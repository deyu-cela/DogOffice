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
      className="fixed bottom-4 right-4 z-[800] w-11 h-11 rounded-full flex items-center justify-center text-lg"
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(210,226,248,0.9)',
        boxShadow: '0 8px 18px rgba(46,104,180,0.18)',
        color: muted ? '#9aacc5' : '#3a6fb5',
      }}
    >
      {muted ? '🔇' : '🎵'}
    </button>
  );
}
