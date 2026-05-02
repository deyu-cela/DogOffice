import { DogAvatar } from '@/components/DogAvatar';
import {
  useGameStore,
  dogLevelUpCost,
  dogLevelUpFragmentCost,
  DOG_LEVEL_MAX,
} from '@/store/gameStore';
import { dogPowerStars, dogGrade } from '@/lib/utils';
import { DOG_TRAITS_MAP, type DogTraitId } from '@/constants/dogTraits';
import { dogPowerWithTools, getDogToolCategory, getDogToolStatBoost } from '@/lib/toolsEngine';
import { SvgIcon } from '@/components/SvgIcon';
import type { ToolGrade } from '@/types';
import './staff.css';

const TOOL_GRADE_BG: Record<ToolGrade, string> = {
  S: 'linear-gradient(180deg, #ffd95a, #f0a818)',
  A: 'linear-gradient(180deg, #c9a4f0, #8a4ce0)',
  B: 'linear-gradient(180deg, #c8d8e8, #6a8aa8)',
};
const TOOL_GRADE_TEXT: Record<ToolGrade, string> = {
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
  const startPip = useGameStore((s) => s.startPip);
  const togglePipTask = useGameStore((s) => s.togglePipTask);
  const keep = useGameStore((s) => s.keepStaff);
  const fire = useGameStore((s) => s.fireStaff);
  const upgradeDog = useGameStore((s) => s.upgradeDogLevel);
  const upgradeDogFrag = useGameStore((s) => s.upgradeDogWithFragments);
  const openTraitChoice = useGameStore((s) => s.openTraitChoiceModal);
  const tools = useGameStore((s) => s.tools);
  const openToolPicker = useGameStore((s) => s.openToolPicker);

  if (!modal) return null;
  const dog = staff[modal.staffIndex];
  if (!dog) return null;
  const idx = modal.staffIndex;
  const grade = dogGrade(dog);
  const power = dogPowerWithTools(dog, tools);
  const stars = dogPowerStars(power);
  const powerPct = Math.round((power / 400) * 100);

  const canUpgrade = dog.level < DOG_LEVEL_MAX;
  const cost = canUpgrade ? dogLevelUpCost(dog.level) : 0;
  const fragNeed = canUpgrade ? dogLevelUpFragmentCost(dog.level) : 0;
  const nextLevel = dog.level + 1;
  const unlocksTrait = canUpgrade && TRAIT_UNLOCK_LEVELS.has(nextLevel);
  const moneyOK = money >= cost;
  const fragOK = dog.fragments >= fragNeed;

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
              {(() => {
                const toolCat = getDogToolCategory(dog);
                if (!toolCat) return null;
                const equipped = dog.equippedToolId
                  ? tools.find((t) => t.instanceId === dog.equippedToolId) ?? null
                  : null;
                return (
                  <button
                    type="button"
                    onClick={() => openToolPicker(dog.id)}
                    className="staff-chip-btn flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-bold"
                    style={{
                      color: equipped ? '#7a4a1c' : '#6b7a8a',
                    }}
                    title={equipped ? `${equipped.name}（${equipped.grade}）` : '裝備玩具'}
                  >
                    <SvgIcon name="tool" size={14} />
                    {equipped ? (
                      <>
                        <SvgIcon name={equipped.iconName} size={14} />
                        <span
                          className="text-[10px] px-1 rounded font-black"
                          style={{
                            background: TOOL_GRADE_BG[equipped.grade],
                            color: TOOL_GRADE_TEXT[equipped.grade],
                          }}
                        >
                          {equipped.grade}
                        </span>
                      </>
                    ) : (
                      <span>無</span>
                    )}
                  </button>
                );
              })()}
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
            </div>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              {dog.breed}・{dog.role}
            </div>
          </div>
        </div>

        {/* B. Power */}
        <div
            className="staff-paper-card p-3 mb-3"
          style={{
              background:
                'repeating-linear-gradient(0deg, rgba(186,121,82,0.06) 0 1px, transparent 1px 16px), linear-gradient(180deg, #fff5b8 0%, #ffe87a 100%)',
              borderColor: 'rgba(196,156,28,0.55)',
          }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-bold" style={{ color: 'var(--muted)' }}>工作能力</span>
            <span className="text-2xl font-black" style={{ color: '#7a4a1c' }}>💼 {power}</span>
            <span className="ml-auto" style={{ fontSize: 14, letterSpacing: 2 }}>
              <span style={{ color: '#f0a818' }}>{'★'.repeat(stars)}</span>
              <span style={{ color: '#d0d8e4' }}>{'★'.repeat(5 - stars)}</span>
            </span>
          </div>
          <div className="staff-meter-track mt-1.5 h-2 rounded-full overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${powerPct}%`,
                background: 'linear-gradient(90deg, #ffd95a, #f0a818)',
              }}
            />
          </div>
        </div>

        {/* C. 4 stats */}
        {(() => {
          const toolBoost = getDogToolStatBoost(dog, tools);
          return (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3">
              {STAT_LABELS.map(({ key, label, color }) => {
                const base = dog.stats[key];
                const bonus = key === 'speed' ? toolBoost.speed : key === 'quality' ? toolBoost.quality : 0;
                const total = base + bonus;
                const display = Math.round(base);
                const bonusDisplay = bonus > 0 ? `+${bonus.toFixed(1)}` : null;
                const basePct = Math.max(0, Math.min(100, base * 10));
                const totalPct = Math.max(0, Math.min(100, total * 10));
                return (
                  <div key={key}>
                    <div className="flex justify-between items-baseline text-[11px] mb-0.5">
                      <span style={{ color: 'var(--muted)' }}>{label}</span>
                      <span className="flex items-baseline gap-1">
                        <span className="font-extrabold" style={{ color }}>{display}</span>
                        {bonusDisplay && (
                          <span
                            className="font-extrabold text-[10px]"
                            style={{ color: '#16a77f' }}
                            title="玩具加成"
                          >
                            {bonusDisplay}
                          </span>
                        )}
                      </span>
                    </div>
                    <div
                      className="relative h-1.5 rounded-full overflow-hidden"
                      style={{ background: '#e4eefc' }}
                    >
                      {bonus > 0 && (
                        <div
                          className="absolute inset-y-0 left-0"
                          style={{
                            width: `${totalPct}%`,
                            background: 'rgba(22,167,127,0.55)',
                          }}
                        />
                      )}
                      <div
                        className="absolute inset-y-0 left-0"
                        style={{ width: `${basePct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
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

        {/* F. meters */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <MeterMini label="疲勞" value={dog.fatigue} color="#ffc35c" />
          <MeterMini label="忠誠" value={dog.loyalty} color="#2f8df4" />
        </div>

        {/* motto */}
        <div
          className="staff-paper-card text-sm mb-3 p-3"
          style={{ color: '#886153' }}
        >
          {dog.motto}
        </div>

        {/* D. Upgrade actions */}
        {canUpgrade && (
          <div className="mb-3 flex flex-col gap-1.5">
            {unlocksTrait && (
              <div className="text-[11px] text-center font-extrabold" style={{ color: '#c0610a' }}>
                ✦ 升 Lv.{nextLevel} 解鎖新特性
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => upgradeDog(dog.id)}
                disabled={!moneyOK}
                className="staff-soft-btn py-2 font-extrabold text-xs"
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
              <button
                type="button"
                onClick={() => upgradeDogFrag(dog.id)}
                disabled={!fragOK}
                className="staff-soft-btn py-2 font-extrabold text-xs"
                style={{
                  background: fragOK
                    ? 'linear-gradient(180deg, #ff8aa3, #ff5a7a)'
                    : 'rgba(255,240,237,0.68)',
                  color: fragOK ? '#ffffff' : '#a98a80',
                  border: '1px solid rgba(214,60,100,0.3)',
                  cursor: fragOK ? 'pointer' : 'not-allowed',
                }}
                title={fragOK ? `用 ${fragNeed} 碎片升級` : `碎片不足（${dog.fragments}/${fragNeed}）`}
              >
                碎片強化 {dog.fragments}/{fragNeed}
              </button>
            </div>
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

        {/* G. PIP / fire / keep / close */}
        {dog.status !== 'pip' ? (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={close}
              className="staff-soft-btn py-2 font-bold"
            >
              關閉
            </button>
            <button
              onClick={() => startPip(idx)}
              className="staff-soft-btn py-2 font-bold"
              style={{
                background: 'linear-gradient(180deg, #fff7f7, #ffecec)',
                color: '#d34a4a',
                border: '1px solid rgba(255,112,112,0.24)',
              }}
            >
              進入 PIP
            </button>
          </div>
        ) : (
          <div>
            <div className="text-sm font-bold mb-2">PIP 任務（{dog.pipDaysLeft} 天剩餘）</div>
            <div className="flex flex-col gap-2 mb-3">
              {dog.pipTasks?.map((task, ti) => (
                <label
                  key={ti}
                  className="staff-paper-card flex items-center gap-2 p-2"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => togglePipTask(idx, ti)}
                    className="w-4 h-4"
                  />
                  <span className={`text-sm ${task.done ? 'line-through opacity-60' : ''}`}>{task.text}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={close}
                className="staff-soft-btn py-2 font-bold"
              >
                關閉
              </button>
              <button
                onClick={() => keep(idx)}
                className="staff-kawaii-btn py-2 font-bold"
                style={{
                  background: 'linear-gradient(180deg, #35c59c, #16a77f)',
                  color: 'white',
                }}
              >
                留任
              </button>
              <button
                onClick={() => fire(idx)}
                className="staff-kawaii-btn py-2 font-bold"
                style={{
                  background: 'linear-gradient(180deg, #ff8d8d, #e24c4c)',
                  color: 'white',
                }}
              >
                資遣 ${dog.severance}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MeterMini({ label, value, color }: { label: string; value: number; color: string }) {
  const display = Math.round(value);
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-0.5">
        <span style={{ color: 'var(--muted)' }}>{label}</span>
        <span style={{ color: 'var(--muted)' }}>{display}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#e4eefc' }}>
        <div
          className="h-full"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
        />
      </div>
    </div>
  );
}
