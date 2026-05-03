import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useAutoSave } from '@/hooks/useAutoSave';
import { DailySummary } from '@/components/DailySummary';
import { SplashScreen } from '@/features/splash/SplashScreen';
import { StudioIntro } from '@/features/intro/StudioIntro';
import { Tutorial } from '@/features/tutorial/Tutorial';
import { ConflictModal } from '@/features/save/ConflictModal';
import { OfficeScene } from '@/features/office/OfficeScene';
import { BuildingDrawer } from '@/features/office/BuildingDrawer';
import { FacilityInfoPopup } from '@/features/office/FacilityInfoPopup';
import { MoneyDayCluster } from '@/features/hud/MoneyDayCluster';
import { TopRightButtons } from '@/features/hud/TopRightButtons';
import { StatBars } from '@/features/hud/StatBars';
import { StaffActionModal } from '@/features/staff/StaffActionModal';
import { TeamEditModal } from '@/features/staff/TeamEditModal';
import { TraitChoiceModal } from '@/features/staff/TraitChoiceModal';
import { ToolPickerModal } from '@/features/staff/ToolPickerModal';
import { GachaModal } from '@/features/recruit/GachaModal';
import { ShopModal } from '@/features/shop/ShopModal';
import { ProjectDetailModal } from '@/features/clients/ProjectDetailModal';
import { FrisbeeGame } from '@/features/minigames/FrisbeeGame';
import { MemoryGame } from '@/features/minigames/MemoryGame';
import { TrainingQuiz } from '@/features/minigames/TrainingQuiz';
import { SubmitRecordModal } from '@/features/leaderboard/SubmitRecordModal';
import { BankLoanModal } from '@/features/loan/BankLoanModal';
import { AchievementsScreen } from '@/features/achievements/AchievementsScreen';
import { CreditsScreen } from '@/features/credits/CreditsScreen';
import { AchievementToast } from '@/features/achievements/AchievementToast';
import { CoinBurstOverlay } from '@/components/CoinBurstOverlay';
import { ToolDropOverlay } from '@/components/ToolDropOverlay';
import { StarterPackModal } from '@/features/starterPack/StarterPackModal';
import { StarterPackBanner } from '@/features/starterPack/StarterPackBanner';
import { useUiStore } from '@/store/uiStore';
import { SvgIcon } from '@/components/SvgIcon';
import { BgmController, type BgmScene } from '@/components/BgmController';
import { displayCompanyName } from '@/lib/companyName';

const STARTER_PACK_SESSION_KEY = 'dogoffice:starter-pack-shown';

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
  const resetGame = useGameStore((s) => s.resetToInitialGame);

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
      resetGame();
    }
  }, [authedUserId, loadCloud, resetSaveStore, resetGame]);

  const bankrupt = useGameStore((s) => s.bankrupt);
  const miniGame = useGameStore((s) => s.miniGame);
  const trainingSession = useGameStore((s) => s.trainingSession);
  const staffModal = useGameStore((s) => s.staffActionModal);
  const day = useGameStore((s) => s.day);
  const staff = useGameStore((s) => s.staff);
  const money = useGameStore((s) => s.money);
  const companyName = useGameStore((s) => s.companyName);
  const restart = useGameStore((s) => s.restart);
  const showAchievements = useUiStore((s) => s.showAchievements);
  const showCredits = useUiStore((s) => s.showCredits);
  const bgmScene: BgmScene = showAchievements ? 'memories' : showSplash ? 'splash' : 'office';
  const claimedStarterPack = useGameStore((s) => s.claimedStarterPack);
  const openStarterPack = useUiStore((s) => s.openStarterPack);
  const teamModalOpen = useUiStore((s) => s.teamModalOpen);
  const closeTeamModal = useUiStore((s) => s.closeTeamModal);
  const projectDetailId = useUiStore((s) => s.projectDetailId);
  const closeProjectDetail = useUiStore((s) => s.closeProjectDetail);

  useEffect(() => {
    if (showSplash || claimedStarterPack) return;
    if (sessionStorage.getItem(STARTER_PACK_SESSION_KEY) === '1') return;
    sessionStorage.setItem(STARTER_PACK_SESSION_KEY, '1');
    openStarterPack();
  }, [showSplash, claimedStarterPack, openStarterPack]);

  return (
    <>
      {/* 主容器：iso 視野（26:21）+ 100px 邊距，封頂 1600；不超過視窗寬 */}
      <div
        className="relative mx-auto h-screen overflow-hidden"
        style={{ width: 'min(100vw, calc(100vh * 26 / 21 + 100px), 1600px)' }}
      >
        {/* 工作室背景 */}
        <div className="absolute inset-0 overflow-hidden">
          <OfficeScene />
        </div>

        {/* HUD overlay（受 max-width 容器限制） */}
        <MoneyDayCluster />
        <TopRightButtons />
        <StatBars />
        {!showSplash && <StarterPackBanner />}
      </div>

      {/* Modals / overlays（fullscreen，不受 max-width 限制） */}
      <DailySummary />
      {showSplash && <SplashScreen />}
      <Tutorial />
      <BuildingDrawer />
      {miniGame?.type === 'frisbee' && <FrisbeeGame />}
      {miniGame?.type === 'memory' && <MemoryGame />}
      <SubmitRecordModal />
      {trainingSession && <TrainingQuiz />}
      {staffModal && <StaffActionModal />}
      {teamModalOpen && <TeamEditModal onClose={closeTeamModal} />}
      <GachaModal />
      <ShopModal />
      <FacilityInfoPopup />
      {projectDetailId && (
        <ProjectDetailModal projectId={projectDetailId} onClose={closeProjectDetail} />
      )}
      <TraitChoiceModal />
      <ToolPickerModal />
      <BankLoanModal />
      <ConflictModal />
      {showAchievements && <AchievementsScreen />}
      {showCredits && <CreditsScreen />}
      <AchievementToast />
      <CoinBurstOverlay />
      <ToolDropOverlay />
      <StudioIntro />
      <BgmController scene={bgmScene} />
      <StarterPackModal />

      {bankrupt && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-[#08204d]/60 backdrop-blur-sm p-6">
          <div className="text-center rounded-xl p-8 max-w-md" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))', border: '1px solid var(--line)', boxShadow: '0 24px 70px rgba(30,90,180,0.28)' }}>
            <div className="mx-auto mb-3 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: '#fff7f7', border: '1px solid rgba(255,112,112,0.24)' }}>
              <SvgIcon name="warning" size={38} />
            </div>
            <div className="text-3xl font-extrabold mb-3">{displayCompanyName(companyName)}破產了...</div>
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
