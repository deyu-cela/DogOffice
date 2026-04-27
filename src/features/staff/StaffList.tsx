import { useGameStore } from '@/store/gameStore';
import { RadarChart } from '@/components/RadarChart';
import { DOG_TRAITS_MAP, type DogTraitId } from '@/constants/dogTraits';
import type { Dog } from '@/types';
import { DogAvatar } from '@/components/DogAvatar';

const EXP_THRESHOLDS: Record<Dog['grade'], number> = {
  D: 8,
  C: 25,
  B: 60,
  A: 130,
  S: 0,
};

export function StaffList() {
  const staff = useGameStore((s) => s.staff);
  const clients = useGameStore((s) => s.clients);
  const openAction = useGameStore((s) => s.openStaffAction);
  const playMini = useGameStore((s) => s.openPlayMiniGame);
  const openTraining = useGameStore((s) => s.openTraining);
  const openTraitChoice = useGameStore((s) => s.openTraitChoiceModal);

  if (staff.length === 0) {
    return (
      <div className="text-center p-4 text-sm" style={{ color: 'var(--muted)' }}>
        還沒有員工，先去招聘吧。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={staff.length < 3}
          onClick={playMini}
          className="py-2 rounded-full font-bold"
          style={{
            background: staff.length < 3 ? '#e9f1ff' : 'linear-gradient(180deg, #ffffff, #edf5ff)',
            fontSize: 13,
            color: staff.length < 3 ? '#999' : '#2b5a8a',
            cursor: staff.length < 3 ? 'not-allowed' : 'pointer',
          }}
          title={staff.length < 3 ? '需要至少 3 位員工' : '陪玩，花 $10。Crunch Sprint 模式：分數 → active 案 +分數×2 工作量'}
        >
          陪玩{staff.length < 3 ? `（需 ${3 - staff.length} 位員工）` : ''}
        </button>
        <button
          type="button"
          disabled={staff.length < 2}
          onClick={openTraining}
          className="py-2 rounded-full font-bold"
          style={{
            background: staff.length < 2 ? '#e9f1ff' : 'linear-gradient(180deg, #ffffff, #edf5ff)',
            fontSize: 13,
            color: staff.length < 2 ? '#999' : '#2b5a8a',
            cursor: staff.length < 2 ? 'not-allowed' : 'pointer',
          }}
          title={staff.length < 2 ? '需要至少 2 位員工' : '培訓問答，花 $18。答對 ≥ 4 題 → 可選 1 員工 +1 能力'}
        >
          培訓{staff.length < 2 ? `（需 ${2 - staff.length} 位員工）` : ''}
        </button>
      </div>

      {staff.map((dog, i) => {
        const project = dog.assignedProjectId
          ? clients.find((c) => c.id === dog.assignedProjectId)
          : null;
        const expGoal = EXP_THRESHOLDS[dog.grade];
        const expProgress = expGoal > 0 ? Math.min(100, (dog.experience / expGoal) * 100) : 100;

        return (
          <div
            key={dog.id}
            className="p-3 rounded-2xl cursor-pointer"
            style={{
              background: dog.status === 'pip' ? '#fff7f7' : '#ffffff',
              border: dog.status === 'pip' ? '1px solid rgba(255,112,112,0.24)' : '1px solid var(--line)',
            }}
            onClick={() => openAction(i)}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full overflow-hidden flex items-center justify-center" style={{ width: 48, height: 48, border: '2px solid white', background: '#eef6ff' }}>
                <DogAvatar role={dog.role} breed={dog.breed} size={48} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold">{dog.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'linear-gradient(180deg, #2f8df4, #1c63c8)', color: 'white' }}>
                    {dog.grade}
                  </span>
                  {dog.status === 'pip' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: '#fff0f0', color: '#d34a4a' }}>
                      PIP {dog.pipDaysLeft}天
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  {dog.role}・日薪 ${dog.expectedSalary}
                </div>
                {/* 指派 chip */}
                <div className="text-[11px] mt-0.5">
                  {project ? (
                    <span style={{ color: '#2b7abd' }}>{project.title}</span>
                  ) : (
                    <span style={{ color: 'var(--muted)' }}>待命中</span>
                  )}
                </div>
              </div>
              <div>
                <RadarChart stats={dog.stats} size={120} />
              </div>
            </div>

            {/* 三條進度：個人士氣 / 疲勞 / 忠誠 */}
            <div className="grid grid-cols-3 gap-1.5 mt-2 text-[10px]">
              <MeterMini label="士氣" value={dog.morale} color="#35c59c" />
              <MeterMini label="疲勞" value={dog.fatigue} color="#ffc35c" inverted />
              <MeterMini label="忠誠" value={dog.loyalty} color="#2f8df4" />
            </div>

            {/* 已習得特性徽章 */}
            {(dog.learnedTraits ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(dog.learnedTraits as DogTraitId[]).map((tid) => {
                  const def = DOG_TRAITS_MAP[tid];
                  if (!def) return null;
                  return (
                    <span
                      key={tid}
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: '#eef6ff',
                        border: '1px solid var(--line)',
                        color: 'var(--blue)',
                      }}
                      title={def.desc}
                    >
                      {def.name}
                    </span>
                  );
                })}
              </div>
            )}

            {/* 升級待選特性按鈕 */}
            {dog.pendingTraitChoice && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openTraitChoice(dog.id);
                }}
                className="w-full mt-2 py-1.5 rounded-full font-bold text-xs"
                style={{
                  background: 'linear-gradient(180deg, #ffffff, #edf5ff)',
                  border: '1px solid var(--line)',
                  color: 'var(--blue)',
                }}
              >
                升級待選特性
              </button>
            )}

            {/* 經驗條 */}
            {dog.grade !== 'S' && !dog.isCEO && (
              <div className="mt-1.5">
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span style={{ color: 'var(--muted)' }}>經驗</span>
                  <span style={{ color: 'var(--muted)' }}>
                    {dog.experience} / {expGoal}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#e4eefc' }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${expProgress}%`,
                      background: 'linear-gradient(90deg, #2f8df4, #20c7b3)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MeterMini({
  label,
  value,
  color,
  inverted = false,
}: {
  label: string;
  value: number;
  color: string;
  inverted?: boolean;
}) {
  const display = Math.round(value);
  const widthVal = inverted ? value : value;
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span style={{ color: 'var(--muted)' }}>{label}</span>
        <span style={{ color: 'var(--muted)' }}>{display}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#e4eefc' }}>
        <div
          className="h-full"
          style={{
            width: `${Math.max(0, Math.min(100, widthVal))}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}
