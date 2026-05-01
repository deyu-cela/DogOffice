import { SvgIcon } from '@/components/SvgIcon';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import {
  SPECIAL_TASK_BASELINE_LEVEL,
  SPECIAL_TASK_BASE_DAYS,
} from '@/constants/specialTasks';
import { estimateSpecialTaskRemainingDays, teamTotalAbility, useGameStore } from '@/store/gameStore';

const OFFICE_TIER_BONUS = [0, 5, 12, 22, 35];
const OFFICE_TIER_CAP = [3, 3, 4, 4, 5];

function upgradeBenefits(curLv: number): string[] {
  const next = curLv + 1;
  const benefits: string[] = [];
  const curMax = OFFICE_LEVELS[curLv].maxStaff;
  const nextMax = OFFICE_LEVELS[next].maxStaff;
  if (nextMax > curMax) benefits.push(`員工上限 +${nextMax - curMax}（→${nextMax}）`);
  const curBonus = OFFICE_TIER_BONUS[curLv] ?? 0;
  const nextBonus = OFFICE_TIER_BONUS[next] ?? 0;
  if (nextBonus > curBonus) benefits.push(`稀有度 +${nextBonus - curBonus}`);
  const curCap = OFFICE_TIER_CAP[curLv] ?? 3;
  const nextCap = OFFICE_TIER_CAP[next] ?? 3;
  if (nextCap > curCap) benefits.push(`解鎖 ${nextCap} 級案件`);
  if (next === 3) benefits.push('達成 IPO 條件之一');
  return benefits;
}

export function ConstructionPanel() {
  const money = useGameStore((s) => s.money);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const upgrade = useGameStore((s) => s.upgradeOffice);
  const specialTasks = useGameStore((s) => s.specialTasks);
  const startSpecialTask = useGameStore((s) => s.startSpecialTask);

  const curLv = OFFICE_LEVELS[officeLevel];
  const nextLv = OFFICE_LEVELS[officeLevel + 1];
  const atMax = !nextLv;
  const benefits = atMax ? [] : upgradeBenefits(officeLevel);

  const targetLevel = officeLevel + 1;
  const task = specialTasks?.[targetLevel];
  const taskCompleted = task?.status === 'completed';
  const taskInProgress = task?.status === 'inProgress';
  const taskAvailable = task?.status === 'available';

  const canUpgrade = !atMax && taskCompleted && money >= (nextLv?.upgradeCost ?? 0);

  const rawAbility = useGameStore((s) => teamTotalAbility(s));
  const currentAbility = Number.isFinite(rawAbility) ? rawAbility : 0;
  const estRemaining = useGameStore((s) => estimateSpecialTaskRemainingDays(s, targetLevel));
  const safeWorkDone = task && Number.isFinite(task.workDone) ? task.workDone : 0;
  const safeWorkRequired = task && Number.isFinite(task.workRequired) ? task.workRequired : 0;
  const progressPct = safeWorkRequired > 0
    ? Math.min(100, (safeWorkDone / safeWorkRequired) * 100)
    : 0;
  const remainingLabel =
    !taskInProgress
      ? ''
      : !Number.isFinite(estRemaining)
        ? 'team 沒人在'
        : `預估剩 ${estRemaining} 天`;

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="p-3 rounded-xl"
        style={{ background: '#f7fbff', border: '1px solid var(--line)' }}
      >
        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#173b78' }}>
          <SvgIcon name="office" size={20} />
          <span>目前辦公室：{curLv.name}（等級 {officeLevel + 1}）</span>
        </div>
        <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
          員工上限 {curLv.maxStaff}・稀有度加成 +{OFFICE_TIER_BONUS[officeLevel] ?? 0}・最高 {OFFICE_TIER_CAP[officeLevel] ?? 3} 級案件
        </div>
      </div>

      {atMax ? (
        <div className="p-3 rounded-xl text-center" style={{ background: '#eefaf7', border: '1px solid rgba(51,194,154,0.28)' }}>
          <strong>已達最大規模</strong>
        </div>
      ) : (
        <>
          {/* 特殊任務區塊（紅色調） */}
          {task && (
            <div
              className="p-3 rounded-xl"
              style={{
                background: 'linear-gradient(180deg, #fff5f2, #fde0d8)',
                border: '1.5px solid #c63a3a',
                boxShadow: '0 2px 6px rgba(138,31,31,0.18)',
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="font-bold flex items-center gap-1.5" style={{ color: '#8a1f1f' }}>
                  <span>⚠ 特殊任務</span>
                  <span className="text-[11px] font-normal" style={{ color: '#a85a4f' }}>
                    （升級必經）
                  </span>
                </div>
                {taskCompleted && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#1f8a47', color: 'white' }}
                  >
                    ✓ 已完成
                  </span>
                )}
                {taskInProgress && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#c63a3a', color: 'white' }}
                  >
                    進行中
                  </span>
                )}
                {taskAvailable && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#a85a4f', color: 'white' }}
                  >
                    待啟動
                  </span>
                )}
              </div>
              <div className="text-sm font-bold" style={{ color: '#5a1a1a' }}>
                {task.name}
              </div>
              {taskAvailable && (
                <>
                  <div className="text-[11px] mt-1" style={{ color: '#7a3a35' }}>
                    每日依 team 員工綜合能力推進，升級員工會即時加快。
                    基準：滿員 + 全員 Lv{SPECIAL_TASK_BASELINE_LEVEL[targetLevel]} 約 {SPECIAL_TASK_BASE_DAYS[targetLevel]} 天完成。
                  </div>
                  <button
                    onClick={() => startSpecialTask(targetLevel)}
                    className="mt-2 w-full text-sm font-bold py-1.5 rounded-lg"
                    style={{
                      background: 'linear-gradient(180deg, #c63a3a, #8a1f1f)',
                      color: 'white',
                      border: '1px solid #8a1f1f',
                      cursor: 'pointer',
                    }}
                  >
                    開始任務
                  </button>
                </>
              )}
              {taskInProgress && (
                <>
                  <div
                    className="mt-2"
                    style={{
                      height: 8,
                      background: 'rgba(138,31,31,0.18)',
                      borderRadius: 4,
                      overflow: 'hidden',
                      border: '1px solid rgba(138,31,31,0.28)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPct}%`,
                        background: 'linear-gradient(90deg, #c63a3a, #e76b66)',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                  <div
                    className="mt-1 flex justify-between text-[11px] font-bold"
                    style={{ color: '#8a1f1f' }}
                  >
                    <span>
                      {Math.round(safeWorkDone)} / {safeWorkRequired} 工時
                    </span>
                    <span>{remainingLabel}</span>
                  </div>
                  <div className="text-[10px]" style={{ color: '#a85a4f' }}>
                    當前每日推進 {Math.round(currentAbility * 10) / 10}（team 綜合能力）
                  </div>
                </>
              )}
              {taskCompleted && (
                <div className="text-[11px] mt-1" style={{ color: '#1f8a47' }}>
                  任務已完成，下方可付費升級。
                </div>
              )}
            </div>
          )}

          <div
            className="p-3 rounded-xl"
            style={{
              background: 'linear-gradient(180deg, #ffffff, #eef6ff)',
              border: '1px solid #7fb2ef',
              boxShadow: 'var(--shadow-soft)',
              opacity: taskCompleted ? 1 : 0.78,
            }}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="font-bold flex items-center gap-1.5">
                  <SvgIcon name="office" size={19} />
                  <span>擴建 → {nextLv.name}</span>
                </div>
                <div className="flex flex-col gap-0.5 mt-1.5">
                  {benefits.map((b, i) => (
                    <div key={i} className="text-[11px]" style={{ color: 'var(--muted)' }}>{b}</div>
                  ))}
                  {!taskCompleted && (
                    <div className="text-[11px] font-bold" style={{ color: '#8a1f1f' }}>
                      ⚠ 需先完成上方特殊任務
                    </div>
                  )}
                </div>
              </div>
              <button
                disabled={!canUpgrade}
                onClick={upgrade}
                className="text-sm px-3"
                style={{
                  background: canUpgrade
                    ? 'linear-gradient(180deg, #2f8df4, #1c63c8)'
                    : '#e9f1ff',
                  color: canUpgrade ? 'white' : '#8aa2c8',
                  border: '1px solid var(--line)',
                  cursor: canUpgrade ? 'pointer' : 'not-allowed',
                }}
              >
                ${nextLv.upgradeCost}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
