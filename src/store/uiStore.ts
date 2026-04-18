import { create } from 'zustand';

export type BuildingKind = 'shop' | 'dorm' | 'hr';

type UIState = {
  openBuilding: BuildingKind | null;
  openDrawer: (k: BuildingKind) => void;
  closeDrawer: () => void;
  toggleDrawer: (k: BuildingKind) => void;
};

export const useUiStore = create<UIState>((set, get) => ({
  openBuilding: null,
  openDrawer: (k) => set({ openBuilding: k }),
  closeDrawer: () => set({ openBuilding: null }),
  toggleDrawer: (k) => set({ openBuilding: get().openBuilding === k ? null : k }),
}));
