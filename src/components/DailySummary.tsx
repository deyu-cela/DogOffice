import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export function DailySummary() {
  const summary = useGameStore((s) => s.dailySummary);
  const dismiss = useGameStore((s) => s.dismissDailySummary);

  useEffect(() => {
    if (!summary) return;
    const id = setTimeout(() => dismiss(), 3500);
    return () => clearTimeout(id);
  }, [summary, dismiss]);

  if (!summary) return null;

  // 沒事發生（沒結算 / 沒事件 / 沒升級）也不秀，避免每天都跳
  const hasContent =
    summary.completedCount > 0 ||
    summary.failedCount > 0 ||
    summary.levelUps.length > 0 ||
    summary.newEventCount > 0 ||
    summary.bankruptCountdown > 0;
  if (!hasContent) return null;

  const cashColor = summary.cashDelta >= 0 ? '#3a7a3f' : '#c0392b';
  const repColor = summary.reputationDelta >= 0 ? '#3a7a3f' : '#c0392b';

  return (
    <>
      <style>{`
        @keyframes summarySlideIn { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
      <div
        className="fixed top-16 left-1/2 z-[480] px-4 py-3 rounded-2xl"
        style={{
          transform: 'translateX(-50%)',
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid rgba(90,70,54,0.18)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          animation: 'summarySlideIn 0.3s ease-out',
          minWidth: 280,
          maxWidth: 360,
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>
            📅 第 {summary.day - 1} 天結算
          </span>
          <button
            type="button"
            onClick={dismiss}
            className="text-[10px] px-1.5 rounded-full"
            style={{ background: '#eeeae4', color: '#5b3c2b' }}
          >
            ✕
          </button>
        </div>

        {/* 現金流 */}
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span style={{ color: 'var(--muted)' }}>現金流</span>
          <span className="font-extrabold" style={{ color: cashColor }}>
            {summary.cashDelta >= 0 ? '+' : ''}${summary.cashDelta}
          </span>
        </div>
        <div className="text-[10px] mb-1.5" style={{ color: 'var(--muted)' }}>
          收入 ${summary.income} − 支出 ${summary.expense}
        </div>

        {/* 案件結算 */}
        {(summary.completedCount > 0 || summary.failedCount > 0) && (
          <div className="flex gap-2 mb-1 text-[11px]">
            {summary.completedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: '#eef7f0', color: '#2f7a3f' }}>
                ✅ 完成 {summary.completedCount}
              </span>
            )}
            {summary.failedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: '#fff0f0', color: '#c0392b' }}>
                ❌ 失敗 {summary.failedCount}
              </span>
            )}
          </div>
        )}

        {/* 信譽變化 */}
        {summary.reputationDelta !== 0 && (
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span style={{ color: 'var(--muted)' }}>信譽</span>
            <span className="font-bold" style={{ color: repColor }}>
              {summary.reputationDelta >= 0 ? '+' : ''}{summary.reputationDelta}
            </span>
          </div>
        )}

        {/* 員工升級 */}
        {summary.levelUps.length > 0 && (
          <div className="text-[11px] mb-1">
            {summary.levelUps.map((u, i) => (
              <div key={i} style={{ color: '#7a3a4a' }}>
                🎓 <b>{u.name}</b> 升 {u.to} 級
              </div>
            ))}
          </div>
        )}

        {/* 中途事件 */}
        {summary.newEventCount > 0 && (
          <div className="text-[11px]" style={{ color: '#a36a3a' }}>
            ⚠️ 觸發 {summary.newEventCount} 個中途事件待處理
          </div>
        )}

        {/* 破產警告 */}
        {summary.bankruptCountdown > 0 && (
          <div
            className="text-[11px] mt-1.5 px-2 py-1 rounded font-bold text-center"
            style={{ background: '#fff0f0', color: '#c0392b' }}
          >
            🚨 資金見底（{summary.bankruptCountdown}/5 天）
          </div>
        )}
      </div>
    </>
  );
}
