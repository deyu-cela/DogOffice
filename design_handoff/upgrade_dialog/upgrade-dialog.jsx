/* global React */

const paperTexture = {
  backgroundImage:
    "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)," +
    " radial-gradient(circle at 6px 6px, rgba(0,0,0,0.022) 1px, transparent 1.6px)",
  backgroundSize: "auto, 12px 12px",
};

function Tape({ color = "#ffc1ce", angle = -8, w = 90, h = 22, style = {} }) {
  return (
    <div style={{
      position: "absolute",
      width: w, height: h,
      background: color,
      transform: `rotate(${angle}deg)`,
      backgroundImage:
        "repeating-linear-gradient(135deg, transparent 0 8px, rgba(255,255,255,0.4) 8px 10px)",
      boxShadow: "0 2px 4px rgba(184,108,140,0.18)",
      ...style,
    }}/>
  );
}

function BackPaper({ color, rotate, offsetX = 0, offsetY = 0 }) {
  return (
    <div style={{
      position: "absolute", inset: -12,
      background: color, borderRadius: 14,
      transform: `rotate(${rotate}deg) translate(${offsetX}px, ${offsetY}px)`,
      boxShadow: "0 8px 22px rgba(180,120,140,0.18)",
      ...paperTexture,
    }}/>
  );
}

function CloseBtn() {
  return (
    <button aria-label="close" style={{
      position: "absolute", top: -14, right: -14, width: 36, height: 36,
      borderRadius: "50%", border: 0, cursor: "pointer",
      background: "linear-gradient(180deg, #fff5f7, #ffd9e2)",
      boxShadow: "0 4px 10px rgba(180,80,100,0.25), inset 0 0 0 2px #fff",
      color: "#df6374", fontWeight: 900, fontSize: 18,
      fontFamily: "inherit",
      transform: "rotate(8deg)",
    }}>×</button>
  );
}

// Lv 階梯（5 顆狗腳印 / 星星）
function LevelStairs({ current, max = 5 }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6,
    }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < current;
        const next = i === current;
        return (
          <div key={i} style={{
            width: 22 + (filled || next ? 4 : 0),
            height: 22 + i * 4,
            borderRadius: 6,
            background: filled
              ? "linear-gradient(180deg, #ffd86b, #ffb838)"
              : next
                ? "linear-gradient(180deg, #fff, #fff)"
                : "#fff",
            border: filled
              ? "2px solid #c87a1a"
              : next
                ? "2px dashed #df6374"
                : "1.5px solid #f0c8d4",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900,
            color: filled ? "#7a3a1a" : next ? "#df6374" : "#ddc0cc",
            boxShadow: filled ? "0 2px 0 #c87a1a" : "0 2px 0 rgba(0,0,0,0.04)",
          }}>
            {filled ? "★" : next ? "★" : i + 1}
          </div>
        );
      })}
    </div>
  );
}

// ===========================================================
// V1 · 道具卡片（拍立得縮圖 + Lv 徽章 + 金色升級按鈕）
// ===========================================================
function UpgradeItemCard() {
  return (
    <div style={{
      position: "relative", width: 460,
      filter: "drop-shadow(0 24px 36px rgba(120,60,80,0.22))",
    }}>
      <BackPaper color="#ffe3eb" rotate={-2.4} offsetX={-6}/>
      <BackPaper color="#fff0d5" rotate={1.6} offsetX={6} offsetY={4}/>

      <div style={{
        position: "relative",
        background: "#fffaf2",
        padding: "20px 22px 22px",
        boxShadow: "0 10px 28px rgba(150,90,80,0.18), inset 0 0 0 1px rgba(180,120,90,0.18)",
        ...paperTexture,
      }}>
        <Tape color="#ffc1ce" angle={-5} w={120} h={22} style={{ top: -10, left: 30 }}/>
        <Tape color="#cfe6f5" angle={4} w={90} h={18} style={{ top: -8, right: 80 }}/>
        <CloseBtn/>

        {/* Header: 道具拍立得 + 標題 */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          {/* 拍立得縮圖 */}
          <div style={{
            position: "relative",
            width: 100, flexShrink: 0,
            background: "#fffaf2",
            padding: "6px 6px 16px",
            border: "1px solid rgba(180,120,90,0.2)",
            boxShadow: "0 4px 8px rgba(150,90,80,0.15)",
            transform: "rotate(-3deg)",
            ...paperTexture,
          }}>
            <div style={{
              width: "100%", aspectRatio: "1",
              background: "linear-gradient(160deg, #ffe2c2 0%, #ffc1ce 60%, #efa6c0 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 44,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4), inset 0 -10px 20px rgba(180,80,100,0.15)",
            }}>🪑</div>
            <div style={{
              position: "absolute", bottom: 2, left: 0, right: 0, textAlign: "center",
              fontSize: 8, fontWeight: 800, color: "#7a3a52", letterSpacing: 1,
            }}>OFFICE DESK</div>
          </div>

          {/* 標題 + Lv 徽章 */}
          <div style={{ flex: 1, paddingTop: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: "#df6374", letterSpacing: 3 }}>
              UPGRADE · 升級
            </div>
            <div style={{
              fontSize: 24, fontWeight: 900, color: "#7a3a52",
              fontFamily: '"Caveat", "Noto Sans TC", system-ui',
              lineHeight: 1.1, marginTop: 2,
            }}>升級辦公桌</div>

            {/* Lv pill */}
            <div style={{
              marginTop: 8,
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px",
              background: "linear-gradient(180deg, #ffd86b, #ffb838)",
              borderRadius: 999,
              boxShadow: "0 2px 0 #c87a1a, inset 0 0 0 1.5px rgba(255,255,255,0.5)",
              fontSize: 11, fontWeight: 900, color: "#7a3a1a", letterSpacing: 1,
            }}>
              <span style={{ fontSize: 12 }}>★</span>
              等級 1 → 2
            </div>
          </div>
        </div>

        {/* 階梯 */}
        <div style={{ marginTop: 16 }}>
          <LevelStairs current={1} max={5}/>
          <div style={{
            marginTop: 6, textAlign: "center",
            fontSize: 10, fontWeight: 800, color: "#a37a82", letterSpacing: 2,
          }}>LV 1 / 5</div>
        </div>

        {/* 效果對比 */}
        <div style={{
          marginTop: 14,
          display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center",
        }}>
          {/* 目前 */}
          <div style={{
            padding: "10px 12px",
            background: "#fff",
            border: "1.5px dashed rgba(180,120,90,0.3)",
            position: "relative",
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#a37a82", letterSpacing: 2 }}>目前 LV 1</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#7a3a52", marginTop: 4, lineHeight: 1.4 }}>
              全 team 案件速度 <span style={{ color: "#5a7a3f" }}>+1</span>
            </div>
          </div>
          {/* 箭頭 */}
          <div style={{
            fontSize: 22, color: "#df6374", fontWeight: 900,
            transform: "rotate(8deg)",
          }}>→</div>
          {/* 升級後 */}
          <div style={{
            padding: "10px 12px",
            background: "linear-gradient(180deg, #fffbe8, #fff3c8)",
            border: "1.5px solid #ffd86b",
            position: "relative",
            boxShadow: "0 3px 8px rgba(255,184,56,0.25)",
          }}>
            <div style={{
              position: "absolute", top: -8, right: 6,
              padding: "1px 6px",
              background: "linear-gradient(180deg, #ffd86b, #ffb838)",
              fontSize: 8, fontWeight: 900, color: "#7a3a1a", letterSpacing: 1,
              borderRadius: 3,
              boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }}>NEW</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#c87a1a", letterSpacing: 2 }}>升級後 LV 2</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#7a3a52", marginTop: 4, lineHeight: 1.4 }}>
              全 team 案件速度 <span style={{ color: "#5a7a3f" }}>+2</span>
            </div>
          </div>
        </div>

        {/* 升級花費 */}
        <div style={{
          marginTop: 14,
          padding: "10px 14px",
          background: "linear-gradient(180deg, #fff5f0, #ffe8dd)",
          border: "1px dashed rgba(180,120,90,0.3)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#a37a82", letterSpacing: 2 }}>
            升級花費
          </span>
          <span style={{
            fontSize: 22, fontWeight: 900, color: "#df6374",
            fontFamily: '"Caveat", "Noto Sans TC", system-ui',
            lineHeight: 1,
          }}>$120</span>
        </div>

        {/* 雙按鈕 */}
        <div style={{
          marginTop: 14,
          display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10,
        }}>
          <button style={{
            padding: "12px 16px",
            border: 0, cursor: "pointer",
            background: "linear-gradient(180deg, #ffd86b, #ffb838)",
            color: "#7a3a1a",
            fontWeight: 900, fontSize: 16,
            fontFamily: "inherit",
            borderRadius: 12,
            boxShadow: "0 5px 0 #c87a1a, 0 8px 16px rgba(255,184,56,0.32)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <span style={{ fontSize: 16 }}>★</span>
            升級
          </button>
          <button style={{
            padding: "12px 16px",
            border: 0, cursor: "pointer",
            background: "#fff",
            color: "#7a5a68",
            fontWeight: 800, fontSize: 14,
            fontFamily: "inherit",
            borderRadius: 12,
            boxShadow: "inset 0 0 0 2px #f0c8d4, 0 3px 0 #f0c8d4",
          }}>關閉</button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================
// V2 · 拍立得縮圖直式（圖在上、Lv 點點、效果合併）
// ===========================================================
function UpgradePolaroid() {
  return (
    <div style={{
      position: "relative", width: 360,
      filter: "drop-shadow(0 24px 36px rgba(120,60,80,0.22))",
    }}>
      <BackPaper color="#ffe3eb" rotate={-2} offsetX={-4}/>

      <div style={{
        position: "relative",
        background: "#fffaf2",
        padding: "16px 16px 18px",
        boxShadow: "0 10px 28px rgba(150,90,80,0.18)",
        ...paperTexture,
      }}>
        <Tape color="#ffc1ce" angle={-4} w={120} h={22} style={{ top: -10, left: "50%", marginLeft: -60 }}/>
        <CloseBtn/>

        {/* 大拍立得 */}
        <div style={{
          width: "100%", aspectRatio: "16/9",
          background: "linear-gradient(160deg, #ffe2c2 0%, #ffc1ce 50%, #efa6c0 100%)",
          position: "relative",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4), inset 0 -20px 40px rgba(180,80,100,0.15)",
        }}>
          {/* item icon */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 64,
            filter: "drop-shadow(0 4px 8px rgba(150,60,80,0.25))",
          }}>🪑</div>

          {/* 散落小裝飾 */}
          <div style={{ position: "absolute", top: 10, left: 14, fontSize: 18, opacity: 0.7, transform: "rotate(-12deg)" }}>✨</div>
          <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: 16, opacity: 0.65, transform: "rotate(15deg)" }}>🐾</div>

          {/* 等級 pill */}
          <div style={{
            position: "absolute", top: 10, right: 10,
            padding: "3px 10px",
            background: "rgba(255,255,255,0.95)",
            borderRadius: 999,
            fontSize: 10, fontWeight: 900, color: "#df6374", letterSpacing: 1,
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
          }}>等級 1 / 5</div>

          {/* 角落英文 */}
          <div style={{
            position: "absolute", bottom: 10, left: 14,
            fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.9)", letterSpacing: 3,
            textShadow: "0 2px 4px rgba(150,60,80,0.3)",
          }}>OFFICE · DESK</div>
        </div>

        {/* 標題 */}
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: "#df6374", letterSpacing: 3 }}>UPGRADE · 升級</div>
          <div style={{
            fontSize: 24, fontWeight: 900, color: "#7a3a52",
            fontFamily: '"Caveat", "Noto Sans TC", system-ui',
            lineHeight: 1.1, marginTop: 2,
          }}>升級辦公桌</div>
        </div>

        {/* Lv 點點進度 */}
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {[0, 1, 2, 3, 4].map(i => {
            const filled = i < 1;
            const next = i === 1;
            return (
              <React.Fragment key={i}>
                <div style={{
                  width: next ? 22 : 14, height: next ? 22 : 14,
                  borderRadius: "50%",
                  background: filled
                    ? "linear-gradient(180deg, #ffd86b, #ffb838)"
                    : next
                      ? "rgba(255,255,255,0.95)"
                      : "#fff",
                  border: filled
                    ? "2px solid #c87a1a"
                    : next
                      ? "2.5px dashed #df6374"
                      : "1.5px solid #f0c8d4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: next ? 12 : 9, fontWeight: 900,
                  color: filled ? "#7a3a1a" : next ? "#df6374" : "#ddc0cc",
                  boxShadow: next ? "0 0 0 4px rgba(239,99,116,0.15)" : "none",
                }}>
                  {filled ? "★" : next ? "?" : i + 1}
                </div>
                {i < 4 && (
                  <div style={{ flex: 1, height: 2, maxWidth: 16, background: filled ? "#ffd86b" : "#f0c8d4" }}/>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 效果條 */}
        <div style={{
          marginTop: 14,
          padding: "10px 14px",
          background: "linear-gradient(180deg, #fffbe8, #fff3c8)",
          border: "1.5px solid #ffd86b",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 3px 8px rgba(255,184,56,0.18)",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(180deg, #ffd86b, #ffb838)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: "#7a3a1a", fontWeight: 900,
            boxShadow: "0 2px 0 #c87a1a",
          }}>★</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#c87a1a", letterSpacing: 2 }}>升級後 LV 2</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#7a3a52", marginTop: 1 }}>
              全 team 案件速度 <span style={{ color: "#5a7a3f" }}>+2</span>
              <span style={{ color: "#a37a82", fontWeight: 600, fontSize: 10, marginLeft: 4 }}>(目前 +1)</span>
            </div>
          </div>
        </div>

        {/* 花費 */}
        <div style={{
          marginTop: 12,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 8, borderTop: "1px dashed rgba(180,120,90,0.3)",
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#a37a82", letterSpacing: 2 }}>升級花費</span>
          <span style={{
            fontSize: 24, fontWeight: 900, color: "#df6374",
            fontFamily: '"Caveat", "Noto Sans TC", system-ui',
            lineHeight: 1,
          }}>$120</span>
        </div>

        {/* 雙按鈕 */}
        <div style={{
          marginTop: 12,
          display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10,
        }}>
          <button style={{
            padding: "11px 16px",
            border: 0, cursor: "pointer",
            background: "linear-gradient(180deg, #ffd86b, #ffb838)",
            color: "#7a3a1a",
            fontWeight: 900, fontSize: 15,
            fontFamily: "inherit",
            borderRadius: 12,
            boxShadow: "0 5px 0 #c87a1a, 0 8px 16px rgba(255,184,56,0.32)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>★</span>
            升級
          </button>
          <button style={{
            padding: "11px 16px",
            border: 0, cursor: "pointer",
            background: "#fff",
            color: "#7a5a68",
            fontWeight: 800, fontSize: 14,
            fontFamily: "inherit",
            borderRadius: 12,
            boxShadow: "inset 0 0 0 2px #f0c8d4, 0 3px 0 #f0c8d4",
          }}>關閉</button>
        </div>
      </div>
    </div>
  );
}

window.UpgradeItemCard = UpgradeItemCard;
window.UpgradePolaroid = UpgradePolaroid;
