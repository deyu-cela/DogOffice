import { SvgIcon } from '@/components/SvgIcon';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import {
  SPECIAL_TASK_BASELINE_LEVEL,
  SPECIAL_TASK_BASE_DAYS,
} from '@/constants/specialTasks';
import { estimateSpecialTaskRemainingDays, teamTotalAbility, useGameStore } from '@/store/gameStore';

const OFFICE_TIER_BONUS = [0, 5, 12, 22, 35];
const OFFICE_TIER_CAP = [3, 3, 4, 4, 5];

const cardStyle: React.CSSProperties = {
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.66), rgba(255,247,239,0.62)), repeating-linear-gradient(0deg, rgba(186,121,82,0.05) 0 1px, transparent 1px 15px)',
  border: '1px solid rgba(208,130,105,0.32)',
  boxShadow: '0 8px 16px rgba(166,91,85,0.08), inset 0 0 0 1px rgba(255,255,255,0.42)',
  backdropFilter: 'blur(7px) saturate(1.02)',
  WebkitBackdropFilter: 'blur(7px) saturate(1.02)',
};

function upgradeBenefits(curLv: number): string[] {
  const next = curLv + 1;
  const benefits: string[] = [];
  const curBonus = OFFICE_TIER_BONUS[curLv] ?? 0;
  const nextBonus = OFFICE_TIER_BONUS[next] ?? 0;
  if (nextBonus > curBonus) benefits.push(`能力加成 +${nextBonus - curBonus}`);
  const curCap = OFFICE_TIER_CAP[curLv] ?? 3;
  const nextCap = OFFICE_TIER_CAP[next] ?? 3;
  if (nextCap > curCap) benefits.push(`隊伍上限 ${nextCap} 位`);
  if (next === 3) benefits.push('解鎖 IPO 挑戰');
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
        ? '隊伍能力不足'
        : `約 ${estRemaining} 天`;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="p-3 rounded-xl" style={cardStyle}>
        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#5b382d' }}>
          <SvgIcon name="office" size={20} />
          <span>目前辦公室：{curLv.name}（Lv.{officeLevel + 1}）</span>
        </div>
        <div className="text-[11px] mt-1" style={{ color: '#886153' }}>
          能力加成 +{OFFICE_TIER_BONUS[officeLevel] ?? 0}，隊伍上限 {OFFICE_TIER_CAP[officeLevel] ?? 3} 位
        </div>
      </div>

      {atMax ? (
        <div className="p-3 rounded-xl text-center" style={{ ...cardStyle, color: '#6f966d' }}>
          <strong>已達最高等級</strong>
        </div>
      ) : (
        <>
          {task && (
            <div
              className="p-3 rounded-xl"
              style={{
                ...cardStyle,
                background:
                  'linear-gradient(180deg, rgba(255,254,254,0.7), rgba(255,232,233,0.58)), repeating-linear-gradient(0deg, rgba(186,121,82,0.05) 0 1px, transparent 1px 15px)',
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="font-bold flex items-center gap-1.5" style={{ color: '#5b382d' }}>
                  <span>特殊任務</span>
                  <span className="text-[11px] font-normal" style={{ color: '#886153' }}>
                    升級前置
                  </span>
                </div>
                {taskCompleted && <StatusPill color="#6f966d">已完成</StatusPill>}
                {taskInProgress && <StatusPill color="#d74e63">進行中</StatusPill>}
                {taskAvailable && <StatusPill color="#c87e78">可開始</StatusPill>}
              </div>
              <div className="text-sm font-bold" style={{ color: '#5b382d' }}>
                {task.name}
              </div>
              {taskAvailable && (
                <>
                  <div className="text-[11px] mt-1" style={{ color: '#886153' }}>
                    派出 team 累積工作量完成挑戰。基準：全員 Lv{SPECIAL_TASK_BASELINE_LEVEL[targetLevel]} 約 {SPECIAL_TASK_BASE_DAYS[targetLevel]} 天。
                  </div>
                  <button
                    onClick={() => startSpecialTask(targetLevel)}
                    className="mt-2 w-full text-sm font-bold py-1.5 rounded-lg"
                    style={{
                      background: 'linear-gradient(180deg, #f7b267, #c87e78)',
                      color: 'white',
                      border: '1px solid rgba(208,130,105,0.42)',
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
                      background: 'rgba(255,255,255,0.42)',
                      borderRadius: 999,
                      overflow: 'hidden',
                      border: '1px solid rgba(214,145,150,0.26)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPct}%`,
                        background: 'linear-gradient(90deg, #f7b267, #d74e63)',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] font-bold" style={{ color: '#6e4638' }}>
                    <span>{Math.round(safeWorkDone)} / {safeWorkRequired} 工作量</span>
                    <span>{remainingLabel}</span>
                  </div>
                  <div className="text-[10px]" style={{ color: '#886153' }}>
                    每日隊伍能力：{Math.round(currentAbility * 10) / 10}
                  </div>
                </>
              )}
              {taskCompleted && (
                <div className="text-[11px] mt-1" style={{ color: '#6f966d' }}>
                  任務完成，可以進行辦公室升級。
                </div>
              )}
            </div>
          )}

          <div className="p-3 rounded-xl" style={{ ...cardStyle, opacity: taskCompleted ? 1 : 0.82 }}>
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="font-bold flex items-center gap-1.5" style={{ color: '#5b382d' }}>
                  <SvgIcon name="office" size={19} />
                  <span>升級到 {nextLv.name}</span>
                </div>
                <div className="flex flex-col gap-0.5 mt-1.5">
                  {benefits.map((b, i) => (
                    <div key={i} className="text-[11px]" style={{ color: '#886153' }}>{b}</div>
                  ))}
                  {!taskCompleted && (
                    <div className="text-[11px] font-bold" style={{ color: '#d74e63' }}>
                      需要先完成特殊任務
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
                    ? 'linear-gradient(180deg, #f7b267, #c87e78)'
                    : 'rgba(255,240,237,0.58)',
                  color: canUpgrade ? 'white' : '#a98a80',
                  border: '1px solid rgba(208,130,105,0.32)',
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

function StatusPill({ color, children }: { color: string; children: string }) {
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: color, color: 'white' }}
    >
      {children}
    </span>
  );
}
