import { create } from 'zustand';

const MUTED_KEY = 'dogoffice:bgm-muted';

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTED_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTED_KEY, muted ? '1' : '0');
  } catch {
    // 無痕 / 爆滿時靜默
  }
}

type BgmState = {
  muted: boolean;
  toggleMute: () => void;
};

export const useBgmStore = create<BgmState>((set, get) => ({
  muted: readMuted(),
  toggleMute: () => {
    const next = !get().muted;
    writeMuted(next);
    set({ muted: next });
  },
}));
