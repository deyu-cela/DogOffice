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
        background: 'linear-gradient(180deg, rgba(255,252,250,0.98), rgba(253,226,224,0.9))',
        borderColor: 'rgba(214,145,150,0.28)',
        // 多層 shadow：inset 上緣高光（糖霜感） + 近淺陰影 + 遠深擴散
        boxShadow:
          'inset 0 1.5px 0 rgba(255,255,255,0.9), 0 2px 5px rgba(214,145,150,0.1), 0 10px 24px rgba(200,120,140,0.16), 0 22px 48px rgba(180,100,130,0.08)',
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
        background: 'linear-gradient(180deg, #fff0f2, #fbd5db)',
        border: '1px solid rgba(214,145,150,0.22)',
        // 糖霜感：內上高光 + 外層輕柔陰影
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.75), 0 2px 6px rgba(214,145,150,0.2)',
      }}
    >
      {children}
    </span>
  );
}
