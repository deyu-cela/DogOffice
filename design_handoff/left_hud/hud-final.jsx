/* global React */
const { useState } = React;

// ============== icons ==============
const HUD_ICONS = {
  money: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H9.5a1.5 1.5 0 0 0 0 3H15"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/>
      <path d="M3 10h18M8 3v4M16 3v4"/>
    </svg>
  ),
  hourglass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12M6 21h12"/>
      <path d="M7 3v3c0 3 4 4 4 6s-4 3-4 6v3M17 3v3c0 3-4 4-4 6s4 3 4 6v3"/>
    </svg>
  ),
  play: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  briefcase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2"/>
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>
    </svg>
  ),
  coffee: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z"/>
      <path d="M17 10h2a2 2 0 0 1 0 4h-2M7 3c0 1.5 1 1.5 1 3M11 3c0 1.5 1 1.5 1 3"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/>
      <path d="M10 17l-5-5 5-5M5 12h11"/>
    </svg>
  ),
  paw: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="6.5" cy="9" rx="1.8" ry="2.4"/>
      <ellipse cx="17.5" cy="9" rx="1.8" ry="2.4"/>
      <ellipse cx="9.5" cy="5" rx="1.6" ry="2.2"/>
      <ellipse cx="14.5" cy="5" rx="1.6" ry="2.2"/>
      <path d="M12 11c-3 0-5 2.5-5 5 0 2 1.5 3 3 3 1 0 1.3-.5 2-.5s1 .5 2 .5c1.5 0 3-1 3-3 0-2.5-2-5-5-5z"/>
    </svg>
  ),
};

const paperTexture = {
  backgroundImage:
    "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)," +
    " radial-gradient(circle at 6px 6px, rgba(0,0,0,0.022) 1px, transparent 1.6px)",
  backgroundSize: "auto, 12px 12px",
};

function shade(hex, amt) {
  const c = hex.replace("#","");
  const n = parseInt(c, 16);
  const r = Math.max(0, Math.min(255, ((n>>16)&0xff) + amt));
  const g = Math.max(0, Math.min(255, ((n>>8)&0xff) + amt));
  const b = Math.max(0, Math.min(255, (n&0xff) + amt));
  return "#" + ((r<<16)|(g<<8)|b).toString(16).padStart(6,"0");
}

function Hover({ children, lift = 3 }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        transform: h ? `translateY(-${lift}px)` : "translateY(0)",
        transition: "transform .2s ease",
      }}
    >
      {children}
    </div>
  );
}

// ============== TOP-LEFT row 1: Wallet ==============
function Wallet() {
  return (
    <Hover lift={2}>
      <div style={{
        position: "relative",
        width: 380, padding: "10px 12px",
        borderRadius: 12,
        background: "linear-gradient(180deg, #f8d4b8, #e8a868)",
        boxShadow: "0 10px 18px rgba(140,80,50,0.28), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -3px 6px rgba(120,60,30,0.18)",
        border: "1px solid rgba(120,70,40,0.4)",
      }}>
        <div style={{
          position: "absolute", inset: 4,
          border: "1.5px dashed rgba(255,255,255,0.55)",
          borderRadius: 9,
          pointerEvents: "none",
        }}/>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(180deg, #fff, #ffe8e0)",
            border: "2px solid rgba(255,255,255,0.7)",
            boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#c44a6a",
          }}>
            <span style={{ width: 22, height: 22 }}>{HUD_ICONS.paw}</span>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.7)",
            padding: "5px 10px",
            borderRadius: 7,
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "inset 0 1px 2px rgba(120,60,20,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 18, height: 18, color: "#a37434" }}>{HUD_ICONS.money}</span>
              <span style={{ color: "#7a4612", fontSize: 18, fontWeight: 900, lineHeight: 1 }}>$220</span>
            </div>
            <div style={{ color: "#c44a3a", fontSize: 10, fontWeight: 800, marginTop: 2 }}>▼ -$20/天</div>
          </div>
          <div style={{
            flex: 1, padding: "5px 10px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,240,220,0.75))",
            borderRadius: 6,
            border: "1px solid rgba(120,70,40,0.25)",
            textAlign: "center",
            color: "#7a4612", fontSize: 13, fontWeight: 900,
            boxShadow: "inset 0 -2px 4px rgba(120,60,20,0.08)",
          }}>
            AAA 公司
          </div>
          <button style={{
            height: 28, padding: "0 10px",
            background: "linear-gradient(180deg, #fff, #ffd6dc)",
            border: "1px solid rgba(180,80,90,0.5)",
            borderRadius: 8,
            color: "#a8344a", fontSize: 11, fontWeight: 900,
            display: "flex", alignItems: "center", gap: 4,
            cursor: "pointer",
            boxShadow: "0 3px 5px rgba(0,0,0,0.12)",
          }}>
            <span style={{ width: 12, height: 12 }}>{HUD_ICONS.logout}</span>
            登出
          </button>
        </div>
      </div>
    </Hover>
  );
}

// ============== TOP-LEFT row 2: A-style sticky notes ==============
function StickyA({ tilt, color, w, children }) {
  return (
    <Hover lift={3}>
      <div style={{
        position: "relative",
        width: w, minHeight: 44,
        padding: "8px 10px",
        background: color,
        borderRadius: 6,
        transform: `rotate(${tilt}deg)`,
        boxShadow: "0 6px 10px rgba(180,120,140,0.22), inset 0 0 0 1px rgba(255,255,255,0.55)",
        ...paperTexture,
      }}>
        <span style={{
          position: "absolute", left: "50%", top: -7,
          width: 32, height: 12,
          transform: `translateX(-50%) rotate(${-tilt * 1.3}deg)`,
          background: "linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25% 50%, rgba(255,255,255,0.5) 50% 75%, transparent 75%), rgba(255,210,225,0.85)",
          backgroundSize: "10px 10px",
          opacity: 0.9,
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          pointerEvents: "none",
        }}/>
        {children}
      </div>
    </Hover>
  );
}

function StickyRow() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", paddingTop: 8 }}>
      <StickyA tilt={-2} color="#d8efe0" w={88}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 16, height: 16, color: "#3a7a4a" }}>{HUD_ICONS.calendar}</span>
          <span style={{ color: "#2f5a3e", fontSize: 12, fontWeight: 900 }}>第 30 天</span>
        </div>
      </StickyA>
      <StickyA tilt={3} color="#cfe6f5" w={112}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 16, height: 16, color: "#3d7aa0" }}>{HUD_ICONS.hourglass}</span>
          <span style={{ color: "#2c5670", fontSize: 12, fontWeight: 900 }}>下一天 12.3s</span>
        </div>
      </StickyA>
      <StickyA tilt={-3} color="#ffd0c0" w={56}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center" }}>
          <span style={{ width: 12, height: 12, color: "#a64428" }}>{HUD_ICONS.play}</span>
          <span style={{ color: "#a64428", fontSize: 13, fontWeight: 900 }}>1x</span>
        </div>
      </StickyA>
    </div>
  );
}

// ============== BOTTOM-LEFT: A-style progress sticky notes ==============
function ProgressNoteA({ color, tilt, icon, iconColor, label, value, pct, barColor, pinColor }) {
  return (
    <Hover lift={3}>
      <div style={{
        position: "relative",
        width: 200, padding: "8px 12px 10px",
        background: color,
        borderRadius: 8,
        transform: `rotate(${tilt}deg)`,
        boxShadow: "0 8px 14px rgba(180,120,140,0.22), inset 0 0 0 1px rgba(255,255,255,0.55)",
        ...paperTexture,
      }}>
        {/* pin */}
        <span style={{
          position: "absolute", left: 8, top: 6,
          width: 14, height: 14, borderRadius: "50%",
          background: `radial-gradient(circle at 35% 25%, rgba(255,255,255,0.92) 0 24%, transparent 25%), linear-gradient(135deg, ${shade(pinColor, 20)}, ${pinColor})`,
          border: `1px solid ${shade(pinColor, -40)}55`,
          boxShadow: "0 3px 0 rgba(140,65,65,0.18), 0 6px 12px rgba(171,78,78,0.22)",
        }}/>
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 18 }}>
          <span style={{ width: 16, height: 16, color: iconColor }}>{icon}</span>
          <span style={{ color: "#5b382d", fontSize: 12, fontWeight: 900 }}>{label}</span>
          <span style={{ marginLeft: "auto", color: "#5b382d", fontSize: 13, fontWeight: 900 }}>{value}</span>
        </div>
        <div style={{
          marginTop: 6, height: 6, borderRadius: 999,
          background: "rgba(255,255,255,0.55)",
          border: "1px solid rgba(150,100,90,0.2)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: `linear-gradient(90deg, ${shade(barColor, 20)}, ${barColor})`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
          }}/>
        </div>
      </div>
    </Hover>
  );
}

function FinalHud() {
  return (
    <div style={{
      width: 1000, height: 700,
      background: "url('https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=1100') center/cover, #f4e8d8",
      backgroundBlendMode: "soft-light",
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* TOP-LEFT */}
      <div style={{ position: "absolute", left: 14, top: 14, display: "flex", flexDirection: "column", gap: 4 }}>
        <Wallet/>
        <StickyRow/>
      </div>

      {/* BOTTOM-LEFT */}
      <div style={{ position: "absolute", left: 14, bottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <ProgressNoteA color="#ffd9b8" tilt={-2} icon={HUD_ICONS.briefcase} iconColor="#a86438" pinColor="#df6374" label="完成任務" value="0" pct={100} barColor="#e88a4c"/>
        <ProgressNoteA color="#e0d0f0" tilt={1.5} icon={HUD_ICONS.coffee} iconColor="#7a4ab0" pinColor="#9a6cd0" label="精神" value="充滿" pct={36} barColor="#a070d8"/>
      </div>

      {/* fake top-right toolbar reference */}
      <div style={{ position: "absolute", right: 14, top: 14, color: "#7a5a4a", fontSize: 11, fontWeight: 700, opacity: 0.5 }}>
        （右上工具列另案）
      </div>
    </div>
  );
}

window.FinalHud = FinalHud;
