import { useGameStore, OFFICE_DAILY_EXPENSE } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { BASE_DAY_MS } from '@/constants/officeLevels';
import { moneyShort } from '@/lib/utils';
import { displayCompanyName } from '@/lib/companyName';
import { SvgIcon } from '@/components/SvgIcon';
import { UserBadge } from './UserBadge';

export function MoneyDayCluster() {
  const day = useGameStore((s) => s.day);
  const money = useGameStore((s) => s.money);
  const companyName = useGameStore((s) => s.companyName);
  const dayElapsed = useGameStore((s) => s.dayElapsed);
  const speedMultiplier = useGameStore((s) => s.speedMultiplier);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const salaryCost = useGameStore((s) =>
    s.staff.filter((d) => d.assignedProjectId != null).reduce((n, d) => n + d.expectedSalary, 0),
  );
  const dailyCost = (OFFICE_DAILY_EXPENSE[officeLevel] ?? 0) + salaryCost;

  const remainingSec = (Math.max(0, BASE_DAY_MS - dayElapsed) / speedMultiplier / 1000).toFixed(1);
  const cycleSpeed = () => setSpeed(speedMultiplier >= 3 ? 1 : speedMultiplier + 1);
  const authedUser = useAuthStore((s) => s.user);

  return (
    <div
      className="pointer-events-none absolute top-3 left-3 z-[700] flex flex-col gap-2"
      style={{ alignItems: 'flex-start' }}
    >
      {/* 頭嚮導：logo + 公司名 + 金錢 + 帳號 */}
      <div className="pointer-events-auto flex items-center gap-2">
        <div
          className="bx-chip bx-fade-up inline-flex items-center gap-2 rounded-2xl px-3 py-2"
          style={{ animationDelay: '0ms' }}
        >
          <div
            className="grid place-items-center rounded-xl"
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(180deg, #ffffff, #e3f1ff)',
              border: '1px solid var(--line-hair)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.55)',
            }}
          >
            <SvgIcon name="appDog" size={26} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span
              className="font-extrabold leading-none truncate max-w-[140px]"
              style={{ color: 'var(--ink)', fontSize: 14, letterSpacing: '0.01em' }}
              title={displayCompanyName(companyName)}
            >
              {displayCompanyName(companyName)}
            </span>
            <span
              data-money-target
              className="font-extrabold leading-none tabular-nums"
              style={{ color: '#2080d6', fontSize: 12 }}
              title={`$${money.toLocaleString()}`}
            >
              💰 ${moneyShort(money)}
            </span>
            <span
              className="font-bold leading-none tabular-nums"
              style={{ color: '#c0392b', fontSize: 11 }}
              title={`每日支出：辦公室 $${OFFICE_DAILY_EXPENSE[officeLevel] ?? 0} + 派案薪資 $${salaryCost}`}
            >
              📉 -${moneyShort(dailyCost)}/天
            </span>
          </div>
        </div>
        {authedUser && <UserBadge />}
      </div>

      {/* 天數 + 倒數 + 倍速 一排 */}
      <div className="pointer-events-auto inline-flex items-center gap-1.5">
        <div
          className="bx-chip bx-fade-up inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5"
          style={{ animationDelay: '60ms' }}
        >
          <SvgIcon name="growth" size={14} />
          <span className="font-extrabold leading-none" style={{ color: 'var(--ink)', fontSize: 13 }}>
            第 {day} 天
          </span>
        </div>
        <div
          className="bx-chip bx-fade-up inline-flex items-center rounded-xl px-2.5 py-1.5"
          style={{ animationDelay: '120ms' }}
        >
          <span className="font-extrabold leading-none tabular-nums" style={{ color: 'var(--ink)', fontSize: 12 }}>
            下一天 {remainingSec}s
          </span>
        </div>
        <button
          type="button"
          onClick={cycleSpeed}
          className="bx-chip bx-chip--accent bx-fade-up inline-flex items-center gap-1 rounded-xl"
          style={{
            padding: '4px 9px',
            fontWeight: 900,
            fontSize: 12,
            animationDelay: '180ms',
          }}
          title="切換倍速"
        >
          <span
            style={{
              width: 0,
              height: 0,
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderLeft: '6px solid white',
            }}
          />
          {speedMultiplier}x
        </button>
      </div>
    </div>
  );
}
