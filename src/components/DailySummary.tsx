import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import './dailySummary.css';

export function DailySummary() {
  const summary = useGameStore((s) => s.dailySummary);
  const dismiss = useGameStore((s) => s.dismissDailySummary);
  // 鍛造爐期間遊戲時間繼續推進，但結算彈窗先壓住，避免蓋掉鍛造畫面；
  // 鍛造爐關閉後若還有 summary 才會跳出來，timer 也才開始倒數
  const forgeModalOpen = useUiStore((s) => s.forgeModalOpen);

  useEffect(() => {
    if (!summary) return;
    if (forgeModalOpen) return;
    const id = setTimeout(() => dismiss(), 3500);
    return () => clearTimeout(id);
  }, [summary, dismiss, forgeModalOpen]);

  if (!summary) return null;
  if (forgeModalOpen) return null;

  const hasContent =
    summary.completedCount > 0 ||
    summary.failedCount > 0 ||
    summary.levelUps.length > 0 ||
    summary.bankruptCountdown > 0;
  if (!hasContent) return null;

  const profit = summary.cashDelta >= 0;
  const day = summary.day - 1;
  const variant = profit ? 'profit' : 'loss';
  const amtSign = profit ? '+' : '−';
  const amtAbs = Math.abs(summary.cashDelta);

  return (
    <div className="ds-stack">
      <div className={`ds-back ds-back--${variant}`} aria-hidden="true" />
      <div className="ds-card">
        <span className={`ds-tape ds-tape--${variant}`} aria-hidden="true" />
        <button type="button" onClick={dismiss} aria-label="關閉" className="ds-close">×</button>

        <div className="ds-head">
          <span className={`ds-head__eyebrow ds-head__eyebrow--${variant}`}>DAY</span>
          <span className="ds-head__title">第 {day} 天結算</span>
        </div>

        <div className={`ds-main ds-main--${variant}`}>
          <div>
            <div className="ds-main__label">現金變化</div>
            <div className={`ds-main__amt ds-main__amt--${variant}`}>
              {amtSign}${amtAbs}
            </div>
          </div>
          <div className={`ds-stamp ds-stamp--${variant}`}>
            <span className="ds-stamp__eyebrow">{profit ? '★ DAY ★' : 'DAY'}</span>
            <span className="ds-stamp__big">{day}</span>
            <span className="ds-stamp__sub">{profit ? '達標' : '赤字'}</span>
          </div>
        </div>

        <div className="ds-rows">
          <div className="ds-row ds-row--bordered">
            <span>🐶 收入 / 🦴 支出</span>
            <span>
              <span className="ds-amt-pos">+${summary.income}</span>
              <span> · </span>
              <span className="ds-amt-neg">−${summary.expense}</span>
            </span>
          </div>
          <div className="ds-row">
            <span>✅ 完成任務</span>
            <span className="ds-row__count">{summary.completedCount} 件</span>
          </div>
        </div>

        {(summary.failedCount > 0 || summary.levelUps.length > 0 || summary.bankruptCountdown > 0) && (
          <div className="ds-extras">
            {summary.failedCount > 0 && (
              <div className="ds-chip ds-chip--failed">⚠ 失敗 {summary.failedCount} 件</div>
            )}
            {summary.levelUps.map((u, i) => (
              <div key={i} className="ds-chip ds-chip--levelup">
                ⭐ <b>{u.name}</b> 升到 Lv.{u.to}
              </div>
            ))}
            {summary.bankruptCountdown > 0 && (
              <div className="ds-chip ds-chip--bankrupt">
                資金見底（{summary.bankruptCountdown}/5 天）
              </div>
            )}
          </div>
        )}

        <div className={`ds-sign ds-sign--${variant}`}>
          {profit ? '— 今天也辛苦了 ♡' : '— 明天再加油吧…'}
        </div>
      </div>
    </div>
  );
}
