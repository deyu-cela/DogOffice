import { SHOP_ITEMS } from '@/constants/shopItems';
import { MAX_SHOP_LEVEL, nextShopCost, useGameStore } from '@/store/gameStore';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';
import type { ProjectCategory, ShopItemEffectKey } from '@/types';

const ICON_BY_ID: Record<ShopItemEffectKey, SvgIconName> = {
  snack: 'shopSnack',
  toy: 'shopToy',
  desk: 'shopDesk',
  policy: 'shopPolicy',
  lamp: 'shopLamp',
  sofa: 'shopSofa',
  artwall: 'shopArtwall',
  coffee: 'shopCoffee',
  gym: 'shopGym',
};

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
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {SHOP_ITEMS.map((item) => {
        const level = purchases[item.id] ?? 0;
        const isMax = level >= MAX_SHOP_LEVEL;
        const cost = nextShopCost(item.cost, level);
        const canAfford = !isMax && money >= cost;
        const buttonLabel = isMax ? '已滿級' : `$${cost}`;
        const cs = CATEGORY_STYLE[item.category];
        return (
          <div
            key={item.id}
            className="p-3 rounded-xl flex flex-col gap-2"
            style={{
              background: isMax
                ? 'rgba(223,238,218,0.62)'
                : canAfford
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,247,239,0.66))'
                  : 'rgba(255,240,237,0.48)',
              border: isMax
                ? '1px solid rgba(158,194,156,0.46)'
                : '1px solid rgba(208,130,105,0.3)',
              boxShadow: '0 8px 16px rgba(166,91,85,0.08), inset 0 0 0 1px rgba(255,255,255,0.42)',
              backdropFilter: 'blur(6px) saturate(1.02)',
              WebkitBackdropFilter: 'blur(6px) saturate(1.02)',
            }}
          >
            <div
              className="rounded-lg w-full aspect-square flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.24)', border: '1px dashed rgba(214,145,150,0.26)' }}
            >
              <SvgIcon name={ICON_BY_ID[item.id]} size={48} />
            </div>

            <div className="font-extrabold text-[14px] leading-tight" style={{ color: '#5b382d' }}>
              {item.name}
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                style={{
                  color: cs.color,
                  background: cs.bg,
                  border: `1px solid ${cs.color}44`,
                }}
              >
                {cs.label}
              </span>
              <span
                className="text-[11px] px-1.5 py-0.5 rounded-md font-bold"
                style={{
                  background: isMax ? 'rgba(223,238,218,0.72)' : 'rgba(255,247,239,0.66)',
                  color: isMax ? '#6f966d' : '#6e4638',
                  border: '1px solid rgba(208,130,105,0.28)',
                }}
              >
                {isMax ? '滿級' : `Lv ${level}/${MAX_SHOP_LEVEL}`}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {item.id === 'sofa' ? (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-md font-bold w-fit"
                  style={{ background: 'rgba(223,238,218,0.68)', color: '#6f966d' }}
                >
                  每日疲勞 -{3 + Math.max(level, 1) * 2}
                </span>
              ) : (
                item.statTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-md font-bold w-fit"
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
              disabled={isMax || !canAfford}
              onClick={() => buy(item.id)}
              className="text-sm font-bold py-2 rounded-lg w-full mt-auto"
              style={{
                background: isMax
                  ? 'rgba(223,238,218,0.72)'
                  : canAfford
                    ? 'linear-gradient(180deg, #f7b267, #c87e78)'
                    : 'rgba(255,240,237,0.58)',
                color: isMax ? '#6f966d' : canAfford ? '#fffdf8' : '#a98a80',
                border: '1px solid rgba(208,130,105,0.32)',
                cursor: isMax || !canAfford ? 'not-allowed' : 'pointer',
              }}
              title={isMax ? '已升到最高等級' : level === 0 ? `購買 $${cost}` : `升級到 ${level + 1}，花費 $${cost}`}
            >
              {buttonLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
}
