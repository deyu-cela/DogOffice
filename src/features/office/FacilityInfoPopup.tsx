import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUiStore } from '@/store/uiStore';
import { useGameStore, MAX_SHOP_LEVEL } from '@/store/gameStore';
import { SHOP_ITEMS } from '@/constants/shopItems';
import type { ShopItemEffectKey } from '@/types';
import { ToolInventoryModal } from '@/features/staff/ToolInventoryModal';

function describeEffect(id: ShopItemEffectKey, lv: number): string[] {
  if (lv <= 0) return ['尚未購置，前往商店購買後生效。'];
  switch (id) {
    case 'desk':
      return [`全 team 案件速度 +${lv}`];
    case 'policy':
      return [`工程 專業 +${lv}`, `工程 速度 +${lv}`];
    case 'artwall':
      return [`美術 專業 +${lv}`, `美術 速度 +${lv}`];
    case 'lamp':
      return [`每日疲勞恢復 +${lv}`];
    case 'coffee':
      return [`客服 專業 +${lv}`, `客服 速度 +${lv}`];
    case 'snack':
      return [`行銷 專業 +${lv}`, `行銷 速度 +${lv}`];
    case 'toy':
      return ['可愛裝飾，目前無數值效果。'];
    case 'gym':
      return [`全員 耐心 +${lv}（疲勞累積變慢）`];
    case 'sofa':
      return [`每日全員疲勞 −${3 + lv * 2}`];
    default:
      return [];
  }
}

export function FacilityInfoPopup() {
  const id = useUiStore((s) => s.facilityInfoId);
  const close = useUiStore((s) => s.closeFacilityInfo);
  const level = useGameStore((s) => (id ? s.purchases[id] ?? 0 : 0));

  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, close]);

  if (!id) return null;
  // 狗狗玩具區改用工具庫存介面
  if (id === 'toy') {
    return <ToolInventoryModal onClose={close} />;
  }
  const item = SHOP_ITEMS.find((i) => i.id === id);
  if (!item) return null;

  const lines = describeEffect(id, level);
  const isMax = level >= MAX_SHOP_LEVEL;

  return createPortal(
    <div
      className="fixed inset-0 z-[840] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,32,77,0.35)' }}
      onClick={close}
    >
      <div
        className="rounded-2xl w-full max-w-xs flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #ffffff, #f5fbff)',
          border: '1px solid var(--line)',
          boxShadow: '0 16px 40px rgba(30,90,180,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="font-extrabold text-base" style={{ color: 'var(--text)' }}>
            {item.name}
          </div>
          <span
            className="text-[11px] px-2 py-0.5 rounded-md font-bold"
            style={{
              background: isMax ? '#dff8ef' : '#eef6ff',
              color: isMax ? '#16926f' : 'var(--blue)',
              border: '1px solid var(--line)',
            }}
          >
            {isMax ? '滿級' : `等級 ${level}/${MAX_SHOP_LEVEL}`}
          </span>
        </div>

        <div className="px-4 py-3 flex flex-col gap-2">
          <div className="text-[12px]" style={{ color: 'var(--muted)' }}>
            {item.desc}
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="text-[11px] font-bold" style={{ color: 'var(--text)' }}>
              目前效果
            </div>
            {lines.map((line, i) => (
              <div
                key={i}
                className="text-[12px] px-2.5 py-1.5 rounded-md font-bold"
                style={{
                  background: level > 0 ? '#eefaf7' : '#f3f7ff',
                  color: level > 0 ? '#16926f' : 'var(--muted)',
                  border: '1px solid var(--line)',
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 pb-3 pt-1">
          <button
            type="button"
            onClick={close}
            className="text-sm w-full py-2 rounded-lg"
            style={{
              background: '#f4f9ff',
              color: 'var(--text)',
              border: '1px solid var(--line)',
            }}
          >
            關閉
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
