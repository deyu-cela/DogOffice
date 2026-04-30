import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore, GACHA_COST, dogPrimaryIndustry, type GachaResult } from '@/store/gameStore';
import { DogAvatar } from '@/components/DogAvatar';
import { RadarChart } from '@/components/RadarChart';
import type { Dog, ProjectCategory } from '@/types';

const INDUSTRY_LABEL: Record<ProjectCategory, string> = {
  tech: '工程',
  design: '美術',
  marketing: '行銷',
  service: '客服',
};

const INDUSTRY_COLOR: Record<ProjectCategory, string> = {
  tech: '#5a8ce6',
  design: '#e88aaa',
  marketing: '#e8a85a',
  service: '#5fb38f',
};

type Machine = {
  id: string;
  name: string;
  description: string;
  costPerPull: number;
  flavor: string;
};

const MACHINES: Machine[] = [
  {
    id: 'aoaooo',
    name: '嗷嗷嗷嗷',
    description: '基本抽卡台',
    costPerPull: GACHA_COST,
    flavor: '隨機抽，全圖鑑均勻分布',
  },
];

export function GachaModal({ onClose }: { onClose: () => void }) {
  const money = useGameStore((s) => s.money);
  const recruit = useGameStore((s) => s.recruitFromGacha);
  const recruitTen = useGameStore((s) => s.recruitFromGachaTen);

  const [machineId, setMachineId] = useState<string>(MACHINES[0].id);
  const [results, setResults] = useState<GachaResult[]>([]);

  const machine = MACHINES.find((m) => m.id === machineId) ?? MACHINES[0];
  const onePullCost = machine.costPerPull;
  const tenPullCost = machine.costPerPull * 10;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleOne = () => {
    const r = recruit();
    if (r) setResults([r]);
  };
  const handleTen = () => {
    const arr = recruitTen();
    if (arr.length > 0) setResults(arr);
  };

  const modal = (
    <div
      className="fixed inset-0 z-[860] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,32,77,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl flex flex-col w-full"
        style={{
          maxWidth: 780,
          maxHeight: '92vh',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(241,247,255,0.96))',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 70px rgba(30,90,180,0.32)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Machine selector tabs */}
        <div className="p-3 flex items-center gap-2 flex-wrap" style={{ borderBottom: '1px solid var(--line)' }}>
          {MACHINES.map((m) => {
            const active = m.id === machineId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMachineId(m.id)}
                className="text-sm px-3 py-1.5 rounded-lg font-extrabold"
                style={{
                  background: active ? 'linear-gradient(180deg, #ffd95a, #f0a818)' : '#ffffff',
                  color: active ? '#6a3d05' : '#446da8',
                  border: active ? '1.5px solid rgba(176,107,15,0.5)' : '1.5px solid var(--line)',
                  boxShadow: active ? '0 4px 12px rgba(240,168,24,0.35)' : 'none',
                }}
              >
                {m.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-sm px-2.5 py-1 rounded-full"
            style={{ background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--line)' }}
          >
            X
          </button>
        </div>

        {/* Machine info banner */}
        <div className="px-4 py-3" style={{ background: 'linear-gradient(180deg, #fff7e0, #ffe9b8)', borderBottom: '1px solid #e0c280' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xl font-extrabold" style={{ color: '#6a3d05' }}>{machine.name}</div>
              <div className="text-[11px] mt-0.5" style={{ color: '#8a5e1c' }}>{machine.flavor}</div>
            </div>
            <div className="text-[11px] text-right" style={{ color: '#8a5e1c' }}>
              <div>單抽 ${onePullCost}</div>
              <div>十抽 ${tenPullCost}</div>
            </div>
          </div>
        </div>

        {/* Results / placeholder */}
        <div className="flex-1 overflow-y-auto px-4 py-3" style={{ minHeight: 200 }}>
          {results.length === 0 ? (
            <div
              className="rounded-xl py-12 text-center"
              style={{ background: '#f7fbff', border: '1px dashed var(--line)', color: 'var(--muted)' }}
            >
              <div className="text-3xl mb-1">🎲</div>
              <div className="text-sm font-bold">按下方按鈕開始抽卡</div>
            </div>
          ) : results.length === 1 ? (
            <ResultBig result={results[0]} />
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {results.map((r, i) => <ResultSmall key={i} result={r} />)}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="p-4" style={{ borderTop: '1px solid var(--line)' }}>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleOne}
              disabled={money < onePullCost}
              className="rounded-xl py-3 font-extrabold"
              style={{
                background: money >= onePullCost ? 'linear-gradient(180deg, #ffd95a, #f0a818)' : '#e9f1ff',
                color: money >= onePullCost ? '#6a3d05' : '#8aa2c8',
                border: '1px solid rgba(176,107,15,0.45)',
                cursor: money >= onePullCost ? 'pointer' : 'not-allowed',
              }}
            >
              一抽 ${onePullCost}
            </button>
            <button
              type="button"
              onClick={handleTen}
              disabled={money < tenPullCost}
              className="rounded-xl py-3 font-extrabold"
              style={{
                background: money >= tenPullCost ? 'linear-gradient(180deg, #ff9f4d, #e8632a)' : '#e9f1ff',
                color: money >= tenPullCost ? 'white' : '#8aa2c8',
                border: '1px solid rgba(232,99,42,0.5)',
                boxShadow: money >= tenPullCost ? '0 8px 18px rgba(232,99,42,0.32)' : 'none',
                cursor: money >= tenPullCost ? 'pointer' : 'not-allowed',
              }}
            >
              連抽十發 ${tenPullCost}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function ResultBig({ result }: { result: GachaResult }) {
  const dog = result.dog;
  const industry = dogPrimaryIndustry(dog.role);
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'linear-gradient(180deg, #ffffff, #f4f9ff)',
        border: `2px solid ${INDUSTRY_COLOR[industry]}`,
        boxShadow: '0 12px 28px rgba(46,104,180,0.18)',
      }}
    >
      {result.duplicate && (
        <DupRibbon result={result} />
      )}
      <div className="flex items-center gap-3">
        <DogPortrait dog={dog} size={64} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-base">{dog.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'linear-gradient(180deg, #ffd95a, #f0a818)', color: '#6a3d05', border: '1px solid rgba(176,107,15,0.4)' }}>
              Lv.{dog.level}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: INDUSTRY_COLOR[industry], color: 'white' }}>
              {INDUSTRY_LABEL[industry]}
            </span>
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            {dog.breed}・{dog.role}・日薪 ${dog.expectedSalary}
          </div>
          {dog.motto && (
            <div className="text-[11px] mt-1 italic" style={{ color: '#7c95bc' }}>「{dog.motto}」</div>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center">
        <RadarChart stats={dog.stats} size={140} />
      </div>
    </div>
  );
}

function ResultSmall({ result }: { result: GachaResult }) {
  const dog = result.dog;
  const industry = dogPrimaryIndustry(dog.role);
  const color = INDUSTRY_COLOR[industry];
  const isDup = result.duplicate;
  return (
    <div
      className="rounded-lg p-2 flex flex-col items-center gap-1"
      style={{
        background: '#ffffff',
        border: isDup ? '1.5px solid #6da8e8' : `1.5px solid ${color}`,
        boxShadow: '0 4px 10px rgba(46,104,180,0.1)',
      }}
    >
      <DogPortrait dog={dog} size={40} />
      <div className="text-[11px] font-extrabold leading-none truncate w-full text-center" style={{ color: '#173b78' }}>
        {dog.name}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[9px] px-1 rounded-sm" style={{ background: 'linear-gradient(180deg, #ffd95a, #f0a818)', color: '#6a3d05' }}>Lv{dog.level}</span>
        <span className="text-[9px] px-1 rounded-sm" style={{ background: color, color: 'white' }}>{INDUSTRY_LABEL[industry]}</span>
      </div>
      <div className="text-[9px] font-bold" style={{ color: isDup ? '#1c4f8a' : '#5a8a6a' }}>
        {isDup
          ? result.fragmentGained > 0
            ? `+${result.fragmentGained} 碎片`
            : `+$${result.refunded}`
          : 'NEW'}
      </div>
    </div>
  );
}

function DupRibbon({ result }: { result: GachaResult }) {
  const showFragments = result.fragmentGained > 0;
  return (
    <div
      className="text-[11px] text-center px-2 py-1 mb-2 rounded-full font-extrabold"
      style={{
        background: showFragments ? 'linear-gradient(180deg, #c9e4ff, #87c0ff)' : '#fff7e0',
        color: showFragments ? '#1c4f8a' : '#a36a3a',
        border: showFragments ? '1px solid #5fa0e8' : '1px solid #e0c280',
      }}
    >
      {showFragments
        ? `✦ 圖鑑重複 → +${result.fragmentGained} 碎片（共 ${result.dog.fragments} 個）`
        : `✦ Lv.10 重複 → 碎片轉成 $${result.refunded}`}
    </div>
  );
}

function DogPortrait({ dog, size }: { dog: Dog; size: number }) {
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size, border: '2px solid white', background: '#eef6ff' }}
    >
      {dog.image ? (
        <img src={dog.image} alt={dog.name} className="block h-full w-full object-contain" draggable={false} />
      ) : (
        <DogAvatar role={dog.role} breed={dog.breed} size={size} />
      )}
    </div>
  );
}
