import { useEffect, useMemo, type CSSProperties, type ReactNode } from 'react';
import { useUiStore } from '@/store/uiStore';
import { shade } from '@/lib/utils';

const PAW = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
    <ellipse cx="12" cy="15" rx="5" ry="4.2" />
    <ellipse cx="5.5" cy="10" rx="2.2" ry="2.8" />
    <ellipse cx="18.5" cy="10" rx="2.2" ry="2.8" />
    <ellipse cx="8.5" cy="5.2" rx="1.9" ry="2.4" />
    <ellipse cx="15.5" cy="5.2" rx="1.9" ry="2.4" />
  </svg>
);

const HEART = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
    <path d="M12 21s-7.5-4.6-9.6-9.4C1 8.2 3 4.5 6.5 4.5c2 0 3.6 1 5.5 3 1.9-2 3.5-3 5.5-3 3.5 0 5.5 3.7 4.1 7.1C19.5 16.4 12 21 12 21z" />
  </svg>
);

const SPARK = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
    <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
  </svg>
);

function Icon({ size, color, children }: { size: number; color?: string; children: ReactNode }) {
  return (
    <span style={{ width: size, height: size, color, display: 'inline-block' }}>{children}</span>
  );
}

function Tape({
  color = '#f7b8cf',
  angle = -8,
  w = 86,
  h = 22,
  style = {},
}: {
  color?: string;
  angle?: number;
  w?: number;
  h?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        width: w,
        height: h,
        background: color,
        transform: `rotate(${angle}deg)`,
        boxShadow: '0 2px 4px rgba(184,108,140,0.18)',
        backgroundImage:
          'repeating-linear-gradient(135deg, transparent 0 8px, rgba(255,255,255,0.35) 8px 10px)',
        ...style,
      }}
    />
  );
}

function Pin({
  color = '#ef6f8f',
  size = 14,
  style = {},
}: {
  color?: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <div style={{ position: 'absolute', width: size, height: size, ...style }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, #fff 0 12%, ${color} 18% 70%, ${shade(color, -22)} 72% 100%)`,
          boxShadow: '0 2px 3px rgba(120,60,80,0.35)',
        }}
      />
    </div>
  );
}

function PawScatter({ count = 14, opacity = 0.06 }: { count?: number; opacity?: number }) {
  const items = useMemo(() => {
    const arr: { left: number; top: number; size: number; rot: number; color: string }[] = [];
    let seed = 23;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const palette = ['#f7b8cf', '#f4a8c0', '#e89bb6'];
    for (let i = 0; i < count; i++) {
      arr.push({
        left: rand() * 100,
        top: rand() * 100,
        size: 14 + rand() * 18,
        rot: rand() * 360,
        color: palette[Math.floor(rand() * 3)],
      });
    }
    return arr;
  }, [count]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}>
      {items.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            color: p.color,
            transform: `rotate(${p.rot}deg)`,
          }}
        >
          {PAW}
        </div>
      ))}
    </div>
  );
}

type DogKind = 'shiba' | 'corgi' | 'poodle' | 'husky';

function DogMascot({ kind }: { kind: DogKind }) {
  if (kind === 'shiba') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <ellipse cx="22" cy="32" rx="11" ry="14" fill="#d8964a" transform="rotate(-12 22 32)" />
        <ellipse cx="78" cy="32" rx="11" ry="14" fill="#d8964a" transform="rotate(12 78 32)" />
        <ellipse cx="20" cy="32" rx="5" ry="7" fill="#f7c890" transform="rotate(-12 20 32)" />
        <ellipse cx="80" cy="32" rx="5" ry="7" fill="#f7c890" transform="rotate(12 80 32)" />
        <ellipse cx="50" cy="56" rx="32" ry="28" fill="#e8a55a" />
        <path d="M30 52 Q35 38 50 38 Q65 38 70 52 Z" fill="#fff5e0" />
        <ellipse cx="50" cy="68" rx="18" ry="13" fill="#fff5e0" />
        <ellipse cx="38" cy="52" rx="3.5" ry="4.5" fill="#2a1a10" />
        <ellipse cx="62" cy="52" rx="3.5" ry="4.5" fill="#2a1a10" />
        <circle cx="39" cy="50" r="1.2" fill="#fff" />
        <circle cx="63" cy="50" r="1.2" fill="#fff" />
        <ellipse cx="30" cy="64" rx="5" ry="3" fill="#ffb3c7" opacity="0.6" />
        <ellipse cx="70" cy="64" rx="5" ry="3" fill="#ffb3c7" opacity="0.6" />
        <ellipse cx="50" cy="64" rx="3" ry="2.2" fill="#2a1a10" />
        <path d="M44 70 Q50 74 56 70" stroke="#2a1a10" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M47 70 Q50 75 53 70" fill="#ff8aa6" />
      </svg>
    );
  }
  if (kind === 'corgi') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <ellipse cx="20" cy="34" rx="10" ry="13" fill="#e89f6a" transform="rotate(-8 20 34)" />
        <ellipse cx="80" cy="34" rx="10" ry="13" fill="#e89f6a" transform="rotate(8 80 34)" />
        <ellipse cx="19" cy="34" rx="4" ry="6" fill="#ffd9b5" transform="rotate(-8 19 34)" />
        <ellipse cx="81" cy="34" rx="4" ry="6" fill="#ffd9b5" transform="rotate(8 81 34)" />
        <ellipse cx="50" cy="58" rx="33" ry="28" fill="#f0b078" />
        <path d="M28 58 Q34 42 50 42 Q66 42 72 58 Z" fill="#fff5e0" />
        <ellipse cx="50" cy="70" rx="20" ry="14" fill="#fff5e0" />
        <ellipse cx="38" cy="54" rx="3.5" ry="4.5" fill="#2a1a10" />
        <ellipse cx="62" cy="54" rx="3.5" ry="4.5" fill="#2a1a10" />
        <circle cx="39" cy="52" r="1.2" fill="#fff" />
        <circle cx="63" cy="52" r="1.2" fill="#fff" />
        <ellipse cx="30" cy="66" rx="5" ry="3" fill="#ffb3c7" opacity="0.6" />
        <ellipse cx="70" cy="66" rx="5" ry="3" fill="#ffb3c7" opacity="0.6" />
        <ellipse cx="50" cy="66" rx="3" ry="2.2" fill="#2a1a10" />
        <path d="M50 68 L50 73" stroke="#2a1a10" strokeWidth="1.5" />
        <path d="M44 73 Q50 78 56 73" stroke="#2a1a10" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'poodle') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <circle cx="20" cy="35" r="12" fill="#fff" />
        <circle cx="80" cy="35" r="12" fill="#fff" />
        <circle cx="50" cy="58" r="32" fill="#fff" />
        <circle cx="22" cy="30" r="8" fill="#fffafc" />
        <circle cx="78" cy="30" r="8" fill="#fffafc" />
        <circle cx="35" cy="38" r="10" fill="#fffafc" />
        <circle cx="65" cy="38" r="10" fill="#fffafc" />
        <circle cx="30" cy="76" r="10" fill="#fffafc" />
        <circle cx="70" cy="76" r="10" fill="#fffafc" />
        <ellipse cx="50" cy="60" rx="22" ry="20" fill="#fff5e8" />
        <ellipse cx="42" cy="56" rx="3.5" ry="4.5" fill="#2a1a10" />
        <ellipse cx="58" cy="56" rx="3.5" ry="4.5" fill="#2a1a10" />
        <circle cx="43" cy="54" r="1.2" fill="#fff" />
        <circle cx="59" cy="54" r="1.2" fill="#fff" />
        <ellipse cx="36" cy="65" rx="4" ry="2.5" fill="#ffb3c7" opacity="0.6" />
        <ellipse cx="64" cy="65" rx="4" ry="2.5" fill="#ffb3c7" opacity="0.6" />
        <ellipse cx="50" cy="64" rx="2.8" ry="2.2" fill="#2a1a10" />
        <path d="M44 70 Q50 74 56 70" stroke="#2a1a10" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M30 22 L36 28 L36 18 Z" fill="#ef6f8f" />
        <path d="M42 22 L36 28 L36 18 Z" fill="#ef6f8f" />
        <circle cx="36" cy="23" r="2" fill="#c44a6a" />
      </svg>
    );
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <ellipse cx="22" cy="28" rx="10" ry="15" fill="#5a4a44" transform="rotate(-15 22 28)" />
      <ellipse cx="78" cy="28" rx="10" ry="15" fill="#5a4a44" transform="rotate(15 78 28)" />
      <ellipse cx="20" cy="30" rx="4" ry="8" fill="#ffc8d6" transform="rotate(-15 20 30)" />
      <ellipse cx="80" cy="30" rx="4" ry="8" fill="#ffc8d6" transform="rotate(15 80 30)" />
      <ellipse cx="50" cy="58" rx="32" ry="28" fill="#e8e4e0" />
      <path
        d="M28 50 Q35 38 50 38 Q65 38 72 50 L65 56 Q58 50 50 50 Q42 50 35 56 Z"
        fill="#5a4a44"
      />
      <ellipse cx="50" cy="68" rx="20" ry="13" fill="#fff" />
      <ellipse cx="38" cy="50" rx="3.5" ry="4.5" fill="#6ec0e8" />
      <ellipse cx="62" cy="50" rx="3.5" ry="4.5" fill="#6ec0e8" />
      <ellipse cx="38" cy="50" rx="1.6" ry="2.4" fill="#1a3a4a" />
      <ellipse cx="62" cy="50" rx="1.6" ry="2.4" fill="#1a3a4a" />
      <circle cx="39" cy="49" r="0.8" fill="#fff" />
      <circle cx="63" cy="49" r="0.8" fill="#fff" />
      <ellipse cx="30" cy="64" rx="5" ry="3" fill="#ffb3c7" opacity="0.6" />
      <ellipse cx="70" cy="64" rx="5" ry="3" fill="#ffb3c7" opacity="0.6" />
      <ellipse cx="50" cy="64" rx="3" ry="2.2" fill="#2a1a10" />
      <path d="M44 70 Q50 75 56 70" stroke="#2a1a10" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M47 70 Q50 76 53 70" fill="#ff8aa6" />
    </svg>
  );
}

type Member = {
  name: string;
  role: string;
  sub: string;
  dog: DogKind;
  dogName: string;
  photo: string;
  photoPosition?: string;
  bg: string;
  accent: string;
  tilt: number;
  icon: ReactNode;
  quote: string;
  fact: string;
};

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const TEAM: Member[] = [
  {
    name: '小餅',
    role: '製作人',
    sub: 'Producer',
    dog: 'shiba',
    dogName: '麻吉',
    photo: 'assets/credits/bean.jpg',
    photoPosition: 'center 52%',
    bg: '#ffe4ec',
    accent: '#ef6f8f',
    tilt: -3,
    icon: SPARK,
    quote: '把每一個點子煮成一鍋熱湯',
    fact: '養了三隻柴犬，最愛吃布丁',
  },
  {
    name: 'T0',
    role: '技術負責人',
    sub: 'Tech Lead',
    dog: 'husky',
    dogName: '雪球',
    photo: 'assets/credits/t0.jpg',
    photoPosition: 'center 48%',
    bg: '#e0eef9',
    accent: '#5a9bd1',
    tilt: 4,
    icon: HEART,
    quote: 'Bug 不是壞掉，是還沒被理解',
    fact: '凌晨四點寫 code 最有靈感',
  },
  {
    name: 'Ben',
    role: '美術設計',
    sub: 'Art Director',
    dog: 'corgi',
    dogName: '麵包',
    photo: 'assets/credits/ben.jpg',
    photoPosition: 'center 48%',
    bg: '#fff3d6',
    accent: '#e8a04a',
    tilt: -2,
    icon: HEART,
    quote: '顏色是有情緒的，圓角也是',
    fact: '每天畫一隻狗暖暖手',
  },
  {
    name: '妳多會',
    role: '遊戲企劃',
    sub: 'Game Designer',
    dog: 'poodle',
    dogName: '棉花糖',
    photo: 'assets/credits/ni-duo-hui.jpg',
    photoPosition: 'center 42%',
    bg: '#ece4f7',
    accent: '#a785d6',
    tilt: 3,
    icon: SPARK,
    quote: '喔這麼說 你很會囉',
    fact: '可以連續打三小時遊戲不喝水',
  },
];

function MemberCard({ member, index }: { member: Member; index: number }) {
  const tapeColor = index % 2 === 0 ? '#f7b8cf' : '#c8e6f5';
  const tapeAngle = index % 2 === 0 ? -14 : 14;
  return (
    <div
      style={{
        position: 'relative',
        background: '#fffafc',
        borderRadius: 22,
        padding: '26px 24px 22px',
        transform: `rotate(${member.tilt}deg)`,
        boxShadow:
          '0 18px 36px rgba(180,120,140,0.22), inset 0 0 0 1px rgba(239,111,143,0.1)',
        backgroundImage:
          'radial-gradient(circle at 16px 16px, rgba(239,111,143,0.05) 1.5px, transparent 1.6px)',
        backgroundSize: '20px 20px',
      }}
    >
      <Tape
        color={tapeColor}
        angle={tapeAngle}
        w={84}
        h={22}
        style={{
          top: -10,
          left: '50%',
          transform: `translateX(-50%) rotate(${tapeAngle}deg)`,
        }}
      />
      <Pin color={member.accent} size={14} style={{ top: 14, right: 18 }} />

      <div
        style={{
          background: member.bg,
          borderRadius: 18,
          padding: 14,
          paddingBottom: 16,
          position: 'relative',
          boxShadow: `inset 0 0 0 1.5px ${member.accent}33`,
        }}
      >
        <div
          style={{
            width: '100%',
            aspectRatio: '4 / 5',
            background: `radial-gradient(circle at 50% 35%, ${shade(member.bg, 12)}, ${member.bg})`,
            borderRadius: 14,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 20px rgba(120,60,80,0.16)',
          }}
        >
          <img
            src={assetUrl(member.photo)}
            alt={`${member.name} 的照片`}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: member.photoPosition ?? 'center',
              display: 'block',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0) 58%, rgba(77,38,54,0.28) 100%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 58,
              height: 58,
              padding: 6,
              borderRadius: '50%',
              background: '#fffafc',
              boxShadow: '0 4px 10px rgba(120,60,80,0.2)',
            }}
          >
            <DogMascot kind={member.dog} />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '3px 10px',
              background: '#fff',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800,
              color: member.accent,
              boxShadow: '0 2px 4px rgba(180,120,140,0.18)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Icon size={10} color={member.accent}>{PAW}</Icon>
            {member.dogName}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            background: `linear-gradient(135deg, ${member.bg}, ${shade(member.bg, -8)})`,
            fontSize: 11,
            fontWeight: 800,
            color: member.accent,
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          <Icon size={12}>{member.icon}</Icon>
          {member.sub}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: '#7a3a52',
            letterSpacing: 1,
            lineHeight: 1.1,
          }}
        >
          {member.name}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#b88294', marginTop: 4 }}>
          {member.role}
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: '12px 14px',
          background: shade(member.bg, 6),
          borderRadius: 12,
          fontSize: 12,
          color: '#7a5a68',
          fontWeight: 600,
          fontStyle: 'italic',
          textAlign: 'center',
          position: 'relative',
          lineHeight: 1.5,
        }}
      >
        <span style={{ color: member.accent, fontSize: 16, fontWeight: 900 }}>「</span>
        {member.quote}
        <span style={{ color: member.accent, fontSize: 16, fontWeight: 900 }}>」</span>
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 11,
          color: '#a87a8a',
          fontWeight: 600,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Icon size={12} color={member.accent}>{HEART}</Icon>
        {member.fact}
      </div>
    </div>
  );
}

const STAGE_W = 1180;
const STAGE_H = 980;

export function CreditsScreen() {
  const closeCredits = useUiStore((s) => s.closeCredits);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCredits();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeCredits]);

  return (
    <div
      className="fixed inset-0 z-[1100] overflow-auto"
      style={{
        background: '#f6efe8',
        fontFamily: '"Noto Sans TC", system-ui, -apple-system, "PingFang TC", sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '20px 0',
      }}
    >
      <div
        style={{
          width: STAGE_W,
          minHeight: STAGE_H,
          background:
            'linear-gradient(180deg, #fff0e6 0%, #ffe4ec 50%, #ffd9e8 100%)',
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: 60,
          borderRadius: 12,
          boxShadow: '0 30px 80px rgba(120,60,80,0.25)',
        }}
      >
        <PawScatter count={28} opacity={0.06} />

        <div
          style={{
            position: 'absolute',
            top: 36,
            right: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #ef6f8f, #ffa6b9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 10px rgba(239,111,143,0.32)',
            }}
          >
            <Icon size={18}>{PAW}</Icon>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: '#7a3a52',
              letterSpacing: 1,
            }}
          >
            帕特邦 v{__APP_VERSION__}
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: 90, paddingBottom: 30, position: 'relative' }}>
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <Tape color="#f7b8cf" angle={-6} w={120} h={26} style={{ top: -14, left: -30 }} />
            <Tape color="#c8e6f5" angle={5} w={100} h={24} style={{ top: -16, right: -20 }} />
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#a86a82',
                letterSpacing: 6,
              }}
            >
              CREDITS · 製作團隊
            </div>
            <h1
              style={{
                margin: '6px 0 0',
                fontSize: 52,
                fontWeight: 900,
                color: '#7a3a52',
                letterSpacing: 2,
                lineHeight: 1,
              }}
            >
              畫小餅工作室
            </h1>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#b88294',
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Icon size={14} color="#ef6f8f">{HEART}</Icon>
              一間小小的、毛茸茸的工作室
              <Icon size={14} color="#ef6f8f">{HEART}</Icon>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '20px 80px 40px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px 50px',
            position: 'relative',
          }}
        >
          {TEAM.map((m, i) => (
            <MemberCard key={m.name} member={m} index={i} />
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '40px 60px 20px', position: 'relative' }}>
          <div
            style={{
              display: 'inline-block',
              position: 'relative',
              padding: '20px 40px',
              background: '#fffafc',
              borderRadius: 22,
              boxShadow:
                '0 14px 28px rgba(180,120,140,0.18), inset 0 0 0 1px rgba(239,111,143,0.12)',
            }}
          >
            <Tape color="#ffd9a6" angle={-8} w={100} h={20} style={{ top: -8, left: 30 }} />
            <Tape color="#f7b8cf" angle={6} w={100} h={20} style={{ top: -8, right: 30 }} />
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#7a3a52',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                justifyContent: 'center',
              }}
            >
              <Icon size={22} color="#ef6f8f">{PAW}</Icon>
              謝謝你陪我們經營這間小小的公司
              <Icon size={22} color="#ef6f8f">{PAW}</Icon>
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#b88294',
                marginTop: 8,
                fontWeight: 600,
                letterSpacing: 2,
              }}
            >
              Made with 🐾 by 畫小餅工作室 · Taipei 2026
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={closeCredits}
              style={{
                marginTop: 28,
                fontSize: 15,
                fontWeight: 800,
                color: '#fff',
                border: 0,
                borderRadius: 14,
                cursor: 'pointer',
                background: 'linear-gradient(180deg, #ff8aa6, #ef6f8f)',
                boxShadow:
                  '0 6px 0 #c44a6a, 0 10px 18px rgba(239,111,143,0.32)',
                fontFamily: 'inherit',
                letterSpacing: 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 32px',
              }}
            >
              <Icon size={18}>{PAW}</Icon>
              回到大廳
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
