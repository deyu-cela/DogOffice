import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import bgCarUrl from '@/assets/gpt-bg-car.png';
import bgGardenUrl from '@/assets/bg-garden.jpg';
import bg3Url from '@/assets/gpt-bg-3.png';
import bg4Url from '@/assets/gpt-bg-4.png';
import bg5Url from '@/assets/gpt-bg-5.png';
import './officeSkinModal.css';

const SKIN_BG_BY_LEVEL = [bgCarUrl, bgGardenUrl, bg3Url, bg4Url, bg5Url];
const TILT_CLASSES = [
  'osk-card-item--tilt-1',
  'osk-card-item--tilt-2',
  'osk-card-item--tilt-3',
  'osk-card-item--tilt-4',
  'osk-card-item--tilt-5',
];

export function OfficeSkinModal({ onClose }: { onClose: () => void }) {
  const officeLevel = useGameStore((s) => s.officeLevel);
  const officeSkin = useGameStore((s) => s.officeSkin);
  const setSkin = useGameStore((s) => s.setOfficeSkin);

  return (
    <div className="osk-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="osk-title">
      <div className="osk-stack" onClick={(e) => e.stopPropagation()}>
        <div className="osk-back" aria-hidden="true" />
        <div className="osk-card">
          <span className="osk-tape osk-tape--left" aria-hidden="true" />
          <span className="osk-tape osk-tape--right" aria-hidden="true" />
          <img
            className="osk-house"
            src={`${import.meta.env.BASE_URL}assets/leaderboard/house-badge.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
          />

          <button type="button" onClick={onClose} className="osk-close">關閉</button>

          <div className="osk-header">
            <div className="osk-eyebrow">OFFICE STYLE · 造型</div>
            <h2 id="osk-title" className="osk-title">辦公室造型</h2>
            <div className="osk-subpill">
              <span className="osk-subpill__dot" />
              只影響外觀．不影響容量
              <span className="osk-subpill__dot" />
            </div>
          </div>

          <div className="osk-grid">
            {OFFICE_LEVELS.map((lv, i) => {
              const locked = i > officeLevel;
              const active = i === officeSkin;
              const tiltClass = TILT_CLASSES[i % TILT_CLASSES.length];
              const cls = [
                'osk-card-item',
                tiltClass,
                active ? 'osk-card-item--active' : '',
                locked ? 'osk-card-item--locked' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={i}
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    setSkin(i);
                    onClose();
                  }}
                  className={cls}
                  aria-pressed={active}
                  title={locked ? `升到 Lv ${i + 1} 才能使用` : lv.name}
                >
                  <span className="osk-card-item__tape" aria-hidden="true" />
                  <div
                    className="osk-thumb"
                    style={{ backgroundImage: `url(${SKIN_BG_BY_LEVEL[i]})` }}
                  >
                    {locked && <div className="osk-thumb__lock" aria-hidden="true">🔒</div>}
                    {active && <span className="osk-using" aria-hidden="true">使用中</span>}
                  </div>
                  <div className="osk-card-item__head">
                    <span className="osk-card-item__name">{lv.name}</span>
                    <span className="osk-card-item__lv">Lv {i + 1}</span>
                  </div>
                  <div className="osk-card-item__theme">主題：{lv.theme ?? 'kawaii'}</div>
                </button>
              );
            })}

            <div className="osk-more" aria-hidden="true">
              <span className="osk-more__paw">🐾</span>
              <div className="osk-more__text">
                升級辦公室
                <br />
                解鎖更多造型
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
