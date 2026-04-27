import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { LeaderboardPanel } from '@/features/leaderboard/LeaderboardPanel';

export function SplashScreen() {
  const startGame = useGameStore((s) => s.startGame);
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
         狗狗公司
      </div>
      <div className="text-base md:text-xl mb-6" style={{ color: '#7a685a' }}>
        可愛又療癒的狗狗經營小遊戲
      </div>

      {bootstrapping && (
        <div
          className="px-6 py-4 rounded-2xl text-sm font-bold"
          style={{ background: 'rgba(255,255,255,0.85)', color: '#7a685a' }}
        >
           正在確認登入狀態…
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
               讀取雲端存檔中…
            </div>
          )}

          {!loadingSave && hasSave && cloud && (
            <IpoProgress
              day={cloud.data.day}
              money={cloud.data.money}
              reputation={cloud.data.reputation ?? 0}
              officeLevel={cloud.data.officeLevel}
              projectsCompleted={cloud.data.projectsCompleted ?? 0}
              ipoAchievedAt={cloud.data.ipoAchievedAt ?? null}
              bankrupt={cloud.data.bankrupt}
              staffCount={cloud.data.staff.length}
            />
          )}

          {!loadingSave && saveError && !hasSave && (
            <div
              className="mb-5 px-4 py-2 rounded-xl text-xs"
              style={{ background: '#ffe6e6', color: '#a03d3d' }}
            >
               讀取存檔失敗，可以開新的公司繼續玩
            </div>
          )}

          {!hasSave && !loadingSave && (
            <div
              className="mb-4 px-4 py-2 rounded-full text-xs"
              style={{ background: 'rgba(255,255,255,0.85)', color: '#5b3c2b', border: '1px solid rgba(90,70,54,0.15)' }}
            >
               IPO 上市條件：信譽 80 + 資金 $50k + 辦公室 Lv3 + 完成 30 案
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
             查看排行榜
          </button>
        </>
      )}

      {!bootstrapping && !authed && <AuthScreen />}

      {lbOpen && <LeaderboardPanel onClose={() => setLbOpen(false)} />}
    </div>
  );
}

const IPO_REPUTATION = 80;
const IPO_MONEY = 50000;
const IPO_OFFICE_LEVEL = 4;
const IPO_PROJECTS = 80;

function IpoProgress({
  day,
  money,
  reputation,
  officeLevel,
  projectsCompleted,
  ipoAchievedAt,
  bankrupt,
  staffCount,
}: {
  day: number;
  money: number;
  reputation: number;
  officeLevel: number;
  projectsCompleted: number;
  ipoAchievedAt: number | null;
  bankrupt: boolean;
  staffCount: number;
}) {
  const cleared = ipoAchievedAt !== null;
  const conditions = [
    { label: ' 信譽', cur: reputation, target: IPO_REPUTATION, fmt: (v: number) => Math.round(v).toString() },
    { label: ' 資金', cur: money, target: IPO_MONEY, fmt: (v: number) => `$${v.toLocaleString()}` },
    { label: ' 辦公室', cur: officeLevel, target: IPO_OFFICE_LEVEL, fmt: (v: number) => `Lv${v + 1}` },
    { label: '✅ 完成案', cur: projectsCompleted, target: IPO_PROJECTS, fmt: (v: number) => `${v} 件` },
  ];

  return (
    <div
      className="mb-5 px-4 py-3 rounded-2xl w-full max-w-md"
      style={{ background: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(90,70,54,0.15)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-extrabold" style={{ color: '#5b3c2b' }}>
          {cleared ? ' 已 IPO 上市' : ' IPO 進度'}
        </div>
        <div className="text-[11px]" style={{ color: '#7a685a' }}>
          第 {day} 天 · {staffCount} 位員工
          {bankrupt && <span style={{ color: '#d75d5d' }}>・已破產</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {conditions.map((c) => {
          const pct = Math.min(100, Math.round((c.cur / c.target) * 100));
          const done = c.cur >= c.target;
          return (
            <div key={c.label} className="text-left">
              <div className="flex justify-between items-center text-[11px] mb-0.5">
                <span style={{ color: 'var(--muted)' }}>{c.label}</span>
                <span className="font-bold" style={{ color: done ? '#3a7a3f' : '#5b3c2b' }}>
                  {c.fmt(c.cur)} / {c.fmt(c.target)} {done && '✓'}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#eadfce' }}>
                <div
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    background: done
                      ? 'linear-gradient(90deg, #a8d8a8, #66bb6a)'
                      : 'linear-gradient(90deg, #ffd36a, #c9a064)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
