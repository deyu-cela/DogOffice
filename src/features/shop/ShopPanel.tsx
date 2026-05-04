import { SHOP_ITEMS } from '@/constants/shopItems';
import { MAX_SHOP_LEVEL, nextShopCost, useGameStore } from '@/store/gameStore';
import { FACILITY_ART_BY_ID } from '@/lib/shopEffects';
import type { ProjectCategory } from '@/types';
import './shop.css';

type CategoryStyle = { label: string; color: string; bg: string };

const CATEGORY_STYLE: Record<ProjectCategory | 'all', CategoryStyle> = {
  tech: { label: '科技', color: '#b97428', bg: 'rgba(255,244,220,0.62)' },
  design: { label: '設計', color: '#d74e63', bg: 'rgba(255,232,233,0.6)' },
  marketing: { label: '行銷', color: '#c87e78', bg: 'rgba(251,227,220,0.62)' },
  service: { label: '服務', color: '#6f966d', bg: 'rgba(223,238,218,0.62)' },
  all: { label: '全員', color: '#6e4638', bg: 'rgba(255,247,239,0.64)' },
};

export function ShopPanel() {
  const money = useGameStore((s) => s.money);
  const purchases = useGameStore((s) => s.purchases);
  const buy = useGameStore((s) => s.buyShopItem);

  return (
    <div className="shop-grid">
      {SHOP_ITEMS.map((item) => {
        const level = purchases[item.id] ?? 0;
        const cap = item.maxLevel ?? MAX_SHOP_LEVEL;
        const isMax = level >= cap;
        const cost = nextShopCost(item.cost, level);
        const canAfford = !isMax && money >= cost;
        const buttonLabel = isMax ? '已滿級' : `$${cost}`;
        const cs = CATEGORY_STYLE[item.category];
        return (
          <div
            key={item.id}
            className="shop-item-card"
            data-afford={canAfford ? 'true' : 'false'}
            data-max={isMax ? 'true' : 'false'}
          >
            <div
              className="shop-item-art"
            >
              <img
                src={FACILITY_ART_BY_ID[item.id]}
                alt=""
                className="shop-item-art-img"
                draggable={false}
              />
            </div>

            <div className="shop-item-title">
              {item.name}
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <span
                className="shop-pill"
                style={{
                  color: cs.color,
                  background: cs.bg,
                  border: `1px solid ${cs.color}44`,
                }}
              >
                {cs.label}
              </span>
              <span
                className="shop-pill shop-level-pill"
                style={{
                  background: isMax ? 'rgba(223,238,218,0.72)' : undefined,
                  color: isMax ? '#6f966d' : '#6e4638',
                  border: isMax ? '1px solid rgba(158,194,156,0.46)' : undefined,
                }}
              >
                {isMax ? '滿級' : `Lv ${level}/${cap}`}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {item.id === 'sofa' ? (
                <span
                  className="shop-stat-tag"
                  style={{ background: 'rgba(223,238,218,0.68)', color: '#6f966d' }}
                >
                  每日疲勞 -{Math.max(level, 1)}
                </span>
              ) : (
                item.statTags.map((tag, i) => (
                  <span
                    key={i}
                    className="shop-stat-tag"
                    style={{
                      background: tag.type === 'up' ? 'rgba(223,238,218,0.68)' : 'rgba(255,232,233,0.68)',
                      color: tag.type === 'up' ? '#6f966d' : '#d74e63',
                    }}
                  >
                    {tag.label}
                  </span>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => buy(item.id)}
              disabled={isMax || !canAfford}
              className="shop-buy-btn"
              data-state={isMax ? 'max' : canAfford ? 'buy' : 'locked'}
              title={isMax ? '已滿級' : level === 0 ? `購買 $${cost}` : `升級到 ${level + 1}，花費 $${cost}`}
            >
              {buttonLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
}
