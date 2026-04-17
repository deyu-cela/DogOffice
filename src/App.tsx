import { useGameStore } from '@/store/gameStore';
import { useGameLoop } from '@/hooks/useGameLoop';
import { Panel } from '@/components/Panel';
import { Toast } from '@/components/Toast';
import { SplashScreen } from '@/features/splash/SplashScreen';
import { Tutorial } from '@/features/tutorial/Tutorial';
import { StatPanel } from '@/features/hud/StatPanel';
import { DayTimer } from '@/features/hud/DayTimer';
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
  const showSplash = useGameStore((s) => s.showSplash);
  const activeTab = useGameStore((s) => s.activeTab);
  const setTab = useGameStore((s) => s.setActiveTab);
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
      <div
        className="mx-auto p-5 gap-4 min-h-screen"
        style={{
          maxWidth: 1440,
          display: 'grid',
          gridTemplateColumns: '340px 1fr 320px',
        }}
      >
        <Panel>
          <StatPanel />
          <DayTimer />
          <ResumeCard />
        </Panel>

        <OfficeScene />

        <Panel>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTab('shop')}
              className="flex-1 text-sm"
              style={{
                background: activeTab === 'shop' ? 'linear-gradient(180deg, #ffcf6b, #ff9f43)' : '#fff',
                color: activeTab === 'shop' ? 'white' : 'var(--text)',
              }}
            >
              🛍️ 商店
            </button>
            <button
              onClick={() => setTab('staff')}
              className="flex-1 text-sm"
              style={{
                background: activeTab === 'staff' ? 'linear-gradient(180deg, #ffcf6b, #ff9f43)' : '#fff',
                color: activeTab === 'staff' ? 'white' : 'var(--text)',
              }}
            >
              🐕 員工 ({staff.length})
            </button>
          </div>
          {activeTab === 'shop' ? <ShopPanel /> : <StaffList />}
          <div className="mt-4">
            <div className="text-xs font-bold mb-1.5" style={{ color: 'var(--muted)' }}>
              📜 日誌
            </div>
            <GameLog />
          </div>
        </Panel>
      </div>

      <Toast />
      {showSplash && <SplashScreen />}
      <Tutorial />
      {miniGame?.type === 'frisbee' && <FrisbeeGame />}
      {miniGame?.type === 'memory' && <MemoryGame />}
      {trainingSession && <TrainingQuiz />}
      {staffModal && <StaffActionModal />}

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
              onClick={restart}
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
