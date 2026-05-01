import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DOG_ROSTER } from '@/constants/dogRoster';
import { useGameStore, GACHA_COST, type GachaResult } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { GachaCard } from './GachaCard';

type Phase = 'home' | 'pulling' | 'results';

const GRADE_LABEL: Record<string, string> = {
  U: 'CEO 彩蛋',
  S: 'S 級',
  A: 'A 級',
  B: 'B 級',
  C: 'C 級',
  D: 'D 級',
};

const GRADE_ORDER = ['U', 'S', 'A', 'B', 'C', 'D'];

export function GachaModal() {
  const open = useUiStore((s) => s.recruitModalOpen);
  const close = useUiStore((s) => s.closeRecruitModal);
  const money = useGameStore((s) => s.money);
  const recruit = useGameStore((s) => s.recruitFromGacha);
  const recruitTen = useGameStore((s) => s.recruitFromGachaTen);

  const [phase, setPhase] = useState<Phase>('home');
  const [results, setResults] = useState<GachaResult[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [ratesOpen, setRatesOpen] = useState(false);

  const onePullCost = GACHA_COST;
  const tenPullCost = GACHA_COST * 10;

  const reset = () => {
    setPhase('home');
    setResults([]);
    setRevealed(new Set());
    setRatesOpen(false);
  };

  const handleClose = () => {
    if (phase === 'pulling') return;
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

  if (!open) return null;

  return createPortal(
    <>
      <style>{KEYFRAMES}</style>
      <div
        className="fixed inset-0 z-[860] flex items-center justify-center p-3"
        style={{ background: 'rgba(8,20,45,0.58)', backdropFilter: 'blur(8px)' }}
        onClick={handleClose}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{
            maxWidth: phase === 'home' ? 520 : 760,
            maxHeight: '92vh',
            borderRadius: 10,
            background: '#101827',
            boxShadow: '0 24px 80px rgba(0,0,0,0.42)',
            animation: 'gachaModalIn 0.24s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {phase === 'home' && (
            <HomeView
              money={money}
              onePullCost={onePullCost}
              tenPullCost={tenPullCost}
              ratesOpen={ratesOpen}
              onToggleRates={() => setRatesOpen((v) => !v)}
              onClose={handleClose}
              onOne={handleOne}
              onTen={handleTen}
            />
          )}
          {phase === 'pulling' && (
            <PullingView
              results={results}
              revealed={revealed}
              allRevealed={allRevealed}
              onReveal={(i) => setRevealed((prev) => new Set(prev).add(i))}
              onRevealAll={() => setRevealed(new Set(results.map((_, i) => i)))}
              onNext={() => setPhase('results')}
            />
          )}
          {phase === 'results' && (
            <ResultsView
              results={results}
              money={money}
              onePullCost={onePullCost}
              tenPullCost={tenPullCost}
              onAgain={() => {
                if (results.length > 1) handleTen();
                else handleOne();
              }}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

function HomeView({
  money,
  onePullCost,
  tenPullCost,
  ratesOpen,
  onToggleRates,
  onClose,
  onOne,
  onTen,
}: {
  money: number;
  onePullCost: number;
  tenPullCost: number;
  ratesOpen: boolean;
  onToggleRates: () => void;
  onClose: () => void;
  onOne: () => void;
  onTen: () => void;
}) {
  const canOne = money >= onePullCost;
  const canTen = money >= tenPullCost;
  const rates = useMemo(() => makeRateRows(), []);
  const bannerImage = `${import.meta.env.BASE_URL}assets/start-screen.png`;

  return (
    <div className="relative text-white">
      <button
        type="button"
        aria-label="關閉"
        onClick={onClose}
        className="absolute top-2 right-2 z-20 grid place-items-center"
        style={{
          width: 30,
          height: 30,
          borderRadius: 6,
          background: 'rgba(0,0,0,0.36)',
          border: '1px solid rgba(255,255,255,0.28)',
          fontWeight: 900,
        }}
      >
        X
      </button>

      <section
        className="relative"
        style={{
          height: 372,
          backgroundImage: `linear-gradient(180deg, rgba(4,7,14,0.08), rgba(4,7,14,0.78)), url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-y-0 left-0 flex items-center px-2 text-5xl font-black" style={{ color: 'rgba(255,255,255,0.82)', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
          &laquo;
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 text-5xl font-black" style={{ color: 'rgba(255,255,255,0.82)', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
          &raquo;
        </div>

        <div className="absolute left-7 flex items-center gap-2" style={{ bottom: 116 }}>
          <button type="button" onClick={onToggleRates} className="px-3 py-1.5 text-sm font-black" style={infoButtonStyle}>
            機率情報
          </button>
        </div>

        <div
          className="absolute left-0 right-0 py-4 text-center"
          style={{
            bottom: 18,
            background: 'linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.54), rgba(0,0,0,0))',
          }}
        >
          <div className="text-3xl font-black tracking-wide" style={{ textShadow: '0 3px 10px rgba(0,0,0,0.52)' }}>
            普通招募
          </div>
          <div className="mt-1 text-xs font-bold" style={{ color: 'rgba(255,255,255,0.78)' }}>
            目前資金 ${money.toLocaleString()}
          </div>
        </div>

        {ratesOpen && <RatePanel rows={rates} />}
      </section>

      <div className="grid grid-cols-2 gap-4 p-4" style={{ background: 'linear-gradient(180deg, rgba(9,14,24,0.9), #101827)' }}>
        <RecruitButton label="招募1名" cost={onePullCost} disabled={!canOne} variant="light" onClick={onOne} />
        <RecruitButton label="招募10名" cost={tenPullCost} disabled={!canTen} variant="blue" onClick={onTen} />
      </div>
    </div>
  );
}

const infoButtonStyle = {
  borderRadius: 4,
  background: 'linear-gradient(180deg, rgba(25,30,42,0.92), rgba(12,17,27,0.92))',
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 2px 10px rgba(0,0,0,0.24)',
  color: '#ffffff',
} as const;

function RecruitButton({
  label,
  cost,
  disabled,
  variant,
  onClick,
}: {
  label: string;
  cost: number;
  disabled: boolean;
  variant: 'light' | 'blue';
  onClick: () => void;
}) {
  const blue = variant === 'blue';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-between gap-2 px-4 font-black"
      style={{
        height: 58,
        borderRadius: 6,
        background: blue ? 'linear-gradient(180deg, #2fc8ff, #0799dc)' : 'linear-gradient(180deg, #ffffff, #edf2f8)',
        color: blue ? '#ffffff' : '#353b46',
        border: blue ? '2px solid #86e9ff' : '1px solid rgba(255,255,255,0.9)',
        boxShadow: blue ? 'inset 0 0 0 1px rgba(255,255,255,0.45), 0 3px 12px rgba(17,166,224,0.36)' : '0 3px 12px rgba(0,0,0,0.22)',
        opacity: disabled ? 0.52 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 18,
      }}
    >
      <span>{label}</span>
      <span className="flex items-center gap-2 px-2.5 py-1" style={{
        borderRadius: 999,
        background: blue ? 'rgba(0,0,0,0.42)' : '#30343d',
        color: 'white',
        fontSize: 13,
        minWidth: 78,
        justifyContent: 'center',
      }} title={`費用 $${cost}`}>
        <span>$</span>
        <span>{cost.toLocaleString()}</span>
      </span>
    </button>
  );
}

function RatePanel({ rows }: { rows: { grade: string; count: number; percent: string }[] }) {
  return (
    <div className="absolute left-7 right-7 z-10 p-3" style={{
      bottom: 150,
      borderRadius: 6,
      background: 'rgba(14,19,30,0.88)',
      border: '1px solid rgba(255,255,255,0.26)',
      boxShadow: '0 12px 28px rgba(0,0,0,0.34)',
    }}>
      <div className="mb-2 text-sm font-black">招募機率表</div>
      <div className="grid gap-1.5">
        {rows.map((row) => (
          <div key={row.grade} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-xs">
            <span style={{ color: row.grade === 'U' || row.grade === 'S' ? '#ffd76b' : 'rgba(255,255,255,0.9)' }}>
              {GRADE_LABEL[row.grade] ?? row.grade}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.62)' }}>{row.count} 名</span>
            <span className="font-black">{row.percent}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PullingView({
  results,
  revealed,
  allRevealed,
  onReveal,
  onRevealAll,
  onNext,
}: {
  results: GachaResult[];
  revealed: Set<number>;
  allRevealed: boolean;
  onReveal: (index: number) => void;
  onRevealAll: () => void;
  onNext: () => void;
}) {
  const isTen = results.length > 1;
  const cardSize = isTen ? 106 : 180;

  return (
    <div className="relative flex flex-col items-center justify-center p-6" style={{ minHeight: 520, background: 'radial-gradient(circle at 50% 45%, #264f9e, #08142d 70%)' }}>
      {!allRevealed && (
        <button type="button" onClick={onRevealAll} className="absolute right-4 top-4 rounded-md px-3 py-1.5 text-xs font-black" style={{ color: 'white', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.35)' }}>
          全部揭曉
        </button>
      )}
      <div className="mb-5 text-sm font-black tracking-[0.24em] text-white">TAP TO REVEAL</div>
      <div className={isTen ? 'grid' : 'flex'} style={isTen ? { gridTemplateColumns: 'repeat(5, auto)', gap: 12, rowGap: 16 } : undefined}>
        {results.map((result, index) => (
          <GachaCard key={index} result={result} revealed={revealed.has(index)} flyDelay={0.04 * index} size={cardSize} onReveal={() => onReveal(index)} />
        ))}
      </div>
      {allRevealed && (
        <button type="button" onClick={onNext} className="mt-7 rounded-lg px-8 py-3 font-black" style={{ color: '#523400', background: 'linear-gradient(180deg, #ffe58a, #f0aa22)', boxShadow: '0 8px 22px rgba(0,0,0,0.28)' }}>
          查看結果
        </button>
      )}
    </div>
  );
}

function ResultsView({
  results,
  money,
  onePullCost,
  tenPullCost,
  onAgain,
  onClose,
}: {
  results: GachaResult[];
  money: number;
  onePullCost: number;
  tenPullCost: number;
  onAgain: () => void;
  onClose: () => void;
}) {
  const isTen = results.length > 1;
  const cardSize = isTen ? 82 : 150;
  const canAgain = money >= (isTen ? tenPullCost : onePullCost);

  return (
    <div
      className="relative flex max-h-[92vh] flex-col"
      style={{
        minHeight: 620,
        background:
          'radial-gradient(circle at 54% 18%, rgba(229,236,246,0.95), rgba(255,255,255,0) 32%), linear-gradient(180deg, #edf2f7, #f8fbff)',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute right-12 top-5 h-20 w-28 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #8da3ba 1px, transparent 1px)',
          backgroundSize: '8px 8px',
        }}
      />
      <div className="relative flex-1 overflow-y-auto px-6 pb-4 pt-9">
        <div
          className={isTen ? 'grid justify-center' : 'flex justify-center'}
          style={isTen ? { gridTemplateColumns: 'repeat(5, auto)', gap: 10, rowGap: 14 } : undefined}
        >
          {results.map((result, index) => (
            <GachaCard key={index} result={result} revealed flyDelay={0} size={cardSize} onReveal={() => {}} />
          ))}
        </div>
      </div>
      <div className="relative grid grid-cols-2 gap-4 px-14 pb-7 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="py-2.5 font-black text-white"
          style={{
            borderRadius: 2,
            background: 'linear-gradient(180deg, #272727, #141414)',
            boxShadow: '0 3px 10px rgba(0,0,0,0.24)',
            color: '#ffffff',
          }}
        >
          確認
        </button>
        <button
          type="button"
          disabled={!canAgain}
          onClick={onAgain}
          className="py-2.5 font-black text-white"
          style={{
            borderRadius: 2,
            background: 'linear-gradient(180deg, #27c8ff, #0797d5)',
            boxShadow: '0 3px 12px rgba(0,154,216,0.34)',
            opacity: canAgain ? 1 : 0.52,
            cursor: canAgain ? 'pointer' : 'not-allowed',
          }}
        >
          再招募
          <span
            className="mx-auto mt-1 flex w-fit items-center gap-1 px-2 text-[10px]"
            style={{ borderRadius: 999, background: 'rgba(0,0,0,0.28)' }}
          >
            <span>$</span>
            <span>{(isTen ? tenPullCost : onePullCost).toLocaleString()}</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function makeRateRows() {
  const total = DOG_ROSTER.length || 1;
  return GRADE_ORDER.map((grade) => {
    const count = DOG_ROSTER.filter((dog) => dog.grade === grade).length;
    return { grade, count, percent: `${((count / total) * 100).toFixed(1)}%` };
  }).filter((row) => row.count > 0);
}

const KEYFRAMES = `
@keyframes gachaModalIn {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.gacha-card-wrap {
  position: relative;
  display: inline-block;
  perspective: 1000px;
  animation: gachaCardFlyIn 0.48s cubic-bezier(0.2, 0.7, 0.3, 1.05) backwards;
}
@keyframes gachaCardFlyIn {
  0% { opacity: 0; transform: translate(-120%, -90%) rotate(-18deg) scale(0.72); }
  70% { opacity: 1; transform: translate(5%, 2%) rotate(5deg) scale(1.03); }
  100% { opacity: 1; transform: translate(0, 0) rotate(0) scale(1); }
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
@keyframes gachaPillarRise {
  0% { transform: translateX(-50%) scaleY(0); opacity: 0; }
  60% { transform: translateX(-50%) scaleY(1.1); opacity: 1; }
  100% { transform: translateX(-50%) scaleY(1); opacity: 0.85; }
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
.gacha-card.revealed { transform: rotateY(180deg); }
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
