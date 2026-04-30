import { useEffect, useState, type ReactNode } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import { useUiStore } from '@/store/uiStore';
import { ACHIEVEMENTS } from '@/features/achievements/achievementConfigs';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { LeaderboardPanel } from '@/features/leaderboard/LeaderboardPanel';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';
import { OFFICE_LEVELS } from '@/constants/officeLevels';

const IPO_REPUTATION = 80;
const IPO_MONEY = 50000;
const IPO_OFFICE_LEVEL = 4;
const IPO_PROJECTS = 80;

export function SplashScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const day = useGameStore((s) => s.day);
  const money = useGameStore((s) => s.money);
  const reputation = useGameStore((s) => s.reputation);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const staff = useGameStore((s) => s.staff);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);
  const projectsFailed = useGameStore((s) => s.projectsFailed);
  const clients = useGameStore((s) => s.clients);
  const log = useGameStore((s) => s.log);
  const ipoAchievedAt = useGameStore((s) => s.ipoAchievedAt);
  const bankrupt = useGameStore((s) => s.bankrupt);
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const saveStatus = useSaveStore((s) => s.status);
  const cloud = useSaveStore((s) => s.cloud);
  const saveError = useSaveStore((s) => s.error);
  const openAchievements = useUiStore((s) => s.openAchievements);
  const unlockedAchievementIds = useGameStore((s) => s.unlockedAchievementIds);
  const base = import.meta.env.BASE_URL;
  const [lbOpen, setLbOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const authed = authStatus === 'authed' && !!user;
  const bootstrapping = authStatus === 'bootstrapping';
  const loadingSave = saveStatus === 'loading';
  const hasSave = !!cloud?.data;
  const unauthenticated = !bootstrapping && !authed;

  useEffect(() => {
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, []);

  async function onLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] overflow-hidden"
      style={{
        backgroundImage: unauthenticated
          ? `linear-gradient(90deg, rgba(255,255,255,0.18), rgba(234,244,255,0.32)), url('${base}assets/start-screen.png')`
          : `linear-gradient(180deg, rgba(255,255,255,0.82), rgba(239,248,255,0.74)), url('${base}assets/start-screen.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {unauthenticated ? (
        <UnauthedSplashShell>
          <AuthScreen />
        </UnauthedSplashShell>
      ) : (
        <AuthedSplashShell
          base={base}
          account={user?.account ?? '老闆'}
          day={day}
          money={money}
          reputation={reputation}
          officeLevel={officeLevel}
          staffCount={staff.length}
          morale={averageMorale(staff)}
          projectsCompleted={projectsCompleted}
          projectsFailed={projectsFailed}
          activeProjects={clients.filter((c) => c.status === 'active').length}
          offeredProjects={clients.filter((c) => c.status === 'offered').length}
          recentLogs={log.slice(-3).reverse().map((entry) => entry.msg)}
          ipoAchievedAt={ipoAchievedAt}
          bankrupt={bankrupt}
          loadingSave={loadingSave}
          hasSave={hasSave}
          saveError={saveError}
          bootstrapping={bootstrapping}
          loggingOut={loggingOut}
          onStart={startGame}
          onLogout={onLogout}
          onLeaderboard={() => setLbOpen(true)}
          onAchievements={openAchievements}
          unlockedAchievements={unlockedAchievementIds.length}
          totalAchievements={ACHIEVEMENTS.length}
        />
      )}

      {lbOpen && <LeaderboardPanel onClose={() => setLbOpen(false)} />}
    </div>
  );
}

function UnauthedSplashShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(240,248,255,0.54) 38%, rgba(255,255,255,0.72))',
        }}
      />
      <header
        className="unauth-header relative z-10 h-[94px] px-8 md:px-14 flex items-center justify-between"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.58))',
          borderBottom: '1px solid rgba(210,226,248,0.75)',
          backdropFilter: 'blur(14px) saturate(130%)',
        }}
      >
        <LogoLockup />
      </header>

      <main className="unauth-main relative z-10 h-[calc(100vh-94px)] grid grid-cols-1 lg:grid-cols-[2fr_1fr] items-stretch gap-0 px-0">
        <section className="unauth-hero text-center lg:text-left flex flex-col items-center lg:items-start justify-center px-6 md:px-14 pb-20">
          <div className="inline-flex items-center gap-4 mb-2">
            <SvgIcon name="appDog" size={54} />
            <h1 className="text-5xl md:text-6xl font-extrabold leading-none" style={{ color: '#173b78', textShadow: '0 2px 0 rgba(255,255,255,0.85)' }}>
              狗狗公司
            </h1>
          </div>
          <p className="text-lg md:text-xl font-bold" style={{ color: '#526b96' }}>可愛又療癒的狗狗經營小遊戲！</p>
          <p className="mt-6 max-w-lg text-sm leading-7" style={{ color: '#6f83a5' }}>
            招募狗狗員工、承接案子、照顧士氣與資金，陪公司一路長大到 IPO 上市。
          </p>
        </section>

        <aside
          className="auth-slanted-panel relative w-full h-full pt-8 pb-[72px] text-left flex flex-col items-center justify-center"
          style={{ backdropFilter: 'blur(18px) saturate(145%)' }}
        >
          <div className="w-full max-w-full">{children}</div>
          <div
            className="auth-panel-footer absolute left-[72px] right-8 bottom-0 h-[58px] flex items-center justify-center gap-8 text-sm font-extrabold"
            style={{
              color: '#6f83a5',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(239,248,255,0.98))',
              borderTop: '1px solid rgba(210,226,248,0.85)',
            }}
          >
            <span className="inline-flex items-center gap-2"><SvgIcon name="log" size={19} />雲端存檔</span>
            <span className="h-5 w-px" style={{ background: '#c8daf2' }} />
            <span className="inline-flex items-center gap-2"><SvgIcon name="quality" size={19} />IPO 目標</span>
            <span className="h-5 w-px" style={{ background: '#c8daf2' }} />
            <span className="inline-flex items-center gap-2"><SvgIcon name="service" size={19} />狗狗團隊</span>
          </div>
        </aside>
      </main>

      <SharedSplashStyles />
    </div>
  );
}

type AuthedSplashShellProps = {
  base: string;
  account: string;
  day: number;
  money: number;
  reputation: number;
  officeLevel: number;
  staffCount: number;
  morale: number;
  projectsCompleted: number;
  projectsFailed: number;
  activeProjects: number;
  offeredProjects: number;
  recentLogs: string[];
  ipoAchievedAt: number | null;
  bankrupt: boolean;
  loadingSave: boolean;
  hasSave: boolean;
  saveError: string | null;
  bootstrapping: boolean;
  loggingOut: boolean;
  onStart: () => void;
  onLogout: () => void;
  onLeaderboard: () => void;
  onAchievements: () => void;
  unlockedAchievements: number;
  totalAchievements: number;
};

function AuthedSplashShell({
  base,
  account,
  day,
  money,
  reputation,
  officeLevel,
  staffCount,
  morale,
  projectsCompleted,
  projectsFailed,
  activeProjects,
  offeredProjects,
  recentLogs,
  ipoAchievedAt,
  bankrupt,
  loadingSave,
  hasSave,
  saveError,
  bootstrapping,
  loggingOut,
  onStart,
  onLogout,
  onLeaderboard,
  onAchievements,
  unlockedAchievements,
  totalAchievements,
}: AuthedSplashShellProps) {
  const office = OFFICE_LEVELS[officeLevel];
  const maxStaff = office?.maxStaff ?? 0;
  const ipoProgress = Math.min(
    100,
    Math.round(
      Math.min(
        reputation / IPO_REPUTATION,
        money / IPO_MONEY,
        (officeLevel + 1) / (IPO_OFFICE_LEVEL + 1),
        projectsCompleted / IPO_PROJECTS,
      ) * 100,
    ),
  );

  return (
    <div className="authed-shell relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-white/20" />
      <header
        className="authed-header relative z-10 h-[94px] px-8 md:px-14 flex items-center justify-between"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.68))',
          borderBottom: '1px solid rgba(210,226,248,0.78)',
          boxShadow: '0 10px 32px rgba(58,113,190,0.1)',
          backdropFilter: 'blur(16px) saturate(135%)',
        }}
      >
        <LogoLockup />
      </header>

      <main className="authed-main relative z-10 h-[calc(100vh-94px)] grid grid-cols-1 xl:grid-cols-[1fr_520px] items-stretch">
        <section className="authed-stage relative min-h-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.34)), url('${base}assets/start-screen.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0" style={{ boxShadow: 'inset -80px 0 90px rgba(237,247,255,0.72)' }} />

          <div className="authed-hero-content relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
            <div className="inline-flex items-center gap-4">
              <SvgIcon name="appDog" size={58} />
              <h1 className="text-5xl md:text-6xl font-extrabold leading-none" style={{ color: '#173b78', textShadow: '0 3px 0 rgba(255,255,255,0.9)' }}>
                狗狗公司
              </h1>
            </div>
            <p className="mt-3 text-lg md:text-xl font-extrabold" style={{ color: '#355c96' }}>
              可愛又療癒的狗狗經營小遊戲！
            </p>
            <p className="mt-7 text-base md:text-lg font-bold" style={{ color: '#426597' }}>
              歡迎回來，{account}！
            </p>

            <div className="authed-status-strip mt-5">
              {bootstrapping && <StatusLine icon="restart">正在確認登入狀態...</StatusLine>}
              {loadingSave && <StatusLine icon="save">正在讀取雲端存檔...</StatusLine>}
              {!loadingSave && saveError && !hasSave && <StatusLine icon="warning">讀取存檔失敗，將以新公司開始。</StatusLine>}
              {!loadingSave && !hasSave && <StatusLine icon="target">新公司準備好了，IPO 挑戰即將開始。</StatusLine>}
              {!loadingSave && hasSave && <StatusLine icon="save">已載入雲端存檔。</StatusLine>}
              <button
                type="button"
                onClick={onLogout}
                disabled={loggingOut}
                className="authed-logout-pill"
              >
                <SvgIcon name="restart" size={14} />
                {loggingOut ? '登出中...' : '登出'}
              </button>
            </div>

            <button
              type="button"
              onClick={onStart}
              disabled={loadingSave}
              className="authed-start-button mt-6"
              style={{
                cursor: loadingSave ? 'wait' : 'pointer',
                opacity: loadingSave ? 0.72 : 1,
              }}
            >
              <span>{loadingSave ? '讀取中' : hasSave ? '繼續經營' : '開始經營'}</span>
              <small>{hasSave ? 'CONTINUE' : 'START'}</small>
            </button>

            <button type="button" onClick={onLeaderboard} className="authed-rank-button mt-4">
              <MetallicTrophy size={28} />
              <span>排行榜</span>
            </button>

            <button type="button" onClick={onAchievements} className="authed-achievement-button mt-3">
              <span className="authed-achievement-icon">🏆</span>
              <span>查看成就 CG</span>
              <span className="authed-achievement-count">
                {unlockedAchievements} / {totalAchievements}
              </span>
            </button>
          </div>
        </section>

        <aside className="authed-dashboard relative h-full min-h-0 px-7 py-8">
          <div className="dashboard-card relative z-10 h-full">
            <div className="dashboard-card-content h-full overflow-y-auto overflow-x-hidden">
              <div className="dashboard-flow dashboard-flow-1">
                <DashboardSectionTitle icon="chart" title="公司概況" sub="COMPANY STATUS" />
              </div>
              <div className="dashboard-flow dashboard-flow-2 grid grid-cols-2 gap-3 mb-5">
                <StatTile icon="log" value={`第 ${day} 天`} label="DAY" />
                <StatTile icon="people" value={`${staffCount} 位員工`} label={`STAFF / ${maxStaff}`} />
              </div>

              <div className="dashboard-flow dashboard-flow-3">
                <DashboardSectionTitle icon="money" title="公司數據" sub="COMPANY DATA" />
              </div>
              <div className="dashboard-flow dashboard-flow-4 space-y-4 mb-5">
                <ProgressRow icon="money" label="資金" value={`$${money.toLocaleString()}`} target={`$${IPO_MONEY.toLocaleString()}`} percent={moneyPercent(money)} accent="#4fb7ff" />
                <ProgressRow icon="trophy" label="信譽" value={`${Math.round(reputation)}`} target={`${IPO_REPUTATION}`} percent={percent(reputation, IPO_REPUTATION)} accent="#55c7ff" />
                <ProgressRow icon="heart" label="士氣" value={`${morale}`} target="100" percent={morale} accent="#6ad7bf" />
                <ProgressRow icon="office" label="辦公室" value={`Lv.${officeLevel + 1}`} target={`Lv.${IPO_OFFICE_LEVEL + 1}`} percent={percent(officeLevel + 1, IPO_OFFICE_LEVEL + 1)} accent="#6aa7ff" />
              </div>

              <div className="dashboard-flow dashboard-flow-5 grid grid-cols-2 gap-3 mb-5">
                <MiniProgressCard icon="briefcase" title="完成案件" main={`${projectsCompleted} 件`} hint={`失敗 ${projectsFailed} 件`} percent={percent(projectsCompleted, IPO_PROJECTS)} />
                <MiniProgressCard icon="growth" title="IPO 進度" main={ipoAchievedAt ? '已上市' : `${ipoProgress}%`} hint={ipoAchievedAt ? `第 ${ipoAchievedAt} 天達成` : '距離上市更近一步'} percent={ipoAchievedAt ? 100 : ipoProgress} />
              </div>

              <div className="dashboard-flow dashboard-flow-6">
                <DashboardSectionTitle icon="log" title="最新消息" sub="NEWS" action="更多" />
              </div>
              <div className="dashboard-flow dashboard-flow-7 space-y-2">
                {(recentLogs.length ? recentLogs : ['公司已開張，先招募狗狗員工吧！']).map((msg, index) => (
                  <NewsItem key={`${msg}-${index}`} text={msg} meta={index === 0 ? '剛剛' : `${index + 1} 小時前`} />
                ))}
              </div>

              <div className="dashboard-flow dashboard-flow-8 dashboard-footer mt-4">
                <span>辦公室：{office?.name ?? '狗狗總部'}</span>
                <span>進行中 {activeProjects} 案 / 待接 {offeredProjects} 案</span>
                {bankrupt && <strong>公司目前破產中</strong>}
              </div>
            </div>
          </div>
        </aside>
      </main>

      <SharedSplashStyles />
      <style>{`
        .authed-stage {
          clip-path: polygon(0 0, 100% 0, calc(100% - 50px) 100%, 0 100%);
        }
        .authed-dashboard {
          isolation: isolate;
          margin-left: -46px;
          padding-left: 13px;
          padding-right: 24px;
        }
        .authed-dashboard::before {
          content: "";
          position: absolute;
          inset: 0 -64px 0 -18px;
          z-index: 0;
          background: linear-gradient(160deg, rgba(255,255,255,0.86), rgba(229,242,255,0.84));
          border-left: 1px solid rgba(193,216,248,0.88);
          box-shadow: -24px 0 60px rgba(46,104,180,0.17), inset 1px 0 0 rgba(255,255,255,0.95);
          transform: skewX(-7deg);
          transform-origin: center;
        }
        .dashboard-card {
          isolation: isolate;
          filter: drop-shadow(0 22px 50px rgba(53,112,194,0.16));
        }
        .dashboard-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(246,251,255,0.82));
          border: 1px solid rgba(207,225,249,0.86);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.94);
          backdrop-filter: blur(16px) saturate(135%);
          transform: skewX(-7deg);
          transform-origin: center;
        }
        .dashboard-card-content {
          position: relative;
          z-index: 1;
          padding: 32px clamp(24px, 2.2vw, 36px) 28px clamp(18px, 1.6vw, 26px);
          width: 100%;
        }
        .dashboard-flow {
          --dashboard-flow-offset: 0px;
          --dashboard-flow-trim: 0px;
          margin-left: var(--dashboard-flow-offset);
          width: calc(100% - var(--dashboard-flow-offset) - var(--dashboard-flow-trim));
          transition: margin-left 0.2s ease, width 0.2s ease;
        }
        .dashboard-flow-1 {
          --dashboard-flow-offset: clamp(104px, 7.8vw, 136px);
          --dashboard-flow-trim: clamp(54px, 4.1vw, 72px);
        }
        .dashboard-flow-2 {
          --dashboard-flow-offset: clamp(86px, 6.5vw, 112px);
          --dashboard-flow-trim: clamp(42px, 3.2vw, 58px);
        }
        .dashboard-flow-3 {
          --dashboard-flow-offset: clamp(68px, 5.1vw, 88px);
          --dashboard-flow-trim: clamp(32px, 2.4vw, 46px);
        }
        .dashboard-flow-4 {
          --dashboard-flow-offset: clamp(50px, 3.8vw, 66px);
          --dashboard-flow-trim: clamp(24px, 1.8vw, 34px);
        }
        .dashboard-flow-5 {
          --dashboard-flow-offset: clamp(32px, 2.5vw, 44px);
          --dashboard-flow-trim: clamp(16px, 1.2vw, 24px);
        }
        .dashboard-flow-6 {
          --dashboard-flow-offset: clamp(18px, 1.5vw, 28px);
          --dashboard-flow-trim: clamp(9px, 0.7vw, 14px);
        }
        .dashboard-flow-7 {
          --dashboard-flow-offset: clamp(8px, 0.8vw, 16px);
          --dashboard-flow-trim: clamp(4px, 0.4vw, 8px);
        }
        .dashboard-flow-8 { --dashboard-flow-offset: 0px; }
        .dashboard-flow-4 > div {
          --dashboard-row-offset: 0px;
          --dashboard-row-trim: 0px;
          margin-left: var(--dashboard-row-offset);
          width: calc(100% - var(--dashboard-row-offset) - var(--dashboard-row-trim));
        }
        .dashboard-flow-4 > div:nth-child(1) { --dashboard-row-offset: 36px; --dashboard-row-trim: 28px; }
        .dashboard-flow-4 > div:nth-child(2) { --dashboard-row-offset: 24px; --dashboard-row-trim: 18px; }
        .dashboard-flow-4 > div:nth-child(3) { --dashboard-row-offset: 12px; --dashboard-row-trim: 9px; }
        .dashboard-flow-4 > div:nth-child(4) { --dashboard-row-offset: 0px; }
        .dashboard-flow-5 > div {
          position: relative;
        }
        .dashboard-flow-5 > div:nth-child(1) {
          margin-left: 14px;
          width: calc(100% - 28px);
        }
        .dashboard-flow-5 > div:nth-child(2) {
          margin-left: 4px;
          width: calc(100% - 12px);
        }
        .dashboard-flow-7 > div {
          --dashboard-news-offset: 0px;
          --dashboard-news-trim: 0px;
          margin-left: var(--dashboard-news-offset);
          width: calc(100% - var(--dashboard-news-offset) - var(--dashboard-news-trim));
        }
        .dashboard-flow-7 > div:nth-child(1) { --dashboard-news-offset: 18px; --dashboard-news-trim: 16px; }
        .dashboard-flow-7 > div:nth-child(2) { --dashboard-news-offset: 9px; --dashboard-news-trim: 8px; }
        .dashboard-flow-7 > div:nth-child(n + 3) { --dashboard-news-offset: 0px; }
        .authed-start-button {
          min-width: 270px;
          height: 76px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.86);
          background: linear-gradient(180deg, #57a8ff, #257ee8);
          color: white;
          box-shadow: 0 18px 34px rgba(37,126,232,0.32), inset 0 1px 0 rgba(255,255,255,0.45);
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          letter-spacing: 0;
        }
        .authed-start-button span {
          font-size: clamp(24px, 2.25vw, 30px);
          line-height: 1;
        }
        .authed-start-button small {
          margin-top: 7px;
          font-size: 13px;
          letter-spacing: 0.12em;
          opacity: 0.75;
        }
        .authed-rank-button {
          width: 210px;
          height: 46px;
          border-radius: 8px;
          border: 1px solid rgba(210,226,248,0.9);
          background: rgba(255,255,255,0.82);
          color: #55749f;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 900;
          box-shadow: 0 12px 24px rgba(46,104,180,0.14);
        }
        .authed-achievement-button {
          width: 210px;
          height: 46px;
          border-radius: 8px;
          border: 1px solid rgba(255,212,148,0.9);
          background: linear-gradient(180deg, #fff7e0, #ffe9b8);
          color: #8a5a1c;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 900;
          box-shadow: 0 12px 24px rgba(204,138,42,0.18);
          cursor: pointer;
        }
        .authed-achievement-icon {
          font-size: 18px;
          line-height: 1;
        }
        .authed-achievement-count {
          margin-left: 4px;
          font-size: 12px;
          font-weight: 900;
          color: #b07020;
          background: rgba(255,255,255,0.6);
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid rgba(255,212,148,0.9);
        }
        .authed-status-strip {
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .authed-logout-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-height: 30px;
          padding: 7px 13px;
          border-radius: 999px;
          border: 1px solid rgba(210,226,248,0.9);
          background: rgba(255,255,255,0.88);
          color: #6f83a5;
          box-shadow: 0 10px 22px rgba(46,104,180,0.12);
          font-size: 12px;
          font-weight: 900;
        }
        .dashboard-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          color: #7c95bc;
          font-size: 12px;
          font-weight: 800;
        }
        .dashboard-footer strong {
          color: #d65050;
        }
        @media (max-width: 1279px) {
          .authed-shell {
            overflow-y: auto;
          }
          .authed-main {
            height: auto;
            min-height: calc(100vh - 76px);
            display: block;
          }
          .authed-header {
            height: 76px;
            padding-left: 18px;
            padding-right: 18px;
          }
          .authed-stage {
            min-height: 560px;
            clip-path: none;
          }
          .authed-dashboard {
            margin-left: 0;
            padding: 18px;
          }
          .authed-dashboard::before {
            inset: 0;
            transform: none;
          }
          .dashboard-card {
            height: auto;
          }
          .dashboard-card::before {
            transform: none;
          }
          .dashboard-card-content {
            height: auto;
            padding: 28px;
            width: 100%;
          }
          .dashboard-flow {
            margin-left: 0;
            width: 100%;
          }
          .dashboard-flow-4 > div,
          .dashboard-flow-7 > div {
            margin-left: 0;
            width: 100%;
          }
          .dashboard-flow-5 > div {
            margin-left: 0;
            width: 100%;
          }
        }
        @media (max-width: 640px) {
          .authed-stage {
            min-height: 470px;
          }
          .authed-start-button {
            min-width: min(270px, calc(100vw - 48px));
            height: 68px;
          }
          .authed-start-button span {
            font-size: 24px;
          }
          .dashboard-card-content {
            padding: 20px 16px;
          }
        }
      `}</style>
    </div>
  );
}

function LogoLockup() {
  return (
    <div className="flex items-center gap-3">
      <SvgIcon name="appDog" size={48} />
      <div className="text-left">
        <div className="text-3xl md:text-4xl font-extrabold leading-none" style={{ color: '#173b78' }}>狗狗公司</div>
        <div className="text-[11px] font-extrabold tracking-[0.18em]" style={{ color: '#2f8df4' }}>DOGGO CORP</div>
      </div>
    </div>
  );
}

function DashboardSectionTitle({ icon, title, sub, action }: { icon: SvgIconName; title: string; sub: string; action?: string }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div className="inline-flex items-center gap-2">
        <SvgIcon name={icon} size={22} />
        <div className="text-left">
          <div className="text-xl font-extrabold leading-none" style={{ color: '#446da8' }}>{title}</div>
          <div className="text-[10px] font-extrabold tracking-[0.12em]" style={{ color: '#b8c7dd' }}>{sub}</div>
        </div>
      </div>
      {action && <span className="text-xs font-extrabold" style={{ color: '#8ca5ca' }}>{action} &gt;</span>}
    </div>
  );
}

function StatTile({ icon, value, label }: { icon: SvgIconName; value: string; label: string }) {
  return (
    <div
      className="h-[82px] rounded-lg px-3 flex items-center justify-between gap-2"
      style={{
        background: 'rgba(246,251,255,0.86)',
        border: '1px solid rgba(207,225,249,0.92)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.92), 0 8px 18px rgba(64,121,193,0.08)',
      }}
    >
      <div className="text-left min-w-0 flex-1">
        <div className="text-xl font-extrabold whitespace-nowrap" style={{ color: '#5a8ce6' }}>{value}</div>
        <div className="text-[11px] font-extrabold tracking-[0.08em]" style={{ color: '#a7b8d0' }}>{label}</div>
      </div>
      <SvgIcon name={icon} size={26} />
    </div>
  );
}

function ProgressRow({
  icon,
  label,
  value,
  target,
  percent,
  accent,
}: {
  icon: SvgIconName;
  label: string;
  value: string;
  target: string;
  percent: number;
  accent: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-1.5">
        <SvgIcon name={icon} size={30} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-base font-extrabold" style={{ color: '#446da8' }}>{label}</span>
            <span className="text-xl font-extrabold truncate" style={{ color: '#5a8ce6' }}>
              {value} <small className="text-xs" style={{ color: '#9db0cc' }}>/ {target}</small>
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full overflow-hidden" style={{ background: '#d9e7f8' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, percent)}%`, background: accent }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniProgressCard({ icon, title, main, hint, percent }: { icon: SvgIconName; title: string; main: string; hint: string; percent: number }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: 'rgba(255,255,255,0.86)',
        border: '1px solid rgba(207,225,249,0.92)',
        boxShadow: '0 10px 22px rgba(64,121,193,0.09)',
      }}
    >
      <div className="flex items-center gap-3">
        <SvgIcon name={icon} size={34} />
        <div className="text-left min-w-0">
          <div className="text-sm font-extrabold" style={{ color: '#5979a6' }}>{title}</div>
          <div className="text-2xl font-extrabold truncate" style={{ color: '#5a9dff' }}>{main}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] font-extrabold whitespace-nowrap" style={{ color: '#8fa5c3' }}>{hint}</span>
        <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ background: '#d9e7f8' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, percent)}%`, background: '#5aa7ff' }} />
        </div>
      </div>
    </div>
  );
}

function NewsItem({ text, meta }: { text: string; meta: string }) {
  return (
    <div
      className="rounded-lg px-4 py-3 flex items-start gap-3"
      style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(224,235,249,0.8)' }}
    >
      <SvgIcon name="quality" size={24} />
      <div className="text-left flex-1 min-w-0">
        <div className="text-sm font-extrabold truncate" style={{ color: '#4f6f9f' }}>{text}</div>
        <div className="text-[11px] font-bold mt-0.5" style={{ color: '#9aacc5' }}>{meta}</div>
      </div>
    </div>
  );
}

function StatusLine({ icon, children }: { icon: SvgIconName; children: ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold"
      style={{
        background: 'rgba(255,255,255,0.9)',
        color: '#55749f',
        border: '1px solid rgba(210,226,248,0.9)',
        boxShadow: '0 10px 22px rgba(46,104,180,0.12)',
      }}
    >
      <SvgIcon name={icon} size={16} />
      {children}
    </div>
  );
}

function MetallicTrophy({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      style={{
        filter: 'drop-shadow(0 6px 10px rgba(15,40,80,0.32)) drop-shadow(0 1px 0 rgba(255,255,255,0.35))',
      }}
    >
      <defs>
        <linearGradient id="cupGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfe5ff" />
          <stop offset="35%" stopColor="#7fb1e8" />
          <stop offset="70%" stopColor="#3a6fb5" />
          <stop offset="100%" stopColor="#1d3f7a" />
        </linearGradient>
        <linearGradient id="cupShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9bc4ec" />
          <stop offset="100%" stopColor="#2a5594" />
        </linearGradient>
      </defs>
      <path d="M18 16c-6 0-9 4-9 9 0 6 4 11 11 12" fill="none" stroke="url(#cupGrad)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M46 16c6 0 9 4 9 9 0 6-4 11-11 12" fill="none" stroke="url(#cupGrad)" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M16 10h32v14c0 9-6 16-16 16s-16-7-16-16V10Z" fill="url(#cupGrad)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <path d="M20 13h3v18c0 4 1 7 3 9-4-2-7-7-7-13V13Z" fill="url(#cupShine)" opacity="0.85" />
      <path d="M44 13v15c0 5-3 9-7 11 5-1 9-6 9-12V13h-2Z" fill="rgba(15,40,80,0.32)" />
      <rect x="29" y="40" width="6" height="8" rx="1.2" fill="url(#cupGrad)" />
      <path d="M20 50h24l-2 6H22l-2-6Z" fill="url(#baseGrad)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <circle cx="32" cy="22" r="2" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

function SharedSplashStyles() {
  return (
    <style>{`
      .auth-slanted-panel {
        --auth-skew: -7deg;
        padding-left: clamp(9px, 0.8vw, 15px);
        padding-right: clamp(22px, 1.8vw, 34px);
        isolation: isolate;
      }
      .auth-slanted-panel::before {
        content: "";
        position: absolute;
        inset: 0 -72px 0 -36px;
        z-index: -1;
        background: linear-gradient(165deg, rgba(255,255,255,0.92), rgba(233,244,255,0.88));
        border-left: 1px solid rgba(190,215,248,0.9);
        box-shadow: -24px 0 60px rgba(46,104,180,0.18), inset 1px 0 0 rgba(255,255,255,0.95);
        transform: skewX(var(--auth-skew));
        transform-origin: center;
      }
      @media (max-width: 1023px) {
        .unauth-header {
          height: 76px;
          padding-left: 18px;
          padding-right: 18px;
        }
        .unauth-main {
          height: calc(100vh - 76px);
          min-height: 0;
          display: block;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 14px 14px 20px;
        }
        .unauth-hero {
          padding: 8px 8px 16px !important;
        }
        .unauth-hero h1 {
          font-size: 36px;
        }
        .auth-slanted-panel {
          height: auto;
          min-height: auto;
          padding-left: 14px;
          padding-right: 14px;
          padding-top: 18px;
          padding-bottom: 18px;
          border-radius: 24px;
          border-left: 0 !important;
        }
        .auth-slanted-panel::before {
          inset: 0;
          border-radius: 24px;
          transform: none;
        }
        .auth-panel-footer {
          position: static !important;
          margin-top: 18px;
          width: 100%;
          height: auto !important;
          flex-wrap: wrap;
          padding: 14px;
        }
      }
      @media (max-width: 640px) {
        .unauth-hero p {
          display: none;
        }
        .unauth-hero {
          padding-bottom: 10px !important;
        }
        .auth-panel-footer {
          gap: 10px !important;
          font-size: 11px !important;
        }
      }
    `}</style>
  );
}

function averageMorale(staff: { morale: number }[]): number {
  if (staff.length === 0) return 0;
  return Math.round(staff.reduce((sum, dog) => sum + dog.morale, 0) / staff.length);
}

function percent(current: number, target: number): number {
  if (target <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

function moneyPercent(money: number): number {
  return percent(Math.max(0, money), IPO_MONEY);
}
