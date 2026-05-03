/* global React */

const PAW_TB = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <ellipse cx="12" cy="15" rx="5" ry="4.2" />
    <ellipse cx="5.5" cy="10" rx="2.2" ry="2.8" />
    <ellipse cx="18.5" cy="10" rx="2.2" ry="2.8" />
    <ellipse cx="8.5" cy="5.2" rx="1.9" ry="2.4" />
    <ellipse cx="15.5" cy="5.2" rx="1.9" ry="2.4" />
  </svg>
);

const ICONS = {
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/>
      <path d="M5 5H3v2a3 3 0 0 0 3 3"/>
      <path d="M19 5h2v2a3 3 0 0 1-3 3"/>
      <path d="M10 14h4v3l-1 3h-2l-1-3z"/>
    </svg>
  ),
  gallery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <circle cx="9" cy="10" r="1.6"/>
      <path d="M3 17l5-5 4 4 3-3 6 6"/>
    </svg>
  ),
  pen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4l6 6-11 11H3v-6z"/>
      <path d="M13 5l6 6"/>
    </svg>
  ),
  music: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l11-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="17" cy="16" r="3"/>
    </svg>
  ),
  save: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h12l4 4v14H3V5a2 2 0 0 1 2-2z"/>
      <path d="M7 3v6h9V3"/>
      <rect x="7" y="13" width="10" height="6"/>
    </svg>
  ),
  restart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7"/>
      <path d="M21 4v5h-5"/>
    </svg>
  ),
};

const TOOLS = [
  { key: "trophy",  label: "成就",   color: "#ffd97a", iconColor: "#a37434", tilt: -3, badge: "3" },
  { key: "gallery", label: "相簿",   color: "#ffd0dc", iconColor: "#c44a6a", tilt: 2 },
  { key: "pen",     label: "筆記",   color: "#e8d6f5", iconColor: "#7a4ab0", tilt: -2 },
  { key: "music",   label: "音樂",   color: "#c8e6f5", iconColor: "#3d7aa0", tilt: 3 },
  { key: "save",    label: "存檔",   color: "#d6efd0", iconColor: "#3a7a4a", tilt: -2 },
  { key: "restart", label: "重整",   color: "#ffe0c8", iconColor: "#a86438", tilt: 3 },
];

function shadeT(hex, amt) {
  const c = hex.replace("#","");
  const n = parseInt(c, 16);
  const r = Math.max(0, Math.min(255, ((n>>16)&0xff) + amt));
  const g = Math.max(0, Math.min(255, ((n>>8)&0xff) + amt));
  const b = Math.max(0, Math.min(255, (n&0xff) + amt));
  return "#" + ((r<<16)|(g<<8)|b).toString(16).padStart(6,"0");
}

// === Variant A: Square sticky notes with tape ===
function ToolButtonA({ tool, onHover, onLeave }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onMouseEnter={() => { setHover(true); onHover && onHover(tool); }}
      onMouseLeave={() => { setHover(false); onLeave && onLeave(); }}
      style={{
        position: "relative",
        width: 48, height: 48,
        background: tool.color,
        border: 0,
        borderRadius: 8,
        cursor: "pointer",
        transform: `rotate(${tool.tilt}deg) translateY(${hover ? -3 : 0}px)`,
        transition: "transform .15s ease, box-shadow .15s ease",
        boxShadow: hover
          ? "0 8px 14px rgba(180,120,140,0.28), inset 0 0 0 1px rgba(255,255,255,0.6)"
          : "0 4px 8px rgba(180,120,140,0.22), inset 0 0 0 1px rgba(255,255,255,0.6)",
        backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%), radial-gradient(circle at 6px 6px, rgba(0,0,0,0.025) 1px, transparent 1.5px)",
        backgroundSize: "auto, 12px 12px",
        padding: 0,
        color: tool.iconColor,
      }}
    >
      {/* tape */}
      <div style={{
        position: "absolute", top: -5, left: "50%",
        width: 26, height: 9,
        transform: `translateX(-50%) rotate(${-tool.tilt * 1.5}deg)`,
        background: tool.tilt > 0 ? "#f7b8cf" : "#c8e6f5",
        backgroundImage: "repeating-linear-gradient(135deg, transparent 0 4px, rgba(255,255,255,0.4) 4px 5px)",
        boxShadow: "0 1px 2px rgba(184,108,140,0.22)",
      }}/>
      <div style={{ width: 22, height: 22, margin: "0 auto" }}>
        {ICONS[tool.key]}
      </div>
      {tool.badge && (
        <div style={{
          position: "absolute", top: -4, right: -4,
          minWidth: 16, height: 16, borderRadius: 999,
          background: "#ef6f8f",
          color: "#fff", fontSize: 9, fontWeight: 900,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 4px",
          boxShadow: "0 2px 4px rgba(239,111,143,0.4)",
          transform: `rotate(${-tool.tilt}deg)`,
        }}>
          {tool.badge}
        </div>
      )}
    </button>
  );
}

function ToolbarA() {
  const [hovered, setHovered] = React.useState(null);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "4px 2px" }}>
        {TOOLS.map((t) => (
          <ToolButtonA key={t.key} tool={t} onHover={setHovered} onLeave={() => setHovered(null)} />
        ))}
      </div>
      {hovered && (
        <div style={{
          position: "absolute", top: 60, right: 0,
          padding: "4px 10px",
          background: "#fffafc",
          borderRadius: 6,
          fontSize: 11, fontWeight: 800, color: "#7a3a52",
          boxShadow: "0 4px 8px rgba(180,120,140,0.22), inset 0 0 0 1px rgba(255,255,255,0.6)",
          whiteSpace: "nowrap",
          transform: "rotate(-2deg)",
        }}>
          {hovered.label}
        </div>
      )}
    </div>
  );
}

// === Variant B: Rounded "pill" sticky group ===
function ToolbarB() {
  return (
    <div style={{
      display: "inline-flex",
      gap: 4,
      padding: "8px 10px",
      background: "#fffafc",
      borderRadius: 999,
      transform: "rotate(-1.5deg)",
      boxShadow: "0 8px 16px rgba(180,120,140,0.22), inset 0 0 0 1px rgba(255,255,255,0.6)",
      backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 60%), radial-gradient(circle at 6px 6px, rgba(0,0,0,0.025) 1px, transparent 1.5px)",
      backgroundSize: "auto, 12px 12px",
      position: "relative",
    }}>
      {/* tape on top-right corner */}
      <div style={{
        position: "absolute", top: -7, right: 18,
        width: 36, height: 12,
        background: "#f7b8cf",
        transform: "rotate(20deg)",
        backgroundImage: "repeating-linear-gradient(135deg, transparent 0 5px, rgba(255,255,255,0.4) 5px 6px)",
        boxShadow: "0 1px 2px rgba(184,108,140,0.22)",
      }}/>
      {TOOLS.map((t) => (
        <button key={t.key} style={{
          width: 38, height: 38, borderRadius: "50%",
          border: 0, cursor: "pointer",
          background: t.color,
          color: t.iconColor,
          padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.6), 0 2px 4px rgba(180,120,140,0.18)",
          transition: "transform .15s ease",
          position: "relative",
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px) scale(1.06)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0) scale(1)"}
          title={t.label}
        >
          <div style={{ width: 18, height: 18 }}>{ICONS[t.key]}</div>
          {t.badge && (
            <div style={{
              position: "absolute", top: -2, right: -2,
              minWidth: 14, height: 14, borderRadius: 999,
              background: "#ef6f8f",
              color: "#fff", fontSize: 9, fontWeight: 900,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 4px rgba(239,111,143,0.4)",
            }}>{t.badge}</div>
          )}
        </button>
      ))}
    </div>
  );
}

// === Variant C: Hanging strip (掛繩) — buttons hang from a string ===
function ToolbarC() {
  return (
    <div style={{ position: "relative", paddingTop: 14, display: "inline-block" }}>
      {/* string */}
      <svg viewBox="0 0 320 30" preserveAspectRatio="none" style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: 30,
      }}>
        <path d="M5 4 Q 80 18, 160 14 T 315 4" stroke="#a37a8a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        {TOOLS.map((t, i) => (
          <div key={t.key} style={{ position: "relative", paddingTop: 10 }}>
            {/* clip / hook */}
            <div style={{
              position: "absolute", top: -2, left: "50%",
              width: 8, height: 16,
              transform: "translateX(-50%)",
              background: "#c0a090",
              borderRadius: "3px 3px 1px 1px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              zIndex: 2,
            }}/>
            <button style={{
              position: "relative",
              width: 44, height: 44,
              background: t.color,
              border: 0,
              borderRadius: 8,
              cursor: "pointer",
              transform: `rotate(${t.tilt}deg)`,
              boxShadow: "0 6px 10px rgba(180,120,140,0.22), inset 0 0 0 1px rgba(255,255,255,0.6)",
              backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0) 60%)",
              padding: 0,
              color: t.iconColor,
            }}
              title={t.label}
            >
              <div style={{ width: 20, height: 20, margin: "0 auto" }}>{ICONS[t.key]}</div>
              {t.badge && (
                <div style={{
                  position: "absolute", top: -4, right: -4,
                  minWidth: 14, height: 14, borderRadius: 999,
                  background: "#ef6f8f",
                  color: "#fff", fontSize: 9, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(239,111,143,0.4)",
                }}>{t.badge}</div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// === Variant D: Vertical sticky stack ===
function ToolbarD() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
      {TOOLS.map((t, i) => (
        <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 8, transform: `translateX(${(i % 2 === 0) ? 0 : -10}px)` }}>
          <div style={{
            padding: "2px 10px",
            background: "#fffafc",
            borderRadius: 6,
            fontSize: 10, fontWeight: 800, color: "#7a3a52",
            transform: `rotate(${t.tilt}deg)`,
            boxShadow: "0 2px 4px rgba(180,120,140,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)",
            opacity: 0.95,
          }}>
            {t.label}
          </div>
          <button style={{
            position: "relative",
            width: 44, height: 44,
            background: t.color,
            border: 0,
            borderRadius: 10,
            cursor: "pointer",
            transform: `rotate(${t.tilt}deg)`,
            boxShadow: "0 4px 8px rgba(180,120,140,0.22), inset 0 0 0 1px rgba(255,255,255,0.6)",
            backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0) 60%)",
            padding: 0,
            color: t.iconColor,
          }}>
            <div style={{ width: 20, height: 20, margin: "0 auto" }}>{ICONS[t.key]}</div>
            {t.badge && (
              <div style={{
                position: "absolute", top: -4, right: -4,
                minWidth: 14, height: 14, borderRadius: 999,
                background: "#ef6f8f",
                color: "#fff", fontSize: 9, fontWeight: 900,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{t.badge}</div>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

function MockBg({ children }) {
  return (
    <div style={{
      width: 600, height: 200,
      background: "linear-gradient(180deg, #a8c9e8 0%, #d8e4ec 100%)",
      borderRadius: 14,
      position: "relative",
      overflow: "hidden",
      fontFamily: '"Noto Sans TC", system-ui, sans-serif',
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
    }}>
      <div style={{ position: "absolute", top: 14, right: 14 }}>
        {children}
      </div>
    </div>
  );
}

window.ToolbarA = ToolbarA;
window.ToolbarB = ToolbarB;
window.ToolbarC = ToolbarC;
window.ToolbarD = ToolbarD;
window.MockBg = MockBg;
