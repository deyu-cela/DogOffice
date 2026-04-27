type Props = {
  value: number;
  max?: number;
  color?: string;
};

export function Meter({ value, max = 100, color = 'linear-gradient(90deg, #2f7de1, #20c7b3)' }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2.5 rounded-full overflow-hidden mt-2" style={{ background: '#dceafe' }}>
      <div
        className="h-full transition-[width] duration-300 rounded-full"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="p-3 rounded-2xl"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(244,249,255,0.88))',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div className="text-xs" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}
