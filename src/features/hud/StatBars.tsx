import { useGameStore } from '@/store/gameStore';
import { clamp, shade } from '@/lib/utils';
import './leftHud.css';

const BRIEFCASE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
  </svg>
);

const COFFEE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" />
    <path d="M17 10h2a2 2 0 0 1 0 4h-2M7 3c0 1.5 1 1.5 1 3M11 3c0 1.5 1 1.5 1 3" />
  </svg>
);

export function StatBars() {
  const staff = useGameStore((s) => s.staff);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);

  const avgFatigue = staff.length > 0
    ? Math.round(staff.reduce((n, d) => n + d.fatigue, 0) / staff.length)
    : 0;
  const fatigueText = avgFatigue >= 70 ? '疲憊' : avgFatigue >= 40 ? '普通' : '精神';

  return (
    <div className="lhud-bottom">
      <ProgressNote
        tilt={-2}
        bgColor="#ffd9b8"
        icon={BRIEFCASE_ICON}
        iconColor="#a86438"
        label="完成任務"
        value={`${projectsCompleted}`}
        pct={100}
        barColor="#e88a4c"
      />
      <ProgressNote
        tilt={1.5}
        bgColor="#e0d0f0"
        icon={COFFEE_ICON}
        iconColor="#7a4ab0"
        label="疲勞"
        value={fatigueText}
        pct={avgFatigue}
        barColor="#a070d8"
      />
    </div>
  );
}

type ProgressNoteProps = {
  tilt: number;
  bgColor: string;
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string;
  pct: number;
  barColor: string;
};

function ProgressNote({ tilt, bgColor, icon, iconColor, label, value, pct, barColor }: ProgressNoteProps) {
  return (
    <div className="lhud-hover">
      <div
        className="lhud-progress lhud-paper"
        style={{ background: bgColor, transform: `rotate(${tilt}deg)` }}
      >
        <span className="lhud-progress__pin" aria-hidden="true" />
        <div className="lhud-progress__head">
          <span className="lhud-progress__icon" style={{ color: iconColor }}>{icon}</span>
          <span className="lhud-progress__label">{label}</span>
          <span className="lhud-progress__value">{value}</span>
        </div>
        <div className="lhud-progress__bar">
          <div
            className="lhud-progress__fill"
            style={{
              width: `${Math.max(4, clamp(pct, 0, 100))}%`,
              background: `linear-gradient(90deg, ${shade(barColor, 20)}, ${barColor})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
