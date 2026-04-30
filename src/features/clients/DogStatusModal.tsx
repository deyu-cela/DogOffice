import { useEffect } from 'react';
import { DogAvatar } from '@/components/DogAvatar';
import { RadarChart } from '@/components/RadarChart';
import { DOG_TRAITS_MAP, type DogTraitId } from '@/constants/dogTraits';
import { dogPrimaryIndustry } from '@/store/gameStore';
import type { Dog, ProjectCategory } from '@/types';

const INDUSTRY_LABEL: Record<ProjectCategory, string> = {
  tech: '工程', design: '美術', marketing: '行銷', service: '客服',
};
const INDUSTRY_COLOR: Record<ProjectCategory, string> = {
  tech: '#5a8ce6', design: '#e88aaa', marketing: '#e8a85a', service: '#5fb38f',
};

export function DogStatusModal({ dog, onClose }: { dog: Dog; onClose: () => void }) {
  const industry = dogPrimaryIndustry(dog.role);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[860] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,32,77,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl max-w-sm w-full p-4"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.28)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className="rounded-full overflow-hidden flex items-center justify-center shrink-0"
            style={{ width: 56, height: 56, border: '2px solid white', background: '#eef6ff' }}
          >
            {dog.image ? (
              <img src={dog.image} alt={`${dog.breed} ${dog.role}`} className="block h-full w-full object-contain" draggable={false} />
            ) : (
              <DogAvatar role={dog.role} breed={dog.breed} size={56} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-base">{dog.name}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md"
                style={{ background: 'linear-gradient(180deg, #ffd95a, #f0a818)', color: '#6a3d05', border: '1px solid rgba(176,107,15,0.4)' }}
              >
                Lv.{dog.level}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md"
                style={{ background: INDUSTRY_COLOR[industry], color: 'white' }}
              >
                {INDUSTRY_LABEL[industry]}
              </span>
              {dog.status === 'pip' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: '#fff0f0', color: '#d34a4a' }}>
                  PIP {dog.pipDaysLeft}天
                </span>
              )}
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              {dog.breed}・{dog.role}・日薪 ${dog.expectedSalary}
            </div>
            {dog.motto && (
              <div className="text-[11px] mt-1 italic" style={{ color: '#7c95bc' }}>
                「{dog.motto}」
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-2 py-0.5 rounded-full shrink-0"
            style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
          >
            X
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3 p-2 rounded-lg" style={{ background: '#f7fbff', border: '1px solid var(--line)' }}>
          <RadarChart stats={dog.stats} size={120} />
          <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <StatRow label="速度" value={dog.stats.speed} />
            <StatRow label="專業" value={dog.stats.quality} />
            <StatRow label="協作" value={dog.stats.teamwork} />
            <StatRow label="魅力" value={dog.stats.charisma} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-3 text-[10px]">
          <Meter label="士氣" value={dog.morale} color="#35c59c" />
          <Meter label="疲勞" value={dog.fatigue} color="#ffc35c" />
          <Meter label="忠誠" value={dog.loyalty} color="#2f8df4" />
        </div>

        {(dog.learnedTraits ?? []).length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--muted)' }}>已習得特性</div>
            <div className="flex flex-wrap gap-1">
              {(dog.learnedTraits as DogTraitId[]).map((tid) => {
                const def = DOG_TRAITS_MAP[tid];
                if (!def) return null;
                return (
                  <span
                    key={tid}
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: '#eef6ff', border: '1px solid var(--line)', color: 'var(--blue)' }}
                    title={def.desc}
                  >
                    {def.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span className="font-extrabold" style={{ color: '#173b78' }}>{value}</span>
    </div>
  );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  const display = Math.round(value);
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span style={{ color: 'var(--muted)' }}>{label}</span>
        <span style={{ color: 'var(--muted)' }}>{display}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#e4eefc' }}>
        <div
          className="h-full"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}
