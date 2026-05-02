import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '@/store/gameStore';
import { TOOL_TRAIT_DEFS } from '@/constants/tools';
import { SvgIcon } from '@/components/SvgIcon';
import type { ProjectCategory, Tool, ToolGrade } from '@/types';

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

const FRAME_BG: Record<ToolGrade, string> = {
  S: 'linear-gradient(145deg, #fff1a8, #f7b71f 42%, #9d5b09)',
  A: 'linear-gradient(145deg, #ecd1ff, #ad5ce2 48%, #4c196f)',
  B: 'linear-gradient(145deg, #d8ebff, #3b78de 48%, #122d62)',
};

const GRADE_BG: Record<ToolGrade, string> = {
  S: 'linear-gradient(180deg, #ffd95a, #f0a818)',
  A: 'linear-gradient(180deg, #c9a4f0, #8a4ce0)',
  B: 'linear-gradient(180deg, #c8d8e8, #6a8aa8)',
};
const GRADE_TEXT: Record<ToolGrade, string> = {
  S: '#5a3d05',
  A: '#fff',
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
      className="fixed inset-0 z-[860] flex items-center justify-center p-4"
      style={{
        background: 'rgba(8,32,77,0.55)',
        backdropFilter: 'blur(10px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.1)',
      }}
      onClick={onClose}
    >
      <section
        className="relative overflow-hidden rounded-xl w-full max-w-2xl max-h-[88vh] flex flex-col"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.66), rgba(255,247,239,0.72)), repeating-linear-gradient(0deg, rgba(186,121,82,0.05) 0 1px, transparent 1px 16px), rgba(247,214,191,0.46)',
          border: '1px solid rgba(208,130,105,0.34)',
          boxShadow: '0 8px 16px rgba(166,91,85,0.18), inset 0 0 0 1px rgba(255,255,255,0.42)',
          backdropFilter: 'blur(7px) saturate(1.02)',
          WebkitBackdropFilter: 'blur(7px) saturate(1.02)',
          animation: 'bxFadeUp 0.32s cubic-bezier(0.2,0.8,0.2,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between gap-2 px-3 py-2"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,232,233,0.56))',
            borderBottom: '1px solid rgba(190,117,105,0.36)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-8 w-8 grid place-items-center"
              style={{
                color: '#20bae8',
                background: '#f7fbff',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
            >
              <SvgIcon name="tool" size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-black text-sm leading-tight" style={{ color: '#5b382d' }}>
                工具庫存
              </div>
              <div className="text-[10px]" style={{ color: '#886153' }}>
                狗狗們撿到的工具都在這
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3 rounded-sm text-xs font-black"
            style={{
              color: '#fffdf8',
              background: 'linear-gradient(180deg, #f7b267, #c87e78)',
              border: '1px solid rgba(208,130,105,0.32)',
            }}
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
                  className="h-10 min-w-10 px-3 rounded-md font-black text-sm"
                  style={{
                    color: active ? '#fffdf8' : '#6e4638',
                    background: active
                      ? 'linear-gradient(180deg, #f7b267, #c87e78)'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,247,239,0.58))',
                    border: active
                      ? '1px solid rgba(208,130,105,0.46)'
                      : '1px solid rgba(208,130,105,0.28)',
                    boxShadow: active
                      ? '0 0 0 1px rgba(255,255,255,0.28) inset'
                      : '0 4px 10px rgba(166,91,85,0.08)',
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              aria-label="切換排序方向"
              onClick={() => setDesc((v) => !v)}
              className="h-10 w-10 rounded-md font-black text-lg"
              style={{
                color: '#6e4638',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,247,239,0.58))',
                border: '1px solid rgba(208,130,105,0.28)',
              }}
            >
              {desc ? '↻' : '↺'}
            </button>

            <label
              className="h-10 rounded-md flex items-center px-2"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,247,239,0.58))',
                border: '1px solid rgba(208,130,105,0.28)',
              }}
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
            className="text-[11px] mb-2 text-center font-bold"
            style={{ color: '#886153' }}
          >
            {visibleRows.length} / {tools.length} 件工具
          </div>

          {visibleRows.length === 0 ? (
            <div className="text-center text-sm py-12" style={{ color: 'var(--muted)' }}>
              {tools.length === 0
                ? '還沒撿到任何工具，多接案吧！'
                : '這個篩選沒有工具'}
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
                <ToolCard key={row.tool.instanceId} row={row} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

function ToolCard({ row }: { row: ToolRow }) {
  const { tool, equippedByName } = row;
  const accent = CARD_ACCENT[tool.grade];

  return (
    <div
      className="relative w-full overflow-hidden text-left"
      style={{
        aspectRatio: '0.78',
        minHeight: 168,
        padding: 3,
        background: FRAME_BG[tool.grade],
        border: `1px solid ${accent}`,
        boxShadow: `0 8px 16px rgba(15,23,42,0.16), inset 0 0 0 1px rgba(255,255,255,0.35)`,
      }}
      title={`${tool.name}（${tool.grade}）`}
    >
      <div
        className="relative h-full overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(226,232,240,0.7) 42%, rgba(25,28,34,0.68) 100%)',
          border: '1px solid rgba(255,255,255,0.7)',
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[72%]"
          style={{
            background: `radial-gradient(circle at 50% 22%, ${accent}33, transparent 52%)`,
          }}
        />

        <div className="absolute left-1 top-1 z-10 flex flex-col gap-1">
          <Badge color={CATEGORY_COLOR[tool.category]}>
            {CATEGORY_LABEL[tool.category].slice(0, 1)}
          </Badge>
          <span
            className="grid place-items-center text-[10px] font-black"
            style={{
              width: 18,
              minHeight: 18,
              padding: '1px 2px',
              background: GRADE_BG[tool.grade],
              color: GRADE_TEXT[tool.grade],
              border: '1px solid rgba(15,23,42,0.3)',
              boxShadow: '0 1px 3px rgba(15,23,42,0.25)',
            }}
          >
            {tool.grade}
          </span>
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

        <div className="absolute inset-x-0 top-3 bottom-[58%] flex items-center justify-center">
          <div className="drop-shadow-lg">
            <SvgIcon name={tool.iconName} size={56} />
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 px-1.5 pb-1 pt-3"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(20,22,27,0.9) 34%, rgba(20,22,27,0.98) 100%)',
          }}
        >
          <div className="truncate text-[11px] font-black leading-tight" style={{ color: '#ffffff' }}>
            {tool.name}
          </div>
          <div className="text-[9px] font-bold leading-tight mt-0.5" style={{ color: '#cbd5e1' }}>
            速 +{tool.speedBoost}　專 +{tool.qualityBoost}
          </div>
          {tool.traits.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-1">
              {tool.traits.map((tid) => {
                const def = TOOL_TRAIT_DEFS[tid];
                return (
                  <span
                    key={tid}
                    className="text-[9px] px-1 rounded-full font-bold"
                    style={{
                      background: 'rgba(120,180,255,0.85)',
                      color: '#ffffff',
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
