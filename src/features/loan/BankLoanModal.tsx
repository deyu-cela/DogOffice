import { useGameStore } from '@/store/gameStore';

export function BankLoanModal() {
  const open = useGameStore((s) => s.loanModalOpen);
  const take = useGameStore((s) => s.takeBankLoan);
  const dismiss = useGameStore((s) => s.dismissLoanModal);
  const loanTaken = useGameStore((s) => s.loanTaken);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[850] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-3xl max-w-sm w-full p-5"
        style={{
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid rgba(90,70,54,0.18)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div className="text-center mb-3">
          <div className="text-4xl mb-2">🏦</div>
          <div className="text-lg font-extrabold">銀行救急貸款</div>
          <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            資金見底了！銀行願意伸出援手
          </div>
        </div>

        <div
          className="p-3 rounded-2xl text-sm leading-relaxed mb-3"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(90,70,54,0.1)' }}
        >
          <div className="flex justify-between mb-1">
            <span style={{ color: 'var(--muted)' }}>立即取得</span>
            <span className="font-extrabold" style={{ color: '#3a7a3f' }}>+$300</span>
          </div>
          <div className="flex justify-between mb-1">
            <span style={{ color: 'var(--muted)' }}>每日扣款</span>
            <span className="font-bold" style={{ color: '#c0392b' }}>−$5 / 天</span>
          </div>
          <div className="flex justify-between mb-1">
            <span style={{ color: 'var(--muted)' }}>還款期</span>
            <span className="font-bold">80 天</span>
          </div>
          <div className="flex justify-between pt-2 mt-1" style={{ borderTop: '1px dashed rgba(90,70,54,0.18)' }}>
            <span style={{ color: 'var(--muted)' }}>總還款</span>
            <span className="font-bold">$400（淨成本 $100）</span>
          </div>
        </div>

        <div className="text-[11px] mb-3 px-2" style={{ color: 'var(--muted)' }}>
          ⚠️ 一輩子只能借一次。借了後續沒有第二張安全網了。
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={take}
            disabled={loanTaken}
            className="py-2.5 rounded-full text-sm font-extrabold"
            style={{
              background: loanTaken ? '#eee' : 'linear-gradient(180deg, #b6efab, #8ee28f)',
              color: loanTaken ? '#999' : '#1e5a29',
              cursor: loanTaken ? 'not-allowed' : 'pointer',
            }}
          >
            {loanTaken ? '已借過' : '✅ 借 $300'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="py-2.5 rounded-full text-sm font-extrabold"
            style={{ background: '#eeeae4', color: '#5b3c2b' }}
          >
            ❌ 不借
          </button>
        </div>
      </div>
    </div>
  );
}
