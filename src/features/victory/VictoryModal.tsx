import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';

export function VictoryModal() {
  const ipoAchievedAt = useGameStore((s) => s.ipoAchievedAt);
  const ipoDismissed = useGameStore((s) => s.ipoDismissed);
  const money = useGameStore((s) => s.money);
  const reputation = useGameStore((s) => s.reputation);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);
  const staff = useGameStore((s) => s.staff);
  const dismissIpo = useGameStore((s) => s.dismissIpo);
  const restart = useGameStore((s) => s.restart);

  if (ipoAchievedAt === null || ipoDismissed) return null;

  const levelName = OFFICE_LEVELS[officeLevel]?.name ?? `Lv${officeLevel + 1}`;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="p-7 rounded-3xl max-w-md w-full text-center"
        style={{
          background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
          border: '2px solid #ffc7d1',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        <div className="text-6xl mb-3">🔔🐕💼</div>
        <div className="text-2xl font-extrabold mb-2" style={{ color: '#b47020' }}>
          公司 IPO 上市了！
        </div>
        <div className="text-sm mb-5" style={{ color: '#7a685a' }}>
          狗狗們敲響了上市鐘，全公司沸騰！
        </div>

        <div
          className="grid grid-cols-2 gap-3 mb-5 p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(90,70,54,0.1)' }}
        >
          <div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>達成天數</div>
            <div className="text-2xl font-extrabold" style={{ color: '#3d2f25' }}>
              {ipoAchievedAt} <span className="text-sm font-normal">天</span>
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>最終資金</div>
            <div className="text-2xl font-extrabold" style={{ color: '#3a8a3a' }}>
              ${money.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>最終信譽</div>
            <div className="text-base font-bold" style={{ color: '#3d2f25' }}>
              {Math.round(reputation)} / 100
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>完成案件</div>
            <div className="text-base font-bold" style={{ color: '#3d2f25' }}>
              {projectsCompleted} 件
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>辦公室</div>
            <div className="text-base font-bold" style={{ color: '#3d2f25' }}>
              {levelName}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>員工數</div>
            <div className="text-base font-bold" style={{ color: '#3d2f25' }}>
              {staff.length} 隻狗
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={dismissIpo}
            className="py-2.5 rounded-full font-extrabold text-sm"
            style={{ background: 'linear-gradient(180deg, #b6efab, #8ee28f)', color: '#1e5a29' }}
          >
            繼續經營
          </button>
          <button
            type="button"
            onClick={restart}
            className="py-2.5 rounded-full font-extrabold text-sm"
            style={{ background: 'linear-gradient(180deg, #ffc7d1, #eb93a3)', color: 'white' }}
          >
            再開一局
          </button>
        </div>
      </div>
    </div>
  );
}
