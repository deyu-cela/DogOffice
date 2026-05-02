import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getDogToolCategory } from '@/lib/toolsEngine';
import { TOOL_TRAIT_DEFS } from '@/constants/tools';
import { SvgIcon } from '@/components/SvgIcon';
import type { ProjectCategory, Tool, ToolGrade } from '@/types';

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  tech: '工程',
  design: '設計',
  marketing: '行銷',
  service: '客服',
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

  if (!modal || !dog || !dogCategory) return null;

  const equippedTool = dog.equippedToolId
    ? tools.find((t) => t.instanceId === dog.equippedToolId) ?? null
    : null;

  const candidates = tools.filter(
    (t) => t.category === dogCategory && (!equipBy.has(t.instanceId) || equipBy.get(t.instanceId) === dog.id),
  );

  return (
    <div
      className="fixed inset-0 z-[880] flex items-center justify-center p-4"
      style={{
        background: 'rgba(8,32,77,0.55)',
        backdropFilter: 'blur(10px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.1)',
      }}
      onClick={close}
    >
      <div
        className="bx-panel bx-stripe p-5 rounded-xl max-w-lg w-full max-h-[88vh] overflow-y-auto"
        style={{ animation: 'bxFadeUp 0.32s cubic-bezier(0.2,0.8,0.2,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-base font-extrabold">{dog.name} 的裝備</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              {CATEGORY_LABEL[dogCategory]} 產業工具
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="px-3 py-1 rounded-lg text-sm font-bold"
            style={{ background: '#fff', border: '1px solid var(--line)', color: 'var(--blue)' }}
          >
            關閉
          </button>
        </div>

        {equippedTool && (
          <div
            className="rounded-lg p-3 mb-3"
            style={{
              background: 'linear-gradient(135deg, #fff7d6, #fff)',
              border: '1px solid rgba(240,168,24,0.4)',
            }}
          >
            <div className="text-[11px] font-bold mb-2" style={{ color: '#7a4a1c' }}>已裝備</div>
            <ToolCard tool={equippedTool} />
            <button
              type="button"
              onClick={() => unequip(dog.id)}
              className="mt-2 w-full py-2 rounded-lg font-bold text-sm"
              style={{
                background: 'linear-gradient(180deg, #ff8d8d, #e24c4c)',
                color: '#fff',
              }}
            >
              卸下
            </button>
          </div>
        )}

        <div className="text-[11px] font-bold mb-2" style={{ color: 'var(--muted)' }}>
          可用工具（{candidates.length}）
        </div>

        {candidates.length === 0 ? (
          <div
            className="text-sm text-center py-8 rounded-lg"
            style={{ color: 'var(--muted)', background: '#f7fbff', border: '1px dashed var(--line)' }}
          >
            該產業還沒撿到工具，多接案吧！
          </div>
        ) : (
          <div className="grid gap-2">
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
                  className="text-left rounded-lg p-2"
                  style={{
                    background: isEquipped ? '#eef6ff' : '#fff',
                    border: '1px solid var(--line)',
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
    <div className="flex items-start gap-2">
      <div className="grid place-items-center" style={{ width: 32, height: 32 }}>
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
              return (
                <span
                  key={tid}
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: '#eef6ff', border: '1px solid var(--line)', color: 'var(--blue)' }}
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
