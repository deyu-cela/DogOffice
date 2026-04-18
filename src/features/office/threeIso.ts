import { ROOM_GRID } from './iso';

/** Three.js world units 房間配置（對應 iso 2D grid） */
export const THREE_ROOM = 17;   // 地板邊長
export const THREE_WALL_H = 8;  // 牆高
export const THREE_HALF = THREE_ROOM / 2;
export const THREE_CELL = THREE_ROOM / ROOM_GRID; // 每格 world unit

/** iso grid (gx, gy) → world [x, y, z]，y 預設 0（地板高度） */
export function gridToWorld(gx: number, gy: number, y: number = 0): [number, number, number] {
  return [
    (gx + 0.5) * THREE_CELL - THREE_HALF,
    y,
    (gy + 0.5) * THREE_CELL - THREE_HALF,
  ];
}

/** sprite 高度（以 cell 為單位） → world 高度（gy 越大越前，sprite 底部貼地板） */
export function spriteHeight(heightInCells: number): number {
  return heightInCells * THREE_CELL;
}
