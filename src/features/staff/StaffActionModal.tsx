import { DogAvatar } from '@/components/DogAvatar';
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
    <div className="fixed inset-0 z-[850] flex items-center justify-center bg-[#08204d]/45 backdrop-blur-sm p-4" onClick={close}>
      <div
        className="p-5 rounded-xl max-w-lg w-full"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full overflow-hidden flex items-center justify-center" style={{ width: 64, height: 64, border: '2px solid white', background: '#eef6ff' }}>
            <DogAvatar role={dog.role} breed={dog.breed} size={64} />
          </div>
          <div>
            <div className="text-lg font-extrabold">{dog.name}</div>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              {dog.breed}・{dog.role}・{dog.grade}級
            </div>
          </div>
        </div>

        <div className="text-sm mb-3 p-3 rounded-lg" style={{ color: 'var(--muted)', background: '#f7fbff', border: '1px solid var(--line)' }}>
          {dog.motto}
        </div>

        {dog.status !== 'pip' ? (
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={close} className="rounded-lg font-bold" style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}>
              關閉
            </button>
            <button onClick={() => startPip(idx)} className="rounded-lg font-bold" style={{ background: 'linear-gradient(180deg, #fff7f7, #ffecec)', color: '#d34a4a', border: '1px solid rgba(255,112,112,0.24)' }}>
              進入 PIP
            </button>
          </div>
        ) : (
          <div>
            <div className="text-sm font-bold mb-2">PIP 任務（{dog.pipDaysLeft} 天剩餘）</div>
            <div className="flex flex-col gap-2 mb-3">
              {dog.pipTasks?.map((task, ti) => (
                <label key={ti} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#ffffff', border: '1px solid var(--line)' }}>
                  <input type="checkbox" checked={task.done} onChange={() => togglePipTask(idx, ti)} className="w-4 h-4" />
                  <span className={`text-sm ${task.done ? 'line-through opacity-60' : ''}`}>{task.text}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button onClick={close} className="rounded-lg font-bold" style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}>
                關閉
              </button>
              <button onClick={() => keep(idx)} className="rounded-lg font-bold" style={{ background: 'linear-gradient(180deg, #35c59c, #16a77f)', color: 'white' }}>
                留任
              </button>
              <button onClick={() => fire(idx)} className="rounded-lg font-bold" style={{ background: 'linear-gradient(180deg, #ff8d8d, #e24c4c)', color: 'white' }}>
                資遣 ${dog.severance}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
