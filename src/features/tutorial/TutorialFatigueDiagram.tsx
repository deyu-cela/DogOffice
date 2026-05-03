// step 4 用：用簡單三角雷達 + 疲勞條示意三大數值與疲勞
export function TutorialFatigueDiagram() {
  return (
    <div
      className="rounded-2xl p-3 flex items-center gap-4"
      style={{
        background: 'rgba(255,255,255,0.65)',
        border: '1px solid rgba(90,70,54,0.12)',
      }}
    >
      <Radar />
      <div className="flex-1">
        <div className="text-xs mb-1 font-bold" style={{ color: '#5a3e2a' }}>
          疲勞累積示意
        </div>
        <FatigueBar />
        <div
          className="mt-2 text-[11px] leading-snug"
          style={{ color: 'var(--muted)' }}
        >
          疲勞 100 = 過勞，必須休息或玩遊戲恢復。
        </div>
      </div>
    </div>
  );
}

function Radar() {
  // 三角形 vertices，labels 對應 速度/專業/耐心
  const cx = 60;
  const cy = 56;
  const r = 38;
  const pts = [
    { x: cx, y: cy - r, label: '速度', v: 0.8 },
    {
      x: cx + r * Math.cos(Math.PI / 6),
      y: cy + r * Math.sin(Math.PI / 6),
      label: '專業',
      v: 0.6,
    },
    {
      x: cx - r * Math.cos(Math.PI / 6),
      y: cy + r * Math.sin(Math.PI / 6),
      label: '耐心',
      v: 0.5,
    },
  ];
  const valuePts = pts.map((p) => {
    const x = cx + (p.x - cx) * p.v;
    const y = cy + (p.y - cy) * p.v;
    return `${x},${y}`;
  });
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      {/* 外三角 */}
      <polygon
        points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="rgba(90,70,54,0.3)"
        strokeWidth={1.2}
      />
      {/* 中三角 */}
      <polygon
        points={pts
          .map((p) => `${cx + (p.x - cx) * 0.5},${cy + (p.y - cy) * 0.5}`)
          .join(' ')}
        fill="none"
        stroke="rgba(90,70,54,0.18)"
        strokeWidth={1}
      />
      {/* 數值區 */}
      <polygon
        points={valuePts.join(' ')}
        fill="rgba(255,179,71,0.45)"
        stroke="#eb9a48"
        strokeWidth={1.5}
      />
      {/* 標籤 */}
      {pts.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={p.y + (i === 0 ? -4 : 12)}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#5a3e2a"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

function FatigueBar() {
  return (
    <div
      style={{
        width: '100%',
        height: 12,
        borderRadius: 999,
        background: 'rgba(90,70,54,0.12)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '70%',
          height: '100%',
          background: 'linear-gradient(90deg, #f8c7a3, #e87b6a)',
        }}
      />
    </div>
  );
}
