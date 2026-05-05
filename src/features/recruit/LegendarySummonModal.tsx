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
      className="ls-backdrop fixed inset-0 z-[880] flex items-center justify-center p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ls-title"
    >
      <div className="ls-card" onClick={(e) => e.stopPropagation()}>
        <div className="ls-eyebrow">★ LEGENDARY SUMMON</div>
        <h2 id="ls-title" className="ls-title">傳說召喚</h2>
        <div className="ls-sub">
          四產業 S 級全部滿級 + 滿突破，傳說中的存在現身了。
        </div>

        <div className="ls-portrait">
          {image && (
            <img
              src={image}
              alt={entry.name}
              className="ls-portrait__img"
              draggable={false}
            />
          )}
          <div className="ls-portrait__glow" aria-hidden="true" />
        </div>

        <div className="ls-info">
          <div className="ls-name">{entry.name}</div>
          <div className="ls-meta">
            {entry.breed} · {entry.role} · <span className="ls-grade-u">U 級</span>
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
    </div>,
    document.body,
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="ls-stat">
      <span className="ls-stat__label">{label}</span>
      <span className="ls-stat__value tabular-nums">{value}</span>
    </div>
  );
}
