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
  for (let i = 0; i < 10; i++) {
    const x = 100 + Math.random() * Math.max(20, bounds.w - 180);
    const y = bounds.floorTop + 20 + Math.random() * Math.max(20, floorH - 70);
    if (!inObstacle(x, y, bounds.obstacles)) return { x, y };
  }
  return {
    x: bounds.w * 0.5,
    y: bounds.floorTop + floorH * 0.7,
  };
}

function createWalker(dog: Dog, bounds: RoomBounds): Walker {
  const pos = randomPosition(bounds);
  return {
    id: nextWalkerId(),
    x: 70,
    y: pos.y,
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
    const floorH = bounds.h - bounds.floorTop;
    const next = walkers.map((w) => {
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
      const nextX = w.x + (dx / dist) * w.speed * speedPenalty;
      const nextY = w.y + (dy / dist) * w.speed * speedPenalty;
      // 撞到障礙物 → 重選 target、保持原位
      if (inObstacle(nextX, nextY, bounds.obstacles)) {
        const target = randomPosition(bounds);
        return {
          ...w,
          targetX: target.x,
          targetY: target.y,
          idleTimer: 8,
        };
      }
      return {
        ...w,
        facingRight: dx > 0,
        x: nextX,
        y: nextY,
      };
    });
    set({ walkers: next });
  },
}));
