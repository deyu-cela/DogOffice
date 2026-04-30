import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore, TEAM_MAX_MEMBERS, dogPrimaryIndustry } from '@/store/gameStore';
import { DogAvatar } from '@/components/DogAvatar';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';
import type { Dog, ProjectCategory } from '@/types';

const INDUSTRIES: ProjectCategory[] = ['tech', 'design', 'marketing', 'service'];

const INDUSTRY_LABEL: Record<ProjectCategory, string> = {
  tech: '工程',
  design: '美術',
  marketing: '行銷',
  service: '客服',
};

const INDUSTRY_COLOR: Record<ProjectCategory, string> = {
  tech: '#5a8ce6',
  design: '#e88aaa',
  marketing: '#e8a85a',
  service: '#5fb38f',
};

const INDUSTRY_ICON: Record<ProjectCategory, SvgIconName> = {
  tech: 'tech',
  design: 'design',
  marketing: 'marketing',
  service: 'service',
};

type Filter = 'all' | ProjectCategory;

export function TeamEditModal({ onClose }: { onClose: () => void }) {
  const teams = useGameStore((s) => s.teams);
  const staff = useGameStore((s) => s.staff);
  const addDog = useGameStore((s) => s.addDogToTeam);
  const removeDog = useGameStore((s) => s.removeDogFromTeam);
  const toggleTeam = useGameStore((s) => s.toggleTeamOpen);

  const [activeIndustry, setActiveIndustry] = useState<ProjectCategory>(() => {
    const open = INDUSTRIES.find((i) => teams[i].open);
    if (open) return open;
    const withMembers = INDUSTRIES.find((i) => teams[i].memberIds.length > 0);
    return withMembers ?? 'tech';
  });
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const team = teams[activeIndustry];
  const staffById = useMemo(() => new Map(staff.map((d) => [d.id, d])), [staff]);
  const memberSet = useMemo(() => new Set(team.memberIds), [team.memberIds]);
  const filteredStaff = useMemo(
    () => (filter === 'all' ? staff : staff.filter((d) => dogPrimaryIndustry(d.role) === filter)),
    [staff, filter],
  );

  const headerColor = INDUSTRY_COLOR[activeIndustry];

  const modal = (
    <div
      className="fixed inset-0 z-[860] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,32,77,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl flex flex-col w-full"
        style={{
          maxWidth: 720,
          maxHeight: '90vh',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: industry tabs */}
        <div className="p-4 pb-3 flex items-center gap-2 flex-wrap" style={{ borderBottom: '1px solid var(--line)' }}>
          {INDUSTRIES.map((ind) => {
            const active = ind === activeIndustry;
            const color = INDUSTRY_COLOR[ind];
            const t = teams[ind];
            return (
              <button
                key={ind}
                type="button"
                onClick={() => setActiveIndustry(ind)}
                className="text-sm px-3 py-1.5 rounded-lg font-extrabold inline-flex items-center gap-1.5"
                style={{
                  background: active ? color : '#ffffff',
                  color: active ? 'white' : '#446da8',
                  border: `1.5px solid ${active ? color : 'var(--line)'}`,
                  boxShadow: active ? `0 4px 10px ${color}55` : 'none',
                }}
              >
                <SvgIcon name={INDUSTRY_ICON[ind]} size={16} />
                <span>{INDUSTRY_LABEL[ind]}</span>
                <span className="text-[10px] opacity-80">{t.memberIds.length}/{TEAM_MAX_MEMBERS}</span>
                {t.open && <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? 'white' : color }} />}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-sm px-2.5 py-1 rounded-full"
            style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
          >
            X
          </button>
        </div>

        {/* Active team: name + open switch + 4 slots */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-base font-extrabold" style={{ color: '#173b78' }}>
              {INDUSTRY_LABEL[activeIndustry]} Team
            </div>
            <button
              type="button"
              onClick={() => toggleTeam(activeIndustry)}
              disabled={team.memberIds.length === 0}
              className="text-xs px-3 py-1 rounded-full font-extrabold"
              style={{
                background: team.open ? headerColor : team.memberIds.length === 0 ? '#e9f1ff' : '#ffffff',
                color: team.open ? 'white' : team.memberIds.length === 0 ? '#8aa2c8' : '#446da8',
                border: `1px solid ${team.open ? headerColor : 'var(--line)'}`,
                cursor: team.memberIds.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {team.open ? '營業中' : team.memberIds.length === 0 ? '未解鎖' : '休業中'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: TEAM_MAX_MEMBERS }, (_, i) => {
              const memberId = team.memberIds[i];
              const dog = memberId ? staffById.get(memberId) : null;
              return (
                <SlotCell
                  key={i}
                  dog={dog ?? null}
                  color={headerColor}
                  onClick={() => dog && removeDog(activeIndustry, dog.id)}
                />
              );
            })}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--line)' }} />

        {/* Filter row */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold mr-1" style={{ color: 'var(--muted)' }}>篩選</span>
          <FilterChip label="全部" active={filter === 'all'} onClick={() => setFilter('all')} count={staff.length} />
          {INDUSTRIES.map((ind) => (
            <FilterChip
              key={ind}
              label={INDUSTRY_LABEL[ind]}
              color={INDUSTRY_COLOR[ind]}
              active={filter === ind}
              onClick={() => setFilter(ind)}
              count={staff.filter((d) => dogPrimaryIndustry(d.role) === ind).length}
            />
          ))}
        </div>

        {/* Staff grid (4 per row) */}
        <div className="px-4 pb-4 overflow-y-auto" style={{ flex: 1 }}>
          {filteredStaff.length === 0 ? (
            <div className="text-center text-sm py-6" style={{ color: 'var(--muted)' }}>
              這個篩選沒有員工
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {filteredStaff.map((d) => (
                <StaffCell
                  key={d.id}
                  dog={d}
                  inTeam={memberSet.has(d.id)}
                  teamFull={team.memberIds.length >= TEAM_MAX_MEMBERS}
                  onClick={() => {
                    if (memberSet.has(d.id)) {
                      removeDog(activeIndustry, d.id);
                    } else if (team.memberIds.length < TEAM_MAX_MEMBERS) {
                      addDog(activeIndustry, d.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function SlotCell({
  dog,
  color,
  onClick,
}: {
  dog: Dog | null;
  color: string;
  onClick: () => void;
}) {
  if (!dog) {
    return (
      <div
        className="rounded-lg flex items-center justify-center"
        style={{
          height: 88,
          background: 'rgba(255,255,255,0.6)',
          border: `2px dashed ${color}55`,
          color: '#9aacc5',
          fontSize: 11,
          fontWeight: 800,
        }}
      >
        空位
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 flex flex-col items-center justify-center gap-1 cursor-pointer"
      style={{
        height: 88,
        background: 'rgba(255,255,255,0.95)',
        border: `2px solid ${color}`,
        boxShadow: `0 4px 10px ${color}33`,
      }}
      title={`點擊移出 ${dog.name}`}
    >
      <div
        className="rounded-full overflow-hidden flex items-center justify-center"
        style={{ width: 36, height: 36, border: '1.5px solid white', background: '#eef6ff' }}
      >
        {dog.image ? (
          <img src={dog.image} alt={dog.name} className="block h-full w-full object-contain" draggable={false} />
        ) : (
          <DogAvatar role={dog.role} breed={dog.breed} size={36} />
        )}
      </div>
      <div className="text-[11px] font-extrabold leading-none" style={{ color: '#173b78' }}>{dog.name}</div>
      <div className="text-[10px]" style={{ color: 'var(--muted)' }}>Lv.{dog.level}・{dog.role}</div>
    </button>
  );
}

function StaffCell({
  dog,
  inTeam,
  teamFull,
  onClick,
}: {
  dog: Dog;
  inTeam: boolean;
  teamFull: boolean;
  onClick: () => void;
}) {
  const industry = dogPrimaryIndustry(dog.role);
  const color = INDUSTRY_COLOR[industry];
  const disabled = !inTeam && teamFull;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg p-2 flex flex-col items-center gap-1 cursor-pointer transition"
      style={{
        background: inTeam ? `${color}22` : '#ffffff',
        border: inTeam ? `2px solid ${color}` : '1px solid var(--line)',
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      title={
        disabled
          ? '隊伍已滿（4/4），先移除其他成員'
          : inTeam
            ? `點擊移出 ${dog.name}`
            : `點擊加入 ${dog.name}`
      }
    >
      <div
        className="rounded-full overflow-hidden flex items-center justify-center"
        style={{ width: 36, height: 36, border: '1.5px solid white', background: '#eef6ff' }}
      >
        {dog.image ? (
          <img src={dog.image} alt={dog.name} className="block h-full w-full object-contain" draggable={false} />
        ) : (
          <DogAvatar role={dog.role} breed={dog.breed} size={36} />
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-extrabold leading-none" style={{ color: '#173b78' }}>{dog.name}</span>
        <span
          className="text-[9px] px-1 rounded-sm"
          style={{ background: 'linear-gradient(180deg, #ffd95a, #f0a818)', color: '#6a3d05' }}
        >
          Lv{dog.level}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span
          className="text-[9px] px-1 rounded-sm"
          style={{ background: color, color: 'white' }}
        >
          {INDUSTRY_LABEL[industry]}
        </span>
        <span className="text-[9px]" style={{ color: 'var(--muted)' }}>{dog.role}</span>
      </div>
      {inTeam && (
        <span className="text-[9px] mt-0.5 font-extrabold" style={{ color }}>已加入</span>
      )}
    </button>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  color,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
  count: number;
}) {
  const accent = color ?? '#446da8';
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] px-2 py-0.5 rounded-full font-extrabold"
      style={{
        background: active ? accent : '#ffffff',
        color: active ? 'white' : accent,
        border: `1px solid ${active ? accent : 'var(--line)'}`,
      }}
    >
      {label} <span className="opacity-75">({count})</span>
    </button>
  );
}
