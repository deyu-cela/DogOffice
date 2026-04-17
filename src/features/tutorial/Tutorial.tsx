import { useGameStore } from '@/store/gameStore';
import { TUTORIAL_STEPS } from '@/constants/questions';

export function Tutorial() {
  const step = useGameStore((s) => s.tutorialStep);
  const advance = useGameStore((s) => s.advanceTutorial);
  const skip = useGameStore((s) => s.skipTutorial);

  if (step <= 0 || step > TUTORIAL_STEPS.length) return null;
  const current = TUTORIAL_STEPS[step - 1];

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="p-7 rounded-3xl max-w-md mx-4"
        style={{
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid rgba(90,70,54,0.12)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div className="text-2xl font-extrabold mb-3">{current.title}</div>
        <div className="text-base leading-relaxed mb-6" style={{ color: '#5b3c2b' }}>
          {current.body}
        </div>
        <div className="flex justify-between items-center">
          <button onClick={skip} className="text-sm underline" style={{ color: 'var(--muted)', boxShadow: 'none' }}>
            跳過教學
          </button>
          <button
            onClick={advance}
            className="px-6"
            style={{ background: 'linear-gradient(180deg, #ffcf6b, #ff9f43)', color: 'white' }}
          >
            {step === TUTORIAL_STEPS.length ? '開始！' : '下一步'}
          </button>
        </div>
        <div className="mt-4 text-center text-xs" style={{ color: 'var(--muted)' }}>
          {step} / {TUTORIAL_STEPS.length}
        </div>
      </div>
    </div>
  );
}
