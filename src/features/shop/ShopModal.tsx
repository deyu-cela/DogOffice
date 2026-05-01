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
        background: 'rgba(8,32,77,0.55)',
        backdropFilter: 'blur(10px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.1)',
      }}
      onClick={close}
    >
      <div
        className="rounded-2xl w-full overflow-hidden flex flex-col"
        style={{
          maxWidth: 880,
          maxHeight: '90vh',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <SvgIcon name="shop" size={24} />
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-extrabold truncate" style={{ color: 'var(--text)' }}>
                商店
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                每樣設施對應不同職業，提升該 team 的產能。sofa 每日全員回復疲勞。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-sm font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1"
              style={{ background: '#fff8e1', color: '#a36a00', border: '1px solid #f1d57a' }}
            >
              <SvgIcon name="money" size={16} />${money}
            </span>
            <button
              type="button"
              onClick={close}
              className="text-sm px-3 py-1.5 rounded-xl whitespace-nowrap"
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
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ShopPanel />
        </div>
      </div>
    </div>,
    document.body,
  );
}
