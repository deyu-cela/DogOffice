import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore, GACHA_COST, type GachaResult } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { GachaCard } from './GachaCard';
import { BA_LIGHT, BA_DARK, dogStarStyle } from './gachaStyles';

type Phase = 'home' | 'pulling' | 'results';

export function GachaModal() {
  const open = useUiStore((s) => s.recruitModalOpen);
  const close = useUiStore((s) => s.closeRecruitModal);

  const money = useGameStore((s) => s.money);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const staffCount = useGameStore((s) => s.staff.length);
  const recruit = useGameStore((s) => s.recruitFromGacha);
  const recruitTen = useGameStore((s) => s.recruitFromGachaTen);

  const [phase, setPhase] = useState<Phase>('home');
  const [results, setResults] = useState<GachaResult[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const maxStaff = OFFICE_LEVELS[officeLevel].maxStaff;
  const onePullCost = GACHA_COST;
  const tenPullCost = GACHA_COST * 10;

  // 重置 state（modal 關閉或從 results 重新開）
  const reset = () => {
    setPhase('home');
    setResults([]);
    setRevealed(new Set());
  };

  // 關閉行為
  const handleClose = () => {
    if (phase === 'pulling') return; // 動畫中不關
    reset();
    close();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phase]);

  // 進 pulling phase 後，全部翻開後等用戶按下一步
  const allRevealed = results.length > 0 && revealed.size === results.length;

  const handleOne = () => {
    const r = recruit();
    if (!r) return;
    setResults([r]);
    setRevealed(new Set());
    setPhase('pulling');
  };
  const handleTen = () => {
    const arr = recruitTen();
    if (arr.length === 0) return;
    setResults(arr);
    setRevealed(new Set());
    setPhase('pulling');
  };

  const revealAt = (i: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  };
  const revealAll = () => {
    setRevealed(new Set(results.map((_, i) => i)));
  };
  const goToResults = () => setPhase('results');

  const handleAgain = () => {
    setResults([]);
    setRevealed(new Set());
    setPhase('home');
  };

  if (!open) return null;

  const ceoImage = `${import.meta.env.BASE_URL}assets/dog-profiles/ceo.png`;

  return createPortal(
    <>
      <style>{KEYFRAMES}</style>
      <div
        className="fixed inset-0 z-[860] flex items-center justify-center p-4"
        style={{
          background: 'rgba(8,32,77,0.62)',
          backdropFilter: 'blur(10px) saturate(1.1)',
          WebkitBackdropFilter: 'blur(10px) saturate(1.1)',
          animation: 'gachaBackdropFade 0.25s ease-out',
        }}
        onClick={handleClose}
      >
        <div
          className="bx-stripe relative rounded-2xl flex flex-col w-full overflow-hidden"
          style={{
            maxWidth: 820,
            maxHeight: '92vh',
            background: BA_LIGHT.bg,
            border: `1px solid ${BA_LIGHT.border}`,
            boxShadow: `${BA_LIGHT.glow}, inset 0 0 0 1px rgba(255,255,255,0.55)`,
            animation: 'gachaModalIn 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {phase === 'home' && (
            <HomeView
              money={money}
              staffCount={staffCount}
              maxStaff={maxStaff}
              onePullCost={onePullCost}
              tenPullCost={tenPullCost}
              ceoImage={ceoImage}
              onClose={handleClose}
              onOne={handleOne}
              onTen={handleTen}
            />
          )}
          {phase === 'results' && (
            <ResultsView
              results={results}
              money={money}
              tenPullCost={tenPullCost}
              onePullCost={onePullCost}
              onAgain={handleAgain}
              onClose={handleClose}
            />
          )}
          {phase === 'pulling' && (
            <PullingView
              results={results}
              revealed={revealed}
              onReveal={revealAt}
              onSkip={revealAll}
              onNext={goToResults}
              allRevealed={allRevealed}
            />
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

// ============ Home Phase ============

function HomeView({
  money, staffCount, maxStaff, onePullCost, tenPullCost, ceoImage,
  onClose, onOne, onTen,
}: {
  money: number; staffCount: number; maxStaff: number;
  onePullCost: number; tenPullCost: number; ceoImage: string;
  onClose: () => void; onOne: () => void; onTen: () => void;
}) {
  const canOne = money >= onePullCost;
  const canTen = money >= tenPullCost;

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="關閉"
        className="absolute top-3 right-3 rounded-full font-extrabold flex items-center justify-center"
        style={{
          width: 32, height: 32,
          background: 'rgba(255,255,255,0.9)',
          color: BA_LIGHT.accent,
          border: `1.5px solid ${BA_LIGHT.border}`,
          fontSize: 14,
          zIndex: 5,
        }}
      >
        ✕
      </button>

      {/* Banner */}
      <div
        className="relative flex items-center justify-center"
        style={{
          background: BA_LIGHT.bannerBg,
          height: 280,
          overflow: 'hidden',
        }}
      >
        <div
          className="gacha-sparkle"
          style={{
            position: 'absolute', inset: 0,
            background:
              'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.25) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.18) 0%, transparent 35%)',
            pointerEvents: 'none',
          }}
        />
        <img
          src={ceoImage}
          alt="CEO"
          draggable={false}
          style={{
            height: '85%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.35))',
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 24,
            color: 'white',
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: 2,
            textShadow:
              '0 2px 0 #1a4d99, 0 4px 12px rgba(0,0,0,0.4), 0 0 18px rgba(255,217,90,0.6)',
            zIndex: 3,
          }}
        >
          狗狗招募中！
        </div>
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 24,
            color: 'rgba(255,255,255,0.92)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            zIndex: 3,
          }}
        >
          DogOffice ・ Recruit Banner
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            right: 18,
            color: 'rgba(255,255,255,0.85)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
            zIndex: 3,
          }}
        >
          ★★★ 機率 UP！
        </div>
      </div>

      {/* 資源 chip 條 */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.7)',
          borderBottom: `1px solid ${BA_LIGHT.borderSoft}`,
          backdropFilter: 'blur(4px)',
        }}
      >
        <Chip label="資金" value={`$${money.toLocaleString()}`} />
        <Chip label="員工" value={`${staffCount} / ${maxStaff}`} />
        <div className="ml-auto text-[11px] font-bold" style={{ color: BA_LIGHT.muted }}>
          抽到新狗 → 入隊；重複 → 碎片
        </div>
      </div>

      {/* 按鈕區 */}
      <div className="p-5 flex flex-col gap-3" style={{ flex: 1 }}>
        <button
          type="button"
          disabled={!canOne}
          onClick={onOne}
          className="rounded-2xl py-4 font-extrabold transition-transform"
          style={{
            background: canOne
              ? 'linear-gradient(180deg, #ffffff 0%, #eaf4ff 100%)'
              : '#f4f7fb',
            color: canOne ? BA_LIGHT.accent : '#aab8ce',
            border: `2px solid ${canOne ? BA_LIGHT.border : '#d4dfee'}`,
            boxShadow: canOne ? '0 6px 16px rgba(95,179,255,0.25)' : 'none',
            cursor: canOne ? 'pointer' : 'not-allowed',
            fontSize: 16,
            letterSpacing: 1,
          }}
        >
          招募 1 次　・　${onePullCost}
        </button>
        <button
          type="button"
          disabled={!canTen}
          onClick={onTen}
          className="rounded-2xl py-5 font-extrabold transition-transform"
          style={{
            background: canTen
              ? 'linear-gradient(180deg, #5fb3ff 0%, #2080d6 100%)'
              : '#d4dfee',
            color: canTen ? 'white' : '#7a8aa8',
            border: `2px solid ${canTen ? '#ffd95a' : '#bcc8dd'}`,
            boxShadow: canTen
              ? '0 8px 24px rgba(32,128,214,0.4), 0 0 18px rgba(255,217,90,0.35)'
              : 'none',
            cursor: canTen ? 'pointer' : 'not-allowed',
            fontSize: 18,
            letterSpacing: 1,
            textShadow: canTen ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
          }}
        >
          招募 10 次　・　${tenPullCost}
        </button>
        <div
          className="text-[11px] text-center"
          style={{ color: BA_LIGHT.muted, marginTop: 2 }}
        >
          連抽十發保證 5 張 NEW（含碎片補償）
        </div>
      </div>
    </>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #e8f3ff 100%)',
        border: `1px solid ${BA_LIGHT.borderSoft}`,
        fontSize: 11,
      }}
    >
      <span style={{ color: BA_LIGHT.muted, fontWeight: 700 }}>{label}</span>
      <span style={{ color: BA_LIGHT.text, fontWeight: 900 }}>{value}</span>
    </div>
  );
}

// ============ Pulling Phase ============

function PullingView({
  results, revealed, onReveal, onSkip, onNext, allRevealed,
}: {
  results: GachaResult[]; revealed: Set<number>;
  onReveal: (i: number) => void; onSkip: () => void; onNext: () => void;
  allRevealed: boolean;
}) {
  const isTen = results.length > 1;
  const cardSize = isTen ? 110 : 180;

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{
        background: BA_DARK.bg,
        minHeight: 520,
        padding: '40px 20px',
        animation: 'gachaPhaseIn 0.4s ease-out',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: BA_DARK.centerGlow,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          color: BA_DARK.text,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: 4,
          opacity: allRevealed ? 0 : 1,
          transition: 'opacity 0.3s',
          marginBottom: 24,
          textShadow: '0 0 12px rgba(95,179,255,0.6)',
        }}
      >
        TAP TO REVEAL ・ 點擊卡片揭曉
      </div>

      <div
        className={isTen ? 'grid' : 'flex justify-center'}
        style={
          isTen
            ? {
                gridTemplateColumns: 'repeat(5, auto)',
                gap: 14,
                rowGap: 18,
                zIndex: 2,
              }
            : { zIndex: 2 }
        }
      >
        {results.map((r, i) => (
          <GachaCard
            key={i}
            result={r}
            revealed={revealed.has(i)}
            flyDelay={0.05 * i}
            size={cardSize}
            onReveal={() => onReveal(i)}
          />
        ))}
      </div>

      {/* 全部開啟 skip */}
      {!allRevealed && (
        <button
          type="button"
          onClick={onSkip}
          className="absolute top-4 right-4 rounded-full px-4 py-1.5 font-extrabold"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'white',
            border: '1.5px solid rgba(255,255,255,0.5)',
            fontSize: 12,
            letterSpacing: 1,
            backdropFilter: 'blur(4px)',
          }}
        >
          全部開啟 ▶
        </button>
      )}

      {/* 下一步 */}
      {allRevealed && (
        <button
          type="button"
          onClick={onNext}
          className="rounded-2xl px-8 py-3 font-extrabold"
          style={{
            marginTop: 28,
            background: 'linear-gradient(180deg, #ffd95a 0%, #f0a818 100%)',
            color: '#6a3d05',
            border: '2px solid rgba(255,255,255,0.7)',
            fontSize: 16,
            letterSpacing: 2,
            boxShadow:
              '0 0 24px rgba(255,217,90,0.6), 0 8px 18px rgba(0,0,0,0.3)',
            animation: 'gachaPulse 1.5s ease-in-out infinite',
            zIndex: 2,
          }}
        >
          下一步 ▶
        </button>
      )}
    </div>
  );
}

// ============ Results Phase ============

function ResultsView({
  results, money, tenPullCost, onePullCost, onAgain, onClose,
}: {
  results: GachaResult[]; money: number;
  tenPullCost: number; onePullCost: number;
  onAgain: () => void; onClose: () => void;
}) {
  const summary = useMemo(() => {
    let neu = 0, dup = 0, frags = 0, refunded = 0;
    let topTier = 1;
    results.forEach((r) => {
      if (r.duplicate) dup++; else neu++;
      frags += r.fragmentGained;
      refunded += r.refunded;
      const t = dogStarStyle(r.dog).tier;
      if (t > topTier) topTier = t;
    });
    return { neu, dup, frags, refunded, topTier };
  }, [results]);

  const isTen = results.length > 1;
  const cardSize = isTen ? 110 : 200;

  const canAgainTen = money >= tenPullCost;
  const canAgainOne = money >= onePullCost;
  const canAgain = isTen ? canAgainTen : canAgainOne;

  return (
    <>
      <div
        className="px-5 pt-5 pb-3"
        style={{
          background: BA_LIGHT.bannerBg,
          color: 'white',
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 3,
            textShadow:
              summary.topTier === 3
                ? '0 0 18px rgba(255,217,90,0.7), 0 2px 4px rgba(0,0,0,0.35)'
                : '0 2px 4px rgba(0,0,0,0.35)',
          }}
        >
          招募成功！
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <SummaryChip label="NEW" value={summary.neu} color="#29b98f" />
          <SummaryChip label="重複" value={summary.dup} color="#5fb3ff" />
          {summary.frags > 0 && (
            <SummaryChip label="+碎片" value={summary.frags} color="#c79bff" />
          )}
          {summary.refunded > 0 && (
            <SummaryChip label="+$" value={summary.refunded} color="#ffd95a" />
          )}
        </div>
      </div>

      <div
        className="overflow-y-auto px-5 py-4"
        style={{ flex: 1, minHeight: 0 }}
      >
        <div
          className={isTen ? 'grid' : 'flex justify-center'}
          style={
            isTen
              ? { gridTemplateColumns: 'repeat(5, auto)', gap: 12, rowGap: 16 }
              : {}
          }
        >
          {results.map((r, i) => (
            <GachaCard
              key={i}
              result={r}
              revealed={true}
              flyDelay={0}
              size={cardSize}
              onReveal={() => {}}
            />
          ))}
        </div>
      </div>

      <div
        className="p-4 grid grid-cols-2 gap-3"
        style={{ borderTop: `1px solid ${BA_LIGHT.borderSoft}` }}
      >
        <button
          type="button"
          disabled={!canAgain}
          onClick={onAgain}
          className="rounded-xl py-3 font-extrabold"
          style={{
            background: canAgain ? 'white' : '#f4f7fb',
            color: canAgain ? BA_LIGHT.accent : '#aab8ce',
            border: `2px solid ${canAgain ? BA_LIGHT.border : '#d4dfee'}`,
            cursor: canAgain ? 'pointer' : 'not-allowed',
            fontSize: 14,
          }}
        >
          再抽一次
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl py-3 font-extrabold"
          style={{
            background: 'linear-gradient(180deg, #5fb3ff 0%, #2080d6 100%)',
            color: 'white',
            border: '2px solid rgba(255,217,90,0.6)',
            fontSize: 14,
            boxShadow: '0 6px 14px rgba(32,128,214,0.32)',
          }}
        >
          結束
        </button>
      </div>
    </>
  );
}

function SummaryChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="px-2.5 py-1 rounded-full text-[11px] font-extrabold"
      style={{
        background: 'rgba(255,255,255,0.92)',
        color,
        border: `1.5px solid ${color}`,
      }}
    >
      {label} × {value}
    </div>
  );
}

// ============ Keyframes ============

const KEYFRAMES = `
@keyframes gachaBackdropFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes gachaModalIn {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes gachaPhaseIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes gachaCardFlyIn {
  0% {
    opacity: 0;
    transform: translate(-180%, -120%) rotate(-25deg) scale(0.6);
  }
  60% {
    opacity: 1;
    transform: translate(8%, 4%) rotate(8deg) scale(1.04);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) rotate(0) scale(1);
  }
}
@keyframes gachaPillarRise {
  0% { transform: scaleY(0); opacity: 0; }
  60% { transform: scaleY(1.1); opacity: 1; }
  100% { transform: scaleY(1); opacity: 0.85; }
}
@keyframes gachaPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
.gacha-card-wrap {
  position: relative;
  display: inline-block;
  perspective: 1000px;
  animation: gachaCardFlyIn 0.55s cubic-bezier(0.2, 0.7, 0.3, 1.05) backwards;
}
.gacha-pillar {
  position: absolute;
  left: 50%;
  bottom: -10%;
  width: 70%;
  height: 240%;
  transform: translateX(-50%) scaleY(1);
  transform-origin: bottom center;
  filter: blur(2px);
  animation: gachaPillarRise 0.6s cubic-bezier(0.3, 0.8, 0.2, 1) forwards;
  pointer-events: none;
  z-index: 0;
}
.gacha-card {
  position: relative;
  background: transparent;
  border: 0;
  padding: 0;
  border-radius: 12px;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.4, 0.05, 0.3, 1);
  z-index: 1;
}
.gacha-card.revealed {
  transform: rotateY(180deg);
}
.gacha-card-face {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.gacha-card-front {
  transform: rotateY(180deg);
  padding: 0;
}
`;
