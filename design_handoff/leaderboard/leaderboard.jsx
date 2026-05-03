/* global React */
const { useState } = React;

const paperTexture = {
  backgroundImage:
    "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)," +
    " radial-gradient(circle at 6px 6px, rgba(0,0,0,0.022) 1px, transparent 1.6px)",
  backgroundSize: "auto, 12px 12px",
};

const ROWS = [
  { rank: 1, name: "瓜瓜",         day: 139, money: 41486,  staff: 34, date: "5/3" },
  { rank: 2, name: "vfh",          day: 151, money: 10132,  staff: 38, date: "5/3" },
  { rank: 3, name: "傑哥的蕉流互助會", day: 166, money: 6334,  staff: 33, date: "5/3" },
  { rank: 4, name: "狗子奴隷公司",    day: 191, money: 77452, staff: 38, date: "5/3" },
  { rank: 5, name: "測你爸",        day: 230, money: 12446,  staff: 60, date: "5/3" },
  { rank: 6, name: "狗奴請用力",    day: 324, money: 181382, staff: 45, date: "5/3" },
  { rank: 7, name: "T0",            day: 395, money: 91994,  staff: 46, date: "5/3" },
];

function fmt$(n) { return "$" + n.toLocaleString(); }

function Frame({ children, label }) {
  return (
    <div style={{
      width: 720, height: 920,
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

function Trophy({ size = 28 }) {
  return <span style={{ fontSize: size, lineHeight: 1 }}>🏆</span>;
}

// ============== V1: 獎座頁面（金邊紙）+ 條紋斑馬列表 ==============
function V1Award() {
  return (
    <div style={{ position: "relative", width: 460 }}>
      {/* 後紙 */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#fff7ec", borderRadius: 14,
        transform: "rotate(-1.4deg) translate(-5px, 4px)",
        boxShadow: "0 10px 18px rgba(150,90,80,0.18)",
        ...paperTexture,
      }}/>

      <div style={{
        position: "relative",
        background: "linear-gradient(180deg, #fffaf2, #fff2e8)",
        borderRadius: 14,
        padding: "22px 22px 20px",
        boxShadow: "0 14px 28px rgba(150,90,80,0.22), inset 0 0 0 1px rgba(255,255,255,0.7)",
        border: "1px solid rgba(220,170,150,0.4)",
        ...paperTexture,
      }}>
        <WashiTape left={-12} top={14} width={80} rotate={-30} color="#ffd86b"/>
        <WashiTape right={-12} top={14} width={80} rotate={30} color="#ffc1ce"/>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 12,
            background: "linear-gradient(180deg, #ffe28a, #ffb84a)",
            border: "2px solid #fff",
            boxShadow: "0 6px 12px rgba(180,120,40,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26,
            transform: "rotate(-5deg)",
          }}>🏆</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#7a3a52", letterSpacing: 1 }}>排行榜</h2>
            <div style={{ fontSize: 11, color: "#a37a82", fontWeight: 600, marginTop: 2 }}>
              最先達成豪華總部的紀錄
            </div>
          </div>
          <button style={{
            padding: "6px 14px",
            background: "#fffaf2",
            color: "#7a3a52",
            border: "1.5px solid rgba(180,120,90,0.35)",
            borderRadius: 999,
            fontSize: 12, fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(150,90,80,0.1)",
          }}>關閉</button>
        </div>

        {/* TOP 10 ribbon */}
        <div style={{
          marginTop: 10,
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "3px 12px",
          background: "linear-gradient(180deg, #ffd86b, #ffb838)",
          color: "#5a3a00",
          fontSize: 11, fontWeight: 900, letterSpacing: 2,
          borderRadius: 4,
          border: "1px solid rgba(120,80,0,0.25)",
          boxShadow: "0 2px 4px rgba(180,120,40,0.3)",
          transform: "rotate(-1deg)",
        }}>★ TOP 10 ★</div>

        {/* 列表 — 斑馬條紋紙 */}
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {ROWS.map((r, i) => <RowAward key={r.rank} {...r} highlight={i === 0}/>)}
        </div>

        {/* footer 撕線 */}
        <div style={{
          marginTop: 14,
          padding: "10px 12px",
          background: "rgba(255,232,224,0.55)",
          borderRadius: 8,
          border: "1px dashed rgba(180,120,90,0.4)",
          fontSize: 11, color: "#7a3a52", fontWeight: 700,
          textAlign: "center",
        }}>
          🐾 你還沒有上榜，把辦公室升級到豪華總部就能登榜！
        </div>
      </div>
    </div>
  );
}

function RowAward({ rank, name, day, money, staff, date, highlight }) {
  const rankColors = {
    1: { bg: "linear-gradient(180deg, #ffe28a, #ffb838)", text: "#5a3a00", border: "rgba(120,80,0,0.4)", icon: "🥇" },
    2: { bg: "linear-gradient(180deg, #e8e8ee, #b8b8c8)", text: "#3a3a52", border: "rgba(60,60,80,0.3)",  icon: "🥈" },
    3: { bg: "linear-gradient(180deg, #ffcfa3, #d18b5a)", text: "#5a2a00", border: "rgba(120,60,0,0.35)", icon: "🥉" },
  };
  const rc = rankColors[rank];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 12px",
      background: highlight
        ? "linear-gradient(180deg, #fff8e6, #ffeec8)"
        : (rank % 2 === 0 ? "rgba(255,232,224,0.4)" : "rgba(255,250,242,0.7)"),
      borderRadius: 9,
      border: highlight ? "1.5px solid rgba(220,160,40,0.5)" : "1px solid rgba(220,170,150,0.3)",
      boxShadow: highlight ? "0 4px 10px rgba(220,160,40,0.2)" : "none",
      position: "relative",
    }}>
      {/* rank chip */}
      <div style={{
        width: 38, flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
      }}>
        {rc ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32, borderRadius: 8,
            background: rc.bg,
            border: `1px solid ${rc.border}`,
            color: rc.text,
            fontSize: 13, fontWeight: 900,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}>{rc.icon}</div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32, borderRadius: 8,
            background: "#fffaf2",
            border: "1px solid rgba(180,120,90,0.3)",
            color: "#7a3a52",
            fontSize: 13, fontWeight: 900,
          }}>#{rank}</div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#5b382d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </div>
        <div style={{ fontSize: 11, color: "#a37a82", fontWeight: 700, marginTop: 1 }}>
          第 {day} 天 · 現金 {fmt$(money)} · 員工 {staff} 位
        </div>
      </div>

      <div style={{
        flexShrink: 0,
        fontSize: 10, color: "#a37a82", fontWeight: 700,
        padding: "2px 6px",
        background: "rgba(255,255,255,0.6)",
        borderRadius: 4,
        border: "1px solid rgba(180,120,90,0.2)",
      }}>{date}</div>
    </div>
  );
}

// ============== V2: 公告板 + 釘紙條 ==============
function V2Bulletin() {
  return (
    <div style={{
      position: "relative",
      width: 460,
      padding: "20px 18px 18px",
      background: "linear-gradient(180deg, #c89272 0%, #a87050 100%)",
      borderRadius: 14,
      border: "4px solid #6b4a30",
      boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.1), 0 14px 28px rgba(60,30,10,0.4)",
      backgroundImage:
        "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.05), transparent 30%)," +
        " repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 8px)," +
        "linear-gradient(180deg, #c89272 0%, #a87050 100%)",
    }}>
      {/* 標題紙 */}
      <div style={{
        position: "relative",
        background: "linear-gradient(180deg, #fffaf2, #fff2e8)",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        border: "1px solid rgba(220,170,150,0.4)",
        ...paperTexture,
        display: "flex", alignItems: "center", gap: 10,
        transform: "rotate(-1deg)",
      }}>
        <Pin/>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "linear-gradient(180deg, #ffe28a, #ffb838)",
          border: "1.5px solid #fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>🏆</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#7a3a52" }}>排行榜 · TOP 10</h2>
          <div style={{ fontSize: 10, color: "#a37a82", fontWeight: 700, marginTop: 1 }}>
            最先達成豪華總部的紀錄
          </div>
        </div>
        <button style={{
          padding: "5px 12px",
          background: "#fffaf2",
          color: "#7a3a52",
          border: "1.5px solid rgba(180,120,90,0.35)",
          borderRadius: 999,
          fontSize: 11, fontWeight: 800,
          cursor: "pointer",
        }}>關閉</button>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {ROWS.map((r, i) => <RowPinned key={r.rank} {...r} index={i}/>)}
      </div>

      {/* 底部小紙條 */}
      <div style={{
        marginTop: 12,
        padding: "8px 12px",
        background: "#fffaf2",
        borderRadius: 6,
        border: "1px dashed rgba(180,120,90,0.4)",
        fontSize: 10, color: "#7a3a52", fontWeight: 700,
        textAlign: "center",
        transform: "rotate(0.5deg)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        ...paperTexture,
      }}>
        🐾 把辦公室升級到豪華總部就能登榜！
      </div>
    </div>
  );
}

function Pin() {
  return (
    <span aria-hidden="true" style={{
      position: "absolute", left: 8, top: -6,
      width: 14, height: 14, borderRadius: "50%",
      background: "radial-gradient(circle at 35% 30%, #ff7591, #c42c5a 80%)",
      border: "1px solid rgba(120,30,55,0.5)",
      boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(0,0,0,0.25)",
      zIndex: 2,
    }}/>
  );
}

function RowPinned({ rank, name, day, money, staff, date, index }) {
  const angles = [0.5, -0.7, 0.4, -0.3, 0.6, -0.5, 0.3];
  const ang = angles[index % angles.length];
  const colors = [
    "#fffaf2", "#fff5e6", "#fff0e8", "#fffae0", "#fff2eb", "#fff8e8", "#fff5f0"
  ];
  const bg = rank === 1 ? "linear-gradient(180deg, #fff8e0, #ffe9b3)" : colors[index % colors.length];

  const rankColors = {
    1: { bg: "linear-gradient(180deg, #ffe28a, #ffb838)", text: "#5a3a00", icon: "🥇" },
    2: { bg: "linear-gradient(180deg, #e8e8ee, #b8b8c8)", text: "#3a3a52", icon: "🥈" },
    3: { bg: "linear-gradient(180deg, #ffcfa3, #d18b5a)", text: "#5a2a00", icon: "🥉" },
  };
  const rc = rankColors[rank];

  return (
    <div style={{
      position: "relative",
      background: bg,
      borderRadius: 6,
      padding: "9px 12px 9px 14px",
      boxShadow: rank === 1 ? "0 6px 14px rgba(220,160,40,0.35)" : "0 3px 8px rgba(0,0,0,0.2)",
      border: rank === 1 ? "1.5px solid rgba(220,160,40,0.5)" : "1px solid rgba(220,170,150,0.4)",
      display: "flex", alignItems: "center", gap: 10,
      transform: `rotate(${ang}deg)`,
      ...paperTexture,
    }}>
      <Pin/>
      <div style={{
        width: 30, height: 30, borderRadius: 6,
        background: rc ? rc.bg : "#fffaf2",
        border: rc ? "1px solid rgba(0,0,0,0.15)" : "1px solid rgba(180,120,90,0.3)",
        color: rc ? rc.text : "#7a3a52",
        fontSize: 13, fontWeight: 900,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }}>{rc ? rc.icon : `#${rank}`}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#5b382d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </div>
        <div style={{ fontSize: 10, color: "#a37a82", fontWeight: 700, marginTop: 1 }}>
          第 {day} 天 · {fmt$(money)} · 員工 {staff}
        </div>
      </div>
      <div style={{ fontSize: 9, color: "#a37a82", fontWeight: 700, fontFamily: "monospace" }}>{date}</div>
    </div>
  );
}

// ============== V3: 領獎台 — 紙感主設計版 ==============
function V3Podium() {
  const top3 = ROWS.slice(0, 3);
  const rest = ROWS.slice(3);

  return (
    <div style={{ position: "relative", width: 460 }}>
      {/* 後紙 1 */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#fff7ec", borderRadius: 14,
        transform: "rotate(-1.6deg) translate(-6px, 4px)",
        boxShadow: "0 10px 18px rgba(150,90,80,0.18)",
        ...paperTexture,
      }}/>
      {/* 後紙 2 */}
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
        {/* 左右紙膠帶 */}
        <WashiTape left={-12} top={20} width={70} rotate={-30} color="#ffd86b"/>
        <WashiTape right={-12} top={56} width={70} rotate={30} color="#ffc1ce"/>

        {/* 獎盃徽章 — 中間浮出 */}
        <div style={{
          position: "absolute", left: "50%", top: -26,
          transform: "translateX(-50%) rotate(-4deg)",
          width: 56, height: 56, borderRadius: 16,
          background: "linear-gradient(180deg, #ffe28a, #ffb838)",
          border: "3px solid #fff",
          boxShadow: "0 8px 14px rgba(180,120,40,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28,
          zIndex: 6,
        }}>🏆</div>
        <span style={{
          position: "absolute", left: "calc(50% + 30px)", top: -14,
          fontSize: 14, transform: "rotate(20deg)",
          zIndex: 6,
        }}>✨</span>
        <span style={{
          position: "absolute", left: "calc(50% - 38px)", top: -10,
          fontSize: 11, transform: "rotate(-25deg)",
          zIndex: 6,
        }}>✨</span>

        {/* Header — 標題置中、關閉鈕絕對定位右上 */}
        <button style={{
          position: "absolute", right: 14, top: 14,
          padding: "5px 12px", background: "#fffaf2", color: "#7a3a52",
          border: "1.5px solid rgba(180,120,90,0.35)", borderRadius: 999,
          fontSize: 11, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 2px 4px rgba(150,90,80,0.1)",
          zIndex: 4,
        }}>關閉</button>
        <div style={{ paddingTop: 32, textAlign: "center" }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 4,
            color: "#df6374",
          }}>LEADERBOARD · 排行榜</div>
          <h2 style={{
            margin: "2px 0 0", fontSize: 20, fontWeight: 900,
            color: "#7a3a52", letterSpacing: 1,
          }}>豪華總部達成榜</h2>
          <div style={{
            marginTop: 5,
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "2px 10px",
            background: "rgba(255,210,225,0.5)",
            borderRadius: 999,
            fontSize: 10, color: "#9a4a62", fontWeight: 700,
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#df6374" }}/>
            最先達成豪華總部的紀錄
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#df6374" }}/>
          </div>
        </div>

        {/* Podium 區 — 三張便利貼釘紙 */}
        <div style={{
          position: "relative",
          marginTop: 24,
          padding: "16px 4px 8px",
          background: "rgba(255,232,224,0.35)",
          borderRadius: 10,
          border: "1px dashed rgba(180,120,90,0.35)",
        }}>
          {/* TOP 3 標籤（左上小貼紙） */}
          <div style={{
            position: "absolute", left: 10, top: -10,
            padding: "2px 10px",
            background: "linear-gradient(180deg, #ff8aa6, #ef6f8f)",
            color: "#fff",
            fontSize: 10, fontWeight: 900, letterSpacing: 2,
            borderRadius: 4,
            transform: "rotate(-3deg)",
            boxShadow: "0 3px 6px rgba(180,80,100,0.35)",
          }}>★ TOP 3</div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr",
            gap: 10, alignItems: "end",
            padding: "0 6px",
          }}>
            <PodiumCardV2 place={2} {...top3[1]}/>
            <PodiumCardV2 place={1} {...top3[0]}/>
            <PodiumCardV2 place={3} {...top3[2]}/>
          </div>
        </div>

        {/* 撕線 + 4-10 標籤 */}
        <div style={{
          marginTop: 18, marginBottom: 8,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            flex: 1, height: 1,
            backgroundImage: "repeating-linear-gradient(90deg, rgba(180,120,140,0.4) 0 6px, transparent 6px 12px)",
          }}/>
          <span style={{
            fontSize: 10, fontWeight: 900, letterSpacing: 2,
            color: "#a37a82",
            padding: "2px 8px",
            background: "#fffaf2",
            border: "1px solid rgba(180,120,90,0.3)",
            borderRadius: 4,
          }}>#4 — #10</span>
          <div style={{
            flex: 1, height: 1,
            backgroundImage: "repeating-linear-gradient(90deg, rgba(180,120,140,0.4) 0 6px, transparent 6px 12px)",
          }}/>
        </div>

        {/* 4-10 列表 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {rest.map((r) => <RowSlim key={r.rank} {...r}/>)}
        </div>

        <div style={{
          marginTop: 14,
          padding: "10px 12px",
          background: "rgba(255,232,224,0.55)",
          borderRadius: 8,
          border: "1px dashed rgba(180,120,90,0.4)",
          fontSize: 11, color: "#7a3a52", fontWeight: 700,
          textAlign: "center",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <span>🐾</span>
          把辦公室升級到豪華總部就能登榜！
        </div>
      </div>
    </div>
  );
}

function PodiumCardV2({ place, name, day, money, staff }) {
  // 使用主設計色票 — 粉 / 米 / 桃
  const config = {
    1: {
      bg: "linear-gradient(180deg, #fffaf2, #fff2d6)",
      border: "rgba(220,160,40,0.55)",
      ribbon: "linear-gradient(180deg, #ffd86b, #ffb838)",
      ribbonText: "#5a3a00",
      ribbonBorder: "rgba(120,80,0,0.35)",
      icon: "🥇",
      height: 168,
      rotate: 0,
      shadow: "0 10px 20px rgba(220,160,40,0.32)",
      tape: "#ffd86b",
      label: "FIRST",
    },
    2: {
      bg: "linear-gradient(180deg, #fffaf2, #ffeae0)",
      border: "rgba(220,150,165,0.5)",
      ribbon: "linear-gradient(180deg, #ffc1ce, #ef6f8f)",
      ribbonText: "#fff",
      ribbonBorder: "rgba(180,60,90,0.4)",
      icon: "🥈",
      height: 142,
      rotate: -2.5,
      shadow: "0 8px 16px rgba(180,80,100,0.22)",
      tape: "#ffc1ce",
      label: "SECOND",
    },
    3: {
      bg: "linear-gradient(180deg, #fffaf2, #fff0e0)",
      border: "rgba(200,140,90,0.45)",
      ribbon: "linear-gradient(180deg, #ffcfa3, #d18b5a)",
      ribbonText: "#5a2a00",
      ribbonBorder: "rgba(120,60,0,0.35)",
      icon: "🥉",
      height: 130,
      rotate: 2,
      shadow: "0 8px 16px rgba(180,100,60,0.22)",
      tape: "#ffcfa3",
      label: "THIRD",
    },
  }[place];

  return (
    <div style={{
      position: "relative",
      background: config.bg,
      border: `1.5px solid ${config.border}`,
      borderRadius: 10,
      padding: "16px 8px 10px",
      minHeight: config.height,
      display: "flex", flexDirection: "column", alignItems: "center",
      boxShadow: `${config.shadow}, inset 0 0 0 1px rgba(255,255,255,0.55)`,
      transform: `rotate(${config.rotate}deg)`,
      ...paperTexture,
    }}>
      {/* 紙膠帶釘住頂端 */}
      <span aria-hidden="true" style={{
        position: "absolute", left: "50%", top: -6,
        transform: "translateX(-50%) rotate(-3deg)",
        width: 50, height: 14,
        background: `linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25% 50%, rgba(255,255,255,0.5) 50% 75%, transparent 75%), ${config.tape}`,
        backgroundSize: "12px 12px",
        opacity: 0.92,
        boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
      }}/>

      {/* 獎牌 emoji */}
      <div style={{ fontSize: place === 1 ? 36 : 30, lineHeight: 1, marginTop: 2 }}>{config.icon}</div>

      {/* #N 緞帶 */}
      <div style={{
        marginTop: 6,
        padding: "2px 10px",
        background: config.ribbon,
        color: config.ribbonText,
        fontSize: 11, fontWeight: 900, letterSpacing: 2,
        borderRadius: 4,
        border: `1px solid ${config.ribbonBorder}`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
      }}>#{place}</div>

      {/* 名字 */}
      <div style={{
        marginTop: 7,
        fontSize: place === 1 ? 14 : 13, fontWeight: 900, color: "#5b382d",
        textAlign: "center", maxWidth: "100%",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        padding: "0 4px",
        lineHeight: 1.2,
      }}>{name}</div>

      {/* 紙條：第 N 天 + 金額 */}
      <div style={{
        marginTop: 5,
        padding: "3px 7px",
        background: "rgba(255,255,255,0.7)",
        border: "1px solid rgba(180,120,90,0.25)",
        borderRadius: 5,
        fontSize: 10, color: "#7a3a52", fontWeight: 800,
        textAlign: "center",
        lineHeight: 1.5,
      }}>
        <div>第 {day} 天</div>
        <div style={{ color: "#df6374" }}>{fmt$(money)}</div>
      </div>
    </div>
  );
}

function RowSlim({ rank, name, day, money, staff, date }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "7px 10px",
      background: rank % 2 === 0 ? "rgba(255,232,224,0.35)" : "transparent",
      borderRadius: 6,
    }}>
      <div style={{
        width: 26, fontSize: 11, fontWeight: 900,
        color: "#a37a82", textAlign: "center",
      }}>#{rank}</div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: "#5b382d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </span>
        <span style={{ fontSize: 10, color: "#a37a82", fontWeight: 700 }}>
          第 {day} 天 · {fmt$(money)}
        </span>
      </div>
      <div style={{ fontSize: 9, color: "#a37a82", fontWeight: 700 }}>{date}</div>
    </div>
  );
}

window.V1Award = V1Award;
window.V2Bulletin = V2Bulletin;
window.V3Podium = V3Podium;
window.LeaderboardFrame = Frame;
