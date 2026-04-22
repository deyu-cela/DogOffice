import { JP_ASSETS } from './assets';
import type { ShopItemEffectKey } from '@/types';

export type BuildingId = 'shop' | 'dorm' | 'hr';

export type BuildingDef = {
  kind: BuildingId;
  gx: number;
  gy: number;
  w: number;
  h: number;
};

export type PurchaseDef = {
  id: ShopItemEffectKey;
  src: string;
  gx: number;
  gy: number;
  w: number;
  h: number;
  yOffset?: number;
};

export const BUILDING_LAYOUT: BuildingDef[] = [
  { kind: 'shop', gx: 7.4, gy: 1.6, w: 4.4, h: 5.6 },
  { kind: 'dorm', gx: 2.2, gy: 5.7, w: 5.3, h: 4.5 },
  { kind: 'hr', gx: 7, gy: 9.1, w: 3.5, h: 3.2 },
];

export const PURCHASE_LAYOUT: PurchaseDef[] = [
  { id: 'gym', src: JP_ASSETS.gymArea, gx: 2.5, gy: 2.2, w: 5.2, h: 5.2 },
  { id: 'desk', src: JP_ASSETS.woodenDesk, gx: 6.5, gy: 5.3, w: 5.0, h: 4.6 },
  // 22001 kawaii 咖啡機 + PIL 畫的 iso 木桌（整張含桌腳落地），縱向較長所以 h>w
  { id: 'coffee', src: JP_ASSETS.coffeeMachine, gx: 0.2, gy: 5.5, w: 1.4, h: 2.2, yOffset: 0 },
  { id: 'sofa', src: JP_ASSETS.beanBag, gx: 2.0, gy: 8.9, w: 4.8, h: 4.4 },
  // policy 改為左牆掛件，不在地面出現（見 WallPolicy3D）
  { id: 'snack', src: JP_ASSETS.snackJar, gx: 5.3, gy: 3.65, w: 0.45, h: 0.6, yOffset: 1.0 },
  { id: 'toy', src: JP_ASSETS.toyBall, gx: 9, gy: 1.5, w: 0.8, h: 0.8 },
  { id: 'artwall', src: JP_ASSETS.pictureFrame, gx: 3.5, gy: 0.3, w: 1.4, h: 1.1 },
];

// 地板上的障礙物（grid 空間，中心 + 寬高）
// 視覺 sprite 是垂直 billboard，地面 footprint 小於視覺寬高；這裡取 sprite w/h 的一部分當 footprint
export type GridObstacle = { cx: number; cy: number; w: number; h: number };

export function computeGridObstacles(
  purchases: Record<string, number>,
): GridObstacle[] {
  const out: GridObstacle[] = [];
  // 建築：footprint 較大（實體建築）
  for (const b of BUILDING_LAYOUT) {
    out.push({ cx: b.gx, cy: b.gy, w: b.w * 0.75, h: b.h * 0.55 });
  }
  // 家具：只加有購買的、非掛牆/非桌上的
  for (const p of PURCHASE_LAYOUT) {
    if ((purchases[p.id] ?? 0) === 0) continue;
    if (p.yOffset && p.yOffset > 0.5) continue; // 在桌面上的小物，walker 可走過
    if (p.id === 'artwall') continue; // 牆上掛件
    out.push({ cx: p.gx, cy: p.gy, w: p.w * 0.65, h: p.h * 0.45 });
  }
  return out;
}
