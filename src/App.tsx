import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Toast } from '@/components/Toast';
import { SplashScreen } from '@/features/splash/SplashScreen';
import { Tutorial } from '@/features/tutorial/Tutorial';
import { ConflictModal } from '@/features/save/ConflictModal';
import { OfficeScene } from '@/features/office/OfficeScene';
import { BuildingDrawer } from '@/features/office/BuildingDrawer';
import { TopBar } from '@/features/hud/TopBar';
import { RightPanel } from '@/features/hud/RightPanel';
import { LogBar } from '@/features/hud/LogBar';
import { InfoButton } from '@/features/hud/InfoButton';
import { StaffActionModal } from '@/features/staff/StaffActionModal';
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

  const bankrupt = useGameStore((s) => s.bankrupt);
  const miniGame = useGameStore((s) => s.miniGame);
  const trainingSession = useGameStore((s) => s.trainingSession);
  const staffModal = useGameStore((s) => s.staffActionModal);
  const day = useGameStore((s) => s.day);
  const staff = useGameStore((s) => s.staff);
  const money = useGameStore((s) => s.money);
  const restart = useGameStore((s) => s.restart);

  return (
    <>
      <style>{`
        .app-grid {
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr auto;
          grid-template-areas:
            "top"
            "main"
            "log";
        }
        .pane-top { grid-area: top; }
        .pane-main { grid-area: main; min-width: 0; }
        .pane-log { grid-area: log; }
        .pane-right { display: none; }

        @media (min-width: 1024px) {
          .app-grid {
            grid-template-columns: 1fr 360px;
            grid-template-rows: auto 1fr auto;
            grid-template-areas:
              "top top"
              "main right"
              "log log";
          }
          .pane-right {
            display: flex;
            flex-direction: column;
            grid-area: right;
            min-width: 0;
            min-height: 0;
          }
        }
      `}</style>
      <div
        className="app-grid mx-auto p-3 md:p-5 gap-3 md:gap-4 min-h-screen grid"
        style={{ maxWidth: 1440 }}
      >
        <div className="pane-top">
          <TopBar />
        </div>

        <div className="pane-main">
          <OfficeScene />
        </div>

        <div className="pane-right">
          <RightPanel />
        </div>

        <div className="pane-log">
          <LogBar />
        </div>
      </div>

      <InfoButton />

      <Toast />
      {showSplash && <SplashScreen />}
      <Tutorial />
      <BuildingDrawer />
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
