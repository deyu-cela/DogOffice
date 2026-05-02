import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '@/store/gameStore';
import { TOOL_CAP, TOOL_TRAIT_DEFS } from '@/constants/tools';
import { SvgIcon } from '@/components/SvgIcon';
import type { ProjectCategory, Tool, ToolGrade } from '@/types';
import './tool.css';

type FilterKey = 'all' | ProjectCategory;
type SortKey = 'grade' | 'speed' | 'quality' | 'recent';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'ALL' },
  { key: 'tech', label: '工程' },
  { key: 'design', label: '美術' },
  { key: 'marketing', label: '行銷' },
  { key: 'service', label: '客服' },
];

const SORT_LABEL: Record<SortKey, string> = {
  grade: '稀有度',
  speed: '速度',
  quality: '專業',
  recent: '最新',
};

const GRADE_ORDER: Record<ToolGrade, number> = { S: 0, A: 1, B: 2 };

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  tech: '工程',
  design: '美術',
  marketing: '行銷',
  service: '客服',
};

const CATEGORY_COLOR: Record<ProjectCategory, string> = {
  tech: '#2f72d6',
  design: '#d84f9b',
  marketing: '#d98919',
  service: '#1d9b64',
};

const CARD_ACCENT: Record<ToolGrade, string> = {
  S: '#f7bd22',
  A: '#b066e8',
  B: '#3d80e8',
};

const GRADE_BG: Record<ToolGrade, string> = {
  S: 'linear-gradient(180deg, #ffd95a, #f0a818)',
  A: 'linear-gradient(180deg, #c9a4f0, #8a4ce0)',
  B: 'linear-gradient(180deg, #c8d8e8, #6a8aa8)',
};
const GRADE_TEXT: Record<ToolGrade, string> = {
  S: '#1a1208',
  A: '#150a1f',
  B: '#0f1419',
};

type ToolRow = {
  tool: Tool;
  equippedByName: string | null;
};

function compareTool(a: ToolRow, b: ToolRow, sortKey: SortKey, desc: boolean) {
  let result = 0;
  switch (sortKey) {
    case 'grade':
      result = GRADE_ORDER[b.tool.grade] - GRADE_ORDER[a.tool.grade];
      break;
    case 'speed':
      result = a.tool.speedBoost - b.tool.speedBoost;
      break;
    case 'quality':
      result = a.tool.qualityBoost - b.tool.qualityBoost;
      break;
    case 'recent':
      result = a.tool.obtainedDay - b.tool.obtainedDay;
      break;
  }
  if (result === 0) result = a.tool.name.localeCompare(b.tool.name);
  return desc ? -result : result;
}

export function ToolInventoryModal({ onClose }: { onClose: () => void }) {
  const tools = useGameStore((s) => s.tools);
  const staff = useGameStore((s) => s.staff);
  const destroyTool = useGameStore((s) => s.destroyTool);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('grade');
  const [desc, setDesc] = useState(true);
  const [detailRow, setDetailRow] = useState<ToolRow | null>(null);

  const equipByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of staff) {
      if (d.equippedToolId) m.set(d.equippedToolId, d.name);
    }
    return m;
  }, [staff]);

  const rows = useMemo<ToolRow[]>(() => {
    return tools.map((tool) => ({
      tool,
      equippedByName: equipByName.get(tool.instanceId) ?? null,
    }));
  }, [tools, equipByName]);

  const visibleRows = useMemo(() => {
    return rows
      .filter((r) => filter === 'all' || r.tool.category === filter)
      .sort((a, b) => compareTool(a, b, sortKey, desc));
  }, [rows, filter, sortKey, desc]);

  return createPortal(
    <div
      className="tool-scrapbook-backdrop fixed inset-0 z-[860] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <section
        className="tool-scrapbook-panel relative overflow-hidden w-full max-w-2xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="tool-scrapbook-header flex items-center justify-between gap-2 px-4 py-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="tool-scrapbook-mark">
              <SvgIcon name="tool" size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-black text-sm leading-tight" style={{ color: '#5b382d' }}>
                玩具庫存
              </div>
              <div className="text-[10px]" style={{ color: '#886153' }}>
                狗狗們撿到的玩具都在這
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="tool-close-btn h-9 px-3 text-xs font-black"
          >
            關閉
          </button>
        </div>

        <div className="px-3 py-3 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            {FILTERS.map((item) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className="tool-filter-btn h-10 min-w-10 px-3 font-black text-sm"
                  data-active={active ? 'true' : 'false'}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              aria-label="切換排序方向"
              onClick={() => setDesc((v) => !v)}
              className="tool-sort-toggle h-10 w-10 font-black text-lg"
            >
              {desc ? '↻' : '↺'}
            </button>

            <label
              className="tool-sort-select h-10 flex items-center px-2"
            >
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="bg-transparent text-sm font-black outline-none"
                style={{ color: '#6e4638' }}
              >
                {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                  <option key={key} value={key} style={{ color: '#1f2937' }}>
                    {SORT_LABEL[key]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            className="tool-count-chip text-[11px] font-bold"
          >
            顯示 {visibleRows.length} 件 / 庫存 {tools.length} / 上限 {TOOL_CAP}
          </div>

          {visibleRows.length === 0 ? (
            <div className="tool-paper-empty text-center text-sm py-12" style={{ color: '#886153' }}>
              {tools.length === 0
                ? '還沒撿到任何玩具，多接案吧！'
                : '這個篩選沒有玩具'}
            </div>
          ) : (
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 12,
              }}
            >
              {visibleRows.map((row) => (
                <ToolCard
                  key={row.tool.instanceId}
                  row={row}
                  onDestroy={destroyTool}
                  onOpenDetail={() => setDetailRow(row)}
                />
              ))}
            </div>
          )}
        </div>

        {detailRow && (
          <ToolDetailPopup row={detailRow} onClose={() => setDetailRow(null)} />
        )}
      </section>
    </div>,
    document.body,
  );
}

function ToolCard({
  row,
  onDestroy,
  onOpenDetail,
}: {
  row: ToolRow;
  onDestroy: (instanceId: string) => void;
  onOpenDetail: () => void;
}) {
  const { tool, equippedByName } = row;
  const accent = CARD_ACCENT[tool.grade];
  const [confirming, setConfirming] = useState(false);
  const isEquipped = !!equippedByName;

  return (
    <div
        className="tool-card-frame relative w-full overflow-hidden text-left cursor-pointer"
      style={{
        aspectRatio: '0.9',
        minHeight: 134,
        padding: 3,
      }}
      title={`${tool.name}（${tool.grade}）— 點擊看詳情`}
      onClick={() => {
        if (!confirming) onOpenDetail();
      }}
    >
      <div
        className="tool-card-inner relative h-full overflow-hidden"
      >
        <div
          className="absolute inset-x-0 top-0 h-[62%]"
          style={{
            background: `radial-gradient(circle at 50% 22%, ${accent}24, transparent 54%)`,
          }}
        />

        <div className="absolute left-1 top-1 z-10 flex flex-col gap-1">
          <Badge color={CATEGORY_COLOR[tool.category]}>
            {CATEGORY_LABEL[tool.category].slice(0, 1)}
          </Badge>
        </div>

        {equippedByName && (
          <div
            className="absolute right-1 top-1 z-10 px-1.5 py-0.5 text-[9px] font-black truncate max-w-[68%]"
            style={{ background: '#16a77f', color: '#fff' }}
            title={`已裝備：${equippedByName}`}
          >
            {equippedByName}
          </div>
        )}

        {!isEquipped && (
          <button
            type="button"
            aria-label="銷毀玩具"
            onClick={(e) => {
              e.stopPropagation();
              setConfirming(true);
            }}
            className="absolute right-1 top-1 z-10 grid place-items-center text-[10px] font-black"
            style={{
              width: 18,
              height: 18,
              color: '#fff',
              background: '#cf405b',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: 4,
              boxShadow: '0 1px 3px rgba(91,56,45,0.25)',
              lineHeight: 1,
            }}
            title="銷毀玩具"
          >
            ✕
          </button>
        )}

        <div className="absolute inset-x-0 top-1 bottom-[62%] flex items-center justify-center">
          <div className="drop-shadow-lg">
            <SvgIcon name={tool.iconName} size={40} />
          </div>
        </div>

        {tool.traits.length > 0 && (
          <div
            className="absolute inset-x-1 flex flex-wrap gap-0.5 justify-center"
            style={{ bottom: 'calc(34% + 2px)' }}
          >
            {tool.traits.map((tid) => {
              const def = TOOL_TRAIT_DEFS[tid];
              if (!def) return null;
              return (
                <span
                  key={tid}
                  className="text-[11px] px-1.5 rounded-full font-black"
                  style={{
                    background: '#fff8e6',
                    color: '#5b382d',
                    border: '1px solid #d8b67a',
                    boxShadow: '0 1px 2px rgba(91,56,45,0.18)',
                  }}
                  title={def.desc}
                >
                  {def.emoji}{def.name}
                </span>
              );
            })}
          </div>
        )}

        <div
          className="tool-card-rarity-band absolute inset-x-0 bottom-0 px-1.5 py-1"
          style={{ background: GRADE_BG[tool.grade], color: GRADE_TEXT[tool.grade], height: '34%' }}
        >
          <div className="relative flex items-center gap-1">
            <span
              className="grid place-items-center text-[10px] font-black"
              style={{
                width: 16,
                minHeight: 16,
                padding: '1px 2px',
                color: GRADE_TEXT[tool.grade],
                background: 'rgba(255,255,255,0.24)',
                border: '1px solid rgba(255,255,255,0.34)',
                boxShadow: '0 1px 3px rgba(91,56,45,0.18)',
              }}
            >
              {tool.grade}
            </span>
            <span className="min-w-0 truncate text-[12px] font-black leading-tight">
              {tool.name}
            </span>
          </div>
          <div className="tool-card-rarity-meta relative text-[12px] font-black mt-0.5">
            速 +{tool.speedBoost}　專 +{tool.qualityBoost}
          </div>
        </div>
      </div>

      {confirming && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 px-2"
          style={{
            background: 'rgba(91, 56, 45, 0.78)',
            color: '#fff',
            borderRadius: 6,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[11px] font-black text-center leading-tight">
            銷毀「{tool.name}」？
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDestroy(tool.instanceId);
                setConfirming(false);
              }}
              className="tool-action-danger h-7 px-2 text-[10px] font-black"
            >
              確認
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirming(false);
              }}
              className="h-7 px-2 text-[10px] font-black"
              style={{
                background: '#fff',
                color: '#5b382d',
                border: '1px solid rgba(91,56,45,0.32)',
                borderRadius: 8,
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolDetailPopup({ row, onClose }: { row: ToolRow; onClose: () => void }) {
  const { tool, equippedByName } = row;
  return (
    <div
      className="absolute inset-0 z-[20] flex items-center justify-center p-3"
      style={{ background: 'rgba(91, 56, 45, 0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl w-full max-w-sm flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #fff8ee, #fff1e0)',
          border: '1.5px solid #d8b67a',
          boxShadow: '0 18px 36px rgba(91,56,45,0.32)',
          color: '#3a2418',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-2 px-3 py-2 border-b"
          style={{ borderColor: 'rgba(91,56,45,0.18)', background: GRADE_BG[tool.grade], color: GRADE_TEXT[tool.grade], borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
        >
          <SvgIcon name={tool.iconName} size={32} />
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm truncate">{tool.name}</div>
            <div className="text-[11px] font-bold mt-0.5">
              {tool.grade} 級・{CATEGORY_LABEL[tool.category]}
            </div>
          </div>
        </div>

        <div className="px-3 py-3 flex flex-col gap-2">
          <div
            className="flex gap-2 text-[12px] font-black"
          >
            <div className="flex-1 text-center py-1.5 rounded" style={{ background: '#fff8e6', border: '1px solid #d8b67a' }}>
              速度 +{tool.speedBoost}
            </div>
            <div className="flex-1 text-center py-1.5 rounded" style={{ background: '#fff8e6', border: '1px solid #d8b67a' }}>
              專業 +{tool.qualityBoost}
            </div>
          </div>

          <div className="text-[11px] font-bold" style={{ color: '#6e4638' }}>
            {equippedByName ? `已裝備：${equippedByName}` : '尚未裝備'}・第 {tool.obtainedDay} 天獲得
          </div>

          {tool.traits.length > 0 ? (
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="text-[12px] font-black" style={{ color: '#5b382d' }}>特性</div>
              {tool.traits.map((tid) => {
                const def = TOOL_TRAIT_DEFS[tid];
                if (!def) return null;
                return (
                  <div
                    key={tid}
                    className="flex items-start gap-2 px-2 py-1.5 rounded"
                    style={{ background: '#fff8e6', border: '1px solid #d8b67a' }}
                  >
                    <span className="text-[14px]">{def.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-black" style={{ color: '#3a2418' }}>{def.name}</div>
                      <div className="text-[11px]" style={{ color: '#6e4638' }}>{def.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[11px] text-center py-2" style={{ color: '#886153' }}>
              此玩具沒有特性
            </div>
          )}
        </div>

        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 rounded text-[12px] font-black"
            style={{ background: '#5b382d', color: '#fff' }}
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, color }: { children: string; color: string }) {
  return (
    <span
      className="grid place-items-center text-[10px] font-black"
      style={{
        width: 18,
        minHeight: 18,
        padding: '1px 2px',
        color: '#fff',
        background: color,
        border: '1px solid rgba(15,23,42,0.3)',
        boxShadow: '0 1px 3px rgba(15,23,42,0.25)',
      }}
    >
      {children}
    </span>
  );
}
