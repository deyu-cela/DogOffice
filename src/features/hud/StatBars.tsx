import type { CSSProperties } from 'react';
import { useGameStore } from '@/store/gameStore';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';

const chipStyle: CSSProperties = {
  width: 168,
  border: '1px solid rgba(208,130,105,0.32)',
  color: '#5b382d',
  background:
    'linear-gradient(90deg, rgba(255,255,255,0.62), rgba(255,247,239,0.66)), repeating-linear-gradient(0deg, rgba(186,121,82,0.05) 0 1px, transparent 1px 15px), rgba(255,240,237,0.42)',
  boxShadow:
    '0 8px 16px rgba(166,91,85,0.09), inset 0 0 0 1px rgba(255,255,255,0.48)',
  backdropFilter: 'blur(7px) saturate(1.02)',
  WebkitBackdropFilter: 'blur(7px) saturate(1.02)',
};

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
  const fatigueText = avgFatigue >= 70 ? '疲憊' : avgFatigue >= 40 ? '普通' : '精神';

  return (
    <div className="pointer-events-none absolute left-3 bottom-3 z-[680] flex flex-col items-start gap-1.5">
      <Chip index={0} icon="speed" label="速度" value={`${avgSpeed}`} progress={avgSpeed * 10} color="#f7b267" />
      <Chip index={1} icon="quality" label="品質" value={`${avgQuality}`} progress={avgQuality * 10} color="#9ec29c" />
      <Chip index={2} icon="trophy" label="完成" value={`${projectsCompleted}`} progress={100} color="#d74e63" />
      <Chip index={3} icon="coffee" label="疲勞" value={fatigueText} progress={avgFatigue} color="#c87e78" />
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
      className="bx-fade-up pointer-events-auto rounded-xl px-3 py-2"
      style={{ ...chipStyle, animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-1.5">
        <SvgIcon name={icon} size={16} />
        <span className="font-extrabold leading-none" style={{ color: '#5b382d', fontSize: 13 }}>
          {label}
        </span>
        <span
          className="ml-auto font-extrabold leading-none tabular-nums"
          style={{ color: '#6e4638', fontSize: 14 }}
        >
          {value}
        </span>
      </div>
      <div
        className="mt-1.5 overflow-hidden rounded-full"
        style={{
          height: 6,
          background: 'rgba(255,255,255,0.42)',
          border: '1px solid rgba(214,145,150,0.26)',
          boxShadow: 'inset 0 1px 2px rgba(121,70,63,0.08)',
        }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${Math.max(4, clampPct(progress))}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.42)',
          }}
        />
      </div>
    </div>
  );
}
