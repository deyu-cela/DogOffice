import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { ChemistryCombo, Dog, ProjectCategory, ClientTier } from '@/types';
import { OFFER_TTL_DAYS } from '@/lib/projectGen';
import { estimateDailyContrib } from '@/lib/projectEngine';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import { DogAvatar } from '@/components/DogAvatar';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';
import { DogStatusModal } from './DogStatusModal';

function findChemistries(dogs: Dog[], category: ProjectCategory): ChemistryCombo[] {
  if (dogs.length < 2) return [];
  const roles = new Set(dogs.map((d) => d.role));
  return CHEMISTRY_COMBOS.filter((combo) => {
    if (combo.category && combo.category !== 'any' && combo.category !== category) return false;
    return combo.roles.every((r) => roles.has(r));
  });
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
  const reject = useGameStore((s) => s.rejectProject);
  const abandon = useGameStore((s) => s.abandonProject);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const [shownDogId, setShownDogId] = useState<string | null>(null);

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

  const isOffered = project?.status === 'offered';
  const assignedDogs = !project ? [] : staff.filter((d) => project.assignedStaffIds.includes(d.id));

  const dailyContrib = useMemo(
    () => (project ? estimateDailyContrib(project.category, assignedDogs, companyBuffs) : 0),
    [project, assignedDogs, companyBuffs],
  );
  const chemistries = useMemo(
    () => (project ? findChemistries(assignedDogs, project.category) : []),
    [assignedDogs, project],
  );

  if (!project) return null;
  const remainingWork = isOffered
    ? project.workRequired
    : Math.max(0, project.workRequired - project.workDone);
  // 案件最快 2 天，估算下限為 2
  const estimatedDays = assignedDogs.length === 0 || dailyContrib === 0
    ? null
    : Math.max(2, Math.ceil(remainingWork / dailyContrib));

  const handleReject = () => {
    reject(project.id);
    onClose();
  };

  const offeredDaysLeft = OFFER_TTL_DAYS - (day - project.createdDay);

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
            <div className="grid grid-cols-4 gap-1.5 text-[11px] p-2.5 rounded-lg" style={{ background: '#f7fbff', border: '1px solid var(--line)' }}>
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
                <div style={{ color: 'var(--muted)' }}>違約金</div>
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
                員工有空時自動接案・收件匣保留剩 {Math.max(0, offeredDaysLeft)} 天
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

          {/* 員工區（只顯示已自動指派的） */}
          {!isOffered && (
            <div className="p-4 pt-3">
              <div className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--muted)' }}>
                自動指派員工
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {assignedDogs.length === 0 ? (
                  <span className="text-[11px]" style={{ color: 'var(--muted)' }}>尚未指派員工</span>
                ) : (
                  assignedDogs.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setShownDogId(d.id)}
                      className="text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 cursor-pointer"
                      style={{
                        background: '#eef6ff',
                        border: '1px solid var(--line)',
                        color: 'var(--blue)',
                      }}
                      title="點擊查看員工狀態"
                    >
                      <DogAvatar role={d.role} breed={d.breed} size={18} />
                      <span>{d.name}</span>
                      <span style={{ color: 'var(--muted)' }}>{d.role}</span>
                    </button>
                  ))
                )}
              </div>

              {/* 預估天數 */}
              {assignedDogs.length > 0 && (
                <div
                  className="mt-2 p-2 rounded-lg text-[11px] flex items-center justify-between"
                  style={{ background: '#eef7f0', border: '1px solid #b8d8c0' }}
                >
                  <span style={{ color: 'var(--muted)' }}>
                    {assignedDogs.length} 人 · 每日推進 ~{Math.round(dailyContrib)}
                  </span>
                  <span className="font-extrabold" style={{ color: '#2f7a3f' }}>
                    {estimatedDays !== null ? `預估 ${estimatedDays} 天` : '無法估算'}
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
          )}

          {/* 行動按鈕 */}
          {isOffered ? (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 rounded-lg text-sm font-extrabold"
                  style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
                >
                  關閉
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="py-2.5 rounded-lg text-sm font-extrabold"
                  style={{ background: '#fff7f7', color: '#c0392b', border: '1px solid #e8c8c8' }}
                >
                  拒絕
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 pt-0">
              {confirmAbandon ? (
                <>
                  <div
                    className="text-[11px] text-center mb-2 px-2 py-1.5 rounded-lg"
                    style={{ background: '#fff7f7', color: '#c0392b', border: '1px solid #e8c8c8' }}
                  >
                    確定放棄？將扣 ${project.penalty}、信譽 {project.reputationDelta.fail}、隊員士氣 -5
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmAbandon(false)}
                      className="py-2.5 rounded-lg text-sm font-extrabold"
                      style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={() => { abandon(project.id); onClose(); }}
                      className="py-2.5 rounded-lg text-sm font-extrabold"
                      style={{
                        background: 'linear-gradient(180deg, #d34a4a, #b03333)',
                        color: 'white',
                        border: '1px solid rgba(176,51,51,0.45)',
                      }}
                    >
                      確定放棄
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 rounded-lg text-sm font-extrabold"
                    style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
                  >
                    關閉
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAbandon(true)}
                    className="py-2.5 rounded-lg text-sm font-extrabold"
                    style={{ background: '#fff7f7', color: '#c0392b', border: '1px solid #e8c8c8' }}
                  >
                    放棄案件
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {shownDogId && (() => {
        const d = assignedDogs.find((x) => x.id === shownDogId);
        return d ? <DogStatusModal dog={d} onClose={() => setShownDogId(null)} /> : null;
      })()}
    </>
  );
}
