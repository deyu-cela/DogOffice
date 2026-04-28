import { useMemo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '@/store/gameStore';
import { getSynergyRowInfo, type SynergyRowInfo } from '@/lib/synergyEngine';
import {
  SYNERGY_BUFFS,
  SYNERGY_TIER1,
  SYNERGY_TIER2,
  isRegion,
  type SynergyKey,
} from '@/constants/dogTags';
import type { Dog } from '@/types';

type TierStyle = {
  rowBg: string;
  rowBorder: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
  barFill: string;
};

const TIER_STYLES: Record<0 | 1 | 2, TierStyle> = {
  0: {
    rowBg: 'rgba(245, 248, 252, 0.6)',
    rowBorder: '1px solid #e6ecf3',
    iconBg: '#e9eef5',
    iconColor: '#9aa6b5',
    badgeBg: '#eef2f7',
    badgeColor: '#94a0b1',
    barFill: '#c8d3e0',
  },
  // Tier 1：銅銀色（cool blue accent）
  1: {
    rowBg: 'linear-gradient(180deg, #f0f7ff, #dce9fc)',
    rowBorder: '1px solid rgba(47,141,244,0.45)',
    iconBg: 'linear-gradient(180deg, #4a9af5, #2872d6)',
    iconColor: '#ffffff',
    badgeBg: 'linear-gradient(180deg, #2f8df4, #1c63c8)',
    badgeColor: '#ffffff',
    barFill: 'linear-gradient(90deg, #5fb0ff, #2872d6)',
  },
  // Tier 2：金色（TFT 黃金羈絆風）
  2: {
    rowBg: 'linear-gradient(180deg, #fff7d8, #ffe7a3)',
    rowBorder: '1px solid rgba(218,165,32,0.7)',
    iconBg: 'linear-gradient(180deg, #f5c542, #c8951b)',
    iconColor: '#ffffff',
    badgeBg: 'linear-gradient(180deg, #f5c542, #c8951b)',
    badgeColor: '#fff8d8',
    barFill: 'linear-gradient(90deg, #ffd86b, #d99a1a)',
  },
};

function tagPrefix(key: SynergyKey): string {
  return isRegion(key) ? '地' : '狗';
}

function tagPrefixStyle(key: SynergyKey, tier: 0 | 1 | 2): { bg: string; color: string } {
  if (tier > 0) return { bg: 'rgba(255,255,255,0.55)', color: '#3d2f25' };
  return isRegion(key)
    ? { bg: '#dde6f3', color: '#5a6b80' }
    : { bg: '#f3dee8', color: '#8a5872' };
}

type TooltipState = {
  key: SynergyKey;
  rect: DOMRect;
} | null;

export function SynergyPanel() {
  const staff = useGameStore((s) => s.staff);

  const rows = useMemo<SynergyRowInfo[]>(() => getSynergyRowInfo(staff), [staff]);

  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleEnter = (key: SynergyKey) => {
    const el = rowRefs.current[key];
    if (!el) return;
    setTooltip({ key, rect: el.getBoundingClientRect() });
  };
  const handleLeave = () => setTooltip(null);
  const handleTap = (key: SynergyKey) => {
    if (tooltip?.key === key) {
      setTooltip(null);
    } else {
      const el = rowRefs.current[key];
      if (!el) return;
      setTooltip({ key, rect: el.getBoundingClientRect() });
    }
  };

  // tap outside 關閉 tooltip（手機用）
  useEffect(() => {
    if (!tooltip) return;
    const onClick = (e: MouseEvent) => {
      const el = rowRefs.current[tooltip.key];
      if (el && el.contains(e.target as Node)) return;
      setTooltip(null);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [tooltip]);

  const activeCount = rows.filter((r) => r.tier > 0).length;

  return (
    <div
      className="rounded-2xl mb-3 px-3 py-2.5"
      style={{
        background: 'linear-gradient(180deg, #ffffff, #f4f9ff)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>
          羈絆 Synergy
        </div>
        <div className="text-[10px] font-bold" style={{ color: activeCount > 0 ? 'var(--blue)' : 'var(--muted)' }}>
          {activeCount > 0 ? `${activeCount} 條啟動中` : '尚未觸發'}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <SynergyRow
            key={row.key}
            row={row}
            innerRef={(el) => { rowRefs.current[row.key] = el; }}
            onEnter={() => handleEnter(row.key)}
            onLeave={handleLeave}
            onTap={() => handleTap(row.key)}
          />
        ))}
      </div>

      {tooltip &&
        createPortal(
          <SynergyTooltip
            row={rows.find((r) => r.key === tooltip.key)!}
            anchor={tooltip.rect}
            staff={staff}
          />,
          document.body,
        )}
    </div>
  );
}

function SynergyRow({
  row,
  innerRef,
  onEnter,
  onLeave,
  onTap,
}: {
  row: SynergyRowInfo;
  innerRef: (el: HTMLDivElement | null) => void;
  onEnter: () => void;
  onLeave: () => void;
  onTap: () => void;
}) {
  const style = TIER_STYLES[row.tier];
  const prefix = tagPrefix(row.key);
  const prefixStyle = tagPrefixStyle(row.key, row.tier);
  // 進度比例：以 SYNERGY_TIER2 (4) 為滿；超過則卡 100%
  const pct = Math.min(100, (row.count / SYNERGY_TIER2) * 100);

  return (
    <div
      ref={innerRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onTap}
      className="rounded-xl px-2 py-1.5 cursor-pointer select-none transition"
      style={{
        background: style.rowBg,
        border: style.rowBorder,
      }}
    >
      <div className="flex items-center gap-2">
        {/* 圓形 icon（地/人 字標） */}
        <div
          className="flex items-center justify-center text-[12px] font-extrabold rounded-full shrink-0"
          style={{
            width: 26,
            height: 26,
            background: style.iconBg,
            color: style.iconColor,
            boxShadow: row.tier === 2 ? '0 0 0 2px rgba(255,255,255,0.5), 0 0 8px rgba(218,165,32,0.5)' : row.tier === 1 ? '0 0 0 2px rgba(255,255,255,0.45)' : 'none',
          }}
        >
          {prefix}
        </div>

        {/* 名稱 */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] px-1.5 py-px rounded font-bold" style={{ background: prefixStyle.bg, color: prefixStyle.color }}>
              {isRegion(row.key) ? '地區' : '狗格'}
            </span>
            <span className="font-extrabold text-[13px]" style={{ color: row.tier > 0 ? '#3d2f25' : '#5a6b80' }}>
              {row.key}
            </span>
            {row.tier === 2 && <span style={{ color: '#c8951b', fontSize: 12 }}>★</span>}
          </div>

          {/* 進度條：兩個刻度（tier1=2, tier2=4） */}
          <div
            className="relative mt-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.06)' }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${pct}%`, background: style.barFill, transition: 'width 220ms' }}
            />
            {/* tier1 刻度（2/4 = 50%）*/}
            <div
              className="absolute top-0 bottom-0"
              style={{ left: `${(SYNERGY_TIER1 / SYNERGY_TIER2) * 100}%`, width: 1, background: 'rgba(0,0,0,0.18)' }}
            />
          </div>
        </div>

        {/* 計數 chip */}
        <div
          className="shrink-0 text-[11px] px-2 py-0.5 rounded-md font-extrabold"
          style={{ background: style.badgeBg, color: style.badgeColor }}
        >
          {row.count} / {SYNERGY_TIER2}
        </div>
      </div>
    </div>
  );
}

function SynergyTooltip({
  row,
  anchor,
  staff,
}: {
  row: SynergyRowInfo;
  anchor: DOMRect;
  staff: Dog[];
}) {
  const def = SYNERGY_BUFFS[row.key];
  const memberNames = row.memberIds
    .map((id) => staff.find((d) => d.id === id)?.name)
    .filter((n): n is string => !!n);

  // 顯示在 anchor 左邊（員工列表多在右欄，從左側彈出較不擋）
  // 計算 viewport 邊界保護
  const TIP_WIDTH = 240;
  let left = anchor.left - TIP_WIDTH - 10;
  if (left < 8) left = anchor.right + 10;
  let top = anchor.top;
  if (typeof window !== 'undefined') {
    const maxTop = window.innerHeight - 220;
    if (top > maxTop) top = maxTop;
    if (top < 8) top = 8;
  }

  const tier1Hit = row.tier >= 1;
  const tier2Hit = row.tier >= 2;

  return (
    <div
      className="rounded-xl shadow-xl text-xs"
      style={{
        position: 'fixed',
        left,
        top,
        width: TIP_WIDTH,
        background: 'linear-gradient(180deg, #ffffff, #f7faff)',
        border: '1px solid rgba(47,141,244,0.35)',
        boxShadow: '0 8px 24px rgba(60,90,160,0.18)',
        zIndex: 1200,
        padding: 12,
        pointerEvents: 'none',
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="font-extrabold text-sm" style={{ color: '#3d2f25' }}>
          {row.key}
          {row.tier === 2 && <span style={{ color: '#c8951b', marginLeft: 4 }}>★</span>}
        </div>
        <div className="text-[11px] font-bold" style={{ color: '#5a6b80' }}>
          {row.count} / {SYNERGY_TIER2}
        </div>
      </div>

      <div className="text-[10px] mb-2 italic" style={{ color: '#7a8696' }}>
        {def.flavor}
      </div>

      <div className="border-t pt-2 mt-1" style={{ borderColor: '#e6ecf3' }}>
        <BuffLine
          label={`Tier 1 (≥${SYNERGY_TIER1})`}
          desc={def.desc.tier1}
          hit={tier1Hit}
        />
        <BuffLine
          label={`Tier 2 (≥${SYNERGY_TIER2})`}
          desc={def.desc.tier2}
          hit={tier2Hit}
          alwaysHighlight={tier2Hit}
        />
      </div>

      {!tier1Hit && (
        <div className="mt-2 text-[10px] font-bold" style={{ color: '#c0392b' }}>
          還差 {SYNERGY_TIER1 - row.count} 隻達 Tier 1
        </div>
      )}
      {tier1Hit && !tier2Hit && (
        <div className="mt-2 text-[10px] font-bold" style={{ color: '#a36a3a' }}>
          還差 {SYNERGY_TIER2 - row.count} 隻達 Tier 2
        </div>
      )}

      {memberNames.length > 0 && (
        <div
          className="mt-2 pt-2 border-t text-[10px]"
          style={{ borderColor: '#e6ecf3', color: '#5a6b80' }}
        >
          觸發中：
          <span className="font-bold" style={{ color: '#3d2f25' }}>
            {' '}
            {memberNames.join('、')}
          </span>
        </div>
      )}
    </div>
  );
}

function BuffLine({
  label,
  desc,
  hit,
  alwaysHighlight,
}: {
  label: string;
  desc: string;
  hit: boolean;
  alwaysHighlight?: boolean;
}) {
  return (
    <div
      className="flex items-baseline gap-1.5 text-[11px]"
      style={{ color: hit ? '#1c63c8' : '#94a0b1', fontWeight: hit ? 700 : 500 }}
    >
      <span style={{ width: 12, display: 'inline-block', textAlign: 'center' }}>
        {hit ? '✓' : '·'}
      </span>
      <span style={{ width: 80 }}>{label}</span>
      <span style={{ color: alwaysHighlight ? '#c8951b' : 'inherit' }}>{desc}</span>
    </div>
  );
}

