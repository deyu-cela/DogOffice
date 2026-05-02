import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import { useUiStore } from '@/store/uiStore';
import { ACHIEVEMENTS } from '@/features/achievements/achievementConfigs';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { LeaderboardPanel } from '@/features/leaderboard/LeaderboardPanel';
import { LoginScrapbook } from './LoginScrapbook';
import { LobbyCard } from './LobbyCard';
import { CompanyNameModal } from './CompanyNameModal';
import { displayCompanyName } from '@/lib/companyName';

export function SplashScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const setCompanyName = useGameStore((s) => s.setCompanyName);
  const companyName = useGameStore((s) => s.companyName);
  const day = useGameStore((s) => s.day);
  const money = useGameStore((s) => s.money);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const staff = useGameStore((s) => s.staff);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);
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
  const [namingOpen, setNamingOpen] = useState(false);

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

  function handleStart() {
    if (!companyName || companyName.trim() === '') {
      setNamingOpen(true);
      return;
    }
    startGame();
  }

  function handleConfirmName(name: string) {
    setCompanyName(name);
    setNamingOpen(false);
    startGame();
  }

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
    <div className="fixed inset-0 z-[1000] overflow-hidden">
      <LoginScrapbook base={base}>
        {unauthenticated ? (
          <AuthScreen />
        ) : (
          <LobbyCard
            account={user?.account ?? '老闆'}
            companyName={displayCompanyName(companyName)}
            day={day}
            money={money}
            officeLevel={officeLevel}
            staffCount={staff.length}
            projectsCompleted={projectsCompleted}
            ipoAchievedAt={ipoAchievedAt}
            bankrupt={bankrupt}
            hasSave={hasSave}
            loadingSave={loadingSave}
            saveError={saveError}
            bootstrapping={bootstrapping}
            loggingOut={loggingOut}
            unlockedAchievements={unlockedAchievementIds.length}
            totalAchievements={ACHIEVEMENTS.length}
            onStart={handleStart}
            onLogout={onLogout}
            onLeaderboard={() => setLbOpen(true)}
            onAchievements={openAchievements}
          />
        )}
      </LoginScrapbook>

      {lbOpen && <LeaderboardPanel onClose={() => setLbOpen(false)} />}
      {namingOpen && <CompanyNameModal onConfirm={handleConfirmName} />}
    </div>
  );
}
