import { useGameStore } from '@/store/gameStore';
import {
  LOAN_AMOUNT,
  LOAN_DAILY_DEDUCT,
  LOAN_TERM_DAYS,
  LOAN_TOTAL_REPAY,
  LOAN_NET_COST,
} from '@/constants/loan';
import './bankLoanModal.css';

export function BankLoanModal() {
  const open = useGameStore((s) => s.loanModalOpen);
  const take = useGameStore((s) => s.takeBankLoan);
  const dismiss = useGameStore((s) => s.dismissLoanModal);
  const loanTaken = useGameStore((s) => s.loanTaken);

  if (!open) return null;

  return (
    <div className="loan-backdrop" role="dialog" aria-modal="true" aria-labelledby="loan-title">
      <div className="loan-stack">
        <div className="loan-back loan-back--pink" aria-hidden="true" />
        <div className="loan-back loan-back--cream" aria-hidden="true" />
        <div className="loan-card">
          <span className="loan-tape" aria-hidden="true" />
          <button type="button" onClick={dismiss} aria-label="關閉" className="loan-close">×</button>

          <div className="loan-header">
            <div className="loan-eyebrow">DOGGO BANK · LOAN</div>
            <div id="loan-title" className="loan-title">銀行救急貸款</div>
            <div className="loan-subpill">一輩子只能借一次喔 ♡</div>
          </div>

          <div className="loan-hero">
            <div className="loan-hero__label">立即入帳</div>
            <div className="loan-hero__amt">+${LOAN_AMOUNT}</div>
            <div className="loan-stamp" aria-hidden="true">
              <span className="loan-stamp__eyebrow">★ DOGGO ★</span>
              <span className="loan-stamp__big">核准</span>
              <span className="loan-stamp__sub">BANK</span>
            </div>
          </div>

          <div className="loan-rows">
            <div className="loan-row">
              <span>🦴 每日扣款</span>
              <span className="loan-row__value loan-row__amt-neg">−${LOAN_DAILY_DEDUCT} / 天</span>
            </div>
            <div className="loan-row">
              <span>📅 還款期</span>
              <span className="loan-row__value loan-row__amt-deep">{LOAN_TERM_DAYS} 天</span>
            </div>
            <div className="loan-row">
              <span>💰 總還款</span>
              <span>
                <span className="loan-row__value loan-row__amt-deep">${LOAN_TOTAL_REPAY}</span>
                <span className="loan-row__sub">(淨成本 ${LOAN_NET_COST})</span>
              </span>
            </div>
          </div>

          <div className="loan-warning">
            ※ 一輩子只能借一次・借了就沒得後悔・第二桶金要靠你自己賺到了
          </div>

          <div className="loan-actions">
            <button
              type="button"
              onClick={take}
              disabled={loanTaken}
              className="loan-btn loan-btn--primary"
            >
              <span>🐾</span>
              {loanTaken ? '已借過' : `借 $${LOAN_AMOUNT}`}
            </button>
            <button type="button" onClick={dismiss} className="loan-btn loan-btn--secondary">
              不借
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
