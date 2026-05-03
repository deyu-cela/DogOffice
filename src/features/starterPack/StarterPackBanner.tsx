import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';

export function StarterPackBanner() {
  const claimed = useGameStore((s) => s.claimedStarterPack);
  const open = useUiStore((s) => s.openStarterPack);

  if (claimed) return null;

  return (
    <button
      type="button"
      onClick={open}
      aria-label="開啟新手禮包"
      data-tutorial="starter-pack"
      className="starter-pack-banner absolute z-[700] inline-flex items-center gap-2 rounded-full font-extrabold cursor-pointer"
      style={{
        background: 'linear-gradient(180deg, #fff7e0, #ffd9a3)',
        border: '1px solid rgba(255,180,90,0.9)',
        color: '#8a4a1c',
        boxShadow: '0 12px 24px rgba(204,118,42,0.25)',
        padding: '10px 16px',
        fontSize: 13,
        bottom: 18,
        left: 18,
      }}
    >
      <span className="text-xl leading-none">🎁</span>
      <span>新手禮包</span>
      <span
        className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(255,255,255,0.7)', color: '#b07020' }}
      >
        點我看
      </span>
    </button>
  );
}
