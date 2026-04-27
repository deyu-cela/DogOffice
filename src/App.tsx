import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useAutoSave } from '@/hooks/useAutoSave';
import { DailySummary } from '@/components/DailySummary';
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
import { TraitChoiceModal } from '@/features/staff/TraitChoiceModal';
import { VictoryModal } from '@/features/victory/VictoryModal';
import { FrisbeeGame } from '@/features/minigames/FrisbeeGame';
import { MemoryGame } from '@/features/minigames/MemoryGame';
import { TrainingQuiz } from '@/features/minigames/TrainingQuiz';
import { ProjectEventModal } from '@/features/clients/ProjectEventModal';
import { ProjectsBar } from '@/features/clients/ProjectsBar';
import { BankLoanModal } from '@/features/loan/BankLoanModal';
import { SvgIcon } from '@/components/SvgIcon';

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

        <div className="pane-main flex flex-col gap-3">
          <ProjectsBar />
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

      <DailySummary />
      {showSplash && <SplashScreen />}
      <Tutorial />
      <BuildingDrawer />
      {miniGame?.type === 'frisbee' && <FrisbeeGame />}
      {miniGame?.type === 'memory' && <MemoryGame />}
      {trainingSession && <TrainingQuiz />}
      {staffModal && <StaffActionModal />}
      <ProjectEventModal />
      <TraitChoiceModal />
      <BankLoanModal />
      <VictoryModal />
      <ConflictModal />

      {bankrupt && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-[#08204d]/60 backdrop-blur-sm p-6">
          <div className="text-center rounded-xl p-8 max-w-md" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))', border: '1px solid var(--line)', boxShadow: '0 24px 70px rgba(30,90,180,0.28)' }}>
            <div className="mx-auto mb-3 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: '#fff7f7', border: '1px solid rgba(255,112,112,0.24)' }}>
              <SvgIcon name="warning" size={38} />
            </div>
            <div className="text-3xl font-extrabold mb-3">公司破產了...</div>
            <div className="text-base mb-4" style={{ color: 'var(--muted)' }}>
              狗狗們含著眼淚收拾行李離開了辦公室...
              <br />
              也許下次會經營得更好！
            </div>
            <div className="text-sm mb-5 p-3 rounded-lg" style={{ background: '#f7fbff', border: '1px solid var(--line)' }}>
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
              style={{ background: 'linear-gradient(180deg, #2f8df4, #1c63c8)', color: 'white' }}
            >
              重新開始
            </button>
          </div>
        </div>
      )}
    </>
  );
}
