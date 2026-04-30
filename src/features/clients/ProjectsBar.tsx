import { useEffect, useRef, useState } from 'react';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';
import { OFFER_TTL_DAYS } from '@/lib/projectGen';
import { projectCardRectCache } from '@/lib/cardRectCache';
import { useGameStore } from '@/store/gameStore';
import type { ClientTier, Dog, Project, ProjectCategory } from '@/types';
import { ProjectDetailModal } from './ProjectDetailModal';

const CATEGORY_ICON: Record<ProjectCategory, SvgIconName> = {
  tech: 'tech',
  design: 'design',
  marketing: 'marketing',
  service: 'service',
};

const TIER_COLOR: Record<ClientTier, string> = {
  1: '#8da1bf',
  2: '#30a778',
  3: '#2f8df4',
  4: '#6d7a91',
  5: '#ef3f3f',
};

export function ProjectsBar() {
  const clients = useGameStore((s) => s.clients);
  const day = useGameStore((s) => s.day);
  const staff = useGameStore((s) => s.staff);
  const tierBudget = useGameStore((s) => s.tierBudget);

  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  const offered = clients.filter((c) => c.status === 'offered');
  const active = clients.filter((c) => c.status === 'active');
  const visible = [...active, ...offered].slice(0, 5);

  const openModal = (project: Project) => {
    setOpenProjectId(project.id);
  };

  return (
    <>
      <section
        className="rounded-xl px-3 py-2"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(244,249,255,0.9))',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div className="flex items-center justify-between gap-3 pb-2">
          <div className="flex items-center gap-4 min-w-0">
            <StatusStat icon="briefcase" label="進行中" value={active.length} />
            <Divider />
            <StatusStat icon="service" label="可承接" value={offered.length} />
            <Divider />
            <StatusStat icon="quality" label="稀有度" value={tierBudget} />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="h-24 rounded-lg flex items-center justify-center text-sm" style={{ color: 'var(--muted)', background: '#f7fbff', border: '1px solid var(--line)' }}>
            尚無案件・先在員工面板開啟對應產業 team
          </div>
        ) : (
          <div className="grid gap-3 project-card-grid">
            {visible.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                day={day}
                staff={staff}
                onClick={() => openModal(project)}
              />
            ))}
          </div>
        )}
      </section>

      <style>{`
        .project-card-grid {
          grid-template-columns: repeat(auto-fit, minmax(176px, 1fr));
        }
        @media (min-width: 1180px) {
          .project-card-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }
      `}</style>

      {openProjectId && (
        <ProjectDetailModal
          projectId={openProjectId}
          onClose={() => setOpenProjectId(null)}
        />
      )}
    </>
  );
}

function StatusStat({ icon, label, value }: { icon: SvgIconName; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-sm font-extrabold whitespace-nowrap" style={{ color: '#173b78' }}>
      <SvgIcon name={icon} size={24} />
      <span>{label}</span>
      <span style={{ color: 'var(--blue)' }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-7 w-px" style={{ background: 'linear-gradient(180deg, transparent, #c8daf2, transparent)' }} />;
}

function ProjectCard({
  project,
  day,
  staff,
  onClick,
}: {
  project: Project;
  day: number;
  staff: Dog[];
  onClick: () => void;
}) {
  const isOffered = project.status === 'offered';
  const isActive = !isOffered;
  const offeredDaysLeft = OFFER_TTL_DAYS - (day - project.createdDay);
  const offerExpiringSoon = isOffered && offeredDaysLeft <= 3;
  const assignedDogs = staff.filter((d) => project.assignedStaffIds.includes(d.id));
  const progress = isOffered ? 0 : Math.min(100, (project.workDone / project.workRequired) * 100);
  const progressText = `${Math.round(project.workDone)} / ${project.workRequired}`;

  const cardRef = useRef<HTMLButtonElement>(null);
  // 完成案件動畫：每次 render 後快取 rect，案件被 trim 掉後仍能查到最後位置
  useEffect(() => {
    if (cardRef.current) {
      projectCardRectCache.set(project.id, cardRef.current.getBoundingClientRect());
    }
  });

  // 進行中綠系 / offered 中性藍系
  const cardBg = isActive
    ? 'linear-gradient(180deg, #eafff7, #f8fffd)'
    : 'linear-gradient(180deg, #ffffff, #f7fbff)';
  const cardBorder = isActive
    ? '1.5px solid rgba(32,200,140,0.5)'
    : '1px solid #cfe0f8';
  const cardShadow = isActive
    ? '0 10px 22px rgba(32,200,140,0.22), inset 0 1px 0 rgba(255,255,255,0.9)'
    : '0 8px 18px rgba(46,104,180,0.12), inset 0 1px 0 rgba(255,255,255,0.85)';

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onClick}
      className="rounded-lg text-left p-3 min-w-0 transition relative"
      style={{
        minHeight: 108,
        background: cardBg,
        border: cardBorder,
        boxShadow: cardShadow,
        cursor: 'pointer',
      }}
      title={isOffered ? '點擊查看（能準時完成才自動接案）' : '點擊查看案件詳情'}
    >
      {/* 進行中標籤（左上角小色帶）*/}
      {isActive && (
        <div
          className="absolute left-0 top-0 text-[10px] font-extrabold px-2 py-0.5 rounded-tl-lg rounded-br-lg inline-flex items-center gap-1"
          style={{
            background: 'linear-gradient(135deg, #20c88c, #16a77f)',
            color: 'white',
            letterSpacing: '0.5px',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'white', boxShadow: '0 0 0 2px rgba(255,255,255,0.28)' }} />
          進行中
        </div>
      )}

      <div className={`flex items-start gap-2 ${isActive ? 'mt-3' : ''}`}>
        <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: '#eef6ff', border: '1px solid var(--line)' }}>
          <SvgIcon name={CATEGORY_ICON[project.category]} size={23} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <div className="text-sm font-extrabold truncate flex-1" style={{ color: '#173b78' }}>
              {project.title}
            </div>
            <span
              className="text-[11px] px-1.5 py-0.5 rounded-md font-extrabold shrink-0"
              style={{ background: TIER_COLOR[project.clientTier], color: 'white' }}
            >
              T{project.clientTier}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 text-[11px] font-bold" style={{ color: '#6f83a5' }}>
            <span className="truncate">{project.clientName}</span>
            {isOffered && (
              <span className="shrink-0" style={{ color: offerExpiringSoon ? '#c07a20' : '#6f83a5' }}>
                收件匣剩 {Math.max(0, offeredDaysLeft)} 天
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs font-extrabold shrink-0" style={{ color: '#173b78' }}>進度</span>
        {isActive && (
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: '#d6f5eb' }}
            title={`${progressText}`}
          >
            <div
              className="h-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #16a77f, #20c7b3)',
                boxShadow: '0 0 10px rgba(32,199,179,0.45)',
              }}
            />
          </div>
        )}
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <div className="text-base font-extrabold" style={{ color: '#20a889' }}>${project.reward}</div>
        {isActive && (
          <span className="text-[11px] font-extrabold inline-flex items-center gap-1" style={{ color: '#138464' }}>
            <SvgIcon name="people" size={13} />
            {assignedDogs.length === 0 ? '尚未指派' : `${assignedDogs.length} 位員工`}
          </span>
        )}
      </div>
    </button>
  );
}
