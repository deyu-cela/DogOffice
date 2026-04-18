import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import type { ChemistryCombo, ChemistryEntry, Dog, GameState } from '@/types';

function maxStaffOf(state: { officeLevel: number }): number {
  return OFFICE_LEVELS[state.officeLevel].maxStaff;
}

type EstimateInput = Pick<
  GameState,
  'staff' | 'productivityBoost' | 'stabilityBoost' | 'trainingBoost' | 'decor' | 'officeLevel' | 'activeChemistry'
>;

// 須與 src/store/gameStore.ts runAdvanceDay 保持同步
const LEVEL_MULTIPLIER = [1.0, 1.15, 1.35, 1.65, 2.1];

function estimateDaily(s: EstimateInput): { income: number; expense: number; net: number } {
  const roleCounts: Record<string, number> = {};
  s.staff.forEach((d) => {
    roleCounts[d.role] = (roleCounts[d.role] ?? 0) + 1;
  });
  const rc = (k: string) => roleCounts[k] ?? 0;

  // 辦公室等級倍率
  const levelMul = LEVEL_MULTIPLIER[s.officeLevel] ?? 1;

  // 化學反應每日持續加成
  const chem = s.activeChemistry.reduce(
    (acc, { combo }) => ({
      productivity: acc.productivity + (combo.bonus.productivity ?? 0),
      stability: acc.stability + (combo.bonus.stability ?? 0),
      revenue: acc.revenue + (combo.bonus.revenue ?? 0),
    }),
    { productivity: 0, stability: 0, revenue: 0 },
  );

  const staffRevenue = s.staff.reduce((n, d) => n + d.stats.revenue, 0);
  const revenueBase = Math.round((staffRevenue + chem.revenue) * 5 * levelMul);
  const productivity = s.staff.reduce((n, d) => n + d.stats.productivity, 0) + s.productivityBoost + chem.productivity;
  const stability = s.staff.reduce((n, d) => n + d.stats.stability, 0) + s.stabilityBoost + chem.stability;
  const expense = Math.max(0, s.staff.reduce((n, d) => n + d.expectedSalary, 0) - rc('財務') * 3);
  const scalePenalty = Math.max(0, s.staff.length - maxStaffOf(s)) * 4;
  // 與 runAdvanceDay 一致：員工 >=3 缺主管才扣，>=4 缺營運才扣
  const noManagerPenalty = s.staff.length >= 3 && rc('主管') === 0 ? 5 : 0;
  const noOpsPenalty = s.staff.length >= 4 && rc('營運') === 0 ? 3 : 0;
  const marketingBonus = rc('行銷') * 5;
  const artBoost = rc('美術') * Math.max(1, s.decor);
  const translationStability = rc('翻譯') * 3;
  const opsStability = rc('營運') * 4;
  const qaStability = rc('QA') * 3;
  const pmBoost = rc('PM') * 3;
  const ceoBoost = rc('CEO') * 10;

  const opBonusMul = 1 + (levelMul - 1) * 0.5;
  const operationBonus = Math.round(
    (productivity * 1.5 +
      (stability + translationStability + opsStability + qaStability + pmBoost) * 1.2) *
      opBonusMul +
      s.trainingBoost +
      marketingBonus +
      artBoost +
      ceoBoost,
  );
  const income = Math.max(0, revenueBase + operationBonus - scalePenalty - Math.round(noManagerPenalty * 0.4));
  // 支出只扣錢不影響 health/morale，這裡僅估算；noOpsPenalty 只影響 health 不影響現金流
  void noOpsPenalty;
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
    activeChemistry,
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
