import { SHOP_ITEMS } from '@/constants/shopItems';
import { MAX_SHOP_LEVEL, nextShopCost, useGameStore } from '@/store/gameStore';

export function ShopPanel() {
  const money = useGameStore((s) => s.money);
  const purchases = useGameStore((s) => s.purchases);
  const buy = useGameStore((s) => s.buyShopItem);

  return (
    <div className="flex flex-col gap-2.5">
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
