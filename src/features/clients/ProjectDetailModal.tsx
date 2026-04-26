import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { ChemistryCombo, Dog, ProjectCategory, ClientTier } from '@/types';
import { OFFER_TTL_DAYS } from '@/lib/projectGen';
import { estimateDailyContrib } from '@/lib/projectEngine';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';

function findChemistries(dogs: Dog[], category: ProjectCategory): ChemistryCombo[] {
  if (dogs.length < 2) return [];
  const roles = new Set(dogs.map((d) => d.role));
  return CHEMISTRY_COMBOS.filter((combo) => {
    if (combo.category && combo.category !== 'any' && combo.category !== category) return false;
    return combo.roles.every((r) => roles.has(r));
  });
}

// 員工對該案的「個體分數」：對口/魅力/品質/疲勞綜合
function dogScoreFor(dog: Dog, category: ProjectCategory): number {
  const matched = (dog as Dog & { role: string }).role;
  const ROLE_CATEGORY: Record<string, ProjectCategory[]> = {
    工程師: ['tech'], QA: ['tech'],
    美術: ['design'], 企劃: ['design', 'marketing'],
    業務: ['marketing', 'service'], 行銷: ['marketing'],
    客服: ['service'],
    PM: ['tech', 'design', 'marketing', 'service'],
    CEO: ['tech', 'design', 'marketing', 'service'],
  };
  const cats = ROLE_CATEGORY[matched] ?? [];
  const matchBonus = cats.includes(category) ? 10 : 0;
  const fatiguePenalty = dog.fatigue / 10;
  // 主屬性權重：依 category 決定
  let mainWeight = 0;
  switch (category) {
    case 'tech': mainWeight = dog.stats.quality * 1.3 + dog.stats.speed * 1.2; break;
    case 'design': mainWeight = dog.stats.quality * 1.4 + dog.stats.charisma * 1.1; break;
    case 'marketing': mainWeight = dog.stats.charisma * 1.5 + dog.stats.speed * 1.1; break;
    case 'service': mainWeight = dog.stats.teamwork * 1.4 + dog.stats.quality * 1.1; break;
  }
  return mainWeight + matchBonus - fatiguePenalty;
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

// 自動指派：貪心挑分數最高的，最多 3 隻，避免負分
function pickAutoAssign(candidates: Dog[], category: ProjectCategory, alreadyPicked: Dog[]): Dog[] {
  const result: Dog[] = [...alreadyPicked];
  const pool = candidates.slice();
  const MAX = 3;
  while (result.length < MAX && pool.length > 0) {
    let bestIdx = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < pool.length; i++) {
      const d = pool[i];
      const baseScore = dogScoreFor(d, category);
      const newRoles = new Set([...result.map((r) => r.role), d.role]);
      const oldRoles = new Set(result.map((r) => r.role));
      const chemDelta = chemistryBonus(newRoles, category) - chemistryBonus(oldRoles, category);
      const total = baseScore + chemDelta;
      if (total > bestScore) {
        bestScore = total;
        bestIdx = i;
      }
    }
    // 如果新加一隻會讓總分變負（高疲勞 + 負化學），不加了
    if (bestIdx === -1 || (result.length >= 1 && bestScore < 0)) break;
    result.push(pool[bestIdx]);
    pool.splice(bestIdx, 1);
  }
  return result;
}

const CATEGORY_ICON: Record<ProjectCategory, string> = {
  tech: '💻',
  design: '🎨',
  marketing: '📣',
  service: '💬',
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

  if (!project) return null;
  const isOffered = project.status === 'offered';

  const availableDogs = staff.filter((d) => !d.assignedProjectId || (!isOffered && d.assignedProjectId === projectId));
  const pickedDogs = isOffered
    ? staff.filter((d) => pickedIds.includes(d.id))
    : staff.filter((d) => project.assignedStaffIds.includes(d.id));

  const dailyContrib = useMemo(
    () => estimateDailyContrib(project.category, pickedDogs, companyBuffs),
    [project.category, pickedDogs, companyBuffs],
  );
  const chemistries = useMemo(
    () => findChemistries(pickedDogs, project.category),
    [pickedDogs, project.category],
  );
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
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="rounded-3xl max-w-md w-full overflow-y-auto"
          style={{
            maxHeight: '90vh',
            background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
            border: '2px solid rgba(90,70,54,0.18)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'detailSlideIn 0.25s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 標題列 */}
          <div className="p-4 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">{CATEGORY_ICON[project.category]}</span>
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
                style={{ background: '#eeeae4', color: '#5b3c2b' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* 案件資訊 */}
          <div className="px-4">
            <div className="grid grid-cols-3 gap-1.5 text-[11px] p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(90,70,54,0.1)' }}>
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
                <div style={{ color: 'var(--muted)' }}>{isOffered ? '期限' : '剩餘'}</div>
                <div className="text-base font-extrabold">
                  {isOffered ? `${project.defaultDeadlineDays} 天` : `${activeDaysLeft} 天`}
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
                  background: offeredDaysLeft <= 3 ? '#fff0f0' : '#eef7f0',
                  color: offeredDaysLeft <= 3 ? '#c0392b' : '#3a7a3f',
                }}
              >
                ⏳ 收件匣保留剩 {Math.max(0, offeredDaysLeft)} 天 · 過期自動消失
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
                <div className="h-3 rounded-full overflow-hidden" style={{ background: '#eadfce' }}>
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.min(100, (project.workDone / project.workRequired) * 100)}%`,
                      background: 'linear-gradient(90deg, #a8d8a8, #66bb6a)',
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
                {isOffered ? '👥 選擇要派的員工（可多選）' : '👥 已指派員工（點擊取消指派）'}
              </div>
              {availableDogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const alreadyPicked = isOffered ? pickedDogs : pickedDogs;
                    const picked = pickAutoAssign(availableDogs, project.category, isOffered ? [] : alreadyPicked);
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
                    background: 'linear-gradient(180deg, #ffe5a0, #f6c24b)',
                    color: '#5a3a10',
                    border: '1px solid rgba(90,70,54,0.15)',
                  }}
                  title="依對口 / 化學 / 低疲勞自動挑最佳人選（最多 3 隻）"
                >
                  ⚡ 自動指派
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
                        background: '#dcecff',
                        border: '1.5px solid #2b7abd',
                      }}
                    >
                      <span>{d.emoji}</span>
                      <span>{d.name}</span>
                      <span style={{ color: '#c0392b' }}>✕</span>
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
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      if (isOffered) togglePick(d.id);
                      else if (picked) unassign(project.id, d.id);
                      else assign(project.id, d.id);
                    }}
                    className="text-[11px] px-2 py-1.5 rounded-lg flex items-center gap-1"
                    style={{
                      background: picked ? '#dcecff' : 'rgba(255,255,255,0.85)',
                      border: picked ? '1.5px solid #2b7abd' : '1px solid rgba(90,70,54,0.12)',
                    }}
                  >
                    <span>{d.emoji}</span>
                    <span className="font-bold">{d.name}</span>
                    <span style={{ color: 'var(--muted)' }}>{d.role}</span>
                    {picked && <span style={{ color: '#3a7a3f', marginLeft: 'auto' }}>✓</span>}
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
                      ? `預估 ${estimatedDays} 天 ✓`
                      : inGrace
                        ? `預估 ${estimatedDays} 天 ⚠️ 超期 ${estimatedDays - project.defaultDeadlineDays} 天（reward ×0.7）`
                        : `預估 ${estimatedDays} 天 ❌ 超容忍 → 失敗`
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
            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="py-2.5 rounded-full text-sm font-extrabold"
                style={{ background: 'linear-gradient(180deg, #b6efab, #8ee28f)', color: '#1e5a29' }}
              >
                ✅ 接案 + 開始
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="py-2.5 rounded-full text-sm font-extrabold"
                style={{ background: 'linear-gradient(180deg, #ffdba5, #ffbf73)', color: '#7a4520' }}
              >
                ❌ 拒絕
              </button>
            </div>
          ) : (
            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-full text-sm font-bold"
                style={{ background: '#eeeae4', color: '#5b3c2b' }}
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
