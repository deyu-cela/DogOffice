type Props = {
  role: string;
  breed?: string;
  size?: number;
  className?: string;
};

type Variant = {
  fur: string;
  ear: string;
  muzzle: string;
  accent: string;
  earShape: 'pointy' | 'floppy' | 'round';
};

const VARIANTS: Record<string, Variant> = {
  工程師: { fur: '#f3f7ff', ear: '#2b4f85', muzzle: '#ffffff', accent: '#20c7b3', earShape: 'pointy' },
  QA: { fur: '#d9d9d9', ear: '#4a5568', muzzle: '#ffffff', accent: '#2f8df4', earShape: 'floppy' },
  美術: { fur: '#ffd66d', ear: '#e8a936', muzzle: '#fff7de', accent: '#ff6b8a', earShape: 'floppy' },
  企劃: { fur: '#f5a24a', ear: '#b95721', muzzle: '#fff0d8', accent: '#ffd96a', earShape: 'pointy' },
  業務: { fur: '#f7f0dc', ear: '#8a5a2f', muzzle: '#ffffff', accent: '#35c59c', earShape: 'floppy' },
  行銷: { fur: '#e88a3d', ear: '#9c4f24', muzzle: '#fff2de', accent: '#7b61ff', earShape: 'pointy' },
  客服: { fur: '#f8f8ff', ear: '#d5e2ff', muzzle: '#ffffff', accent: '#2f8df4', earShape: 'round' },
  PM: { fur: '#f4e6d1', ear: '#9b6a3f', muzzle: '#ffffff', accent: '#1d5fb8', earShape: 'floppy' },
  CEO: { fur: '#d9a85f', ear: '#7b4a24', muzzle: '#fff4df', accent: '#ffd96a', earShape: 'round' },
};

const DEFAULT_VARIANT: Variant = {
  fur: '#f3f7ff',
  ear: '#4f95ef',
  muzzle: '#ffffff',
  accent: '#20c7b3',
  earShape: 'pointy',
};

export function DogAvatar({ role, breed, size = 64, className }: Props) {
  const v = VARIANTS[role] ?? DEFAULT_VARIANT;
  const title = breed ? `${breed} ${role}` : role;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={`dog-bg-${role}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eaf4ff" />
        </linearGradient>
        <filter id={`dog-shadow-${role}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#2e68b4" floodOpacity="0.18" />
        </filter>
      </defs>

      <circle cx="48" cy="48" r="43" fill={`url(#dog-bg-${role})`} stroke="#cfe0f8" strokeWidth="2" />
      <g filter={`url(#dog-shadow-${role})`}>
        <Body variant={v} />
        <Ears variant={v} />
        <Face variant={v} />
        <Accessory role={role} accent={v.accent} />
      </g>
    </svg>
  );
}

function Body({ variant }: { variant: Variant }) {
  return (
    <>
      <ellipse cx="48" cy="64" rx="24" ry="20" fill={variant.fur} stroke="#1d5fb8" strokeWidth="2" />
      <path d="M32 72c7 8 25 9 33 0" fill="none" stroke="#1d5fb8" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
    </>
  );
}

function Ears({ variant }: { variant: Variant }) {
  if (variant.earShape === 'floppy') {
    return (
      <>
        <path d="M29 33c-13 8-12 29 0 34 9-7 10-25 5-34Z" fill={variant.ear} stroke="#1d5fb8" strokeWidth="2" />
        <path d="M67 33c13 8 12 29 0 34-9-7-10-25-5-34Z" fill={variant.ear} stroke="#1d5fb8" strokeWidth="2" />
      </>
    );
  }

  if (variant.earShape === 'round') {
    return (
      <>
        <circle cx="30" cy="35" r="11" fill={variant.ear} stroke="#1d5fb8" strokeWidth="2" />
        <circle cx="66" cy="35" r="11" fill={variant.ear} stroke="#1d5fb8" strokeWidth="2" />
      </>
    );
  }

  return (
    <>
      <path d="M32 36 23 15l22 12Z" fill={variant.ear} stroke="#1d5fb8" strokeWidth="2" strokeLinejoin="round" />
      <path d="M64 36 73 15 51 27Z" fill={variant.ear} stroke="#1d5fb8" strokeWidth="2" strokeLinejoin="round" />
    </>
  );
}

function Face({ variant }: { variant: Variant }) {
  return (
    <>
      <circle cx="48" cy="43" r="27" fill={variant.fur} stroke="#1d5fb8" strokeWidth="2.2" />
      <ellipse cx="48" cy="55" rx="14" ry="10" fill={variant.muzzle} stroke="#d5e2ff" strokeWidth="1.4" />
      <circle cx="38.5" cy="45" r="3" fill="#173b78" />
      <circle cx="57.5" cy="45" r="3" fill="#173b78" />
      <path d="M45 53h6l-3 3Z" fill="#173b78" />
      <path d="M48 56v4M40 62c4 4 12 4 16 0" fill="none" stroke="#173b78" strokeWidth="2" strokeLinecap="round" />
      <circle cx="31" cy="52" r="3.2" fill="#ffadc0" opacity="0.65" />
      <circle cx="65" cy="52" r="3.2" fill="#ffadc0" opacity="0.65" />
    </>
  );
}

function Accessory({ role, accent }: { role: string; accent: string }) {
  switch (role) {
    case '工程師':
      return (
        <>
          <circle cx="38.5" cy="45" r="7" fill="none" stroke={accent} strokeWidth="2.2" />
          <circle cx="57.5" cy="45" r="7" fill="none" stroke={accent} strokeWidth="2.2" />
          <path d="M45.5 45h5" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M35 29h26" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case 'QA':
      return (
        <>
          <circle cx="64" cy="67" r="7" fill="none" stroke={accent} strokeWidth="3" />
          <path d="m69 72 7 7" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case '美術':
      return (
        <>
          <path d="M34 28c8-10 25-8 31 2-8 4-22 5-31-2Z" fill={accent} stroke="#1d5fb8" strokeWidth="2" />
          <circle cx="57" cy="24" r="3" fill="#ffd96a" />
        </>
      );
    case '企劃':
      return (
        <>
          <path d="M69 22c5 3 6 10 1 14-2 2-2 3-2 5h-7c0-5 1-7 4-9 3-2 2-5-1-7Z" fill={accent} stroke="#1d5fb8" strokeWidth="2" />
          <path d="M61 45h8" stroke="#1d5fb8" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case '業務':
      return (
        <>
          <path d="M48 69 41 83h14Z" fill={accent} stroke="#1d5fb8" strokeWidth="2" />
          <path d="M43 69h10l-5 6Z" fill="#ffffff" stroke="#1d5fb8" strokeWidth="1.5" />
        </>
      );
    case '行銷':
      return (
        <>
          <path d="M65 58h9l8-4v15l-8-4h-9Z" fill={accent} stroke="#1d5fb8" strokeWidth="2" strokeLinejoin="round" />
          <path d="M73 65v8" stroke="#1d5fb8" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case '客服':
      return (
        <>
          <path d="M27 47c0-13 9-23 21-23s21 10 21 23" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <rect x="21" y="45" width="8" height="14" rx="4" fill={accent} />
          <rect x="67" y="45" width="8" height="14" rx="4" fill={accent} />
          <path d="M68 61c-3 6-8 9-15 9" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    case 'PM':
      return (
        <>
          <rect x="61" y="61" width="18" height="22" rx="3" fill="#ffffff" stroke="#1d5fb8" strokeWidth="2" />
          <path d="M65 68h9M65 73h7" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <path d="M67 58h6" stroke="#1d5fb8" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case 'CEO':
      return (
        <>
          <path d="M32 26 40 13l8 12 8-12 8 13v8H32Z" fill={accent} stroke="#1d5fb8" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="40" cy="14" r="2.5" fill="#ffffff" />
          <circle cx="56" cy="14" r="2.5" fill="#ffffff" />
        </>
      );
    default:
      return null;
  }
}
