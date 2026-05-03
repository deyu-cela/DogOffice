import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import '@/features/hud/leftHud.css';

export function StarterPackBanner() {
  const claimed = useGameStore((s) => s.claimedStarterPack);
  const open = useUiStore((s) => s.openStarterPack);

  if (claimed) return null;

  return (
    <div className="lhud-banner">
      <button
        type="button"
        onClick={open}
        aria-label="開啟新手禮包"
        className="lhud-banner__btn lhud-paper"
      >
        <span className="lhud-banner__pin" aria-hidden="true" />
        <span className="lhud-banner__emoji" aria-hidden="true">🎁</span>
        <span className="lhud-banner__label">新手禮包</span>
        <span className="lhud-banner__chip">點我看</span>
      </button>
    </div>
  );
}
