import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUiStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { SvgIcon } from '@/components/SvgIcon';
import { ShopPanel } from './ShopPanel';

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
      className="fixed inset-0 z-[850] flex items-center justify-center p-4"
      style={{
        background: 'rgba(91,56,45,0.32)',
        backdropFilter: 'blur(8px) saturate(1.04)',
        WebkitBackdropFilter: 'blur(8px) saturate(1.04)',
      }}
      onClick={close}
    >
      <div
        className="rounded-xl w-full overflow-hidden flex flex-col"
        style={{
          maxWidth: 880,
          maxHeight: '90vh',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,247,239,0.9)), repeating-linear-gradient(0deg, rgba(186,121,82,0.07) 0 1px, transparent 1px 18px), #f7d6bf',
          border: '1px solid rgba(208,130,105,0.38)',
          boxShadow: '0 24px 70px rgba(72,40,34,0.24)',
          backdropFilter: 'blur(10px) saturate(1.04)',
          WebkitBackdropFilter: 'blur(10px) saturate(1.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b" style={{ borderColor: 'rgba(190,117,105,0.36)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <SvgIcon name="shop" size={24} />
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
              className="text-sm font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1"
              style={{ background: 'rgba(255,244,220,0.72)', color: '#b97428', border: '1px solid rgba(231,157,83,0.42)' }}
            >
              <SvgIcon name="money" size={16} />${money}
            </span>
            <button
              type="button"
              onClick={close}
              className="text-sm px-3 py-1.5 rounded-xl whitespace-nowrap"
              style={{
                background: 'linear-gradient(180deg, rgba(255,254,254,0.76), rgba(255,232,233,0.62))',
                color: '#cf405b',
                border: '1px solid rgba(229,116,132,0.32)',
              }}
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
