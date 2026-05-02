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

  const cashColor = summary.cashDelta >= 0 ? '#6f966d' : '#d74e63';

  return (
    <>
      <style>{`
        @keyframes summaryFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        className="px-4 py-3 rounded-xl"
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 950,
          width: 'min(360px, calc(100vw - 32px))',
          color: '#5b382d',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,247,239,0.78)), repeating-linear-gradient(0deg, rgba(186,121,82,0.06) 0 1px, transparent 1px 16px), rgba(247,214,191,0.54)',
          border: '1px solid rgba(208,130,105,0.34)',
          boxShadow: '0 14px 30px rgba(166,91,85,0.14), inset 0 0 0 1px rgba(255,255,255,0.48)',
          backdropFilter: 'blur(8px) saturate(1.04)',
          WebkitBackdropFilter: 'blur(8px) saturate(1.04)',
          animation: 'summaryFadeIn 0.28s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: '#886153' }}>
            <SvgIcon name="log" size={16} />
            第 {summary.day - 1} 天結算
          </span>
          <button
            type="button"
            onClick={dismiss}
            className="text-[10px] px-1.5 rounded-md"
            style={{
              background: 'linear-gradient(180deg, rgba(255,254,254,0.76), rgba(255,232,233,0.62))',
              color: '#cf405b',
              border: '1px solid rgba(229,116,132,0.32)',
            }}
          >
            X
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] mb-1">
          <span style={{ color: '#886153' }}>現金變化</span>
          <span className="font-extrabold" style={{ color: cashColor }}>
            {summary.cashDelta >= 0 ? '+' : ''}${summary.cashDelta}
          </span>
        </div>
        <div className="text-[10px] mb-1.5" style={{ color: '#886153' }}>
          收入 ${summary.income} - 支出 ${summary.expense}
        </div>

        {(summary.completedCount > 0 || summary.failedCount > 0) && (
          <div className="flex gap-2 mb-1 text-[11px]">
            {summary.completedCount > 0 && (
              <span className="px-2 py-0.5 rounded-md font-bold" style={{ background: 'rgba(223,238,218,0.68)', color: '#6f966d' }}>
                完成 {summary.completedCount}
              </span>
            )}
            {summary.failedCount > 0 && (
              <span className="px-2 py-0.5 rounded-md font-bold" style={{ background: 'rgba(255,232,233,0.68)', color: '#d74e63' }}>
                失敗 {summary.failedCount}
              </span>
            )}
          </div>
        )}

        {summary.levelUps.length > 0 && (
          <div className="text-[11px] mb-1">
            {summary.levelUps.map((u, i) => (
              <div key={i} className="flex items-center gap-1.5" style={{ color: '#b97428' }}>
                <SvgIcon name="quality" size={15} />
                <span><b>{u.name}</b> 升到 Lv.{u.to}</span>
              </div>
            ))}
          </div>
        )}

        {summary.bankruptCountdown > 0 && (
          <div
            className="text-[11px] mt-1.5 px-2 py-1 rounded-md font-bold text-center"
            style={{ background: 'rgba(255,232,233,0.68)', color: '#d74e63' }}
          >
            資金見底（{summary.bankruptCountdown}/5 天）
          </div>
        )}
      </div>
    </>
  );
}
