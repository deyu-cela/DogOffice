import type { CSSProperties, ReactNode } from 'react';
import { shade } from '@/lib/utils';

export type HangingClipButtonState = 'default' | 'warning' | 'busy';

type Props = {
  bgColor: string;
  iconColor: string;
  clipColor: string;
  tilt: number;
  hangY: number;
  icon: ReactNode;
  label: string;
  badge?: string | number;
  state?: HangingClipButtonState;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
};

export function HangingClipButton({
  bgColor,
  iconColor,
  clipColor,
  tilt,
  hangY,
  icon,
  label,
  badge,
  state = 'default',
  onClick,
  disabled = false,
}: Props) {
  const wrapperStyle: CSSProperties = {
    paddingTop: 8 + hangY,
  };

  const clipStyle: CSSProperties = {
    top: hangY,
    transform: `translateX(-50%) rotate(${tilt * 0.4}deg)`,
  };

  const clipBodyStyle: CSSProperties = {
    background: `linear-gradient(180deg, ${clipColor}, ${shade(clipColor, -18)})`,
  };

  const noteBg =
    state === 'warning'
      ? 'linear-gradient(180deg, var(--toprt-warning-from) 0%, var(--toprt-warning-to) 100%)'
      : bgColor;

  const noteColor = state === 'warning' ? 'var(--toprt-warning-icon)' : iconColor;

  const noteStyle: CSSProperties = {
    background: noteBg,
    transform: `rotate(${tilt}deg)`,
    color: noteColor,
    opacity: disabled ? 0.7 : 1,
  };

  const badgeStyle: CSSProperties = {
    transform: `rotate(${-tilt}deg)`,
  };

  return (
    <button
      type="button"
      className="toprt-clip-btn"
      style={wrapperStyle}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      <span className="toprt-clip" style={clipStyle} aria-hidden="true">
        <span className="toprt-clip__body" style={clipBodyStyle} />
        <span className="toprt-clip__seam" />
        <span className="toprt-clip__rivet" />
      </span>

      <span className="toprt-note" style={noteStyle}>
        <span className="toprt-note__icon">
          {state === 'busy' ? <span className="toprt-spinner" aria-hidden="true" /> : icon}
        </span>
        {badge != null && badge !== '' && (
          <span className="toprt-badge" style={badgeStyle}>
            {badge}
          </span>
        )}
      </span>

      <span className="toprt-tooltip" role="tooltip">
        {label}
      </span>
    </button>
  );
}
