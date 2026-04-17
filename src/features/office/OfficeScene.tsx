import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useWalkerStore } from '@/store/walkerStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { Badge } from '@/components/Panel';
import { WalkingDogs } from './WalkingDogs';

export function OfficeScene() {
  const officeLevel = useGameStore((s) => s.officeLevel);
  const staff = useGameStore((s) => s.staff);
  const decor = useGameStore((s) => s.decor);
  const upgradeOffice = useGameStore((s) => s.upgradeOffice);
  const money = useGameStore((s) => s.money);
  const setBounds = useWalkerStore((s) => s.setBounds);
  const syncWalkers = useWalkerStore((s) => s.syncWithStaff);
  const roomRef = useRef<HTMLDivElement>(null);

  const level = OFFICE_LEVELS[officeLevel];
  const nextLevel = OFFICE_LEVELS[officeLevel + 1];

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

  return (
    <div
      className="relative overflow-hidden rounded-3xl flex flex-col min-h-[400px] md:min-h-[600px] xl:min-h-[700px]"
      style={{
        border: '2px solid rgba(90,70,54,0.12)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(90,70,54,0.1)' }}>
        <div>
          <div className="font-extrabold text-lg">🏢 {level.name}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            員工 {staff.length} / {level.maxStaff}・裝飾 Lv {decor}
          </div>
        </div>
        {nextLevel && (
          <button
            disabled={money < nextLevel.upgradeCost}
            onClick={upgradeOffice}
            className="text-sm"
            style={{ background: 'linear-gradient(180deg, #ffe6a5, #ffcf73)' }}
          >
            升級 ${nextLevel.upgradeCost}
          </button>
        )}
      </div>

      <div ref={roomRef} className="relative flex-1 min-h-[340px] md:min-h-[480px]">
        <div className="absolute inset-0" style={{ background: level.wall }} />
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{ top: '55%', background: level.floor, borderTop: '3px solid rgba(90,70,54,0.08)' }}
        />
        {/* 裝飾層 */}
        <DecoLayer level={level} />
        {/* Walkers */}
        <WalkingDogs />

        {staff.length === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center text-center text-sm"
            style={{ color: 'var(--muted)' }}
          >
            辦公室還沒有狗狗同事 🦴
            <br />
            先從左邊招聘吧！
          </div>
        )}

        <Badge className="absolute top-3 right-3">Day {useGameStore.getState().day}</Badge>
      </div>
    </div>
  );
}

function DecoLayer({ level }: { level: (typeof OFFICE_LEVELS)[number] }) {
  const items: React.ReactNode[] = [];
  for (let i = 0; i < level.desks; i++) {
    items.push(
      <div
        key={`desk-${i}`}
        className="absolute rounded-lg"
        style={{
          left: `${8 + i * 14}%`,
          top: '62%',
          width: 60,
          height: 30,
          background: '#c49a6c',
          border: '2px solid #8a6848',
        }}
      />,
    );
  }
  for (let i = 0; i < level.plants; i++) {
    items.push(
      <div
        key={`plant-${i}`}
        className="absolute"
        style={{ left: `${5 + i * 18}%`, top: '72%', fontSize: 28 }}
      >
        🪴
      </div>,
    );
  }
  for (let i = 0; i < level.coffee; i++) {
    items.push(
      <div key={`coffee-${i}`} className="absolute" style={{ right: `${8 + i * 10}%`, top: '68%', fontSize: 26 }}>
        ☕
      </div>,
    );
  }
  for (let i = 0; i < level.lounge; i++) {
    items.push(
      <div key={`lounge-${i}`} className="absolute" style={{ left: `${70 + i * 8}%`, top: '74%', fontSize: 28 }}>
        🛋️
      </div>,
    );
  }
  for (let i = 0; i < level.shelves; i++) {
    items.push(
      <div key={`shelf-${i}`} className="absolute" style={{ left: `${15 + i * 20}%`, top: '25%', fontSize: 24 }}>
        📚
      </div>,
    );
  }
  for (let i = 0; i < level.windows; i++) {
    items.push(
      <div
        key={`win-${i}`}
        className="absolute rounded-md"
        style={{
          left: `${12 + i * 22}%`,
          top: '12%',
          width: 100,
          height: 60,
          background: 'linear-gradient(180deg, #cce7ff, #eaf4ff)',
          border: '3px solid #8a6848',
        }}
      />,
    );
  }
  return <>{items}</>;
}
