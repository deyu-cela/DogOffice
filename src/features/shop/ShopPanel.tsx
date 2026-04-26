import { useGameStore } from '@/store/gameStore';
import { SHOP_ITEMS } from '@/constants/shopItems';
import { OFFICE_LEVELS } from '@/constants/officeLevels';

const OFFICE_TIER_BONUS = [0, 5, 12, 22, 35];
const OFFICE_TIER_CAP = [3, 3, 4, 4, 5];

function upgradeBenefits(curLv: number): string[] {
  const next = curLv + 1;
  const benefits: string[] = [];
  const curMax = OFFICE_LEVELS[curLv].maxStaff;
  const nextMax = OFFICE_LEVELS[next].maxStaff;
  if (nextMax > curMax) benefits.push(`👥 員工上限 +${nextMax - curMax}（→${nextMax}）`);
  const curBonus = OFFICE_TIER_BONUS[curLv] ?? 0;
  const nextBonus = OFFICE_TIER_BONUS[next] ?? 0;
  if (nextBonus > curBonus) benefits.push(`✨ 稀有度 +${nextBonus - curBonus}`);
  const curCap = OFFICE_TIER_CAP[curLv] ?? 3;
  const nextCap = OFFICE_TIER_CAP[next] ?? 3;
  if (nextCap > curCap) benefits.push(`⏫ 解鎖 tier${nextCap} 案件`);
  if (next === 3) benefits.push('🏆 達成 IPO 條件之一');
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
        <div
          className="p-3 rounded-2xl text-center"
          style={{ background: '#e8f5e9', border: '2px solid #66bb6a' }}
        >
          <strong>🎉 已達最大規模！</strong>
        </div>
      ) : (
        <div
          className="p-3 rounded-2xl"
          style={{ background: 'linear-gradient(135deg,#fff0f3,#fbd5db)', border: '2px solid #f4a8b8' }}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <div className="font-bold">🏗️ 擴建 → {nextLv.name}</div>
              <div className="flex flex-col gap-0.5 mt-1.5">
                {benefits.map((b, i) => (
                  <div key={i} className="text-[11px]" style={{ color: '#7a3a4a' }}>
                    {b}
                  </div>
                ))}
              </div>
            </div>
            <button
              disabled={money < nextLv.upgradeCost}
              onClick={upgrade}
              className="text-sm px-3"
              style={{ background: money >= nextLv.upgradeCost ? 'linear-gradient(180deg, #b6efab, #8ee28f)' : '#eee' }}
            >
              ${nextLv.upgradeCost}
            </button>
          </div>
        </div>
      )}
      {SHOP_ITEMS.map((item) => {
        const canAfford = money >= item.cost;
        const count = purchases[item.id] ?? 0;
        return (
          <div
            key={item.id}
            className="p-3 rounded-2xl"
            style={{
              background: canAfford ? 'rgba(255,255,255,0.9)' : 'rgba(240,234,222,0.6)',
              border: '1px solid rgba(90,70,54,0.12)',
            }}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="font-bold flex items-center gap-1.5">
                <span>{item.name}</span>
                {count > 0 && (
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded-full font-normal"
                    style={{ background: '#fff0f3', color: '#8a6a2a', border: '1px solid rgba(90,70,54,0.08)' }}
                  >
                    已買 ×{count}
                  </span>
                )}
              </div>
              <button
                disabled={!canAfford}
                onClick={() => buy(item.id)}
                className="text-sm px-3"
                style={{ background: canAfford ? 'linear-gradient(180deg, #b6efab, #8ee28f)' : '#eee' }}
              >
                ${item.cost}
              </button>
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              {item.desc}
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2">
              {item.statTags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{
                    background: tag.type === 'up' ? '#e8f5e9' : '#ffebee',
                    color: tag.type === 'up' ? '#388e3c' : '#c62828',
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
