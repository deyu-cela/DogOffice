import type { ReactNode, CSSProperties } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Panel({ children, className = '', style }: Props) {
  return (
    <div
      className={`rounded-3xl p-4 border-2 ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,248,241,0.88))',
        borderColor: 'rgba(90,70,54,0.12)',
        boxShadow: '0 14px 36px rgba(90,70,54,0.08)',
        backdropFilter: 'blur(8px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`px-2.5 py-1.5 rounded-full text-xs whitespace-nowrap ${className}`}
      style={{
        background: 'linear-gradient(180deg, #fff7dd, #ffe8bf)',
        border: '1px solid rgba(90,70,54,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)',
      }}
    >
      {children}
    </span>
  );
}
