import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { Dog, Project, ProjectCategory, ClientTier } from '@/types';
import { OFFER_TTL_DAYS, rerollCost } from '@/lib/projectGen';
import { ProjectDetailModal } from './ProjectDetailModal';

const CATEGORY_ICON: Record<ProjectCategory, string> = {
  tech: '💻',
  design: '🎨',
  marketing: '📣',
  service: '💬',
};

function tierColor(tier: ClientTier): string {
  switch (tier) {
    case 1: return '#9aa39a';
    case 2: return '#5a9b5a';
    case 3: return '#5a8ab8';
    case 4: return '#a36a3a';
    case 5: return '#c0392b';
  }
}

// active 統一藍色：進行中視覺語意明確（藍=進行中、紅=警告，不會混淆）
const ACTIVE_COLOR = {
  bg: 'linear-gradient(180deg, #d0e4ff, #a5c5f0)',
  border: '#7a9ed0',
};

// offered 便條紙統一灰白色（讓 active 案視覺上更醒目）
const OFFERED_COLOR = {
  bg: 'linear-gradient(180deg, #ffffff, #f4ede0)',
  border: '#bba98e',
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
  // 顯示順序：active 在前（重要事項先看），offered 在後
  const visible = [...active, ...offered];

  const cost = rerollCost(tierBudget);
  const canReroll = lastRerollDay < day && money >= cost;

  const openModal = (project: Project) => {
    if (project.pendingEvent) {
      openEvent(project.id);
    } else {
      setOpenProjectId(project.id);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%) rotate(-3deg); opacity: 0; }
          to { transform: translateX(0) rotate(-1.5deg); opacity: 1; }
        }
        @keyframes pendingPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(192,57,43,0.6), 0 4px 8px rgba(0,0,0,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(192,57,43,0), 0 4px 8px rgba(0,0,0,0.15); }
        }
        .sticky-note {
          animation: slideInFromRight 0.4s ease-out;
          transition: transform 0.15s ease;
        }
        .sticky-note:hover {
          transform: translateY(-3px) rotate(0deg) !important;
        }
        .sticky-note-pending {
          animation: slideInFromRight 0.4s ease-out, pendingPulse 1.5s infinite;
        }
      `}</style>
      <div
        className="rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,248,241,0.6))',
          border: '1.5px dashed rgba(90,70,54,0.18)',
        }}
      >
        {/* 頂部控制條 */}
        <div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1">
          <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--muted)' }}>
            <span>📨 收件匣 <b>{offered.length}</b></span>
            <span>·</span>
            <span>🔨 進行中 <b>{active.length}</b></span>
            <span>·</span>
            <span>✨ 稀有度 <b>{tierBudget}</b></span>
          </div>
          <button
            type="button"
            onClick={reroll}
            disabled={!canReroll}
            className="px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
            style={{
              background: canReroll ? 'linear-gradient(180deg, #ffe5a0, #f6c24b)' : '#eee',
              color: canReroll ? '#5a3a10' : '#999',
              border: '1.5px solid rgba(90,70,54,0.15)',
              cursor: canReroll ? 'pointer' : 'not-allowed',
            }}
            title={
              lastRerollDay >= day ? '今日已重整過，明天再來'
                : money < cost ? `需要 $${cost}`
                  : `花 $${cost} 重新整理 5 個案件`
            }
          >
            {lastRerollDay >= day ? '🔄 今日已重整' : `🔄 重整收件匣 $${cost}`}
          </button>
        </div>

        {/* 便條紙列 */}
        {visible.length === 0 ? (
          <div
            className="px-3 pb-3 pt-1 text-[11px] text-center"
            style={{ color: 'var(--muted)' }}
          >
            收件匣空了，明天會補新案件
          </div>
        ) : (
          <div className="flex gap-3 px-3 pb-3 pt-2 overflow-x-auto" style={{ minHeight: 100 }}>
            {visible.map((p) => {
              const color = p.status === 'offered' ? OFFERED_COLOR : ACTIVE_COLOR;
              return (
                <StickyNote
                  key={p.id}
                  project={p}
                  day={day}
                  staff={staff}
                  color={color}
                  onClick={() => openModal(p)}
                />
              );
            })}
          </div>
        )}
      </div>

      {openProjectId && (
        <ProjectDetailModal
          projectId={openProjectId}
          onClose={() => setOpenProjectId(null)}
        />
      )}
    </>
  );
}

function StickyNote({
  project,
  day,
  staff,
  color,
  onClick,
}: {
  project: Project;
  day: number;
  staff: Dog[];
  color: { bg: string; border: string };
  onClick: () => void;
}) {
  const isOffered = project.status === 'offered';
  const progress = isOffered ? 0 : Math.min(100, (project.workDone / project.workRequired) * 100);
  const daysLeft = isOffered
    ? OFFER_TTL_DAYS - (day - project.createdDay) // offered: 距離過期天數
    : project.deadlineDay - day;                  // active: 距離 deadline 天數
  const overdue = !isOffered && daysLeft < 0;
  const urgent = !overdue && daysLeft <= 1;
  // active 案件：已進行天數 / 期限 / 容忍
  const acceptedDay = project.acceptedDay ?? day;
  const progressDays = day - acceptedDay;
  const totalDays = project.defaultDeadlineDays;
  const graceDays = project.graceDays;

  const assignedDogs = staff.filter((d) => project.assignedStaffIds.includes(d.id));
  const hasPending = !!project.pendingEvent;

  return (
    <button
      type="button"
      onClick={onClick}
      className={hasPending ? 'sticky-note sticky-note-pending' : 'sticky-note'}
      style={{
        flex: '0 0 auto',
        width: 200,
        padding: '10px 12px',
        background: color.bg,
        border: `1.5px solid ${color.border}`,
        borderRadius: 6,
        boxShadow: '0 4px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
        transform: 'rotate(-1.5deg)',
        textAlign: 'left',
        cursor: 'pointer',
        position: 'relative',
        fontFamily: 'inherit',
        opacity: isOffered ? 0.92 : 1,
      }}
      title={hasPending ? '⚠️ 點擊處理事件' : isOffered ? '點擊查看 / 接案' : '點擊查看 / 指派員工'}
    >
      {/* 紙膠帶頂部 */}
      <div
        style={{
          position: 'absolute',
          top: -6,
          left: '50%',
          transform: 'translateX(-50%) rotate(2deg)',
          width: 40,
          height: 12,
          background: 'rgba(150, 130, 100, 0.35)',
          borderRadius: 1,
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      />

      {/* 標題列 */}
      <div className="flex items-center gap-1 mb-1">
        <span style={{ fontSize: 14 }}>{CATEGORY_ICON[project.category]}</span>
        <span
          className="text-[11px] font-extrabold flex-1 truncate"
          style={{ color: '#3d2f25' }}
        >
          {project.title}
        </span>
        <span
          className="text-[9px] px-1 py-0.5 rounded font-bold"
          style={{ background: tierColor(project.clientTier), color: 'white' }}
        >
          T{project.clientTier}
        </span>
      </div>

      {/* 客戶 + 期限 */}
      <div className="flex items-center justify-between text-[10px] mb-1.5">
        <span className="truncate" style={{ color: 'rgba(60,40,30,0.7)' }}>
          {project.clientName}
        </span>
        <span
          className="font-bold whitespace-nowrap"
          style={{ color: overdue ? '#c0392b' : urgent ? '#a36a3a' : 'rgba(60,40,30,0.7)' }}
        >
          {isOffered
            ? `📅 過期剩 ${Math.max(0, daysLeft)} 天`
            : overdue
              ? `📅 ${progressDays}/${totalDays} 超${-daysLeft}`
              : `📅 ${progressDays}/${totalDays} (+${graceDays})`}
        </span>
      </div>

      {/* offered: 顯示 reward；active: 顯示進度條 */}
      {isOffered ? (
        <div
          className="h-5 flex items-center justify-between px-1 rounded text-[11px] mb-1"
          style={{ background: 'rgba(0,0,0,0.06)' }}
        >
          <span style={{ color: 'rgba(60,40,30,0.7)' }}>酬勞</span>
          <span className="font-extrabold" style={{ color: '#3a7a3f' }}>${project.reward}</span>
        </div>
      ) : (
        <div
          className="h-1.5 rounded-full overflow-hidden mb-1"
          style={{ background: 'rgba(0,0,0,0.12)' }}
        >
          <div
            className="h-full"
            style={{
              width: `${progress}%`,
              background: overdue ? '#c0392b' : 'linear-gradient(90deg, #66bb6a, #3a8a3a)',
              transition: 'width 0.3s',
            }}
          />
        </div>
      )}

      {/* 員工 emoji + 待處理事件徽章 */}
      <div className="flex items-center gap-1 text-[11px]">
        {hasPending ? (
          <span className="font-bold flex-1" style={{ color: '#c0392b' }}>
            ⚠️ 事件待處理
          </span>
        ) : isOffered ? (
          <span style={{ color: 'rgba(60,40,30,0.65)' }}>
            👆 點擊接案
          </span>
        ) : assignedDogs.length === 0 ? (
          <span style={{ color: '#c0392b', fontWeight: 'bold' }}>👥 未指派</span>
        ) : (
          <span className="flex-1 truncate">
            {assignedDogs.map((d) => d.emoji).join('')}{' '}
            <span style={{ color: 'rgba(60,40,30,0.65)' }}>
              {Math.round(project.workDone)}/{project.workRequired}
            </span>
          </span>
        )}
      </div>
    </button>
  );
}
