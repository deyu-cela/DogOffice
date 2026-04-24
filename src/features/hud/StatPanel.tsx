import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { companyHint, textLevel } from '@/lib/utils';

export function StatPanel() {
  const money = useGameStore((s) => s.money);
  const morale = useGameStore((s) => s.morale);
  const health = useGameStore((s) => s.health);
  const decor = useGameStore((s) => s.decor);
  const productivityBoost = useGameStore((s) => s.productivityBoost);
  const stabilityBoost = useGameStore((s) => s.stabilityBoost);
  const trainingBoost = useGameStore((s) => s.trainingBoost);
  const staff = useGameStore((s) => s.staff);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const activeChemistry = useGameStore((s) => s.activeChemistry);
  const purchases = useGameStore((s) => s.purchases);

  const office = OFFICE_LEVELS[officeLevel];
  const cap = office.maxStaff;
  const staffLen = staff.length;
  const moraleLabel = textLevel(morale, ['爆棚', '尚可', '低落']);
  const healthLabel = textLevel(health, ['穩健', '普通', '危險']);
  const hint = companyHint(money, health, morale);

  const p = purchases;
  const count = (k: keyof typeof p) => p[k] ?? 0;

  // 來源明細（未買過顯示引導文字）
  const productivityLines: string[] = [];
  if (count('desk')) productivityLines.push(`升級辦公桌 ×${count('desk')} (+${count('desk')})`);
  if (count('coffee')) productivityLines.push(`咖啡機 ×${count('coffee')} (+${count('coffee')})`);
  if (count('artwall')) productivityLines.push(`展示牆 ×${count('artwall')} (+${count('artwall')})`);
  const productivityTip = productivityLines.length
    ? `加成來源\n${productivityLines.join('\n')}`
    : '商店買「升級辦公桌」「咖啡機」「展示牆」可增加產能';

  const stabilityLines: string[] = [];
  if (count('policy')) stabilityLines.push(`流程優化手冊 ×${count('policy')} (+${count('policy')})`);
  if (count('gym')) stabilityLines.push(`狗狗健身區 ×${count('gym')} (+${count('gym') * 2})`);
  const stabilityTip = stabilityLines.length
    ? `加成來源\n${stabilityLines.join('\n')}`
    : '商店買「流程優化手冊」「狗狗健身區」可增加穩定';

  const trainingTip = trainingBoost > 0
    ? `目前累積 +${trainingBoost}\n答對培訓問答可累積\n（點員工宿舍 → 啟動培訓）`
    : '點員工宿舍觸發「培訓問答」\n答對題目累積培訓加成';

  const decorLines: string[] = [];
  if (count('toy')) decorLines.push(`玩具區 ×${count('toy')} (+${count('toy')})`);
  if (count('lamp')) decorLines.push(`暖光吊燈 ×${count('lamp')} (+${count('lamp')})`);
  if (count('sofa')) decorLines.push(`懶骨頭 ×${count('sofa')} (+${count('sofa') * 2})`);
  if (count('artwall')) decorLines.push(`展示牆 ×${count('artwall')} (+${count('artwall') * 2})`);
  const decorTip = decorLines.length
    ? `裝飾來源\n${decorLines.join('\n')}`
    : '商店買「玩具」「吊燈」「懶骨頭」「展示牆」可增加裝飾';

  const nextOffice = OFFICE_LEVELS[officeLevel + 1];
  const officeTip = nextOffice
    ? `員工上限 ${cap} 位\n下一級：${nextOffice.name}（上限 ${nextOffice.maxStaff}）\n擴建成本 $${nextOffice.upgradeCost}`
    : `員工上限 ${cap} 位\n已達最大規模`;

  const moneyTip = `目前資金：$${money}\n每日自動結算\n買裝備前先累積一點最穩`;
  const staffTip = `員工 ${staffLen} / ${cap}\n點人資辦公室面試招募\n點員工宿舍管理`;
  const moraleTip = `目前士氣：${morale}\n買零食/玩具/吊燈 + 陪玩可提升\n低於 40 工作效率會下降`;
  const healthTip = `目前營運：${health}\n員工產能與穩定影響\n低於 15 + 士氣低會破產`;

  return (
    <div className="flex flex-col gap-2.5 mt-3">
      <div className="grid grid-cols-2 gap-2.5">
        <StatCell label="資金" icon="coin" value={`$${money}`} tooltip={moneyTip} />
        <StatCell label="員工" icon="users" value={`${staffLen} / ${cap}`} tooltip={staffTip} />
        <StatCell
          label="士氣"
          icon="heart"
          value={`${morale} · ${moraleLabel}`}
          meterValue={morale}
          meterColor="linear-gradient(90deg, #a8d8a8, #66bb6a)"
          tooltip={moraleTip}
        />
        <StatCell
          label="營運"
          icon="pulse"
          value={`${health} · ${healthLabel}`}
          meterValue={health}
          meterColor="linear-gradient(90deg, #ffb3b3, #ef8f52)"
          tooltip={healthTip}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="產能" icon="bolt" value={`+${productivityBoost}`} color="#3a7a3f" tooltip={productivityTip} />
        <MiniStat label="穩定" icon="shield" value={`+${stabilityBoost}`} color="#2b7abd" tooltip={stabilityTip} />
        <MiniStat label="培訓" icon="cap" value={`+${trainingBoost}`} color="#7b3a9f" tooltip={trainingTip} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MiniStat label="辦公室" icon="building" value={office.name} color="#8b6a45" tooltip={officeTip} />
        <MiniStat label="裝飾 Lv" icon="palette" value={`${decor}`} color="#d07a1f" tooltip={decorTip} />
      </div>

      {activeChemistry.length > 0 && (
        <div
          className="p-2.5 rounded-xl text-xs"
          style={{ background: '#fff0f3', border: '1.5px solid #e0c280' }}
        >
          <div className="font-bold mb-1 flex items-center gap-1.5" style={{ color: '#8a6a2a' }}>
            <Icon name="sparkles" size={14} />
            <span>化學反應 ({activeChemistry.length})</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {activeChemistry.map((c) => (
              <div
                key={c.key}
                className="leading-tight"
                style={{
                  color: c.combo.type === 'positive' ? '#3a7a3f' : '#a03d3d',
                  fontWeight: 500,
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Icon name={c.combo.type === 'positive' ? 'sparkles' : 'alert'} size={13} />
                  <span>{stripLeadingEmoji(c.combo.msg)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
  icon,
  value,
  meterValue,
  meterColor,
  tooltip,
}: {
  label: ReactNode;
  icon?: 'coin' | 'heart' | 'pulse' | 'users';
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
      <div className="text-xs flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
        {icon ? <Icon name={icon} size={13} /> : null}
        <span>{label}</span>
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
  icon,
  value,
  color,
  tooltip,
}: {
  label: ReactNode;
  icon?: 'bolt' | 'building' | 'cap' | 'palette' | 'shield';
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
        className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1"
        style={{ color: 'var(--muted)' }}
      >
        {icon ? <Icon name={icon} size={11} /> : null}
        <span>{label}</span>
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

function stripLeadingEmoji(text: string): string {
  return text.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trimStart();
}
