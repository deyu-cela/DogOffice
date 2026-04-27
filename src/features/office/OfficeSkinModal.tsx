import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';

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
                  background: active
                    ? 'linear-gradient(180deg, #d4ecca, #b6efab)'
                    : locked
                      ? 'rgba(240,234,222,0.5)'
                      : 'rgba(255,255,255,0.85)',
                  border: active
                    ? '2px solid #66bb6a'
                    : locked
                      ? '1.5px dashed rgba(90,70,54,0.2)'
                      : '1.5px solid rgba(90,70,54,0.15)',
                  opacity: locked ? 0.55 : 1,
                  cursor: locked ? 'not-allowed' : 'pointer',
                }}
              >
                {/* 配色預覽 */}
                <div
                  className="rounded-xl flex-shrink-0"
                  style={{
                    width: 56,
                    height: 56,
                    background: `linear-gradient(135deg, ${lv.wall} 0%, ${lv.wallRight ?? lv.wall} 50%, ${lv.floor} 100%)`,
                    border: '1.5px solid rgba(90,70,54,0.15)',
                    position: 'relative',
                  }}
                >
                  {lv.accent && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 4,
                        bottom: 4,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: lv.accent,
                        border: '1.5px solid white',
                      }}
                    />
                  )}
                </div>

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
                    主題：{lv.theme ?? 'kawaii'}・容量 {lv.maxStaff} 隻
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
