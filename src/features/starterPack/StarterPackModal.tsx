import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { CEO_DOG, ROLE_IMAGE_MAP } from '@/constants/dogRoles';
import './starterPackModal.css';

export function StarterPackModal() {
  const show = useUiStore((s) => s.showStarterPack);
  const close = useUiStore((s) => s.closeStarterPack);
  const claimed = useGameStore((s) => s.claimedStarterPack);
  const claim = useGameStore((s) => s.claimStarterPack);

  if (!show || claimed) return null;

  function onYes() {
    claim();
    close();
  }

  return (
    <div
      onClick={close}
      className="spm-backdrop"
      role="dialog"
      aria-labelledby="spm-title"
      aria-modal="true"
    >
      <div onClick={(e) => e.stopPropagation()} className="spm-card">
        <span className="spm-tape spm-tape--left" aria-hidden="true" />
        <span className="spm-tape spm-tape--right" aria-hidden="true" />

        <div className="spm-header">
          <div className="spm-gift" aria-hidden="true">🎁</div>
          <div style={{ flex: 1 }}>
            <div className="spm-eyebrow">GAMEJAM 投票送禮</div>
            <h2 id="spm-title" className="spm-title">幫我們投一票，送你狗狗</h2>
          </div>
        </div>

        <p className="spm-desc">
          願意去 GameJam 投票給我們嗎？投了就送你一隻限定 CEO 狗狗 🐾
        </p>

        <div className="spm-polaroid">
          <span className="spm-polaroid__tape" aria-hidden="true" />
          <div className="spm-polaroid__row">
            <div className="spm-polaroid__photo">
              <img src={ROLE_IMAGE_MAP[CEO_DOG.role]} alt="刀霸翎" draggable={false} />
            </div>
            <div className="spm-polaroid__info">
              <div className="spm-namerow">
                <span className="spm-name">刀霸翎</span>
                <span className="spm-chip spm-chip--gold">S 級</span>
                <span className="spm-chip spm-chip--limited">限定</span>
              </div>
              <div className="spm-role">CEO · 月薪 $0</div>
              <div className="spm-quote">
                「Never be afraid,
                <br />
                keep on moving!」
              </div>
            </div>
          </div>
          <div className="spm-stamp" aria-hidden="true">EXCLUSIVE</div>
        </div>

        <div className="spm-cta-row">
          <button type="button" onClick={close} className="spm-cta spm-cta--cancel">
            先不要
          </button>
          <button type="button" onClick={onYes} className="spm-cta spm-cta--confirm">
            投了！領禮包 🎁
          </button>
        </div>
      </div>
    </div>
  );
}
