import { SvgIcon } from '@/components/SvgIcon';
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
      style={{ background: 'rgba(8,32,77,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-xl max-w-sm w-full p-5"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
      >
        <div className="text-center mb-3">
          <div className="mx-auto mb-2 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#eef6ff', border: '1px solid var(--line)' }}>
            <SvgIcon name="money" size={30} />
          </div>
          <div className="text-lg font-extrabold">銀行救急貸款</div>
          <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            資金見底了，銀行願意伸出援手
          </div>
        </div>

        <div
          className="p-3 rounded-lg text-sm leading-relaxed mb-3"
          style={{ background: '#f7fbff', border: '1px solid var(--line)' }}
        >
          <LoanRow label="立即取得" value="+$300" color="#16926f" bold />
          <LoanRow label="每日扣款" value="-$5 / 天" color="#d34a4a" />
          <LoanRow label="還款期" value="80 天" />
          <div className="flex justify-between pt-2 mt-1" style={{ borderTop: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--muted)' }}>總還款</span>
            <span className="font-bold">$400（淨成本 $100）</span>
          </div>
        </div>

        <div className="text-[11px] mb-3 px-2" style={{ color: 'var(--muted)' }}>
          一輩子只能借一次。借了後續沒有第二張安全網了。
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={take}
            disabled={loanTaken}
            className="py-2.5 rounded-lg text-sm font-extrabold"
            style={{
              background: loanTaken ? '#e9f1ff' : 'linear-gradient(180deg, #35c59c, #16a77f)',
              color: loanTaken ? '#8aa2c8' : 'white',
              cursor: loanTaken ? 'not-allowed' : 'pointer',
              border: loanTaken ? '1px solid var(--line)' : '1px solid rgba(22,167,127,0.35)',
            }}
          >
            {loanTaken ? '已借過' : '借 $300'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="py-2.5 rounded-lg text-sm font-extrabold"
            style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
          >
            不借
          </button>
        </div>
      </div>
    </div>
  );
}

function LoanRow({ label, value, color, bold = false }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div className="flex justify-between mb-1">
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span className={bold ? 'font-extrabold' : 'font-bold'} style={{ color }}>{value}</span>
    </div>
  );
}
