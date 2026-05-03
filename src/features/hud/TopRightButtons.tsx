import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { SaveIndicator } from './SaveIndicator';
import { RestartButton } from './RestartButton';
import { LeaderboardPanel } from '@/features/leaderboard/LeaderboardPanel';
import { SvgIcon } from '@/components/SvgIcon';
import { BgmToggle } from '@/components/BgmToggle';

const ICON_BTN_STYLE: React.CSSProperties = {
  width: 44,
  height: 44,
  padding: 0,
};

export function TopRightButtons() {
  const authedUser = useAuthStore((s) => s.user);
  const openSkinModal = useUiStore((s) => s.openSkinModal);
  const openAchievements = useUiStore((s) => s.openAchievements);
  const [lbOpen, setLbOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none absolute top-3 right-3 z-[700] flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLbOpen(true)}
          className="bx-chip bx-shine bx-fade-up pointer-events-auto grid place-items-center rounded-xl"
          style={{ ...ICON_BTN_STYLE, animationDelay: '0ms' }}
          title="排行榜"
          aria-label="排行榜"
          data-tutorial="leaderboard-button"
        >
          <SvgIcon name="trophy" size={24} />
        </button>

        <button
          type="button"
          onClick={openAchievements}
          className="bx-chip bx-shine bx-fade-up pointer-events-auto grid place-items-center rounded-xl"
          style={{ ...ICON_BTN_STYLE, animationDelay: '30ms' }}
          title="成就 CG 收藏"
          aria-label="成就 CG 收藏"
          data-tutorial="achievement-button"
        >
          <SvgIcon name="gallery" size={24} />
        </button>

        <button
          type="button"
          onClick={openSkinModal}
          className="bx-chip bx-shine bx-fade-up pointer-events-auto grid place-items-center rounded-xl"
          style={{ ...ICON_BTN_STYLE, animationDelay: '60ms' }}
          title="更換辦公室造型"
          aria-label="更換辦公室造型"
        >
          <SvgIcon name="wand" size={22} />
        </button>

        <div className="pointer-events-auto">
          <BgmToggle />
        </div>

        {authedUser && (
          <div className="pointer-events-auto flex items-center gap-2">
            <SaveIndicator />
            <RestartButton />
          </div>
        )}
      </div>

      {lbOpen && <LeaderboardPanel onClose={() => setLbOpen(false)} />}
    </>
  );
}
