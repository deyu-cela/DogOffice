import { useState } from 'react';
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

export function TeamPanel() {
  const teams = useGameStore((s) => s.teams);
  const staff = useGameStore((s) => s.staff);

  const staffById = new Map(staff.map((d) => [d.id, d]));
  const eligibleByIndustry: Record<ProjectCategory, Dog[]> = {
    tech: [], design: [], marketing: [], service: [],
  };
  for (const dog of staff) {
    const industry = dogPrimaryIndustry(dog.role);
    eligibleByIndustry[industry].push(dog);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-bold" style={{ color: 'var(--muted)' }}>
        產業 Team・有 ≥ 1 隻同產業狗才能開啟
      </div>
      {INDUSTRIES.map((industry) => (
        <TeamCard
          key={industry}
          industry={industry}
          team={teams[industry]}
          eligible={eligibleByIndustry[industry]}
          staffById={staffById}
        />
      ))}
    </div>
  );
}

function TeamCard({
  industry,
  team,
  eligible,
  staffById,
}: {
  industry: ProjectCategory;
  team: { open: boolean; memberIds: string[] };
  eligible: Dog[];
  staffById: Map<string, Dog>;
}) {
  const toggle = useGameStore((s) => s.toggleTeamOpen);
  const addDog = useGameStore((s) => s.addDogToTeam);
  const removeDog = useGameStore((s) => s.removeDogFromTeam);
  const [editing, setEditing] = useState(false);

  const members = team.memberIds.map((id) => staffById.get(id)).filter((d): d is Dog => !!d);
  const canOpen = team.memberIds.length > 0;
  const color = INDUSTRY_COLOR[industry];

  const availableToAdd = eligible.filter((d) => !team.memberIds.includes(d.id));

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: team.open ? `${color}10` : '#f7fbff',
        border: team.open ? `1.5px solid ${color}` : '1px solid var(--line)',
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: `${color}22`, border: `1px solid ${color}55` }}
          >
            <SvgIcon name={INDUSTRY_ICON[industry]} size={18} />
          </span>
          <div className="text-left">
            <div className="text-sm font-extrabold" style={{ color: '#173b78' }}>
              {INDUSTRY_LABEL[industry]} Team
            </div>
            <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
              {team.memberIds.length} / {TEAM_MAX_MEMBERS} 人
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => toggle(industry)}
          disabled={!canOpen}
          className="text-[11px] px-2.5 py-1 rounded-full font-extrabold"
          style={{
            background: team.open ? color : canOpen ? '#ffffff' : '#e9f1ff',
            color: team.open ? 'white' : canOpen ? '#446da8' : '#8aa2c8',
            border: `1px solid ${team.open ? color : 'var(--line)'}`,
            cursor: canOpen ? 'pointer' : 'not-allowed',
          }}
          title={canOpen ? (team.open ? '關閉接案' : '開啟接案') : '需要至少 1 隻該產業的狗'}
        >
          {team.open ? '營業中' : canOpen ? '休業中' : '未解鎖'}
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-[11px] text-center py-2" style={{ color: 'var(--muted)' }}>
          尚無成員 — 抽到 {INDUSTRY_LABEL[industry]} 產業的狗會自動加入
        </div>
      ) : (
        <div className="flex flex-wrap gap-1">
          {members.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => removeDog(industry, d.id)}
              className="text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
              style={{ background: '#ffffff', border: '1px solid var(--line)', color: 'var(--blue)' }}
              title={`點擊移出 ${d.name}`}
            >
              <DogAvatar role={d.role} breed={d.breed} size={16} />
              <span>{d.name}</span>
              <span style={{ color: '#9aa9c0' }}>Lv{d.level}</span>
              <span style={{ color: '#d34a4a' }}>X</span>
            </button>
          ))}
        </div>
      )}

      {availableToAdd.length > 0 && team.memberIds.length < TEAM_MAX_MEMBERS && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-[11px] px-2 py-1 rounded-full font-bold"
            style={{ background: '#eef6ff', color: '#446da8', border: '1px solid var(--line)' }}
          >
            {editing ? '收合' : `+ 加入候選人（${availableToAdd.length}）`}
          </button>
          {editing && (
            <div className="mt-2 flex flex-wrap gap-1">
              {availableToAdd.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    addDog(industry, d.id);
                    if (team.memberIds.length + 1 >= TEAM_MAX_MEMBERS) setEditing(false);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                  style={{ background: '#ffffff', border: '1px dashed var(--line)', color: 'var(--blue)' }}
                >
                  <DogAvatar role={d.role} breed={d.breed} size={16} />
                  <span>{d.name}</span>
                  <span style={{ color: '#9aa9c0' }}>Lv{d.level}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
