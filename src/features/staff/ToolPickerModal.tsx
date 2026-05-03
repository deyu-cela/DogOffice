import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getDogToolCategory } from '@/lib/toolsEngine';
import { TOOL_TRAIT_DEFS } from '@/constants/tools';
import { SvgIcon } from '@/components/SvgIcon';
import type { ProjectCategory, Tool, ToolGrade } from '@/types';
import './tool.css';

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  tech: '工程',
  design: '設計',
  marketing: '行銷',
  service: '客服',
};

const GRADE_BG: Record<ToolGrade, string> = {
  U: 'linear-gradient(180deg, #ffd9f0, #b577ff)',
  S: 'linear-gradient(180deg, #ffd95a, #f0a818)',
  A: 'linear-gradient(180deg, #c9a4f0, #8a4ce0)',
  B: 'linear-gradient(180deg, #c8d8e8, #6a8aa8)',
};
const GRADE_TEXT: Record<ToolGrade, string> = {
  U: '#3a0a4d',
  S: '#5a3d05',
  A: '#fff',
  B: '#fff',
};

export function ToolPickerModal() {
  const modal = useGameStore((s) => s.toolPickerModal);
  const staff = useGameStore((s) => s.staff);
  const tools = useGameStore((s) => s.tools);
  const close = useGameStore((s) => s.closeToolPicker);
  const equip = useGameStore((s) => s.equipTool);
  const unequip = useGameStore((s) => s.unequipTool);

  const dog = modal ? staff.find((d) => d.id === modal.dogId) : null;
  const dogCategory = dog ? getDogToolCategory(dog) : null;

  // 反查每件工具被誰裝
  const equipBy = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of staff) {
      if (d.equippedToolId) m.set(d.equippedToolId, d.id);
    }
    return m;
  }, [staff]);

  if (!modal || !dog) return null;

  const equippedTool = dog.equippedToolId
    ? tools.find((t) => t.instanceId === dog.equippedToolId) ?? null
    : null;

  // 唯讀模式：CEO/PM 沒 toolCategory，或裝備已被永久綁定
  const readOnly = !dogCategory || !!equippedTool?.lockedToDogId;

  const candidates = !readOnly && dogCategory
    ? tools.filter(
        (t) =>
          !t.lockedToDogId &&
          t.category === dogCategory &&
          (!equipBy.has(t.instanceId) || equipBy.get(t.instanceId) === dog.id),
      )
    : [];

  return (
    <div
      className="tool-scrapbook-backdrop fixed inset-0 z-[880] flex items-center justify-center p-4"
      onClick={close}
    >
      <div
        className="tool-scrapbook-panel max-w-lg w-full max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tool-scrapbook-header flex items-center justify-between gap-3 px-4 py-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="tool-scrapbook-mark">
              <SvgIcon name="tool" size={18} />
            </span>
            <div className="min-w-0">
            <div className="text-base font-extrabold">{dog.name} 的裝備</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              {dogCategory ? `${CATEGORY_LABEL[dogCategory]} 產業玩具` : dog.isCEO ? 'CEO 專屬神兵（永久綁定）' : '此職業不可裝備玩具'}
            </div>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="tool-close-btn px-3 py-1 text-sm font-bold"
          >
            關閉
          </button>
        </div>

        {equippedTool && (
          <div
            className="tool-equipped-card p-3 mb-3 mx-4"
          >
            <div className="text-[11px] font-bold mb-2" style={{ color: '#7a4a1c' }}>
              已裝備{equippedTool.lockedToDogId ? '（永久綁定）' : ''}
            </div>
            <ToolCard tool={equippedTool} />
            {!readOnly && (
              <button
                type="button"
                onClick={() => unequip(dog.id)}
                className="tool-action-danger mt-2 w-full py-2 font-bold text-sm"
              >
                卸下
              </button>
            )}
          </div>
        )}

        {!readOnly && (
          <div className="tool-count-chip text-[11px] font-bold">
            可用玩具（{candidates.length}）
          </div>
        )}

        {readOnly ? null : candidates.length === 0 ? (
          <div
            className="tool-paper-empty text-sm text-center py-8 mx-4"
            style={{ color: '#886153' }}
          >
            該產業還沒撿到玩具，多接案吧！
          </div>
        ) : (
          <div className="grid gap-2 px-4 pb-4">
            {candidates.map((tool) => {
              const isEquipped = tool.instanceId === dog.equippedToolId;
              return (
                <button
                  key={tool.instanceId}
                  type="button"
                  onClick={() => {
                    equip(dog.id, tool.instanceId);
                    close();
                  }}
                  disabled={isEquipped}
                  className="tool-list-card"
                  style={{
                    cursor: isEquipped ? 'default' : 'pointer',
                    opacity: isEquipped ? 0.5 : 1,
                  }}
                >
                  <ToolCard tool={tool} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="tool-mini-card">
      <div className="tool-mini-icon">
        <SvgIcon name={tool.iconName} size={28} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-extrabold">{tool.name}</span>
          <span
            className="text-[10px] px-1.5 rounded font-black"
            style={{
              background: GRADE_BG[tool.grade],
              color: GRADE_TEXT[tool.grade],
            }}
          >
            {tool.grade}
          </span>
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
          速度 +{tool.speedBoost}　專業 +{tool.qualityBoost}
        </div>
        {tool.traits.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tool.traits.map((tid) => {
              const def = TOOL_TRAIT_DEFS[tid];
              if (!def) return null;
              return (
                <span
                  key={tid}
                  className="tool-trait-pill text-[10px] px-1.5 py-0.5 font-bold"
                  title={def.desc}
                >
                  {def.emoji} {def.name}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
