import { useEffect, useState } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import type { LeaderboardEntry } from '@/types';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import {
  fetchLeaderboard,
  isIgnorableApiError,
  type MyBestResult,
} from '@/lib/leaderboardApi';
import { useAuthStore } from '@/store/authStore';

const LB_KEY = 'dogoffice_leaderboard_v1';

function loadLocal(): LeaderboardEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LB_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function bestLocal(entries: LeaderboardEntry[]): LeaderboardEntry | null {
  if (entries.length === 0) return null;
  return [...entries].sort((a, b) =>
    a.days - b.days
    || b.money - a.money
    || (b.projectsCompleted ?? 0) - (a.projectsCompleted ?? 0),
  )[0];
}

export function LeaderboardPanel({ onClose }: { onClose: () => void }) {
  const authedUser = useAuthStore((s) => s.user);
  const [global, setGlobal] = useState<LeaderboardEntry[]>([]);
  const [myBest, setMyBest] = useState<MyBestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchLeaderboard(50000, 10, !!authedUser)
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

  return (
    <div
      className="fixed inset-0 z-[820] flex items-center justify-center bg-[#08204d]/45 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="p-5 rounded-xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#eef6ff', border: '1px solid var(--line)' }}>
              <SvgIcon name="trophy" size={27} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">排行榜</h2>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>最快 IPO 上市</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-lg font-bold"
            style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
          >
            關閉
          </button>
        </div>

        {myBest && (
          <div
            className="mb-3 p-2.5 rounded-lg"
            style={{ background: 'linear-gradient(180deg, #eef6ff, #f7fbff)', border: '1px solid #7fb2ef' }}
          >
            <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--blue)' }}>
              你的最佳成績（全球排名 #{myBest.rank}）
            </div>
            <EntryRow rank={myBest.rank} entry={myBest.entry} highlight compact showNickname={false} />
          </div>
        )}

        {loading && <div className="text-center py-2 text-xs" style={{ color: 'var(--muted)' }}>載入中...</div>}
        {error && (
          <div className="text-center py-1.5 rounded-lg text-[11px] mb-2" style={{ background: '#fff8e8', color: '#c07a20' }}>
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
                  highlight={!!authedUser && !!myBest && entry.date === myBest.entry.date && entry.days === myBest.entry.days}
                  showNickname
                />
              ))}
            </div>
          )}
        </div>

        {!loading && authedUser && !myBest && global.length > 0 && (
          <div className="mt-3 text-center py-2 rounded-lg text-xs" style={{ background: '#f7fbff', color: 'var(--muted)', border: '1px solid var(--line)' }}>
            你還沒達標過，去衝一波進榜吧！
          </div>
        )}
      </div>
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
        background: highlight || (isFirst && !compact) ? 'linear-gradient(180deg, #eef6ff, #f7fbff)' : '#ffffff',
        border: highlight || (isFirst && !compact) ? '1px solid #7fb2ef' : '1px solid var(--line)',
      }}
    >
      <div className="text-base font-extrabold w-8 text-center" style={{ color: rank <= 3 ? 'var(--blue)' : 'var(--muted)' }}>
        #{rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold flex items-center gap-2 flex-wrap">
          <span>{entry.days} 天</span>
          {showNickname && entry.nickname && (
            <span className="text-[11px] font-normal" style={{ color: 'var(--muted)' }}>@{entry.nickname}</span>
          )}
        </div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          {OFFICE_LEVELS[entry.officeLevel]?.name ?? `Lv${entry.officeLevel + 1}`}・{entry.staffCount} 位員工・$
          {entry.money.toLocaleString()}・{entry.projectsCompleted ?? 0} 案
        </div>
      </div>
      <div className="text-[10px] text-right whitespace-nowrap" style={{ color: 'var(--muted)' }}>
        {new Date(entry.date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
      </div>
    </div>
  );
}
