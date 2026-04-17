import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { useSaveStore } from '@/store/saveStore';
import { serialize } from '@/lib/saveSerializer';
import { SAVE_VERSION } from '@/types/save';

const MIN_INTERVAL_MS = 10_000;
const AUTO_SAVE_EVERY_N_DAYS = 3;
const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const mockMode = import.meta.env.VITE_SAVE_MOCK === 'true';

export function useAutoSave() {
  const saveToCloud = useSaveStore((s) => s.saveToCloud);
  const userId = useAuthStore((s) => s.user?.userId ?? null);
  const day = useGameStore((s) => s.day);
  const bankrupt = useGameStore((s) => s.bankrupt);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const tutorialStep = useGameStore((s) => s.tutorialStep);

  const lastSavedDayRef = useRef<number>(day);
  const lastOfficeLevelRef = useRef<number>(officeLevel);
  const lastTutorialStepRef = useRef<number>(tutorialStep);
  const lastBankruptRef = useRef<boolean>(bankrupt);
  const lastTriggerAtRef = useRef<number>(0);

  function throttledSave(force = false) {
    const auth = useAuthStore.getState();
    const gs = useGameStore.getState();
    if (!auth.user) return;
    if (gs.showSplash) return;
    const now = Date.now();
    if (!force && now - lastTriggerAtRef.current < MIN_INTERVAL_MS) return;
    lastTriggerAtRef.current = now;
    saveToCloud();
  }

  useEffect(() => {
    if (day - lastSavedDayRef.current >= AUTO_SAVE_EVERY_N_DAYS) {
      lastSavedDayRef.current = day;
      throttledSave();
    }
  }, [day]);

  useEffect(() => {
    if (officeLevel !== lastOfficeLevelRef.current) {
      lastOfficeLevelRef.current = officeLevel;
      throttledSave();
    }
  }, [officeLevel]);

  useEffect(() => {
    if (tutorialStep !== lastTutorialStepRef.current) {
      lastTutorialStepRef.current = tutorialStep;
      throttledSave();
    }
  }, [tutorialStep]);

  useEffect(() => {
    if (bankrupt && !lastBankruptRef.current) {
      lastBankruptRef.current = true;
      throttledSave(true);
    } else if (!bankrupt) {
      lastBankruptRef.current = false;
    }
  }, [bankrupt]);

  useEffect(() => {
    if (!userId) return;
    const handler = () => {
      if (mockMode) return;
      if (!API_BASE) return;
      const auth = useAuthStore.getState();
      const gs = useGameStore.getState();
      if (!auth.user || !auth.access_token) return;
      if (gs.showSplash) return;
      const save = useSaveStore.getState();
      const payload = {
        version: SAVE_VERSION,
        revision: save.revision ?? 0,
        data: serialize(gs),
      };
      try {
        fetch(`${API_BASE}/saves`, {
          method: 'POST',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.access_token}`,
          },
          body: JSON.stringify(payload),
        });
      } catch {
        // best-effort
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [userId]);
}
