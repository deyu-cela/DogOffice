import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';

export function VictoryModal() {
  const victoryAt = useGameStore((s) => s.victoryAt);
  const victoryDismissed = useGameStore((s) => s.victoryDismissed);
  const money = useGameStore((s) => s.money);
  const moneyGoal = useGameStore((s) => s.moneyGoal);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const staff = useGameStore((s) => s.staff);
  const dismissVictory = useGameStore((s) => s.dismissVictory);
  const restart = useGameStore((s) => s.restart);

  if (victoryAt === null || victoryDismissed) return null;

  const levelName = OFFICE_LEVELS[officeLevel]?.name ?? `Lv${officeLevel}`;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="p-7 rounded-3xl max-w-md w-full text-center"
        style={{
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid #ffcf6b',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        <div className="text-5xl mb-3">🏆</div>
        <div className="text-2xl font-extrabold mb-2" style={{ color: '#b47020' }}>
          達成資金目標！
        </div>
        <div className="text-sm mb-5" style={{ color: '#7a685a' }}>
          恭喜你帶領狗狗公司衝到 ${moneyGoal.toLocaleString()}
        </div>

        <div
          className="grid grid-cols-2 gap-3 mb-5 p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(90,70,54,0.1)' }}
        >
          <div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              達標用時
            </div>
            <div className="text-2xl font-extrabold" style={{ color: '#3d2f25' }}>
              {victoryAt} <span className="text-sm font-normal">天</span>
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              最終資金
            </div>
            <div className="text-2xl font-extrabold" style={{ color: '#3a8a3a' }}>
              ${money.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              辦公室
            </div>
            <div className="text-base font-bold" style={{ color: '#3d2f25' }}>
              {levelName}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              員工數
            </div>
            <div className="text-base font-bold" style={{ color: '#3d2f25' }}>
              {staff.length} 隻狗
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={dismissVictory}
            className="py-2.5 rounded-full font-extrabold text-sm"
            style={{ background: 'linear-gradient(180deg, #b6efab, #8ee28f)', color: '#1e5a29' }}
          >
            繼續經營
          </button>
          <button
            type="button"
            onClick={restart}
            className="py-2.5 rounded-full font-extrabold text-sm"
            style={{ background: 'linear-gradient(180deg, #ffcf6b, #ff9f43)', color: 'white' }}
          >
            再開一局
          </button>
        </div>
      </div>
    </div>
  );
}
