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
  S: '#5a3d05',
  A: '#24152f',
  B: '#fff',
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
                <ToolCard key={row.tool.instanceId} row={row} onDestroy={destroyTool} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

function ToolCard({
  row,
  onDestroy,
}: {
  row: ToolRow;
  onDestroy: (instanceId: string) => void;
}) {
  const { tool, equippedByName } = row;
  const accent = CARD_ACCENT[tool.grade];
  const [confirming, setConfirming] = useState(false);
  const isEquipped = !!equippedByName;

  return (
    <div
        className="tool-card-frame relative w-full overflow-hidden text-left"
      style={{
        aspectRatio: '0.78',
        minHeight: 148,
        padding: 3,
      }}
      title={`${tool.name}（${tool.grade}）`}
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
            onClick={() => setConfirming(true)}
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

        <div className="absolute inset-x-0 top-2 bottom-[50%] flex items-center justify-center">
          <div className="drop-shadow-lg">
            <SvgIcon name={tool.iconName} size={48} />
          </div>
        </div>

        <div
          className="tool-card-rarity-band absolute inset-x-0 bottom-0 px-1.5 py-1.5"
          style={{ background: GRADE_BG[tool.grade], color: GRADE_TEXT[tool.grade] }}
        >
          <div className="relative flex items-center gap-1">
            <span
              className="grid place-items-center text-[10px] font-black"
              style={{
                width: 18,
                minHeight: 18,
                padding: '1px 2px',
                color: GRADE_TEXT[tool.grade],
                background: 'rgba(255,255,255,0.24)',
                border: '1px solid rgba(255,255,255,0.34)',
                boxShadow: '0 1px 3px rgba(91,56,45,0.18)',
              }}
            >
              {tool.grade}
            </span>
            <span className="min-w-0 truncate text-[11px] font-black leading-tight">
              {tool.name}
            </span>
          </div>
          <div className="tool-card-rarity-meta relative text-[9px] font-bold mt-0.5" style={{ opacity: 0.9 }}>
            速 +{tool.speedBoost}　專 +{tool.qualityBoost}
          </div>
          {tool.traits.length > 0 && (
            <div className="tool-card-traits relative flex flex-wrap gap-0.5 mt-1">
              {tool.traits.map((tid) => {
                const def = TOOL_TRAIT_DEFS[tid];
                return (
                  <span
                    key={tid}
                    className="text-[9px] px-1 rounded-full font-bold"
                    style={{
                      background: 'rgba(255,255,255,0.28)',
                      color: GRADE_TEXT[tool.grade],
                      border: '1px solid rgba(255,255,255,0.26)',
                    }}
                    title={def.desc}
                  >
                    {def.emoji}{def.name}
                  </span>
                );
              })}
            </div>
          )}
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
        >
          <div className="text-[11px] font-black text-center leading-tight">
            銷毀「{tool.name}」？
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                onDestroy(tool.instanceId);
                setConfirming(false);
              }}
              className="tool-action-danger h-7 px-2 text-[10px] font-black"
            >
              確認
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
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
