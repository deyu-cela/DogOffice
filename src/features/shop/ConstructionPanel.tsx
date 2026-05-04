import { SvgIcon } from '@/components/SvgIcon';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { SHOP_ITEMS } from '@/constants/shopItems';
import {
  estimateSpecialTaskRemainingDays,
  MAX_SHOP_LEVEL,
  OFFICE_DAILY_EXPENSE,
  teamTotalAbility,
  useGameStore,
} from '@/store/gameStore';
import './shop.css';

const cardStyle: React.CSSProperties = {
  color: '#5b382d',
};

export function ConstructionPanel() {
  const money = useGameStore((s) => s.money);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const upgrade = useGameStore((s) => s.upgradeOffice);
  const specialTasks = useGameStore((s) => s.specialTasks);
  const startSpecialTask = useGameStore((s) => s.startSpecialTask);
  const purchases = useGameStore((s) => s.purchases);

  const curLv = OFFICE_LEVELS[officeLevel];
  const nextLv = OFFICE_LEVELS[officeLevel + 1];
  const atMax = !nextLv;
  const curUpkeep = OFFICE_DAILY_EXPENSE[officeLevel] ?? 0;
  const nextUpkeep = OFFICE_DAILY_EXPENSE[officeLevel + 1] ?? 0;

  const targetLevel = officeLevel + 1;
  const task = specialTasks?.[targetLevel];
  const taskCompleted = task?.status === 'completed';
  const taskInProgress = task?.status === 'inProgress';
  const taskAvailable = task?.status === 'available';

  const requiredItems = nextLv?.requiredItems ?? [];
  const requiredItemStatuses = requiredItems.map((id) => {
    const item = SHOP_ITEMS.find((i) => i.id === id);
    return { id, name: item?.name ?? id, owned: (purchases[id] ?? 0) >= 1 };
  });
  const itemsReady = requiredItemStatuses.every((it) => it.owned);

  const requireAllShopMax = nextLv?.requireAllShopMax ?? false;
  const shopMaxStatuses = requireAllShopMax
    ? SHOP_ITEMS.map((item) => {
        const cap = item.maxLevel ?? MAX_SHOP_LEVEL;
        const lv = purchases[item.id] ?? 0;
        return { id: item.id, name: item.name, lv, cap, ready: lv >= cap };
      })
    : [];
  const shopMaxReady = !requireAllShopMax || shopMaxStatuses.every((it) => it.ready);

  const canUpgrade =
    !atMax && taskCompleted && itemsReady && shopMaxReady && money >= (nextLv?.upgradeCost ?? 0);
  const canStartTask = !atMax && taskAvailable && itemsReady && shopMaxReady;

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
      <div className="shop-paper-card shop-paper-card--yellow" style={cardStyle}>
        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#5b382d' }}>
          <SvgIcon name="office" size={20} />
          <span>目前辦公室：{curLv.name}（Lv.{officeLevel + 1}）</span>
        </div>
        <div className="text-[11px] mt-1" style={{ color: '#886153' }}>
          每日維護成本 ${curUpkeep}
        </div>
      </div>

      {atMax ? (
        <div className="shop-paper-card text-center" style={{ ...cardStyle, color: '#6f966d' }}>
          <strong>已達最高等級</strong>
        </div>
      ) : (
        <>
          {requiredItemStatuses.length > 0 && (
            <div className="shop-paper-card" style={cardStyle}>
              <div className="font-bold flex items-center gap-1.5" style={{ color: '#5b382d' }}>
                <span>升級條件</span>
                {itemsReady ? (
                  <StatusPill color="#6f966d">已滿足</StatusPill>
                ) : (
                  <StatusPill color="#c87e78">未滿足</StatusPill>
                )}
              </div>
              <div className="flex flex-col gap-0.5 mt-1.5">
                {requiredItemStatuses.map((it) => (
                  <div
                    key={it.id}
                    className="text-[11px] font-bold"
                    style={{ color: it.owned ? '#6f966d' : '#d74e63' }}
                  >
                    {it.owned ? '✓' : '✗'} 已購買「{it.name}」
                  </div>
                ))}
              </div>
            </div>
          )}

          {requireAllShopMax && (
            <div className="shop-paper-card" style={cardStyle}>
              <div className="font-bold flex items-center gap-1.5" style={{ color: '#5b382d' }}>
                <span>升級條件：商店全升滿</span>
                {shopMaxReady ? (
                  <StatusPill color="#6f966d">已滿足</StatusPill>
                ) : (
                  <StatusPill color="#c87e78">未滿足</StatusPill>
                )}
              </div>
              <div className="flex flex-col gap-0.5 mt-1.5">
                {shopMaxStatuses.map((it) => (
                  <div
                    key={it.id}
                    className="text-[11px] font-bold"
                    style={{ color: it.ready ? '#6f966d' : '#d74e63' }}
                  >
                    {it.ready ? '✓' : '✗'} 「{it.name}」 Lv.{it.lv}/{it.cap}
                  </div>
                ))}
              </div>
            </div>
          )}

          {task && (
            <div
              className="shop-paper-card shop-paper-card--pink"
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
                    {!itemsReady
                      ? '需要先滿足升級條件才能開始任務。'
                      : !shopMaxReady
                        ? '需要把商店所有設施升到滿級才能開始任務。'
                        : '派出 team 累積工作量完成挑戰。'}
                  </div>
                  <button
                    disabled={!canStartTask}
                    onClick={() => startSpecialTask(targetLevel)}
                    className="shop-action-btn mt-2 w-full text-sm font-bold py-1.5"
                    style={{ cursor: canStartTask ? 'pointer' : 'not-allowed' }}
                  >
                    開始任務
                  </button>
                </>
              )}
              {taskInProgress && (
                <>
                  <div className="shop-progress-track mt-2">
                    <div
                      className="shop-progress-fill"
                      style={{
                        width: `${progressPct}%`,
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

          <div
            className="shop-paper-card"
            style={{ ...cardStyle, opacity: taskCompleted && itemsReady && shopMaxReady ? 1 : 0.82 }}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="font-bold flex items-center gap-1.5" style={{ color: '#5b382d' }}>
                  <SvgIcon name="office" size={19} />
                  <span>升級到 {nextLv.name}</span>
                </div>
                <div className="flex flex-col gap-0.5 mt-1.5">
                  <div className="text-[11px]" style={{ color: '#886153' }}>
                    每日維護成本 ${nextUpkeep}
                  </div>
                  {!itemsReady && (
                    <div className="text-[11px] font-bold" style={{ color: '#d74e63' }}>
                      需要先滿足升級條件
                    </div>
                  )}
                  {itemsReady && !shopMaxReady && (
                    <div className="text-[11px] font-bold" style={{ color: '#d74e63' }}>
                      需要把商店所有設施升到滿級
                    </div>
                  )}
                  {itemsReady && shopMaxReady && !taskCompleted && (
                    <div className="text-[11px] font-bold" style={{ color: '#d74e63' }}>
                      需要先完成特殊任務
                    </div>
                  )}
                </div>
              </div>
              <button
                disabled={!canUpgrade}
                onClick={upgrade}
                className="shop-action-btn text-sm px-3"
                style={{ cursor: canUpgrade ? 'pointer' : 'not-allowed' }}
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
