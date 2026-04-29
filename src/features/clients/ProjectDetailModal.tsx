import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { ActiveSynergies, ChemistryCombo, Dog, ProjectCategory, ClientTier } from '@/types';
import { OFFER_TTL_DAYS } from '@/lib/projectGen';
import { estimateDailyContrib } from '@/lib/projectEngine';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import type { DogTraitId } from '@/constants/dogTraits';
import { DogAvatar } from '@/components/DogAvatar';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';

function findChemistries(dogs: Dog[], category: ProjectCategory): ChemistryCombo[] {
  if (dogs.length < 2) return [];
  const roles = new Set(dogs.map((d) => d.role));
  return CHEMISTRY_COMBOS.filter((combo) => {
    if (combo.category && combo.category !== 'any' && combo.category !== category) return false;
    return combo.roles.every((r) => roles.has(r));
  });
}

const ROLE_CATEGORY: Record<string, ProjectCategory[]> = {
  工程師: ['tech'], QA: ['tech'],
  美術: ['design'], 企劃: ['design', 'marketing'],
  業務: ['marketing', 'service'], 行銷: ['marketing'],
  客服: ['service'],
  PM: ['tech', 'design', 'marketing', 'service'],
  CEO: ['tech', 'design', 'marketing', 'service'],
};

// 該類別的「真專家」（單一對口）
function isSpecialistFor(role: string, category: ProjectCategory): boolean {
  const cats = ROLE_CATEGORY[role];
  return !!cats && cats.length === 1 && cats[0] === category;
}

// 員工對該案的「個體分數」：對口/魅力/品質/疲勞/士氣綜合
function dogScoreFor(dog: Dog, category: ProjectCategory): number {
  const matched = (dog as Dog & { role: string }).role;
  const cats = ROLE_CATEGORY[matched] ?? [];
  // 對口加分：真專家（1 對口）+15、半專家（2 對口）+12、通才 PM/CEO（4 對口）+10
  const specialistBonus = cats.length === 1 ? 5 : cats.length === 2 ? 2 : 0;
  const matchBonus = cats.includes(category) ? 10 + specialistBonus : 0;
  const fatiguePenalty = dog.fatigue / 10;
  // 士氣修正：< 30 扣分（0.7× 乘數）、≥ 80 加分（1.15× 乘數）
  const moraleAdj = dog.morale < 30 ? -3 : dog.morale >= 80 ? 3 : 0;
  // 主屬性權重：依 category 決定
  let mainWeight = 0;
  switch (category) {
    case 'tech': mainWeight = dog.stats.quality * 1.3 + dog.stats.speed * 1.2; break;
    case 'design': mainWeight = dog.stats.quality * 1.4 + dog.stats.charisma * 1.1; break;
    case 'marketing': mainWeight = dog.stats.charisma * 1.5 + dog.stats.speed * 1.1; break;
    case 'service': mainWeight = dog.stats.teamwork * 1.4 + dog.stats.quality * 1.1; break;
  }
  return mainWeight + matchBonus - fatiguePenalty + moraleAdj;
}

// 特性分：依案件類別、隊伍狀態給特性加分（部分特性「隊伍級」需要看已挑員工）
function traitScoreFor(dog: Dog, category: ProjectCategory, alreadyPicked: Dog[]): number {
  const traits = (dog.learnedTraits ?? []) as DogTraitId[];
  if (traits.length === 0) return 0;
  let score = 0;
  for (const t of traits) {
    switch (t) {
      case 'overtime':
        score += 3; // speed +15%（代價疲勞但短期划算）
        break;
      case 'perfectionist':
        // 品質為主的案受益最大
        score += category === 'tech' || category === 'design' || category === 'service' ? 5 : 1;
        break;
      case 'mentor':
        // 隊伍級：同案隊員 exp +50%，要有別人才有用
        score += alreadyPicked.length > 0 ? 4 : 0;
        break;
      case 'haggler':
        score += 6; // reward +8%
        break;
      case 'ironHeart':
        // 防禦型：士氣低的狗自帶下限值
        score += dog.morale < 50 ? 3 : 1;
        break;
      case 'catalyst':
        // 隊伍級：化學倍率 +20%，得有隊友才有發揮空間
        score += alreadyPicked.length > 0 ? 5 : 1;
        break;
      case 'enduring':
        // 疲勞已高時更有價值
        score += dog.fatigue > 50 ? 5 : 2;
        break;
      case 'social':
        score += category === 'marketing' ? 6 : 3;
        break;
    }
  }
  return score;
}

// 化學加成貢獻：正組合 +6 / 組合，負組合 -6
function chemistryBonus(testRoles: Set<string>, category: ProjectCategory): number {
  let bonus = 0;
  for (const combo of CHEMISTRY_COMBOS) {
    if (combo.category && combo.category !== 'any' && combo.category !== category) continue;
    const all = combo.roles.every((r) => testRoles.has(r));
    if (!all) continue;
    bonus += combo.type === 'positive' ? 6 : -6;
  }
  return bonus;
}

// 自動指派：貪心挑分數最高的，最多 3 隻；當加人不能再縮短預估天數時停止（避免浪費人力）
function pickAutoAssign(
  candidates: Dog[],
  category: ProjectCategory,
  alreadyPicked: Dog[],
  remainingWork: number,
  buffs: { speedBoost: number; qualityBoost: number; teamworkBoost: number; charismaBoost: number },
  activeSynergies: ActiveSynergies,
): Dog[] {
  const result: Dog[] = [...alreadyPicked];
  const pool = candidates.slice();
  const MAX = 3;

  const daysFor = (dogs: Dog[]): number => {
    if (dogs.length === 0) return Infinity;
    const c = estimateDailyContrib(category, dogs, buffs, activeSynergies);
    if (c <= 0) return Infinity;
    return Math.ceil(remainingWork / c);
  };

  let prevDays = daysFor(result);

  while (result.length < MAX && pool.length > 0) {
    // 第一隻：若有「專家」就限定從專家池挑（行銷案優先選行銷）
    let searchIndices: number[] = pool.map((_, i) => i);
    if (result.length === 0) {
      const specialistIdx = pool
        .map((d, i) => (isSpecialistFor(d.role, category) ? i : -1))
        .filter((i) => i >= 0);
      if (specialistIdx.length > 0) searchIndices = specialistIdx;
    }

    let bestIdx = -1;
    let bestScore = -Infinity;
    for (const i of searchIndices) {
      const d = pool[i];
      const baseScore = dogScoreFor(d, category);
      const traitScore = traitScoreFor(d, category, result);
      const newRoles = new Set([...result.map((r) => r.role), d.role]);
      const oldRoles = new Set(result.map((r) => r.role));
      const chemDelta = chemistryBonus(newRoles, category) - chemistryBonus(oldRoles, category);
      const total = baseScore + traitScore + chemDelta;
      if (total > bestScore) {
        bestScore = total;
        bestIdx = i;
      }
    }
    if (bestIdx === -1 || (result.length >= 1 && bestScore < 0)) break;

    // 已有 1 隻以上時：若新人加進去無法縮短預估天數 → 停（多派也沒用）
    if (result.length >= 1) {
      const newDays = daysFor([...result, pool[bestIdx]]);
      if (newDays >= prevDays) break;
      prevDays = newDays;
    } else {
      // 第一隻必加，當基準
      prevDays = daysFor([pool[bestIdx]]);
    }

    result.push(pool[bestIdx]);
    pool.splice(bestIdx, 1);
  }
  return result;
}

const CATEGORY_ICON: Record<ProjectCategory, SvgIconName> = {
  tech: 'tech',
  design: 'design',
  marketing: 'marketing',
  service: 'service',
};

const CATEGORY_NAME: Record<ProjectCategory, string> = {
  tech: '技術',
  design: '設計',
  marketing: '行銷',
  service: '客服',
};

function tierStars(tier: ClientTier): string {
  return '★'.repeat(tier) + '☆'.repeat(5 - tier);
}

function tierColor(tier: ClientTier): string {
  switch (tier) {
    case 1: return '#9aa39a';
    case 2: return '#5a9b5a';
    case 3: return '#5a8ab8';
    case 4: return '#a36a3a';
    case 5: return '#c0392b';
  }
}

export function ProjectDetailModal({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const project = useGameStore((s) => s.clients.find((c) => c.id === projectId));
  const day = useGameStore((s) => s.day);
  const staff = useGameStore((s) => s.staff);
  const companyBuffs = useGameStore((s) => s.companyBuffs);
  const activeSynergies = useGameStore((s) => s.activeSynergies);
  const accept = useGameStore((s) => s.acceptProject);
  const reject = useGameStore((s) => s.rejectProject);
  const assign = useGameStore((s) => s.assignStaff);
  const unassign = useGameStore((s) => s.unassignStaff);

  // offered 狀態用：選員工
  const [pickedIds, setPickedIds] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 案件可能在 modal 開著時被別處關閉（例如完成、結算）
  useEffect(() => {
    if (!project || project.status === 'done' || project.status === 'failed' || project.status === 'late') {
      onClose();
    }
  }, [project, onClose]);

  //  所有 hook 必須在 early-return 之前呼叫，避免 React 發出 "fewer hooks" 錯誤
  const isOffered = project?.status === 'offered';
  const availableDogs = !project
    ? []
    : staff.filter((d) => !d.assignedProjectId || (!isOffered && d.assignedProjectId === projectId));
  const pickedDogs = !project
    ? []
    : isOffered
      ? staff.filter((d) => pickedIds.includes(d.id))
      : staff.filter((d) => project.assignedStaffIds.includes(d.id));

  const dailyContrib = useMemo(
    () => (project ? estimateDailyContrib(project.category, pickedDogs, companyBuffs, activeSynergies) : 0),
    [project, pickedDogs, companyBuffs, activeSynergies],
  );
  const chemistries = useMemo(
    () => (project ? findChemistries(pickedDogs, project.category) : []),
    [pickedDogs, project],
  );

  if (!project) return null;
  const remainingWork = isOffered
    ? project.workRequired
    : Math.max(0, project.workRequired - project.workDone);
  const estimatedDays = pickedDogs.length === 0 || dailyContrib === 0
    ? null
    : Math.ceil(remainingWork / dailyContrib);
  // 三段：onTime（在期限內）/ inGrace（超期但在容忍期內，會被打折拿少酬勞）/ overGrace（超容忍 → 失敗）
  const onTime = estimatedDays !== null && estimatedDays <= project.defaultDeadlineDays;
  const inGrace = estimatedDays !== null && !onTime
    && estimatedDays <= project.defaultDeadlineDays + project.graceDays;
  const overGrace = estimatedDays !== null && estimatedDays > project.defaultDeadlineDays + project.graceDays;
  // 顏色配置
  const estimateBg = onTime ? '#eef7f0' : inGrace ? '#fff8e0' : overGrace ? '#fff0f0' : 'transparent';
  const estimateBorder = onTime ? '#b8d8c0' : inGrace ? '#e0c280' : overGrace ? '#e8c8c8' : 'transparent';
  const estimateColor = onTime ? '#2f7a3f' : inGrace ? '#a36a3a' : overGrace ? '#c0392b' : '#3d2f25';

  const togglePick = (dogId: string) => {
    setPickedIds((ids) => ids.includes(dogId) ? ids.filter((id) => id !== dogId) : [...ids, dogId]);
  };

  const handleAccept = () => {
    if (pickedIds.length === 0) return;
    accept(project.id, pickedIds);
    onClose();
  };

  const handleReject = () => {
    reject(project.id);
    onClose();
  };

  const offeredDaysLeft = OFFER_TTL_DAYS - (day - project.createdDay);
  const activeDaysLeft = project.deadlineDay - day;

  return (
    <>
      <style>{`
        @keyframes detailSlideIn { from { transform: translateY(20px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
      <div
        className="fixed inset-0 z-[820] flex items-center justify-center p-4"
        style={{ background: 'rgba(8,32,77,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="rounded-xl max-w-md w-full overflow-y-auto"
          style={{
            maxHeight: '90vh',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
            border: '1px solid var(--line)',
            boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
            animation: 'detailSlideIn 0.25s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 標題列 */}
          <div className="p-4 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#eef6ff', border: '1px solid var(--line)' }}>
                    <SvgIcon name={CATEGORY_ICON[project.category]} size={23} />
                  </span>
                  <span className="font-extrabold text-base">{project.title}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: tierColor(project.clientTier), color: 'white' }}
                  >
                    tier {project.clientTier}
                  </span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {project.clientName}・{CATEGORY_NAME[project.category]}案・{tierStars(project.clientTier)}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-sm px-2.5 py-1 rounded-full"
                style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
              >
                X
              </button>
            </div>
          </div>

          {/* 案件資訊 */}
          <div className="px-4">
            <div className="grid grid-cols-3 gap-1.5 text-[11px] p-2.5 rounded-lg" style={{ background: '#f7fbff', border: '1px solid var(--line)' }}>
              <div className="text-center">
                <div style={{ color: 'var(--muted)' }}>酬勞</div>
                <div className="text-base font-extrabold" style={{ color: '#3a7a3f' }}>${project.reward}</div>
              </div>
              <div className="text-center">
                <div style={{ color: 'var(--muted)' }}>工作量</div>
                <div className="text-base font-extrabold">{project.workRequired}</div>
              </div>
              <div className="text-center">
                <div style={{ color: 'var(--muted)' }}>期望品質</div>
                <div className="text-base font-extrabold">{project.expectedQuality}</div>
              </div>
              <div className="text-center">
                <div style={{ color: 'var(--muted)' }}>{isOffered ? '期限' : '進度'}</div>
                <div className="text-base font-extrabold">
                  {isOffered
                    ? `${project.defaultDeadlineDays} 天`
                    : `${day - (project.acceptedDay ?? day)} / ${project.defaultDeadlineDays}`}
                </div>
              </div>
              <div className="text-center">
                <div style={{ color: 'var(--muted)' }}>容忍超期</div>
                <div className="text-base font-extrabold">{project.graceDays} 天</div>
              </div>
              <div className="text-center">
                <div style={{ color: 'var(--muted)' }}>失敗扣</div>
                <div className="text-base font-extrabold" style={{ color: '#c0392b' }}>${project.penalty}</div>
              </div>
            </div>

            {isOffered && (
              <div
                className="mt-2 text-[11px] text-center px-2 py-1.5 rounded-lg"
                style={{
                  background: offeredDaysLeft <= 3 ? '#fff7f7' : '#eefaf7',
                  color: offeredDaysLeft <= 3 ? '#c0392b' : '#3a7a3f',
                }}
              >
                 收件匣保留剩 {Math.max(0, offeredDaysLeft)} 天 · 過期自動消失
              </div>
            )}

            {/* 進行中：顯示進度條 */}
            {!isOffered && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: 'var(--muted)' }}>
                  <span>進度</span>
                  <span className="font-bold">
                    {Math.round(project.workDone)} / {project.workRequired}
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: '#e4eefc' }}>
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.min(100, (project.workDone / project.workRequired) * 100)}%`,
                      background: 'linear-gradient(90deg, #2f8df4, #20c7b3)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 員工選擇區 */}
          <div className="p-4 pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[11px] font-bold" style={{ color: 'var(--muted)' }}>
                {isOffered ? '選擇要派的員工（可多選）' : '已指派員工（點擊取消指派）'}
              </div>
              {availableDogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const alreadyPicked = isOffered ? pickedDogs : pickedDogs;
                    const eligible = availableDogs.filter((d) => d.fatigue < 100);
                    const picked = pickAutoAssign(
                      eligible,
                      project.category,
                      isOffered ? [] : alreadyPicked,
                      remainingWork,
                      companyBuffs,
                      activeSynergies,
                    );
                    if (isOffered) {
                      setPickedIds(picked.map((d) => d.id));
                    } else {
                      // 加上目前還沒指派的
                      const currentIds = new Set(project.assignedStaffIds);
                      for (const d of picked) {
                        if (!currentIds.has(d.id)) assign(project.id, d.id);
                      }
                    }
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: 'linear-gradient(180deg, #ffffff, #edf5ff)',
                    color: 'var(--blue)',
                    border: '1px solid var(--line)',
                  }}
                  title="依對口 / 化學 / 特性 / 士氣 / 低疲勞挑最佳；天數縮不下去就不再加人"
                >
                  自動指派
                </button>
              )}
            </div>

            {/* 已指派的員工 chip（active 模式）*/}
            {!isOffered && (
              <div className="flex flex-wrap gap-1 mb-2">
                {pickedDogs.length === 0 ? (
                  <span className="text-[11px]" style={{ color: 'var(--muted)' }}>還沒指派員工</span>
                ) : (
                  pickedDogs.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => unassign(project.id, d.id)}
                      className="text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                      style={{
                        background: '#eef6ff',
                        border: '1px solid var(--line)',
                        color: 'var(--blue)',
                      }}
                    >
                      <DogAvatar role={d.role} breed={d.breed} size={18} />
                      <span>{d.name}</span>
                      <span style={{ color: '#d34a4a' }}>X</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* 可選員工列表 */}
            <div className="grid grid-cols-2 gap-1.5">
              {availableDogs.length === 0 && pickedDogs.length === 0 && (
                <div className="col-span-2 text-[11px] text-center py-2" style={{ color: 'var(--muted)' }}>
                  沒有待命員工，先去人資招人或解除其他案件指派
                </div>
              )}
              {availableDogs.map((d) => {
                const picked = isOffered
                  ? pickedIds.includes(d.id)
                  : project.assignedStaffIds.includes(d.id);
                const overFatigue = d.fatigue >= 100;
                const lockedOut = overFatigue && !picked;
                return (
                  <button
                    key={d.id}
                    type="button"
                    disabled={lockedOut}
                    onClick={() => {
                      if (lockedOut) return;
                      if (isOffered) togglePick(d.id);
                      else if (picked) unassign(project.id, d.id);
                      else assign(project.id, d.id);
                    }}
                    title={lockedOut ? '過勞中（疲勞 100），等回復後才能指派' : undefined}
                    className="text-[11px] px-2 py-1.5 rounded-lg flex items-center gap-1"
                    style={{
                      background: lockedOut
                        ? '#f5f5f5'
                        : picked
                          ? '#eef6ff'
                          : '#ffffff',
                      border: picked ? '1px solid #7fb2ef' : '1px solid var(--line)',
                      color: lockedOut ? 'var(--muted)' : picked ? 'var(--blue)' : 'var(--text)',
                      opacity: lockedOut ? 0.55 : 1,
                      cursor: lockedOut ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <DogAvatar role={d.role} breed={d.breed} size={18} />
                    <span className="font-bold">{d.name}</span>
                    <span style={{ color: 'var(--muted)' }}>{d.role}</span>
                    {lockedOut && (
                      <span
                        className="ml-auto px-1 rounded font-extrabold"
                        style={{ background: 'var(--danger)', color: 'white', fontSize: 9 }}
                      >
                        過勞
                      </span>
                    )}
                    {!lockedOut && picked && <span style={{ color: '#16926f', marginLeft: 'auto' }}>已選</span>}
                  </button>
                );
              })}
            </div>

            {/* 預估天數 */}
            {pickedDogs.length > 0 && (
              <div
                className="mt-2 p-2 rounded-lg text-[11px] flex items-center justify-between"
                style={{
                  background: estimateBg,
                  border: `1px solid ${estimateBorder}`,
                }}
              >
                <span style={{ color: 'var(--muted)' }}>
                  {pickedDogs.length} 人 · 每日推進 ~{Math.round(dailyContrib)}
                </span>
                <span
                  className="font-extrabold"
                  style={{ color: estimateColor }}
                >
                  {estimatedDays !== null
                    ? onTime
                      ? `預估 ${estimatedDays} 天`
                      : inGrace
                        ? `預估 ${estimatedDays} 天  超期 ${estimatedDays - project.defaultDeadlineDays} 天（reward ×0.7）`
                        : `預估 ${estimatedDays} 天 超容忍，失敗`
                    : '無法估算'}
                </span>
              </div>
            )}

            {/* 化學反應預覽 */}
            {chemistries.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {chemistries.map((c, i) => {
                  const isPositive = c.type === 'positive';
                  return (
                    <div
                      key={i}
                      className="text-[11px] px-2 py-1.5 rounded-lg leading-tight"
                      style={{
                        background: isPositive ? '#eef7f0' : '#fff0f0',
                        border: `1px solid ${isPositive ? '#b8d8c0' : '#e8c8c8'}`,
                        color: isPositive ? '#2f7a3f' : '#c0392b',
                      }}
                    >
                      {c.msg}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 行動按鈕 */}
          {isOffered ? (
            <div className="p-4 pt-0">
              {pickedIds.length === 0 && (
                <div
                  className="text-[11px] mb-1.5 text-center"
                  style={{ color: '#c07a20' }}
                >
                  請至少指派 1 位員工才能接案
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={pickedIds.length === 0}
                  className="py-2.5 rounded-lg text-sm font-extrabold"
                  style={{
                    background:
                      pickedIds.length === 0
                        ? '#e9f1ff'
                        : 'linear-gradient(180deg, #35c59c, #16a77f)',
                    color: pickedIds.length === 0 ? '#8aa2c8' : 'white',
                    border:
                      pickedIds.length === 0
                        ? '1px solid var(--line)'
                        : '1px solid rgba(22,167,127,0.35)',
                    cursor: pickedIds.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                  title={pickedIds.length === 0 ? '請先選員工' : '接案並開始'}
                >
                  接案並開始
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="py-2.5 rounded-lg text-sm font-extrabold"
                  style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
                >
                  拒絕
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-full text-sm font-bold"
                style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
              >
                關閉
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
