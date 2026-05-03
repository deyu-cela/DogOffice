import { useEffect, useState } from 'react';
import type { AnchorId, Bubble } from './tutorialConfig';

const TEACHER_SRC = `${import.meta.env.BASE_URL}assets/dog-profiles/teacher.png`;

// 用「貼上去」的感覺：圖大部分在框外，左側壓在卡片右邊框線上、垂直置中
export function TeacherCorner({ size = 300 }: { size?: number }) {
  return (
    <img
      src={TEACHER_SRC}
      alt=""
      draggable={false}
      style={{
        position: 'absolute',
        right: -Math.round(size * 0.55),
        top: '40%',
        transform: 'translateY(-50%) rotate(4deg)',
        width: size,
        height: size,
        objectFit: 'contain',
        pointerEvents: 'none',
        filter: 'drop-shadow(-2px 6px 10px rgba(90,70,54,0.32))',
        zIndex: 2,
      }}
    />
  );
}

type Rect = { x: number; y: number; w: number; h: number };

function readAnchorRect(anchor: AnchorId): Rect | null {
  const el = document.querySelector(`[data-tutorial="${anchor}"]`);
  if (!el) return null;
  const r = (el as HTMLElement).getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

// 持續觀察 anchor 位置（建築可能因相機/視窗變化動）
function useAnchorRect(anchor: AnchorId | null): Rect | null {
  const [rect, setRect] = useState<Rect | null>(() =>
    anchor ? readAnchorRect(anchor) : null,
  );

  useEffect(() => {
    if (!anchor) {
      setRect(null);
      return;
    }
    let raf = 0;
    let last: Rect | null = readAnchorRect(anchor);
    setRect(last);
    const tick = () => {
      const next = readAnchorRect(anchor);
      if (
        (last && next && (last.x !== next.x || last.y !== next.y || last.w !== next.w || last.h !== next.h)) ||
        (!last && next) ||
        (last && !next)
      ) {
        last = next;
        setRect(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [anchor]);

  return rect;
}

type Props = {
  anchor: AnchorId | null;
  bubble: Bubble;
  // 操作列：上一步 / 下一步 / 跳過 等
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  // 進度條（可選）
  progress?: { current: number; total: number };
  showSkip?: boolean;
  onSkip?: () => void;
  // gate 模式：不顯示 primary，等玩家做指定動作
  gateHint?: string;
  // 隱藏整個 overlay（例如目標 modal 已開啟時）
  hidden?: boolean;
  // 只顯示遮罩 + 圈圈，不顯示說明泡泡（避免擋按鈕）
  bubbleless?: boolean;
};

const PADDING = 14;
const BUBBLE_W = 320;
// teacher 圖大致從 bubble 右緣往外突出的寬度，placement 計算要算進去
// 與 TeacherCorner 預設 size=300 + right=-78% 對應（300*0.78≈234，加 buffer）
const TEACHER_OVERFLOW = 240;

export function TutorialSpotlight({
  anchor,
  bubble,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  progress,
  showSkip = true,
  onSkip,
  gateHint,
  hidden = false,
  bubbleless = false,
}: Props) {
  const rect = useAnchorRect(anchor);

  if (hidden) return null;

  // bubbleless 模式（只指按鈕、不顯示說明）下若 anchor 還沒出現，靜默等待
  if (!rect && bubbleless) return null;

  // anchor 找不到時：fallback 顯示置中對話框（避免教學卡死）
  if (!rect) {
    return (
      <div className="fixed inset-0 z-[880] flex items-center justify-center bg-black/25 p-4 pointer-events-auto">
        <BubbleCard
          bubble={bubble}
          primaryLabel={primaryLabel}
          onPrimary={onPrimary}
          secondaryLabel={secondaryLabel}
          onSecondary={onSecondary}
          progress={progress}
          showSkip={showSkip}
          onSkip={onSkip}
          gateHint={gateHint}
        />
      </div>
    );
  }

  // 鏤空遮罩（用 SVG mask）
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const radius = Math.max(rect.w, rect.h) / 2 + PADDING;

  // bubble 位置：避免遮住 anchor，盡量放在另一側
  // 右側放置要算 teacher 突出寬度（teacher 在 bubble 右緣外）
  const placeRight = cx + radius + BUBBLE_W + TEACHER_OVERFLOW + 24 < vw;
  const placeLeft = cx - radius - BUBBLE_W - 24 > 0;
  const bubbleStyle: React.CSSProperties = {
    position: 'fixed',
    width: BUBBLE_W,
    zIndex: 882,
  };
  // 錨點靠近頂端時，把泡泡放到錨點下方（避免與按鈕重疊）
  const anchorNearTop = cy < 180;
  const sideTop = anchorNearTop
    ? cy + radius + 20
    : Math.max(16, Math.min(vh - 260, cy - 100));
  if (placeRight) {
    bubbleStyle.left = cx + radius + 16;
    bubbleStyle.top = sideTop;
  } else if (placeLeft) {
    // 泡泡放錨點左邊時，teacher 圖在泡泡右側突出，要往左多挪 TEACHER_OVERFLOW 才不會蓋到按鈕
    bubbleStyle.right = vw - (cx - radius) + 16 + TEACHER_OVERFLOW;
    bubbleStyle.top = sideTop;
  } else {
    // 上下放：水平 clamp 要保留 teacher 突出空間
    const placeBelow = cy + radius + 220 < vh;
    const maxLeft = vw - BUBBLE_W - TEACHER_OVERFLOW - 16;
    if (placeBelow) {
      bubbleStyle.left = Math.max(16, Math.min(maxLeft, cx - BUBBLE_W / 2));
      bubbleStyle.top = cy + radius + 16;
    } else {
      bubbleStyle.left = Math.max(16, Math.min(maxLeft, cx - BUBBLE_W / 2));
      bubbleStyle.bottom = vh - (cy - radius) + 16;
    }
  }

  return (
    <>
      <svg
        className="fixed inset-0 z-[880] pointer-events-none"
        viewBox={`0 0 ${vw} ${vh}`}
        preserveAspectRatio="none"
        style={{ width: '100vw', height: '100vh', display: 'block' }}
      >
        <defs>
          <mask id="tut-spot-mask">
            <rect x={0} y={0} width={vw} height={vh} fill="white" />
            <circle cx={cx} cy={cy} r={radius} fill="black" />
          </mask>
        </defs>
        <rect
          x={0}
          y={0}
          width={vw}
          height={vh}
          fill="rgba(0,0,0,0.55)"
          mask="url(#tut-spot-mask)"
        />
        {/* 高亮環 */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255,200,210,0.95)"
          strokeWidth={3}
          style={{ animation: 'tutPulse 1.6s ease-in-out infinite' }}
        />
      </svg>

      <style>{`@keyframes tutPulse {
        0%, 100% { stroke-opacity: 0.55; r: ${radius}px; }
        50% { stroke-opacity: 1; r: ${radius + 4}px; }
      }`}</style>

      {!bubbleless && (
        <div style={bubbleStyle}>
          <BubbleCard
            bubble={bubble}
            primaryLabel={primaryLabel}
            onPrimary={onPrimary}
            secondaryLabel={secondaryLabel}
            onSecondary={onSecondary}
            progress={progress}
            showSkip={showSkip}
            onSkip={onSkip}
            gateHint={gateHint}
          />
        </div>
      )}
    </>
  );
}

export function BubbleCard({
  bubble,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  progress,
  showSkip,
  onSkip,
  gateHint,
}: {
  bubble: Bubble;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  progress?: { current: number; total: number };
  showSkip?: boolean;
  onSkip?: () => void;
  gateHint?: string;
}) {
  return (
    <div
      className="rounded-3xl p-5 text-left"
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #fffefc, #fff5e7)',
        border: '2px solid rgba(90,70,54,0.16)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
        animation: 'fadeInUp 0.25s ease',
        overflow: 'visible',
      }}
    >
      <TeacherCorner />
      <div className="text-lg font-extrabold mb-2" style={{ color: '#5a3e2a' }}>
        {bubble.title}
      </div>
      <div
        className="text-sm leading-relaxed mb-3"
        style={{ color: 'var(--text)' }}
        dangerouslySetInnerHTML={{
          __html:
            bubble.body +
            (bubble.tip
              ? `<div style="margin-top:10px;padding:8px 12px;border-radius:12px;background:rgba(255,179,71,0.14);border:1px solid rgba(255,179,71,0.32);font-size:12.5px;color:#a66826">${bubble.tip}</div>`
              : ''),
        }}
      />
      {progress && (
        <div className="flex gap-1.5 mb-3">
          {Array.from({ length: progress.total }, (_, i) => {
            const done = i < progress.current - 1;
            const active = i === progress.current - 1;
            return (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: active ? 22 : 8,
                  height: 8,
                  background: done ? '#f4a8b8' : active ? '#eb93a3' : '#e8dcc9',
                  transition: 'all 0.2s ease',
                }}
              />
            );
          })}
        </div>
      )}
      {gateHint && (
        <div
          className="text-xs mb-2 px-3 py-1.5 rounded-lg text-center"
          style={{ background: 'rgba(235,147,163,0.16)', color: '#a14b5e' }}
        >
          {gateHint}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <div>
          {showSkip && (
            <button
              onClick={onSkip}
              className="text-xs"
              style={{
                background: 'transparent',
                color: 'var(--muted)',
                boxShadow: 'none',
                textDecoration: 'underline',
              }}
            >
              跳過教學
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {secondaryLabel && (
            <button
              onClick={onSecondary}
              className="text-sm px-3"
              style={{ background: '#f0e3d0', color: '#5a3e2a' }}
            >
              {secondaryLabel}
            </button>
          )}
          {primaryLabel && (
            <button
              onClick={onPrimary}
              className="text-sm px-5"
              style={{
                background: 'linear-gradient(180deg, #ffc7d1, #eb93a3)',
                color: 'white',
              }}
            >
              {primaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
