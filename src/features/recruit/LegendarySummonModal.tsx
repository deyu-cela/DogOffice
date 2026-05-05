import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUiStore } from '@/store/uiStore';
import {
  DOG_STAT_BREAKTHROUGH_MAX,
  LEGENDARY_ROSTER_ID,
  isLegendarySummonReady,
  isLegendarySummoned,
  useGameStore,
} from '@/store/gameStore';
import { ROSTER_BY_ID } from '@/constants/dogRoster';
import { getDogProfileImage } from '@/constants/dogRoles';
import './legendarySummon.css';

const LB_ASSET = (name: string) => `${import.meta.env.BASE_URL}assets/leaderboard/${name}`;

export function LegendarySummonModal() {
  const open = useUiStore((s) => s.legendarySummonModalOpen);
  const close = useUiStore((s) => s.closeLegendarySummonModal);
  const staff = useGameStore((s) => s.staff);
  const claim = useGameStore((s) => s.claimLegendaryDog);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const entry = ROSTER_BY_ID.get(LEGENDARY_ROSTER_ID);
  if (!entry) return null;

  const summoned = isLegendarySummoned(staff);
  const ready = isLegendarySummonReady(staff);
  const image = entry.image ?? getDogProfileImage(entry.role, entry.rosterId);

  const onClaim = () => {
    claim();
    close();
  };

  return createPortal(
    <div
      className="ls-backdrop"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ls-title"
    >
      <div className="ls-stack" onClick={(e) => e.stopPropagation()}>
        <div className="ls-back ls-back--1" aria-hidden="true" />
        <div className="ls-back ls-back--2" aria-hidden="true" />
        <div className="ls-card">
          <span className="ls-tape ls-tape--left" aria-hidden="true" />
          <span className="ls-tape ls-tape--right" aria-hidden="true" />

          <img
            className="ls-trophy"
            src={LB_ASSET('trophy-badge.png')}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <img
            className="ls-sparkle ls-sparkle--a"
            src={LB_ASSET('sparkle-b.png')}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <img
            className="ls-sparkle ls-sparkle--b"
            src={LB_ASSET('sparkle-a.png')}
            alt=""
            aria-hidden="true"
            draggable={false}
          />

          <button type="button" onClick={close} className="ls-close">關閉</button>

          <div className="ls-card__inner">
            <div className="ls-header">
              <div className="ls-eyebrow">LEGENDARY · 傳說召喚</div>
              <h2 id="ls-title" className="ls-title">傳說中的存在登場</h2>
              <div className="ls-subpill">
                <span className="ls-subpill__dot" />
                四 S 滿級 + 滿突破才能召喚
                <span className="ls-subpill__dot" />
              </div>
            </div>

            <div className="ls-portrait-wrap">
              <span className="ls-portrait__tape" aria-hidden="true" />
              <div className="ls-portrait">
                <div className="ls-portrait__glow" aria-hidden="true" />
                {image && (
                  <img
                    src={image}
                    alt={entry.name}
                    className="ls-portrait__img"
                    draggable={false}
                  />
                )}
              </div>
            </div>

            <div className="ls-info">
              <div className="ls-name">{entry.name}</div>
              <div className="ls-meta">
                {entry.breed} · {entry.role}
                <span className="ls-grade-u">U 級</span>
              </div>
              <div className="ls-flavor">「{entry.flavor}」</div>
            </div>

            <div className="ls-stats">
              <StatRow label="速度" value={DOG_STAT_BREAKTHROUGH_MAX} />
              <StatRow label="專業" value={DOG_STAT_BREAKTHROUGH_MAX} />
              <StatRow label="耐心" value={DOG_STAT_BREAKTHROUGH_MAX} />
            </div>

            <div className="ls-actions">
              <button type="button" onClick={close} className="ls-btn ls-btn--ghost">
                稍後再說
              </button>
              <button
                type="button"
                onClick={onClaim}
                disabled={summoned || !ready}
                className="ls-btn ls-btn--primary"
              >
                {summoned ? '已召喚' : '召喚！'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="ls-stat">
      <span className="ls-stat__label">{label}</span>
      <span className="ls-stat__value">{value}</span>
    </div>
  );
}
