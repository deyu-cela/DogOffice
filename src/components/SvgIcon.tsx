export type SvgIconName =
  | 'appDog'
  | 'chart'
  | 'money'
  | 'gem'
  | 'office'
  | 'trophy'
  | 'save'
  | 'restart'
  | 'people'
  | 'shop'
  | 'briefcase'
  | 'training'
  | 'coffee'
  | 'log'
  | 'tech'
  | 'design'
  | 'marketing'
  | 'service'
  | 'heart'
  | 'speed'
  | 'quality'
  | 'teamwork'
  | 'warning'
  | 'target'
  | 'wand'
  | 'growth';

type Props = {
  name: SvgIconName;
  size?: number;
  className?: string;
};

const BLUE = '#1d5fb8';
const LIGHT_BLUE = '#4f95ef';
const GOLD = '#ffd96a';
const ORANGE = '#f6a63a';
const TEAL = '#20c7b3';
const RED = '#ef5b5b';
const PURPLE = '#7b61ff';

export function SvgIcon({ name, size = 24, className }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    'aria-hidden': true,
    className,
  } as const;

  switch (name) {
    case 'appDog':
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="11" fill="#f7fbff" stroke={BLUE} strokeWidth="2" />
          <path d="M10 11 7 8M22 11l3-3" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="12.5" cy="15" r="1.5" fill={BLUE} />
          <circle cx="19.5" cy="15" r="1.5" fill={BLUE} />
          <path d="M16 17.5v2M12.5 21c1.8 2 5.2 2 7 0" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M14.5 18h3L16 19.5Z" fill={ORANGE} />
        </svg>
      );
    case 'chart':
      return (
        <svg {...common}>
          <path d="M7 24h18" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M9 21V12M16 21V8M23 21v-6" stroke={LIGHT_BLUE} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M8 13l8-6 7 5" fill="none" stroke={BLUE} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 8v5h-5" fill="none" stroke={BLUE} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'money':
      return (
        <svg {...common}>
          <rect x="5" y="9" width="22" height="14" rx="2.5" fill={GOLD} stroke={BLUE} strokeWidth="2" transform="rotate(-16 16 16)" />
          <circle cx="16" cy="16" r="3.2" fill="#fff7c7" stroke={ORANGE} strokeWidth="1.4" />
          <path d="M8.5 15.5h2M21.5 16.5h2" stroke={BLUE} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'office':
      return (
        <svg {...common}>
          <path d="M8 25V8h11v17M19 13h5v12" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" />
          <path d="M11 12h2M15 12h2M11 16h2M15 16h2M11 20h2M15 20h2M22 17h1" stroke={LIGHT_BLUE} strokeWidth="2" strokeLinecap="round" />
          <path d="M6 25h20" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...common}>
          <path d="M10 6h12v5.4c0 4.4-2.4 7.2-6 7.2s-6-2.8-6-7.2V6Z" fill={GOLD} stroke={BLUE} strokeWidth="2" strokeLinejoin="round" />
          <path d="M10 8H7c-.7 0-1.2.5-1.2 1.2 0 3.3 1.8 5.5 4.4 6M22 8h3c.7 0 1.2.5 1.2 1.2 0 3.3-1.8 5.5-4.4 6" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
          <path d="M16 18.5v4M12 26h8M13.5 22.5h5" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'save':
      return (
        <svg {...common}>
          <path d="M7 5h15l3 3v19H7V5Z" fill={LIGHT_BLUE} stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M11 5h9v8h-9V5Z" fill="#f7fbff" />
          <path d="M13 20h6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M10 18h12v9H10v-9Z" fill="#fff" opacity="0.18" />
        </svg>
      );
    case 'restart':
      return (
        <svg {...common}>
          <path d="M23.8 9.2A10 10 0 1 0 25 20.5" fill="none" stroke={LIGHT_BLUE} strokeWidth="3" strokeLinecap="round" />
          <path d="M23.4 5.8v6.4H17" fill="none" stroke={BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="3.2" fill={GOLD} stroke={BLUE} strokeWidth="1.4" />
        </svg>
      );
    case 'people':
      return (
        <svg {...common}><circle cx="12" cy="12" r="4" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" /><circle cx="21" cy="13" r="3" fill="#eaf4ff" stroke={LIGHT_BLUE} strokeWidth="2" /><path d="M5 25c1-5 5-8 9-8s8 3 9 8" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" /></svg>
      );
    case 'shop':
      return (
        <svg {...common}><path d="M8 14h16l-2 12H10L8 14Z" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" /><path d="M11 14c0-4 2-7 5-7s5 3 5 7" fill="none" stroke={LIGHT_BLUE} strokeWidth="2.2" strokeLinecap="round" /><path d="M12 19h8" stroke={BLUE} strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'briefcase':
      return (
        <svg {...common}><rect x="6" y="11" width="20" height="14" rx="2.5" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" /><path d="M12 11V8h8v3M6 16h20M14 17h4" stroke={LIGHT_BLUE} strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'training':
      return (
        <svg {...common}><path d="M5 11 16 6l11 5-11 5L5 11Z" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" /><path d="M10 15v5c3 3 9 3 12 0v-5" fill="none" stroke={LIGHT_BLUE} strokeWidth="2" strokeLinecap="round" /><path d="M25 12v7" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'coffee':
      return (
        <svg {...common}><path d="M9 11h12v7a6 6 0 0 1-12 0v-7Z" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" /><path d="M21 13h2.5a2.5 2.5 0 0 1 0 5H21" fill="none" stroke={LIGHT_BLUE} strokeWidth="2" /><path d="M10 25h12M12 7v1M16 6v2M20 7v1" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'log':
      return (
        <svg {...common}><rect x="8" y="5" width="16" height="22" rx="2" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" /><path d="M12 11h8M12 16h8M12 21h5" stroke={LIGHT_BLUE} strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'tech':
      return (
        <svg {...common}><rect x="6" y="8" width="20" height="14" rx="2" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" /><path d="m14 13-3 3 3 3M18 13l3 3-3 3M11 25h10" stroke={LIGHT_BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      );
    case 'design':
      return (
        <svg {...common}><circle cx="16" cy="16" r="9" fill="#fff7c7" stroke={BLUE} strokeWidth="2" /><circle cx="12" cy="13" r="2" fill={RED} /><circle cx="18" cy="12" r="2" fill={LIGHT_BLUE} /><circle cx="20" cy="18" r="2" fill={TEAL} /><path d="M13 21h4" stroke={BLUE} strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'marketing':
      return (
        <svg {...common}><path d="M7 17h4l12-6v14l-12-5H7v-3Z" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" /><path d="M11 20v5" stroke={LIGHT_BLUE} strokeWidth="2" strokeLinecap="round" /><path d="M25 13l2-2M26 18h3M25 23l2 2" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'service':
      return (
        <svg {...common}><path d="M8 10h16v10H13l-5 5V10Z" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" /><path d="M12 14h8M12 17h5" stroke={LIGHT_BLUE} strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'heart':
      return (
        <svg {...common}><path d="M16 26S6 20 6 12.5C6 9 8.4 7 11.2 7c2 0 3.6 1 4.8 2.7C17.2 8 18.8 7 20.8 7 23.6 7 26 9 26 12.5 26 20 16 26 16 26Z" fill="#ff8fa3" stroke={BLUE} strokeWidth="2" /></svg>
      );
    case 'speed':
      return (
        <svg {...common}><path d="M16 6 9 18h6l-2 8 10-14h-6l2-6Z" fill={TEAL} stroke={BLUE} strokeWidth="2" strokeLinejoin="round" /></svg>
      );
    case 'quality':
      return (
        <svg {...common}><path d="M16 5 27 11v10l-11 6-11-6V11L16 5Z" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" /><path d="m11 16 3 3 7-7" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      );
    case 'teamwork':
      return (
        <svg {...common}><circle cx="11" cy="13" r="3" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" /><circle cx="21" cy="13" r="3" fill="#eaf4ff" stroke={LIGHT_BLUE} strokeWidth="2" /><path d="M6 24c.8-4 3.6-6 7-6M26 24c-.8-4-3.6-6-7-6" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" /></svg>
      );
    case 'warning':
      return (
        <svg {...common}><path d="M16 5 28 26H4L16 5Z" fill="#fff7c7" stroke={ORANGE} strokeWidth="2" strokeLinejoin="round" /><path d="M16 12v7M16 23v.2" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" /></svg>
      );
    case 'target':
      return (
        <svg {...common}><circle cx="16" cy="16" r="10" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" /><circle cx="16" cy="16" r="5" fill="#fff" stroke={LIGHT_BLUE} strokeWidth="2" /><circle cx="16" cy="16" r="2" fill={RED} /></svg>
      );
    case 'wand':
      return (
        <svg {...common}>
          <path d="M8 26 22 12" stroke={PURPLE} strokeWidth="3" strokeLinecap="round" />
          <path d="M20 10l2-2 2 2-2 2-2-2Z" fill={PURPLE} stroke={BLUE} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M25 5v3M25 11v3M22 8h3M27 8h3" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
          <circle cx="13" cy="20" r="1.4" fill={GOLD} />
          <circle cx="9" cy="14" r="1.2" fill={GOLD} />
        </svg>
      );
    case 'growth':
      return (
        <svg {...common}>
          <path d="M6 25h20" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" />
          <rect x="8" y="18" width="4" height="6" rx="1" fill="#eaf4ff" stroke={BLUE} strokeWidth="1.8" />
          <rect x="14" y="14" width="4" height="10" rx="1" fill={LIGHT_BLUE} stroke={BLUE} strokeWidth="1.8" />
          <rect x="20" y="9" width="4" height="15" rx="1" fill={TEAL} stroke={BLUE} strokeWidth="1.8" />
          <path d="M7 12l6-5 4 3 7-6" fill="none" stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 4h5v5" fill="none" stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'gem':
    default:
      return (
        <svg {...common}><path d="M9 7h14l4 6-11 13L5 13l4-6Z" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" /><path d="M9 7 16 26 23 7M5 13h22" fill="none" stroke={LIGHT_BLUE} strokeWidth="1.8" strokeLinejoin="round" /></svg>
      );
  }
}
