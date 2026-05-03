/* global React */

const paperTexture = {
  backgroundImage:
    "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)," +
    " radial-gradient(circle at 6px 6px, rgba(0,0,0,0.022) 1px, transparent 1.6px)",
  backgroundSize: "auto, 12px 12px",
};

// 紙膠帶
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

// 後紙
function BackPaper({ color, rotate, offsetX = 0, offsetY = 0, opacity = 1 }) {
  return (
    <div style={{
      position: "absolute",
      inset: -12,
      background: color,
      borderRadius: 14,
      transform: `rotate(${rotate}deg) translate(${offsetX}px, ${offsetY}px)`,
      boxShadow: "0 8px 22px rgba(180,120,140,0.18)",
      opacity,
      ...paperTexture,
    }}/>
  );
}

function CloseBtn({ onClick }) {
  return (
    <button onClick={onClick} aria-label="close" style={{
      position: "absolute", top: -14, right: -14, width: 38, height: 38,
      borderRadius: "50%", border: 0, cursor: "pointer",
      background: "linear-gradient(180deg, #fff5f7, #ffd9e2)",
      boxShadow: "0 4px 10px rgba(180,80,100,0.25), inset 0 0 0 2px #fff",
      color: "#df6374", fontWeight: 900, fontSize: 18,
      fontFamily: "inherit",
      transform: "rotate(8deg)",
    }}>×</button>
  );
}

// =====================================================
// V1 · 拍立得日記（最像實體相片簿）
// =====================================================
function PolaroidDiary() {
  const day = 13;
  const income = 492;
  const expense = 44;
  const net = income - expense;
  const completed = 1;

  return (
    <div style={{
      position: "relative", width: 480,
      filter: "drop-shadow(0 24px 36px rgba(120,60,80,0.22))",
    }}>
      {/* 後紙堆疊 */}
      <BackPaper color="#ffe3eb" rotate={-2.4} offsetX={-6}/>
      <BackPaper color="#fff0d5" rotate={1.6} offsetX={6} offsetY={4}/>

      {/* 主拍立得 */}
      <div style={{
        position: "relative",
        background: "#fffaf2",
        padding: "18px 18px 24px",
        boxShadow: "0 10px 28px rgba(150,90,80,0.18), inset 0 0 0 1px rgba(180,120,90,0.18)",
        ...paperTexture,
      }}>
        {/* 紙膠帶 */}
        <Tape color="#ffc1ce" angle={-6} w={140} h={26} style={{ top: -14, left: 30 }}/>
        <Tape color="#cfe6f5" angle={5} w={110} h={22} style={{ top: -10, right: 50 }}/>

        <CloseBtn/>

        {/* 「相片區」 — 用漸層 + 大數字呈現今日重點 */}
        <div style={{
          position: "relative",
          aspectRatio: "4/3",
          marginTop: 6,
          background:
            "linear-gradient(160deg, #ffe2c2 0%, #ffc1ce 55%, #efa6c0 100%)",
          overflow: "hidden",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4), inset 0 -40px 60px rgba(180,80,100,0.15)",
        }}>
          {/* 散落小元素 */}
          <div style={{ position: "absolute", top: 14, left: 16, fontSize: 22, transform: "rotate(-12deg)", opacity: 0.7 }}>🐾</div>
          <div style={{ position: "absolute", top: 22, right: 24, fontSize: 18, transform: "rotate(15deg)", opacity: 0.6 }}>✨</div>
          <div style={{ position: "absolute", bottom: 14, right: 18, fontSize: 24, transform: "rotate(-8deg)", opacity: 0.65 }}>🐶</div>

          {/* 主數字 */}
          <div style={{
            position: "absolute", left: 0, right: 0, top: "50%",
            transform: "translateY(-50%)", textAlign: "center",
            color: "#fff", fontWeight: 900,
            textShadow: "0 4px 8px rgba(150,60,80,0.35)",
          }}>
            <div style={{ fontSize: 11, letterSpacing: 4, opacity: 0.92, fontWeight: 700 }}>TODAY</div>
            <div style={{
              fontSize: 64, lineHeight: 1, marginTop: 4,
              fontFamily: '"Caveat", "Noto Sans TC", system-ui',
            }}>+${net}</div>
            <div style={{ fontSize: 13, marginTop: 8, opacity: 0.95, fontWeight: 700, letterSpacing: 1 }}>
              ♡ 第 {day} 天 ♡
            </div>
          </div>

          {/* 角落日期戳 */}
          <div style={{
            position: "absolute", left: 12, bottom: 10,
            fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.85)",
            letterSpacing: 2, transform: "rotate(-3deg)",
            border: "1.5px dashed rgba(255,255,255,0.6)",
            padding: "3px 6px",
          }}>DAY · {String(day).padStart(2,"0")}</div>
        </div>

        {/* 拍立得下方手寫感註記 */}
        <div style={{
          marginTop: 14,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          {/* 左：手寫標題 */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 22, fontWeight: 900, color: "#7a3a52",
              fontFamily: '"Caveat", "Noto Sans TC", system-ui',
              lineHeight: 1.1,
            }}>
              今天也辛苦了 ♡
            </div>
            <div style={{
              fontSize: 11, color: "#a37a82", marginTop: 4, letterSpacing: 2, fontWeight: 700,
            }}>
              DAY {day} · DIARY
            </div>
          </div>

          {/* 右：完成貼紙 */}
          <div style={{
            position: "relative",
            background: "linear-gradient(180deg, #ffd86b, #ffb838)",
            color: "#7a3a1a",
            padding: "6px 10px 8px",
            borderRadius: 4,
            transform: "rotate(6deg)",
            boxShadow: "0 4px 8px rgba(180,120,40,0.3)",
            textAlign: "center",
            minWidth: 56,
          }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1 }}>DONE</div>
            <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{completed}</div>
            <div style={{ fontSize: 8, fontWeight: 700, marginTop: 2 }}>任務</div>
          </div>
        </div>

        {/* 收支兩格 */}
        <div style={{
          marginTop: 14,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
        }}>
          <div style={{
            background: "#fff",
            border: "1.5px dashed #b8d8a0",
            padding: "10px 12px",
            position: "relative",
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#7aa05f", letterSpacing: 1 }}>收入</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#5a7a3f", marginTop: 2 }}>
              +${income}
            </div>
          </div>
          <div style={{
            background: "#fff",
            border: "1.5px dashed #f0c8d4",
            padding: "10px 12px",
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#c08294", letterSpacing: 1 }}>支出</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#a85a72", marginTop: 2 }}>
              −${expense}
            </div>
          </div>
        </div>

        {/* 簽名/底部 */}
        <div style={{
          marginTop: 14, paddingTop: 10,
          borderTop: "1px dashed rgba(180,120,90,0.3)",
          display: "flex", justifyContent: "space-between",
          fontSize: 10, fontWeight: 700, color: "#a37a82", letterSpacing: 1,
        }}>
          <span>{new Date().toLocaleDateString("zh-TW")}</span>
          <span style={{ fontFamily: '"Caveat", "Noto Sans TC", system-ui', fontSize: 14, color: "#df6374" }}>
            — 老闆
          </span>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// V2 · 日記頁（純紙感、收銀條 receipt 感、章戳）
// =====================================================
function ReceiptDiary() {
  const day = 13;
  const income = 492;
  const expense = 44;
  const net = income - expense;
  const completed = 1;

  return (
    <div style={{
      position: "relative", width: 480,
      filter: "drop-shadow(0 24px 36px rgba(120,60,80,0.22))",
    }}>
      {/* 後紙 */}
      <BackPaper color="#ffe3eb" rotate={-1.8} offsetX={-4}/>

      {/* 主紙 */}
      <div style={{
        position: "relative",
        background: "#fffaf2",
        padding: "26px 26px 24px",
        boxShadow: "0 10px 28px rgba(150,90,80,0.2)",
        ...paperTexture,
      }}>
        {/* 紙膠帶 */}
        <Tape color="#ffd9a6" angle={-4} w={120} h={24} style={{ top: -12, left: "50%", marginLeft: -60 }}/>

        <CloseBtn/>

        {/* Header eyebrow + title */}
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{
            fontSize: 10, fontWeight: 900, color: "#df6374",
            letterSpacing: 4,
          }}>DAILY · DIARY</div>
          <div style={{
            fontSize: 30, fontWeight: 900, color: "#7a3a52",
            fontFamily: '"Caveat", "Noto Sans TC", system-ui',
            lineHeight: 1.1, marginTop: 4,
          }}>第 {day} 天 · 結算</div>
          <div style={{
            display: "inline-block",
            marginTop: 6,
            padding: "2px 10px",
            background: "#ffe3eb",
            borderRadius: 999,
            fontSize: 10, fontWeight: 800, color: "#a85a72", letterSpacing: 1,
          }}>
            {new Date().toLocaleDateString("zh-TW")}
          </div>
        </div>

        {/* 紅色印章 — 「今日達標」 */}
        <div style={{
          position: "absolute", top: 64, right: 36,
          width: 80, height: 80, borderRadius: "50%",
          border: "3px solid #df6374",
          color: "#df6374",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          transform: "rotate(-12deg)",
          opacity: 0.78,
          fontFamily: '"Caveat", "Noto Sans TC", system-ui',
          background: "transparent",
        }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 2 }}>APPROVED</div>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, marginTop: 2 }}>達標</div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, marginTop: 2 }}>★ DAY {day} ★</div>
        </div>

        {/* 主數字（收據樣式） */}
        <div style={{
          padding: "14px 0",
          borderTop: "2px dashed rgba(180,120,90,0.3)",
          borderBottom: "2px dashed rgba(180,120,90,0.3)",
          margin: "0 0 14px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#a37a82", letterSpacing: 3 }}>
            現金變化
          </div>
          <div style={{
            fontSize: 56, fontWeight: 900, color: "#df6374",
            fontFamily: '"Caveat", "Noto Sans TC", system-ui',
            lineHeight: 1.05, marginTop: 2,
          }}>
            +${net}
          </div>
        </div>

        {/* 明細列表 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#5b382d", fontWeight: 600 }}>
          <Row label="🐶 收入" value={`+$${income}`} valueColor="#5a7a3f"/>
          <Row label="🦴 支出" value={`−$${expense}`} valueColor="#a85a72"/>
          <Row label="✅ 完成任務" value={`${completed} 件`} valueColor="#7a3a52"/>
        </div>

        {/* 底部手寫小字 */}
        <div style={{
          marginTop: 18, paddingTop: 12,
          borderTop: "1px dashed rgba(180,120,90,0.3)",
          fontSize: 14, fontWeight: 700, color: "#a37a82",
          fontFamily: '"Caveat", "Noto Sans TC", system-ui',
          textAlign: "center",
        }}>
          “明天也要繼續加油呢 ♡”
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueColor }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "6px 4px",
      borderBottom: "1px dotted rgba(180,120,90,0.2)",
    }}>
      <span>{label}</span>
      <span style={{ fontWeight: 900, fontSize: 16, color: valueColor }}>{value}</span>
    </div>
  );
}

window.PolaroidDiary = PolaroidDiary;
window.ReceiptDiary = ReceiptDiary;

// =====================================================
// V3 · 小尺寸 · 紙膠帶便條（沿用拍立得系統，但小一倍）
// =====================================================
function CompactNote({ profit = true } = {}) {
  const day = 13;
  const income = profit ? 492 : 188;
  const expense = profit ? 44 : 356;
  const net = income - expense;
  const completed = profit ? 1 : 0;

  // 章戳兩種狀態
  const stamp = profit
    ? {
        color: "#df6374",
        eyebrow: "★ DAY ★",
        big: day,
        sub: "達標",
        rotate: -8,
      }
    : {
        color: "#5b7a8c",
        eyebrow: "DAY",
        big: day,
        sub: "赤字",
        rotate: 6,
      };

  return (
    <div style={{
      position: "relative", width: 320,
      filter: "drop-shadow(0 12px 24px rgba(120,60,80,0.2))",
    }}>
      {/* 後紙 */}
      <BackPaper color={profit ? "#ffe3eb" : "#dde7ee"} rotate={-2} offsetX={-3}/>

      {/* 主便條 */}
      <div style={{
        position: "relative",
        background: "#fffaf2",
        padding: "14px 14px 14px",
        boxShadow: "0 6px 18px rgba(150,90,80,0.18)",
        ...paperTexture,
      }}>
        {/* 紙膠帶 */}
        <Tape
          color={profit ? "#ffc1ce" : "#cfe6f5"}
          angle={-6} w={90} h={18}
          style={{ top: -10, left: 14 }}/>

        {/* 圓 X */}
        <button aria-label="close" style={{
          position: "absolute", top: -10, right: -10, width: 28, height: 28,
          borderRadius: "50%", border: 0, cursor: "pointer",
          background: "linear-gradient(180deg, #fff5f7, #ffd9e2)",
          boxShadow: "0 3px 6px rgba(180,80,100,0.22), inset 0 0 0 1.5px #fff",
          color: "#df6374", fontWeight: 900, fontSize: 14,
          fontFamily: "inherit",
          transform: "rotate(8deg)",
        }}>×</button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
          <span style={{
            fontSize: 9, fontWeight: 900, color: stamp.color, letterSpacing: 2,
          }}>DAY</span>
          <span style={{
            fontSize: 22, fontWeight: 900, color: "#7a3a52",
            fontFamily: '"Caveat", "Noto Sans TC", system-ui',
            lineHeight: 1,
          }}>第 {day} 天結算</span>
        </div>

        {/* 主數字 + 章戳 */}
        <div style={{
          marginTop: 8,
          padding: "10px 12px",
          background: profit
            ? "linear-gradient(180deg, #fff5f0, #ffe8dd)"
            : "linear-gradient(180deg, #f3f6f9, #e3eaf0)",
          borderRadius: 4,
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#a37a82", letterSpacing: 2 }}>
              現金變化
            </div>
            <div style={{
              fontSize: 28, fontWeight: 900,
              color: profit ? "#df6374" : "#5b7a8c",
              fontFamily: '"Caveat", "Noto Sans TC", system-ui',
              lineHeight: 1, marginTop: 2,
            }}>{net >= 0 ? `+$${net}` : `−$${Math.abs(net)}`}</div>
          </div>
          {/* 章戳 */}
          <Stamp {...stamp}/>
        </div>

        {/* 明細 */}
        <div style={{
          marginTop: 10,
          display: "flex", flexDirection: "column", gap: 4,
          fontSize: 11, color: "#5b382d", fontWeight: 700,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dotted rgba(180,120,90,0.2)", paddingBottom: 3 }}>
            <span>🐶 收入 / 🦴 支出</span>
            <span><span style={{ color: "#5a7a3f" }}>+${income}</span> · <span style={{ color: "#a85a72" }}>−${expense}</span></span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>✅ 完成任務</span>
            <span style={{ fontWeight: 900 }}>{completed} 件</span>
          </div>
        </div>

        {/* 手寫小簽 */}
        <div style={{
          marginTop: 8,
          fontSize: 13,
          color: profit ? "#df6374" : "#5b7a8c",
          fontFamily: '"Caveat", "Noto Sans TC", system-ui',
          textAlign: "right", fontWeight: 700,
        }}>
          {profit ? "— 今天也辛苦了 ♡" : "— 明天再加油吧…"}
        </div>
      </div>
    </div>
  );
}

// 章戳組件（複用）
function Stamp({ color, eyebrow, big, sub, rotate = -8 }) {
  return (
    <div style={{
      width: 56, height: 56, borderRadius: "50%",
      border: `2.5px solid ${color}`,
      color,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      transform: `rotate(${rotate}deg)`,
      opacity: 0.78,
      fontFamily: '"Caveat", "Noto Sans TC", system-ui',
      // 蓋章感：邊緣不規則、紙紋透出
      boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.4)`,
      backgroundImage:
        "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0 1px, transparent 2px)," +
        " radial-gradient(circle at 70% 60%, rgba(255,255,255,0.3) 0 1px, transparent 2px)",
      backgroundSize: "8px 8px, 12px 12px",
    }}>
      <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: 1 }}>{eyebrow}</div>
      <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{big}</div>
      <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: 1 }}>{sub}</div>
    </div>
  );
}

// =====================================================
// V4 · 小尺寸 · 拍立得橫式（左相片右明細）
// =====================================================
function CompactPolaroid() {
  const day = 13;
  const income = 492;
  const expense = 44;
  const net = income - expense;
  const completed = 1;

  return (
    <div style={{
      position: "relative", width: 340,
      filter: "drop-shadow(0 12px 24px rgba(120,60,80,0.2))",
    }}>
      {/* 後紙 */}
      <BackPaper color="#fff0d5" rotate={1.6} offsetX={4} offsetY={3}/>

      {/* 主拍立得 */}
      <div style={{
        position: "relative",
        background: "#fffaf2",
        padding: "10px 10px 12px",
        boxShadow: "0 6px 18px rgba(150,90,80,0.18)",
        display: "flex", gap: 10,
        ...paperTexture,
      }}>
        {/* 紙膠帶 */}
        <Tape color="#cfe6f5" angle={-6} w={70} h={16} style={{ top: -8, left: 16 }}/>
        <Tape color="#ffc1ce" angle={6} w={50} h={14} style={{ top: -6, right: 30 }}/>

        {/* X */}
        <button aria-label="close" style={{
          position: "absolute", top: -10, right: -10, width: 26, height: 26,
          borderRadius: "50%", border: 0, cursor: "pointer",
          background: "linear-gradient(180deg, #fff5f7, #ffd9e2)",
          boxShadow: "0 3px 6px rgba(180,80,100,0.22), inset 0 0 0 1.5px #fff",
          color: "#df6374", fontWeight: 900, fontSize: 13,
          fontFamily: "inherit",
          transform: "rotate(8deg)",
        }}>×</button>

        {/* 左：相片區 */}
        <div style={{
          width: 110, flexShrink: 0,
          aspectRatio: "1",
          background:
            "linear-gradient(160deg, #ffe2c2 0%, #ffc1ce 55%, #efa6c0 100%)",
          position: "relative",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          color: "#fff",
          textShadow: "0 2px 4px rgba(150,60,80,0.3)",
        }}>
          <div style={{ position: "absolute", top: 6, left: 8, fontSize: 14, opacity: 0.8 }}>🐾</div>
          <div style={{ position: "absolute", bottom: 6, right: 6, fontSize: 16, opacity: 0.8 }}>🐶</div>
          <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 2, opacity: 0.9 }}>TODAY</div>
          <div style={{
            fontSize: 30, fontWeight: 900, lineHeight: 1, marginTop: 2,
            fontFamily: '"Caveat", "Noto Sans TC", system-ui',
          }}>+${net}</div>
          <div style={{
            marginTop: 6, fontSize: 8, fontWeight: 800, letterSpacing: 2,
            border: "1px dashed rgba(255,255,255,0.7)",
            padding: "1px 5px",
          }}>DAY {String(day).padStart(2,"0")}</div>
        </div>

        {/* 右：明細 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 2 }}>
          <div style={{
            fontSize: 9, fontWeight: 900, color: "#df6374",
            letterSpacing: 2,
          }}>DAILY DIARY</div>
          <div style={{
            fontSize: 18, fontWeight: 900, color: "#7a3a52",
            fontFamily: '"Caveat", "Noto Sans TC", system-ui',
            lineHeight: 1.1,
          }}>第 {day} 天 · 結算</div>

          <div style={{
            marginTop: 8,
            display: "flex", flexDirection: "column", gap: 3,
            fontSize: 10, fontWeight: 700, color: "#5b382d",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>收入</span>
              <span style={{ color: "#5a7a3f", fontWeight: 900 }}>+${income}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>支出</span>
              <span style={{ color: "#a85a72", fontWeight: 900 }}>−${expense}</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              borderTop: "1px dashed rgba(180,120,90,0.3)",
              paddingTop: 3, marginTop: 1,
            }}>
              <span>完成</span>
              <span style={{ fontWeight: 900 }}>{completed} 件</span>
            </div>
          </div>

          {/* 完成貼紙 */}
          <div style={{
            alignSelf: "flex-end",
            marginTop: "auto",
            background: "linear-gradient(180deg, #ffd86b, #ffb838)",
            color: "#7a3a1a",
            padding: "3px 8px",
            transform: "rotate(4deg)",
            boxShadow: "0 2px 5px rgba(180,120,40,0.3)",
            fontSize: 8, fontWeight: 900, letterSpacing: 1,
          }}>★ DONE ★</div>
        </div>
      </div>
    </div>
  );
}

window.CompactNote = CompactNote;
window.CompactPolaroid = CompactPolaroid;
