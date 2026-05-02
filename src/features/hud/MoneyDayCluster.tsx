import { useState } from 'react';
import { useGameStore, OFFICE_DAILY_EXPENSE } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import { BASE_DAY_MS } from '@/constants/officeLevels';
import { moneyShort } from '@/lib/utils';
import { displayCompanyName } from '@/lib/companyName';
import { SvgIcon } from '@/components/SvgIcon';

const paperPanel: React.CSSProperties = {
  position: 'relative',
  overflow: 'visible',
  border: '1px solid rgba(208, 130, 105, 0.35)',
  borderRadius: 10,
  background:
    'linear-gradient(90deg, rgba(255,255,255,0.62), rgba(255,247,239,0.68)), repeating-linear-gradient(0deg, rgba(186,121,82,0.05) 0 1px, transparent 1px 18px), linear-gradient(90deg, rgba(248,211,189,0.42), rgba(255,244,232,0.46))',
  boxShadow:
    '0 12px 24px rgba(166,91,85,0.1), inset 0 0 0 1px rgba(255,255,255,0.46)',
  backdropFilter: 'blur(8px) saturate(1.02)',
  WebkitBackdropFilter: 'blur(8px) saturate(1.02)',
};

const tapeStyle: React.CSSProperties = {
  position: 'absolute',
  top: -9,
  width: 54,
  height: 18,
  opacity: 0.86,
  border: '1px solid rgba(232,132,145,0.22)',
  background:
    'linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25% 50%, rgba(255,255,255,0.5) 50% 75%, transparent 75%), #f6a7b3',
  backgroundSize: '18px 18px',
  boxShadow: '0 3px 8px rgba(166,91,85,0.12)',
  pointerEvents: 'none',
};

const pinStyle: React.CSSProperties = {
  position: 'absolute',
  width: 18,
  height: 18,
  borderRadius: '50%',
  background:
    'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.92) 0 24%, transparent 25%), linear-gradient(135deg, #ff98aa, #df6374)',
  border: '1px solid rgba(158,64,75,0.3)',
  boxShadow: '0 3px 0 rgba(140,65,65,0.18), 0 6px 12px rgba(171,78,78,0.18)',
  pointerEvents: 'none',
};

const stickerBase: React.CSSProperties = {
  border: '1px solid rgba(208, 130, 105, 0.32)',
  borderRadius: 999,
  color: '#5b382d',
  boxShadow:
    '0 8px 16px rgba(166,91,85,0.09), inset 0 0 0 1px rgba(255,255,255,0.48)',
  backdropFilter: 'blur(7px) saturate(1.02)',
  WebkitBackdropFilter: 'blur(7px) saturate(1.02)',
};

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
  const avatarSrc = `${import.meta.env.BASE_URL}assets/dog-profiles/ceo.png`;

  async function onLogout() {
    if (logoutBusy) return;
    setLogoutBusy(true);
    try {
      try {
        await useSaveStore.getState().saveToCloud();
      } catch {
        // 登出不因雲端暫存失敗而卡住，和原本 UserBadge 行為一致。
      }
      await logout();
      setShowSplash(true);
    } finally {
      setLogoutBusy(false);
    }
  }

  return (
    <div
      className="pointer-events-none absolute left-3 top-3 z-[700] flex flex-col gap-3"
      style={{ alignItems: 'flex-start', maxWidth: 'calc(100vw - 24px)' }}
    >
      <div
        className="bx-fade-up pointer-events-auto flex items-center"
        style={{
          ...paperPanel,
          width: 'min(380px, calc(100vw - 24px))',
          minHeight: 48,
          gap: 7,
          padding: '6px 8px',
          animationDelay: '0ms',
        }}
      >
        <span style={{ ...tapeStyle, left: 20, transform: 'rotate(-7deg)' }} aria-hidden="true" />
        <span style={{ ...pinStyle, left: 8, top: 8, width: 14, height: 14 }} aria-hidden="true" />

        <div
          className="grid shrink-0 place-items-center rounded-full"
          style={{
            width: 34,
            height: 34,
            background: 'transparent',
            border: '0',
            boxShadow: 'none',
          }}
        >
          <SvgIcon name="appDog" size={24} />
        </div>

        <div
          className="grid shrink-0 place-items-center rounded-full"
          style={{
            width: 30,
            height: 30,
            background: 'transparent',
            border: '0',
            boxShadow: 'none',
          }}
        >
          <SvgIcon name="money" size={20} />
        </div>

        <div className="min-w-[72px] shrink-0">
          <div
            data-money-target
            className="tabular-nums"
            style={{ color: '#b97428', fontSize: 18, lineHeight: 1, fontWeight: 900 }}
            title={`$${money.toLocaleString()}`}
          >
            ${moneyShort(money)}
          </div>
          <div
            className="mt-1 flex items-center gap-1 tabular-nums"
            style={{ color: '#d74e63', fontSize: 11, lineHeight: 1, fontWeight: 900 }}
            title={`每日支出：辦公室 $${OFFICE_DAILY_EXPENSE[officeLevel] ?? 0} + 薪資 $${salaryCost}`}
          >
            <span
              style={{
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '6px solid #d74e63',
              }}
              aria-hidden="true"
            />
            -${moneyShort(dailyCost)}/天
          </div>
        </div>

        <div
          className="min-w-0 flex-1 truncate text-center"
          style={{
            color: '#5b382d',
            fontSize: 16,
            lineHeight: 1,
            fontWeight: 900,
            borderBottom: '1px solid rgba(216,142,122,0.42)',
            paddingBottom: 4,
          }}
          title={displayName}
        >
          {displayName}
        </div>

        {authedUser && (
          <button
            type="button"
            onClick={onLogout}
            disabled={logoutBusy}
            className="shrink-0"
            style={{
              minWidth: 54,
              height: 28,
              padding: '0 9px',
              borderRadius: 8,
              border: '1px solid rgba(229,116,132,0.32)',
              color: '#cf405b',
              background: logoutBusy ? '#f2e8e5' : 'linear-gradient(180deg, #fffefe, #ffe8e9)',
              boxShadow: '0 4px 10px rgba(185,85,93,0.11)',
              fontSize: 12,
              fontWeight: 900,
              cursor: logoutBusy ? 'wait' : 'pointer',
            }}
          >
            {logoutBusy ? '...' : '登出'}
          </button>
        )}
      </div>

      <div className="pointer-events-auto flex items-center gap-1.5 pl-3">
        <HudSticker delay="60ms" background="linear-gradient(180deg, rgba(255,254,254,0.68), rgba(255,232,233,0.58))">
          <span className="grid place-items-center" style={smallIconCircle('#fff4dc', 'rgba(231,157,83,0.42)')}>
            <SvgIcon name="calendar" size={16} />
          </span>
          <span>第 {day} 天</span>
        </HudSticker>

        <HudSticker delay="120ms" background="linear-gradient(180deg, rgba(248,255,244,0.68), rgba(223,238,218,0.58))">
          <span className="grid place-items-center" style={smallIconCircle('#fff9e9', 'rgba(158,194,156,0.5)')}>
            <SvgIcon name="hourglass" size={16} />
          </span>
          <span className="tabular-nums">下一天 {remainingSec}s</span>
        </HudSticker>

        <button
          type="button"
          onClick={cycleSpeed}
          className="bx-fade-up inline-flex items-center gap-1.5"
          style={{
            height: 36,
            minWidth: 54,
            padding: '0 10px',
            borderRadius: 999,
            border: '1px solid rgba(208,130,105,0.34)',
            color: '#5b382d',
            background: 'linear-gradient(180deg, rgba(255,242,214,0.72), rgba(247,178,103,0.62))',
            boxShadow:
              '0 7px 14px rgba(166,91,85,0.1), inset 0 0 0 1px rgba(255,255,255,0.48)',
            backdropFilter: 'blur(7px) saturate(1.02)',
            WebkitBackdropFilter: 'blur(7px) saturate(1.02)',
            animationDelay: '180ms',
            fontWeight: 900,
          }}
          title="調整遊戲速度"
          aria-label="調整遊戲速度"
        >
          <SvgIcon name="play" size={15} />
          <span className="tabular-nums" style={{ fontSize: 13, lineHeight: 1, fontWeight: 900 }}>
            {speedMultiplier}x
          </span>
        </button>
      </div>
    </div>
  );
}

function HudSticker({
  children,
  delay,
  background,
}: {
  children: React.ReactNode;
  delay: string;
  background: string;
}) {
  return (
    <div
      className="bx-fade-up inline-flex items-center gap-2.5"
      style={{
        ...stickerBase,
        minHeight: 36,
        padding: '6px 10px',
        background,
        fontSize: 13,
        lineHeight: 1,
        fontWeight: 900,
        animationDelay: delay,
      }}
    >
      {children}
    </div>
  );
}

function smallIconCircle(background: string, borderColor: string): React.CSSProperties {
  return {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background,
    border: `1px solid ${borderColor}`,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
    color: '#6e4638',
    fontWeight: 900,
  };
}
