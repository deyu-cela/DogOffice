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
  tech: { label: '工程', color: '#1d5fb8', bg: '#eaf2ff' },
  design: { label: '美術', color: '#7b61ff', bg: '#f1ebff' },
  marketing: { label: '行銷', color: '#f6a63a', bg: '#fff1e0' },
  service: { label: '客服', color: '#16a77f', bg: '#e9faf2' },
  all: { label: '全員', color: '#5b6b85', bg: '#f3f7ff' },
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
            className="p-3 rounded-2xl flex flex-col gap-2"
            style={{
              background: isMax ? '#eefaf7' : canAfford ? '#ffffff' : '#f3f7ff',
              border: isMax
                ? '1px solid rgba(51,194,154,0.32)'
                : '1px solid var(--line)',
              boxShadow: '0 2px 6px rgba(30,90,180,0.06)',
            }}
          >
            <div
              className="rounded-xl w-full aspect-square flex items-center justify-center"
              style={{ background: cs.bg }}
            >
              <SvgIcon name={ICON_BY_ID[item.id]} size={48} />
            </div>

            <div className="font-extrabold text-[14px] leading-tight" style={{ color: 'var(--text)' }}>
              {item.name}
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                style={{
                  color: cs.color,
                  background: cs.bg,
                  border: `1px solid ${cs.color}33`,
                }}
              >
                {cs.label}
              </span>
              <span
                className="text-[11px] px-1.5 py-0.5 rounded-md font-bold"
                style={{
                  background: isMax ? '#dff8ef' : '#eef6ff',
                  color: isMax ? '#16926f' : 'var(--blue)',
                  border: '1px solid var(--line)',
                }}
              >
                {isMax ? '滿級' : `等級 ${level}/${MAX_SHOP_LEVEL}`}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {item.id === 'sofa' ? (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-md font-bold w-fit"
                  style={{ background: '#e9faf2', color: '#16926f' }}
                >
                  每日疲勞 −{3 + Math.max(level, 1) * 2}
                </span>
              ) : (
                item.statTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-md font-bold w-fit"
                    style={{
                      background: tag.type === 'up' ? '#eefaf7' : '#fff7f7',
                      color: tag.type === 'up' ? '#16926f' : '#d34a4a',
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
                  ? '#dff8ef'
                  : canAfford
                    ? 'linear-gradient(180deg, #35c59c, #16a77f)'
                    : '#e9f1ff',
                color: isMax ? '#16926f' : canAfford ? 'white' : '#8aa2c8',
                border: '1px solid var(--line)',
                cursor: isMax || !canAfford ? 'not-allowed' : 'pointer',
              }}
              title={
                isMax
                  ? '此設施已滿級'
                  : level === 0
                    ? `首次購置 $${cost}`
                    : `升級至 等級 ${level + 1}（成本 $${cost}）`
              }
            >
              {buttonLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
}
