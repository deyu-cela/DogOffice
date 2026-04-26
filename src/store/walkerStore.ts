import { create } from 'zustand';
import type { Dog, Walker } from '@/types';
import { nextWalkerId } from '@/lib/utils';

type Obstacle = { x: number; y: number; w: number; h: number };
type RoomBounds = { w: number; h: number; floorTop: number; obstacles?: Obstacle[] };

// === 偶爾動一下的節奏（plan：99% 時間靜止）===
// walker 走到目標就停，下次啟動隨機 5~12 秒後
const IDLE_MIN_MS = 5000;
const IDLE_MAX_MS = 12000;

function randomIdleMs(): number {
  return IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS);
}

function inObstacle(px: number, py: number, obstacles?: Obstacle[]): boolean {
  if (!obstacles) return false;
  for (const o of obstacles) {
    if (px >= o.x && px <= o.x + o.w && py >= o.y && py <= o.y + o.h) return true;
  }
  return false;
}

function escapeObstacle(
  px: number,
  py: number,
  bounds: RoomBounds,
): { x: number; y: number } | null {
  if (!bounds.obstacles) return null;
  for (const o of bounds.obstacles) {
    if (px < o.x || px > o.x + o.w || py < o.y || py > o.y + o.h) continue;
    const distLeft = px - o.x;
    const distRight = o.x + o.w - px;
    const distTop = py - o.y;
    const distBottom = o.y + o.h - py;
    const minDist = Math.min(distLeft, distRight, distTop, distBottom);
    const margin = 12;
    let nx = px;
    let ny = py;
    if (minDist === distLeft) nx = o.x - margin;
    else if (minDist === distRight) nx = o.x + o.w + margin;
    else if (minDist === distTop) ny = o.y - margin;
    else ny = o.y + o.h + margin;
    nx = Math.max(10, Math.min(bounds.w - 10, nx));
    ny = Math.max(bounds.floorTop + 10, Math.min(bounds.h - 10, ny));
    return { x: nx, y: ny };
  }
  return null;
}

function findCornerWaypoint(
  hitX: number,
  hitY: number,
  wx: number,
  wy: number,
  tx: number,
  ty: number,
  bounds: RoomBounds,
): { x: number; y: number } | null {
  if (!bounds.obstacles) return null;
  let blocker: Obstacle | null = null;
  for (const o of bounds.obstacles) {
    if (hitX >= o.x && hitX <= o.x + o.w && hitY >= o.y && hitY <= o.y + o.h) {
      blocker = o;
      break;
    }
  }
  if (!blocker) return null;
  const m = 18;
  const corners = [
    { x: blocker.x - m, y: blocker.y - m },
    { x: blocker.x + blocker.w + m, y: blocker.y - m },
    { x: blocker.x - m, y: blocker.y + blocker.h + m },
    { x: blocker.x + blocker.w + m, y: blocker.y + blocker.h + m },
  ];
  let best: { x: number; y: number } | null = null;
  let bestScore = Infinity;
  for (const c of corners) {
    if (c.x < 10 || c.x > bounds.w - 10) continue;
    if (c.y < bounds.floorTop + 10 || c.y > bounds.h - 10) continue;
    if (inObstacle(c.x, c.y, bounds.obstacles)) continue;
    const score = Math.hypot(c.x - wx, c.y - wy) + Math.hypot(c.x - tx, c.y - ty);
    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

type WalkerActions = {
  setBounds: (bounds: RoomBounds) => void;
  addWalker: (dog: Dog) => void;
  removeByName: (name: string) => void;
  syncWithStaff: (staff: Dog[]) => void;
  tick: (morale: number, health: number) => void;
};

type WalkerStore = {
  walkers: Walker[];
  bounds: RoomBounds;
} & WalkerActions;

function randomPosition(bounds: RoomBounds): { x: number; y: number } {
  const floorH = bounds.h - bounds.floorTop;
  for (let i = 0; i < 30; i++) {
    const x = 60 + Math.random() * Math.max(20, bounds.w - 120);
    const y = bounds.floorTop + 30 + Math.random() * Math.max(20, floorH - 80);
    if (!inObstacle(x, y, bounds.obstacles)) return { x, y };
  }
  return { x: bounds.w * 0.5, y: bounds.h - 40 };
}

function createWalker(dog: Dog, bounds: RoomBounds): Walker {
  const pos = randomPosition(bounds);
  const spawnX = bounds.w * 0.35 + Math.random() * bounds.w * 0.3;
  const spawnY = bounds.h - 30;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return {
    id: nextWalkerId(),
    x: spawnX,
    y: spawnY,
    targetX: pos.x,
    targetY: pos.y,
    speed: 0.35 + Math.random() * 0.45,
    idleTimer: 0,
    // 第一次出生隨機間隔 1~6 秒後才開始走動，錯開避免大家同時動
    idleUntil: now + 1000 + Math.random() * 5000,
    facingRight: true,
    dogData: dog,
  };
}

export const useWalkerStore = create<WalkerStore>((set, get) => ({
  walkers: [],
  bounds: { w: 500, h: 400, floorTop: 220 },

  setBounds: (bounds) => set({ bounds }),

  addWalker: (dog) => {
    const { bounds, walkers } = get();
    if (walkers.find((w) => w.dogData.name === dog.name)) return;
    set({ walkers: [...walkers, createWalker(dog, bounds)] });
  },

  removeByName: (name) => {
    set((s) => ({ walkers: s.walkers.filter((w) => w.dogData.name !== name) }));
  },

  syncWithStaff: (staff) => {
    const { bounds, walkers } = get();
    const staffNames = new Set(staff.map((d) => d.name));
    let next = walkers.filter((w) => staffNames.has(w.dogData.name));
    staff.forEach((d) => {
      if (!next.find((w) => w.dogData.name === d.name)) {
        next = [...next, createWalker(d, bounds)];
      }
    });
    set({ walkers: next });
  },

  tick: (morale, health) => {
    const { walkers, bounds } = get();
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();

    // === 大優化：99% 時間什麼都不做 ===
    // 沒有 walker 在「該動」狀態 → 直接 return（不 setState → React 不 re-render → R3F 不重畫）
    const anyDue = walkers.some((w) => now >= w.idleUntil);
    if (!anyDue) return;

    const speedPenalty = morale < 35 || health < 35 ? 0.55 : 1;
    const next = walkers.map((w) => {
      // 還沒到該動的時間 → 完全不變
      if (now < w.idleUntil) return w;

      // === 以下是「正在走」的邏輯 ===
      // 1) 卡在障礙物內 → 強制推出 + 立即停下休息
      const stuck = escapeObstacle(w.x, w.y, bounds);
      if (stuck) {
        return {
          ...w,
          x: stuck.x,
          y: stuck.y,
          targetX: stuck.x,
          targetY: stuck.y,
          idleUntil: now + randomIdleMs(),
        };
      }

      const dx = w.targetX - w.x;
      const dy = w.targetY - w.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 2) 抵達 target → 選下一個位置 + 進入長時間 idle
      if (dist < 4) {
        const target = randomPosition(bounds);
        return {
          ...w,
          targetX: target.x,
          targetY: target.y,
          idleUntil: now + randomIdleMs(),
        };
      }

      // 3) 移動中
      const step = w.speed * speedPenalty;
      const ux = dx / dist;
      const uy = dy / dist;
      const nextX = w.x + ux * step;
      const nextY = w.y + uy * step;

      if (!inObstacle(nextX, nextY, bounds.obstacles)) {
        return {
          ...w,
          facingRight: ux > 0 ? true : ux < 0 ? false : w.facingRight,
          x: nextX,
          y: nextY,
        };
      }

      // 4) 路徑被擋 → 改以 corner 當 interim target
      const corner = findCornerWaypoint(
        nextX,
        nextY,
        w.x,
        w.y,
        w.targetX,
        w.targetY,
        bounds,
      );
      if (corner) {
        return { ...w, targetX: corner.x, targetY: corner.y };
      }

      // 5) 找不到可達 corner → 重選並短暫休息
      const target = randomPosition(bounds);
      return {
        ...w,
        targetX: target.x,
        targetY: target.y,
        idleUntil: now + 500,
      };
    });
    set({ walkers: next });
  },
}));
