import { useGameStore } from '@/store/gameStore';
import { Panel, Badge } from '@/components/Panel';
import { companyStage } from '@/lib/utils';
import { DayTimer } from './DayTimer';
import { StatPanel } from './StatPanel';
import { ExtraStats } from './ExtraStats';

export function RightPanel() {
  const staff = useGameStore((s) => s.staff);
  const morale = useGameStore((s) => s.morale);
  const health = useGameStore((s) => s.health);
  const decor = useGameStore((s) => s.decor);
  const stage = companyStage(health, morale, staff.length, decor);

  return (
    <Panel className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-extrabold">公司資訊</h2>
        <Badge>{stage}</Badge>
      </div>
      <DayTimer />
      <StatPanel />
      <ExtraStats />
      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
        💡 點房間裡的建築物開啟商店 / 員工 / 面試。
      </p>
    </Panel>
  );
}
