import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUiStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { SvgIcon } from '@/components/SvgIcon';
import { ShopPanel } from './ShopPanel';
import './shop.css';

export function ShopModal() {
  const open = useUiStore((s) => s.shopModalOpen);
  const close = useUiStore((s) => s.closeShopModal);
  const money = useGameStore((s) => s.money);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  return createPortal(
    <div
      className="shop-scrapbook-backdrop fixed inset-0 z-[850] flex items-center justify-center p-4"
      onClick={close}
    >
      <div
        className="shop-scrapbook-modal w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shop-scrapbook-header flex items-start justify-between gap-3 px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shop-scrapbook-pin" aria-hidden />
            <span className="shop-scrapbook-icon">
              <SvgIcon name="shop" size={22} />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-extrabold truncate" style={{ color: '#5b382d' }}>
                商店
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: '#886153' }}>
                每樣設施對應不同職業，提升該 team 的產能。休息區每日全員回復疲勞。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="shop-money-chip text-sm font-extrabold px-3 py-1.5 flex items-center gap-1"
            >
              <SvgIcon name="money" size={16} />${money}
            </span>
            <button
              type="button"
              onClick={close}
              className="shop-close-btn text-sm px-3 py-1.5 whitespace-nowrap"
            >
              關閉
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ShopPanel />
        </div>
      </div>
    </div>,
    document.body,
  );
}
