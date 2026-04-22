import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '@/types';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import {
  fetchLeaderboard,
  fetchMyLeaderboard,
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

function clearLocal(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(LB_KEY);
}

type Tab = 'global' | 'mine';

export function LeaderboardPanel({ onClose }: { onClose: () => void }) {
  const authedUser = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>('global');
  const [global, setGlobal] = useState<LeaderboardEntry[]>([]);
  const [myBest, setMyBest] = useState<MyBestResult | null>(null);
  const [mine, setMine] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (tab === 'global') {
      fetchLeaderboard(50000, 10, !!authedUser)
        .then((res) => {
          if (cancelled) return;
          setGlobal(res.entries);
          setMyBest(res.myBest);
        })
        .catch((err) => {
          if (cancelled) return;
          if (isIgnorableApiError(err)) {
            setError('連不上伺服器，先顯示本機紀錄');
            setGlobal(loadLocal());
          } else {
            setError('排行榜載入失敗');
            setGlobal([]);
          }
          setMyBest(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      // 我的紀錄 tab：已登入 → 打後端；未登入 → localStorage
      if (authedUser) {
        fetchMyLeaderboard(50000, 20)
          .then((entries) => {
            if (!cancelled) setMine(entries);
          })
          .catch((err) => {
            if (cancelled) return;
            if (isIgnorableApiError(err)) {
              setError('連不上伺服器，先顯示本機紀錄');
              setMine(loadLocal());
            } else {
              setError('我的紀錄載入失敗');
              setMine(loadLocal());
            }
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      } else {
        setMine(loadLocal());
        setLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [tab, authedUser]);

  const showList = tab === 'global'
    ? global
    : [...mine].sort((a, b) => a.days - b.days || b.money - a.money);

  return (
    <div
      className="fixed inset-0 z-[820] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="p-5 rounded-3xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(180deg, #fffefc, #fff5e7)', border: '2px solid rgba(90,70,54,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-extrabold">🏆 排行榜</h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              最快達標 $50,000
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-full"
            style={{ background: '#eeeae4', color: '#5b3c2b' }}
          >
            關閉 ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <button
            type="button"
            onClick={() => setTab('global')}
            className="py-1.5 rounded-full text-xs font-bold"
            style={{
              background: tab === 'global' ? 'linear-gradient(180deg, #ffc7d1, #eb93a3)' : '#eeeae4',
              color: tab === 'global' ? 'white' : '#5b3c2b',
            }}
          >
            🌍 全球榜
          </button>
          <button
            type="button"
            onClick={() => setTab('mine')}
            className="py-1.5 rounded-full text-xs font-bold"
            style={{
              background: tab === 'mine' ? 'linear-gradient(180deg, #ffc7d1, #eb93a3)' : '#eeeae4',
              color: tab === 'mine' ? 'white' : '#5b3c2b',
            }}
          >
            📋 我的紀錄
          </button>
        </div>

        {loading && (
          <div className="text-center py-2 text-xs" style={{ color: 'var(--muted)' }}>
            載入中...
          </div>
        )}
        {error && (
          <div
            className="text-center py-1.5 rounded-lg text-[11px] mb-2"
            style={{ background: '#fff0dc', color: '#8a6a2a' }}
          >
            ℹ️ {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {showList.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--muted)' }}>
              {tab === 'global' ? '全球榜還沒有紀錄，成為第一人吧！' : '還沒有紀錄，去衝一波吧！'}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {showList.map((entry, i) => (
                <EntryRow
                  key={`${entry.date}-${i}`}
                  rank={i + 1}
                  entry={entry}
                  highlight={
                    tab === 'global' &&
                    !!authedUser &&
                    !!myBest &&
                    entry.date === myBest.entry.date &&
                    entry.days === myBest.entry.days
                  }
                  showNickname={tab === 'global'}
                />
              ))}
            </div>
          )}
        </div>

        {/* 全球榜下方：顯示自己的最佳排位（若不在 top10 內） */}
        {tab === 'global' && myBest && myBest.rank > 10 && (
          <div
            className="mt-3 p-2.5 rounded-xl"
            style={{
              background: 'linear-gradient(90deg, #dcecff, #c6deff)',
              border: '1.5px solid #7ca8cc',
            }}
          >
            <div className="text-[11px] font-bold mb-1" style={{ color: '#2b5a8a' }}>
              你的最佳成績
            </div>
            <EntryRow rank={myBest.rank} entry={myBest.entry} highlight compact />
          </div>
        )}

        {/* 全球榜下方：尚未達標提示 */}
        {tab === 'global' && !loading && authedUser && !myBest && (
          <div
            className="mt-3 text-center py-2 rounded-xl text-xs"
            style={{ background: 'rgba(255,255,255,0.7)', color: 'var(--muted)' }}
          >
            你還沒達標過，去衝一波進榜吧！
          </div>
        )}

        {tab === 'mine' && mine.length > 0 && !authedUser && (
          <button
            type="button"
            onClick={() => {
              if (confirm('確定清除本機所有紀錄？無法復原。')) {
                clearLocal();
                setMine([]);
              }
            }}
            className="mt-3 text-xs py-1.5 rounded-full"
            style={{ background: '#ffd4d4', color: '#a03d3d' }}
          >
            清除本機紀錄
          </button>
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
      className="flex items-center gap-3 p-2.5 rounded-xl"
      style={{
        background: highlight
          ? 'linear-gradient(90deg, #fff0f3, #fbd5db)'
          : isFirst && !compact
            ? 'linear-gradient(90deg, #fff0f3, #fbd5db)'
            : 'rgba(255,255,255,0.7)',
        border: highlight
          ? '2px solid #e0c280'
          : isFirst && !compact
            ? '1.5px solid #e0c280'
            : '1px solid rgba(90,70,54,0.1)',
      }}
    >
      <div
        className="text-lg font-extrabold w-8 text-center"
        style={{ color: rank === 1 ? '#c9a064' : highlight ? '#8a6a2a' : '#7a685a' }}
      >
        {rank <= 3 && !compact ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold flex items-center gap-2 flex-wrap">
          <span>{entry.days} 天</span>
          {showNickname && entry.nickname && (
            <span className="text-[11px] font-normal" style={{ color: 'var(--muted)' }}>
              @{entry.nickname}
            </span>
          )}
        </div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          {OFFICE_LEVELS[entry.officeLevel]?.name ?? `Lv${entry.officeLevel}`}・{entry.staffCount} 隻狗・$
          {entry.money.toLocaleString()}
        </div>
      </div>
      <div className="text-[10px] text-right whitespace-nowrap" style={{ color: 'var(--muted)' }}>
        {new Date(entry.date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
      </div>
    </div>
  );
}
