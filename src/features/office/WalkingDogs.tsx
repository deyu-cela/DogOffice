import { useGameStore } from '@/store/gameStore';
import { useWalkerStore } from '@/store/walkerStore';
import { ROLE_IMAGE_MAP } from '@/constants/dogRoles';

export function WalkingDogs() {
  const walkers = useWalkerStore((s) => s.walkers);
  const morale = useGameStore((s) => s.morale);
  const health = useGameStore((s) => s.health);

  const low = morale < 40 || health < 35;
  const busy = morale >= 60 && health >= 55;
  const statusEmoji = low ? '💤' : busy ? '✨' : health < 45 ? '😵' : '';

  return (
    <div className="absolute inset-0 pointer-events-none">
      {walkers.map((w) => {
        const image = w.dogData.image || ROLE_IMAGE_MAP[w.dogData.role];
        const walking = w.idleTimer <= 0;
        return (
          <div
            key={w.id}
            className="absolute flex flex-col items-center"
            style={{
              left: w.x,
              top: w.y,
              transform: w.facingRight ? '' : 'scaleX(-1)',
              animation: walking ? 'bob 0.6s ease-in-out infinite' : 'none',
              transition: 'top 0.3s ease',
            }}
          >
            {image ? (
              <div
                className="rounded-full overflow-hidden"
                style={{ width: 44, height: 44, border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.12)' }}
              >
                <img src={image} alt={w.dogData.role} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="text-3xl">{w.dogData.emoji}</div>
            )}
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5"
              style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--text)', transform: w.facingRight ? '' : 'scaleX(-1)' }}
            >
              {w.dogData.name}
            </span>
            {statusEmoji && (
              <span className="text-sm absolute -top-3 -right-3" style={{ transform: w.facingRight ? '' : 'scaleX(-1)' }}>
                {statusEmoji}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
