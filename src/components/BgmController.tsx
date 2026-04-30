import { useEffect, useRef } from 'react';
import { useBgmStore } from '@/store/bgmStore';

export type BgmScene = 'splash' | 'office' | 'memories';

const TRACKS: Record<BgmScene, string> = {
  splash: 'Sunny_Stroll_in_the_Garden.mp3',
  office: 'Afternoon_in_the_Tall_Grass.mp3',
  memories: 'Paws_in_the_Clover.mp3',
};

const FADE_MS = 600;
const TARGET_VOLUME = 0.4;
const BASE = import.meta.env.BASE_URL;

export function BgmController({ scene }: { scene: BgmScene }) {
  const muted = useBgmStore((s) => s.muted);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIdRef = useRef(0);
  const sceneRef = useRef<BgmScene | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'metadata';
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || sceneRef.current === scene) return;

    const fadeId = ++fadeIdRef.current;
    const wasPlaying = sceneRef.current !== null;
    sceneRef.current = scene;

    (async () => {
      if (wasPlaying) {
        await fadeVolume(audio, audio.volume, 0, FADE_MS, fadeId, fadeIdRef);
        if (fadeIdRef.current !== fadeId) return;
        audio.pause();
      }
      audio.src = `${BASE}assets/bgm/${TRACKS[scene]}`;
      audio.volume = 0;
      try {
        await audio.play();
      } catch {
        return;
      }
      if (fadeIdRef.current !== fadeId) return;
      fadeVolume(audio, 0, TARGET_VOLUME, FADE_MS, fadeId, fadeIdRef);
    })();
  }, [scene]);

  useEffect(() => {
    function unlock() {
      const audio = audioRef.current;
      if (!audio || !audio.paused || !audio.src) return;
      audio
        .play()
        .then(() => {
          document.removeEventListener('click', unlock);
          document.removeEventListener('keydown', unlock);
          fadeIn(audio, fadeIdRef);
        })
        .catch(() => {});
    }
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, []);

  return null;
}

function fadeIn(audio: HTMLAudioElement, fadeIdRef: React.MutableRefObject<number>) {
  const fadeId = ++fadeIdRef.current;
  fadeVolume(audio, audio.volume, TARGET_VOLUME, FADE_MS, fadeId, fadeIdRef);
}

function fadeVolume(
  audio: HTMLAudioElement,
  from: number,
  to: number,
  durationMs: number,
  fadeId: number,
  fadeIdRef: React.MutableRefObject<number>,
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    function step(now: number) {
      if (fadeIdRef.current !== fadeId) {
        resolve();
        return;
      }
      const t = Math.min(1, (now - start) / durationMs);
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * t));
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}
