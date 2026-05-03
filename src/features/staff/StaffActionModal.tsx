import { DogAvatar } from '@/components/DogAvatar';
import {
  useGameStore,
  dogLevelUpCost,
  DOG_LEVEL_MAX,
  DOG_BREAKTHROUGH_MAX,
} from '@/store/gameStore';
import { dogPowerStars, dogGrade } from '@/lib/utils';
import { DOG_TRAITS_MAP, type DogTraitId } from '@/constants/dogTraits';
import { dogPowerWithTools, getDogToolCategory, getDogToolStatBoost } from '@/lib/toolsEngine';
import { SvgIcon } from '@/components/SvgIcon';
import type { ToolGrade } from '@/types';
import './staff.css';

const TOOL_GRADE_BG: Record<ToolGrade, string> = {
  U: 'linear-gradient(180deg, #ffd9f0, #b577ff)',
  S: 'linear-gradient(180deg, #ffd95a, #f0a818)',
  A: 'linear-gradient(180deg, #c9a4f0, #8a4ce0)',
  B: 'linear-gradient(180deg, #c8d8e8, #6a8aa8)',
};
const TOOL_GRADE_TEXT: Record<ToolGrade, string> = {
  U: '#3a0a4d',
  S: '#5a3d05',
  A: '#24152f',
  B: '#fff',
};

const TRAIT_UNLOCK_LEVELS = new Set([DOG_LEVEL_MAX]);

const STAT_LABELS: { key: 'speed' | 'quality' | 'patience'; label: string; color: string }[] = [
  { key: 'speed', label: '速度', color: '#5a8ce6' },
  { key: 'quality', label: '專業', color: '#e88aaa' },
  { key: 'patience', label: '耐心', color: '#5fb38f' },
];

const GRADE_BG: Record<string, string> = {
  U: 'radial-gradient(circle at 30% 28%, #fff8ff 0%, #ffb8e8 30%, #b577ff 60%, #4a1c8e 100%)',
  S: 'radial-gradient(circle at 30% 28%, #fff7c2 0%, #ffd24a 35%, #c87800 100%)',
  A: 'radial-gradient(circle at 30% 28%, #f6dfff 0%, #c265e6 40%, #5e1a8a 100%)',
  B: 'radial-gradient(circle at 30% 28%, #d6ffe0 0%, #3dcf73 40%, #145c30 100%)',
  C: 'radial-gradient(circle at 30% 28%, #d6ecff 0%, #3d7fef 40%, #102b56 100%)',
  D: 'radial-gradient(circle at 30% 28%, #f0f2f5 0%, #8a8f9a 50%, #3a4150 100%)',
};

const GRADE_BORDER: Record<string, string> = {
  U: 'conic-gradient(from 0deg, #ff7eb6, #ffd87e, #7eff9e, #7ec5ff, #be7eff, #ff7eb6)',
  S: 'linear-gradient(180deg, #ffe066 0%, #ffc107 50%, #b86b00 100%)',
  A: 'linear-gradient(180deg, #e2b6ff 0%, #b04ce0 50%, #5e1a8a 100%)',
  B: 'linear-gradient(180deg, #a4f0bd 0%, #28b964 50%, #145c30 100%)',
  C: 'linear-gradient(180deg, #a8c8ff 0%, #2f6dde 50%, #102b56 100%)',
  D: 'linear-gradient(180deg, #d2d6dd 0%, #7a8290 50%, #2c333f 100%)',
};

const GRADE_RING_COLOR: Record<string, string> = {
  U: '#ff7eb6',
  S: '#ffc107',
  A: '#b04ce0',
  B: '#28b964',
  C: '#2f6dde',
  D: '#7a8290',
};

export function StaffActionModal() {
  const modal = useGameStore((s) => s.staffActionModal);
  const staff = useGameStore((s) => s.staff);
  const money = useGameStore((s) => s.money);
  const close = useGameStore((s) => s.closeStaffAction);
  const upgradeDog = useGameStore((s) => s.upgradeDogLevel);
  const openTraitChoice = useGameStore((s) => s.openTraitChoiceModal);
  const tools = useGameStore((s) => s.tools);
  const teams = useGameStore((s) => s.teams);
  const openToolPicker = useGameStore((s) => s.openToolPicker);

  if (!modal) return null;
  const dog = staff[modal.staffIndex];
  if (!dog) return null;
  const grade = dogGrade(dog);
  const power = dogPowerWithTools(dog, tools, teams);
  const stars = dogPowerStars(power);
  const powerPct = Math.round((power / 400) * 100);

  const canUpgrade = dog.level < DOG_LEVEL_MAX;
  const cost = canUpgrade ? dogLevelUpCost(dog.level) : 0;
  const nextLevel = dog.level + 1;
  const unlocksTrait = canUpgrade && TRAIT_UNLOCK_LEVELS.has(nextLevel);
  const moneyOK = money >= cost;
  const breakthroughs = dog.breakthroughs ?? 0;

  return (
    <div
      className="staff-scrapbook-backdrop fixed inset-0 z-[870] flex items-center justify-center p-4"
      onClick={close}
    >
      <div
        className="staff-scrapbook-modal p-5 max-w-lg w-full max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* A. Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`rounded-full flex items-center justify-center relative ${grade === 'U' ? 'grade-u-frame u-frame-thin' : ''}`}
            style={{
              width: 80,
              height: 80,
              flexShrink: 0,
              backgroundImage: grade === 'U'
                ? 'linear-gradient(180deg, #ffffff, #ffffff)'
                : `linear-gradient(180deg, #ffffff, #ffffff), ${GRADE_BORDER[grade]}`,
              backgroundOrigin: 'border-box',
              backgroundClip: grade === 'U' ? 'padding-box' : 'padding-box, border-box',
              border: '3px solid transparent',
              boxShadow: `0 0 0 2px ${GRADE_RING_COLOR[grade]}33, 0 4px 12px ${GRADE_RING_COLOR[grade]}55`,
            }}
          >
            <div
              className="rounded-full overflow-hidden flex items-center justify-center"
              style={{ width: '100%', height: '100%', background: '#eef6ff' }}
            >
              {dog.image ? (
                <img
                  src={dog.image}
                  alt={`${dog.breed} ${dog.role}`}
                  className="block h-full w-full object-contain"
                  draggable={false}
                />
              ) : (
                <DogAvatar role={dog.role} breed={dog.breed} size={72} />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-lg font-extrabold">{dog.name}</span>
              <span
                className="text-[11px] px-1.5 rounded-md font-extrabold"
                style={{
                  background: GRADE_BG[grade],
                  color: grade === 'U' ? 'white' : '#173b78',
                  textShadow: grade === 'U' ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
                  border: '1px solid rgba(255,255,255,0.6)',
                }}
              >
                {grade}
              </span>
              <span
                className="text-[11px] px-1.5 rounded-md font-extrabold"
                style={{
                  background: 'linear-gradient(180deg,#ffe066,#f0a818)',
                  color: '#6a3d05',
                }}
              >
                Lv.{dog.level}
              </span>
              <span
                className="text-[11px] px-1.5 rounded-md font-extrabold"
                style={{
                  background: 'linear-gradient(180deg,#ffd6f3,#ff7eb6)',
                  color: '#5a1a3a',
                  border: '1px solid rgba(255,255,255,0.6)',
                }}
                title={`已突破 ${breakthroughs} 次（全能力 +${breakthroughs}）`}
              >
                ✦突破{breakthroughs}/{DOG_BREAKTHROUGH_MAX}
              </span>
            </div>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              {dog.breed}・{dog.role}
            </div>
          </div>
          {/* 右側裝備格（80x80 與頭像同尺寸） */}
          {(() => {
            const equipped = dog.equippedToolId
              ? tools.find((t) => t.instanceId === dog.equippedToolId) ?? null
              : null;
            const isLocked = !!equipped?.lockedToDogId;
            const toolCat = getDogToolCategory(dog);
            const canEquip = !!toolCat;
            const clickable = canEquip || !!equipped; // 有 toolCat 或已裝備（CEO 唯讀）才可點
            const borderColor = equipped
              ? `${GRADE_RING_COLOR[grade]}99`
              : canEquip
              ? '#9aacc5'
              : '#cbd3df';
            return (
              <button
                type="button"
                onClick={clickable ? () => openToolPicker(dog.id) : undefined}
                disabled={!clickable}
                className="relative flex flex-col items-center justify-center"
                style={{
                  width: 80,
                  height: 80,
                  flexShrink: 0,
                  borderRadius: 10,
                  border: `2px dashed ${borderColor}`,
                  background: equipped ? '#fffaf0' : '#f8fafc',
                  cursor: clickable ? 'pointer' : 'not-allowed',
                  padding: 0,
                }}
                title={
                  !canEquip && !equipped
                    ? '此職業不可裝備玩具'
                    : isLocked
                    ? `${equipped!.name}（${equipped!.grade}・永久綁定，點擊看詳情）`
                    : equipped
                    ? `${equipped.name}（${equipped.grade}）點擊更換`
                    : '點擊裝備玩具'
                }
              >
                {equipped ? (
                  <>
                    <SvgIcon name={equipped.iconName} size={44} />
                    <span
                      className="absolute top-1 right-1 text-[10px] px-1 rounded font-black leading-none"
                      style={{
                        background: TOOL_GRADE_BG[equipped.grade],
                        color: TOOL_GRADE_TEXT[equipped.grade],
                        padding: '2px 4px',
                      }}
                    >
                      {equipped.grade}
                    </span>
                    {isLocked && (
                      <span
                        className="absolute bottom-1 left-1 text-[10px] leading-none"
                        title="永久綁定"
                      >
                        🔒
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    className="text-sm font-extrabold"
                    style={{ color: canEquip ? '#6b7a8a' : '#b8c1cf' }}
                  >
                    {canEquip ? '玩具' : '不可裝備'}
                  </span>
                )}
              </button>
            );
          })()}
        </div>

        {/* B. Power（壓低高度） */}
        <div
            className="staff-paper-card px-3 py-1.5 mb-2"
          style={{
              background:
                'repeating-linear-gradient(0deg, rgba(186,121,82,0.06) 0 1px, transparent 1px 16px), linear-gradient(180deg, #fff5b8 0%, #ffe87a 100%)',
              borderColor: 'rgba(196,156,28,0.55)',
          }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-bold" style={{ color: 'var(--muted)' }}>工作能力</span>
            <span className="text-lg font-black leading-none" style={{ color: '#7a4a1c' }}>💼 {power}</span>
            <div
              className="staff-meter-track ml-2 flex-1 h-1.5 rounded-full overflow-hidden"
              title={`${powerPct}%`}
            >
              <div
                className="h-full"
                style={{
                  width: `${powerPct}%`,
                  background: 'linear-gradient(90deg, #ffd95a, #f0a818)',
                }}
              />
            </div>
            <span style={{ fontSize: 12, letterSpacing: 1 }}>
              <span style={{ color: '#f0a818' }}>{'★'.repeat(stars)}</span>
              <span style={{ color: '#d0d8e4' }}>{'★'.repeat(5 - stars)}</span>
            </span>
          </div>
        </div>

        {/* C. stats（速度/專業/耐心/疲勞，2 欄；疲勞落在專業下方） */}
        {(() => {
          const toolBoost = getDogToolStatBoost(dog, tools, teams);
          // 順序：速度、專業、耐心、疲勞 → grid-cols-2 排成
          //   速度  專業
          //   耐心  疲勞 → 不對，要「疲勞在專業下面」（同欄）→ 改順序：速度、專業、疲勞、耐心？
          // 用 grid-flow-col 兩欄佈局：左欄 [速度, 耐心]、右欄 [專業, 疲勞]
          return (
            <div className="grid grid-cols-2 grid-rows-2 grid-flow-col gap-x-3 gap-y-1.5 mb-3">
              {/* 左欄：速度、耐心 */}
              {(['speed', 'patience'] as const).map((key) => {
                const meta = STAT_LABELS.find((s) => s.key === key)!;
                const current = dog.stats[key];
                const breakBonus = breakthroughs;
                const baseOnly = Math.max(0, current - breakBonus);
                const toolBonus = key === 'speed' ? toolBoost.speed : 0;
                const baseDisplay = Math.round(baseOnly);
                const breakDisplay = breakBonus > 0 ? `✦+${breakBonus}` : null;
                const toolDisplay = toolBonus > 0 ? `+${toolBonus.toFixed(1)}` : null;
                const basePct = Math.max(0, Math.min(100, (baseOnly / 30) * 100));
                const breakPct = Math.max(0, Math.min(100, ((baseOnly + breakBonus) / 30) * 100));
                const totalPct = Math.max(0, Math.min(100, ((baseOnly + breakBonus + toolBonus) / 30) * 100));
                return (
                  <div key={key}>
                    <div className="flex justify-between items-baseline text-[11px] mb-0.5">
                      <span style={{ color: 'var(--muted)' }}>{meta.label}</span>
                      <span className="flex items-baseline gap-1">
                        <span className="font-extrabold" style={{ color: meta.color }}>{baseDisplay}</span>
                        {breakDisplay && (
                          <span className="font-extrabold text-[10px]" style={{ color: '#c2185b' }} title={`突破加成 +${breakBonus}`}>
                            {breakDisplay}
                          </span>
                        )}
                        {toolDisplay && (
                          <span className="font-extrabold text-[10px]" style={{ color: '#16a77f' }} title="玩具加成">
                            {toolDisplay}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: '#e4eefc' }}>
                      {toolBonus > 0 && (
                        <div className="absolute inset-y-0 left-0" style={{ width: `${totalPct}%`, background: 'rgba(22,167,127,0.55)' }} />
                      )}
                      {breakBonus > 0 && (
                        <div className="absolute inset-y-0 left-0" style={{ width: `${breakPct}%`, background: 'rgba(255,126,182,0.65)' }} />
                      )}
                      <div className="absolute inset-y-0 left-0" style={{ width: `${basePct}%`, background: meta.color }} />
                    </div>
                  </div>
                );
              })}
              {/* 右欄：專業、疲勞（疲勞落在專業下方） */}
              {(() => {
                const meta = STAT_LABELS.find((s) => s.key === 'quality')!;
                const current = dog.stats.quality;
                const breakBonus = breakthroughs;
                const baseOnly = Math.max(0, current - breakBonus);
                const toolBonus = toolBoost.quality;
                const baseDisplay = Math.round(baseOnly);
                const breakDisplay = breakBonus > 0 ? `✦+${breakBonus}` : null;
                const toolDisplay = toolBonus > 0 ? `+${toolBonus.toFixed(1)}` : null;
                const basePct = Math.max(0, Math.min(100, (baseOnly / 30) * 100));
                const breakPct = Math.max(0, Math.min(100, ((baseOnly + breakBonus) / 30) * 100));
                const totalPct = Math.max(0, Math.min(100, ((baseOnly + breakBonus + toolBonus) / 30) * 100));
                return (
                  <div key="quality">
                    <div className="flex justify-between items-baseline text-[11px] mb-0.5">
                      <span style={{ color: 'var(--muted)' }}>{meta.label}</span>
                      <span className="flex items-baseline gap-1">
                        <span className="font-extrabold" style={{ color: meta.color }}>{baseDisplay}</span>
                        {breakDisplay && (
                          <span className="font-extrabold text-[10px]" style={{ color: '#c2185b' }} title={`突破加成 +${breakBonus}`}>
                            {breakDisplay}
                          </span>
                        )}
                        {toolDisplay && (
                          <span className="font-extrabold text-[10px]" style={{ color: '#16a77f' }} title="玩具加成">
                            {toolDisplay}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: '#e4eefc' }}>
                      {toolBonus > 0 && (
                        <div className="absolute inset-y-0 left-0" style={{ width: `${totalPct}%`, background: 'rgba(22,167,127,0.55)' }} />
                      )}
                      {breakBonus > 0 && (
                        <div className="absolute inset-y-0 left-0" style={{ width: `${breakPct}%`, background: 'rgba(255,126,182,0.65)' }} />
                      )}
                      <div className="absolute inset-y-0 left-0" style={{ width: `${basePct}%`, background: meta.color }} />
                    </div>
                  </div>
                );
              })()}
              {/* 疲勞（位於專業下方） */}
              <div key="fatigue">
                <div className="flex justify-between items-baseline text-[11px] mb-0.5">
                  <span style={{ color: 'var(--muted)' }}>疲勞</span>
                  <span className="font-extrabold" style={{ color: '#d97706' }}>{Math.round(dog.fatigue)}</span>
                </div>
                <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: '#e4eefc' }}>
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${Math.max(0, Math.min(100, dog.fatigue))}%`,
                      background: '#ffc35c',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* E. learned traits */}
        {(dog.learnedTraits ?? []).length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--muted)' }}>已習得特性</div>
            <div className="flex flex-wrap gap-1">
              {(dog.learnedTraits as DogTraitId[]).map((tid) => {
                const def = DOG_TRAITS_MAP[tid];
                if (!def) return null;
                return (
                  <span
                    key={tid}
                    className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: '#eef6ff', border: '1px solid var(--line)', color: 'var(--blue)' }}
                    title={def.desc}
                  >
                    {def.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* motto */}
        <div
          className="staff-paper-card text-sm mb-3 p-3"
          style={{ color: '#886153' }}
        >
          {dog.motto}
        </div>

        {/* D. 升等解鎖特性提示 */}
        {canUpgrade && unlocksTrait && (
          <div className="mb-2 text-[11px] text-center font-extrabold" style={{ color: '#c0610a' }}>
            ✦ 升 Lv.{nextLevel} 解鎖新特性
          </div>
        )}

        {/* D2. 待選特性按鈕（不論等級都顯示，避免滿等後消失） */}
        {dog.pendingTraitChoice && (
          <button
            type="button"
            onClick={() => openTraitChoice(dog.id)}
            className="staff-soft-btn mb-3 w-full py-2 font-extrabold text-xs"
            style={{
              background: 'linear-gradient(180deg, #fffaf0, #ffe9b3)',
              border: '1.5px solid #f0a818',
              color: '#7a4a1c',
              boxShadow: '0 2px 8px rgba(240,168,24,0.4)',
            }}
          >
            ✦ 升級待選特性
          </button>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={close}
            className="staff-soft-btn py-2 font-bold"
          >
            關閉
          </button>
          {canUpgrade ? (
            <button
              type="button"
              onClick={() => upgradeDog(dog.id)}
              disabled={!moneyOK}
              className="staff-soft-btn py-2 font-extrabold"
              style={{
                background: moneyOK
                  ? 'linear-gradient(180deg, #ffd95a, #f0a818)'
                  : '#e9f1ff',
                color: moneyOK ? '#6a3d05' : '#8aa2c8',
                border: '1px solid rgba(176,107,15,0.4)',
                cursor: moneyOK ? 'pointer' : 'not-allowed',
              }}
              title={moneyOK ? `花 $${cost} 升級` : `需要 $${cost}`}
            >
              $升級 ${cost}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="staff-soft-btn py-2 font-extrabold"
              style={{
                background: '#e9f1ff',
                color: '#8aa2c8',
                cursor: 'not-allowed',
              }}
            >
              已滿等
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

