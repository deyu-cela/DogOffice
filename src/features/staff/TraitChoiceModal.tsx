import { useGameStore } from '@/store/gameStore';
import { DOG_TRAITS_MAP, type DogTraitId } from '@/constants/dogTraits';

export function TraitChoiceModal() {
  const modal = useGameStore((s) => s.traitChoiceModal);
  const staff = useGameStore((s) => s.staff);
  const choose = useGameStore((s) => s.chooseTrait);
  const close = useGameStore((s) => s.closeTraitChoiceModal);

  if (!modal) return null;
  const dog = staff.find((d) => d.id === modal.dogId);
  if (!dog || !dog.pendingTraitChoice) return null;

  const choices = dog.pendingTraitChoice.choices as DogTraitId[];
  const roundsLeft = dog.pendingTraitChoice.roundsLeft ?? 1;

  return (
    <div className="fixed inset-0 z-[850] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="p-5 rounded-3xl max-w-sm w-full"
        style={{
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid #c9a064',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎓</span>
          <span className="text-base font-extrabold">挑一項特性</span>
          {roundsLeft > 1 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
              style={{ background: '#c9a064', color: 'white' }}
            >
              還有 {roundsLeft - 1} 輪
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-2.5 p-2.5 rounded-xl mb-3"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(90,70,54,0.12)' }}
        >
          <div
            className="rounded-full overflow-hidden flex-shrink-0"
            style={{ width: 40, height: 40, border: '2px solid white' }}
          >
            {dog.image ? (
              <img src={dog.image} alt={dog.role} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xl"
                style={{ background: '#fff0d9' }}
              >
                {dog.emoji}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold">
              {dog.name}
              <span
                className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: '#f4a8b8', color: 'white' }}
              >
                {dog.grade}
              </span>
            </div>
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
              {dog.role}・已習得 {(dog.learnedTraits ?? []).length} 項特性
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-2">
          {choices.map((id) => {
            const def = DOG_TRAITS_MAP[id];
            if (!def) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => choose(dog.id, id)}
                className="p-3 rounded-xl text-left"
                style={{
                  background: 'linear-gradient(180deg, #fff5d9, #ffe9b3)',
                  border: '1.5px solid #e0c98a',
                }}
              >
                <div className="text-sm font-bold mb-0.5">
                  {def.emoji} {def.name}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  {def.desc}
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={close}
          className="w-full py-1.5 rounded-full text-xs"
          style={{ background: '#eeeae4', color: 'var(--muted)' }}
        >
          稍後再決定
        </button>
      </div>
    </div>
  );
}
