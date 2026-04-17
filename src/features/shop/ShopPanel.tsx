import { useGameStore } from '@/store/gameStore';
import { SHOP_ITEMS } from '@/constants/shopItems';

export function ShopPanel() {
  const money = useGameStore((s) => s.money);
  const buy = useGameStore((s) => s.buyShopItem);

  return (
    <div className="flex flex-col gap-2.5">
      {SHOP_ITEMS.map((item) => {
        const canAfford = money >= item.cost;
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
              <div className="font-bold">{item.name}</div>
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
