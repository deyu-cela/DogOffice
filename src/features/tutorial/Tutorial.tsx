import { useGameStore } from '@/store/gameStore';
import { TUTORIAL_STEPS } from '@/constants/questions';

export function Tutorial() {
  const step = useGameStore((s) => s.tutorialStep);
  const advance = useGameStore((s) => s.advanceTutorial);
  const skip = useGameStore((s) => s.skipTutorial);

  if (step <= 0 || step > TUTORIAL_STEPS.length) return null;
  const current = TUTORIAL_STEPS[step - 1];
  const total = TUTORIAL_STEPS.length;
  const isLast = step === total;

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="p-7 rounded-3xl max-w-md w-full text-center"
        style={{
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid rgba(90,70,54,0.12)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          animation: 'fadeInUp 0.3s ease',
        }}
      >
        <div
          className="mx-auto mb-3 flex items-center justify-center rounded-full"
          style={{
            width: 96,
            height: 96,
            fontSize: 56,
            background: 'linear-gradient(180deg, #fff7dd, #ffe8bf)',
            border: '3px solid rgba(255,179,71,0.4)',
            boxShadow: '0 6px 16px rgba(255,179,71,0.25)',
            animation: 'bob 1.8s ease-in-out infinite',
          }}
        >
          {current.dog}
        </div>
        <div className="text-2xl font-extrabold mb-3">{current.title}</div>
        <div
          className="p-4 rounded-2xl text-base leading-relaxed mb-4 text-left"
          style={{ background: 'rgba(255,255,255,.7)', border: '1px solid rgba(90,70,54,0.1)', color: 'var(--text)' }}
          dangerouslySetInnerHTML={{
            __html: current.text + (current.tip
              ? `<div style="margin-top:10px;padding:8px 12px;border-radius:12px;background:rgba(255,179,71,0.12);border:1px solid rgba(255,179,71,0.3);font-size:13px;color:#a66826">${current.tip}</div>`
              : ''),
          }}
        />
        <div className="flex gap-1.5 justify-center mb-4">
          {Array.from({ length: total }, (_, i) => {
            const done = i < step - 1;
            const active = i === step - 1;
            return (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: active ? 24 : 10,
                  height: 10,
                  background: done ? '#ffb347' : active ? '#ff9f43' : '#e8dcc9',
                  transition: 'all 0.3s ease',
                }}
              />
            );
          })}
        </div>
        <div className="flex gap-2.5 justify-center items-center">
          {!isLast && (
            <button
              onClick={skip}
              className="text-sm"
              style={{ background: 'transparent', color: 'var(--muted)', boxShadow: 'none', textDecoration: 'underline' }}
            >
              跳過教學
            </button>
          )}
          <button
            onClick={advance}
            className="px-7"
            style={{ background: 'linear-gradient(180deg, #ffcf6b, #ff9f43)', color: 'white' }}
          >
            {isLast ? '開始經營！🚀' : '下一步 →'}
          </button>
        </div>
      </div>
    </div>
  );
}
