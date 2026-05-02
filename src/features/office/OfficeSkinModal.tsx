import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { JP_ASSETS } from './assets';
import bgCarUrl from '@/assets/gpt-bg-car.png';
import bgGardenUrl from '@/assets/bg-garden.jpg';
import bg3Url from '@/assets/gpt-bg-3.png';
import bg4Url from '@/assets/gpt-bg-4.png';
import bg5Url from '@/assets/gpt-bg-5.png';
import wall3Url from '@/assets/gpt-wall-3.png';
import wall4Url from '@/assets/gpt-wall-4.png';
import wall5Url from '@/assets/gpt-wall-5.png';

const SKIN_BG_BY_LEVEL = [bgCarUrl, bgGardenUrl, bg3Url, bg4Url, bg5Url];
const SKIN_WALL_BY_LEVEL = [
  JP_ASSETS.gptWallCar,
  JP_ASSETS.gptWall,
  wall3Url,
  wall4Url,
  wall5Url,
];

export function OfficeSkinModal({ onClose }: { onClose: () => void }) {
  const officeLevel = useGameStore((s) => s.officeLevel);
  const officeSkin = useGameStore((s) => s.officeSkin);
  const setSkin = useGameStore((s) => s.setOfficeSkin);

  return (
    <div
      className="fixed inset-0 z-[850] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-3xl max-w-md w-full overflow-y-auto"
        style={{
          maxHeight: '85vh',
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid rgba(90,70,54,0.18)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 pb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl"></span>
            <span className="font-extrabold text-base">辦公室造型</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-2.5 py-1 rounded-full"
            style={{ background: '#eeeae4', color: '#5b3c2b' }}
          >
            ✕
          </button>
        </div>

        <div className="px-4 pb-2 text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
          選一個視覺造型；只影響外觀，不影響容量。已升級到的等級才能選。
        </div>

        <div className="p-4 pt-2 flex flex-col gap-2">
          {OFFICE_LEVELS.map((lv, i) => {
            const locked = i > officeLevel;
            const active = i === officeSkin;
            const bgUrl = SKIN_BG_BY_LEVEL[i];
            const wallUrl = SKIN_WALL_BY_LEVEL[i];
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
                className="p-3 rounded-2xl text-left flex items-center gap-3"
                style={{
                  backgroundImage: locked
                    ? undefined
                    : `linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.55)), url(${wallUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: locked ? 'rgba(240,234,222,0.5)' : 'transparent',
                  border: active
                    ? '2px solid #66bb6a'
                    : locked
                      ? '1.5px dashed rgba(90,70,54,0.2)'
                      : '1.5px solid rgba(90,70,54,0.15)',
                  opacity: locked ? 0.55 : 1,
                  cursor: locked ? 'not-allowed' : 'pointer',
                }}
              >
                {/* 背景圖預覽 */}
                <div
                  className="rounded-xl flex-shrink-0"
                  style={{
                    width: 56,
                    height: 56,
                    backgroundImage: `url(${bgUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1.5px solid rgba(90,70,54,0.15)',
                  }}
                />

                {/* 文字 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold">{lv.name}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: '#eeeae4', color: '#5b3c2b' }}
                    >
                      Lv {i + 1}
                    </span>
                    {active && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: '#66bb6a', color: 'white' }}
                      >
                        使用中
                      </span>
                    )}
                    {locked && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: '#bbb', color: 'white' }}
                      >
                         未解鎖
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    主題：{lv.theme ?? 'kawaii'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
