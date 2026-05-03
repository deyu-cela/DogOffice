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
      width: 720, height: 600,
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
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 30 }}>
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

function WashiTape({ left, top, right, bottom, width = 80, color = "#f6a7b3", rotate = -7 }) {
  return (
    <span aria-hidden="true" style={{
      position: "absolute", left, top, right, bottom, width, height: 22,
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

// 共用：CEO 狗狗 placeholder（畫面上 dog 圖會用 emoji + 漸層底）
function DogAvatar({ size = 64, rotate = 0 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: "linear-gradient(160deg, #6b4a3a, #3d2a20)",
      border: "2px solid #fffaf2",
      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.55,
      transform: `rotate(${rotate}deg)`,
      flexShrink: 0,
    }}>🐶</div>
  );
}

// ============== V1: 禮盒包裝紙風 ==============
function V1GiftWrap() {
  return (
    <div style={{ position: "relative", width: 420 }}>
      {/* 後層紙 */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#fff7ec", borderRadius: 14,
        transform: "rotate(-1.8deg) translate(-5px, 4px)",
        boxShadow: "0 10px 18px rgba(150,90,80,0.18)",
        ...paperTexture,
      }}/>
      <div style={{
        position: "absolute", inset: 0,
        background: "#ffe0e8", borderRadius: 14,
        transform: "rotate(1.2deg) translate(4px, 2px)",
        boxShadow: "0 10px 18px rgba(150,90,80,0.18)",
        ...paperTexture,
      }}/>
      {/* main */}
      <div style={{
        position: "relative",
        background: "linear-gradient(180deg, #fffaf2, #fff2e8)",
        borderRadius: 14,
        padding: "28px 26px 22px",
        boxShadow: "0 14px 28px rgba(150,90,80,0.22), inset 0 0 0 1px rgba(255,255,255,0.7)",
        border: "1px solid rgba(220,170,150,0.4)",
        ...paperTexture,
      }}>
        <WashiTape left="50%" top={-9} width={90} rotate={-4} color="#ffc1ce"/>

        {/* 禮物徽章 */}
        <div style={{
          position: "absolute", left: "50%", top: -28,
          transform: "translateX(-50%) rotate(-6deg)",
          width: 60, height: 60, borderRadius: "50%",
          background: "linear-gradient(180deg, #ffe28a, #ffb84a)",
          border: "3px solid #fff",
          boxShadow: "0 8px 14px rgba(180,120,60,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30,
        }}>🎁</div>
        <span style={{
          position: "absolute", left: "calc(50% + 24px)", top: -10,
          fontSize: 16, transform: "rotate(20deg)",
        }}>✨</span>

        {/* 標題 */}
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 4,
            color: "#df6374",
          }}>GAMEJAM · 拜託 🙏</div>
          <h2 style={{
            margin: "4px 0 0", fontSize: 22, fontWeight: 900,
            color: "#7a3a52", letterSpacing: 1,
          }}>投票送你限定狗狗</h2>
          <p style={{
            margin: "8px 0 0", fontSize: 12,
            color: "#a37a82", fontWeight: 600, lineHeight: 1.6,
          }}>
            願意去 GameJam 投我們一票嗎？<br/>
            投了就送你一隻專屬 CEO 狗狗 🐾
          </p>
        </div>

        {/* CEO 卡片 */}
        <div style={{
          marginTop: 18,
          padding: 14,
          background: "linear-gradient(180deg, #fffaf2, #fff5ea)",
          border: "1.5px dashed rgba(180,120,90,0.4)",
          borderRadius: 12,
          display: "flex", gap: 12, alignItems: "center",
          position: "relative",
          boxShadow: "inset 0 1px 2px rgba(150,90,80,0.06)",
        }}>
          <span style={{
            position: "absolute", right: -8, top: -8,
            background: "#df6374", color: "#fff",
            fontSize: 10, fontWeight: 900, letterSpacing: 1,
            padding: "3px 8px", borderRadius: 999,
            transform: "rotate(8deg)",
            boxShadow: "0 4px 8px rgba(180,80,100,0.35)",
          }}>限定 · LIMITED</span>
          <DogAvatar size={64} rotate={-4}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 900, color: "#7a3a52" }}>刀霸翎</span>
              <span style={{
                fontSize: 9, fontWeight: 900, letterSpacing: 1,
                padding: "1px 6px", borderRadius: 4,
                background: "linear-gradient(180deg, #ffd86b, #ffb838)",
                color: "#5a3a00",
                border: "1px solid rgba(120,80,0,0.25)",
              }}>S 級</span>
            </div>
            <div style={{ fontSize: 11, color: "#a37a82", fontWeight: 700, marginTop: 2 }}>
              CEO · 月薪 $0
            </div>
            <div style={{
              marginTop: 6,
              padding: "5px 8px",
              background: "#fff8ec",
              borderLeft: "2px solid #df6374",
              fontSize: 11, color: "#5b382d", fontWeight: 600,
              fontStyle: "italic",
            }}>「Never be afraid, keep on moving!」</div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button style={{
            flex: 1,
            padding: "12px 14px",
            background: "#fffaf2",
            color: "#a37a82",
            border: "1.5px solid rgba(180,120,90,0.3)",
            borderRadius: 11,
            fontSize: 13, fontWeight: 800,
            cursor: "pointer",
          }}>先不要</button>
          <button style={{
            flex: 1.6,
            padding: "12px 14px",
            background: "linear-gradient(180deg, #ff8aa6, #ef6f8f)",
            color: "#fff",
            border: "1.5px solid rgba(180,60,90,0.4)",
            borderRadius: 11,
            fontSize: 14, fontWeight: 900,
            letterSpacing: 1.5,
            cursor: "pointer",
            boxShadow: "0 6px 12px rgba(239,111,143,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <span>🎁</span>投了！領禮包
          </button>
        </div>
      </div>
    </div>
  );
}

// ============== V2: 拍立得 + 卡片貼紙 ==============
function V2Polaroid() {
  return (
    <div style={{ position: "relative", width: 420 }}>
      <div style={{
        position: "relative",
        background: "#fffaf2",
        borderRadius: 10,
        padding: "26px 24px 22px",
        boxShadow: "0 16px 32px rgba(120,80,90,0.28), inset 0 0 0 1px rgba(255,255,255,0.7)",
        border: "1px solid rgba(220,170,150,0.4)",
        ...paperTexture,
        transform: "rotate(-0.8deg)",
      }}>
        <WashiTape left={-12} top={14} width={80} rotate={-30} color="#ffe1a8"/>
        <WashiTape right={-12} top={14} width={80} rotate={30} color="#cfe6f5"/>

        {/* header — 標題 + 禮物 inline */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "linear-gradient(180deg, #ffe28a, #ffb84a)",
            border: "2px solid #fff",
            boxShadow: "0 4px 10px rgba(180,120,60,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
            transform: "rotate(-6deg)",
          }}>🎁</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#df6374" }}>
              GAMEJAM 投票送禮
            </div>
            <h2 style={{ margin: "2px 0 0", fontSize: 19, fontWeight: 900, color: "#7a3a52" }}>
              幫我們投一票，送你狗狗
            </h2>
          </div>
        </div>
        <p style={{
          margin: "6px 0 14px",
          fontSize: 12, color: "#a37a82", fontWeight: 600,
          lineHeight: 1.6,
        }}>
          願意去 GameJam 投票給我們嗎？投了就送你一隻限定 CEO 狗狗 🐾
        </p>

        {/* CEO 拍立得卡 */}
        <div style={{
          background: "#fff",
          borderRadius: 6,
          padding: "10px 10px 14px",
          boxShadow: "0 8px 16px rgba(120,80,90,0.18), 0 0 0 1px rgba(180,120,90,0.2)",
          transform: "rotate(-2deg)",
          position: "relative",
        }}>
          <span style={{
            position: "absolute", left: "50%", top: -8,
            transform: "translateX(-50%) rotate(-3deg)",
            width: 50, height: 14,
            background: "rgba(220,180,140,0.5)",
            border: "1px solid rgba(160,120,80,0.4)",
          }}/>
          <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
            <div style={{
              width: 90, aspectRatio: "1/1",
              background: "linear-gradient(160deg, #6b4a3a, #3d2a20)",
              borderRadius: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 50,
              flexShrink: 0,
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.15)",
            }}>🐶</div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: "#7a3a52" }}>刀霸翎</span>
                <span style={{
                  fontSize: 9, fontWeight: 900, letterSpacing: 1,
                  padding: "1px 6px", borderRadius: 999,
                  background: "linear-gradient(180deg, #ffd86b, #ffb838)",
                  color: "#5a3a00",
                  border: "1px solid rgba(120,80,0,0.25)",
                }}>S 級</span>
                <span style={{
                  fontSize: 9, fontWeight: 800,
                  padding: "1px 6px", borderRadius: 999,
                  background: "rgba(223,99,116,0.12)",
                  color: "#df6374",
                }}>限定</span>
              </div>
              <div style={{ fontSize: 11, color: "#a37a82", fontWeight: 700, marginTop: 3 }}>
                CEO · 月薪 $0
              </div>
              <div style={{
                marginTop: 6,
                fontSize: 11, color: "#5b382d", fontWeight: 600,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}>「Never be afraid,<br/>keep on moving!」</div>
            </div>
          </div>
          {/* 印章 */}
          <div style={{
            position: "absolute", right: 8, bottom: 6,
            padding: "2px 6px",
            border: "1.5px solid rgba(180,80,100,0.5)",
            borderRadius: 4,
            color: "rgba(180,80,100,0.7)",
            fontSize: 9, fontWeight: 900, letterSpacing: 1,
            transform: "rotate(-8deg)",
          }}>EXCLUSIVE</div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button style={{
            flex: 1,
            padding: "11px 14px",
            background: "#fffaf2",
            color: "#a37a82",
            border: "1.5px solid rgba(180,120,90,0.3)",
            borderRadius: 11,
            fontSize: 13, fontWeight: 800,
            cursor: "pointer",
          }}>先不要</button>
          <button style={{
            flex: 1.6,
            padding: "11px 14px",
            background: "linear-gradient(180deg, #ff8aa6, #ef6f8f)",
            color: "#fff",
            border: "1.5px solid rgba(180,60,90,0.4)",
            borderRadius: 11,
            fontSize: 14, fontWeight: 900,
            letterSpacing: 1,
            cursor: "pointer",
            boxShadow: "0 6px 12px rgba(239,111,143,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}>
            投了！領禮包 🎁
          </button>
        </div>
      </div>
    </div>
  );
}

// ============== V3: 信封 + 開窗 ==============
function V3Envelope() {
  return (
    <div style={{ position: "relative", width: 420 }}>
      {/* 信封後紙 */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #ffd6dc, #ffb8c8)",
        borderRadius: 14,
        transform: "translate(0, 8px)",
        boxShadow: "0 10px 18px rgba(180,80,100,0.25)",
      }}/>
      {/* 信封封口三角 */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 70,
        background: "linear-gradient(160deg, #ffc1ce, #ff9eb3)",
        clipPath: "polygon(0 0, 100% 0, 100% 30%, 50% 100%, 0 30%)",
        zIndex: 0,
      }}/>

      {/* main 信紙 */}
      <div style={{
        position: "relative",
        background: "linear-gradient(180deg, #fffaf2, #fff2e8)",
        borderRadius: 12,
        padding: "26px 24px 22px",
        marginTop: 24,
        boxShadow: "0 14px 28px rgba(150,90,80,0.22), inset 0 0 0 1px rgba(255,255,255,0.7)",
        border: "1px solid rgba(220,170,150,0.4)",
        ...paperTexture,
      }}>
        {/* 蠟封 */}
        <div style={{
          position: "absolute", left: "50%", top: -22,
          transform: "translateX(-50%)",
          width: 50, height: 50, borderRadius: "50%",
          background: "radial-gradient(circle at 40% 35%, #ff7591, #c42c5a 75%)",
          border: "1px solid rgba(120,30,55,0.5)",
          boxShadow: "0 4px 10px rgba(180,40,80,0.4), inset -2px -2px 4px rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff8ec",
          fontSize: 22, fontWeight: 900,
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
        }}>🎁</div>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <div style={{
            display: "inline-block",
            fontSize: 10, fontWeight: 700, letterSpacing: 4,
            color: "#df6374",
            padding: "2px 10px",
            border: "1px solid rgba(223,99,116,0.4)",
            borderRadius: 999,
          }}>OPEN ME · 拆信</div>
          <h2 style={{ margin: "10px 0 0", fontSize: 22, fontWeight: 900, color: "#7a3a52", letterSpacing: 1 }}>
            GameJam 投票送禮
          </h2>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#a37a82", fontWeight: 600, lineHeight: 1.6 }}>
            幫我們投一票，就送你<br/>
            一隻限定 CEO 狗狗 🐾
          </p>
        </div>

        {/* 虛線分隔 — 像信紙折線 */}
        <div style={{
          margin: "16px -8px",
          height: 1,
          backgroundImage: "repeating-linear-gradient(90deg, rgba(180,120,140,0.4) 0 6px, transparent 6px 12px)",
        }}/>

        {/* CEO row */}
        <div style={{
          display: "flex", gap: 12, alignItems: "center",
          padding: "10px 12px",
          background: "rgba(255,232,224,0.5)",
          border: "1px solid rgba(220,170,150,0.4)",
          borderRadius: 10,
          position: "relative",
        }}>
          <DogAvatar size={56}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#7a3a52" }}>刀霸翎</span>
              <span style={{
                fontSize: 9, fontWeight: 900, letterSpacing: 1,
                padding: "1px 6px", borderRadius: 4,
                background: "linear-gradient(180deg, #ffd86b, #ffb838)",
                color: "#5a3a00",
                border: "1px solid rgba(120,80,0,0.25)",
              }}>S 級</span>
            </div>
            <div style={{ fontSize: 10, color: "#a37a82", fontWeight: 700, marginTop: 2 }}>
              CEO · 月薪 $0
            </div>
            <div style={{
              marginTop: 4,
              fontSize: 10, color: "#5b382d", fontWeight: 600,
              fontStyle: "italic",
            }}>「Never be afraid, keep on moving!」</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button style={{
            flex: 1,
            padding: "11px 14px",
            background: "#fffaf2",
            color: "#a37a82",
            border: "1.5px solid rgba(180,120,90,0.3)",
            borderRadius: 11,
            fontSize: 13, fontWeight: 800,
            cursor: "pointer",
          }}>先不要</button>
          <button style={{
            flex: 1.6,
            padding: "11px 14px",
            background: "linear-gradient(180deg, #ff8aa6, #ef6f8f)",
            color: "#fff",
            border: "1.5px solid rgba(180,60,90,0.4)",
            borderRadius: 11,
            fontSize: 14, fontWeight: 900,
            letterSpacing: 1,
            cursor: "pointer",
            boxShadow: "0 6px 12px rgba(239,111,143,0.4), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}>
            投了！領禮包 🎁
          </button>
        </div>
      </div>
    </div>
  );
}

window.V1GiftWrap = V1GiftWrap;
window.V2Polaroid = V2Polaroid;
window.V3Envelope = V3Envelope;
window.GameJamFrame = Frame;
