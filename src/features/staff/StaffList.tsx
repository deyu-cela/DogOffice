import { useMemo, useState } from 'react';
import { DogAvatar } from '@/components/DogAvatar';
import { dogPrimaryIndustry } from '@/store/gameStore';
import { useGameStore } from '@/store/gameStore';
import type { Dog, ProjectCategory } from '@/types';
import { dogGrade, dogPowerStars, type DogGradeUI } from '@/lib/utils';
import { dogPowerWithTools } from '@/lib/toolsEngine';
import { TeamEditModal } from './TeamEditModal';
import './staff.css';

type FilterKey = 'all' | 'I' | 'II' | 'III';
type SortKey = 'power' | 'level' | 'grade' | 'loyalty' | 'fatigue';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'ALL' },
  { key: 'I', label: 'I' },
  { key: 'II', label: 'II' },
  { key: 'III', label: 'III' },
];

const SORT_LABEL: Record<SortKey, string> = {
  power: '戰鬥力',
  level: '等級',
  grade: '稀有度',
  loyalty: '忠誠',
  fatigue: '疲勞低',
};

const GRADE_ORDER: Record<DogGradeUI, number> = { U: 0, S: 1, A: 2, B: 3, C: 4, D: 5 };

const INDUSTRY_LABEL: Record<ProjectCategory, string> = {
  tech: '工程',
  design: '美術',
  marketing: '行銷',
  service: '客服',
};

const INDUSTRY_COLOR: Record<ProjectCategory, string> = {
  tech: '#2f72d6',
  design: '#d84f9b',
  marketing: '#d98919',
  service: '#1d9b64',
};

const CARD_ACCENT: Record<DogGradeUI, string> = {
  U: '#ff77d9',
  S: '#f7bd22',
  A: '#b066e8',
  B: '#2fbf72',
  C: '#3d80e8',
  D: '#8d96a6',
};

const GRADE_BAND_BG: Record<DogGradeUI, string> = {
  U: 'linear-gradient(90deg, #ff83dd, #ffe56f 34%, #78dbff 68%, #b875ff)',
  S: 'linear-gradient(180deg, #ffd95a, #f0a818)',
  A: 'linear-gradient(180deg, #c9a4f0, #8a4ce0)',
  B: 'linear-gradient(180deg, #a4f0bd, #28b964)',
  C: 'linear-gradient(180deg, #c8d8e8, #6a8aa8)',
  D: 'linear-gradient(180deg, #d2d6dd, #7a8290)',
};

const GRADE_BAND_TEXT: Record<DogGradeUI, string> = {
  U: '#40143f',
  S: '#5a3d05',
  A: '#24152f',
  B: '#0a3a1f',
  C: '#fff',
  D: '#fff',
};

function rankClass(dog: Dog): Exclude<FilterKey, 'all'> {
  const grade = dogGrade(dog);
  if (grade === 'U' || grade === 'S' || grade === 'A') return 'I';
  if (grade === 'B' || grade === 'C') return 'II';
  return 'III';
}

function compareStaff(a: StaffRow, b: StaffRow, sortKey: SortKey, desc: boolean) {
  let result = 0;
  switch (sortKey) {
    case 'power':
      result = a.power - b.power;
      break;
    case 'level':
      result = a.dog.level - b.dog.level;
      break;
    case 'grade':
      result = GRADE_ORDER[b.grade] - GRADE_ORDER[a.grade];
      break;
    case 'loyalty':
      result = a.dog.loyalty - b.dog.loyalty;
      break;
    case 'fatigue':
      result = b.dog.fatigue - a.dog.fatigue;
      break;
  }
  if (result === 0) result = a.dog.name.localeCompare(b.dog.name);
  return desc ? -result : result;
}

type StaffRow = {
  dog: Dog;
  index: number;
  grade: DogGradeUI;
  rank: Exclude<FilterKey, 'all'>;
  power: number;
};

export function StaffList() {
  const staff = useGameStore((s) => s.staff);
  const tools = useGameStore((s) => s.tools);
  const playMini = useGameStore((s) => s.openPlayMiniGame);
  const openTraining = useGameStore((s) => s.openTraining);
  const openStaffAction = useGameStore((s) => s.openStaffAction);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('power');
  const [desc, setDesc] = useState(true);

  const rows = useMemo<StaffRow[]>(() => {
    return staff.map((dog, index) => ({
      dog,
      index,
      grade: dogGrade(dog),
      rank: rankClass(dog),
      power: dogPowerWithTools(dog, tools),
    }));
  }, [staff, tools]);

  const visibleRows = useMemo(() => {
    return rows
      .filter((row) => filter === 'all' || row.rank === filter)
      .sort((a, b) => compareStaff(a, b, sortKey, desc));
  }, [rows, filter, sortKey, desc]);

  if (staff.length === 0) {
    return (
      <div className="text-center p-4 text-sm" style={{ color: 'var(--muted)' }}>
        還沒有員工，去抽卡招募吧。
      </div>
    );
  }

  return (
    <section className="staff-scrapbook-surface relative overflow-hidden">
      <div
        className="staff-scrapbook-header flex items-center justify-between gap-2 px-3 py-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="staff-scrapbook-mark font-black text-sm">
            N
          </div>
          <div className="min-w-0">
            <div className="font-black text-sm leading-tight" style={{ color: '#5b382d' }}>員工</div>
            <div className="text-[10px]" style={{ color: '#886153' }}>可查看同伴狀態</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <HeaderButton onClick={openTraining} disabled={staff.length < 2}>
            培訓
          </HeaderButton>
          <HeaderButton onClick={playMini} disabled={staff.length < 3}>
            陪玩
          </HeaderButton>
          <HeaderButton onClick={() => setTeamModalOpen(true)}>隊伍</HeaderButton>
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {FILTERS.map((item) => {
            const active = filter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className="staff-filter-btn h-10 min-w-10 px-3 font-black text-sm"
                data-active={active ? 'true' : 'false'}
              >
                {item.label}
              </button>
            );
          })}

          <button
            type="button"
            aria-label="切換排序方向"
            onClick={() => setDesc((value) => !value)}
            className="staff-sort-toggle h-10 w-10 font-black text-lg"
          >
            {desc ? '↻' : '↺'}
          </button>

          <label
            className="staff-sort-select h-10 flex items-center px-2"
          >
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="bg-transparent text-sm font-black outline-none"
              style={{ color: '#6e4638' }}
            >
              {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                <option key={key} value={key} style={{ color: '#1f2937' }}>
                  {SORT_LABEL[key]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="staff-count-chip text-[11px] font-bold">
          {visibleRows.length} / {staff.length} 名員工
        </div>

        {visibleRows.length === 0 ? (
          <div className="staff-paper-empty text-center text-sm py-8" style={{ color: '#886153' }}>
            這個篩選沒有員工
          </div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))',
              gap: 12,
            }}
          >
            {visibleRows.map((row) => (
              <StaffCard key={row.dog.id} row={row} onClick={() => openStaffAction(row.index)} />
            ))}
          </div>
        )}
      </div>

      {teamModalOpen && <TeamEditModal onClose={() => setTeamModalOpen(false)} />}
    </section>
  );
}

function HeaderButton({
  children,
  disabled = false,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="staff-kawaii-btn h-9 px-3 text-xs font-black"
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {children}
    </button>
  );
}

function StaffCard({ row, onClick }: { row: StaffRow; onClick: () => void }) {
  const { dog, grade, rank, power } = row;
  const industry = dogPrimaryIndustry(dog.role);
  const accent = CARD_ACCENT[grade];
  const stars = dogPowerStars(power);

  return (
    <button
      type="button"
      onClick={onClick}
      className="staff-card-frame group relative w-full overflow-hidden text-left"
      style={{
        aspectRatio: '0.68',
        minHeight: 126,
        padding: 3,
      }}
      title={`${dog.name} ${dog.role} 戰鬥力 ${power}`}
    >
      <div
        className="staff-card-inner relative h-full overflow-hidden"
      >
        <div
          className="absolute inset-x-0 top-0 h-[62%]"
          style={{
            background: `radial-gradient(circle at 50% 22%, ${accent}24, transparent 54%)`,
          }}
        />

        <div className="absolute left-1 top-1 z-10 flex flex-col gap-1">
          <Badge color={INDUSTRY_COLOR[industry]}>{INDUSTRY_LABEL[industry].slice(0, 1)}</Badge>
          <Badge color="#f8fafc" textColor="#2b3440">
            {rank}
          </Badge>
          <Badge color={accent}>{grade}</Badge>
        </div>

        {dog.status === 'pip' && (
          <div
            className="absolute right-1 top-1 z-10 px-1.5 py-0.5 text-[10px] font-black"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            PIP
          </div>
        )}

        {dog.pendingTraitChoice && (
          <div
            className="absolute right-1 top-1 z-10 h-5 w-5 grid place-items-center rounded-full text-[10px] font-black"
            style={{
              transform: dog.status === 'pip' ? 'translateY(24px)' : undefined,
              background: '#a855f7',
              color: '#fff',
              boxShadow: '0 2px 6px rgba(88,28,135,0.35)',
            }}
          >
            !
          </div>
        )}

        <div className="absolute inset-x-0 top-2 bottom-[48px] flex items-center justify-center px-2">
          {dog.image ? (
            <img
              src={dog.image}
              alt={`${dog.name} ${dog.role}`}
              className="h-full w-full object-contain drop-shadow-lg transition-transform group-hover:scale-[1.04]"
              draggable={false}
            />
          ) : (
            <DogAvatar role={dog.role} breed={dog.breed} size={74} />
          )}
        </div>

        <div
          className="staff-rarity-band absolute inset-x-0 bottom-0 px-1.5 py-1.5"
          style={{ background: GRADE_BAND_BG[grade], color: GRADE_BAND_TEXT[grade] }}
        >
          <div className="flex items-end justify-between gap-1">
            <div className="relative text-[10px] font-black leading-none">
              Lv.{dog.level}
            </div>
            <div className="relative text-[10px] leading-none">
              {'★'.repeat(stars)}
            </div>
          </div>
          <div className="relative mt-0.5 truncate text-[11px] font-black leading-tight">
            {dog.name}
          </div>
          <div className="relative truncate text-[9px] font-bold leading-tight" style={{ opacity: 0.9 }}>
            {dog.role} · {power}
          </div>
        </div>
      </div>
    </button>
  );
}

function Badge({
  children,
  color,
  textColor = '#ffffff',
}: {
  children: string;
  color: string;
  textColor?: string;
}) {
  return (
    <span
      className="grid place-items-center text-[10px] font-black"
      style={{
        width: 18,
        minHeight: 18,
        padding: '1px 2px',
        color: textColor,
        background: color,
        border: '1px solid rgba(15,23,42,0.3)',
        boxShadow: '0 1px 3px rgba(15,23,42,0.25)',
      }}
    >
      {children}
    </span>
  );
}
