// 2:1 isometric projection
export const TILE_W = 88;   // 菱形橫寬
export const TILE_H = 44;   // 菱形縱高
export const ROOM_GRID = 10; // 10x10 tile 地板（房間尺寸加大）
export const WALL_H = 260;
export const ROOM_PAD = 28;

export const ROOM_PX_W = ROOM_GRID * TILE_W + ROOM_PAD * 2;
export const ROOM_PX_H = ROOM_GRID * TILE_H + WALL_H + ROOM_PAD * 2;

/** grid 座標 → SVG 座標（菱形 top 為原點，往右+下為正） */
export function gridToIso(gx: number, gy: number) {
  return {
    x: ((gx - gy) * TILE_W) / 2,
    y: ((gx + gy) * TILE_H) / 2,
  };
}

/** grid 座標 → HTML 絕對定位（相對 IsoRoom inner container 左上角，px） */
export function gridToHtml(gx: number, gy: number) {
  const iso = gridToIso(gx, gy);
  return {
    x: iso.x + (ROOM_GRID * TILE_W) / 2 + ROOM_PAD,
    y: iso.y + WALL_H + ROOM_PAD,
  };
}

/** 家具 z-index：越靠前面（gx+gy 大）越上層。
 * 刻意保持絕對值低（max 約 40），以免蓋住全域 modal（Splash z-1000, Drawer z-800 等）。
 */
export function gridZ(gx: number, gy: number) {
  return Math.round((gx + gy) * 2);
}
