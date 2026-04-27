import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
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
    <div className="fixed inset-0 z-[850] flex items-center justify-center bg-[#08204d]/45 backdrop-blur-sm p-4">
      <div className="rounded-xl p-5 w-[520px] max-w-full" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))', border: '1px solid var(--line)', boxShadow: '0 24px 70px rgba(30,90,180,0.28)' }}>
        <div className="flex justify-between items-center mb-3">
          <div className="font-extrabold flex items-center gap-1.5"><SvgIcon name="training" size={21} />接飛盤遊戲</div>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>時間 {mg.timeLeft.toFixed(1)}s ・ 分數 {mg.score}</div>
        </div>
        <div className="relative rounded-xl overflow-hidden" style={{ height: 360, background: 'linear-gradient(180deg, #cfe9ff 0%, #eaf7ff 54%, #dff8ef 54%, #c8f0df 100%)', border: '1px solid var(--line)' }}>
          {mg.treats.map((t) => (
            <div key={t.id} className="absolute" style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}>
              <SvgIcon name={t.pts >= 3 ? 'gem' : 'money'} size={28} />
            </div>
          ))}
          <div className="absolute" style={{ left: `${mg.dogX}%`, bottom: 20, transform: 'translateX(-50%)' }}>
            <SvgIcon name="appDog" size={42} />
          </div>
        </div>
        <div className="flex justify-between gap-2 mt-3">
          <MoveButton onDown={() => setDir(-1)} onUp={() => setDir(0)}>← 左</MoveButton>
          <button onClick={() => finish(true)} className="rounded-lg font-bold" style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)', flex: 1 }}>提早結束</button>
          <MoveButton onDown={() => setDir(1)} onUp={() => setDir(0)}>右 →</MoveButton>
        </div>
        <div className="text-center text-xs mt-2" style={{ color: 'var(--muted)' }}>用 ← → 或 A/D 移動狗狗，接到零食得分</div>
      </div>
    </div>
  );
}

function MoveButton({ children, onDown, onUp }: { children: ReactNode; onDown: () => void; onUp: () => void }) {
  return (
    <button
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={onDown}
      onTouchEnd={onUp}
      className="rounded-lg font-bold"
      style={{ background: 'linear-gradient(180deg, #ffffff, #edf5ff)', color: 'var(--blue)', border: '1px solid var(--line)', flex: 1 }}
    >
      {children}
    </button>
  );
}
