import type { CSSProperties } from 'react';

export type IconName =
  | 'alert'
  | 'bolt'
  | 'building'
  | 'cap'
  | 'coin'
  | 'cloud'
  | 'device'
  | 'dog'
  | 'globe'
  | 'heart'
  | 'info'
  | 'list'
  | 'log'
  | 'palette'
  | 'pulse'
  | 'refresh'
  | 'save'
  | 'shield'
  | 'sparkles'
  | 'spinner'
  | 'target'
  | 'trophy'
  | 'users';

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

export function Icon({ name, size = 18, className = '', style, title }: IconProps) {
  const common = {
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': title ? undefined : true,
    role: title ? 'img' : 'presentation',
    className: `${name === 'spinner' ? 'animate-spin ' : ''}${className}`.trim(),
    style,
  };

  return (
    <svg {...common}>
      {title ? <title>{title}</title> : null}
      {renderIcon(name)}
    </svg>
  );
}

function renderIcon(name: IconName) {
  switch (name) {
    case 'alert':
      return (
        <>
          <path d="M12 4.25 20 18H4l8-13.75Z" />
          <path d="M12 9v4.5" />
          <circle cx="12" cy="16.4" r="0.8" fill="currentColor" stroke="none" />
        </>
      );
    case 'bolt':
      return <path d="m13.2 2.75-6.8 10h4.75L10.8 21.25l6.8-10h-4.75l.35-8.5Z" />;
    case 'building':
      return (
        <>
          <path d="M5.5 20.25h13" />
          <path d="M7 20.25V5.75c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v14.5" />
          <path d="M10 8.25h1.5" />
          <path d="M13.5 8.25H15" />
          <path d="M10 11.5h1.5" />
          <path d="M13.5 11.5H15" />
          <path d="M11 20.25v-4h2v4" />
        </>
      );
    case 'cap':
      return (
        <>
          <path d="m3.5 9.75 8.5-4 8.5 4-8.5 4-8.5-4Z" />
          <path d="M6.25 11.25v3.5c0 .9 2.75 2.75 5.75 2.75s5.75-1.85 5.75-2.75v-3.5" />
          <path d="M20.5 10.25v4.5" />
          <path d="M20.5 14.75c0 .95-.6 1.75-1.25 1.75S18 15.7 18 14.75s.6-1.75 1.25-1.75 1.25.8 1.25 1.75Z" />
        </>
      );
    case 'coin':
      return (
        <>
          <ellipse cx="12" cy="8.25" rx="5.75" ry="2.75" />
          <path d="M6.25 8.25v6.5c0 1.5 2.6 2.75 5.75 2.75s5.75-1.25 5.75-2.75v-6.5" />
          <path d="M6.25 11.5c0 1.5 2.6 2.75 5.75 2.75s5.75-1.25 5.75-2.75" />
        </>
      );
    case 'cloud':
      return (
        <>
          <path d="M7.25 18.25h9.25a3.25 3.25 0 1 0-.55-6.45A4.75 4.75 0 0 0 6.9 9.6 3.2 3.2 0 0 0 7.25 18.25Z" />
        </>
      );
    case 'device':
      return (
        <>
          <rect x="6" y="4.75" width="12" height="14.5" rx="2.5" />
          <path d="M10 7.5h4" />
          <circle cx="12" cy="16.25" r="0.9" fill="currentColor" stroke="none" />
        </>
      );
    case 'dog':
      return (
        <>
          <path d="M8 6.5 5.75 4.75 5 8.25" />
          <path d="m16 6.5 2.25-1.75.75 3.5" />
          <path d="M7.25 18.25V10.5c0-2.2 1.75-4 3.9-4h1.7c2.15 0 3.9 1.8 3.9 4v7.75" />
          <path d="M9.5 18.25c.4 1.2 1.35 2 2.5 2s2.1-.8 2.5-2" />
          <circle cx="9.75" cy="12" r="0.75" fill="currentColor" stroke="none" />
          <circle cx="14.25" cy="12" r="0.75" fill="currentColor" stroke="none" />
          <path d="M12 12.5v1.5" />
          <path d="M10.5 15.5c.55.5 1 .75 1.5.75s.95-.25 1.5-.75" />
        </>
      );
    case 'globe':
      return (
        <>
          <circle cx="12" cy="12" r="8.25" />
          <path d="M3.75 12h16.5" />
          <path d="M12 3.75c2.15 2.15 3.35 5.1 3.35 8.25S14.15 18.1 12 20.25" />
          <path d="M12 3.75c-2.15 2.15-3.35 5.1-3.35 8.25S9.85 18.1 12 20.25" />
        </>
      );
    case 'heart':
      return (
        <path d="M12 19.25s-6.75-4.05-6.75-9a3.7 3.7 0 0 1 6.35-2.6L12 8.05l.4-.4a3.7 3.7 0 0 1 6.35 2.6c0 4.95-6.75 9-6.75 9Z" />
      );
    case 'info':
      return (
        <>
          <circle cx="12" cy="12" r="8.25" />
          <path d="M12 10.25v5" />
          <circle cx="12" cy="7.4" r="0.8" fill="currentColor" stroke="none" />
        </>
      );
    case 'list':
      return (
        <>
          <path d="M9 7.5h9" />
          <path d="M9 12h9" />
          <path d="M9 16.5h9" />
          <circle cx="5.25" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="5.25" cy="12" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="5.25" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
        </>
      );
    case 'log':
      return (
        <>
          <path d="M7.5 4.75h8a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V6.75a2 2 0 0 1 2-2Z" />
          <path d="M9.25 8.25h6" />
          <path d="M9.25 11.5h6" />
          <path d="M9.25 14.75h4" />
        </>
      );
    case 'palette':
      return (
        <>
          <path d="M12 4.25c-4.55 0-8.25 3.25-8.25 7.25 0 3.35 2.55 6.25 6 6.25h1.05c1 0 1.7.85 1.5 1.8-.15.7.35 1.2 1.1 1.2 4.3 0 7.85-3.25 7.85-7.65 0-4.8-4.15-8.85-9.25-8.85Z" />
          <circle cx="8" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="10.25" cy="8.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="13.75" cy="8.25" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="16.1" cy="11" r="0.9" fill="currentColor" stroke="none" />
        </>
      );
    case 'pulse':
      return (
        <>
          <path d="M4 13h3.35l1.75-3.5 2.8 7 2.1-4.25h5.95" />
          <path d="M4 19.25h16" />
        </>
      );
    case 'refresh':
      return (
        <>
          <path d="M19 8.75A7.5 7.5 0 0 0 6.75 6.9" />
          <path d="M6.75 6.9V4.25" />
          <path d="M6.75 6.9H9.5" />
          <path d="M5 15.25A7.5 7.5 0 0 0 17.25 17.1" />
          <path d="M17.25 17.1v2.65" />
          <path d="M17.25 17.1H14.5" />
        </>
      );
    case 'save':
      return (
        <>
          <path d="M6.25 4.75h9.5l2 2v12.5H6.25z" />
          <path d="M8.5 4.75v4h6v-4" />
          <path d="M9 15.25h6" />
        </>
      );
    case 'shield':
      return (
        <>
          <path d="M12 3.75 18 6v5.2c0 4.2-2.55 7.4-6 9.05-3.45-1.65-6-4.85-6-9.05V6l6-2.25Z" />
          <path d="m9.75 12.25 1.6 1.6 3.15-3.35" />
        </>
      );
    case 'sparkles':
      return (
        <>
          <path d="m12 3.75 1.15 3.1L16.25 8l-3.1 1.15L12 12.25l-1.15-3.1L7.75 8l3.1-1.15L12 3.75Z" />
          <path d="m18 13.5.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
          <path d="m6.5 14 .85 2.2 2.15.8-2.15.8-.85 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
        </>
      );
    case 'spinner':
      return (
        <>
          <path d="M12 4a8 8 0 1 1-5.65 2.35" opacity="0.3" />
          <path d="M12 4a8 8 0 0 1 8 8" />
        </>
      );
    case 'target':
      return (
        <>
          <circle cx="12" cy="12" r="7.75" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </>
      );
    case 'trophy':
      return (
        <>
          <path d="M8 4.75h8v3.1a4 4 0 0 1-4 4 4 4 0 0 1-4-4v-3.1Z" />
          <path d="M9.5 11.75v2.5c0 1.1-.9 2-2 2H7" />
          <path d="M14.5 11.75v2.5c0 1.1.9 2 2 2h.5" />
          <path d="M12 11.75v4.25" />
          <path d="M9 20.25h6" />
          <path d="M8 4.75H5.75a1.75 1.75 0 0 0 0 3.5H8" />
          <path d="M16 4.75h2.25a1.75 1.75 0 1 1 0 3.5H16" />
          <path d="M10 16h4" />
        </>
      );
    case 'users':
      return (
        <>
          <circle cx="9" cy="9" r="2.5" />
          <circle cx="15.5" cy="9.75" r="2.1" />
          <path d="M4.75 18.25c0-2.35 1.9-4.25 4.25-4.25h1.25c2.35 0 4.25 1.9 4.25 4.25" />
          <path d="M13.6 18.25c0-1.85 1.5-3.35 3.35-3.35h.1c1.85 0 3.35 1.5 3.35 3.35" />
        </>
      );
    default:
      return null;
  }
}
