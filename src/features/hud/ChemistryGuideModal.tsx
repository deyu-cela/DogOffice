import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import { DOG_ROLES, CEO_DOG } from '@/constants/dogRoles';
import type { ChemistryCombo, ProjectCategory } from '@/types';

const ROLE_EMOJI = (() => {
  const map: Record<string, string> = {};
  for (const r of DOG_ROLES) map[r.role] = r.emoji;
  map[CEO_DOG.role] = CEO_DOG.emoji;
  return map;
})();

const CATEGORY_LABEL: Record<ProjectCategory | 'any', string> = {
  any: '全類別',
  tech: ' 技術',
  design: ' 設計',
  marketing: ' 行銷',
  service: ' 客服',
};

function effectLines(combo: ChemistryCombo): string[] {
  const lines: string[] = [];
  const b = combo.bonus;
  if (b.speedMul != null) lines.push(`速度 ×${b.speedMul}`);
  if (b.qualityMul != null) lines.push(`品質 ×${b.qualityMul}`);
  if (b.teamworkMul != null) lines.push(`協作 ×${b.teamworkMul}`);
  if (b.charismaMul != null) lines.push(`魅力 ×${b.charismaMul}`);
  if (b.moraleDelta != null) {
    lines.push(`隊員士氣 ${b.moraleDelta >= 0 ? '+' : ''}${b.moraleDelta}/天`);
  }
  return lines;
}

export function ChemistryGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[850] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-3xl max-w-md w-full overflow-y-auto"
        style={{
          maxHeight: '85vh',
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid rgba(90,70,54,0.18)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 pb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl"></span>
            <span className="font-extrabold text-base">化學反應一覽</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-2.5 py-1 rounded-full"
            style={{ background: '#eeeae4', color: '#5b3c2b' }}
          >
            ✕
          </button>
        </div>

        <div className="px-4 pb-2 text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
          兩位指定角色都派到同一案、且符合類別時自動觸發。負面組合會扣分，安排時注意。
        </div>

        <div className="p-4 pt-2 flex flex-col gap-2">
          {CHEMISTRY_COMBOS.map((combo, i) => {
            const isPositive = combo.type === 'positive';
            const cat = combo.category ?? 'any';
            return (
              <div
                key={i}
                className="p-3 rounded-2xl"
                style={{
                  background: isPositive
                    ? 'linear-gradient(180deg, #eef7f0, #e0eee3)'
                    : 'linear-gradient(180deg, #fff0f0, #f8e0e0)',
                  border: `1.5px solid ${isPositive ? '#b8d8c0' : '#e8c8c8'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {combo.roles.map((r, ri) => (
                    <span key={ri} className="flex items-center gap-1">
                      <span className="text-lg">{ROLE_EMOJI[r] ?? ''}</span>
                      <span className="text-sm font-bold">{r}</span>
                      {ri < combo.roles.length - 1 && (
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>+</span>
                      )}
                    </span>
                  ))}
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
                    style={{
                      background: isPositive ? '#7fc88f' : '#d68a8a',
                      color: 'white',
                    }}
                  >
                    {isPositive ? '正面' : '負面'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(90,70,54,0.15)' }}
                  >
                    {CATEGORY_LABEL[cat]}
                  </span>
                  {effectLines(combo).map((line, ei) => (
                    <span
                      key={ei}
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(90,70,54,0.15)',
                        color: isPositive ? '#2f7a3f' : '#c0392b',
                      }}
                    >
                      {line}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] leading-relaxed" style={{ color: '#5b3c2b' }}>
                  {combo.msg}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
