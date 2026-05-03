import { useState } from 'react';
import {
  useGameStore,
  OFFICE_DAILY_EXPENSE,
  estimateSpecialTaskRemainingDays,
} from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import { useUiStore } from '@/store/uiStore';
import { BASE_DAY_MS } from '@/constants/officeLevels';
import { moneyShort } from '@/lib/utils';
import { displayCompanyName } from '@/lib/companyName';
import { SvgIcon } from '@/components/SvgIcon';
import './leftHud.css';

const PAW_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <ellipse cx="6.5" cy="9" rx="1.8" ry="2.4" />
    <ellipse cx="17.5" cy="9" rx="1.8" ry="2.4" />
    <ellipse cx="9.5" cy="5" rx="1.6" ry="2.2" />
    <ellipse cx="14.5" cy="5" rx="1.6" ry="2.2" />
    <path d="M12 11c-3 0-5 2.5-5 5 0 2 1.5 3 3 3 1 0 1.3-.5 2-.5s1 .5 2 .5c1.5 0 3-1 3-3 0-2.5-2-5-5-5z" />
  </svg>
);

const MONEY_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H9.5a1.5 1.5 0 0 0 0 3H15" />
  </svg>
);

const LOGOUT_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l-5-5 5-5M5 12h11" />
  </svg>
);

const CALENDAR_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

const HOURGLASS_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3h12M6 21h12" />
    <path d="M7 3v3c0 3 4 4 4 6s-4 3-4 6v3M17 3v3c0 3-4 4-4 6s4 3 4 6v3" />
  </svg>
);

const PLAY_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export function MoneyDayCluster() {
  const day = useGameStore((s) => s.day);
  const money = useGameStore((s) => s.money);
  const companyName = useGameStore((s) => s.companyName);
  const dayElapsed = useGameStore((s) => s.dayElapsed);
  const speedMultiplier = useGameStore((s) => s.speedMultiplier);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const setShowSplash = useGameStore((s) => s.setShowSplash);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const salaryCost = useGameStore((s) =>
    s.staff.filter((d) => d.assignedProjectId != null).reduce((n, d) => n + d.expectedSalary, 0),
  );
  const authedUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [logoutBusy, setLogoutBusy] = useState(false);

  const dailyCost = (OFFICE_DAILY_EXPENSE[officeLevel] ?? 0) + salaryCost;
  const remainingSec = (Math.max(0, BASE_DAY_MS - dayElapsed) / speedMultiplier / 1000).toFixed(1);
  const cycleSpeed = () => setSpeed(speedMultiplier >= 3 ? 1 : speedMultiplier + 1);
  const displayName = displayCompanyName(companyName);

  async function onLogout() {
    if (logoutBusy) return;
    setLogoutBusy(true);
    try {
      try {
        await useSaveStore.getState().saveToCloud();
      } catch {
        // 雲端存檔失敗不擋登出，避免使用者被卡在中間狀態
      }
      await logout();
      setShowSplash(true);
    } finally {
      setLogoutBusy(false);
    }
  }

  return (
    <div className="lhud-stack">
      <div className="lhud-hover lhud-hover--lift2">
        <div className="lhud-wallet">
          <span className="lhud-wallet__stitch" aria-hidden="true" />
          <div className="lhud-wallet__row">
            <div className="lhud-wallet__avatar">{PAW_ICON}</div>

            <div className="lhud-wallet__money" title={`$${money.toLocaleString()}`}>
              <div className="lhud-wallet__money-row">
                {MONEY_ICON}
                <span className="lhud-wallet__money-amt tabular-nums">${moneyShort(money)}</span>
              </div>
              <div className="lhud-wallet__money-cost tabular-nums" title={`每日支出：辦公室 $${OFFICE_DAILY_EXPENSE[officeLevel] ?? 0} + 薪資 $${salaryCost}`}>
                <span aria-hidden="true" className="lhud-wallet__money-cost-arrow" />
                -${moneyShort(dailyCost)}/天
              </div>
            </div>

            <div className="lhud-wallet__name" title={displayName}>
              {displayName}
            </div>

            {authedUser && (
              <button
                type="button"
                onClick={onLogout}
                disabled={logoutBusy}
                className="lhud-wallet__logout"
              >
                {LOGOUT_ICON}
                {logoutBusy ? '...' : '登出'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="lhud-sticky-row">
        <StickyA tilt={-2} variant="day" width={88}>
          <div className="lhud-sticky__row">
            <span className="lhud-sticky__icon">{CALENDAR_ICON}</span>
            <span className="lhud-sticky__text">第 {day} 天</span>
          </div>
        </StickyA>

        <StickyA tilt={3} variant="time" width={112}>
          <div className="lhud-sticky__row">
            <span className="lhud-sticky__icon">{HOURGLASS_ICON}</span>
            <span className="lhud-sticky__text tabular-nums">下一天 {remainingSec}s</span>
          </div>
        </StickyA>

        <StickyA tilt={-3} variant="speed" width={56} onClick={cycleSpeed} ariaLabel="調整遊戲速度">
          <div className="lhud-sticky__row lhud-sticky__row--centered">
            <span className="lhud-sticky__icon">{PLAY_ICON}</span>
            <span className="lhud-sticky__text lhud-sticky__text--lg">{speedMultiplier}x</span>
          </div>
        </StickyA>

        <SpecialTaskBadge />
      </div>
    </div>
  );
}

type StickyAProps = {
  tilt: number;
  variant: 'day' | 'time' | 'speed';
  width: number;
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
};

function StickyA({ tilt, variant, width, children, onClick, ariaLabel }: StickyAProps) {
  const isButton = onClick != null;
  const Tag = isButton ? 'button' : 'div';
  const className = `lhud-sticky lhud-paper lhud-sticky--${variant}${isButton ? ' lhud-sticky--btn' : ''}`;

  return (
    <div className="lhud-hover">
      <Tag
        className={className}
        style={{ width, transform: `rotate(${tilt}deg)` }}
        {...(isButton
          ? { type: 'button' as const, onClick, 'aria-label': ariaLabel, title: ariaLabel }
          : {})}
      >
        <span
          className="lhud-sticky__tape"
          style={{ transform: `translateX(-50%) rotate(${-tilt * 1.3}deg)` }}
          aria-hidden="true"
        />
        {children}
      </Tag>
    </div>
  );
}
function SpecialTaskBadge() {
  const officeLevel = useGameStore((s) => s.officeLevel);
  const targetLevel = officeLevel + 1;
  const task = useGameStore((s) => s.specialTasks?.[targetLevel]);
  const estRemaining = useGameStore((s) =>
    estimateSpecialTaskRemainingDays(s, targetLevel),
  );
  const acknowledged = useUiStore((s) =>
    s.acknowledgedSpecialTaskLevels.includes(targetLevel),
  );
  const acknowledgeSpecialTask = useUiStore((s) => s.acknowledgeSpecialTask);
  const openDrawer = useUiStore((s) => s.openDrawer);

  if (!task) return null;
  if (acknowledged) return null;

  if (task.status === 'inProgress') {
    const label =
      !Number.isFinite(estRemaining)
        ? '特殊任務能力不足'
        : `特殊任務倒數 ${Math.max(0, estRemaining)} 天完成`;
    return (
      <div
        className="shrink-0 inline-flex items-center gap-1"
        title={`擴建任務「${task.name}」進行中`}
        style={{
          minWidth: 54,
          height: 36,
          padding: '0 12px',
          borderRadius: 999,
          border: '1px solid rgba(214,150,90,0.36)',
          color: '#8a4a16',
          background: 'linear-gradient(180deg, #fffefe, #ffe9c8)',
          boxShadow: '0 4px 10px rgba(185,128,55,0.12)',
          fontSize: 12,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        <SvgIcon name="hourglass" size={14} />
        <span className="tabular-nums">{label}</span>
      </div>
    );
  }

  if (task.status === 'completed') {
    return (
      <button
        type="button"
        onClick={() => {
          acknowledgeSpecialTask(targetLevel);
          openDrawer('construction');
        }}
        className="shrink-0"
        title={`擴建任務「${task.name}」已完成，前往升級`}
        style={{
          minWidth: 54,
          height: 36,
          padding: '0 12px',
          borderRadius: 999,
          border: '1px solid rgba(111,150,109,0.4)',
          color: '#3f7440',
          background: 'linear-gradient(180deg, #fffefe, #d6f3cf)',
          boxShadow: '0 4px 10px rgba(63,116,64,0.18)',
          fontSize: 12,
          fontWeight: 900,
          cursor: 'pointer',
        }}
      >
        完成 ✓
      </button>
    );
  }

  return null;
}

