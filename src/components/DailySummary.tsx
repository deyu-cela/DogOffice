import { useEffect } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
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

  const hasContent =
    summary.completedCount > 0 ||
    summary.failedCount > 0 ||
    summary.levelUps.length > 0 ||
    summary.bankruptCountdown > 0;
  if (!hasContent) return null;

  const cashColor = summary.cashDelta >= 0 ? '#16926f' : '#d34a4a';
  const repColor = summary.reputationDelta >= 0 ? '#16926f' : '#d34a4a';

  return (
    <>
      <style>{`
        @keyframes summarySlideIn { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
      <div
        className="fixed top-16 left-1/2 z-[480] px-4 py-3 rounded-xl"
        style={{
          transform: 'translateX(-50%)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 14px 34px rgba(30,90,180,0.18)',
          animation: 'summarySlideIn 0.3s ease-out',
          minWidth: 280,
          maxWidth: 360,
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
            <SvgIcon name="log" size={16} />
            第 {summary.day - 1} 天結算
          </span>
          <button
            type="button"
            onClick={dismiss}
            className="text-[10px] px-1.5 rounded-md"
            style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
          >
            X
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] mb-1">
          <span style={{ color: 'var(--muted)' }}>現金流</span>
          <span className="font-extrabold" style={{ color: cashColor }}>
            {summary.cashDelta >= 0 ? '+' : ''}${summary.cashDelta}
          </span>
        </div>
        <div className="text-[10px] mb-1.5" style={{ color: 'var(--muted)' }}>
          收入 ${summary.income} - 支出 ${summary.expense}
        </div>

        {(summary.completedCount > 0 || summary.failedCount > 0) && (
          <div className="flex gap-2 mb-1 text-[11px]">
            {summary.completedCount > 0 && (
              <span className="px-2 py-0.5 rounded-md font-bold" style={{ background: '#eefaf7', color: '#16926f' }}>
                完成 {summary.completedCount}
              </span>
            )}
            {summary.failedCount > 0 && (
              <span className="px-2 py-0.5 rounded-md font-bold" style={{ background: '#fff7f7', color: '#d34a4a' }}>
                失敗 {summary.failedCount}
              </span>
            )}
          </div>
        )}

        {summary.reputationDelta !== 0 && (
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span style={{ color: 'var(--muted)' }}>信譽</span>
            <span className="font-bold" style={{ color: repColor }}>
              {summary.reputationDelta >= 0 ? '+' : ''}{summary.reputationDelta}
            </span>
          </div>
        )}

        {summary.levelUps.length > 0 && (
          <div className="text-[11px] mb-1">
            {summary.levelUps.map((u, i) => (
              <div key={i} className="flex items-center gap-1.5" style={{ color: 'var(--blue)' }}>
                <SvgIcon name="quality" size={15} />
                <span><b>{u.name}</b> 升 {u.to} 級</span>
              </div>
            ))}
          </div>
        )}

        {summary.bankruptCountdown > 0 && (
          <div
            className="text-[11px] mt-1.5 px-2 py-1 rounded-md font-bold text-center"
            style={{ background: '#fff7f7', color: '#d34a4a' }}
          >
            資金見底（{summary.bankruptCountdown}/5 天）
          </div>
        )}
      </div>
    </>
  );
}
