import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { Meter } from '@/components/Meter';
import { Badge } from '@/components/Panel';
import { textLevel } from '@/lib/utils';

export function StatPanel() {
  const day = useGameStore((s) => s.day);
  const money = useGameStore((s) => s.money);
  const morale = useGameStore((s) => s.morale);
  const health = useGameStore((s) => s.health);
  const staffLen = useGameStore((s) => s.staff.length);
  const officeLevel = useGameStore((s) => s.officeLevel);

  const cap = OFFICE_LEVELS[officeLevel].maxStaff;
  const moraleLabel = textLevel(morale, ['士氣爆棚', '尚可', '低落']);
  const healthLabel = textLevel(health, ['營運穩健', '有隱憂', '危險']);

  const hint = companyHint(health, morale, money);

  return (
    <div>
      <div className="flex justify-between items-center mb-3 gap-2">
        <h2 className="text-xl font-extrabold">📋 狀態</h2>
        <Badge>第 {day} 天</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <StatCell label="資金" value={`$${money}`} />
        <StatCell label="員工" value={`${staffLen} / ${cap}`} />
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-sm">
          <span>士氣</span>
          <span className="font-bold">{moraleLabel}</span>
        </div>
        <Meter value={morale} color="linear-gradient(90deg, #a8d8a8, #66bb6a)" />
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-sm">
          <span>營運</span>
          <span className="font-bold">{healthLabel}</span>
        </div>
        <Meter value={health} color="linear-gradient(90deg, #ffb3b3, #ef8f52)" />
      </div>
      <div className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
        {hint}
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(90,70,54,0.12)' }}
    >
      <div className="text-xs" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
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
