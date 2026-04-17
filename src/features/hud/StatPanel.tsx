import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { textLevel } from '@/lib/utils';

export function StatPanel() {
  const money = useGameStore((s) => s.money);
  const morale = useGameStore((s) => s.morale);
  const health = useGameStore((s) => s.health);
  const staffLen = useGameStore((s) => s.staff.length);
  const officeLevel = useGameStore((s) => s.officeLevel);

  const cap = OFFICE_LEVELS[officeLevel].maxStaff;
  const moraleLabel = textLevel(morale, ['爆棚', '尚可', '低落']);
  const healthLabel = textLevel(health, ['穩健', '普通', '危險']);

  const hint = companyHint(health, morale, money);

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        <StatCell label="資金" value={`$${money}`} />
        <StatCell label="員工" value={`${staffLen} / ${cap}`} />
        <StatCell
          label="士氣"
          value={moraleLabel}
          meterValue={morale}
          meterColor="linear-gradient(90deg, #a8d8a8, #66bb6a)"
        />
        <StatCell
          label="營運"
          value={healthLabel}
          meterValue={health}
          meterColor="linear-gradient(90deg, #ffb3b3, #ef8f52)"
        />
      </div>
      <div
        className="mt-2.5 p-2.5 rounded-xl text-xs"
        style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(90,70,54,0.08)', color: 'var(--muted)' }}
      >
        {hint}
      </div>
    </>
  );
}

function StatCell({
  label,
  value,
  meterValue,
  meterColor,
}: {
  label: string;
  value: string;
  meterValue?: number;
  meterColor?: string;
}) {
  return (
    <div
      className="p-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(90,70,54,0.12)' }}
    >
      <div className="text-xs" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      {typeof meterValue === 'number' && (
        <div className="h-2 rounded-full overflow-hidden mt-2" style={{ background: '#eadfce' }}>
          <div
            className="h-full transition-[width] duration-300"
            style={{ width: `${Math.max(0, Math.min(100, meterValue))}%`, background: meterColor }}
          />
        </div>
      )}
    </div>
  );
}

function companyHint(health: number, morale: number, money: number): string {
  const score = health + morale + (money > 100 ? 20 : 0);
  if (score >= 180) return '💰 公司運作良好，士氣高昂！';
  if (score >= 120) return '📈 穩健經營中。';
  if (score >= 70) return '⚠️ 需要加強營運與士氣。';
  return '🆘 情況危急，先穩住基本盤。';
}
