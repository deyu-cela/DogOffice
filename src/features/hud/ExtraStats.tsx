import { useGameStore } from '@/store/gameStore';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import type { ChemistryCombo, Dog } from '@/types';
// (接案概況已在頂部便條紙列顯示，這裡不重複)

function groupByRole(staff: Dog[]): { role: string; count: number; emoji: string }[] {
  const map = new Map<string, { role: string; count: number; emoji: string }>();
  staff.forEach((d) => {
    const entry = map.get(d.role);
    if (entry) entry.count += 1;
    else map.set(d.role, { role: d.role, count: 1, emoji: d.emoji });
  });
  return [...map.values()].sort((a, b) => b.count - a.count);
}

type ChemHint = { combo: ChemistryCombo; missing: string; brief: string };

function chemistryHints(staff: Dog[]): ChemHint[] {
  const roleSet = new Set(staff.map((d) => d.role));
  const hints: ChemHint[] = [];
  for (const combo of CHEMISTRY_COMBOS) {
    if (combo.type !== 'positive') continue;
    const missing = combo.roles.filter((r) => !roleSet.has(r));
    if (missing.length !== 1) continue;
    const briefMatch = combo.msg.match(/：([^（]+)/);
    const brief = briefMatch ? briefMatch[1].trim() : combo.msg;
    hints.push({ combo, missing: missing[0], brief });
  }
  return hints.slice(0, 4);
}

export function ExtraStats() {
  const staff = useGameStore((s) => s.staff);
  const queue = useGameStore((s) => s.queue);
  const vacancy = useGameStore((s) => s.vacancy);
  const vacancyTimer = useGameStore((s) => s.vacancyTimer);

  const roleStats = groupByRole(staff);
  const hints = chemistryHints(staff);

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="flex items-center justify-between text-xs px-2.5 py-2 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.82)',
          border: '1px solid rgba(90,70,54,0.12)',
        }}
      >
        <span style={{ color: 'var(--muted)' }}>📋 候選人排隊</span>
        <span className="font-bold">{queue.length} 位</span>
      </div>

      {vacancy && (
        <div
          className="flex items-center justify-between text-xs px-2.5 py-2 rounded-xl"
          style={{ background: '#f0eae0', color: '#7a685a', border: '1px solid rgba(90,70,54,0.15)' }}
        >
          <span>⏸️ 人才荒期</span>
          <span className="font-bold">剩 {vacancyTimer} 天</span>
        </div>
      )}

      {roleStats.length > 0 && (
        <div
          className="p-2.5 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(90,70,54,0.12)',
          }}
        >
          <div className="text-[10px] font-bold mb-1.5" style={{ color: 'var(--muted)' }}>
            🐕 職業分布
          </div>
          <div className="flex flex-wrap gap-1">
            {roleStats.map((r) => (
              <span
                key={r.role}
                className="text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                style={{
                  background: '#fffaf0',
                  border: '1px solid rgba(90,70,54,0.15)',
                  color: 'var(--text)',
                }}
              >
                <span>{r.emoji}</span>
                <span>{r.role}</span>
                <span style={{ color: 'var(--muted)' }}>×{r.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {hints.length > 0 && (
        <div
          className="p-2.5 rounded-xl"
          style={{ background: '#eef7f0', border: '1.5px solid #b8d8c0' }}
        >
          <div className="text-[10px] font-bold mb-1.5" style={{ color: '#2f7a3f' }}>
            ✨ 再招這些就能組化學
          </div>
          <div className="flex flex-col gap-1">
            {hints.map((h) => (
              <div key={h.missing + h.brief} className="text-[11px] leading-tight">
                <span className="font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#c7e8d0', color: '#1e5a29' }}>
                  +{h.missing}
                </span>
                <span className="ml-1.5" style={{ color: 'var(--text)' }}>
                  {h.brief}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
