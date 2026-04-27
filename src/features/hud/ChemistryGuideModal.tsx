import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import type { ChemistryCombo, ProjectCategory } from '@/types';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';

const ROLE_ICON: Record<string, SvgIconName> = {
  工程師: 'tech',
  QA: 'tech',
  美術: 'design',
  企劃: 'design',
  業務: 'marketing',
  行銷: 'marketing',
  客服: 'service',
  PM: 'teamwork',
  CEO: 'trophy',
};

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
            <span className="font-extrabold text-base" style={{ color: 'var(--text)' }}>化學反應一覽</span>
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
                    ? 'linear-gradient(180deg, #f0fbf6, #e3f5ec)'
                    : 'linear-gradient(180deg, #fff4f4, #ffe7e7)',
                  border: `1px solid ${isPositive ? 'rgba(41,185,143,0.32)' : 'rgba(231,108,108,0.28)'}`,
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {combo.roles.map((r, ri) => (
                    <span key={ri} className="inline-flex items-center gap-1">
                      <SvgIcon name={ROLE_ICON[r] ?? 'people'} size={16} />
                      <span className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>{r}</span>
                      {ri < combo.roles.length - 1 && (
                        <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>+</span>
                      )}
                    </span>
                  ))}
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full ml-auto font-extrabold"
                    style={{
                      background: isPositive ? 'var(--ok)' : 'var(--danger)',
                      color: 'white',
                    }}
                  >
                    {isPositive ? '正面' : '負面'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: 'rgba(255,255,255,0.88)',
                      border: '1px solid var(--line)',
                      color: 'var(--text)',
                    }}
                  >
                    <SvgIcon name={CATEGORY_ICON[cat]} size={11} />
                    {CATEGORY_LABEL[cat]}
                  </span>
                  {effectLines(combo).map((line, ei) => (
                    <span
                      key={ei}
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{
                        background: 'rgba(255,255,255,0.88)',
                        border: '1px solid var(--line)',
                        color: isPositive ? '#1d8d6a' : '#b3433f',
                      }}
                    >
                      {line}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] leading-relaxed font-bold" style={{ color: 'var(--text)' }}>
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
