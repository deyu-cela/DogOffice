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
  const [awaitingGesture, setAwaitingGesture] = useState(false);
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

      let advanceTimer: ReturnType<typeof setTimeout> | undefined;
      audio
        .play()
        .then(() => {
          advanceTimer = setTimeout(() => setPhase('hold'), 0);
        })
        .catch(() => {
          setAwaitingGesture(true);
        });

      return () => {
        if (advanceTimer !== undefined) clearTimeout(advanceTimer);
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

  function handleClick() {
    if (phase === 'in' && awaitingGesture) {
      audioRef.current?.play().catch(() => {});
      setAwaitingGesture(false);
      setPhase('hold');
      return;
    }
    if (phase !== 'in') {
      finish();
    }
  }

  return (
    <div
      onClick={handleClick}
      className="fixed inset-0 z-[2000] flex items-center justify-center cursor-pointer pointer-events-auto"
      style={{
        background: '#ffffff',
        opacity: phase === 'out' ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <style>{`
        @keyframes studio-intro-wiggle {
          0%   { transform: rotate(0deg) scale(1); }
          8%   { transform: rotate(-5deg) scale(1.06); }
          20%  { transform: rotate(5deg) scale(1.04); }
          34%  { transform: rotate(-3deg) scale(1.03); }
          50%  { transform: rotate(2deg) scale(1.02); }
          66%  { transform: rotate(-1.5deg) scale(1.01); }
          82%  { transform: rotate(0.7deg) scale(1.005); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes studio-intro-hint-pulse {
          0%, 100% { opacity: 0.45; }
          50%      { opacity: 0.85; }
        }
      `}</style>
      <img
        src={`${BASE}assets/studio-logo.png`}
        alt="畫小餅 Studio"
        className="select-none pointer-events-none"
        style={{
          width: 'min(520px, 64vw)',
          height: 'auto',
          opacity: phase === 'hold' ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
          animation:
            phase === 'hold'
              ? `studio-intro-wiggle 700ms ease-out ${FADE_MS}ms 1 both`
              : undefined,
          transformOrigin: 'center',
        }}
        draggable={false}
      />
      {awaitingGesture && phase === 'in' && (
        <div
          className="absolute select-none pointer-events-none text-sm font-bold"
          style={{
            bottom: '14%',
            color: '#5979a6',
            letterSpacing: '0.08em',
            animation: 'studio-intro-hint-pulse 1.4s ease-in-out infinite',
          }}
        >
          點任何處啟動 ▶
        </div>
      )}
    </div>
  );
}
