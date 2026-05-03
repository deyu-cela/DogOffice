import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import type { ChemistryCombo, ProjectCategory } from '@/types';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';
import { DogAvatar } from '@/components/DogAvatar';

const CATEGORY_LABEL: Record<ProjectCategory | 'any', string> = {
  any: '全類別',
  tech: '技術',
  design: '設計',
  marketing: '行銷',
  service: '客服',
};

const CATEGORY_ICON: Record<ProjectCategory | 'any', SvgIconName> = {
  any: 'briefcase',
  tech: 'tech',
  design: 'design',
  marketing: 'marketing',
  service: 'service',
};

type EffectLine = { icon: SvgIconName; label: string; value: string };

function effectLines(combo: ChemistryCombo): EffectLine[] {
  const lines: EffectLine[] = [];
  const b = combo.bonus;
  if (b.speedMul != null) lines.push({ icon: 'speed', label: '速度', value: `×${b.speedMul}` });
  if (b.qualityMul != null) lines.push({ icon: 'quality', label: '專業', value: `×${b.qualityMul}` });
  return lines;
}

type FilterMode = 'all' | 'positive' | 'negative';

export function ChemistryGuideModal({ onClose }: { onClose: () => void }) {
  const [filter, setFilter] = useState<FilterMode>('all');

  const { positiveCount, negativeCount, filtered } = useMemo(() => {
    const pos = CHEMISTRY_COMBOS.filter((c) => c.type === 'positive').length;
    const neg = CHEMISTRY_COMBOS.length - pos;
    const list =
      filter === 'all'
        ? CHEMISTRY_COMBOS
        : CHEMISTRY_COMBOS.filter((c) => c.type === filter);
    return { positiveCount: pos, negativeCount: neg, filtered: list };
  }, [filter]);

  return createPortal(
    <div
      className="fixed inset-0 z-[850] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,32,77,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl max-w-md w-full overflow-y-auto"
        style={{
          maxHeight: '85vh',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 pb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SvgIcon name="teamwork" size={22} />
            <span className="font-extrabold text-base" style={{ color: 'var(--text)' }}>
              化學反應一覽
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full font-extrabold"
            style={{
              padding: '4px 10px',
              fontSize: 12,
              lineHeight: 1,
              background: 'rgba(255,255,255,0.92)',
              color: 'var(--muted)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            ✕
          </button>
        </div>

        <div className="px-4 pb-2 text-[11px] leading-relaxed font-bold" style={{ color: 'var(--muted)' }}>
          兩位指定角色都派到同一案、且符合類別時自動觸發。
        </div>

        <div className="px-4 pt-1 pb-3 flex gap-1.5">
          <FilterPill
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="全部"
            count={CHEMISTRY_COMBOS.length}
            tone="neutral"
          />
          <FilterPill
            active={filter === 'positive'}
            onClick={() => setFilter('positive')}
            label="正面"
            count={positiveCount}
            tone="positive"
          />
          <FilterPill
            active={filter === 'negative'}
            onClick={() => setFilter('negative')}
            label="負面"
            count={negativeCount}
            tone="negative"
          />
        </div>

        <div className="px-4 pb-4 flex flex-col gap-2.5">
          {filtered.map((combo, i) => (
            <ComboCard key={i} combo={combo} />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone: 'neutral' | 'positive' | 'negative';
}) {
  const accent =
    tone === 'positive' ? 'var(--ok)' : tone === 'negative' ? 'var(--danger)' : 'var(--accent)';
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full font-extrabold inline-flex items-center gap-1.5"
      style={{
        padding: '4px 10px',
        fontSize: 11,
        lineHeight: 1,
        background: active ? accent : 'rgba(255,255,255,0.92)',
        color: active ? 'white' : 'var(--muted)',
        border: `1px solid ${active ? accent : 'var(--line)'}`,
        boxShadow: active ? '0 4px 10px rgba(46,104,180,0.18)' : 'var(--shadow-soft)',
      }}
    >
      {label}
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{
          minWidth: 16,
          height: 14,
          padding: '0 4px',
          fontSize: 9,
          background: active ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.06)',
          color: active ? 'white' : 'var(--muted)',
        }}
      >
        {count}
      </span>
    </button>
  );
}

function ComboCard({ combo }: { combo: ChemistryCombo }) {
  const isPositive = combo.type === 'positive';
  const cat = combo.category ?? 'any';
  const accent = isPositive ? 'var(--ok)' : 'var(--danger)';
  const accentSoft = isPositive ? '#dff5ea' : '#ffe2e2';
  const accentDeep = isPositive ? '#1d8d6a' : '#b3433f';
  const reactionIcon: SvgIconName = isPositive ? 'heart' : 'warning';
  const lines = effectLines(combo);

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: '#ffffff',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      {/* 左側顏色條：正面綠 / 負面紅 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: accent,
        }}
      />

      <div className="pl-4 pr-3 py-3">
        {/* 頂部：角色配對 + 類別 */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {combo.roles.map((r, ri) => (
              <span key={ri} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-flex items-center justify-center rounded-full"
                  style={{
                    width: 28,
                    height: 28,
                    background: '#f7fbff',
                    border: '1px solid var(--line)',
                    flexShrink: 0,
                  }}
                >
                  <DogAvatar role={r} size={24} />
                </span>
                <span
                  className="font-extrabold whitespace-nowrap"
                  style={{ fontSize: 13, color: 'var(--text)' }}
                >
                  {r}
                </span>
                {ri < combo.roles.length - 1 && (
                  <span
                    className="inline-flex items-center justify-center rounded-full"
                    style={{
                      width: 18,
                      height: 18,
                      background: accentSoft,
                      color: accent,
                      flexShrink: 0,
                    }}
                  >
                    <SvgIcon name={reactionIcon} size={12} />
                  </span>
                )}
              </span>
            ))}
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-full font-extrabold whitespace-nowrap flex-shrink-0"
            style={{
              padding: '2px 8px',
              fontSize: 10,
              background: '#f4f9ff',
              border: '1px solid var(--line)',
              color: 'var(--text)',
            }}
          >
            <SvgIcon name={CATEGORY_ICON[cat]} size={11} />
            {CATEGORY_LABEL[cat]}
          </span>
        </div>

        {/* 效果列 */}
        {lines.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
            {lines.map((line, ei) => (
              <span key={ei} className="inline-flex items-center gap-1">
                <SvgIcon name={line.icon} size={13} />
                <span className="font-bold" style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {line.label}
                </span>
                <span className="font-extrabold" style={{ fontSize: 12, color: accentDeep }}>
                  {line.value}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* 風味描述 */}
        <div
          className="font-bold leading-relaxed"
          style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}
        >
          {combo.msg}
        </div>
      </div>
    </div>
  );
}
