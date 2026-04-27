import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';

const OFFICE_DAILY_EXPENSE = [5, 8, 14, 22, 35];
const IPO_PROJECTS = 80;

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function StatPanel() {
  const money = useGameStore((s) => s.money);
  const reputation = useGameStore((s) => s.reputation);
  const tierBudget = useGameStore((s) => s.tierBudget);
  const staff = useGameStore((s) => s.staff);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const purchases = useGameStore((s) => s.purchases);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);

  const avgMorale = staff.length > 0
    ? Math.round(staff.reduce((n, d) => n + d.morale, 0) / staff.length)
    : 70;
  const avgFatigue = staff.length > 0
    ? Math.round(staff.reduce((n, d) => n + d.fatigue, 0) / staff.length)
    : 0;
  const fatigueText = avgFatigue >= 70 ? '過勞' : avgFatigue >= 40 ? '吃緊' : '輕鬆';
  const moraleText = avgMorale >= 80 ? '高昂' : avgMorale >= 50 ? '穩定' : '低迷';
  const reputationRank = reputation >= 80 ? 'S' : reputation >= 60 ? 'A' : reputation >= 40 ? 'B' : reputation >= 20 ? 'C' : 'D';
  const office = OFFICE_LEVELS[officeLevel];

  const totalCharisma = staff.reduce((n, d) => n + d.stats.charisma, 0);
  const repBonus = Math.round(reputation / 2);
  const officeTierBonus = [0, 5, 12, 22, 35][officeLevel] ?? 0;
  const artwallBonus = (purchases.artwall ?? 0) * 8;
  const dailySalary = staff.reduce((n, d) => n + d.expectedSalary, 0);
  const dailyExpense = dailySalary + (OFFICE_DAILY_EXPENSE[officeLevel] ?? 0);
  const targetProjects = IPO_PROJECTS;

  return (
    <div className="flex flex-col gap-3">
      <MoneyCard money={money} dailyExpense={dailyExpense} />

      <div className="grid grid-cols-2 gap-3">
        <InfoCard
          icon="chart"
          title="信譽"
          value={`${reputationRank} 級`}
          hint={`口碑 ${Math.round(reputation)}`}
          color="#2f7de1"
          progress={reputation}
        />
        <InfoCard
          icon="heart"
          title="士氣"
          value={moraleText}
          hint={`${avgMorale} / 100`}
          color="#20b79c"
          progress={avgMorale}
        />
        <InfoCard
          icon="trophy"
          title="完成案件"
          value={`${projectsCompleted}`}
          hint={`IPO 目標 ${targetProjects} 件`}
          color="#f6a63a"
          progress={(projectsCompleted / targetProjects) * 100}
        />
        <InfoCard
          icon="coffee"
          title="疲勞"
          value={fatigueText}
          hint={`${avgFatigue} / 100`}
          color="#ef7a45"
          progress={avgFatigue}
        />
      </div>

      <section
        className="rounded-2xl p-3"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,249,255,0.9))',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-extrabold" style={{ color: 'var(--accent)' }}>
            <SvgIcon name="people" size={22} />
            <span>案件結構分析</span>
          </div>
          <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>
            總能力 {tierBudget}
          </span>
        </div>

        <StackBar
          parts={[
            { value: Math.max(1, totalCharisma), color: '#2f7de1' },
            { value: Math.max(1, repBonus), color: '#20c7b3' },
            { value: Math.max(1, officeTierBonus), color: '#f6c24b' },
            { value: Math.max(1, artwallBonus), color: '#ef7a45' },
          ]}
        />

        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
          <Legend icon="speed" label={`總能力 ${totalCharisma}`} color="#2f7de1" />
          <Legend icon="chart" label={`信譽 / 2 ${repBonus}`} color="#20b79c" />
          <Legend icon="office" label={`辦公室 +${officeTierBonus}`} color="#2f7de1" />
          <Legend icon="design" label={`展示牆 +${artwallBonus}`} color="#f6a63a" />
        </div>

        <div className="mt-2 text-[11px] font-bold" style={{ color: 'var(--muted)' }}>
          員工 {staff.length} / {office.maxStaff}，每日支出 ${dailyExpense.toLocaleString()}
        </div>
      </section>
    </div>
  );
}

function MoneyCard({ money, dailyExpense }: { money: number; dailyExpense: number }) {
  const progress = clampPct((money / 50000) * 100);
  const runwayDays = dailyExpense > 0 ? Math.floor(money / dailyExpense) : 99;

  return (
    <section
      className="relative overflow-hidden rounded-2xl p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,249,255,0.92))',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div className="flex items-center gap-2 text-sm font-extrabold" style={{ color: 'var(--text)' }}>
        <SvgIcon name="money" size={24} />
        <span>資金</span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="text-3xl font-extrabold leading-none" style={{ color: 'var(--text)' }}>
          ${money.toLocaleString()}
        </div>
        <div className="text-sm font-extrabold" style={{ color: runwayDays <= 5 ? '#ef5b5b' : '#20b79c' }}>
          可撐 {runwayDays} 天
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full" style={{ background: '#dceafe' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(8, progress)}%`,
            background: 'linear-gradient(90deg, #2f7de1, #45a3ff)',
          }}
        />
      </div>
      <div className="mt-1 text-[11px] font-bold" style={{ color: 'var(--muted)' }}>
        每日成本 ${dailyExpense.toLocaleString()}
      </div>
      <Sparkline />
    </section>
  );
}

function Sparkline() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-9 opacity-40"
      width="104"
      height="64"
      viewBox="0 0 104 64"
      aria-hidden="true"
    >
      <path d="M6 56 28 34 45 45 62 18 80 32 98 22" fill="none" stroke="#9cbdec" strokeWidth="2" />
      <path d="M6 56 28 34 45 45 62 18 80 32 98 22" fill="none" stroke="#2f7de1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {[6, 28, 45, 62, 80, 98].map((x, i) => {
        const y = [56, 34, 45, 18, 32, 22][i];
        return <circle key={x} cx={x} cy={y} r="2.5" fill="#9cbdec" />;
      })}
    </svg>
  );
}

function InfoCard({
  icon,
  title,
  value,
  hint,
  color,
  progress,
}: {
  icon: SvgIconName;
  title: string;
  value: string;
  hint?: string;
  color: string;
  progress: number;
}) {
  return (
    <section
      className="rounded-2xl p-3"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,249,255,0.9))',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div className="flex items-center gap-2 text-sm font-extrabold" style={{ color: 'var(--text)' }}>
        <SvgIcon name={icon} size={22} />
        <span>{title}</span>
      </div>
      <div className="mt-2 text-2xl font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] font-bold" style={{ color: 'var(--muted)' }}>
          {hint}
        </div>
      )}
      <div className="mt-3 h-2.5 overflow-hidden rounded-full" style={{ background: '#dceafe' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(8, clampPct(progress))}%`,
            background: color,
          }}
        />
      </div>
    </section>
  );
}

function StackBar({ parts }: { parts: { value: number; color: string }[] }) {
  const total = parts.reduce((n, p) => n + p.value, 0);
  return (
    <div className="flex h-4 gap-0.5 overflow-hidden rounded-full" style={{ background: '#dceafe' }}>
      {parts.map((p, i) => (
        <div
          key={`${p.color}-${i}`}
          style={{
            width: `${(p.value / total) * 100}%`,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

function Legend({ icon, label, color }: { icon: SvgIconName; label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-bold" style={{ color }}>
      <SvgIcon name={icon} size={16} />
      {label}
    </span>
  );
}
