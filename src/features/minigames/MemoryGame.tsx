import { SvgIcon } from '@/components/SvgIcon';
import { useGameStore } from '@/store/gameStore';

export function MemoryGame() {
  const mg = useGameStore((s) => s.miniGame);
  const flip = useGameStore((s) => s.flipMemoryCard);
  const finish = useGameStore((s) => s.finishMemory);

  if (!mg || mg.type !== 'memory') return null;

  return (
    <div className="fixed inset-0 z-[850] flex items-center justify-center bg-[#08204d]/45 backdrop-blur-sm p-4">
      <div className="rounded-xl p-5 w-[520px] max-w-full" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))', border: '1px solid var(--line)', boxShadow: '0 24px 70px rgba(30,90,180,0.28)' }}>
        <div className="flex justify-between items-center mb-3">
          <div className="font-extrabold flex items-center gap-1.5"><SvgIcon name="training" size={21} />翻牌記憶遊戲</div>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            時間 {mg.timeLeft.toFixed(1)}s ・ 配對 {mg.matches}/8 ・ 步數 {mg.moves}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {mg.cards.map((c) => (
            <button
              key={c.id}
              onClick={() => flip(c.id)}
              className="aspect-square rounded-lg flex items-center justify-center"
              style={{
                background: c.matched ? '#eefaf7' : c.flipped ? '#ffffff' : 'linear-gradient(180deg, #2f8df4, #1c63c8)',
                color: c.matched || c.flipped ? 'var(--blue)' : 'white',
                border: '1px solid var(--line)',
                opacity: c.matched ? 0.68 : 1,
                cursor: c.matched ? 'default' : 'pointer',
              }}
            >
              {c.flipped || c.matched ? <SvgIcon name="appDog" size={32} /> : <SvgIcon name="gem" size={30} />}
            </button>
          ))}
        </div>
        <button onClick={() => finish()} className="w-full mt-3 rounded-lg font-bold" style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}>
          提早結束
        </button>
      </div>
    </div>
  );
}
