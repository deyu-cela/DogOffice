import { useGameStore } from '@/store/gameStore';

export function StaffActionModal() {
  const modal = useGameStore((s) => s.staffActionModal);
  const staff = useGameStore((s) => s.staff);
  const close = useGameStore((s) => s.closeStaffAction);
  const startPip = useGameStore((s) => s.startPip);
  const togglePipTask = useGameStore((s) => s.togglePipTask);
  const keep = useGameStore((s) => s.keepStaff);
  const fire = useGameStore((s) => s.fireStaff);

  if (!modal) return null;
  const dog = staff[modal.staffIndex];
  if (!dog) return null;
  const idx = modal.staffIndex;

  return (
    <div className="fixed inset-0 z-[850] flex items-center justify-center bg-black/40 p-4" onClick={close}>
      <div
        className="p-5 rounded-3xl max-w-lg w-full"
        style={{ background: '#fffaf0', border: '2px solid rgba(90,70,54,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full overflow-hidden" style={{ width: 64, height: 64, border: '2px solid white' }}>
            {dog.image && <img src={dog.image} alt={dog.role} className="w-full h-full object-cover" />}
          </div>
          <div>
            <div className="text-lg font-extrabold">{dog.name}</div>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              {dog.breed}・{dog.role}・{dog.grade}級
            </div>
          </div>
        </div>

        <div className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
          💬 {dog.motto}
        </div>

        {dog.status !== 'pip' ? (
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={close} style={{ background: '#dcecff' }}>
              關閉
            </button>
            <button onClick={() => startPip(idx)} style={{ background: 'linear-gradient(180deg, #ffdba5, #ffbf73)' }}>
              ⚠️ 進入 PIP
            </button>
          </div>
        ) : (
          <div>
            <div className="text-sm font-bold mb-2">PIP 任務（{dog.pipDaysLeft} 天剩餘）</div>
            <div className="flex flex-col gap-2 mb-3">
              {dog.pipTasks?.map((task, ti) => (
                <label key={ti} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: 'white', border: '1px solid rgba(90,70,54,0.1)' }}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => togglePipTask(idx, ti)}
                    className="w-4 h-4"
                  />
                  <span className={`text-sm ${task.done ? 'line-through opacity-60' : ''}`}>{task.text}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button onClick={close} style={{ background: '#dcecff' }}>
                關閉
              </button>
              <button onClick={() => keep(idx)} style={{ background: 'linear-gradient(180deg, #b6efab, #8ee28f)' }}>
                ✅ 留任
              </button>
              <button onClick={() => fire(idx)} style={{ background: 'linear-gradient(180deg, #ffb3b3, #ef5350)', color: 'white' }}>
                資遣 ${dog.severance}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
