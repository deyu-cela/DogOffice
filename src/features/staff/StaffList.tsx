import { useGameStore } from '@/store/gameStore';
import { RadarChart } from '@/components/RadarChart';

export function StaffList() {
  const staff = useGameStore((s) => s.staff);
  const openAction = useGameStore((s) => s.openStaffAction);
  const playMini = useGameStore((s) => s.openPlayMiniGame);
  const openTraining = useGameStore((s) => s.openTraining);

  if (staff.length === 0) {
    return (
      <div className="text-center p-4 text-sm" style={{ color: 'var(--muted)' }}>
        還沒有員工，先去招聘吧。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 員工活動（陪玩 / 培訓）— 原本誤放在 HR drawer，改放這裡比較符合語意 */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={staff.length < 3}
          onClick={playMini}
          className="py-2 rounded-full font-bold"
          style={{
            background: staff.length < 3 ? '#eee' : 'linear-gradient(180deg, #dcecff, #c6deff)',
            fontSize: 13,
            color: staff.length < 3 ? '#999' : '#2b5a8a',
            cursor: staff.length < 3 ? 'not-allowed' : 'pointer',
          }}
          title={staff.length < 3 ? '需要至少 3 位員工' : '全員陪玩，花 $10'}
        >
          🎮 陪玩{staff.length < 3 ? `（需 ${3 - staff.length} 位員工）` : ''}
        </button>
        <button
          type="button"
          disabled={staff.length < 2}
          onClick={openTraining}
          className="py-2 rounded-full font-bold"
          style={{
            background: staff.length < 2 ? '#eee' : 'linear-gradient(180deg, #dcecff, #c6deff)',
            fontSize: 13,
            color: staff.length < 2 ? '#999' : '#2b5a8a',
            cursor: staff.length < 2 ? 'not-allowed' : 'pointer',
          }}
          title={staff.length < 2 ? '需要至少 2 位員工' : '培訓問答，花 $18'}
        >
          📚 培訓{staff.length < 2 ? `（需 ${2 - staff.length} 位員工）` : ''}
        </button>
      </div>

      {staff.map((dog, i) => (
        <div
          key={`${dog.name}-${i}`}
          className="p-3 rounded-2xl cursor-pointer"
          style={{
            background: dog.status === 'pip' ? 'rgba(255,230,200,0.6)' : 'rgba(255,255,255,0.9)',
            border: dog.status === 'pip' ? '2px solid #eb93a3' : '1px solid rgba(90,70,54,0.12)',
          }}
          onClick={() => openAction(i)}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full overflow-hidden" style={{ width: 48, height: 48, border: '2px solid white' }}>
              {dog.image ? (
                <img src={dog.image} alt={dog.role} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: '#fff0d9' }}>
                  {dog.emoji}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold">{dog.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#f4a8b8', color: 'white' }}>
                  {dog.grade}
                </span>
                {dog.status === 'pip' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#fbd5db', color: '#e65100' }}>
                    PIP {dog.pipDaysLeft}天
                  </span>
                )}
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                {dog.role}・日薪 ${dog.expectedSalary}
              </div>
            </div>
            <div>
              <RadarChart stats={dog.stats} size={120} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
