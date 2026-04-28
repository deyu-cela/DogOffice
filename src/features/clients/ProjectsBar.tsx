import { useState } from 'react';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';
import { OFFER_TTL_DAYS, rerollCost } from '@/lib/projectGen';
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
  const money = useGameStore((s) => s.money);
  const tierBudget = useGameStore((s) => s.tierBudget);
  const lastRerollDay = useGameStore((s) => s.lastRerollDay);
  const reroll = useGameStore((s) => s.rerollInbox);
  const openEvent = useGameStore((s) => s.openProjectEventModal);

  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  const offered = clients.filter((c) => c.status === 'offered');
  const active = clients.filter((c) => c.status === 'active');
  const visible = [...active, ...offered].slice(0, 5);
  const cost = rerollCost(tierBudget);
  const canReroll = lastRerollDay < day && money >= cost;

  const openModal = (project: Project) => {
    if (project.pendingEvent) openEvent(project.id);
    else setOpenProjectId(project.id);
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

          <button
            type="button"
            onClick={reroll}
            disabled={!canReroll}
            className="h-11 px-5 rounded-lg text-sm font-extrabold whitespace-nowrap inline-flex items-center gap-2"
            style={{
              background: canReroll ? 'linear-gradient(180deg, #3e8cf0, #246bd0)' : '#e9f1ff',
              color: canReroll ? 'white' : '#8aa2c8',
              border: '1px solid var(--line)',
              boxShadow: canReroll ? '0 8px 16px rgba(36,107,208,0.24)' : 'none',
              cursor: canReroll ? 'pointer' : 'not-allowed',
            }}
            title={
              lastRerollDay >= day ? '今日已重整過，明天再來'
                : money < cost ? `需要 $${cost}`
                  : `花 $${cost} 重新整理 5 個案件`
            }
          >
            <SvgIcon name="restart" size={19} />
            <span>{lastRerollDay >= day ? '今日已重整' : `重整收件匣 $${cost}`}</span>
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="h-24 rounded-lg flex items-center justify-center text-sm" style={{ color: 'var(--muted)', background: '#f7fbff', border: '1px solid var(--line)' }}>
            收件匣空了，明天會補新案件
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
  const daysLeft = isOffered ? OFFER_TTL_DAYS - (day - project.createdDay) : project.deadlineDay - day;
  const overdue = !isOffered && daysLeft < 0;
  const urgent = !overdue && daysLeft <= 1;
  const assignedDogs = staff.filter((d) => project.assignedStaffIds.includes(d.id));
  const hasPending = !!project.pendingEvent;
  const progress = isOffered ? 0 : Math.min(100, (project.workDone / project.workRequired) * 100);
  const progressText = `${Math.round(project.workDone)} / ${project.workRequired}`;

  // 進行中（non-pending）綠系 / 待事件處理紅系 / offered 中性藍系
  const cardBg = hasPending
    ? 'linear-gradient(180deg, #fff7f7, #ffffff)'
    : isActive
      ? 'linear-gradient(180deg, #eafff7, #f8fffd)'
      : 'linear-gradient(180deg, #ffffff, #f7fbff)';
  const cardBorder = hasPending
    ? '1.5px solid rgba(239,63,63,0.45)'
    : isActive
      ? '1.5px solid rgba(32,200,140,0.5)'
      : '1px solid #cfe0f8';
  const cardShadow = isActive && !hasPending
    ? '0 10px 22px rgba(32,200,140,0.22), inset 0 1px 0 rgba(255,255,255,0.9)'
    : '0 8px 18px rgba(46,104,180,0.12), inset 0 1px 0 rgba(255,255,255,0.85)';

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg text-left p-3 min-w-0 transition relative"
      style={{
        minHeight: 142,
        background: cardBg,
        border: cardBorder,
        boxShadow: cardShadow,
        cursor: 'pointer',
      }}
      title={hasPending ? '點擊處理事件' : isOffered ? '點擊查看 / 接案' : '點擊查看 / 指派員工'}
    >
      {/* 進行中標籤（左上角小色帶）*/}
      {isActive && !hasPending && (
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

      <div className={`flex items-start gap-2 ${isActive && !hasPending ? 'mt-3' : ''}`}>
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
            <span className="shrink-0" style={{ color: overdue ? '#d34a4a' : urgent ? '#c07a20' : '#6f83a5' }}>
              {isOffered ? `過期剩下 ${Math.max(0, daysLeft)} 天` : overdue ? `已超期 ${-daysLeft} 天` : `剩下 ${daysLeft} 天`}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs font-extrabold" style={{ color: '#173b78' }}>酬勞</div>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <div className="text-base font-extrabold" style={{ color: '#20a889' }}>${project.reward}</div>
        {hasPending && <span className="text-[11px] font-extrabold" style={{ color: '#d34a4a' }}>事件待處理</span>}
      </div>

      {!isOffered && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] font-bold mb-1" style={{ color: '#16926f' }}>
            <span>正在推進</span>
            <span>{progressText}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#d6f5eb' }}>
            <div
              className="h-full"
              style={{
                width: `${progress}%`,
                background: overdue ? '#d34a4a' : 'linear-gradient(90deg, #16a77f, #20c7b3)',
                boxShadow: '0 0 10px rgba(32,199,179,0.45)',
              }}
            />
          </div>
        </div>
      )}

      <div
        className="mt-3 h-8 rounded-md px-2 flex items-center gap-1.5 text-[12px] font-extrabold"
        style={{
          background: isActive && !hasPending ? '#dcf8ef' : '#eef6ff',
          color: isActive && !hasPending ? '#138464' : 'var(--blue)',
          border: isActive && !hasPending ? '1px solid rgba(32,200,140,0.25)' : '1px solid #dbe9fb',
        }}
      >
        <SvgIcon name="briefcase" size={17} />
        {hasPending ? (
          <span>處理事件</span>
        ) : isOffered ? (
          <span>點擊接案</span>
        ) : assignedDogs.length === 0 ? (
          <span>進行中 · 尚未指派</span>
        ) : (
          <span className="truncate">進行中 · {assignedDogs.length} 位員工</span>
        )}
      </div>
    </button>
  );
}
