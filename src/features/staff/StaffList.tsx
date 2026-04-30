import { useState } from 'react';
import { useGameStore, dogLevelUpCost, dogLevelUpFragmentCost, DOG_LEVEL_MAX, dogPrimaryIndustry } from '@/store/gameStore';
import { RadarChart } from '@/components/RadarChart';
import { DOG_TRAITS_MAP, type DogTraitId } from '@/constants/dogTraits';
import type { Dog, ProjectCategory } from '@/types';
import { DogAvatar } from '@/components/DogAvatar';
import { TeamEditModal } from './TeamEditModal';

const INDUSTRY_LABEL: Record<ProjectCategory, string> = {
  tech: '工程', design: '美術', marketing: '行銷', service: '客服',
};
const INDUSTRY_COLOR: Record<ProjectCategory, string> = {
  tech: '#5a8ce6', design: '#e88aaa', marketing: '#e8a85a', service: '#5fb38f',
};
const TRAIT_UNLOCK_LEVELS = new Set([3, 6, 9]);


export function StaffList() {
  const staff = useGameStore((s) => s.staff);
  const money = useGameStore((s) => s.money);
  const clients = useGameStore((s) => s.clients);
  const openAction = useGameStore((s) => s.openStaffAction);
  const playMini = useGameStore((s) => s.openPlayMiniGame);
  const openTraining = useGameStore((s) => s.openTraining);
  const openTraitChoice = useGameStore((s) => s.openTraitChoiceModal);
  const upgradeDog = useGameStore((s) => s.upgradeDogLevel);
  const upgradeDogFragments = useGameStore((s) => s.upgradeDogWithFragments);
  const [teamModalOpen, setTeamModalOpen] = useState(false);

  if (staff.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-center p-4 text-sm" style={{ color: 'var(--muted)' }}>
          還沒有員工，去抽卡招募吧。
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setTeamModalOpen(true)}
        className="rounded-xl py-2.5 font-extrabold"
        style={{
          background: 'linear-gradient(180deg, #ffffff, #eef6ff)',
          color: '#446da8',
          border: '1.5px solid #7fb2ef',
          boxShadow: '0 4px 10px rgba(127,178,239,0.2)',
        }}
      >
        🐾 管理隊伍
      </button>
      {teamModalOpen && <TeamEditModal onClose={() => setTeamModalOpen(false)} />}

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
                {dog.image ? (
                  <img
                    src={dog.image}
                    alt={`${dog.breed} ${dog.role}`}
                    className="block h-full w-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <DogAvatar role={dog.role} breed={dog.breed} size={48} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold">{dog.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'linear-gradient(180deg, #ffd95a, #f0a818)', color: '#6a3d05', border: '1px solid rgba(176,107,15,0.4)' }}>
                    Lv.{dog.level}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-md"
                    style={{
                      background: INDUSTRY_COLOR[dogPrimaryIndustry(dog.role)],
                      color: 'white',
                    }}
                  >
                    {INDUSTRY_LABEL[dogPrimaryIndustry(dog.role)]}
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


            {/* 強化（Lv 3/6/9 解鎖特性）：兩種升級方式並列 */}
            {dog.level < DOG_LEVEL_MAX && (() => {
              const cost = dogLevelUpCost(dog.level);
              const fragNeed = dogLevelUpFragmentCost(dog.level);
              const nextLevel = dog.level + 1;
              const unlocksTrait = TRAIT_UNLOCK_LEVELS.has(nextLevel);
              const moneyOK = money >= cost;
              const fragOK = dog.fragments >= fragNeed;
              return (
                <div className="mt-2 flex flex-col gap-1.5">
                  {unlocksTrait && (
                    <div className="text-[10px] text-center font-extrabold" style={{ color: '#c0610a' }}>
                      ✦ 升 Lv.{nextLevel} 解鎖新特性
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); upgradeDog(dog.id); }}
                      disabled={!moneyOK}
                      className="py-1.5 rounded-full font-bold text-[11px]"
                      style={{
                        background: moneyOK
                          ? 'linear-gradient(180deg, #ffd95a, #f0a818)'
                          : '#e9f1ff',
                        color: moneyOK ? '#6a3d05' : '#8aa2c8',
                        border: '1px solid rgba(176,107,15,0.4)',
                        cursor: moneyOK ? 'pointer' : 'not-allowed',
                      }}
                      title={moneyOK ? `花 $${cost} 升級` : `需要 $${cost}`}
                    >
                      ${cost}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); upgradeDogFragments(dog.id); }}
                      disabled={!fragOK}
                      className="py-1.5 rounded-full font-bold text-[11px]"
                      style={{
                        background: fragOK
                          ? 'linear-gradient(180deg, #c9e4ff, #6da8e8)'
                          : '#e9f1ff',
                        color: fragOK ? '#1c4f8a' : '#8aa2c8',
                        border: '1px solid #5fa0e8',
                        cursor: fragOK ? 'pointer' : 'not-allowed',
                      }}
                      title={fragOK ? `用 ${fragNeed} 碎片升級（剩 ${dog.fragments - fragNeed}）` : `碎片不足（${dog.fragments}/${fragNeed}）`}
                    >
                      碎片 {dog.fragments}/{fragNeed}
                    </button>
                  </div>
                </div>
              );
            })()}
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
