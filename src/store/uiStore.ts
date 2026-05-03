import { create } from 'zustand';
import type { ShopItemEffectKey } from '@/types';
import { useGameStore } from './gameStore';

export type BuildingKind = 'construction';

type UIState = {
  openBuilding: BuildingKind | null;
  openDrawer: (k: BuildingKind) => void;
  closeDrawer: () => void;
  toggleDrawer: (k: BuildingKind) => void;

  // 成就 CG 全螢幕
  showAchievements: boolean;
  openAchievements: () => void;
  closeAchievements: () => void;

  // 製作人員名單頁
  showCredits: boolean;
  openCredits: () => void;
  closeCredits: () => void;

  // 新手禮包彈窗
  showStarterPack: boolean;
  openStarterPack: () => void;
  closeStarterPack: () => void;

  // 管理隊伍 modal（置中）
  teamModalOpen: boolean;
  openTeamModal: () => void;
  closeTeamModal: () => void;

  // 招募抽卡 modal（蔚藍檔案風）
  recruitModalOpen: boolean;
  openRecruitModal: () => void;
  closeRecruitModal: () => void;

  // 商店 modal（置中，從販賣機觸發）
  shopModalOpen: boolean;
  openShopModal: () => void;
  closeShopModal: () => void;

  // 辦公室造型 modal（從右上角圖示鈕觸發）
  skinModalOpen: boolean;
  openSkinModal: () => void;
  closeSkinModal: () => void;

  // 案件詳情 modal（從牆上便利貼觸發）
  projectDetailId: string | null;
  openProjectDetail: (id: string) => void;
  closeProjectDetail: () => void;

  // 設施資訊浮窗（點擊辦公室裡的設施觸發）
  facilityInfoId: ShopItemEffectKey | null;
  openFacilityInfo: (id: ShopItemEffectKey) => void;
  closeFacilityInfo: () => void;
};

export const useUiStore = create<UIState>((set, get) => ({
  openBuilding: null,
  openDrawer: (k) => {
    set({ openBuilding: k });
    if (k === 'construction') {
      useGameStore.getState().triggerHint('special-task');
    }
  },
  closeDrawer: () => set({ openBuilding: null }),
  toggleDrawer: (k) => {
    const next = get().openBuilding === k ? null : k;
    set({ openBuilding: next });
    if (next === 'construction') {
      useGameStore.getState().triggerHint('special-task');
    }
  },

  showAchievements: false,
  openAchievements: () => set({ showAchievements: true }),
  closeAchievements: () => set({ showAchievements: false }),

  showCredits: false,
  openCredits: () => set({ showCredits: true }),
  closeCredits: () => set({ showCredits: false }),

  showStarterPack: false,
  openStarterPack: () => set({ showStarterPack: true }),
  closeStarterPack: () => set({ showStarterPack: false }),

  teamModalOpen: false,
  openTeamModal: () => {
    set({ teamModalOpen: true });
    useGameStore.getState().completeTutorialGate(5);
  },
  closeTeamModal: () => {
    set({ teamModalOpen: false });
    useGameStore.getState().completeTutorialGate(7);
  },

  recruitModalOpen: false,
  openRecruitModal: () => set({ recruitModalOpen: true }),
  closeRecruitModal: () => {
    set({ recruitModalOpen: false });
    useGameStore.getState().completeTutorialGate(4);
  },

  shopModalOpen: false,
  openShopModal: () => set({ shopModalOpen: true }),
  closeShopModal: () => set({ shopModalOpen: false }),

  skinModalOpen: false,
  openSkinModal: () => set({ skinModalOpen: true }),
  closeSkinModal: () => set({ skinModalOpen: false }),

  projectDetailId: null,
  openProjectDetail: (id) => set({ projectDetailId: id }),
  closeProjectDetail: () => set({ projectDetailId: null }),

  facilityInfoId: null,
  openFacilityInfo: (id) => set({ facilityInfoId: id }),
  closeFacilityInfo: () => set({ facilityInfoId: null }),
}));
