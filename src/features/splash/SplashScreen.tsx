import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { LeaderboardPanel } from '@/features/leaderboard/LeaderboardPanel';

export function SplashScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const moneyGoal = useGameStore((s) => s.moneyGoal);
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const saveStatus = useSaveStore((s) => s.status);
  const cloud = useSaveStore((s) => s.cloud);
  const saveError = useSaveStore((s) => s.error);
  const base = import.meta.env.BASE_URL;
  const [lbOpen, setLbOpen] = useState(false);

  const authed = authStatus === 'authed' && !!user;
  const bootstrapping = authStatus === 'bootstrapping';
  const loadingSave = saveStatus === 'loading';
  const hasSave = !!cloud?.data;

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center text-center p-8 overflow-auto"
      style={{
        backgroundImage: `linear-gradient(rgba(255,245,230,0.78), rgba(255,245,230,0.88)), url('${base}assets/start-screen.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="text-5xl md:text-6xl font-extrabold mb-2 drop-shadow-lg" style={{ color: '#5b3c2b' }}>
        🐕 狗狗公司
      </div>
      <div className="text-base md:text-xl mb-6" style={{ color: '#7a685a' }}>
        可愛又療癒的狗狗經營小遊戲
      </div>

      {bootstrapping && (
        <div
          className="px-6 py-4 rounded-2xl text-sm font-bold"
          style={{ background: 'rgba(255,255,255,0.85)', color: '#7a685a' }}
        >
          ⏳ 正在確認登入狀態…
        </div>
      )}

      {!bootstrapping && authed && (
        <>
          <div className="mb-3 text-base md:text-lg" style={{ color: '#5b3c2b' }}>
            歡迎回來，<span className="font-extrabold">{user?.account}</span>！
          </div>

          {loadingSave && (
            <div
              className="mb-5 px-4 py-2 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.85)', color: '#7a685a' }}
            >
              ☁️ 讀取雲端存檔中…
            </div>
          )}

          {!loadingSave && hasSave && cloud && (
            <div
              className="mb-5 px-4 py-2 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.85)', color: '#5b3c2b' }}
            >
              上次進度：第 {cloud.data.day} 天 ｜ ${cloud.data.money} ｜ {cloud.data.staff.length} 位員工
              {cloud.data.bankrupt && <span style={{ color: '#d75d5d' }}>（已破產）</span>}
            </div>
          )}

          {!loadingSave && saveError && !hasSave && (
            <div
              className="mb-5 px-4 py-2 rounded-xl text-xs"
              style={{ background: '#ffe6e6', color: '#a03d3d' }}
            >
              ⚠️ 讀取存檔失敗，可以開新的公司繼續玩
            </div>
          )}

          {!hasSave && !loadingSave && (
            <div
              className="mb-4 px-4 py-2 rounded-full text-xs"
              style={{ background: 'rgba(255,255,255,0.85)', color: '#5b3c2b', border: '1px solid rgba(90,70,54,0.15)' }}
            >
              🎯 目標：$
              <span className="font-extrabold">{moneyGoal.toLocaleString()}</span>
            </div>
          )}

          <button
            onClick={startGame}
            disabled={loadingSave}
            className="px-12 py-4 text-2xl rounded-full font-extrabold"
            style={{
              background: loadingSave ? '#c9a57b' : 'linear-gradient(180deg, #ffc7d1, #eb93a3)',
              color: 'white',
              cursor: loadingSave ? 'wait' : 'pointer',
              boxShadow: '0 8px 24px rgba(255,159,67,0.4)',
            }}
          >
            {loadingSave ? '讀取中…' : hasSave ? '繼續經營' : '開始經營'}
          </button>

          <button
            type="button"
            onClick={() => setLbOpen(true)}
            className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.85)', color: '#7a685a', border: '1px solid rgba(90,70,54,0.15)' }}
          >
            🏆 查看排行榜
          </button>
        </>
      )}

      {!bootstrapping && !authed && <AuthScreen />}

      {lbOpen && <LeaderboardPanel onClose={() => setLbOpen(false)} />}
    </div>
  );
}
