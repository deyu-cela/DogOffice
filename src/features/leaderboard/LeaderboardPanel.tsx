import { useEffect, useMemo, useState } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import type { LeaderboardEntry } from '@/types';
import {
  bestLocal,
  fetchLeaderboard,
  isIgnorableApiError,
  loadLocal,
  type MyBestResult,
} from '@/lib/leaderboardApi';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import {
  computeCeoStats,
  MONSTER_ATK,
  MONSTER_INTERVAL,
} from './crisisFormulas';

export function LeaderboardPanel({ onClose }: { onClose: () => void }) {
  const authedUser = useAuthStore((s) => s.user);
  const staff = useGameStore((s) => s.staff);
  const teams = useGameStore((s) => s.teams);
  const miniGame = useGameStore((s) => s.miniGame);
  const openCrisisBattle = useGameStore((s) => s.openCrisisBattle);

  const ceoStats = useMemo(() => computeCeoStats(staff, teams), [staff, teams]);
  const canChallenge = ceoStats.teamSize > 0 && !miniGame;

  const [global, setGlobal] = useState<LeaderboardEntry[]>([]);
  const [myBest, setMyBest] = useState<MyBestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchLeaderboard(10, !!authedUser)
      .then((res) => {
        if (cancelled) return;
        setGlobal(res.entries);
        setMyBest(res.myBest);
      })
      .catch((err) => {
        if (cancelled) return;
        if (isIgnorableApiError(err)) {
          const local = loadLocal();
          setError('連不上伺服器，先顯示本機紀錄');
          setGlobal(local);
          const best = bestLocal(local);
          setMyBest(best ? { rank: 1, entry: best } : null);
        } else {
          setError('排行榜載入失敗');
          setGlobal([]);
          setMyBest(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authedUser]);

  const handleChallenge = () => {
    if (!canChallenge) return;
    openCrisisBattle();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[820] flex items-center justify-center bg-[#08204d]/45 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="p-5 rounded-xl max-w-md w-full max-h-[88vh] overflow-hidden flex flex-col"
        style={{
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eef6ff', border: '1px solid var(--line)' }}>
              <SvgIcon name="trophy" size={27} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">排行榜</h2>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>挑戰金融海嘯，比誰打得最痛</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-lg font-bold"
            style={{ backgroundColor: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
          >
            關閉
          </button>
        </div>

        {/* 戰前預估 + 入口 */}
        <div
          className="mb-3 p-3 rounded-lg"
          style={{ backgroundImage: 'linear-gradient(180deg, #fff7ec, #fffbf3)', border: '1px solid #f0c97a' }}
        >
          <div className="text-[11px] font-bold mb-2" style={{ color: '#9a6a1a' }}>
            CEO 戰力預估（依目前隊伍成員）
          </div>
          {ceoStats.teamSize > 0 ? (
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
              <PreviewStat label="HP" value={ceoStats.hp} />
              <PreviewStat label="ATK" value={ceoStats.atk} />
              <PreviewStat label="間隔" value={`${ceoStats.interval.toFixed(2)}s`} />
            </div>
          ) : (
            <div className="text-xs mb-3" style={{ color: '#9a6a1a' }}>
              還沒有狗狗加入隊伍。把員工配置到隊伍後才能挑戰。
            </div>
          )}
          <div className="text-[10px] mb-2" style={{ color: '#9a6a1a' }}>
            金融海嘯：每 {MONSTER_INTERVAL}s 攻擊一次，每次 {MONSTER_ATK} 傷害
          </div>
          <button
            type="button"
            onClick={handleChallenge}
            disabled={!canChallenge}
            className="w-full py-2.5 rounded-lg font-extrabold text-sm disabled:opacity-50"
            style={{
              backgroundImage: canChallenge ? 'linear-gradient(180deg, #ff7a3d, #d24722)' : 'none',
              backgroundColor: canChallenge ? 'transparent' : '#d8d8d8',
              color: 'white',
              boxShadow: canChallenge ? '0 6px 18px rgba(210,71,34,0.32)' : 'none',
            }}
          >
            挑戰金融海嘯
          </button>
        </div>

        {myBest && (
          <div
            className="mb-3 p-2.5 rounded-lg"
            style={{ backgroundImage: 'linear-gradient(180deg, #eef6ff, #f7fbff)', border: '1px solid #7fb2ef' }}
          >
            <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--blue)' }}>
              你的最佳成績（全球排名 #{myBest.rank}）
            </div>
            <EntryRow rank={myBest.rank} entry={myBest.entry} highlight compact showNickname={false} />
          </div>
        )}

        {loading && <div className="text-center py-2 text-xs" style={{ color: 'var(--muted)' }}>載入中...</div>}
        {error && (
          <div className="text-center py-1.5 rounded-lg text-[11px] mb-2" style={{ backgroundColor: '#fff8e8', color: '#c07a20' }}>
            {error}
          </div>
        )}

        <div className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--muted)' }}>全球前 10</div>
        <div className="flex-1 overflow-y-auto">
          {global.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--muted)' }}>
              全球榜還沒有紀錄，成為第一人吧！
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {global.map((entry, i) => (
                <EntryRow
                  key={`${entry.date}-${i}`}
                  rank={i + 1}
                  entry={entry}
                  highlight={!!authedUser && !!myBest && entry.date === myBest.entry.date && entry.damage === myBest.entry.damage}
                  showNickname
                />
              ))}
            </div>
          )}
        </div>

        {!loading && authedUser && !myBest && global.length > 0 && (
          <div className="mt-3 text-center py-2 rounded-lg text-xs" style={{ backgroundColor: '#f7fbff', color: 'var(--muted)', border: '1px solid var(--line)' }}>
            你還沒挑戰過金融海嘯，去打一場進榜吧！
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg px-2 py-1.5" style={{ backgroundColor: '#ffffff', border: '1px solid #f0c97a' }}>
      <div className="text-[10px]" style={{ color: '#9a6a1a' }}>{label}</div>
      <div className="text-sm font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

function EntryRow({
  rank,
  entry,
  highlight = false,
  showNickname = false,
  compact = false,
}: {
  rank: number;
  entry: LeaderboardEntry;
  highlight?: boolean;
  showNickname?: boolean;
  compact?: boolean;
}) {
  const isFirst = rank === 1;
  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-lg"
      style={{
        backgroundImage: highlight || (isFirst && !compact) ? 'linear-gradient(180deg, #eef6ff, #f7fbff)' : 'none',
        backgroundColor: highlight || (isFirst && !compact) ? 'transparent' : '#ffffff',
        border: highlight || (isFirst && !compact) ? '1px solid #7fb2ef' : '1px solid var(--line)',
      }}
    >
      <div className="text-base font-extrabold w-8 text-center" style={{ color: rank <= 3 ? 'var(--blue)' : 'var(--muted)' }}>
        #{rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold flex items-center gap-2 flex-wrap">
          <span className="tabular-nums">{entry.damage.toLocaleString()} 傷害</span>
          {showNickname && entry.nickname && (
            <span className="text-[11px] font-normal" style={{ color: 'var(--muted)' }}>@{entry.nickname}</span>
          )}
        </div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          隊伍 {entry.teamSize} 隻
        </div>
      </div>
      <div className="text-[10px] text-right whitespace-nowrap" style={{ color: 'var(--muted)' }}>
        {new Date(entry.date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
      </div>
    </div>
  );
}
