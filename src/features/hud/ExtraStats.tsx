import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import type { ChemistryCombo, ChemistryEntry, Dog, GameState } from '@/types';

function maxStaffOf(state: { officeLevel: number }): number {
  return OFFICE_LEVELS[state.officeLevel].maxStaff;
}

type EstimateInput = Pick<
  GameState,
  'staff' | 'productivityBoost' | 'stabilityBoost' | 'trainingBoost' | 'decor' | 'officeLevel'
>;

function estimateDaily(s: EstimateInput): { income: number; expense: number; net: number } {
  const roleCounts: Record<string, number> = {};
  s.staff.forEach((d) => {
    roleCounts[d.role] = (roleCounts[d.role] ?? 0) + 1;
  });
  const rc = (k: string) => roleCounts[k] ?? 0;

  const revenueBase = s.staff.reduce((n, d) => n + d.stats.revenue, 0) * 4;
  const productivity = s.staff.reduce((n, d) => n + d.stats.productivity, 0) + s.productivityBoost;
  const stability = s.staff.reduce((n, d) => n + d.stats.stability, 0) + s.stabilityBoost;
  const expense = Math.max(0, s.staff.reduce((n, d) => n + d.expectedSalary, 0) - rc('財務') * 3);
  const scalePenalty = Math.max(0, s.staff.length - maxStaffOf(s)) * 4;
  // 同 runAdvanceDay：沒員工時不扣罰金，有員工但缺角色才扣
  const hasStaff = s.staff.length > 0;
  const noManagerPenalty = hasStaff && rc('主管') === 0 ? 5 : 0;
  const marketingBonus = rc('行銷') * 5;
  const artBoost = rc('美術') * Math.max(1, s.decor);
  const translationStability = rc('翻譯') * 3;
  const opsStability = rc('營運') * 4;
  const qaStability = rc('QA') * 3;
  const pmBoost = rc('PM') * 3;
  const ceoBoost = rc('CEO') * 10;

  const operationBonus = Math.round(
    productivity * 1.5 +
      (stability + translationStability + opsStability + qaStability + pmBoost) * 1.2 +
      s.trainingBoost +
      marketingBonus +
      artBoost +
      ceoBoost,
  );
  const income = Math.max(0, revenueBase + operationBonus - scalePenalty - Math.round(noManagerPenalty * 0.4));
  return { income, expense, net: income - expense };
}

function groupByRole(staff: Dog[]): { role: string; count: number; emoji: string }[] {
  const map = new Map<string, { role: string; count: number; emoji: string }>();
  staff.forEach((d) => {
    const entry = map.get(d.role);
    if (entry) entry.count += 1;
    else map.set(d.role, { role: d.role, count: 1, emoji: d.emoji });
  });
  return [...map.values()].sort((a, b) => b.count - a.count);
}

type ChemHint = { combo: ChemistryCombo; missing: string; brief: string };

function chemistryHints(staff: Dog[], active: ChemistryEntry[]): ChemHint[] {
  const roleSet = new Set(staff.map((d) => d.role));
  const activeKeys = new Set(active.map((e) => e.key));
  const hints: ChemHint[] = [];
  for (const combo of CHEMISTRY_COMBOS) {
    if (combo.type !== 'positive') continue;
    const key = [...combo.roles].sort().join('+');
    if (activeKeys.has(key)) continue;
    const missing = combo.roles.filter((r) => !roleSet.has(r));
    if (missing.length !== 1) continue;
    // 粗略提取 combo.msg 中的「XXX+XXX：描述」
    const briefMatch = combo.msg.match(/：([^（]+)/);
    const brief = briefMatch ? briefMatch[1].trim() : combo.msg;
    hints.push({ combo, missing: missing[0], brief });
  }
  return hints.slice(0, 4);
}

export function ExtraStats() {
  const staff = useGameStore((s) => s.staff);
  const productivityBoost = useGameStore((s) => s.productivityBoost);
  const stabilityBoost = useGameStore((s) => s.stabilityBoost);
  const trainingBoost = useGameStore((s) => s.trainingBoost);
  const decor = useGameStore((s) => s.decor);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const queue = useGameStore((s) => s.queue);
  const vacancy = useGameStore((s) => s.vacancy);
  const vacancyTimer = useGameStore((s) => s.vacancyTimer);
  const activeChemistry = useGameStore((s) => s.activeChemistry);

  const hints = chemistryHints(staff, activeChemistry);

  const estimate = estimateDaily({
    staff,
    productivityBoost,
    stabilityBoost,
    trainingBoost,
    decor,
    officeLevel,
  });
  const roleStats = groupByRole(staff);
  const netColor = estimate.net > 0 ? '#3a7a3f' : estimate.net < 0 ? '#a03d3d' : '#7a685a';

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="p-2.5 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.82)',
          border: '1px solid rgba(90,70,54,0.12)',
        }}
      >
        <div className="text-[10px] font-bold mb-1.5" style={{ color: 'var(--muted)' }}>
          📊 每日預估
        </div>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <div className="text-sm font-extrabold" style={{ color: '#3a7a3f' }}>
              +${estimate.income}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
              收入
            </div>
          </div>
          <div>
            <div className="text-sm font-extrabold" style={{ color: '#a03d3d' }}>
              -${estimate.expense}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
              支出
            </div>
          </div>
          <div>
            <div className="text-sm font-extrabold" style={{ color: netColor }}>
              {estimate.net >= 0 ? '+' : ''}${estimate.net}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
              淨利
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between text-xs px-2.5 py-2 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.82)',
          border: '1px solid rgba(90,70,54,0.12)',
        }}
      >
        <span style={{ color: 'var(--muted)' }}>📋 候選人排隊</span>
        <span className="font-bold">{queue.length} 位</span>
      </div>

      {vacancy && (
        <div
          className="flex items-center justify-between text-xs px-2.5 py-2 rounded-xl"
          style={{ background: '#f0eae0', color: '#7a685a', border: '1px solid rgba(90,70,54,0.15)' }}
        >
          <span>⏸️ 人才荒期</span>
          <span className="font-bold">剩 {vacancyTimer} 天</span>
        </div>
      )}

      {roleStats.length > 0 && (
        <div
          className="p-2.5 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(90,70,54,0.12)',
          }}
        >
          <div className="text-[10px] font-bold mb-1.5" style={{ color: 'var(--muted)' }}>
            🐕 職業分布
          </div>
          <div className="flex flex-wrap gap-1">
            {roleStats.map((r) => (
              <span
                key={r.role}
                className="text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                style={{
                  background: '#fffaf0',
                  border: '1px solid rgba(90,70,54,0.15)',
                  color: 'var(--text)',
                }}
              >
                <span>{r.emoji}</span>
                <span>{r.role}</span>
                <span style={{ color: 'var(--muted)' }}>×{r.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {hints.length > 0 && (
        <div
          className="p-2.5 rounded-xl"
          style={{ background: '#eef7f0', border: '1.5px solid #b8d8c0' }}
        >
          <div className="text-[10px] font-bold mb-1.5" style={{ color: '#2f7a3f' }}>
            ✨ 再招 1 隻就能觸發化學反應
          </div>
          <div className="flex flex-col gap-1">
            {hints.map((h) => (
              <div key={h.missing + h.brief} className="text-[11px] leading-tight">
                <span className="font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#c7e8d0', color: '#1e5a29' }}>
                  +{h.missing}
                </span>
                <span className="ml-1.5" style={{ color: 'var(--text)' }}>
                  {h.brief}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
