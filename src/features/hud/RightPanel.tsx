import { useGameStore } from '@/store/gameStore';
import { Panel, Badge } from '@/components/Panel';
import { companyStage } from '@/lib/utils';
import { DayTimer } from './DayTimer';
import { StatPanel } from './StatPanel';
import { ExtraStats } from './ExtraStats';

export function RightPanel() {
  const staff = useGameStore((s) => s.staff);
  const reputation = useGameStore((s) => s.reputation);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);
  const avgMorale = staff.length > 0
    ? staff.reduce((n, d) => n + d.morale, 0) / staff.length
    : 70;
  const stage = companyStage(reputation, avgMorale, staff.length, projectsCompleted);

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
        💡 點 OfficeScene 的建築物開啟接案處 / 商店 / 員工 / 面試。
      </p>
    </Panel>
  );
}
