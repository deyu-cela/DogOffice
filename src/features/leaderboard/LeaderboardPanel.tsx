import { useEffect, useState } from 'react';
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

const UNNAMED_COMPANY = '未命名公司';

function entryDisplayName(entry: LeaderboardEntry): string {
  const name = (entry.companyName ?? '').trim();
  return name.length > 0 ? name : UNNAMED_COMPANY;
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
          setError('連線暫時失敗，先顯示本機紀錄。');
          setGlobal(local);
          const best = bestLocal(local);
          setMyBest(best ? { rank: 1, entry: best } : null);
        } else {
          setError('排行榜載入失敗。');
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
              <p className="text-xs" style={{ color: 'var(--muted)' }}>最先達成豪華總部的紀錄</p>
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

        {myBest && (
          <div
            className="mb-3 p-2.5 rounded-lg"
            style={{ backgroundImage: 'linear-gradient(180deg, #eef6ff, #f7fbff)', border: '1px solid #7fb2ef' }}
          >
            <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--blue)' }}>
              你的最佳成績 #{myBest.rank}
            </div>
            <EntryRow rank={myBest.rank} entry={myBest.entry} highlight compact showName={false} />
          </div>
        )}

        {loading && <div className="text-center py-2 text-xs" style={{ color: 'var(--muted)' }}>載入中...</div>}
        {error && (
          <div className="text-center py-1.5 rounded-lg text-[11px] mb-2" style={{ backgroundColor: '#fff8e8', color: '#c07a20' }}>
            {error}
          </div>
        )}

        <div className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--muted)' }}>Top 10</div>
        <div className="flex-1 overflow-y-auto">
          {global.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--muted)' }}>
              還沒有排行榜紀錄。
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {global.map((entry, i) => (
                <EntryRow
                  key={`${entry.date}-${i}`}
                  rank={i + 1}
                  entry={entry}
                  highlight={!!authedUser && !!myBest && entry.date === myBest.entry.date && entry.days === myBest.entry.days}
                  showName
                />
              ))}
            </div>
          )}
        </div>

        {!loading && authedUser && !myBest && global.length > 0 && (
          <div className="mt-3 text-center py-2 rounded-lg text-xs" style={{ backgroundColor: '#f7fbff', color: 'var(--muted)', border: '1px solid var(--line)' }}>
            你還沒有上榜，把辦公室升級到豪華總部就能登榜！
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
  showName = false,
  compact = false,
}: {
  rank: number;
  entry: LeaderboardEntry;
  highlight?: boolean;
  showName?: boolean;
  compact?: boolean;
}) {
  const isFirst = rank === 1;
  const detail = `現金 $${entry.money.toLocaleString()} · 員工 ${entry.staffCount} 位`;
  const company = entryDisplayName(entry);

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
        {showName ? (
          <>
            <div className="text-sm font-extrabold truncate" style={{ color: 'var(--ink)' }} title={company}>
              {company}
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              <span className="tabular-nums">第 {entry.days} 天</span>
              <span> · {detail}</span>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-bold tabular-nums">第 {entry.days} 天達成</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>{detail}</div>
          </>
        )}
      </div>
      <div className="text-[10px] text-right whitespace-nowrap" style={{ color: 'var(--muted)' }}>
        {new Date(entry.date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
      </div>
    </div>
  );
}
