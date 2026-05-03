/* global React */
const { useState } = React;

const paperTexture = {
  backgroundImage:
    "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)," +
    " radial-gradient(circle at 6px 6px, rgba(0,0,0,0.022) 1px, transparent 1.6px)",
  backgroundSize: "auto, 12px 12px",
};

function Frame({ children, label }) {
  return (
    <div style={{
      width: 720, height: 540,
      background: "linear-gradient(160deg, #b9aec8 0%, #c8c0d6 50%, #d6c8d8 100%)",
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
      filter: "saturate(0.92)",
    }}>
      {/* fake blurred background hint */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle at 20% 40%, rgba(255,210,180,0.3), transparent 40%), radial-gradient(circle at 75% 30%, rgba(255,180,200,0.25), transparent 35%)",
        filter: "blur(20px)",
      }}/>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
      <div style={{
        position: "absolute", right: 12, top: 12,
        background: "rgba(255,255,255,0.88)",
        padding: "5px 10px", borderRadius: 8,
        fontSize: 11, fontWeight: 900, color: "#5b382d",
        boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
      }}>{label}</div>
    </div>
  );
}

function WashiTape({ left, top, right, width = 80, color = "#f6a7b3", rotate = -7 }) {
  return (
    <span aria-hidden="true" style={{
      position: "absolute", left, top, right, width, height: 22,
      transform: `rotate(${rotate}deg)`,
      opacity: 0.9,
      background: `linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25% 50%, rgba(255,255,255,0.5) 50% 75%, transparent 75%), ${color}`,
      backgroundSize: "20px 20px",
      boxShadow: "0 4px 10px rgba(166,91,85,0.18)",
      zIndex: 5,
      pointerEvents: "none",
    }}/>
  );
}

function Paw({ size = 24, color = "#df6374", style }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} width={size} height={size} style={style}>
      <ellipse cx="6.5" cy="9" rx="1.8" ry="2.4"/>
      <ellipse cx="17.5" cy="9" rx="1.8" ry="2.4"/>
      <ellipse cx="9.5" cy="5" rx="1.6" ry="2.2"/>
      <ellipse cx="14.5" cy="5" rx="1.6" ry="2.2"/>
      <path d="M12 11c-3 0-5 2.5-5 5 0 2 1.5 3 3 3 1 0 1.3-.5 2-.5s1 .5 2 .5c1.5 0 3-1 3-3 0-2.5-2-5-5-5z"/>
    </svg>
  );
}

// ============== V1: Stacked Notes（多張紙堆疊） ==============
function V1Stacked() {
  const [val, setVal] = useState("");
  return (
    <div style={{ position: "relative", width: 380 }}>
      {/* back paper layer 1 */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#fff7ec",
        borderRadius: 14,
        transform: "rotate(-2.5deg) translate(-6px, 4px)",
        boxShadow: "0 10px 18px rgba(150,90,80,0.18)",
        ...paperTexture,
      }}/>
      {/* back paper layer 2 */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#ffe8e0",
        borderRadius: 14,
        transform: "rotate(1.5deg) translate(4px, 2px)",
        boxShadow: "0 10px 18px rgba(150,90,80,0.18)",
        ...paperTexture,
      }}/>
      {/* main card */}
      <div style={{
        position: "relative",
        background: "linear-gradient(180deg, #fffaf2, #fff2e8)",
        borderRadius: 14,
        padding: "26px 28px 22px",
        boxShadow: "0 14px 28px rgba(150,90,80,0.22), inset 0 0 0 1px rgba(255,255,255,0.7)",
        border: "1px solid rgba(220,170,150,0.4)",
        ...paperTexture,
      }}>
        <WashiTape left="50%" top={-9} width={80} rotate={-4} color="#ffc1ce"/>
        <span style={{ position: "absolute", left: "calc(50% - 40px)", top: -9, transform: "translate(-50%, 0)" }}/>

        {/* paw badge */}
        <div style={{
          position: "absolute", right: -10, top: -10,
          width: 48, height: 48, borderRadius: "50%",
          background: "linear-gradient(180deg, #fff, #ffd6dc)",
          border: "2px solid rgba(255,255,255,0.9)",
          boxShadow: "0 6px 12px rgba(180,80,100,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(8deg)",
        }}>
          <Paw size={26} color="#df6374"/>
        </div>

        <h2 style={{
          margin: 0,
          fontSize: 22, fontWeight: 900,
          color: "#7a3a52",
          textAlign: "center",
          letterSpacing: 1,
        }}>為公司命名</h2>
        <div style={{
          width: 60, height: 3, margin: "8px auto 0",
          background: "linear-gradient(90deg, transparent, #df6374, transparent)",
          borderRadius: 2,
        }}/>
        <p style={{
          margin: "10px 0 18px",
          textAlign: "center",
          fontSize: 12, color: "#a37a82", fontWeight: 600,
        }}>一旦取了，這個帳號就無法再改囉 🐾</p>

        <label style={{
          display: "block",
          fontSize: 11, fontWeight: 900,
          color: "#7a3a52", marginBottom: 6,
        }}>
          <span style={{ color: "#df6374" }}>•</span> 公司名稱（2–8 字，中英數）
        </label>
        <div style={{
          background: "#fffaf6",
          border: "1.5px solid rgba(220,150,165,0.5)",
          borderRadius: 10,
          padding: "10px 14px",
          boxShadow: "inset 0 2px 4px rgba(150,90,80,0.08)",
        }}>
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="為公司取個響亮的名字"
            style={{
              width: "100%", border: 0, background: "transparent", outline: "none",
              fontSize: 14, color: "#5b382d", fontWeight: 700,
              fontFamily: "inherit",
            }}
          />
        </div>

        <button style={{
          width: "100%", marginTop: 16,
          padding: "12px 16px",
          background: "linear-gradient(180deg, #ff8aa6, #ef6f8f)",
          color: "#fff",
          border: "1.5px solid rgba(180,60,90,0.4)",
          borderRadius: 12,
          fontSize: 15, fontWeight: 900,
          letterSpacing: 1,
          cursor: "pointer",
          boxShadow: "0 6px 12px rgba(239,111,143,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}>
          確定，開始經營！
        </button>
      </div>
    </div>
  );
}

// ============== V2: Polaroid + 信封口（最豐富） ==============
function V2Polaroid() {
  const [val, setVal] = useState("");
  return (
    <div style={{ position: "relative", width: 360 }}>
      {/* paper card */}
      <div style={{
        position: "relative",
        background: "#fffaf2",
        borderRadius: 8,
        padding: "32px 28px 22px",
        boxShadow: "0 16px 32px rgba(120,80,90,0.28), inset 0 0 0 1px rgba(255,255,255,0.7)",
        border: "1px solid rgba(220,170,150,0.4)",
        ...paperTexture,
        transform: "rotate(-1deg)",
      }}>
        {/* tapes — 兩條交叉 */}
        <WashiTape left={-12} top={14} width={72} rotate={-32} color="#cfe6f5"/>
        <WashiTape right={-12} top={14} width={72} rotate={32} color="#ffe1a8"/>

        {/* heart paw badge */}
        <div style={{
          position: "absolute", left: "50%", top: -22,
          transform: "translateX(-50%) rotate(-4deg)",
          width: 56, height: 56,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(180deg, #ffd6dc, #ff9eb3)",
            border: "3px solid #fff",
            boxShadow: "0 8px 14px rgba(180,80,100,0.32)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Paw size={32} color="#fff"/>
          </div>
          {/* 小愛心裝飾 */}
          <span style={{
            position: "absolute", right: -8, top: 4,
            fontSize: 14, color: "#ff7591",
          }}>💗</span>
        </div>

        {/* title */}
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 4,
            color: "#df6374", marginBottom: 4,
          }}>WELCOME · 歡迎</div>
          <h2 style={{
            margin: 0, fontSize: 24, fontWeight: 900,
            color: "#7a3a52", letterSpacing: 1.5,
          }}>為公司命名</h2>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 6,
            padding: "3px 10px",
            background: "rgba(255,210,225,0.5)",
            borderRadius: 999,
            fontSize: 11, color: "#9a4a62", fontWeight: 700,
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#df6374" }}/>
            一旦取了就改不了囉
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#df6374" }}/>
          </div>
        </div>

        {/* divider — 虛線 */}
        <div style={{
          margin: "18px -8px",
          height: 1,
          backgroundImage: "repeating-linear-gradient(90deg, rgba(180,120,140,0.4) 0 6px, transparent 6px 12px)",
        }}/>

        {/* label + field */}
        <label style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 900,
          color: "#7a3a52", marginBottom: 8,
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 18, height: 18, borderRadius: "50%",
            background: "#df6374", color: "#fff", fontSize: 10, fontWeight: 900,
          }}>1</span>
          公司名稱
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#a37a82", fontWeight: 600 }}>2–8 字</span>
        </label>
        <div style={{
          position: "relative",
          background: "#fff",
          border: "1.5px solid rgba(220,150,165,0.5)",
          borderRadius: 10,
          padding: "11px 40px 11px 14px",
          boxShadow: "inset 0 2px 4px rgba(150,90,80,0.08)",
        }}>
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="例如：汪汪科技"
            style={{
              width: "100%", border: 0, background: "transparent", outline: "none",
              fontSize: 14, color: "#5b382d", fontWeight: 700,
            }}
          />
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 11, color: "#c4a3aa", fontWeight: 700,
          }}>{val.length}/8</span>
        </div>

        {/* helper hint with tiny icons */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginTop: 10,
          padding: "8px 10px",
          background: "rgba(255,240,200,0.5)",
          borderRadius: 8,
          fontSize: 11, color: "#8a6a3a", fontWeight: 600,
        }}>
          <span style={{ fontSize: 14 }}>💡</span>
          可以用「公司」「股份」也可以亂取，總之要響亮
        </div>

        <button style={{
          width: "100%", marginTop: 16,
          padding: "13px 16px",
          background: "linear-gradient(180deg, #ff8aa6, #ef6f8f)",
          color: "#fff",
          border: "1.5px solid rgba(180,60,90,0.4)",
          borderRadius: 12,
          fontSize: 15, fontWeight: 900,
          letterSpacing: 2,
          cursor: "pointer",
          boxShadow: "0 8px 14px rgba(239,111,143,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <Paw size={16} color="#fff"/>
          確定，開始經營！
        </button>

        {/* corner stamp */}
        <div style={{
          position: "absolute", right: 12, bottom: 8,
          padding: "2px 6px",
          border: "1.5px solid rgba(180,80,100,0.5)",
          borderRadius: 4,
          color: "rgba(180,80,100,0.7)",
          fontSize: 9, fontWeight: 900, letterSpacing: 1,
          transform: "rotate(-6deg)",
        }}>NEW · DAY 1</div>
      </div>
    </div>
  );
}

// ============== V3: Postcard 明信片（左圖右文） ==============
function V3Postcard() {
  const [val, setVal] = useState("");
  return (
    <div style={{
      position: "relative",
      width: 480, minHeight: 280,
      background: "#fffaf2",
      borderRadius: 10,
      boxShadow: "0 16px 32px rgba(120,80,90,0.28), inset 0 0 0 1px rgba(255,255,255,0.7)",
      border: "1px solid rgba(220,170,150,0.4)",
      ...paperTexture,
      transform: "rotate(-0.8deg)",
      display: "flex",
    }}>
      <WashiTape left={-12} top={-8} width={90} rotate={-25} color="#ffc1ce"/>
      <WashiTape right={-10} bottom={10} width={70} rotate={20} color="#cfe6f5"/>

      {/* 左邊郵票區 */}
      <div style={{
        width: 150,
        background: "linear-gradient(160deg, #ffd6dc, #ffb8c8)",
        borderRadius: "10px 0 0 10px",
        padding: 14,
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        {/* 郵票邊鋸齒 */}
        <div style={{
          position: "absolute", right: -1, top: 0, bottom: 0,
          width: 4,
          backgroundImage: "radial-gradient(circle, #fffaf2 1.5px, transparent 2px)",
          backgroundSize: "6px 8px",
          backgroundRepeat: "repeat-y",
        }}/>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.65)",
          border: "2px dashed rgba(255,255,255,0.9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 8px rgba(180,80,100,0.2)",
        }}>
          <Paw size={40} color="#df6374"/>
        </div>
        <div style={{
          marginTop: 10,
          padding: "3px 10px",
          background: "rgba(255,255,255,0.85)",
          borderRadius: 999,
          fontSize: 10, fontWeight: 900, color: "#9a3a52",
          transform: "rotate(-3deg)",
          border: "1px solid rgba(180,80,100,0.3)",
        }}>新公司開張</div>
      </div>

      {/* 右邊內容 */}
      <div style={{ flex: 1, padding: "22px 24px 20px" }}>
        <h2 style={{
          margin: 0, fontSize: 22, fontWeight: 900,
          color: "#7a3a52",
        }}>為公司命名</h2>
        <p style={{
          margin: "4px 0 14px",
          fontSize: 11, color: "#a37a82", fontWeight: 600,
        }}>取了就不能改囉，慎選 ✨</p>

        <label style={{
          display: "block",
          fontSize: 11, fontWeight: 900,
          color: "#7a3a52", marginBottom: 6,
        }}>
          <span style={{ color: "#df6374" }}>•</span> 公司名稱（2–8 字）
        </label>
        <div style={{
          background: "#fff",
          border: "1.5px solid rgba(220,150,165,0.5)",
          borderRadius: 10,
          padding: "10px 14px",
          boxShadow: "inset 0 2px 4px rgba(150,90,80,0.08)",
          marginBottom: 14,
        }}>
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="例如：汪汪科技"
            style={{
              width: "100%", border: 0, background: "transparent", outline: "none",
              fontSize: 14, color: "#5b382d", fontWeight: 700,
            }}
          />
        </div>

        <button style={{
          width: "100%",
          padding: "11px 16px",
          background: "linear-gradient(180deg, #ff8aa6, #ef6f8f)",
          color: "#fff",
          border: "1.5px solid rgba(180,60,90,0.4)",
          borderRadius: 12,
          fontSize: 14, fontWeight: 900,
          letterSpacing: 1,
          cursor: "pointer",
          boxShadow: "0 6px 12px rgba(239,111,143,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}>
          確定，開始經營！
        </button>
      </div>
    </div>
  );
}

window.V1Stacked = V1Stacked;
window.V2Polaroid = V2Polaroid;
window.V3Postcard = V3Postcard;
window.DialogFrame = Frame;
