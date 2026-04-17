import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export function FrisbeeGame() {
  const mg = useGameStore((s) => s.miniGame);
  const setDir = useGameStore((s) => s.setFrisbeeDir);
  const finish = useGameStore((s) => s.finishFrisbee);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') setDir(-1);
      if (e.key === 'ArrowRight' || e.key === 'd') setDir(1);
    };
    const onUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) setDir(0);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [setDir]);

  if (!mg || mg.type !== 'frisbee') return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/40 p-4">
      <div className="rounded-3xl p-5 w-[520px] max-w-full" style={{ background: '#fffaf0', border: '2px solid rgba(90,70,54,0.12)' }}>
        <div className="flex justify-between items-center mb-3">
          <div className="font-extrabold">🥏 接飛盤遊戲</div>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            時間 {mg.timeLeft.toFixed(1)}s ・ 分數 {mg.score}
          </div>
        </div>
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            height: 360,
            background: 'linear-gradient(180deg, #cce7ff 0%, #b8ddff 50%, #8bc34a 50%, #7cb342 100%)',
          }}
        >
          {mg.treats.map((t) => (
            <div key={t.id} className="absolute text-3xl" style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}>
              {t.emoji}
            </div>
          ))}
          <div
            className="absolute text-4xl"
            style={{ left: `${mg.dogX}%`, bottom: 20, transform: 'translateX(-50%)' }}
          >
            🐕
          </div>
        </div>
        <div className="flex justify-between gap-2 mt-3">
          <button
            onMouseDown={() => setDir(-1)}
            onMouseUp={() => setDir(0)}
            onMouseLeave={() => setDir(0)}
            onTouchStart={() => setDir(-1)}
            onTouchEnd={() => setDir(0)}
            style={{ background: '#dcecff', flex: 1 }}
          >
            ← 左
          </button>
          <button onClick={() => finish(true)} style={{ background: '#ffdba5', flex: 1 }}>
            提早結束
          </button>
          <button
            onMouseDown={() => setDir(1)}
            onMouseUp={() => setDir(0)}
            onMouseLeave={() => setDir(0)}
            onTouchStart={() => setDir(1)}
            onTouchEnd={() => setDir(0)}
            style={{ background: '#dcecff', flex: 1 }}
          >
            右 →
          </button>
        </div>
        <div className="text-center text-xs mt-2" style={{ color: 'var(--muted)' }}>
          用 ← → 或 A/D 移動狗狗，接到零食得分
        </div>
      </div>
    </div>
  );
}
