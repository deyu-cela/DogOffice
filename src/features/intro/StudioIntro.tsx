import { useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'dogoffice:studio-intro-played';
const FADE_MS = 400;
const HOLD_MS = 1200;
const SOUND_VOLUME = 0.5;
const BASE = import.meta.env.BASE_URL;

type Phase = 'in' | 'hold' | 'out' | 'done';

export function StudioIntro() {
  const [phase, setPhase] = useState<Phase>(() =>
    sessionStorage.getItem(SESSION_KEY) === '1' ? 'done' : 'in',
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function stopAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = '';
    audioRef.current = null;
  }

  function finish() {
    stopAudio();
    sessionStorage.setItem(SESSION_KEY, '1');
    setPhase('done');
  }

  useEffect(() => {
    if (phase === 'in') {
      const audio = new Audio(`${BASE}assets/studio-intro.mp3`);
      audio.volume = SOUND_VOLUME;
      audioRef.current = audio;
      audio.play().catch(() => {});
      const raf = requestAnimationFrame(() => setPhase('hold'));
      return () => {
        cancelAnimationFrame(raf);
        stopAudio();
      };
    }
    if (phase === 'hold') {
      const t = setTimeout(() => setPhase('out'), FADE_MS + HOLD_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'out') {
      const t = setTimeout(finish, FADE_MS);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      onClick={finish}
      className="fixed inset-0 z-[2000] flex items-center justify-center cursor-pointer pointer-events-auto"
      style={{
        background: '#ffffff',
        opacity: phase === 'out' ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <img
        src={`${BASE}assets/studio-logo.png`}
        alt="畫小餅 Studio"
        className="select-none pointer-events-none"
        style={{
          width: 'min(520px, 64vw)',
          height: 'auto',
          opacity: phase === 'hold' ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
        draggable={false}
      />
    </div>
  );
}
