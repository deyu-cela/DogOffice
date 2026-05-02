import { DogAvatar } from '@/components/DogAvatar';
import { SvgIcon } from '@/components/SvgIcon';
import { DOG_TRAITS_MAP, type DogTraitId } from '@/constants/dogTraits';
import { useGameStore } from '@/store/gameStore';
import './staff.css';

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
    <div className="staff-scrapbook-backdrop fixed inset-0 z-[880] flex items-center justify-center p-4">
      <div
        className="staff-scrapbook-modal p-5 max-w-sm w-full"
      >
        <div className="flex items-center gap-2 mb-2">
          <SvgIcon name="quality" size={25} />
          <span className="text-base font-extrabold">挑一項特性</span>
          {roundsLeft > 1 && (
            <span className="staff-chip-btn text-[10px] px-1.5 py-0.5 ml-auto">
              還有 {roundsLeft - 1} 輪
            </span>
          )}
        </div>

        <div className="staff-paper-card flex items-center gap-2.5 p-2.5 mb-3">
          <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: 40, height: 40, border: '2px solid white', background: '#eef6ff' }}>
            <DogAvatar role={dog.role} breed={dog.breed} size={40} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold">
              {dog.name}
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'linear-gradient(180deg, #2f8df4, #1c63c8)', color: 'white' }}>
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
                className="staff-paper-card p-3 text-left"
              >
                <div className="text-sm font-bold mb-0.5 flex items-center gap-1.5">
                  <SvgIcon name="quality" size={18} />
                  <span>{def.name}</span>
                </div>
                <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{def.desc}</div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={close}
          className="staff-soft-btn w-full py-1.5 text-xs font-bold"
        >
          稍後再決定
        </button>
      </div>
    </div>
  );
}
