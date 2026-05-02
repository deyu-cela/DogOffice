import { useMemo, useState } from 'react';
import { DogAvatar } from '@/components/DogAvatar';
import { dogPrimaryIndustry } from '@/store/gameStore';
import { useGameStore } from '@/store/gameStore';
import type { Dog, ProjectCategory } from '@/types';
import { dogGrade, dogPower, dogPowerStars, type DogGradeUI } from '@/lib/utils';
import { TeamEditModal } from './TeamEditModal';

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

const FRAME_BG: Record<DogGradeUI, string> = {
  U: 'linear-gradient(145deg, #ff83dd, #ffe56f 34%, #78dbff 68%, #b875ff)',
  S: 'linear-gradient(145deg, #fff1a8, #f7b71f 42%, #9d5b09)',
  A: 'linear-gradient(145deg, #ecd1ff, #ad5ce2 48%, #4c196f)',
  B: 'linear-gradient(145deg, #d9ffe8, #38bf71 48%, #145b34)',
  C: 'linear-gradient(145deg, #d8ebff, #3b78de 48%, #122d62)',
  D: 'linear-gradient(145deg, #f0f2f5, #9aa2b0 48%, #343b49)',
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
      power: dogPower(dog),
    }));
  }, [staff]);

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
    <section
      className="relative overflow-hidden rounded-xl"
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.66), rgba(255,247,239,0.72)), repeating-linear-gradient(0deg, rgba(186,121,82,0.05) 0 1px, transparent 1px 16px), rgba(247,214,191,0.46)',
        border: '1px solid rgba(208,130,105,0.34)',
        boxShadow: '0 8px 16px rgba(166,91,85,0.08), inset 0 0 0 1px rgba(255,255,255,0.42)',
        backdropFilter: 'blur(7px) saturate(1.02)',
        WebkitBackdropFilter: 'blur(7px) saturate(1.02)',
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-3 py-2"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,232,233,0.56))',
          borderBottom: '1px solid rgba(190,117,105,0.36)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="h-8 w-8 grid place-items-center font-black text-sm"
            style={{
              color: '#20bae8',
              background: '#f7fbff',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          >
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
                className="h-10 min-w-10 px-3 rounded-md font-black text-sm"
                style={{
                  color: active ? '#fffdf8' : '#6e4638',
                  background: active
                    ? 'linear-gradient(180deg, #f7b267, #c87e78)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,247,239,0.58))',
                  border: active ? '1px solid rgba(208,130,105,0.46)' : '1px solid rgba(208,130,105,0.28)',
                  boxShadow: active ? '0 0 0 1px rgba(255,255,255,0.28) inset' : '0 4px 10px rgba(166,91,85,0.08)',
                }}
              >
                {item.label}
              </button>
            );
          })}

          <button
            type="button"
            aria-label="切換排序方向"
            onClick={() => setDesc((value) => !value)}
            className="h-10 w-10 rounded-md font-black text-lg"
            style={{
              color: '#6e4638',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,247,239,0.58))',
              border: '1px solid rgba(208,130,105,0.28)',
            }}
          >
            {desc ? '↻' : '↺'}
          </button>

          <label
            className="h-10 rounded-md flex items-center px-2"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,247,239,0.58))',
              border: '1px solid rgba(208,130,105,0.28)',
            }}
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

        <div className="text-[11px] mb-2 text-center font-bold" style={{ color: '#886153' }}>
          {visibleRows.length} / {staff.length} 名員工
        </div>

        {visibleRows.length === 0 ? (
          <div className="text-center text-sm py-8" style={{ color: 'var(--muted)' }}>
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
      className="h-9 px-3 rounded-sm text-xs font-black"
      style={{
        color: disabled ? '#a98a80' : '#fffdf8',
        background: disabled
          ? 'rgba(255,240,237,0.58)'
          : 'linear-gradient(180deg, #f7b267, #c87e78)',
        border: '1px solid rgba(208,130,105,0.32)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
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
      className="group relative w-full overflow-hidden text-left"
      style={{
        aspectRatio: '0.68',
        minHeight: 136,
        padding: 3,
        background: FRAME_BG[grade],
        border: `1px solid ${accent}`,
        boxShadow: `0 8px 16px rgba(15,23,42,0.16), inset 0 0 0 1px rgba(255,255,255,0.35)`,
      }}
      title={`${dog.name} ${dog.role} 戰鬥力 ${power}`}
    >
      <div
        className="relative h-full overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(226,232,240,0.7) 42%, rgba(25,28,34,0.68) 100%)',
          border: '1px solid rgba(255,255,255,0.7)',
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[72%]"
          style={{
            background: `radial-gradient(circle at 50% 22%, ${accent}33, transparent 52%)`,
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

        <div className="absolute inset-x-0 top-3 bottom-8 flex items-center justify-center px-2">
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
          className="absolute inset-x-0 bottom-0 px-1.5 pb-1 pt-4"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(20,22,27,0.9) 34%, rgba(20,22,27,0.98) 100%)',
          }}
        >
          <div className="flex items-end justify-between gap-1">
            <div className="text-[10px] font-black leading-none" style={{ color: '#f7d35b' }}>
              Lv.{dog.level}
            </div>
            <div className="text-[10px] leading-none" style={{ color: '#ffd34e' }}>
              {'★'.repeat(stars)}
            </div>
          </div>
          <div className="mt-0.5 truncate text-[11px] font-black leading-tight" style={{ color: '#ffffff' }}>
            {dog.name}
          </div>
          <div className="truncate text-[9px] font-bold leading-tight" style={{ color: '#cbd5e1' }}>
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
