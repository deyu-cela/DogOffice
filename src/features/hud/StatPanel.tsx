import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { companyHint, textLevel } from '@/lib/utils';

const OFFICE_DAILY_EXPENSE = [5, 8, 14, 22, 35];

export function StatPanel() {
  const money = useGameStore((s) => s.money);
  const reputation = useGameStore((s) => s.reputation);
  const tierBudget = useGameStore((s) => s.tierBudget);
  const staff = useGameStore((s) => s.staff);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const companyBuffs = useGameStore((s) => s.companyBuffs);
  const purchases = useGameStore((s) => s.purchases);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);
  const projectsFailed = useGameStore((s) => s.projectsFailed);
  const clients = useGameStore((s) => s.clients);

  const office = OFFICE_LEVELS[officeLevel];
  const cap = office.maxStaff;
  const staffLen = staff.length;
  const avgMorale = staffLen > 0
    ? Math.round(staff.reduce((n, d) => n + d.morale, 0) / staffLen)
    : 70;
  const moraleLabel = textLevel(avgMorale, ['爆棚', '尚可', '低落']);
  const repLabel = textLevel(reputation, ['口碑爆表', '一般', '危險']);
  const hasActive = clients.some((c) => c.status === 'active');
  const hint = companyHint(money, reputation, avgMorale, hasActive);

  // 稀有度拆解：總魅力 + 信譽/2 + 辦公室加成 + artwall ×8（CEO 在隊上 ×1.5）
  const totalCharisma = staff.reduce((n, d) => n + d.stats.charisma, 0);
  const repBonus = Math.round(reputation / 2);
  const officeTierBonus = [0, 5, 12, 22, 35][officeLevel] ?? 0;
  const artwallBonus = (purchases.artwall ?? 0) * 8;
  const hasCEO = staff.some((d) => d.isCEO);
  const baseSum = totalCharisma + repBonus + officeTierBonus + artwallBonus;

  const dailySalary = staff.reduce((n, d) => n + d.expectedSalary, 0);
  const dailyExpense = dailySalary + (OFFICE_DAILY_EXPENSE[officeLevel] ?? 0);

  const moneyTip = `目前資金：$${money}\n每日固定支出：$${dailyExpense}\n（員工底薪 $${dailySalary} + 辦公室 $${OFFICE_DAILY_EXPENSE[officeLevel] ?? 0}）`;
  const repTip = `信譽：${Math.round(reputation)} / 100\n完成案件 +X、失敗案件 -X\n影響 inbox 案件稀有度與 tier 上門機率\nIPO 條件之一：信譽 ≥ 80`;
  const moraleTip = `員工平均士氣：${avgMorale}\n影響案件進度乘數（< 30 → 0.7x、> 80 → 1.15x）\n買零食 / 開派對 / 完成案 → 提升`;
  const projectTip = `完成 ${projectsCompleted} 件 / 失敗 ${projectsFailed} 件\nIPO 條件之一：完成案件 ≥ 30`;
  const charismaTip = `全公司總魅力：${totalCharisma}\n= Σ 每隻員工的 charisma\n直接影響稀有度（越高越能接到稀有案）\n可招業務、行銷等高魅力職業`;

  const nextOffice = OFFICE_LEVELS[officeLevel + 1];
  const officeTip = nextOffice
    ? `員工上限 ${cap} 位\n下一級：${nextOffice.name}（上限 ${nextOffice.maxStaff}）\n擴建成本 $${nextOffice.upgradeCost}\nIPO 條件之一：辦公室 ≥ Lv3`
    : `員工上限 ${cap} 位\n已達最大規模 🏆`;

  const staffTip = `員工 ${staffLen} / ${cap}\n點人資辦公室面試招募\n點員工宿舍管理`;

  return (
    <div className="flex flex-col gap-2.5 mt-3">
      <div className="grid grid-cols-2 gap-2.5">
        <StatCell label="💰 資金" value={`$${money}`} tooltip={moneyTip} />
        <StatCell
          label="📈 信譽"
          value={`${Math.round(reputation)} · ${repLabel}`}
          meterValue={reputation}
          meterColor="linear-gradient(90deg, #c8e6c9, #66bb6a)"
          tooltip={repTip}
        />
        <StatCell
          label="❤️ 員工平均士氣"
          value={`${avgMorale} · ${moraleLabel}`}
          meterValue={avgMorale}
          meterColor="linear-gradient(90deg, #a8d8a8, #66bb6a)"
          tooltip={moraleTip}
        />
        <StatCell
          label="🏆 完成案件"
          value={`${projectsCompleted} 件`}
          meterValue={Math.min(100, (projectsCompleted / 30) * 100)}
          meterColor="linear-gradient(90deg, #ffd36a, #c9a064)"
          tooltip={projectTip}
        />
      </div>

      {/* 稀有度詳細區（顯示在 mini buff 數值上方）*/}
      <div
        className="p-2.5 rounded-xl"
        style={{
          background: 'linear-gradient(180deg, #fff8e8, #ffefcc)',
          border: '1.5px solid rgba(208,122,31,0.3)',
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold" style={{ color: '#a36a3a' }}>
            ✨ 案件稀有度
          </span>
          <span className="text-base font-extrabold" style={{ color: '#d07a1f' }}>
            {tierBudget}
          </span>
        </div>
        <div className="text-[10px] leading-relaxed" style={{ color: 'var(--muted)' }}>
          📣 總魅力 <b>{totalCharisma}</b>
          {' + '}
          📈 信譽/2 <b>{repBonus}</b>
          {' + '}
          🏢 辦公室 <b>+{officeTierBonus}</b>
          {artwallBonus > 0 && <> {' + '} 🖼️ 展示牆 <b>+{artwallBonus}</b></>}
          {hasCEO && <> {' '} <span style={{ color: '#c0392b' }}>× CEO 1.5</span></>}
          {' = '}
          <b style={{ color: '#d07a1f' }}>{tierBudget}</b>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <MiniStat label="⚡ 速度" value={`+${companyBuffs.speedBoost}`} color="#3a7a3f" tooltip="商店買 desk/coffee/gym 提升" />
        <MiniStat label="✨ 專業" value={`+${companyBuffs.qualityBoost}`} color="#2b7abd" tooltip="商店買 policy 提升" />
        <MiniStat label="🤝 協作" value={`+${companyBuffs.teamworkBoost}`} color="#7b3a9f" tooltip="商店買 sofa/gym 提升" />
        <MiniStat label="📣 魅力" value={`${totalCharisma}`} color="#d07a1f" tooltip={charismaTip} />
      </div>

      <div
        className="p-2.5 rounded-xl text-xs"
        style={{
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(90,70,54,0.08)',
          color: 'var(--muted)',
        }}
      >
        {hint}
      </div>
      {/* 邏輯佔位避免 baseSum 未使用警告（公式對外用詳細區呈現） */}
      <span style={{ display: 'none' }}>{baseSum}</span>
    </div>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <div
      className="absolute z-50 text-[11px] px-3 py-2 rounded-lg whitespace-pre-line pointer-events-none"
      style={{
        left: '50%',
        bottom: 'calc(100% + 6px)',
        transform: 'translateX(-50%)',
        background: '#3d2f25',
        color: '#fffaf0',
        minWidth: 180,
        maxWidth: 260,
        width: 'max-content',
        boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}

function StatCell({
  label,
  value,
  meterValue,
  meterColor,
  tooltip,
}: {
  label: string;
  value: string;
  meterValue?: number;
  meterColor?: string;
  tooltip?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="p-3 rounded-2xl relative cursor-help"
      style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(90,70,54,0.12)' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="text-xs" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div className="text-xl font-extrabold mt-1">{value}</div>
      {typeof meterValue === 'number' && (
        <div className="h-2 rounded-full overflow-hidden mt-2" style={{ background: '#eadfce' }}>
          <div
            className="h-full transition-[width] duration-300"
            style={{
              width: `${Math.max(0, Math.min(100, meterValue))}%`,
              background: meterColor,
            }}
          />
        </div>
      )}
      {hover && tooltip && <Tooltip text={tooltip} />}
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
  tooltip,
}: {
  label: string;
  value: string;
  color: string;
  tooltip?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="p-2 rounded-xl relative cursor-help"
      style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(90,70,54,0.12)' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ color: 'var(--muted)' }}
      >
        {label}
      </div>
      <div
        className="text-sm font-extrabold mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ color }}
      >
        {value}
      </div>
      {hover && tooltip && <Tooltip text={tooltip} />}
    </div>
  );
}
