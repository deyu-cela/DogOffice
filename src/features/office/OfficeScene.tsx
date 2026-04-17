import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useWalkerStore } from '@/store/walkerStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { Badge } from '@/components/Panel';
import { WalkingDogs } from './WalkingDogs';
import { companyHint, companyStage } from '@/lib/utils';

export function OfficeScene() {
  const officeLevel = useGameStore((s) => s.officeLevel);
  const staff = useGameStore((s) => s.staff);
  const decor = useGameStore((s) => s.decor);
  const money = useGameStore((s) => s.money);
  const morale = useGameStore((s) => s.morale);
  const health = useGameStore((s) => s.health);
  const current = useGameStore((s) => s.current);
  const candidatePatience = useGameStore((s) => s.candidatePatience);
  const vacancy = useGameStore((s) => s.vacancy);
  const setBounds = useWalkerStore((s) => s.setBounds);
  const syncWalkers = useWalkerStore((s) => s.syncWithStaff);
  const roomRef = useRef<HTMLDivElement>(null);

  const level = OFFICE_LEVELS[officeLevel];
  const stage = companyStage(health, morale, staff.length, decor);
  const hint = companyHint(money, health, morale);

  useEffect(() => {
    const el = roomRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setBounds({ w: rect.width, h: rect.height, floorTop: rect.height * 0.55 });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [setBounds]);

  useEffect(() => {
    syncWalkers(staff);
  }, [staff, syncWalkers]);

  const candidateBubble = current
    ? candidatePatience <= 1
      ? `${current.name}：我快走了...`
      : candidatePatience === 2
        ? `${current.name}：還在考慮嗎？`
        : `${current.name} 來面試！`
    : vacancy
      ? '今天沒有人來...'
      : '等待下一位...';

  return (
    <div
      className="relative overflow-hidden rounded-3xl flex flex-col min-h-[400px] md:min-h-[600px] xl:min-h-[700px]"
      style={{
        border: '2px solid rgba(90,70,54,0.12)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 gap-2"
        style={{ borderBottom: '1px solid rgba(90,70,54,0.1)' }}
      >
        <div>
          <div className="font-extrabold text-lg">🏢 {level.name}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            員工 {staff.length} / {level.maxStaff}・裝飾 Lv {decor}
          </div>
        </div>
        <Badge>{stage}</Badge>
      </div>

      <div ref={roomRef} className="relative flex-1 min-h-[340px] md:min-h-[480px]">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${level.wall}, #fff9f1 62%, #ffe6d5 100%)`,
          }}
        />
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{
            top: '55%',
            background:
              health < 40
                ? 'linear-gradient(180deg, #d7c1ac, #bfa082)'
                : `linear-gradient(180deg, ${level.floor}, #d9ba94)`,
            borderTop: '3px solid rgba(90,70,54,0.08)',
          }}
        />
        <DecoLayer level={level} decor={decor} />

        {/* Door */}
        <div
          className="absolute flex flex-col items-center"
          style={{ right: 20, bottom: 12 }}
        >
          <div
            className="rounded-t-2xl"
            style={{
              width: 56,
              height: 92,
              background: 'linear-gradient(180deg, #8b5a3c, #5d3a24)',
              border: '3px solid #4a2d1a',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
            }}
          />
          <div className="text-[10px] mt-0.5 font-bold" style={{ color: 'var(--muted)' }}>
            🚪 入口
          </div>
        </div>

        {/* Candidate at door bubble */}
        <div className="absolute flex flex-col items-center" style={{ right: 90, bottom: 12 }}>
          <div
            className="text-xs px-2.5 py-1 rounded-xl mb-1 whitespace-nowrap"
            style={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(90,70,54,0.15)',
              opacity: current ? 1 : 0.6,
            }}
          >
            {candidateBubble}
          </div>
          <div className="text-4xl" style={{ opacity: current ? 1 : 0.55 }}>
            {current ? current.emoji : '🚪'}
          </div>
        </div>

        {/* Walkers */}
        <WalkingDogs />

        {/* Banner (bottom hint) */}
        <div
          className="absolute left-3 bottom-3 text-xs px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(90,70,54,0.12)',
            color: 'var(--muted)',
            maxWidth: '60%',
          }}
        >
          {hint}
        </div>
      </div>
    </div>
  );
}

function DecoLayer({ level, decor }: { level: (typeof OFFICE_LEVELS)[number]; decor: number }) {
  const items: React.ReactNode[] = [];
  for (let i = 0; i < level.desks; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    items.push(
      <div
        key={`desk-${i}`}
        className="absolute rounded-lg"
        style={{
          left: 100 + col * 140 + (row % 2) * 60,
          top: `calc(55% + ${34 + row * 62}px)`,
          width: 56,
          height: 26,
          background: '#c49a6c',
          border: '2px solid #8a6848',
          boxShadow: '0 3px 6px rgba(0,0,0,0.12)',
        }}
      />,
    );
  }
  for (let i = 0; i < level.plants + decor; i++) {
    items.push(
      <div
        key={`plant-${i}`}
        className="absolute"
        style={{ left: 80 + ((i * 128) % 420), top: `calc(55% - 18px + ${(i % 2) * 8}px)`, fontSize: 26 }}
      >
        🪴
      </div>,
    );
  }
  for (let i = 0; i < level.coffee; i++) {
    items.push(
      <div key={`coffee-${i}`} className="absolute" style={{ left: 180 + i * 160, top: `calc(55% + ${8 + (i % 2) * 44}px)`, fontSize: 24 }}>
        ☕
      </div>,
    );
  }
  for (let i = 0; i < level.lounge; i++) {
    items.push(
      <div key={`lounge-${i}`} className="absolute" style={{ left: 36 + i * 72, top: `calc(55% + ${32 + i * 14}px)`, fontSize: 30 }}>
        🛋️
      </div>,
    );
  }
  for (let i = 0; i < level.windows; i++) {
    items.push(
      <div
        key={`win-${i}`}
        className="absolute rounded-md"
        style={{
          left: 120 + i * 140,
          top: 24,
          width: 100,
          height: 60,
          background: 'linear-gradient(180deg, #cce7ff, #eaf4ff)',
          border: '3px solid #8a6848',
        }}
      />,
    );
  }
  for (let i = 0; i < level.shelves; i++) {
    items.push(
      <div key={`shelf-${i}`} className="absolute" style={{ right: 30 + i * 60, top: 100 + i * 40, fontSize: 22 }}>
        📚
      </div>,
    );
  }
  for (let i = 0; i < level.lights; i++) {
    items.push(
      <div key={`light-${i}`} className="absolute" style={{ left: 90 + i * 150, top: 18, fontSize: 24 }}>
        💡
      </div>,
    );
  }
  items.push(
    <div key="cloud" className="absolute" style={{ right: 26, top: 26, fontSize: 28 }}>
      ☁️
    </div>,
  );

  return <>{items}</>;
}
