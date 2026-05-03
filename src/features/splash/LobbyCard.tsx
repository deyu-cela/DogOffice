import type { ReactNode } from 'react';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';
import { OFFICE_LEVELS } from '@/constants/officeLevels';

type Props = {
  account: string;
  companyName: string;
  day: number;
  money: number;
  officeLevel: number;
  staffCount: number;
  bankrupt: boolean;
  hasSave: boolean;
  loadingSave: boolean;
  saveError: string | null;
  bootstrapping: boolean;
  loggingOut: boolean;
  unlockedAchievements: number;
  totalAchievements: number;
  onStart: () => void;
  onLogout: () => void;
  onLeaderboard: () => void;
  onAchievements: () => void;
};

export function LobbyCard({
  account,
  companyName,
  day,
  money,
  officeLevel,
  staffCount,
  bankrupt,
  hasSave,
  loadingSave,
  saveError,
  bootstrapping,
  loggingOut,
  unlockedAchievements,
  totalAchievements,
  onStart,
  onLogout,
  onLeaderboard,
  onAchievements,
}: Props) {
  const officeMaxLevel = OFFICE_LEVELS.length - 1;
  const officeReached = officeLevel >= officeMaxLevel;

  const ctaLabel = loadingSave ? '讀取中...' : hasSave ? '繼續經營' : '開始經營';
  const ctaSub = hasSave ? 'CONTINUE' : 'START';

  return (
    <div className="lobby-pawder-shell">
      <div className="auth-pawder-welcome lobby-welcome">
        <span className="auth-welcome-mark">
          <img
            src={`${import.meta.env.BASE_URL}assets/login/cute-paw-welcome-icon.png`}
            alt="可愛狗掌"
            width={56}
            height={56}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </span>
        <h1>歡迎回來，{account}！</h1>
        <p>
          {bankrupt ? (
            <>
              「{companyName}」破產中 <span aria-hidden>💔</span>
            </>
          ) : (
            <>
              「{companyName}」狗狗們等你打卡上班 <span aria-hidden>🐾</span>
            </>
          )}
        </p>
      </div>

      <LobbyStatusLine
        bootstrapping={bootstrapping}
        loadingSave={loadingSave}
        saveError={saveError}
        hasSave={hasSave}
      />

      <div className="lobby-stats">
        <StatChip icon="log" label="DAY" value={`第 ${day} 天`} />
        <StatChip icon="people" label="STAFF" value={`${staffCount}`} />
        <StatChip icon="money" label="MONEY" value={`$${money.toLocaleString()}`} />
        <StatChip
          icon="office"
          label="OFFICE"
          value={officeReached ? '已達頂級' : `Lv.${officeLevel + 1}`}
        />
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={loadingSave}
        className="lobby-cta"
        data-loading={loadingSave ? 'true' : 'false'}
      >
        <span className="lobby-cta-tape" aria-hidden />
        <span className="lobby-cta-label">{ctaLabel}</span>
        <small className="lobby-cta-sub">{ctaSub}</small>
      </button>

      <div className="lobby-secondary">
        <button type="button" onClick={onLeaderboard} className="lobby-mini-btn lobby-mini-btn-rank">
          <span className="lobby-mini-icon" aria-hidden>🏆</span>
          <span>排行榜</span>
        </button>
        <button type="button" onClick={onAchievements} className="lobby-mini-btn lobby-mini-btn-ach">
          <span className="lobby-mini-icon" aria-hidden>🏅</span>
          <span>成就</span>
          <span className="lobby-mini-count">
            {unlockedAchievements}/{totalAchievements}
          </span>
        </button>
      </div>

      <div className="lobby-logout-row">
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="lobby-logout"
        >
          <SvgIcon name="restart" size={12} />
          {loggingOut ? '登出中...' : '登出'}
        </button>
      </div>
    </div>
  );
}

type StatusProps = {
  bootstrapping: boolean;
  loadingSave: boolean;
  saveError: string | null;
  hasSave: boolean;
};

function LobbyStatusLine({ bootstrapping, loadingSave, saveError, hasSave }: StatusProps) {
  if (bootstrapping) {
    return <StatusChip icon="restart">確認登入狀態...</StatusChip>;
  }
  if (loadingSave) {
    return <StatusChip icon="save">讀取雲端存檔...</StatusChip>;
  }
  if (saveError && !hasSave) {
    return (
      <StatusChip icon="warning" tone="warn">
        讀取失敗，將以新公司開始
      </StatusChip>
    );
  }
  if (hasSave) {
    return <StatusChip icon="save">已載入雲端存檔</StatusChip>;
  }
  return <StatusChip icon="target">新公司，搶先升級到豪華總部！</StatusChip>;
}

function StatusChip({
  icon,
  children,
  tone = 'info',
}: {
  icon: SvgIconName;
  children: ReactNode;
  tone?: 'info' | 'warn';
}) {
  return (
    <div className="lobby-status-chip" data-tone={tone}>
      <SvgIcon name={icon} size={13} />
      <span>{children}</span>
    </div>
  );
}

function StatChip({ icon, label, value }: { icon: SvgIconName; label: string; value: string }) {
  return (
    <div className="lobby-stat-chip">
      <SvgIcon name={icon} size={20} />
      <div className="lobby-stat-text">
        <div className="lobby-stat-value">{value}</div>
        <div className="lobby-stat-label">{label}</div>
      </div>
    </div>
  );
}
