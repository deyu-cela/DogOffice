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

// ===========================================================
// V1 · 借據合約風（紙質契約 + 紅色官印 + 大手寫金額）
// ===========================================================
function LoanContract() {
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
        padding: "22px 26px 22px",
        boxShadow: "0 10px 28px rgba(150,90,80,0.18), inset 0 0 0 1px rgba(180,120,90,0.18)",
        ...paperTexture,
      }}>
        <Tape color="#ffd9a6" angle={-4} w={140} h={24} style={{ top: -12, left: "50%", marginLeft: -70 }}/>
        <CloseBtn/>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: "#df6374", letterSpacing: 4 }}>
            DOGGO BANK · LOAN
          </div>
          <div style={{
            fontSize: 28, fontWeight: 900, color: "#7a3a52",
            fontFamily: '"Caveat", "Noto Sans TC", system-ui',
            lineHeight: 1.1, marginTop: 4,
          }}>銀行救急貸款</div>
          <div style={{
            display: "inline-block",
            marginTop: 6,
            padding: "3px 10px",
            background: "#ffe3eb",
            borderRadius: 999,
            fontSize: 10, fontWeight: 800, color: "#a85a72", letterSpacing: 1,
          }}>一輩子只能借一次喔 ♡</div>
        </div>

        {/* 主金額 + 蓋章 */}
        <div style={{
          marginTop: 16,
          padding: "16px 18px",
          background: "linear-gradient(180deg, #fff5f0, #ffe8dd)",
          borderRadius: 6,
          position: "relative",
          textAlign: "center",
          border: "2px dashed rgba(180,120,90,0.3)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#a37a82", letterSpacing: 3 }}>
            立即入帳
          </div>
          <div style={{
            fontSize: 56, fontWeight: 900, color: "#df6374",
            fontFamily: '"Caveat", "Noto Sans TC", system-ui',
            lineHeight: 1, marginTop: 2,
          }}>+$300</div>

          {/* 銀行官印（章戳） */}
          <div style={{
            position: "absolute", top: 8, right: 14,
            width: 64, height: 64, borderRadius: "50%",
            border: "2.5px solid #df6374",
            color: "#df6374",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            transform: "rotate(-12deg)",
            opacity: 0.78,
            fontFamily: '"Caveat", "Noto Sans TC", system-ui',
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0 1px, transparent 2px)",
            backgroundSize: "8px 8px",
          }}>
            <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: 1 }}>★ DOGGO ★</div>
            <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1, marginTop: 1 }}>核准</div>
            <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: 1 }}>BANK</div>
          </div>
        </div>

        {/* 條款明細 */}
        <div style={{
          marginTop: 14,
          padding: "12px 14px",
          background: "#fff",
          border: "1.5px dashed #f0c8d4",
          fontSize: 12, fontWeight: 600, color: "#5b382d",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <ContractRow label="🦴 每日扣款" value="−$5 / 天" valueColor="#a85a72"/>
          <ContractRow label="📅 還款期" value="80 天" valueColor="#7a3a52"/>
          <ContractRow label="💰 總還款" value="$400" valueColor="#7a3a52" sub="(淨成本 $100)"/>
        </div>

        {/* 細則手寫小字 */}
        <div style={{
          marginTop: 10,
          fontSize: 11,
          color: "#a37a82",
          fontFamily: '"Caveat", "Noto Sans TC", system-ui',
          textAlign: "center", fontWeight: 700,
          lineHeight: 1.5,
        }}>
          ※ 一輩子只能借一次・借了就沒得後悔・第二桶金要靠你自己賺到了
        </div>

        {/* 雙按鈕 */}
        <div style={{
          marginTop: 14,
          display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10,
        }}>
          <button style={{
            padding: "12px 16px",
            border: 0,
            cursor: "pointer",
            background: "linear-gradient(180deg, #ff96b3, #ef6f8f)",
            color: "#fff",
            fontWeight: 900, fontSize: 16,
            fontFamily: "inherit",
            borderRadius: 12,
            boxShadow: "0 5px 0 #c14a68, 0 8px 16px rgba(239,111,143,0.32)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <span style={{ fontSize: 16 }}>🐾</span>
            借 $300
          </button>
          <button style={{
            padding: "12px 16px",
            border: 0,
            cursor: "pointer",
            background: "#fff",
            color: "#7a5a68",
            fontWeight: 800, fontSize: 14,
            fontFamily: "inherit",
            borderRadius: 12,
            boxShadow: "inset 0 0 0 2px #f0c8d4, 0 3px 0 #f0c8d4",
          }}>不借</button>
        </div>
      </div>
    </div>
  );
}

function ContractRow({ label, value, valueColor, sub }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      paddingBottom: 6, borderBottom: "1px dotted rgba(180,120,90,0.2)",
    }}>
      <span>{label}</span>
      <span>
        <span style={{ fontWeight: 900, fontSize: 16, color: valueColor }}>{value}</span>
        {sub && <span style={{ fontSize: 11, color: "#a37a82", marginLeft: 6, fontWeight: 600 }}>{sub}</span>}
      </span>
    </div>
  );
}

// ===========================================================
// V2 · 銀行存摺風（小簿子 + 條款列、更輕鬆）
// ===========================================================
function LoanPassbook() {
  return (
    <div style={{
      position: "relative", width: 460,
      filter: "drop-shadow(0 24px 36px rgba(120,60,80,0.22))",
    }}>
      <BackPaper color="#ffe3eb" rotate={-1.8} offsetX={-4}/>

      <div style={{
        position: "relative",
        background: "#fffaf2",
        boxShadow: "0 10px 28px rgba(150,90,80,0.2)",
        ...paperTexture,
      }}>
        {/* 上方藍色封套（像存摺封皮） */}
        <div style={{
          background: "linear-gradient(180deg, #b8d4e8, #8eb8d2)",
          padding: "16px 22px 14px",
          color: "#fff",
          position: "relative",
        }}>
          <Tape color="#ffd9a6" angle={-4} w={120} h={22} style={{ top: -10, left: "50%", marginLeft: -60 }}/>
          <CloseBtn/>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* 銀行 logo */}
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(255,255,255,0.95)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
              boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
            }}>🏦</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 3, opacity: 0.85 }}>
                DOGGO BANK
              </div>
              <div style={{
                fontSize: 22, fontWeight: 900,
                fontFamily: '"Caveat", "Noto Sans TC", system-ui',
                lineHeight: 1.1, marginTop: 1,
                textShadow: "0 2px 4px rgba(0,0,0,0.15)",
              }}>救急貸款 · 申請書</div>
            </div>
          </div>

          <div style={{
            marginTop: 8, fontSize: 11, fontWeight: 600,
            opacity: 0.92,
          }}>「資金見底了？銀行願意伸出援手 🐾」</div>
        </div>

        {/* 下方紙頁 */}
        <div style={{ padding: "16px 22px 18px" }}>
          {/* 主金額橫條（存摺感的條紋） */}
          <div style={{
            background:
              "repeating-linear-gradient(180deg, #fff 0 22px, #fff8f0 22px 23px)",
            border: "1.5px solid rgba(180,120,90,0.2)",
            padding: "12px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#a37a82", letterSpacing: 2 }}>
                立即取得
              </div>
              <div style={{
                fontSize: 32, fontWeight: 900, color: "#df6374",
                fontFamily: '"Caveat", "Noto Sans TC", system-ui',
                lineHeight: 1, marginTop: 1,
              }}>+$300</div>
            </div>
            {/* 印章 */}
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              border: "2.5px solid #df6374",
              color: "#df6374",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              transform: "rotate(8deg)",
              opacity: 0.78,
              fontFamily: '"Caveat", "Noto Sans TC", system-ui',
              backgroundImage:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0 1px, transparent 2px)",
              backgroundSize: "8px 8px",
            }}>
              <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: 1 }}>★ APPROVED ★</div>
              <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1, marginTop: 2 }}>核准</div>
            </div>
          </div>

          {/* 條款表格 */}
          <div style={{
            marginTop: 12,
            display: "flex", flexDirection: "column",
            border: "1px solid rgba(180,120,90,0.2)",
          }}>
            <PassRow label="每日扣款" value="−$5 / 天" valueColor="#a85a72" emoji="🦴"/>
            <PassRow label="還款期" value="80 天" valueColor="#5b382d" emoji="📅"/>
            <PassRow label="總還款" value="$400" valueColor="#5b382d" emoji="💰" sub="淨成本 $100"/>
          </div>

          {/* 警語 */}
          <div style={{
            marginTop: 12,
            padding: "8px 10px",
            background: "#fff7d6",
            border: "1px dashed rgba(180,140,40,0.35)",
            fontSize: 11, fontWeight: 700, color: "#7a5a1a",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            一輩子只能借一次，借了就沒有第二次安全網了。
          </div>

          {/* 雙按鈕 */}
          <div style={{
            marginTop: 14,
            display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10,
          }}>
            <button style={{
              padding: "12px 16px",
              border: 0,
              cursor: "pointer",
              background: "linear-gradient(180deg, #ff96b3, #ef6f8f)",
              color: "#fff",
              fontWeight: 900, fontSize: 16,
              fontFamily: "inherit",
              borderRadius: 12,
              boxShadow: "0 5px 0 #c14a68, 0 8px 16px rgba(239,111,143,0.32)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <span style={{ fontSize: 16 }}>🐾</span>
              借 $300
            </button>
            <button style={{
              padding: "12px 16px",
              border: 0,
              cursor: "pointer",
              background: "#fff",
              color: "#7a5a68",
              fontWeight: 800, fontSize: 14,
              fontFamily: "inherit",
              borderRadius: 12,
              boxShadow: "inset 0 0 0 2px #f0c8d4, 0 3px 0 #f0c8d4",
            }}>不借</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PassRow({ label, value, valueColor, emoji, sub }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px",
      borderBottom: "1px dotted rgba(180,120,90,0.2)",
      fontSize: 12, fontWeight: 700, color: "#5b382d",
      background: "rgba(255,250,242,0.6)",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 14 }}>{emoji}</span>
        {label}
      </span>
      <span>
        <span style={{ fontWeight: 900, fontSize: 16, color: valueColor }}>{value}</span>
        {sub && <span style={{ fontSize: 10, color: "#a37a82", marginLeft: 6, fontWeight: 600 }}>· {sub}</span>}
      </span>
    </div>
  );
}

window.LoanContract = LoanContract;
window.LoanPassbook = LoanPassbook;
