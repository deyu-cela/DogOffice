import { create } from 'zustand';
import type { SaveConflict, SaveMeta, SavePayload, SaveStatus, UpsertResponse } from '@/types/save';
import { SAVE_VERSION } from '@/types/save';
import { ApiError, apiFetch } from '@/lib/api';
import { migrate, serialize } from '@/lib/saveSerializer';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';

const MOCK_KEY = 'dogoffice:mocksave:v1';
const mockMode = import.meta.env.VITE_SAVE_MOCK === 'true';

type SaveState = {
  status: SaveStatus;
  cloud: SaveMeta | null;
  revision: number | null;
  lastSavedAt: number | null;
  error: string | null;
  conflict: SaveConflict | null;
};

type SaveActions = {
  loadCloud: () => Promise<void>;
  saveToCloud: () => Promise<void>;
  clearCloud: () => Promise<void>;
  resolveConflict: (choice: 'local' | 'cloud') => Promise<void>;
  reset: () => void;
  clearError: () => void;
  clearConflict: () => void;
};

const initialState: SaveState = {
  status: 'idle',
  cloud: null,
  revision: null,
  lastSavedAt: null,
  error: null,
  conflict: null,
};

let loadPromise: Promise<void> | null = null;
let savePromise: Promise<void> | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function mockRead(): SaveMeta | null {
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveMeta;
  } catch {
    return null;
  }
}

async function mockGet(): Promise<SaveMeta | null> {
  await delay(150);
  return mockRead();
}

async function mockPost(payload: SavePayload): Promise<UpsertResponse> {
  await delay(200);
  const current = mockRead();
  const serverRev = current?.revision ?? 0;
  const clientRev = payload.revision ?? 0;
  if (current && clientRev !== serverRev) {
    throw new ApiError(409, 4090, 'save conflict', {
      server_revision: serverRev,
      server_updated_at: current.updated_at,
      server_data: current.data,
    });
  }
  const meta: SaveMeta = {
    version: payload.version,
    revision: serverRev + 1,
    updated_at: new Date().toISOString(),
    data: payload.data,
  };
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(meta));
  } catch {
    // ignore
  }
  return { version: meta.version, revision: meta.revision, updated_at: meta.updated_at };
}

async function mockDelete(): Promise<void> {
  await delay(100);
  try {
    localStorage.removeItem(MOCK_KEY);
  } catch {
    // ignore
  }
}

async function apiGetSave(): Promise<SaveMeta | null> {
  return apiFetch<SaveMeta | null>('/saves', { auth: true });
}

async function apiPostSave(payload: SavePayload): Promise<UpsertResponse> {
  return apiFetch<UpsertResponse>('/saves', { method: 'POST', body: payload, auth: true });
}

async function apiDeleteSave(): Promise<void> {
  await apiFetch<unknown>('/saves', { method: 'DELETE', auth: true });
}

export const useSaveStore = create<SaveState & SaveActions>((set, get) => ({
  ...initialState,

  loadCloud: () => {
    if (loadPromise) return loadPromise;
    const run = async () => {
      set({ status: 'loading', error: null, conflict: null });
      try {
        const meta = mockMode ? await mockGet() : await apiGetSave();
        if (!meta) {
          useGameStore.getState().resetToInitialGame();
          set({ ...initialState, status: 'idle' });
          return;
        }
        const data = migrate(meta.version, meta.data);
        if (!data) {
          set({ status: 'error', error: '存檔格式無法識別（版本太新）' });
          return;
        }
        useGameStore.getState().applySave(data);
        set({
          status: 'idle',
          cloud: { ...meta, data },
          revision: meta.revision,
        });
      } catch (err) {
        set({
          status: 'error',
          error: err instanceof Error ? err.message : '讀取雲端存檔失敗',
        });
      }
    };
    loadPromise = run().finally(() => {
      loadPromise = null;
    });
    return loadPromise;
  },

  saveToCloud: () => {
    if (savePromise) return savePromise;
    const run = async () => {
      const auth = useAuthStore.getState();
      if (!auth.user) return;
      const gs = useGameStore.getState();
      if (gs.showSplash) return;

      const data = serialize(gs);
      const payload: SavePayload = {
        version: SAVE_VERSION,
        revision: get().revision ?? 0,
        data,
      };
      set({ status: 'saving', error: null });
      try {
        const resp = mockMode ? await mockPost(payload) : await apiPostSave(payload);
        const cloud: SaveMeta = {
          version: resp.version,
          revision: resp.revision,
          updated_at: resp.updated_at,
          data,
        };
        set({
          status: 'idle',
          cloud,
          revision: resp.revision,
          lastSavedAt: Date.now(),
        });
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          const conflict = (err.data as SaveConflict | undefined) ?? null;
          set({
            status: 'conflict',
            conflict,
            error: '雲端有更新的存檔，請選擇要保留哪一份',
          });
        } else {
          set({
            status: 'error',
            error: err instanceof Error ? err.message : '存檔失敗',
          });
        }
      }
    };
    savePromise = run().finally(() => {
      savePromise = null;
    });
    return savePromise;
  },

  clearCloud: async () => {
    set({ status: 'saving', error: null });
    try {
      if (mockMode) await mockDelete();
      else await apiDeleteSave();
      set({ ...initialState, status: 'idle' });
    } catch (err) {
      set({
        status: 'error',
        error: err instanceof Error ? err.message : '清除存檔失敗',
      });
    }
  },

  resolveConflict: async (choice) => {
    const { conflict } = get();
    if (!conflict) return;
    if (choice === 'cloud') {
      useGameStore.getState().applySave(conflict.server_data);
      set({
        status: 'idle',
        cloud: {
          version: SAVE_VERSION,
          revision: conflict.server_revision,
          updated_at: conflict.server_updated_at,
          data: conflict.server_data,
        },
        revision: conflict.server_revision,
        conflict: null,
        error: null,
      });
      return;
    }
    set({
      revision: conflict.server_revision,
      conflict: null,
      status: 'idle',
      error: null,
    });
    await get().saveToCloud();
  },

  reset: () => set({ ...initialState }),
  clearError: () => set({ error: null }),
  clearConflict: () => set({ conflict: null, status: 'idle' }),
}));

if (import.meta.env.DEV) {
  // dev 自測：可在瀏覽器 console 用 __saveStore.getState().saveToCloud() 等手動觸發
  (window as unknown as { __saveStore: typeof useSaveStore }).__saveStore = useSaveStore;
}
