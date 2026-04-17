import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useAutoSave } from '@/hooks/useAutoSave';
import { companyStage } from '@/lib/utils';
import { Panel, Badge } from '@/components/Panel';
import { Toast } from '@/components/Toast';
import { SplashScreen } from '@/features/splash/SplashScreen';
import { Tutorial } from '@/features/tutorial/Tutorial';
import { StatPanel } from '@/features/hud/StatPanel';
import { DayTimer } from '@/features/hud/DayTimer';
import { UserBadge } from '@/features/hud/UserBadge';
import { SaveIndicator } from '@/features/hud/SaveIndicator';
import { RestartButton } from '@/features/hud/RestartButton';
import { ConflictModal } from '@/features/save/ConflictModal';
import { ResumeCard } from '@/features/recruit/ResumeCard';
import { OfficeScene } from '@/features/office/OfficeScene';
import { ShopPanel } from '@/features/shop/ShopPanel';
import { StaffList } from '@/features/staff/StaffList';
import { StaffActionModal } from '@/features/staff/StaffActionModal';
import { GameLog } from '@/features/log/GameLog';
import { FrisbeeGame } from '@/features/minigames/FrisbeeGame';
import { MemoryGame } from '@/features/minigames/MemoryGame';
import { TrainingQuiz } from '@/features/minigames/TrainingQuiz';

export default function App() {
  useGameLoop();
  useAutoSave();
  const showSplash = useGameStore((s) => s.showSplash);
  const setShowSplash = useGameStore((s) => s.setShowSplash);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const forcedLogoutReason = useAuthStore((s) => s.forcedLogoutReason);
  const authedUser = useAuthStore((s) => s.user);
  const authedUserId = authedUser?.userId ?? null;
  const loadCloud = useSaveStore((s) => s.loadCloud);
  const resetSaveStore = useSaveStore((s) => s.reset);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (forcedLogoutReason) setShowSplash(true);
  }, [forcedLogoutReason, setShowSplash]);

  useEffect(() => {
    if (authedUserId) {
      loadCloud();
    } else {
      resetSaveStore();
    }
  }, [authedUserId, loadCloud, resetSaveStore]);
  const activeTab = useGameStore((s) => s.activeTab);
  const setTab = useGameStore((s) => s.setActiveTab);
  const bankrupt = useGameStore((s) => s.bankrupt);
  const miniGame = useGameStore((s) => s.miniGame);
  const trainingSession = useGameStore((s) => s.trainingSession);
  const staffModal = useGameStore((s) => s.staffActionModal);
  const day = useGameStore((s) => s.day);
  const staff = useGameStore((s) => s.staff);
  const money = useGameStore((s) => s.money);
  const morale = useGameStore((s) => s.morale);
  const health = useGameStore((s) => s.health);
  const decor = useGameStore((s) => s.decor);
  const restart = useGameStore((s) => s.restart);
  const stage = companyStage(health, morale, staff.length, decor);

  return (
    <>
      <style>{`
        .app-grid { grid-template-columns: 1fr; }
        @media (min-width: 768px) {
          .app-grid {
            grid-template-columns: 1fr 320px;
            grid-template-areas: "office right" "left right";
          }
          .pane-left { grid-area: left; }
          .pane-office { grid-area: office; }
          .pane-right { grid-area: right; }
        }
        @media (min-width: 1280px) {
          .app-grid {
            grid-template-columns: 340px 1fr 320px;
            grid-template-areas: "left office right";
          }
        }
      `}</style>
      <div
        className="app-grid mx-auto p-3 md:p-5 gap-3 md:gap-4 min-h-screen grid"
        style={{ maxWidth: 1440 }}
      >
        <Panel className="pane-left">
          <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
            <h1 className="text-xl font-extrabold">🐶 狗狗公司</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge>第 {day} 天</Badge>
              {authedUser && (
                <>
                  <SaveIndicator />
                  <UserBadge />
                </>
              )}
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            你是狗狗老闆，面試狗狗、決定錄用。公司會每天自動結算，擴建、培養、陪玩都會影響經營。
          </p>
          <DayTimer />
          <StatPanel />
          <ResumeCard />
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <div className="text-xs font-bold" style={{ color: 'var(--muted)' }}>
                📜 日誌
              </div>
              {authedUser && <RestartButton />}
            </div>
            <GameLog />
          </div>
        </Panel>

        <div className="pane-office">
          <OfficeScene />
        </div>

        <Panel className="pane-right">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTab('shop')}
              className="flex-1 text-sm"
              style={{
                background: activeTab === 'shop' ? 'linear-gradient(180deg, #ffcf6b, #ff9f43)' : '#fff',
                color: activeTab === 'shop' ? 'white' : 'var(--text)',
              }}
            >
              🛒 商店
            </button>
            <button
              onClick={() => setTab('staff')}
              className="flex-1 text-sm"
              style={{
                background: activeTab === 'staff' ? 'linear-gradient(180deg, #ffcf6b, #ff9f43)' : '#fff',
                color: activeTab === 'staff' ? 'white' : 'var(--text)',
              }}
            >
              👥 員工 ({staff.length})
            </button>
          </div>
          {activeTab === 'shop' ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-extrabold">🛒 商店</h2>
                <Badge>{stage}</Badge>
              </div>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
                先擴建才能請更多狗。裝飾、設備、制度都會讓辦公室更像真的公司。
              </p>
              <ShopPanel />
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-extrabold">👥 員工狗狗</h2>
                <Badge>{staff.length} 位</Badge>
              </div>
              <StaffList />
            </>
          )}
        </Panel>
      </div>

      <Toast />
      {showSplash && <SplashScreen />}
      <Tutorial />
      {miniGame?.type === 'frisbee' && <FrisbeeGame />}
      {miniGame?.type === 'memory' && <MemoryGame />}
      {trainingSession && <TrainingQuiz />}
      {staffModal && <StaffActionModal />}
      <ConflictModal />

      {bankrupt && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/60 p-6">
          <div className="text-center rounded-3xl p-8 max-w-md" style={{ background: '#fffaf0', border: '2px solid rgba(90,70,54,0.12)' }}>
            <div className="text-8xl mb-3">🐕💔</div>
            <div className="text-3xl font-extrabold mb-3">公司破產了...</div>
            <div className="text-base mb-4" style={{ color: 'var(--muted)' }}>
              狗狗們含著眼淚收拾行李離開了辦公室...
              <br />
              也許下次會經營得更好！
            </div>
            <div className="text-sm mb-5 p-3 rounded-xl" style={{ background: 'white' }}>
              撐了 {day} 天｜{staff.length} 位員工
              <br />
              最終資金 ${money}
            </div>
            <button
              onClick={async () => {
                await useSaveStore.getState().clearCloud();
                restart();
              }}
              className="px-8"
              style={{ background: 'linear-gradient(180deg, #ffcf6b, #ff9f43)', color: 'white' }}
            >
              重新開始
            </button>
          </div>
        </div>
      )}
    </>
  );
}

