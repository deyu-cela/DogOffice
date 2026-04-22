type Props = {
  value: number;
  max?: number;
  color?: string;
};

export function Meter({ value, max = 100, color = 'linear-gradient(90deg, #ffc7d1, #eb93a3)' }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2.5 rounded-full overflow-hidden mt-2" style={{ background: '#eadfce' }}>
      <div className="h-full transition-[width] duration-300" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="p-3 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.82)',
        border: '1px solid rgba(90,70,54,0.12)',
      }}
    >
      <div className="text-xs" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}
