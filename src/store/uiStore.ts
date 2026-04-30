import { create } from 'zustand';

export type BuildingKind = 'shop' | 'dorm' | 'hr';

type UIState = {
  openBuilding: BuildingKind | null;
  openDrawer: (k: BuildingKind) => void;
  closeDrawer: () => void;
  toggleDrawer: (k: BuildingKind) => void;

  // 成就 CG 全螢幕
  showAchievements: boolean;
  openAchievements: () => void;
  closeAchievements: () => void;
};

export const useUiStore = create<UIState>((set, get) => ({
  openBuilding: null,
  openDrawer: (k) => set({ openBuilding: k }),
  closeDrawer: () => set({ openBuilding: null }),
  toggleDrawer: (k) => set({ openBuilding: get().openBuilding === k ? null : k }),

  showAchievements: false,
  openAchievements: () => set({ showAchievements: true }),
  closeAchievements: () => set({ showAchievements: false }),
}));
