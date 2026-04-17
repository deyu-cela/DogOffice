import { useGameStore } from '@/store/gameStore';
import { RadarChart } from '@/components/RadarChart';

export function StaffList() {
  const staff = useGameStore((s) => s.staff);
  const openAction = useGameStore((s) => s.openStaffAction);

  if (staff.length === 0) {
    return (
      <div className="text-center p-4 text-sm" style={{ color: 'var(--muted)' }}>
        還沒有員工，先去招聘吧。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {staff.map((dog, i) => (
        <div
          key={`${dog.name}-${i}`}
          className="p-3 rounded-2xl cursor-pointer"
          style={{
            background: dog.status === 'pip' ? 'rgba(255,230,200,0.6)' : 'rgba(255,255,255,0.9)',
            border: dog.status === 'pip' ? '2px solid #ff9f43' : '1px solid rgba(90,70,54,0.12)',
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
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#ffb347', color: 'white' }}>
                  {dog.grade}
                </span>
                {dog.status === 'pip' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#ffe0b2', color: '#e65100' }}>
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
