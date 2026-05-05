import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '@/types';
import {
  bestLocal,
  fetchLeaderboard,
  isIgnorableApiError,
  loadLocal,
  type MyBestResult,
} from '@/lib/leaderboardApi';
import { useAuthStore } from '@/store/authStore';
import './leaderboardPanel.css';

const UNNAMED_COMPANY = '未命名公司';
const ASSET = (name: string) => `${import.meta.env.BASE_URL}assets/leaderboard/${name}`;

function entryDisplayName(entry: LeaderboardEntry): string {
  const name = (entry.companyName ?? '').trim();
  return name.length > 0 ? name : UNNAMED_COMPANY;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString()}`;
}

function isMeEntry(entry: LeaderboardEntry, myBest: MyBestResult | null): boolean {
  if (!myBest) return false;
  return entry.date === myBest.entry.date && entry.days === myBest.entry.days;
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

  const top3 = global.slice(0, 3);
  const rest = global.slice(3, 10);
  const showMyBest = !!authedUser && !!myBest && myBest.rank > 3;

  return (
    <div className="lb-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="lb-title">
      <div className="lb-stack" onClick={(e) => e.stopPropagation()}>
        <div className="lb-back lb-back--1" aria-hidden="true" />
        <div className="lb-back lb-back--2" aria-hidden="true" />
        <div className="lb-card">
          <div
            className="lb-card__watermark"
            style={{ backgroundImage: `url(${ASSET('bg-paper-watermark.png')})` }}
            aria-hidden="true"
          />

          <span className="lb-tape lb-tape--left" aria-hidden="true" />
          <span className="lb-tape lb-tape--right" aria-hidden="true" />

          <img
            className="lb-trophy"
            src={ASSET('trophy-badge.png')}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <img
            className="lb-sparkle lb-sparkle--a"
            src={ASSET('sparkle-b.png')}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <img
            className="lb-sparkle lb-sparkle--b"
            src={ASSET('sparkle-a.png')}
            alt=""
            aria-hidden="true"
            draggable={false}
          />

          <button type="button" onClick={onClose} className="lb-close">關閉</button>

          <div className="lb-header">
            <div className="lb-eyebrow">LEADERBOARD · 排行榜</div>
            <h2 id="lb-title" className="lb-title">豪華總部達成榜</h2>
            <div className="lb-subpill">
              <span className="lb-subpill__dot" />
              最先達成豪華總部的紀錄
              <span className="lb-subpill__dot" />
            </div>
          </div>

          {showMyBest && (
            <div className="lb-mybest">
              <div className="lb-mybest__head">你的最佳成績 #{myBest!.rank}</div>
              <RowSlim rank={myBest!.rank} entry={myBest!.entry} variant="me" />
            </div>
          )}

          {loading && <div className="lb-status">載入中...</div>}
          {error && <div className="lb-error">{error}</div>}

          {!loading && global.length === 0 && !error && (
            <div className="lb-empty">還沒有排行榜紀錄。</div>
          )}

          {top3.length > 0 && (
            <div className="lb-podium">
              <div className="lb-podium__top3">★ TOP 3</div>
              <div className="lb-podium__grid">
                {top3[1] ? (
                  <PodiumCard place={2} entry={top3[1]} isMe={isMeEntry(top3[1], myBest)} />
                ) : (
                  <div />
                )}
                {top3[0] ? (
                  <PodiumCard place={1} entry={top3[0]} isMe={isMeEntry(top3[0], myBest)} />
                ) : (
                  <div />
                )}
                {top3[2] ? (
                  <PodiumCard place={3} entry={top3[2]} isMe={isMeEntry(top3[2], myBest)} />
                ) : (
                  <div />
                )}
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <>
              <div className="lb-divider-row">
                <span className="lb-divider" />
                <span className="lb-divider-pill">#4 — #10</span>
                <span className="lb-divider" />
              </div>
              <div className="lb-rest">
                {rest.map((entry, i) => (
                  <RowSlim
                    key={`${entry.date}-${i}`}
                    rank={entry.rank ?? i + 4}
                    entry={entry}
                    variant={isMeEntry(entry, myBest) ? 'me' : i % 2 === 1 ? 'zebra' : 'default'}
                  />
                ))}
              </div>
            </>
          )}

          {!loading && authedUser && !myBest && global.length > 0 && (
            <div className="lb-footer">
              <img className="lb-footer__paw" src={ASSET('paw-stamp.png')} alt="" aria-hidden="true" draggable={false} />
              把辦公室升級到豪華總部就能登榜！
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MEDAL_BY_PLACE: Record<1 | 2 | 3, string> = {
  1: 'medal-gold.png',
  2: 'medal-silver.png',
  3: 'medal-bronze.png',
};

function PodiumCard({
  place,
  entry,
  isMe,
}: {
  place: 1 | 2 | 3;
  entry: LeaderboardEntry;
  isMe: boolean;
}) {
  const name = entryDisplayName(entry);
  return (
    <div className={`lb-podiumcard lb-podiumcard--${place}${isMe ? ' lb-podiumcard--me' : ''}`}>
      <span className="lb-podiumcard__tape" aria-hidden="true" />
      {place === 1 && (
        <img
          className="lb-podiumcard__crown"
          src={ASSET('crown-tag.png')}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      )}
      <img
        className="lb-podiumcard__medal"
        src={ASSET(MEDAL_BY_PLACE[place])}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <div className="lb-podiumcard__rank">#{entry.rank ?? place}</div>
      <div className="lb-podiumcard__name" title={name}>{name}</div>
      <div className="lb-podiumcard__data">
        <div>第 {entry.days} 天</div>
        <div className="lb-podiumcard__data-money">{fmtMoney(entry.money)}</div>
      </div>
    </div>
  );
}

function RowSlim({
  rank,
  entry,
  variant = 'default',
}: {
  rank: number;
  entry: LeaderboardEntry;
  variant?: 'default' | 'zebra' | 'me';
}) {
  const name = entryDisplayName(entry);
  const cls =
    variant === 'me'
      ? 'lb-rowslim lb-rowslim--me'
      : variant === 'zebra'
        ? 'lb-rowslim lb-rowslim--zebra'
        : 'lb-rowslim';

  return (
    <div className={cls}>
      <div className="lb-rowslim__rank">#{rank}</div>
      <div className="lb-rowslim__main">
        <span className="lb-rowslim__name" title={name}>{name}</span>
        {entry.nickname && (
          <span className="lb-rowslim__nick" title={`帳號 ${entry.nickname}`}>@{entry.nickname}</span>
        )}
        <span className="lb-rowslim__detail">
          第 {entry.days} 天 · {fmtMoney(entry.money)} · 員工 {entry.staffCount}
        </span>
      </div>
      <div className="lb-rowslim__date">{shortDate(entry.date)}</div>
    </div>
  );
}
