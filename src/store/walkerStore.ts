import { create } from 'zustand';
import type { Dog, Walker } from '@/types';
import { nextWalkerId } from '@/lib/utils';

type Obstacle = { x: number; y: number; w: number; h: number };
type RoomBounds = { w: number; h: number; floorTop: number; obstacles?: Obstacle[] };

function inObstacle(px: number, py: number, obstacles?: Obstacle[]): boolean {
  if (!obstacles) return false;
  for (const o of obstacles) {
    if (px >= o.x && px <= o.x + o.w && py >= o.y && py <= o.y + o.h) return true;
  }
  return false;
}

// 若 (px, py) 在某個障礙物內 → 推到最近的那一邊外
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

// 撞到障礙時，找擋路的障礙物四個 corner 中最合路徑的一個當 waypoint
// 將此 corner 設為 walker 的新 target，走到那裡再重新挑目標 → 不會左右來回卡
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
  const m = 18; // margin：稍微離 corner 外一點，確保不再踩到
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
    const score =
      Math.hypot(c.x - wx, c.y - wy) + Math.hypot(c.x - tx, c.y - ty);
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
  return {
    x: bounds.w * 0.5,
    y: bounds.h - 40,
  };
}

function createWalker(dog: Dog, bounds: RoomBounds): Walker {
  const pos = randomPosition(bounds);
  const spawnX = bounds.w * 0.35 + Math.random() * bounds.w * 0.3;
  const spawnY = bounds.h - 30;
  return {
    id: nextWalkerId(),
    x: spawnX,
    y: spawnY,
    targetX: pos.x,
    targetY: pos.y,
    speed: 0.35 + Math.random() * 0.45,
    idleTimer: 0,
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
    const speedPenalty = morale < 35 || health < 35 ? 0.55 : 1;
    const next = walkers.map((w) => {
      // 1) 卡在障礙物內 → 強制推出
      const stuck = escapeObstacle(w.x, w.y, bounds);
      if (stuck) {
        return {
          ...w,
          x: stuck.x,
          y: stuck.y,
          targetX: stuck.x,
          targetY: stuck.y,
          idleTimer: 3,
        };
      }

      if (w.idleTimer > 0) return { ...w, idleTimer: w.idleTimer - 1 };

      const dx = w.targetX - w.x;
      const dy = w.targetY - w.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4) {
        const target = randomPosition(bounds);
        return {
          ...w,
          targetX: target.x,
          targetY: target.y,
          idleTimer: 35 + Math.floor(Math.random() * 80),
        };
      }
      const step = w.speed * speedPenalty;
      const ux = dx / dist;
      const uy = dy / dist;
      const nextX = w.x + ux * step;
      const nextY = w.y + uy * step;

      // 2) 路徑通暢 → 正常前進
      if (!inObstacle(nextX, nextY, bounds.obstacles)) {
        return {
          ...w,
          facingRight: ux > 0 ? true : ux < 0 ? false : w.facingRight,
          x: nextX,
          y: nextY,
        };
      }

      // 3) 路徑被擋 → 改以障礙物 corner 當 interim target（commit 策略，不會左右抖）
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
        return {
          ...w,
          targetX: corner.x,
          targetY: corner.y,
        };
      }

      // 4) 找不到可達 corner → 重選隨機 target
      const target = randomPosition(bounds);
      return {
        ...w,
        targetX: target.x,
        targetY: target.y,
        idleTimer: 12,
      };
    });
    set({ walkers: next });
  },
}));
