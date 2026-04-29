import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { DOG_ROLES } from '@/constants/dogRoles';
import { DogAvatar } from '@/components/DogAvatar';
import { RadarChart } from '@/components/RadarChart';
import { SvgIcon } from '@/components/SvgIcon';
import type { SvgIconName } from '@/components/SvgIcon';

const TARGETED_COST = 40;

const statIcons: Record<string, SvgIconName> = {
  速度: 'speed',
  專業: 'quality',
  協作: 'teamwork',
  魅力: 'heart',
};

function TargetedRecruitButton() {
  const money = useGameStore((s) => s.money);
  const closed = useGameStore((s) => s.recruitmentClosed);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const staff = useGameStore((s) => s.staff);
  const request = useGameStore((s) => s.requestTargetedCandidate);
  const [open, setOpen] = useState(false);
  const atCapacity = staff.length >= OFFICE_LEVELS[officeLevel].maxStaff;
  const canAfford = money >= TARGETED_COST;
  const disabled = closed || atCapacity || !canAfford;

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="w-full h-10 rounded-lg text-xs font-extrabold inline-flex items-center justify-center gap-2 transition"
        style={{
          background: disabled ? '#e9f1ff' : 'linear-gradient(180deg, #ffffff, #edf5ff)',
          color: disabled ? '#8aa2c8' : 'var(--blue)',
          border: '1px solid var(--line)',
          boxShadow: disabled ? 'none' : 'var(--shadow-soft)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        title={
          atCapacity ? '辦公室已滿'
            : !canAfford ? `需要 $${TARGETED_COST}`
              : '指定職業招聘（保證下一張履歷為指定職業）'
        }
      >
        <SvgIcon name="target" size={19} />
        <span>指定職業招聘 ${TARGETED_COST}</span>
      </button>
      {open && !disabled && (
        <div
          className="mt-2 p-2.5 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <div className="text-[10px] mb-2 font-bold" style={{ color: 'var(--muted)' }}>
            選擇職業，下一張履歷會換成該職業候選人
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {DOG_ROLES.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => {
                  request(r.role);
                  setOpen(false);
                }}
                className="text-[11px] px-2 py-1.5 rounded-lg flex items-center gap-1.5 font-bold"
                style={{
                  background: 'linear-gradient(180deg, #ffffff, #f4f9ff)',
                  border: '1px solid var(--line)',
                  color: 'var(--text)',
                }}
              >
                <SvgIcon name="appDog" size={18} />
                <span>{r.role}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecruitmentToggle() {
  const closed = useGameStore((s) => s.recruitmentClosed);
  const toggle = useGameStore((s) => s.toggleRecruitment);
  return (
    <button
      type="button"
      onClick={toggle}
      className="w-full h-10 rounded-lg text-xs font-extrabold mb-2 inline-flex items-center justify-center gap-2"
      style={{
        background: closed ? 'linear-gradient(180deg, #eafff7, #d9f7ee)' : 'linear-gradient(180deg, #fff6f6, #ffe9e9)',
        color: closed ? '#16926f' : '#d34a4a',
        border: closed ? '1px solid rgba(51,194,154,0.3)' : '1px solid rgba(255,112,112,0.25)',
      }}
    >
      <SvgIcon name={closed ? 'briefcase' : 'warning'} size={18} />
      <span>{closed ? '重新開啟招募' : '暫停招募'}</span>
    </button>
  );
}

function EmptyRecruitState({
  title,
  desc,
  icon = 'briefcase',
}: {
  title: string;
  desc: string;
  icon?: SvgIconName;
}) {
  return (
    <div
      className="p-5 rounded-xl text-center"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(239,247,255,0.9))',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div className="mx-auto mb-2 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#eef6ff' }}>
        <SvgIcon name={icon} size={30} />
      </div>
      <div className="font-extrabold mb-1" style={{ color: 'var(--text)' }}>
        {title}
      </div>
      <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
        {desc}
      </div>
    </div>
  );
}

export function ResumeCard() {
  const current = useGameStore((s) => s.current);
  const staff = useGameStore((s) => s.staff);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const vacancy = useGameStore((s) => s.vacancy);
  const vacancyTimer = useGameStore((s) => s.vacancyTimer);
  const recruitmentClosed = useGameStore((s) => s.recruitmentClosed);
  const hire = useGameStore((s) => s.hireCandidate);
  const reject = useGameStore((s) => s.rejectCandidate);

  const maxStaff = OFFICE_LEVELS[officeLevel].maxStaff;
  const atCapacity = staff.length >= maxStaff;

  if (recruitmentClosed) {
    return (
      <div className="mt-3">
        <RecruitmentToggle />
        <TargetedRecruitButton />
        <EmptyRecruitState
          icon="warning"
          title="招募已暫停"
          desc="不會再有新候選人。想繼續擴編時，再按上方按鈕重開。"
        />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mt-3">
        <RecruitmentToggle />
        <TargetedRecruitButton />
        {vacancy ? (
          <EmptyRecruitState
            icon="people"
            title="人才荒期"
            desc={`目前沒有候選狗狗，趁這段時間培訓或買道具吧。還要等 ${vacancyTimer} 天。`}
          />
        ) : (
          <EmptyRecruitState title="等候候選人" desc="下一位候選狗狗正在路上。" />
        )}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <RecruitmentToggle />
      <TargetedRecruitButton />
      <div
        className="p-4 rounded-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,249,255,0.94))',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div className="grid gap-3.5" style={{ gridTemplateColumns: '118px 1fr' }}>
          <div
            className="rounded-xl overflow-hidden flex items-center justify-center"
            style={{
              width: 118,
              height: 148,
              background: 'linear-gradient(180deg, #f5fbff, #e7f1ff)',
              border: '1px solid var(--line)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.8)',
            }}
          >
            {current.image ? (
              <img
                src={current.image}
                alt={`${current.breed} ${current.role}`}
                className="block h-full w-full object-contain"
                draggable={false}
              />
            ) : (
              <DogAvatar role={current.role} breed={current.breed} size={118} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-lg">{current.name}</span>
              <span
                className="px-2 py-0.5 rounded-md text-[11px] font-extrabold"
                style={{ background: 'linear-gradient(180deg, #2f8df4, #1c63c8)', color: 'white' }}
              >
                {current.grade}
              </span>
              {current.isCEO && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold" style={{ background: '#eef6ff', color: 'var(--blue)', border: '1px solid var(--line)' }}>
                  CEO
                </span>
              )}
            </div>
            <div className="text-xs mt-0.5 font-bold" style={{ color: 'var(--muted)' }}>
              {current.breed}・{current.role}
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2">
              {current.traits.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2 py-1 rounded-md font-bold"
                  style={{ background: '#f1f7ff', border: '1px solid var(--line)', color: 'var(--blue-2)' }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="text-xs mt-2 font-bold flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
              <SvgIcon name="money" size={17} />
              <span>期望日薪 ${current.expectedSalary}</span>
            </div>
          </div>
        </div>

        <div className="mt-2 p-2.5 rounded-lg text-xs leading-relaxed" style={{ background: '#f7fbff', border: '1px solid var(--line)', color: 'var(--muted)' }}>
          {current.motto}
        </div>

        <div className="mt-2 p-2.5 rounded-lg flex items-center gap-3" style={{ background: '#f7fbff', border: '1px solid var(--line)' }}>
          <RadarChart stats={current.stats} size={130} />
          <div className="grid grid-cols-2 gap-1.5 text-xs flex-1">
            <StatPair label="速度" value={current.stats.speed} />
            <StatPair label="專業" value={current.stats.quality} />
            <StatPair label="協作" value={current.stats.teamwork} />
            <StatPair label="魅力" value={current.stats.charisma} />
          </div>
        </div>

        <div className="mt-2 grid gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
          <div className="p-2 rounded-lg" style={{ background: '#ffffff', border: '1px solid var(--line)' }}>{current.passive}</div>
          <div className="p-2 rounded-lg" style={{ background: '#ffffff', border: '1px solid var(--line)' }}>{current.flavor}</div>
        </div>

        {current.interview && (
          <div className="mt-2 p-2.5 rounded-lg text-xs" style={{ background: '#eefaf7', border: '1px solid rgba(51,194,154,0.28)' }}>
            <div className="font-extrabold mb-1" style={{ color: 'var(--text)' }}>面試 Q：{current.interview.q}</div>
            <div style={{ color: 'var(--muted)' }}>{current.interview.goodAnswer}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 mt-3.5">
          <button
            disabled={atCapacity}
            onClick={hire}
            className="h-10 rounded-lg text-sm font-extrabold"
            style={{
              background: atCapacity ? '#e9f1ff' : 'linear-gradient(180deg, #35c59c, #16a77f)',
              color: atCapacity ? '#8aa2c8' : 'white',
              border: atCapacity ? '1px solid var(--line)' : '1px solid rgba(22,167,127,0.35)',
              cursor: atCapacity ? 'not-allowed' : 'pointer',
            }}
          >
            錄用 ${current.expectedSalary * 2}
          </button>
          <button
            onClick={reject}
            className="h-10 rounded-lg text-sm font-extrabold"
            style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
          >
            婉拒
          </button>
        </div>

        {atCapacity && (
          <div className="text-center text-xs font-extrabold mt-2" style={{ color: '#e24c4c' }}>
            辦公室已滿，請先升級或資遣員工
          </div>
        )}
      </div>
    </div>
  );
}

function StatPair({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md px-2 py-1" style={{ background: '#ffffff', border: '1px solid var(--line)' }}>
      <SvgIcon name={statIcons[label]} size={16} />
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span className="font-extrabold ml-auto">{value}</span>
    </div>
  );
}
