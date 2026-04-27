import { SvgIcon } from '@/components/SvgIcon';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { SHOP_ITEMS } from '@/constants/shopItems';
import { MAX_SHOP_LEVEL, nextShopCost, useGameStore } from '@/store/gameStore';

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
  if (nextCap > curCap) benefits.push(`解鎖 tier${nextCap} 案件`);
  if (next === 3) benefits.push('達成 IPO 條件之一');
  return benefits;
}

export function ShopPanel() {
  const money = useGameStore((s) => s.money);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const purchases = useGameStore((s) => s.purchases);
  const buy = useGameStore((s) => s.buyShopItem);
  const upgrade = useGameStore((s) => s.upgradeOffice);

  const nextLv = OFFICE_LEVELS[officeLevel + 1];
  const atMax = !nextLv;
  const benefits = atMax ? [] : upgradeBenefits(officeLevel);

  return (
    <div className="flex flex-col gap-2.5">
      {atMax ? (
        <div className="p-3 rounded-xl text-center" style={{ background: '#eefaf7', border: '1px solid rgba(51,194,154,0.28)' }}>
          <strong>已達最大規模</strong>
        </div>
      ) : (
        <div
          className="p-3 rounded-xl"
          style={{ background: 'linear-gradient(180deg, #ffffff, #eef6ff)', border: '1px solid #7fb2ef', boxShadow: 'var(--shadow-soft)' }}
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
              </div>
            </div>
            <button
              disabled={money < nextLv.upgradeCost}
              onClick={upgrade}
              className="text-sm px-3"
              style={{
                background: money >= nextLv.upgradeCost ? 'linear-gradient(180deg, #2f8df4, #1c63c8)' : '#e9f1ff',
                color: money >= nextLv.upgradeCost ? 'white' : '#8aa2c8',
                border: '1px solid var(--line)',
              }}
            >
              ${nextLv.upgradeCost}
            </button>
          </div>
        </div>
      )}
      {SHOP_ITEMS.map((item) => {
        const level = purchases[item.id] ?? 0;
        const isMax = level >= MAX_SHOP_LEVEL;
        const cost = nextShopCost(item.cost, level);
        const canAfford = !isMax && money >= cost;
        const buttonLabel = isMax ? '已滿級' : `$${cost}`;
        return (
          <div
            key={item.id}
            className="p-3 rounded-xl"
            style={{
              background: isMax ? '#eefaf7' : canAfford ? '#ffffff' : '#f3f7ff',
              border: isMax ? '1px solid rgba(51,194,154,0.28)' : '1px solid var(--line)',
            }}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="font-bold flex items-center gap-1.5 flex-wrap">
                <span>{item.name}</span>
                {level > 0 && (
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded-md font-normal"
                    style={{
                      background: isMax ? '#dff8ef' : '#eef6ff',
                      color: isMax ? '#16926f' : 'var(--blue)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    Lv {level}{isMax ? ' (滿)' : ` / ${MAX_SHOP_LEVEL}`}
                  </span>
                )}
              </div>
              <button
                disabled={isMax || !canAfford}
                onClick={() => buy(item.id)}
                className="text-sm px-3 whitespace-nowrap"
                style={{
                  background: isMax
                    ? '#dff8ef'
                    : canAfford
                      ? 'linear-gradient(180deg, #35c59c, #16a77f)'
                      : '#e9f1ff',
                  color: isMax ? '#16926f' : canAfford ? 'white' : '#8aa2c8',
                  border: '1px solid var(--line)',
                }}
                title={
                  isMax
                    ? '此設施已滿級'
                    : level === 0
                      ? `首次購置 $${cost}`
                      : `升級至 Lv ${level + 1}（成本 $${cost}）`
                }
              >
                {buttonLabel}
              </button>
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2">
              {item.statTags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-md"
                  style={{
                    background: tag.type === 'up' ? '#eefaf7' : '#fff7f7',
                    color: tag.type === 'up' ? '#16926f' : '#d34a4a',
                  }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
