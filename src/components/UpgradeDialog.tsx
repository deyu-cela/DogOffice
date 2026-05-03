import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { MAX_SHOP_LEVEL, nextShopCost, useGameStore } from '@/store/gameStore';
import { SHOP_ITEMS } from '@/constants/shopItems';
import { describeShopEffect, FACILITY_ART_BY_ID, SHOP_ENGLISH_LABEL } from '@/lib/shopEffects';
import type { ShopItemEffectKey } from '@/types';
import './upgradeDialog.css';

export function UpgradeDialog({
  itemId,
  onClose,
}: {
  itemId: ShopItemEffectKey;
  onClose: () => void;
}) {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  const level = useGameStore((s) => s.purchases[itemId] ?? 0);
  const money = useGameStore((s) => s.money);
  const buy = useGameStore((s) => s.buyShopItem);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!item) return null;

  const cap = item.maxLevel ?? MAX_SHOP_LEVEL;
  const isMax = level >= cap;
  const cost = isMax ? 0 : nextShopCost(item.cost, level);
  const canAfford = !isMax && money >= cost;
  const currentLines = level > 0 ? describeShopEffect(itemId, level) : ['尚未購置'];
  const nextLines = isMax ? [] : describeShopEffect(itemId, level + 1);

  function handleUpgrade() {
    if (isMax || !canAfford) return;
    buy(itemId);
  }

  const primaryLabel = isMax ? '已滿級' : !canAfford ? '金錢不足' : '升級';
  const englishLabel = SHOP_ENGLISH_LABEL[itemId] ?? itemId.toUpperCase();

  return createPortal(
    <div
      className="upg-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upg-title"
      onClick={onClose}
    >
      <div className="upg-stack" onClick={(e) => e.stopPropagation()}>
        <div className="upg-back upg-back--pink" aria-hidden="true" />
        <div className="upg-back upg-back--cream" aria-hidden="true" />
        <div className="upg-card">
          <span className="upg-tape upg-tape--pink" aria-hidden="true" />
          <span className="upg-tape upg-tape--blue" aria-hidden="true" />
          <button type="button" onClick={onClose} aria-label="關閉" className="upg-close">×</button>

          <div className="upg-header">
            <div className="upg-polaroid">
              <div className="upg-polaroid__art">
                <img src={FACILITY_ART_BY_ID[itemId]} alt="" draggable={false} />
              </div>
              <div className="upg-polaroid__label">{englishLabel}</div>
            </div>

            <div className="upg-title-block">
              <div className="upg-eyebrow">UPGRADE · 升級</div>
              <div id="upg-title" className="upg-title">{item.name}</div>
              <div className={`upg-lvpill${isMax ? ' upg-lvpill--max' : ''}`}>
                <span className="upg-lvpill__star">★</span>
                {isMax ? `滿級 ${cap} / ${cap}` : `等級 ${level} → ${level + 1}`}
              </div>
            </div>
          </div>

          <div>
            <div className="upg-stairs" aria-label={`升級進度 ${level}/${cap}`}>
              {Array.from({ length: cap }).map((_, i) => {
                const filled = i < level;
                const isNext = !isMax && i === level;
                const cls = filled ? 'upg-step--filled' : isNext ? 'upg-step--next' : 'upg-step--locked';
                const w = 22 + (filled || isNext ? 4 : 0);
                const h = 22 + i * 4;
                return (
                  <div
                    key={i}
                    className={`upg-step ${cls}`}
                    style={{ width: w, height: h }}
                  >
                    {filled ? '★' : isNext ? '★' : i + 1}
                  </div>
                );
              })}
            </div>
            <div className="upg-stairs-label">LV {level} / {cap}</div>
          </div>

          {!isMax ? (
            <div className="upg-compare">
              <div className="upg-effect upg-effect--current">
                <div className="upg-effect__label">目前 LV {level}</div>
                <div className="upg-effect__lines">
                  {currentLines.map((line, i) => <div key={i}>{line}</div>)}
                </div>
              </div>
              <div className="upg-arrow" aria-hidden="true">→</div>
              <div className="upg-effect upg-effect--next">
                <div className="upg-effect__new">NEW</div>
                <div className="upg-effect__label">升級後 LV {level + 1}</div>
                <div className="upg-effect__lines">
                  {nextLines.map((line, i) => <div key={i}>{line}</div>)}
                </div>
              </div>
            </div>
          ) : (
            <div className="upg-compare upg-compare--max">
              <div className="upg-effect upg-effect--next">
                <div className="upg-effect__label">最終 LV {cap}</div>
                <div className="upg-effect__lines">
                  {currentLines.map((line, i) => <div key={i}>{line}</div>)}
                </div>
              </div>
            </div>
          )}

          {isMax ? (
            <div className="upg-cost upg-cost--max">
              <span className="upg-cost__max-badge">★ MAX ★</span>
            </div>
          ) : (
            <div className="upg-cost">
              <span className="upg-cost__label">升級花費</span>
              <span className={`upg-cost__amt${!canAfford ? ' upg-cost__amt--insufficient' : ''}`}>
                ${cost}
              </span>
            </div>
          )}

          <div className="upg-actions">
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={isMax || !canAfford}
              className="upg-btn upg-btn--primary"
            >
              <span>★</span>
              {primaryLabel}
            </button>
            <button type="button" onClick={onClose} className="upg-btn upg-btn--secondary">
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
