import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore, teamMaxMembers, dogPrimaryIndustry } from '@/store/gameStore';
import { DogAvatar } from '@/components/DogAvatar';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';
import { dogPower, dogPowerStars, dogGrade, type DogGradeUI } from '@/lib/utils';
import type { Dog, Project, ProjectCategory } from '@/types';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';

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

// 稀有度漸層邊框（4px）
const GRADE_BORDER: Record<DogGradeUI, string> = {
  U: 'conic-gradient(from 0deg, #ff7eb6, #ffd87e, #7eff9e, #7ec5ff, #be7eff, #ff7eb6)',
  S: 'linear-gradient(180deg, #ffe066 0%, #ffc107 50%, #b86b00 100%)',
  A: 'linear-gradient(180deg, #e2b6ff 0%, #b04ce0 50%, #5e1a8a 100%)',
  B: 'linear-gradient(180deg, #a4f0bd 0%, #28b964 50%, #145c30 100%)',
  C: 'linear-gradient(180deg, #a8c8ff 0%, #2f6dde 50%, #102b56 100%)',
  D: 'linear-gradient(180deg, #d2d6dd 0%, #7a8290 50%, #2c333f 100%)',
};

// 外發光環色（U=粉、S=金、A=紫、B=綠、C=藍、D=灰）
const GRADE_RING_COLOR: Record<DogGradeUI, string> = {
  U: '#ff7eb6',
  S: '#ffc107',
  A: '#b04ce0',
  B: '#28b964',
  C: '#2f6dde',
  D: '#7a8290',
};

// GradeGem 文字色：依背景明度決定
const GRADE_TEXT_COLOR: Record<DogGradeUI, string> = {
  U: '#ffffff',
  S: '#5a3000',
  A: '#ffffff',
  B: '#0a3a1f',
  C: '#ffffff',
  D: '#ffffff',
};

// GradeGem 寶石背景：radial 從中心高光到 base
const GRADE_GEM_BG: Record<DogGradeUI, string> = {
  U: 'radial-gradient(circle at 30% 28%, #fff8ff 0%, #ffb8e8 30%, #b577ff 60%, #4a1c8e 100%)',
  S: 'radial-gradient(circle at 30% 28%, #fff7c2 0%, #ffd24a 35%, #c87800 100%)',
  A: 'radial-gradient(circle at 30% 28%, #f6dfff 0%, #c265e6 40%, #5e1a8a 100%)',
  B: 'radial-gradient(circle at 30% 28%, #d6ffe0 0%, #3dcf73 40%, #145c30 100%)',
  C: 'radial-gradient(circle at 30% 28%, #d6ecff 0%, #3d7fef 40%, #102b56 100%)',
  D: 'radial-gradient(circle at 30% 28%, #f0f2f5 0%, #8a8f9a 50%, #3a4150 100%)',
};

// 卡片背景：每階一個鮮明 hue，多層 radial 製造光感（U 額外疊一層產生 holo 多色）
const RARITY_BG: Record<DogGradeUI, string> = {
  U: 'radial-gradient(ellipse at 30% 20%, #ffe1ff 0%, #c5a3ff 25%, #6e3eb8 65%, #2a1858 100%), radial-gradient(ellipse at 70% 30%, rgba(154,214,255,0.4) 0%, transparent 50%)',
  S: 'radial-gradient(ellipse at 30% 20%, #fff5c2 0%, #ffc83d 35%, #c8780f 70%, #5a3208 100%)',
  A: 'radial-gradient(ellipse at 30% 20%, #f3d5ff 0%, #c265e6 35%, #6f25a4 70%, #2e0a52 100%)',
  B: 'radial-gradient(ellipse at 30% 20%, #d6ffe0 0%, #3dcf73 35%, #1f8a4d 70%, #0e3a22 100%)',
  C: 'radial-gradient(ellipse at 30% 20%, #d6ecff 0%, #3d7fef 35%, #1f4ab8 70%, #0e1f4a 100%)',
  D: 'radial-gradient(ellipse at 30% 20%, #ececf0 0%, #8a8f9a 50%, #3a4150 100%)',
};

const GRADE_ORDER: Record<DogGradeUI, number> = { U: 0, S: 1, A: 2, B: 3, C: 4, D: 5 };

function industryGlassBg(industry: ProjectCategory): string {
  const c = INDUSTRY_COLOR[industry];
  // 玻璃感：上方白光 + 產業色透明漸層
  return `linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 30%), linear-gradient(135deg, ${c}88 0%, ${c}40 100%)`;
}

function industryTint(industry: ProjectCategory): string {
  const c = INDUSTRY_COLOR[industry];
  return `linear-gradient(180deg, ${c}33 0%, transparent 70%)`;
}

type Filter = 'all' | string; // 'all' 或具體職業名（工程師、QA、PM、…）
type SortKey = 'power' | 'level' | 'grade' | 'name';

// 職業 chip 的顯示順序（依產業分組）
const ROLE_ORDER: string[] = [
  '工程師', 'QA',
  '美術', '企劃',
  '業務', '行銷',
  '客服',
  'PM',
  'CEO',
];

const SORT_LABEL: Record<SortKey, string> = {
  power: '工作能力 ↓',
  level: '等級 ↓',
  grade: '稀有度 ↓',
  name: '名字 A-Z',
};

function activeChemistryForTeam(dogs: Dog[], category: ProjectCategory) {
  if (dogs.length < 2) return [];
  const roles = new Set(dogs.map((d) => d.role));
  return CHEMISTRY_COMBOS.filter((combo) => {
    if (combo.category && combo.category !== 'any' && combo.category !== category) return false;
    return combo.roles.every((role) => roles.has(role));
  });
}

export function TeamEditModal({ onClose }: { onClose: () => void }) {
  const teams = useGameStore((s) => s.teams);
  const staff = useGameStore((s) => s.staff);
  const clients = useGameStore((s) => s.clients);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const addDog = useGameStore((s) => s.addDogToTeam);
  const removeDog = useGameStore((s) => s.removeDogFromTeam);
  const toggleTeam = useGameStore((s) => s.toggleTeamOpen);
  const autoFillTeam = useGameStore((s) => s.autoFillTeam);
  const openStaffAction = useGameStore((s) => s.openStaffAction);

  // 隊伍上限（依辦公室等級）
  const maxMembers = teamMaxMembers(officeLevel);

  const showDetails = (dogId: string) => {
    const idx = staff.findIndex((d) => d.id === dogId);
    if (idx >= 0) openStaffAction(idx);
  };

  const [activeIndustry, setActiveIndustry] = useState<ProjectCategory>(() => {
    const open = INDUSTRIES.find((i) => teams[i].open);
    if (open) return open;
    const withMembers = INDUSTRIES.find((i) => teams[i].memberIds.length > 0);
    return withMembers ?? 'tech';
  });
  const [filter, setFilter] = useState<Filter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('power');
  const [editMode, setEditMode] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 切 tab 時清除編輯模式
  useEffect(() => {
    setEditMode(false);
  }, [activeIndustry]);

  const team = teams[activeIndustry];
  const staffById = useMemo(() => new Map(staff.map((d) => [d.id, d])), [staff]);
  const memberSet = useMemo(() => new Set(team.memberIds), [team.memberIds]);
  // 每個員工目前在哪個 team（員工不能跨 team）
  const dogTeamMap = useMemo(() => {
    const map = new Map<string, ProjectCategory>();
    for (const ind of INDUSTRIES) {
      for (const id of teams[ind].memberIds) {
        map.set(id, ind);
      }
    }
    return map;
  }, [teams]);
  const filteredStaff = useMemo(() => {
    const base = filter === 'all' ? staff : staff.filter((d) => d.role === filter);
    return [...base].sort((a, b) => {
      switch (sortKey) {
        case 'power': return dogPower(b) - dogPower(a);
        case 'level': return b.level - a.level;
        case 'grade': return GRADE_ORDER[dogGrade(a)] - GRADE_ORDER[dogGrade(b)];
        case 'name': return a.name.localeCompare(b.name);
      }
    });
  }, [staff, filter, sortKey]);

  // 動態列出目前員工有的職業（依固定順序）
  const visibleRoles = useMemo(() => {
    const have = new Set(staff.map((d) => d.role));
    const ordered = ROLE_ORDER.filter((r) => have.has(r));
    // 如有未列入 ROLE_ORDER 的自訂職業，附在後面
    const extras = [...have].filter((r) => !ROLE_ORDER.includes(r));
    return [...ordered, ...extras];
  }, [staff]);
  const activeProjects = useMemo(
    () => clients.filter((c) => c.status === 'active' && c.category === activeIndustry),
    [clients, activeIndustry],
  );

  const headerColor = INDUSTRY_COLOR[activeIndustry];
  const teamMembers = team.memberIds
    .map((id) => staffById.get(id))
    .filter((d): d is Dog => !!d);
  const activeChemistry = activeChemistryForTeam(teamMembers, activeIndustry);
  const teamTotalPower = teamMembers.reduce((n, d) => n + dogPower(d), 0);
  const teamAvgLevel = teamMembers.length
    ? teamMembers.reduce((n, d) => n + d.level, 0) / teamMembers.length
    : 0;
  const teamTotalStars = teamMembers.length
    ? Math.round(teamMembers.reduce((n, d) => n + dogPowerStars(dogPower(d)), 0) / teamMembers.length)
    : 0;

  const modal = (
    <div
      className="fixed inset-0 z-[860] flex items-center justify-center p-4"
      style={{ background: 'rgba(91,56,45,0.32)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl flex flex-col w-full"
        style={{
          maxWidth: 1440,
          height: 'min(92vh, 860px)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,247,239,0.9)), repeating-linear-gradient(0deg, rgba(186,121,82,0.06) 0 1px, transparent 1px 18px), #f7d6bf',
          border: '1px solid rgba(208,130,105,0.38)',
          boxShadow: '0 24px 70px rgba(72,40,34,0.24)',
          backdropFilter: 'blur(10px) saturate(1.04)',
          WebkitBackdropFilter: 'blur(10px) saturate(1.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: industry tabs (高度 -40%) */}
        <div className="px-3 pt-3 pb-1.5 flex items-center gap-1 flex-wrap" style={{ borderBottom: '1px solid var(--line)' }}>
          {INDUSTRIES.map((ind) => {
            const active = ind === activeIndustry;
            const color = INDUSTRY_COLOR[ind];
            const t = teams[ind];
            return (
              <button
                key={ind}
                type="button"
                onClick={() => setActiveIndustry(ind)}
                className="text-[11px] rounded-md font-extrabold inline-flex items-center gap-1"
                style={{
                  background: active ? color : '#ffffff',
                  color: active ? 'white' : '#446da8',
                  border: `1.5px solid ${active ? color : 'var(--line)'}`,
                  boxShadow: active ? `0 3px 8px ${color}55` : 'none',
                  padding: '3px 8px',
                  lineHeight: 1.2,
                }}
              >
                <SvgIcon name={INDUSTRY_ICON[ind]} size={13} />
                <span>{INDUSTRY_LABEL[ind]}</span>
                <span className="text-[9px] opacity-80">{t.memberIds.length}/{maxMembers}</span>
                {t.open && <span className="w-1 h-1 rounded-full" style={{ background: active ? 'white' : color }} />}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-[11px] px-2 py-[2px] rounded-full"
            style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
          >
            X
          </button>
          <p className="w-full text-[10px] mt-0.5 mb-0" style={{ color: 'var(--muted)' }}>
            切換 4 個產業 team；每隊最多 {maxMembers} 員，team 必須「開放接案」才會接該產業案子。
          </p>
        </div>

        {/* Active team header: title + projects + edit/done + open toggle */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="text-base font-extrabold whitespace-nowrap" style={{ color: '#173b78' }}>
              {INDUSTRY_LABEL[activeIndustry]} Team
            </div>
            <div
              className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto"
              style={{ scrollbarWidth: 'thin' }}
            >
              {activeProjects.length === 0 ? (
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>沒有處理中的案子</span>
              ) : (
                activeProjects.map((p) => <ProjectChip key={p.id} project={p} color={headerColor} />)
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              className="text-[10px] rounded-full font-extrabold whitespace-nowrap"
              style={{
                background: editMode ? headerColor : '#ffffff',
                color: editMode ? 'white' : headerColor,
                border: `1px solid ${headerColor}`,
                padding: '1px 8px',
              }}
            >
              {editMode ? '✓ 完成' : '✏ 編輯隊伍'}
            </button>
            <button
              type="button"
              onClick={() => autoFillTeam(activeIndustry)}
              className="text-[10px] rounded-full font-extrabold whitespace-nowrap"
              style={{
                background: '#ffffff',
                color: headerColor,
                border: `1px dashed ${headerColor}`,
                padding: '1px 8px',
              }}
              title="根據能力與化學反應自動填入最佳組合"
            >
              ✨ 自動配對
            </button>
            <button
              type="button"
              onClick={() => toggleTeam(activeIndustry)}
              disabled={team.memberIds.length === 0}
              className="text-[10px] rounded-full font-extrabold whitespace-nowrap"
              style={{
                background: team.open ? headerColor : team.memberIds.length === 0 ? '#e9f1ff' : '#ffffff',
                color: team.open ? 'white' : team.memberIds.length === 0 ? '#8aa2c8' : '#446da8',
                border: `1px solid ${team.open ? headerColor : 'var(--line)'}`,
                cursor: team.memberIds.length === 0 ? 'not-allowed' : 'pointer',
                padding: '1px 8px',
              }}
            >
              {team.open ? '開放接案' : team.memberIds.length === 0 ? '未解鎖' : '已關閉'}
            </button>
          </div>

          

          <div
            className="mt-2 px-3 py-2 rounded-lg"
            style={{
              background: activeChemistry.length > 0 ? '#ffffff' : '#f7fbff',
              border: `1px solid ${activeChemistry.length > 0 ? `${headerColor}55` : 'var(--line)'}`,
            }}
          >
            <div className="text-[11px] font-black mb-1" style={{ color: '#173b78' }}>
              化學反應
            </div>
            {activeChemistry.length === 0 ? (
              <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                目前沒有觸發化學反應
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {activeChemistry.map((combo) => (
                  <span
                    key={`${combo.roles.join('-')}-${combo.category ?? 'any'}`}
                    className="text-[11px] px-2 py-1 rounded-md font-bold"
                    style={{
                      background: combo.type === 'positive' ? '#eefaf7' : '#fff1f1',
                      color: combo.type === 'positive' ? '#16845f' : '#c44242',
                      border: `1px solid ${combo.type === 'positive' ? 'rgba(51,194,154,0.28)' : 'rgba(239,68,68,0.24)'}`,
                    }}
                    title={combo.msg}
                  >
                    {combo.type === 'positive' ? '正向' : '負面'}：{combo.roles.join(' + ')}
                  </span>
                ))}
              </div>
            )}
          </div>
{/* Team slots */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
              gap: 10,
            }}
          >
            {Array.from({ length: maxMembers }, (_, i) => {
              const memberId = team.memberIds[i];
              const dog = memberId ? staffById.get(memberId) : null;
              const startColumn = i === 0 ? Math.max(1, Math.floor((10 - maxMembers) / 2) + 1) : undefined;
              return (
                <div key={i} style={{ gridColumnStart: startColumn }}>
                  <SlotCell
                    dog={dog ?? null}
                    color={headerColor}
                    editMode={editMode}
                    onShowDetails={() => dog && showDetails(dog.id)}
                    onRemove={() => dog && removeDog(activeIndustry, dog.id)}
                  />
                </div>
              );
            })}
          </div>

          {/* Team total power */}
          <div
            className="mt-2 px-3 py-1.5 rounded-lg flex items-center gap-3 flex-wrap"
            style={{
              background: industryGlassBg(activeIndustry),
              backgroundOrigin: 'border-box',
              border: `1.5px solid ${headerColor}66`,
              boxShadow: `0 0 0 1px ${headerColor}22, 0 2px 6px ${headerColor}33`,
            }}
          >
            <span className="text-[11px] font-bold" style={{ color: '#173b78' }}>團隊總能力</span>
            <span className="text-[14px] font-black" style={{ color: '#7a4a1c' }}>💼 {teamTotalPower}</span>
            <span style={{ fontSize: 12, letterSpacing: 1 }}>
              <span style={{ color: '#f0a818' }}>{'★'.repeat(teamTotalStars)}</span>
              <span style={{ color: '#d0d8e4' }}>{'★'.repeat(5 - teamTotalStars)}</span>
            </span>
            <span className="text-[11px] ml-auto" style={{ color: 'var(--muted)' }}>
              {teamMembers.length > 0 ? `平均 Lv.${teamAvgLevel.toFixed(1)} ・ ${teamMembers.length}/${maxMembers} 員` : '尚未編組'}
            </span>
          </div>

          {/* edit mode hint */}
          {editMode && (
            <div className="mt-1.5 text-center text-[11px] font-bold" style={{ color: headerColor }}>
              編輯模式：點擊員工卡片 加入或移出 {INDUSTRY_LABEL[activeIndustry]} 隊伍
            </div>
          )}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--line)' }} />

        {/* Filter row + sort（依職業分） */}
        <div className="px-4 pt-1.5 pb-1 flex items-center gap-1 flex-wrap">
          <FilterChip label="全部" active={filter === 'all'} onClick={() => setFilter('all')} count={staff.length} />
          {visibleRoles.map((role) => {
            const industry = dogPrimaryIndustry(role);
            return (
              <FilterChip
                key={role}
                label={role}
                color={INDUSTRY_COLOR[industry]}
                active={filter === role}
                onClick={() => setFilter(role)}
                count={staff.filter((d) => d.role === role).length}
              />
            );
          })}
          <div className="ml-auto relative">
            <button
              type="button"
              onClick={() => setSortMenuOpen((v) => !v)}
              className="text-[11px] font-bold tracking-wide rounded-md inline-flex items-center gap-1"
              style={{
                background: '#ffffff',
                color: '#446da8',
                border: '1px solid var(--line)',
                padding: '2px 8px',
              }}
            >
              <span>{SORT_LABEL[sortKey]}</span>
              <span style={{ fontSize: 10 }}>▼</span>
            </button>
            {sortMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 rounded-md overflow-hidden z-20"
                style={{
                  background: 'white',
                  border: '1px solid var(--line)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  minWidth: 140,
                }}
              >
                {(['power', 'level', 'grade', 'name'] as SortKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => { setSortKey(k); setSortMenuOpen(false); }}
                    className="block w-full text-left text-[11px] font-bold tracking-wide"
                    style={{
                      padding: '6px 12px',
                      background: sortKey === k ? '#eef6ff' : 'white',
                      color: sortKey === k ? 'var(--blue)' : '#446da8',
                    }}
                  >
                    {SORT_LABEL[k]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Staff grid */}
        <div className="px-4 pb-4 overflow-y-auto" style={{ flex: 1 }}>
          {filteredStaff.length === 0 ? (
            <div className="text-center text-sm py-6" style={{ color: 'var(--muted)' }}>
              這個篩選沒有員工
            </div>
          ) : (
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
                gap: 10,
              }}
            >
              {filteredStaff.map((d) => {
                const assignedTeam = dogTeamMap.get(d.id) ?? null;
                const inCurrent = assignedTeam === activeIndustry;
                const inOther = assignedTeam !== null && !inCurrent ? assignedTeam : null;
                return (
                  <StaffCell
                    key={d.id}
                    dog={d}
                    inTeam={inCurrent}
                    inOtherTeam={inOther}
                    teamFull={team.memberIds.length >= maxMembers}
                    editMode={editMode}
                    activeIndustryColor={headerColor}
                    onShowDetails={() => showDetails(d.id)}
                    onToggleTeam={() => {
                      if (inCurrent) {
                        removeDog(activeIndustry, d.id);
                      } else if (inOther) {
                        // 在別 team → 不允許動作
                        return;
                      } else if (team.memberIds.length < maxMembers) {
                        addDog(activeIndustry, d.id);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function ProjectChip({ project, color }: { project: Project; color: string }) {
  const ratio = project.workRequired > 0
    ? Math.max(0, Math.min(1, project.workDone / project.workRequired))
    : 0;
  const pct = Math.round(ratio * 100);
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md whitespace-nowrap"
      style={{
        background: 'rgba(255,255,255,0.85)',
        border: `1px solid ${color}55`,
      }}
      title={`${project.title} ・ ${project.workDone}/${project.workRequired} (${pct}%)`}
    >
      <span className="text-[11px] font-extrabold" style={{ color: '#173b78', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {project.title}
      </span>
      <div className="rounded-full overflow-hidden" style={{ width: 50, height: 5, background: '#e4eefc' }}>
        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-bold" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

function GradeBadge({ grade, size = 20 }: { grade: DogGradeUI; size?: number }) {
  const c = GRADE_RING_COLOR[grade];
  return (
    <span
      className="rounded-md flex items-center justify-center font-black"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.58,
        background: GRADE_GEM_BG[grade],
        color: GRADE_TEXT_COLOR[grade],
        border: `1px solid ${c}`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.4), 0 1px 4px ${c}88, inset 0 -1px 2px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.45)`,
        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
        letterSpacing: '-0.02em',
      }}
    >
      {grade}
    </span>
  );
}

function PowerStars({ count, size = 11 }: { count: number; size?: number }) {
  return (
    <span className="leading-none" style={{ fontSize: size, letterSpacing: 1 }}>
      <span style={{ color: '#f0a818' }}>{'★'.repeat(count)}</span>
      <span style={{ color: '#d0d8e4' }}>{'★'.repeat(5 - count)}</span>
    </span>
  );
}

function SlotCell({
  dog,
  color,
  editMode,
  onShowDetails,
  onRemove,
}: {
  dog: Dog | null;
  color: string;
  editMode: boolean;
  onShowDetails: () => void;
  onRemove: () => void;
}) {
  if (!dog) {
    return (
      <div
        className="relative rounded-sm flex items-center justify-center overflow-hidden"
        style={{
          aspectRatio: '0.68',
          minHeight: 132,
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 58%, #eef2f7 100%)',
          border: `2px dashed ${color}55`,
          color: '#9aacc5',
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        空位
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: 4, background: color }}
        />
      </div>
    );
  }

  const grade = dogGrade(dog);
  const power = dogPower(dog);
  const stars = dogPowerStars(power);
  const industry = dogPrimaryIndustry(dog.role);
  const isU = grade === 'U';
  const handleClick = editMode ? onRemove : onShowDetails;
  const ringColor = GRADE_RING_COLOR[grade];
  const bottomRankBg = isU
    ? GRADE_BORDER[grade]
    : `linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 28%), ${GRADE_BORDER[grade]}`;

  return (
    <div
      onClick={handleClick}
      className="relative rounded-sm overflow-hidden transition"
      style={{
        aspectRatio: '0.68',
        minHeight: 132,
        cursor: 'pointer',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 56%, #eef2f7 100%)',
        border: `1px solid ${ringColor}88`,
        boxShadow: editMode
          ? `0 0 0 2px ${color}, 0 4px 10px ${color}66`
          : '0 4px 10px rgba(15,23,42,0.14)',
        outline: editMode ? `2px dashed ${color}77` : 'none',
        outlineOffset: editMode ? '-2px' : '0',
      }}
      title={editMode ? `移出 ${dog.name}` : `查看 ${dog.name}`}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.85) 0%, transparent 16%, transparent 84%, rgba(15,23,42,0.08) 100%)',
        }}
      />

      <div className="absolute" style={{ inset: '2px -14% 36px -14%' }}>
        {dog.image ? (
          <img
            src={dog.image}
            alt={dog.name}
            className="block w-full h-full"
            style={{ objectFit: 'contain', objectPosition: 'center top' }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-start justify-center pt-2">
            <DogAvatar role={dog.role} breed={dog.breed} size={90} />
          </div>
        )}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: 48,
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.78) 42%, rgba(255,255,255,0.96) 100%)',
        }}
      />

      {isU && <SparkleOverlay />}

      <div className="absolute top-1.5 left-1.5 z-10">
        <GradeGem grade={grade} size={22} />
      </div>

      <span
        className="absolute top-1.5 right-1.5 z-10 text-[9px] font-extrabold rounded-sm"
        style={{
          padding: '1px 4px',
          background: 'linear-gradient(180deg,#ffe066,#f0a818)',
          color: '#6a3d05',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }}
      >
        Lv.{dog.level}
      </span>

      <div
        className="absolute z-10 rounded-full flex items-center justify-center"
        style={{
          right: 8,
          bottom: 44,
          width: 20,
          height: 20,
          background: INDUSTRY_COLOR[industry],
          border: '2px solid white',
          boxShadow: `0 2px 6px ${INDUSTRY_COLOR[industry]}99`,
        }}
        title={INDUSTRY_LABEL[industry]}
      >
        <SvgIcon name={INDUSTRY_ICON[industry]} size={11} />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-1.5 py-1.5">
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: 4,
            background: bottomRankBg,
            boxShadow: `0 -1px 5px ${ringColor}55`,
          }}
        />
        <div className="flex items-baseline justify-between gap-1">
          <span
            className="text-[11px] font-extrabold truncate"
            style={{ color: '#1f2937', textShadow: '0 1px 0 rgba(255,255,255,0.85)' }}
          >
            {dog.name}
          </span>
          <span className="text-[8px] font-bold whitespace-nowrap" style={{ color: '#64748b' }}>
            {dog.role}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span
            className="text-[13px] font-black leading-none"
            style={{ color: '#7a4a1c', textShadow: '0 1px 0 rgba(255,255,255,0.7)' }}
          >
            工作能力 {power}
          </span>
          <PowerStars count={stars} size={9} />
        </div>
      </div>
    </div>
  );
}
function GradeGem({ grade, size = 28 }: { grade: DogGradeUI; size?: number }) {
  const ringColor = GRADE_RING_COLOR[grade];
  return (
    <span
      className="relative flex items-center justify-center font-black"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.52,
        background: GRADE_GEM_BG[grade],
        color: GRADE_TEXT_COLOR[grade],
        border: `1.5px solid ${ringColor}`,
        borderRadius: '50%',
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.5),
          0 2px 8px ${ringColor}aa,
          inset 0 -3px 5px rgba(0,0,0,0.35),
          inset 0 3px 5px rgba(255,255,255,0.55)
        `,
        textShadow: '0 1px 2px rgba(0,0,0,0.45)',
        letterSpacing: '-0.02em',
      }}
    >
      {grade}
    </span>
  );
}

function SparkleOverlay() {
  const sparkles = [
    { top: '12%', left: '68%', delay: 0, size: 14, ch: '✦' },
    { top: '32%', left: '14%', delay: 0.5, size: 12, ch: '✧' },
    { top: '20%', left: '40%', delay: 1.0, size: 10, ch: '✦' },
    { top: '55%', left: '82%', delay: 0.8, size: 12, ch: '✦' },
  ];
  return (
    <>
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="absolute pointer-events-none z-[5]"
          style={{
            top: s.top,
            left: s.left,
            fontSize: s.size,
            color: '#fff8ff',
            textShadow: '0 0 6px #ffb8e8, 0 0 14px #b577ff',
            animation: `sparkle-twinkle 1.6s ease-in-out ${s.delay}s infinite`,
          }}
        >
          {s.ch}
        </span>
      ))}
    </>
  );
}

function StaffCell({
  dog,
  inTeam,
  inOtherTeam,
  teamFull,
  editMode,
  activeIndustryColor,
  onShowDetails,
  onToggleTeam,
}: {
  dog: Dog;
  inTeam: boolean;
  inOtherTeam: ProjectCategory | null;
  teamFull: boolean;
  editMode: boolean;
  activeIndustryColor: string;
  onShowDetails: () => void;
  onToggleTeam: () => void;
}) {
  const industry = dogPrimaryIndustry(dog.role);
  const grade = dogGrade(dog);
  const power = dogPower(dog);
  const stars = dogPowerStars(power);
  const isU = grade === 'U';
  const ringColor = GRADE_RING_COLOR[grade];

  // 鎖定條件：在別 team 不能加；本 team 滿了也不能加（除非已在 current team）
  const lockedByOther = !!inOtherTeam;
  const editModeDisabled = editMode && !inTeam && (teamFull || lockedByOther);
  const handleClick = editMode
    ? (editModeDisabled ? undefined : onToggleTeam)
    : onShowDetails;
  const cursor = editModeDisabled ? 'not-allowed' : 'pointer';
  const opacity = editModeDisabled ? 0.4 : 1;

  // 卡片背景：稀有度 radial + 產業色微染（疊加），加上稀有度 border
  const bottomRankBg = isU
    ? GRADE_BORDER[grade]
    : `linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 28%), ${GRADE_BORDER[grade]}`;

  return (
    <div
      onClick={handleClick}
      className="relative rounded-sm overflow-hidden transition"
      style={{
        aspectRatio: '0.68',
        minHeight: 132,
        cursor,
        opacity,
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 56%, #eef2f7 100%)',
        border: `1px solid ${ringColor}88`,
        boxShadow: editMode && inTeam
          ? `0 0 0 2px ${activeIndustryColor}, 0 4px 10px ${activeIndustryColor}66`
          : '0 4px 10px rgba(15,23,42,0.14)',
        outline: editMode ? `2px dashed ${activeIndustryColor}77` : 'none',
        outlineOffset: editMode ? '-2px' : '0',
      }}
      title={
        editModeDisabled
          ? '隊伍已滿'
          : editMode
            ? (inTeam ? `點擊移出 ${dog.name}` : `點擊加入 ${dog.name}`)
            : `點擊查看 ${dog.name} 詳情`
      }
    >
      {/* Highlight bloom（聚光燈感） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.85) 0%, transparent 16%, transparent 84%, rgba(15,23,42,0.08) 100%)',
        }}
      />

      {/* 角色圖：放大 + bleed 出邊界 */}
      <div className="absolute" style={{ inset: '2px -14% 36px -14%' }}>
        {dog.image ? (
          <img
            src={dog.image}
            alt={dog.name}
            className="block w-full h-full"
            style={{ objectFit: 'contain', objectPosition: 'center top' }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-start justify-center pt-2">
            <DogAvatar role={dog.role} breed={dog.breed} size={90} />
          </div>
        )}
      </div>

      {/* 底部漸暗遮罩（降強度，避免吃掉鮮豔背景） */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: 48,
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.78) 42%, rgba(255,255,255,0.96) 100%)',
        }}
      />

      {/* U sparkle overlay */}
      {isU && <SparkleOverlay />}

      {/* 左上稀有度寶石 */}
      <div className="absolute top-1.5 left-1.5 z-10">
        <GradeGem grade={grade} size={22} />
      </div>

      {/* 右上 Lv chip */}
      <span
        className="absolute top-1.5 right-1.5 z-10 text-[9px] font-extrabold rounded-sm"
        style={{
          padding: '1px 4px',
          background: 'linear-gradient(180deg,#ffe066,#f0a818)',
          color: '#6a3d05',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }}
      >
        Lv.{dog.level}
      </span>

      {/* 右下產業 icon（在姓名條上方） */}
      <div
        className="absolute z-10 rounded-full flex items-center justify-center"
        style={{
          right: 8,
          bottom: 44,
          width: 20,
          height: 20,
          background: INDUSTRY_COLOR[industry],
          border: '2px solid white',
          boxShadow: `0 2px 6px ${INDUSTRY_COLOR[industry]}99`,
        }}
        title={INDUSTRY_LABEL[industry]}
      >
        <SvgIcon name={INDUSTRY_ICON[industry]} size={11} />
      </div>

      {/* 已加入 chip（左下、姓名條上） */}
      {inTeam && (
        <span
          className="absolute z-10 px-2 rounded-full text-[10px] font-extrabold leading-none flex items-center"
          style={{
            left: 8,
            bottom: 44,
            height: 16,
            background: activeIndustryColor,
            color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: `0 2px 6px ${activeIndustryColor}99`,
          }}
        >
          已加入
        </span>
      )}

      {/* 已在別隊 chip — 鎖定，不能加入 */}
      {inOtherTeam && (
        <span
          className="absolute z-10 px-2 rounded-full text-[10px] font-extrabold leading-none flex items-center gap-1"
          style={{
            left: 8,
            bottom: 44,
            height: 16,
            background: INDUSTRY_COLOR[inOtherTeam],
            color: 'white',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: `0 2px 6px ${INDUSTRY_COLOR[inOtherTeam]}99`,
          }}
        >
          🔒 在 {INDUSTRY_LABEL[inOtherTeam]} 隊
        </span>
      )}

      {/* 鎖定全卡覆蓋（在別隊時 + 編輯模式下） */}
      {inOtherTeam && editMode && (
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.18) 0 6px, rgba(0,0,0,0) 6px 12px)',
          }}
        />
      )}

      {/* 底部姓名條 */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-1.5 py-1.5">
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: 4,
            background: bottomRankBg,
            boxShadow: `0 -1px 5px ${ringColor}55`,
          }}
        />
        <div className="flex items-baseline justify-between gap-1">
          <span
            className="text-[11px] font-extrabold truncate"
            style={{ color: '#1f2937', textShadow: '0 1px 0 rgba(255,255,255,0.85)' }}
          >
            {dog.name}
          </span>
          <span className="text-[8px] font-bold whitespace-nowrap" style={{ color: '#64748b' }}>
            {dog.role}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span
            className="text-[13px] font-black leading-none"
            style={{ color: '#7a4a1c', textShadow: '0 1px 0 rgba(255,255,255,0.7)' }}
          >
            💼 {power}
          </span>
          <PowerStars count={stars} size={9} />
        </div>
      </div>
    </div>
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
      className="text-[11px] font-bold tracking-wide rounded-full transition"
      style={{
        background: active ? accent : '#ffffff',
        color: active ? 'white' : accent,
        border: `1px solid ${active ? accent : 'var(--line)'}`,
        padding: '2px 10px',
        boxShadow: active ? `0 2px 6px ${accent}55` : 'none',
      }}
    >
      {label} <span className="opacity-75">({count})</span>
    </button>
  );
}
