import { useGameStore } from '@/store/gameStore';

export function MemoryGame() {
  const mg = useGameStore((s) => s.miniGame);
  const flip = useGameStore((s) => s.flipMemoryCard);
  const finish = useGameStore((s) => s.finishMemory);

  if (!mg || mg.type !== 'memory') return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/40 p-4">
      <div className="rounded-3xl p-5 w-[520px] max-w-full" style={{ background: '#fffaf0', border: '2px solid rgba(90,70,54,0.12)' }}>
        <div className="flex justify-between items-center mb-3">
          <div className="font-extrabold">🎴 翻牌記憶遊戲</div>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            時間 {mg.timeLeft.toFixed(1)}s ・ 配對 {mg.matches}/8 ・ 步數 {mg.moves}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {mg.cards.map((c) => (
            <button
              key={c.id}
              onClick={() => flip(c.id)}
              className="aspect-square text-4xl rounded-2xl flex items-center justify-center"
              style={{
                background: c.matched ? '#c8e6c9' : c.flipped ? '#fff7e0' : 'linear-gradient(180deg, #ffcf6b, #ff9f43)',
                color: c.matched || c.flipped ? 'inherit' : 'white',
                opacity: c.matched ? 0.6 : 1,
                cursor: c.matched ? 'default' : 'pointer',
              }}
            >
              {c.flipped || c.matched ? c.emoji : '❓'}
            </button>
          ))}
        </div>
        <button onClick={() => finish()} className="w-full mt-3" style={{ background: '#ffdba5' }}>
          提早結束
        </button>
      </div>
    </div>
  );
}
