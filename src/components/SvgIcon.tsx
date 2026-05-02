export type SvgIconName =
  | 'appDog'
  | 'chart'
  | 'money'
  | 'gem'
  | 'office'
  | 'trophy'
  | 'save'
  | 'account'
  | 'lock'
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
  | 'calendar'
  | 'hourglass'
  | 'play'
  | 'growth'
  | 'shopSnack'
  | 'shopToy'
  | 'shopDesk'
  | 'shopPolicy'
  | 'shopLamp'
  | 'shopSofa'
  | 'shopArtwall'
  | 'shopCoffee'
  | 'shopGym'
  | 'tool'
  | 'gallery'
  | 'toolKeyboard'
  | 'toolMonitor'
  | 'toolGpu'
  | 'toolTablet'
  | 'toolColor'
  | 'toolBrush'
  | 'toolBible'
  | 'toolDashboard'
  | 'toolLight'
  | 'toolManual'
  | 'toolHeadset'
  | 'toolMirror';

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
    case 'account':
      return (
        <svg {...common}>
          <rect x="5.5" y="8" width="21" height="16" rx="3" fill="#f7fbff" stroke={BLUE} strokeWidth="2" />
          <path d="m7.5 11 8.5 6 8.5-6" fill="none" stroke={LIGHT_BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m8 22 6.2-5M24 22l-6.2-5" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="7" y="13" width="18" height="13" rx="3" fill="#f7fbff" stroke={BLUE} strokeWidth="2" />
          <path d="M11 13v-2.2C11 7.6 13.1 5.5 16 5.5s5 2.1 5 5.3V13" fill="none" stroke={LIGHT_BLUE} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="16" cy="19" r="2" fill={ORANGE} />
          <path d="M16 20.8v2.4" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" />
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
    case 'tool':
      // 扳手 + 螺絲起子交叉，象徵裝備工具槽
      return (
        <svg {...common}>
          <path d="M21.5 4.5a4.5 4.5 0 0 0-5.6 5.6l-9 9a2.2 2.2 0 1 0 3.1 3.1l9-9a4.5 4.5 0 0 0 5.6-5.6l-2.7 2.7-2.4-.3-.3-2.4 2.3-2.3Z" fill="#eaf4ff" stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M22 22l-6-6" stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" />
          <rect x="20.5" y="20" width="6" height="3" rx="1" transform="rotate(45 23.5 21.5)" fill={GOLD} stroke={BLUE} strokeWidth="1.5" />
          <circle cx="9" cy="22" r="1.4" fill={BLUE} />
        </svg>
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
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="6" y="8" width="20" height="18" rx="3" fill="none" stroke={BLUE} strokeWidth="2.2" />
          <path d="M6 13h20M11 6v5M21 6v5" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="11.5" cy="17.5" r="1.4" fill={ORANGE} />
          <circle cx="16" cy="17.5" r="1.4" fill={ORANGE} />
          <circle cx="20.5" cy="17.5" r="1.4" fill={ORANGE} />
          <circle cx="11.5" cy="22" r="1.4" fill={ORANGE} />
          <circle cx="16" cy="22" r="1.4" fill={ORANGE} />
        </svg>
      );
    case 'hourglass':
      return (
        <svg {...common}>
          <path d="M10 6h12M10 26h12" stroke={BLUE} strokeWidth="2.3" strokeLinecap="round" />
          <path d="M12 8c0 5 4 5.8 4 8s-4 3-4 8h8c0-5-4-5.8-4-8s4-3 4-8h-8Z" fill="none" stroke={BLUE} strokeWidth="2.1" strokeLinejoin="round" />
          <path d="M14 10h4c-.2 2-1.2 3-2 3.8-.8-.8-1.8-1.8-2-3.8ZM14 22c.25-1.9 1.3-2.8 2-3.6.7.8 1.75 1.7 2 3.6h-4Z" fill={ORANGE} />
        </svg>
      );
    case 'play':
      return (
        <svg {...common}>
          <path d="M11 8.5v15l13-7.5-13-7.5Z" fill={BLUE} stroke={BLUE} strokeWidth="2" strokeLinejoin="round" />
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
    case 'shopSnack':
      return (
        <svg {...common}>
          <ellipse cx="16" cy="20" rx="10" ry="6" fill="#fff1d9" stroke={ORANGE} strokeWidth="2" />
          <path d="M9 11c-2 0-3 1.4-3 3 0 1.6 1.4 2.6 2.5 2.6 0 1.2 1.2 2.4 2.6 2.4 1.4 0 2.4-1 2.4-2.4 1.2 0 2.5-1 2.5-2.6 0-1.6-1-3-3-3-1 0-1.6.6-2 1-.4-.4-1-1-2-1Z" fill="#fff" stroke={ORANGE} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="20" cy="22" r="0.9" fill={ORANGE} />
          <circle cx="14" cy="23" r="0.8" fill={ORANGE} />
          <circle cx="22" cy="20" r="0.7" fill={GOLD} />
        </svg>
      );
    case 'shopToy':
      return (
        <svg {...common}>
          <circle cx="12" cy="20" r="7" fill="#ffd6e0" stroke={RED} strokeWidth="1.8" />
          <path d="M5 20h14M12 13v14" stroke={RED} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M22 9l3-2 2 3-2 3-2 1-2-2 1-3Z" fill={GOLD} stroke={ORANGE} strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="24" cy="11" r="1.2" fill="#fff" />
        </svg>
      );
    case 'shopDesk':
      return (
        <svg {...common}>
          <rect x="6" y="14" width="20" height="3" rx="1" fill={BLUE} />
          <path d="M8 17v9M24 17v9" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
          <rect x="11" y="6" width="11" height="8" rx="1.5" fill="#eaf4ff" stroke={BLUE} strokeWidth="1.8" />
          <rect x="13" y="8" width="7" height="4" fill={LIGHT_BLUE} />
          <path d="M15 14v-1M18 14v-1" stroke={BLUE} strokeWidth="1.4" />
        </svg>
      );
    case 'shopPolicy':
      return (
        <svg {...common}>
          <path d="M9 5h11l4 4v18H9V5Z" fill="#fff" stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M20 5v4h4" fill="none" stroke={BLUE} strokeWidth="1.6" />
          <path d="M12 14h8M12 18h8M12 22h5" stroke={LIGHT_BLUE} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M19 22l2 2 4-4" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'shopLamp':
      return (
        <svg {...common}>
          <path d="M16 4v4" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9 14l7-7 7 7-3 4H12l-3-4Z" fill={GOLD} stroke={ORANGE} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 18h4v3a2 2 0 0 1-4 0v-3Z" fill="#fff" stroke={ORANGE} strokeWidth="1.6" />
          <path d="M5 20l3-2M27 20l-3-2M16 26v3" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'shopSofa':
      return (
        <svg {...common}>
          <rect x="4" y="14" width="24" height="10" rx="3" fill="#d9c8ff" stroke={PURPLE} strokeWidth="1.8" />
          <rect x="6" y="11" width="6" height="8" rx="2" fill="#fff" stroke={PURPLE} strokeWidth="1.6" />
          <rect x="20" y="11" width="6" height="8" rx="2" fill="#fff" stroke={PURPLE} strokeWidth="1.6" />
          <path d="M6 24v3M26 24v3" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" />
          <path d="M20 7l3-3M22 9l4-1" stroke={PURPLE} strokeWidth="1.6" strokeLinecap="round" />
          <text x="22" y="9" fontSize="6" fontWeight="bold" fill={PURPLE}>z</text>
        </svg>
      );
    case 'shopArtwall':
      return (
        <svg {...common}>
          <rect x="5" y="6" width="22" height="20" rx="1.5" fill="#fff" stroke={BLUE} strokeWidth="2" />
          <rect x="8" y="9" width="16" height="14" fill="#eaf4ff" stroke={LIGHT_BLUE} strokeWidth="1.4" />
          <circle cx="13" cy="14" r="2" fill={GOLD} />
          <path d="M9 22l5-6 4 4 3-3 4 5" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'shopCoffee':
      return (
        <svg {...common}>
          <path d="M7 12h16v9a5 5 0 0 1-5 5h-6a5 5 0 0 1-5-5v-9Z" fill="#fff" stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M23 14h3a3 3 0 0 1 0 6h-3" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M11 5c0 2 2 2 2 4M16 4c0 2 2 2 2 4" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'shopGym':
      return (
        <svg {...common}>
          <rect x="3" y="13" width="3" height="6" rx="1" fill={BLUE} />
          <rect x="6" y="11" width="3" height="10" rx="1" fill={BLUE} />
          <rect x="9" y="15" width="14" height="2" rx="1" fill={LIGHT_BLUE} />
          <rect x="23" y="11" width="3" height="10" rx="1" fill={BLUE} />
          <rect x="26" y="13" width="3" height="6" rx="1" fill={BLUE} />
        </svg>
      );
    case 'gallery':
      return (
        <svg {...common}>
          <rect x="4" y="6" width="24" height="20" rx="2" fill="#f5e6c8" stroke={BLUE} strokeWidth="2" />
          <rect x="6.5" y="8.5" width="19" height="15" fill="#eaf4ff" stroke={LIGHT_BLUE} strokeWidth="1.4" />
          <circle cx="11" cy="13" r="2.2" fill={GOLD} />
          <path d="M7 22l5-6 4 3.5 3.5-2.5L25 22" fill={TEAL} stroke={BLUE} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M4 26h24" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'toolKeyboard':
      return (
        <svg {...common}>
          <rect x="3.5" y="9" width="25" height="14" rx="2.2" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" />
          <rect x="6" y="11.5" width="3" height="2.4" rx="0.4" fill={LIGHT_BLUE} />
          <rect x="10" y="11.5" width="3" height="2.4" rx="0.4" fill={LIGHT_BLUE} />
          <rect x="14" y="11.5" width="3" height="2.4" rx="0.4" fill={LIGHT_BLUE} />
          <rect x="18" y="11.5" width="3" height="2.4" rx="0.4" fill={LIGHT_BLUE} />
          <rect x="22" y="11.5" width="3" height="2.4" rx="0.4" fill={LIGHT_BLUE} />
          <rect x="6" y="15" width="3" height="2.4" rx="0.4" fill={LIGHT_BLUE} />
          <rect x="10" y="15" width="3" height="2.4" rx="0.4" fill={ORANGE} />
          <rect x="14" y="15" width="3" height="2.4" rx="0.4" fill={LIGHT_BLUE} />
          <rect x="18" y="15" width="3" height="2.4" rx="0.4" fill={LIGHT_BLUE} />
          <rect x="22" y="15" width="3" height="2.4" rx="0.4" fill={LIGHT_BLUE} />
          <rect x="9" y="18.6" width="14" height="2.4" rx="0.6" fill={LIGHT_BLUE} />
        </svg>
      );
    case 'toolMonitor':
      return (
        <svg {...common}>
          <rect x="2" y="6" width="13" height="10" rx="1.4" fill="#eaf4ff" stroke={BLUE} strokeWidth="1.8" />
          <rect x="17" y="6" width="13" height="10" rx="1.4" fill="#eaf4ff" stroke={BLUE} strokeWidth="1.8" />
          <rect x="3.5" y="7.5" width="10" height="7" fill={LIGHT_BLUE} opacity="0.55" />
          <rect x="18.5" y="7.5" width="10" height="7" fill={TEAL} opacity="0.55" />
          <path d="M7.5 16v3M22.5 16v3M5 21h6M19 21h6" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M14.5 11.5h2.5" stroke={ORANGE} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'toolGpu':
      return (
        <svg {...common}>
          <rect x="3" y="10" width="26" height="12" rx="1.4" fill="#1f2c44" stroke={BLUE} strokeWidth="1.8" />
          <circle cx="10" cy="16" r="3.2" fill="#0f1828" stroke={LIGHT_BLUE} strokeWidth="1.4" />
          <path d="M10 13.2v5.6M7.2 16h5.6M8.2 13.8l3.6 4.4M8.2 18.2l3.6-4.4" stroke={LIGHT_BLUE} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="20" cy="16" r="3.2" fill="#0f1828" stroke={ORANGE} strokeWidth="1.4" />
          <path d="M20 13.2v5.6M17.2 16h5.6M18.2 13.8l3.6 4.4M18.2 18.2l3.6-4.4" stroke={ORANGE} strokeWidth="1.2" strokeLinecap="round" />
          <rect x="24" y="13" width="4" height="6" fill={GOLD} stroke={BLUE} strokeWidth="1.2" />
          <path d="M5 22v3M9 22v3M16 22v3M23 22v3M27 22v3" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'toolTablet':
      return (
        <svg {...common}>
          <rect x="4" y="7" width="20" height="18" rx="2" fill="#fff" stroke={BLUE} strokeWidth="2" />
          <rect x="6.5" y="9.5" width="15" height="13" rx="1" fill="#eaf4ff" stroke={LIGHT_BLUE} strokeWidth="1.2" />
          <circle cx="9.5" cy="20" r="0.9" fill={ORANGE} />
          <path d="M22 6l5.5 5.5-9 9-3 .5.5-3 6-12Z" fill={GOLD} stroke={BLUE} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M19.5 8.5l5.5 5.5" stroke={BLUE} strokeWidth="1.4" />
          <path d="M16 19.5l3 3" stroke={ORANGE} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'toolColor':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="26" height="16" rx="2" fill="#fff" stroke={BLUE} strokeWidth="2" />
          <rect x="5" y="8" width="22" height="12" fill="#0b1530" />
          <rect x="6" y="9" width="3.5" height="10" fill="#ef5b5b" />
          <rect x="9.5" y="9" width="3.5" height="10" fill={ORANGE} />
          <rect x="13" y="9" width="3.5" height="10" fill={GOLD} />
          <rect x="16.5" y="9" width="3.5" height="10" fill={TEAL} />
          <rect x="20" y="9" width="3.5" height="10" fill={LIGHT_BLUE} />
          <rect x="23.5" y="9" width="2.5" height="10" fill={PURPLE} />
          <path d="M11 22v3M21 22v3M9 26h14" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'toolBrush':
      return (
        <svg {...common}>
          <path d="M22 4l5.5 5.5-13 13-5.5-5.5L22 4Z" fill={GOLD} stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 17l5.5 5.5-3 3a3.9 3.9 0 1 1-5.5-5.5l3-3Z" fill="#fff" stroke={BLUE} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M11 22.5l1.6 1.6" stroke={BLUE} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="6.5" cy="25.5" r="1.4" fill={ORANGE} />
          <circle cx="3.5" cy="22.5" r="1.1" fill={TEAL} />
          <circle cx="4.5" cy="27" r="0.9" fill={PURPLE} />
        </svg>
      );
    case 'toolBible':
      return (
        <svg {...common}>
          <path d="M4 7c4-1.6 8-1.6 12 0v18c-4-1.6-8-1.6-12 0V7Z" fill="#fff" stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M28 7c-4-1.6-8-1.6-12 0v18c4-1.6 8-1.6 12 0V7Z" fill="#fff" stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M16 7v18" stroke={BLUE} strokeWidth="1.4" />
          <path d="M16 12.5l-1.5-2-1.5 1 2.4 2.6L16 12.5ZM16 12.5l1.5-2 1.5 1-2.4 2.6L16 12.5Z" fill={GOLD} stroke={ORANGE} strokeWidth="0.8" strokeLinejoin="round" />
          <path d="M7 12h6M7 16h6M19 12h6M19 16h6" stroke={LIGHT_BLUE} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'toolDashboard':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="26" height="18" rx="2" fill="#fff" stroke={BLUE} strokeWidth="2" />
          <rect x="5" y="8" width="22" height="14" fill="#0b1530" />
          <rect x="7" y="16" width="3" height="4" fill={LIGHT_BLUE} />
          <rect x="11" y="13" width="3" height="7" fill={TEAL} />
          <rect x="15" y="10" width="3" height="10" fill={GOLD} />
          <rect x="19" y="14" width="3" height="6" fill={ORANGE} />
          <rect x="23" y="11" width="3" height="9" fill="#ef5b5b" />
          <path d="M7 13l4-4 4 2 4-3 5 4" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 24v3M21 24v3M9 28h14" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'toolLight':
      return (
        <svg {...common}>
          <circle cx="16" cy="14" r="9" fill="none" stroke={BLUE} strokeWidth="2" />
          <circle cx="16" cy="14" r="6" fill={GOLD} stroke={ORANGE} strokeWidth="1.4" />
          <circle cx="16" cy="14" r="2.4" fill="#fff" />
          <path d="M3 14h2M27 14h2M16 1v2M16 25v2M6 4l1.5 1.5M24.5 5.5L26 4M6 24l1.5-1.5M24.5 22.5L26 24" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" />
          <rect x="14.5" y="22" width="3" height="6" fill={BLUE} />
          <path d="M11 28h10" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'toolManual':
      return (
        <svg {...common}>
          <path d="M7 5h16a2 2 0 0 1 2 2v20l-4-3-3 3-3-3-3 3-3-3-4 3V7a2 2 0 0 1 2-2Z" fill="#ef5b5b" stroke={BLUE} strokeWidth="1.8" strokeLinejoin="round" />
          <rect x="10" y="9" width="12" height="2.4" fill="#fff" opacity="0.85" />
          <rect x="10" y="13" width="12" height="1.6" fill="#fff" opacity="0.6" />
          <rect x="10" y="16" width="9" height="1.6" fill="#fff" opacity="0.6" />
          <path d="M21 13.5l1.4 1.4 2.6-2.6" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'toolHeadset':
      return (
        <svg {...common}>
          <path d="M5 18C5 11 9 6 16 6s11 5 11 12" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" />
          <rect x="3.5" y="16" width="6" height="9" rx="1.6" fill={LIGHT_BLUE} stroke={BLUE} strokeWidth="1.6" />
          <rect x="22.5" y="16" width="6" height="9" rx="1.6" fill={LIGHT_BLUE} stroke={BLUE} strokeWidth="1.6" />
          <path d="M25.5 25v2a2 2 0 0 1-2 2h-3" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="20" cy="29" r="1.4" fill={ORANGE} />
        </svg>
      );
    case 'toolMirror':
      return (
        <svg {...common}>
          <ellipse cx="16" cy="13" rx="8" ry="9" fill="#fff" stroke={BLUE} strokeWidth="2" />
          <ellipse cx="16" cy="13" rx="5.5" ry="6.5" fill="#eaf4ff" stroke={LIGHT_BLUE} strokeWidth="1.2" />
          <path d="M12 9c1-1.6 2.6-2.4 4.5-2.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <rect x="14.5" y="22" width="3" height="7" rx="1" fill={GOLD} stroke={BLUE} strokeWidth="1.4" />
          <ellipse cx="16" cy="29.5" rx="4" ry="1.2" fill={GOLD} stroke={BLUE} strokeWidth="1.4" />
        </svg>
      );
    case 'gem':
    default:
      return (
        <svg {...common}><path d="M9 7h14l4 6-11 13L5 13l4-6Z" fill="#eaf4ff" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" /><path d="M9 7 16 26 23 7M5 13h22" fill="none" stroke={LIGHT_BLUE} strokeWidth="1.8" strokeLinejoin="round" /></svg>
      );
  }
}