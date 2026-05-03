/* global React */

const ICONS_C = {
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

const TOOLS_C = [
  { key: "trophy",  label: "成就",  color: "#ffd97a", iconColor: "#a37434", tilt: -4, badge: "3", clip: "#e8a868" },
  { key: "gallery", label: "相簿",  color: "#ffd0dc", iconColor: "#c44a6a", tilt: 3,  clip: "#d896a8" },
  { key: "pen",     label: "筆記",  color: "#e8d6f5", iconColor: "#7a4ab0", tilt: -3, clip: "#b89ad0" },
  { key: "music",   label: "音樂",  color: "#c8e6f5", iconColor: "#3d7aa0", tilt: 4,  clip: "#90b6d0" },
  { key: "save",    label: "存檔",  color: "#d6efd0", iconColor: "#3a7a4a", tilt: -2, clip: "#9ac890" },
  { key: "restart", label: "重整",  color: "#ffe0c8", iconColor: "#a86438", tilt: 3,  clip: "#d8a888" },
];

function HangingToolbar() {
  const [hovered, setHovered] = React.useState(null);

  return (
    <div style={{ position: "relative", display: "inline-block", paddingTop: 18 }}>
      {/* knot anchors at both ends */}
      <div style={{
        position: "absolute", top: 4, left: -2,
        width: 8, height: 8, borderRadius: "50%",
        background: "#7a5a4a",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        zIndex: 3,
      }}/>
      <div style={{
        position: "absolute", top: 8, right: -2,
        width: 8, height: 8, borderRadius: "50%",
        background: "#7a5a4a",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        zIndex: 3,
      }}/>

      {/* string — sags slightly */}
      <svg viewBox="0 0 360 30" preserveAspectRatio="none" style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: 30,
        zIndex: 1,
      }}>
        <path d="M2 6 Q 90 22, 180 18 T 358 10"
          stroke="#8a6858" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M2 6 Q 90 22, 180 18 T 358 10"
          stroke="#a88878" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.6"
          transform="translate(0, -1)"/>
      </svg>

      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "0 4px" }}>
        {TOOLS_C.map((t, i) => {
          const isHovered = hovered === t.key;
          // hang positions vary slightly along the sagging string
          const hangY = [2, 5, 7, 6, 4, 1][i];

          return (
            <div
              key={t.key}
              style={{
                position: "relative",
                paddingTop: 8 + hangY,
                transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                transition: "transform .18s ease",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHovered(t.key)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* wooden clip / peg */}
              <div style={{
                position: "absolute", top: hangY, left: "50%",
                width: 12, height: 18,
                transform: `translateX(-50%) rotate(${t.tilt * 0.4}deg)`,
                zIndex: 2,
              }}>
                {/* clip body */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(180deg, ${t.clip}, ${shadeC(t.clip, -18)})`,
                  borderRadius: "3px 3px 2px 2px",
                  boxShadow: "0 2px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
                }}/>
                {/* clip seam */}
                <div style={{
                  position: "absolute", top: 4, left: "50%",
                  width: 1, height: 12,
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.18)",
                }}/>
                {/* clip dot (the spring rivet) */}
                <div style={{
                  position: "absolute", top: 7, left: "50%",
                  width: 3, height: 3, borderRadius: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.3)",
                }}/>
              </div>

              {/* sticky note button */}
              <button
                aria-label={t.label}
                style={{
                  position: "relative",
                  width: 48, height: 48,
                  background: t.color,
                  border: 0,
                  borderRadius: 8,
                  cursor: "pointer",
                  transform: `rotate(${t.tilt}deg)`,
                  boxShadow: isHovered
                    ? "0 10px 14px rgba(180,120,140,0.32), inset 0 0 0 1px rgba(255,255,255,0.6)"
                    : "0 6px 10px rgba(180,120,140,0.24), inset 0 0 0 1px rgba(255,255,255,0.6)",
                  backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%), radial-gradient(circle at 6px 6px, rgba(0,0,0,0.025) 1px, transparent 1.5px)",
                  backgroundSize: "auto, 12px 12px",
                  padding: 0,
                  color: t.iconColor,
                  fontFamily: "inherit",
                  transition: "box-shadow .18s ease",
                }}
              >
                <div style={{ width: 22, height: 22, margin: "0 auto" }}>
                  {ICONS_C[t.key]}
                </div>

                {/* badge */}
                {t.badge && (
                  <div style={{
                    position: "absolute", top: -4, right: -4,
                    minWidth: 16, height: 16, borderRadius: 999,
                    background: "linear-gradient(180deg, #ff8aa6, #ef6f8f)",
                    color: "#fff", fontSize: 10, fontWeight: 900,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 4px",
                    boxShadow: "0 2px 4px rgba(239,111,143,0.5)",
                    transform: `rotate(${-t.tilt}deg)`,
                    zIndex: 3,
                  }}>
                    {t.badge}
                  </div>
                )}
              </button>

              {/* hover tooltip — sticky note style */}
              {isHovered && (
                <div style={{
                  position: "absolute",
                  top: 70, left: "50%",
                  transform: "translateX(-50%) rotate(-2deg)",
                  padding: "4px 10px",
                  background: "#fffafc",
                  borderRadius: 6,
                  fontSize: 11, fontWeight: 800, color: "#7a3a52",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 8px rgba(180,120,140,0.28), inset 0 0 0 1px rgba(255,255,255,0.7)",
                  zIndex: 10,
                  pointerEvents: "none",
                }}>
                  {t.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function shadeC(hex, amt) {
  const c = hex.replace("#","");
  const n = parseInt(c, 16);
  const r = Math.max(0, Math.min(255, ((n>>16)&0xff) + amt));
  const g = Math.max(0, Math.min(255, ((n>>8)&0xff) + amt));
  const b = Math.max(0, Math.min(255, (n&0xff) + amt));
  return "#" + ((r<<16)|(g<<8)|b).toString(16).padStart(6,"0");
}

window.HangingToolbar = HangingToolbar;
