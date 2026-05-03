/* global React */
const { useState } = React;

const paperTexture = {
  backgroundImage:
    "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)," +
    " radial-gradient(circle at 6px 6px, rgba(0,0,0,0.022) 1px, transparent 1.6px)",
  backgroundSize: "auto, 12px 12px",
};

const OFFICES = [
  { id: "garage",  name: "車庫工作室", lv: 1, theme: "kawaii",  state: "active",   emoji: "🏚️", grad: "linear-gradient(160deg, #b8d8a0, #88a868)" },
  { id: "small",   name: "小辦公室",   lv: 2, theme: "kawaii",  state: "unlocked", emoji: "🏡",  grad: "linear-gradient(160deg, #c8d8e8, #98b0c8)" },
  { id: "medium",  name: "中型辦公室", lv: 3, theme: "shibuya", state: "locked",   emoji: "🏢", grad: "linear-gradient(160deg, #d8b8a0, #a88058)" },
  { id: "large",   name: "大型辦公室", lv: 4, theme: "skyline", state: "locked",   emoji: "🏬", grad: "linear-gradient(160deg, #e8c8a8, #c88858)" },
  { id: "luxury",  name: "豪華總部",   lv: 5, theme: "zen",     state: "locked",   emoji: "🏛️", grad: "linear-gradient(160deg, #c8c8d8, #8898a8)" },
];

function Frame({ children, label }) {
  return (
    <div style={{
      width: 720, height: 880,
      background: "linear-gradient(160deg, #b9aec8 0%, #c8c0d6 50%, #d6c8d8 100%)",
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle at 20% 40%, rgba(255,210,180,0.3), transparent 40%), radial-gradient(circle at 75% 30%, rgba(255,180,200,0.25), transparent 35%)",
        filter: "blur(20px)",
      }}/>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "30px 20px", overflow: "auto" }}>
        {children}
      </div>
      <div style={{
        position: "absolute", right: 12, top: 12,
        background: "rgba(255,255,255,0.88)",
        padding: "5px 10px", borderRadius: 8,
        fontSize: 11, fontWeight: 900, color: "#5b382d",
        boxShadow: "0 3px 6px rgba(0,0,0,0.1)", zIndex: 10,
      }}>{label}</div>
    </div>
  );
}

function WashiTape({ left, top, right, bottom, width = 80, color = "#f6a7b3", rotate = -7 }) {
  return (
    <span aria-hidden="true" style={{
      position: "absolute", left, top, right, bottom, width, height: 22,
      transform: `rotate(${rotate}deg)`,
      opacity: 0.9,
      background: `linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25% 50%, rgba(255,255,255,0.5) 50% 75%, transparent 75%), ${color}`,
      backgroundSize: "20px 20px",
      boxShadow: "0 4px 10px rgba(166,91,85,0.18)",
      zIndex: 5, pointerEvents: "none",
    }}/>
  );
}

// 共用：辦公室 thumbnail（placeholder — 用漸層底 + emoji，等真圖再換）
function Thumb({ grad, emoji, state, size = 72 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: grad,
      flexShrink: 0,
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.3)",
      border: "2px solid #fffaf2",
      filter: state === "locked" ? "grayscale(0.7) brightness(0.85)" : "none",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.5,
        textShadow: "0 2px 4px rgba(0,0,0,0.25)",
      }}>{emoji}</div>
      {state === "locked" && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(60,40,55,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.32,
          color: "#fff",
        }}>🔒</div>
      )}
    </div>
  );
}

// ============== V1: 紙堆疊 + 拍立得縮圖 ==============
function V1Polaroid() {
  const [active, setActive] = useState("garage");

  return (
    <div style={{ position: "relative", width: 460 }}>
      {/* 後紙堆疊 */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#fff7ec", borderRadius: 14,
        transform: "rotate(-1.4deg) translate(-5px, 4px)",
        boxShadow: "0 10px 18px rgba(150,90,80,0.18)",
        ...paperTexture,
      }}/>
      <div style={{
        position: "absolute", inset: 0,
        background: "#ffe8e0", borderRadius: 14,
        transform: "rotate(1.0deg) translate(4px, 2px)",
        boxShadow: "0 10px 18px rgba(150,90,80,0.18)",
        ...paperTexture,
      }}/>

      <div style={{
        position: "relative",
        background: "linear-gradient(180deg, #fffaf2, #fff2e8)",
        borderRadius: 14,
        padding: "26px 22px 20px",
        boxShadow: "0 14px 28px rgba(150,90,80,0.22), inset 0 0 0 1px rgba(255,255,255,0.7)",
        border: "1px solid rgba(220,170,150,0.4)",
        ...paperTexture,
      }}>
        <WashiTape left={-12} top={20} width={70} rotate={-30} color="#cfe6f5"/>
        <WashiTape right={-12} top={56} width={70} rotate={30} color="#ffc1ce"/>

        {/* 房子徽章 */}
        <div style={{
          position: "absolute", left: "50%", top: -26,
          transform: "translateX(-50%) rotate(-4deg)",
          width: 56, height: 56, borderRadius: 16,
          background: "linear-gradient(180deg, #b8d8a0, #88a868)",
          border: "3px solid #fff",
          boxShadow: "0 8px 14px rgba(80,120,60,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28,
          zIndex: 6,
        }}>🏡</div>

        {/* Close */}
        <button style={{
          position: "absolute", right: 14, top: 14,
          width: 32, height: 32,
          background: "#fffaf2", color: "#7a3a52",
          border: "1.5px solid rgba(180,120,90,0.35)", borderRadius: 999,
          fontSize: 14, fontWeight: 900, cursor: "pointer",
          boxShadow: "0 2px 4px rgba(150,90,80,0.1)",
          zIndex: 4,
        }}>✕</button>

        {/* Title */}
        <div style={{ paddingTop: 32, textAlign: "center" }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 4,
            color: "#df6374",
          }}>OFFICE STYLE · 造型</div>
          <h2 style={{
            margin: "2px 0 0", fontSize: 20, fontWeight: 900,
            color: "#7a3a52", letterSpacing: 1,
          }}>辦公室造型</h2>
          <div style={{
            marginTop: 5,
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "2px 10px",
            background: "rgba(255,210,225,0.5)",
            borderRadius: 999,
            fontSize: 10, color: "#9a4a62", fontWeight: 700,
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#df6374" }}/>
            只影響外觀．不影響容量
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#df6374" }}/>
          </div>
        </div>

        {/* Cards */}
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          {OFFICES.map((o, i) => (
            <V1Card key={o.id} office={o} active={active === o.id && o.state !== "locked"}
              onClick={() => o.state !== "locked" && setActive(o.id)}
              tilt={[(-0.6), 0.4, -0.5, 0.6, -0.3][i]}
            />
          ))}
        </div>

        <div style={{
          marginTop: 14,
          padding: "9px 12px",
          background: "rgba(255,232,224,0.55)",
          borderRadius: 8,
          border: "1px dashed rgba(180,120,90,0.4)",
          fontSize: 11, color: "#7a3a52", fontWeight: 700,
          textAlign: "center",
        }}>
          🐾 已升級到的等級才能選擇造型
        </div>
      </div>
    </div>
  );
}

function V1Card({ office, active, onClick, tilt }) {
  const o = office;
  const locked = o.state === "locked";

  return (
    <div onClick={onClick} style={{
      position: "relative",
      background: active
        ? "linear-gradient(180deg, #fff8e6, #ffeec8)"
        : (locked ? "rgba(245,238,232,0.8)" : "#fffaf2"),
      borderRadius: 11,
      padding: "10px 12px",
      border: active
        ? "2px solid #df6374"
        : (locked ? "1px solid rgba(180,150,140,0.3)" : "1.5px solid rgba(220,170,150,0.5)"),
      boxShadow: active
        ? "0 8px 16px rgba(223,99,116,0.28)"
        : "0 3px 8px rgba(150,90,80,0.12)",
      display: "flex", alignItems: "center", gap: 12,
      cursor: locked ? "not-allowed" : "pointer",
      opacity: locked ? 0.7 : 1,
      transform: `rotate(${tilt}deg)`,
      transition: "all 0.18s ease",
      ...paperTexture,
    }}>
      {/* 紙膠帶釘住 */}
      {active && (
        <span aria-hidden="true" style={{
          position: "absolute", left: 8, top: -7,
          width: 38, height: 13,
          transform: "rotate(-12deg)",
          background: `linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25% 50%, rgba(255,255,255,0.5) 50% 75%, transparent 75%), #ffc1ce`,
          backgroundSize: "10px 10px",
          opacity: 0.92,
          boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
        }}/>
      )}

      <Thumb grad={o.grad} emoji={o.emoji} state={o.state}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 16, fontWeight: 900,
            color: locked ? "#a39988" : "#5b382d",
          }}>{o.name}</span>
          <span style={{
            fontSize: 10, fontWeight: 900, letterSpacing: 1,
            padding: "1px 6px", borderRadius: 4,
            background: locked ? "rgba(180,150,140,0.2)" : "linear-gradient(180deg, #ffd86b, #ffb838)",
            color: locked ? "#8a7d70" : "#5a3a00",
            border: locked ? "1px solid rgba(180,150,140,0.3)" : "1px solid rgba(120,80,0,0.25)",
          }}>Lv {o.lv}</span>
          {active && (
            <span style={{
              fontSize: 10, fontWeight: 900, letterSpacing: 1,
              padding: "1px 8px", borderRadius: 999,
              background: "linear-gradient(180deg, #ff8aa6, #ef6f8f)",
              color: "#fff",
              border: "1px solid rgba(180,60,90,0.4)",
              boxShadow: "0 2px 4px rgba(239,111,143,0.3)",
            }}>使用中</span>
          )}
          {o.state === "unlocked" && !active && (
            <span style={{
              fontSize: 10, fontWeight: 800,
              padding: "1px 7px", borderRadius: 999,
              background: "rgba(100,233,214,0.2)",
              color: "#2a9785",
              border: "1px solid rgba(100,233,214,0.5)",
            }}>可選</span>
          )}
          {locked && (
            <span style={{
              fontSize: 10, fontWeight: 800,
              padding: "1px 7px", borderRadius: 999,
              background: "rgba(180,150,140,0.2)",
              color: "#8a7d70",
              border: "1px solid rgba(180,150,140,0.4)",
            }}>未解鎖</span>
          )}
        </div>
        <div style={{
          fontSize: 11, color: locked ? "#a39988" : "#a37a82",
          fontWeight: 700, marginTop: 2,
        }}>
          主題：{o.theme}
        </div>
      </div>

      {active && (
        <div style={{
          position: "absolute", right: -6, top: -6,
          padding: "2px 6px",
          border: "1.5px solid rgba(180,80,100,0.5)",
          borderRadius: 4,
          color: "rgba(180,80,100,0.85)",
          fontSize: 9, fontWeight: 900, letterSpacing: 1,
          transform: "rotate(8deg)",
          background: "rgba(255,250,242,0.95)",
          boxShadow: "0 2px 4px rgba(180,80,100,0.2)",
        }}>USING</div>
      )}
    </div>
  );
}

// ============== V2: Grid 拍立得照片牆 ==============
function V2Grid() {
  const [active, setActive] = useState("garage");

  return (
    <div style={{ position: "relative", width: 480 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "#fff7ec", borderRadius: 14,
        transform: "rotate(-1.2deg) translate(-5px, 4px)",
        boxShadow: "0 10px 18px rgba(150,90,80,0.18)",
        ...paperTexture,
      }}/>

      <div style={{
        position: "relative",
        background: "linear-gradient(180deg, #fffaf2, #fff2e8)",
        borderRadius: 14,
        padding: "26px 22px 20px",
        boxShadow: "0 14px 28px rgba(150,90,80,0.22)",
        border: "1px solid rgba(220,170,150,0.4)",
        ...paperTexture,
      }}>
        <WashiTape left={-12} top={20} width={70} rotate={-30} color="#cfe6f5"/>
        <WashiTape right={-12} top={56} width={70} rotate={30} color="#ffc1ce"/>

        <div style={{
          position: "absolute", left: "50%", top: -26,
          transform: "translateX(-50%) rotate(-4deg)",
          width: 56, height: 56, borderRadius: 16,
          background: "linear-gradient(180deg, #b8d8a0, #88a868)",
          border: "3px solid #fff",
          boxShadow: "0 8px 14px rgba(80,120,60,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, zIndex: 6,
        }}>🏡</div>

        <button style={{
          position: "absolute", right: 14, top: 14,
          width: 32, height: 32,
          background: "#fffaf2", color: "#7a3a52",
          border: "1.5px solid rgba(180,120,90,0.35)", borderRadius: 999,
          fontSize: 14, fontWeight: 900, cursor: "pointer",
        }}>✕</button>

        <div style={{ paddingTop: 32, textAlign: "center" }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 4, color: "#df6374",
          }}>OFFICE STYLE · 造型</div>
          <h2 style={{
            margin: "2px 0 0", fontSize: 20, fontWeight: 900,
            color: "#7a3a52", letterSpacing: 1,
          }}>辦公室造型</h2>
          <div style={{
            marginTop: 5,
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "2px 10px",
            background: "rgba(255,210,225,0.5)",
            borderRadius: 999,
            fontSize: 10, color: "#9a4a62", fontWeight: 700,
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#df6374" }}/>
            只影響外觀．不影響容量
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#df6374" }}/>
          </div>
        </div>

        {/* Grid */}
        <div style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}>
          {OFFICES.map((o, i) => (
            <V2Card key={o.id} office={o}
              active={active === o.id && o.state !== "locked"}
              onClick={() => o.state !== "locked" && setActive(o.id)}
              tilt={[(-1.5), 1.2, -1, 1.5, -0.8][i]}
            />
          ))}
          {/* 補一張紙條填滿 grid */}
          <div style={{
            background: "rgba(255,232,224,0.4)",
            borderRadius: 10,
            border: "1px dashed rgba(180,120,90,0.4)",
            padding: "14px 12px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 6,
            transform: "rotate(0.8deg)",
          }}>
            <div style={{ fontSize: 22 }}>🐾</div>
            <div style={{
              fontSize: 11, color: "#7a3a52", fontWeight: 700,
              textAlign: "center", lineHeight: 1.5,
            }}>
              升級辦公室<br/>解鎖更多造型
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function V2Card({ office, active, onClick, tilt }) {
  const o = office;
  const locked = o.state === "locked";

  return (
    <div onClick={onClick} style={{
      position: "relative",
      background: "#fffaf2",
      borderRadius: 8,
      padding: "10px 10px 12px",
      border: active ? "2px solid #df6374" : "1px solid rgba(220,170,150,0.5)",
      boxShadow: active ? "0 8px 18px rgba(223,99,116,0.28)" : "0 4px 10px rgba(150,90,80,0.18)",
      cursor: locked ? "not-allowed" : "pointer",
      opacity: locked ? 0.78 : 1,
      transform: `rotate(${tilt}deg)`,
      transition: "all 0.18s ease",
      ...paperTexture,
    }}>
      {/* 紙膠帶 */}
      <span aria-hidden="true" style={{
        position: "absolute", left: "50%", top: -6,
        transform: "translateX(-50%) rotate(-3deg)",
        width: 50, height: 12,
        background: `linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25% 50%, rgba(255,255,255,0.5) 50% 75%, transparent 75%), ${active ? "#ffc1ce" : "#e8d8c0"}`,
        backgroundSize: "10px 10px",
        opacity: 0.92,
        boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
      }}/>

      <div style={{ position: "relative" }}>
        <div style={{
          width: "100%", aspectRatio: "4/3",
          borderRadius: 6,
          background: o.grad,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48,
          textShadow: "0 2px 4px rgba(0,0,0,0.25)",
          filter: locked ? "grayscale(0.7) brightness(0.85)" : "none",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)",
        }}>{o.emoji}</div>
        {locked && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(60,40,55,0.35)",
            borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: "#fff",
          }}>🔒</div>
        )}
        {active && (
          <div style={{
            position: "absolute", right: -4, top: -4,
            padding: "2px 7px",
            background: "linear-gradient(180deg, #ff8aa6, #ef6f8f)",
            color: "#fff",
            fontSize: 9, fontWeight: 900, letterSpacing: 1,
            borderRadius: 4,
            border: "1px solid rgba(180,60,90,0.4)",
            transform: "rotate(8deg)",
            boxShadow: "0 3px 6px rgba(239,111,143,0.4)",
          }}>使用中</div>
        )}
      </div>

      <div style={{
        marginTop: 8,
        display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: 13, fontWeight: 900,
          color: locked ? "#a39988" : "#5b382d",
        }}>{o.name}</span>
        <span style={{
          fontSize: 9, fontWeight: 900, letterSpacing: 1,
          padding: "1px 5px", borderRadius: 3,
          background: locked ? "rgba(180,150,140,0.2)" : "linear-gradient(180deg, #ffd86b, #ffb838)",
          color: locked ? "#8a7d70" : "#5a3a00",
          border: locked ? "1px solid rgba(180,150,140,0.3)" : "1px solid rgba(120,80,0,0.25)",
        }}>Lv {o.lv}</span>
      </div>
      <div style={{
        fontSize: 10, color: locked ? "#a39988" : "#a37a82",
        fontWeight: 700, marginTop: 2,
      }}>
        主題：{o.theme}
      </div>
    </div>
  );
}

window.V1Polaroid = V1Polaroid;
window.V2Grid = V2Grid;
window.OfficeFrame = Frame;
