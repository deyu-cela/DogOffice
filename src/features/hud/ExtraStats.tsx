import { useGameStore } from '@/store/gameStore';
import type { Dog } from '@/types';
import { SvgIcon, type SvgIconName } from '@/components/SvgIcon';

const ROLE_ICON: Record<string, SvgIconName> = {
  工程師: 'tech',
  QA: 'tech',
  美術: 'design',
  企劃: 'design',
  業務: 'marketing',
  行銷: 'marketing',
  客服: 'service',
  PM: 'teamwork',
  CEO: 'trophy',
};

function groupByRole(staff: Dog[]): { role: string; count: number }[] {
  const map = new Map<string, { role: string; count: number }>();
  staff.forEach((d) => {
    const entry = map.get(d.role);
    if (entry) entry.count += 1;
    else map.set(d.role, { role: d.role, count: 1 });
  });
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function ExtraStats() {
  const staff = useGameStore((s) => s.staff);
  const queue = useGameStore((s) => s.queue);
  const openTraining = useGameStore((s) => s.openTraining);
  const roleStats = groupByRole(staff);

  return (
    <section
      className="rounded-2xl p-3"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,249,255,0.9))',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-extrabold" style={{ color: 'var(--accent)' }}>
          <SvgIcon name="people" size={22} />
          <span>員工構成</span>
        </div>
        <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>
          {queue.length} 位候選人排隊中
        </span>
      </div>

      {roleStats.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {roleStats.map((r) => (
            <span
              key={r.role}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-extrabold"
              style={{
                background: '#ffffff',
                border: '1px solid var(--line)',
                color: 'var(--text)',
              }}
            >
              <SvgIcon name={ROLE_ICON[r.role] ?? 'people'} size={17} />
              <span className="truncate">{r.role}</span>
              <span style={{ color: 'var(--muted)' }}>x{r.count}</span>
            </span>
          ))}
        </div>
      ) : (
        <div className="rounded-xl px-3 py-4 text-center text-xs" style={{ background: '#f7fbff', color: 'var(--muted)' }}>
          尚未招募員工
        </div>
      )}

      <button
        type="button"
        onClick={openTraining}
        className="mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold"
        style={{
          background: 'linear-gradient(180deg, #3e8cf0, #246bd0)',
          color: 'white',
          border: '1px solid rgba(36,107,208,0.22)',
          boxShadow: '0 8px 18px rgba(47,125,225,0.22)',
        }}
      >
        <SvgIcon name="training" size={18} />
        點擊查看 / 技能
      </button>
    </section>
  );
}
