import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DOG_ROSTER } from '@/constants/dogRoster';
import { useGameStore, GACHA_COST, type GachaResult } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { GachaCard } from './GachaCard';
import './recruit.css';

type Phase = 'home' | 'pulling';

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
        className="recruit-scrapbook-backdrop fixed inset-0 z-[860] flex items-center justify-center p-3"
        onClick={handleClose}
      >
        <div
          className="recruit-scrapbook-modal relative w-full overflow-hidden"
          style={{
            maxWidth: phase === 'home' ? 520 : 760,
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
              money={money}
              onePullCost={onePullCost}
              tenPullCost={tenPullCost}
              onReveal={(i) => setRevealed((prev) => new Set(prev).add(i))}
              onRevealAll={() => setRevealed(new Set(results.map((_, i) => i)))}
              onAgain={() => {
                if (results.length > 1) handleTen();
                else handleOne();
              }}
              onConfirm={() => {
                setPhase('home');
                setResults([]);
                setRevealed(new Set());
              }}
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
  const bannerImage = `${import.meta.env.BASE_URL}assets/gacha.png`;

  return (
    <div className="recruit-home relative">
      <button
        type="button"
        aria-label="關閉"
        onClick={onClose}
        className="recruit-close-btn absolute top-2 right-2 z-20 grid place-items-center"
        style={{
          width: 30,
          height: 30,
        }}
      >
        X
      </button>

      <section className="recruit-banner">
        <img src={bannerImage} alt="" className="recruit-banner-img" draggable={false} />

        <div className="absolute left-7 z-10 flex items-center gap-2" style={{ bottom: 180 }}>
          <button type="button" onClick={onToggleRates} className="recruit-soft-btn px-3 py-1.5 text-sm">
            機率情報
          </button>
        </div>

        <div
          className="recruit-banner-caption text-center"
          style={{ bottom: 96 }}
        >
          <div className="text-3xl font-black tracking-wide" style={{ color: '#5b382d' }}>
            普通招募
          </div>
          <div className="recruit-money-chip mx-auto mt-1 w-fit px-3 py-1 text-xs font-bold">
            目前資金 ${money.toLocaleString()}
          </div>
        </div>

        {ratesOpen && <RatePanel rows={rates} />}

        <div className="recruit-actions absolute left-4 right-4 bottom-4 z-10 grid grid-cols-2 gap-4">
          <RecruitButton label="招募 1 次" cost={onePullCost} disabled={!canOne} variant="secondary" onClick={onOne} />
          <RecruitButton label="招募 10 次" cost={tenPullCost} disabled={!canTen} variant="primary" onClick={onTen} />
        </div>
      </section>
    </div>
  );
}

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
  variant: 'secondary' | 'primary';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="recruit-pull-btn flex items-center justify-between gap-2 px-4 font-black"
      data-variant={variant}
      style={{
        opacity: disabled ? 0.52 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 18,
      }}
    >
      <span>{label}</span>
      <span className="recruit-cost-chip flex items-center gap-2 px-2.5 py-1" style={{
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
    <div className="recruit-rate-panel absolute left-7 right-7 z-10 p-3" style={{
      bottom: 220,
    }}>
      <div className="mb-2 text-sm font-black">招募機率表</div>
      <div className="grid gap-1.5">
        {rows.map((row) => (
          <div key={row.grade} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-xs">
            <span style={{ color: row.grade === 'U' || row.grade === 'S' ? '#b97428' : '#6e4638' }}>
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
  money,
  onePullCost,
  tenPullCost,
  onReveal,
  onRevealAll,
  onAgain,
  onConfirm,
}: {
  results: GachaResult[];
  revealed: Set<number>;
  allRevealed: boolean;
  money: number;
  onePullCost: number;
  tenPullCost: number;
  onReveal: (index: number) => void;
  onRevealAll: () => void;
  onAgain: () => void;
  onConfirm: () => void;
}) {
  const isTen = results.length > 1;
  const cardSize = isTen ? 106 : 180;
  const canAgain = money >= (isTen ? tenPullCost : onePullCost);

  return (
    <div className="recruit-result-stage relative flex flex-col items-center justify-center p-6">
      {!allRevealed && (
        <button type="button" onClick={onRevealAll} className="recruit-soft-btn absolute right-4 bottom-4 px-3 py-1.5 text-xs">
          全部揭曉
        </button>
      )}
      <div className="mb-5 text-sm font-black tracking-[0.24em]" style={{ color: '#886153' }}>TAP TO REVEAL</div>
      <div className={isTen ? 'grid' : 'flex'} style={isTen ? { gridTemplateColumns: 'repeat(5, auto)', gap: 12, rowGap: 16 } : undefined}>
        {results.map((result, index) => (
          <GachaCard key={index} result={result} revealed={revealed.has(index)} flyDelay={0.04 * index} size={cardSize} onReveal={() => onReveal(index)} />
        ))}
      </div>
      {allRevealed && (
        <div className="mt-7 grid w-full max-w-md grid-cols-2 gap-4 px-14">
          <button
            type="button"
            onClick={onConfirm}
            className="recruit-confirm-btn py-2.5"
          >
            確認
          </button>
          <button
            type="button"
            disabled={!canAgain}
            onClick={onAgain}
            className="recruit-again-btn py-2.5"
            style={{
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
      )}
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
