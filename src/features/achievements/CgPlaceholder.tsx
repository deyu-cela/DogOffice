import { useState } from 'react';
import type { Achievement } from './achievementConfigs';

type Props = {
  achievement: Achievement;
  unlocked: boolean;
  rounded?: number;
};

const PALETTE = [
  ['#ffd9a8', '#ff7e7e'],
  ['#cdb0ff', '#8b6dff'],
  ['#ffe082', '#ffae42'],
  ['#a8e0ff', '#5aa9ff'],
  ['#b8f3c2', '#3fbf75'],
  ['#ffc6e0', '#ff7eb6'],
  ['#ffd6b8', '#ff9a52'],
  ['#c2d9ff', '#6b8aff'],
  ['#fff0a8', '#f5c542'],
  ['#d2b3ff', '#7a55ff'],
];

function pickPalette(id: string): [string, string] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length] as [string, string];
}

/**
 * 沒對應 PNG 時顯示的占位圖：漸層背景 + 大標題 + 鎖頭/勾勾。
 * 已解鎖卻沒圖檔 → 仍顯示彩色版本，讓玩家知道「這個成就已拿到，圖之後補上」。
 */
export function CgPlaceholder({ achievement, unlocked, rounded = 12 }: Props) {
  const [a, b] = pickPalette(achievement.id);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: rounded,
        background: unlocked
          ? `linear-gradient(135deg, ${a}, ${b})`
          : 'linear-gradient(135deg, #c8d2dc, #98a4b4)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: 16,
        color: 'white',
        textShadow: '0 2px 6px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ fontSize: 48, lineHeight: 1, opacity: unlocked ? 1 : 0.6 }}>
        {unlocked ? '🏆' : '🔒'}
      </div>
      <div
        style={{
          marginTop: 8,
          fontWeight: 900,
          fontSize: 16,
          textAlign: 'center',
          opacity: unlocked ? 1 : 0.8,
        }}
      >
        {unlocked ? achievement.title : '???'}
      </div>
    </div>
  );
}

type CgImageProps = {
  achievement: Achievement;
  unlocked: boolean;
  rounded?: number;
};

/**
 * 嘗試載入 CG PNG，載失敗就 fallback 到 CgPlaceholder。
 */
export function CgImage({ achievement, unlocked, rounded = 12 }: CgImageProps) {
  const [errored, setErrored] = useState(false);

  if (!unlocked || errored) {
    return <CgPlaceholder achievement={achievement} unlocked={unlocked} rounded={rounded} />;
  }
  return (
    <img
      src={achievement.cgPath}
      alt={achievement.title}
      onError={() => setErrored(true)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: rounded,
        display: 'block',
      }}
      draggable={false}
    />
  );
}
