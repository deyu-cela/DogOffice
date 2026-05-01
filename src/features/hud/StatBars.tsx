import { useGameStore } from '@/store/gameStore';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';

const IPO_PROJECTS = 80;

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function StatBars() {
  const staff = useGameStore((s) => s.staff);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);

  const avgSpeed = staff.length > 0
    ? Math.round((staff.reduce((n, d) => n + d.stats.speed, 0) / staff.length) * 10) / 10
    : 0;
  const avgQuality = staff.length > 0
    ? Math.round((staff.reduce((n, d) => n + d.stats.quality, 0) / staff.length) * 10) / 10
    : 0;
  const avgFatigue = staff.length > 0
    ? Math.round(staff.reduce((n, d) => n + d.fatigue, 0) / staff.length)
    : 0;
  const fatigueText = avgFatigue >= 70 ? '過勞' : avgFatigue >= 40 ? '吃緊' : '輕鬆';

  return (
    <div className="pointer-events-none absolute left-3 bottom-3 z-[680] flex flex-col items-start gap-1.5">
      <Chip index={0} icon="speed" label="速度" value={`${avgSpeed}`} progress={avgSpeed * 10} color="#2f7de1" />
      <Chip index={1} icon="quality" label="專業" value={`${avgQuality}`} progress={avgQuality * 10} color="#20c7b3" />
      <Chip
        index={2}
        icon="trophy"
        label="案件"
        value={`${projectsCompleted}/${IPO_PROJECTS}`}
        progress={(projectsCompleted / IPO_PROJECTS) * 100}
        color="#f0a818"
      />
      <Chip index={3} icon="coffee" label="疲勞" value={fatigueText} progress={avgFatigue} color="#ef7a45" />
    </div>
  );
}

function Chip({
  index, icon, label, value, progress, color,
}: {
  index: number;
  icon: SvgIconName;
  label: string;
  value: string;
  progress: number;
  color: string;
}) {
  return (
    <div
      className="bx-chip bx-stripe bx-fade-up pointer-events-auto rounded-xl px-3 py-2"
      style={{ width: 168, animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-1.5">
        <SvgIcon name={icon} size={16} />
        <span className="font-extrabold leading-none" style={{ color: 'var(--ink)', fontSize: 13, letterSpacing: '0.02em' }}>
          {label}
        </span>
        <span
          className="ml-auto font-extrabold leading-none tabular-nums"
          style={{ color: 'var(--ink)', fontSize: 14 }}
        >
          {value}
        </span>
      </div>
      <div
        className="mt-1.5 overflow-hidden rounded-full"
        style={{
          height: 6,
          background: 'rgba(95,179,255,0.18)',
          boxShadow: 'inset 0 0 0 1px rgba(95,179,255,0.18)',
        }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${Math.max(4, clampPct(progress))}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 8px ${color}88, inset 0 1px 0 rgba(255,255,255,0.4)`,
          }}
        />
      </div>
    </div>
  );
}
