import type { ReactNode } from 'react';
import { ROOM_GRID, TILE_W, TILE_H, WALL_H, ROOM_PAD, ROOM_PX_W, ROOM_PX_H } from './iso';
import { JP_ASSETS } from './assets';

type Props = {
  children?: ReactNode;
  health?: number;
};

/**
 * L 形等角房間（Kawaii Home Design 風格）：
 * - 菱形地板（top/right/bottom/left polygon）
 * - 左牆 + 右牆（往後上延伸）
 * - 天花橫樑
 * - 地板網格線（每 tile 邊界）
 *
 * 固定 pixel 尺寸（ROOM_PX_W × ROOM_PX_H），置中在父容器。
 * Children 透過 gridToHtml(gx, gy) 取得 HTML 座標，與 SVG 對齊。
 */
export function IsoRoom({ children, health = 100 }: Props) {
  const n = ROOM_GRID;
  const floorW = n * TILE_W;
  const floorH = n * TILE_H;

  // SVG 座標（菱形 top 為原點）
  const top = { x: 0, y: 0 };
  const right = { x: floorW / 2, y: floorH / 2 };
  const bottom = { x: 0, y: floorH };
  const left = { x: -floorW / 2, y: floorH / 2 };
  const leftTop = { x: left.x, y: left.y - WALL_H };
  const backTop = { x: top.x, y: top.y - WALL_H };
  const rightTop = { x: right.x, y: right.y - WALL_H };

  // viewBox 從菱形 top 往上 WALL_H + pad，往外 floorW/2 + pad
  const vbX = -floorW / 2 - ROOM_PAD;
  const vbY = -WALL_H - ROOM_PAD;
  const vbW = floorW + ROOM_PAD * 2;
  const vbH = floorH + WALL_H + ROOM_PAD * 2;

  const floorFill = health < 40 ? '#c9b58d' : '#e6cf94';

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="relative"
        style={{ width: ROOM_PX_W, height: ROOM_PX_H, maxWidth: '100%', maxHeight: '100%' }}
      >
        <svg
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          width={ROOM_PX_W}
          height={ROOM_PX_H}
          className="absolute inset-0"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="leftWallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fbeccf" />
              <stop offset="1" stopColor="#f3d9a6" />
            </linearGradient>
            <linearGradient id="rightWallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fdf7ea" />
              <stop offset="1" stopColor="#f5e2bb" />
            </linearGradient>
          </defs>

          {/* 左牆 */}
          <polygon
            points={`${left.x},${left.y} ${leftTop.x},${leftTop.y} ${backTop.x},${backTop.y} ${top.x},${top.y}`}
            fill="url(#leftWallGrad)"
            stroke="#7a5638"
            strokeWidth="1.5"
          />
          {/* 右牆 */}
          <polygon
            points={`${top.x},${top.y} ${backTop.x},${backTop.y} ${rightTop.x},${rightTop.y} ${right.x},${right.y}`}
            fill="url(#rightWallGrad)"
            stroke="#7a5638"
            strokeWidth="1.5"
          />
          {/* 地板 */}
          <polygon
            points={`${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`}
            fill={floorFill}
            stroke="#6d5a32"
            strokeWidth="2"
          />
          {/* 地板網格線 - 沿 gx 軸 */}
          {Array.from({ length: n - 1 }).map((_, i) => {
            const t = (i + 1) / n;
            return (
              <line
                key={`gx-${i}`}
                x1={left.x + (top.x - left.x) * t}
                y1={left.y + (top.y - left.y) * t}
                x2={bottom.x + (right.x - bottom.x) * t}
                y2={bottom.y + (right.y - bottom.y) * t}
                stroke="rgba(109,90,50,0.28)"
                strokeWidth="0.7"
              />
            );
          })}
          {/* 地板網格線 - 沿 gy 軸 */}
          {Array.from({ length: n - 1 }).map((_, i) => {
            const t = (i + 1) / n;
            return (
              <line
                key={`gy-${i}`}
                x1={left.x + (bottom.x - left.x) * t}
                y1={left.y + (bottom.y - left.y) * t}
                x2={top.x + (right.x - top.x) * t}
                y2={top.y + (right.y - top.y) * t}
                stroke="rgba(109,90,50,0.28)"
                strokeWidth="0.7"
              />
            );
          })}
          {/* 天花橫樑 */}
          <line x1={leftTop.x} y1={leftTop.y} x2={backTop.x} y2={backTop.y} stroke="#5d3f22" strokeWidth="3" />
          <line x1={backTop.x} y1={backTop.y} x2={rightTop.x} y2={rightTop.y} stroke="#5d3f22" strokeWidth="3" />
        </svg>

        {/* sprite HTML overlay（座標系與 SVG viewBox 對齊） */}
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  );
}
