import type { ReactNode, CSSProperties } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Panel({ children, className = '', style }: Props) {
  return (
    <div
      className={`rounded-2xl p-4 border ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,251,255,0.92))',
        borderColor: 'var(--line)',
        // 多層 shadow：inset 上緣高光（糖霜感） + 近淺陰影 + 遠深擴散
        boxShadow:
          'var(--shadow), inset 0 1px 0 rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-extrabold ${className}`}
      style={{
        background: 'linear-gradient(180deg, #ffffff, #eaf4ff)',
        border: '1px solid var(--line)',
        color: 'var(--text)',
        // 糖霜感：內上高光 + 外層輕柔陰影
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(46,104,180,0.1)',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
