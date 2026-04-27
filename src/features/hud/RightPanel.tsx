import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Panel } from '@/components/Panel';
import { companyStage } from '@/lib/utils';
import { DayTimer } from './DayTimer';
import { StatPanel } from './StatPanel';
import { ExtraStats } from './ExtraStats';
import { ChemistryGuideModal } from './ChemistryGuideModal';
import { SvgIcon } from '@/components/SvgIcon';

export function RightPanel() {
  const staff = useGameStore((s) => s.staff);
  const reputation = useGameStore((s) => s.reputation);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);
  const avgMorale = staff.length > 0
    ? staff.reduce((n, d) => n + d.morale, 0) / staff.length
    : 70;
  const stage = companyStage(reputation, avgMorale, staff.length, projectsCompleted);
  const [chemOpen, setChemOpen] = useState(false);

  return (
    <Panel className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SvgIcon name="chart" size={25} />
          <h2 className="text-base font-extrabold">公司資訊</h2>
        </div>
        <button
          type="button"
          onClick={() => setChemOpen(true)}
          className="rounded-xl px-3 py-2 text-xs font-extrabold"
          style={{
            background: 'linear-gradient(180deg, #ffffff, #eaf4ff)',
            color: 'var(--text)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          {stage}
        </button>
      </div>

      <DayTimer />
      <StatPanel />
      <ExtraStats />

      {chemOpen && <ChemistryGuideModal onClose={() => setChemOpen(false)} />}
    </Panel>
  );
}
