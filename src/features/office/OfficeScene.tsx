import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useWalkerStore } from '@/store/walkerStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { Badge } from '@/components/Panel';
import { companyHint, companyStage } from '@/lib/utils';
import { ThreeRoom } from './ThreeRoom';
import { OfficeSkinModal } from './OfficeSkinModal';
import { computeGridObstacles } from './layout';
import { ROOM_GRID } from './iso';
import { SvgIcon } from '@/components/SvgIcon';

export function OfficeScene() {
  const officeLevel = useGameStore((s) => s.officeLevel);
  const staff = useGameStore((s) => s.staff);
  const money = useGameStore((s) => s.money);
  const reputation = useGameStore((s) => s.reputation);
  const projectsCompleted = useGameStore((s) => s.projectsCompleted);
  const clients = useGameStore((s) => s.clients);
  const companyBuffs = useGameStore((s) => s.companyBuffs);
  const setBounds = useWalkerStore((s) => s.setBounds);
  const syncWalkers = useWalkerStore((s) => s.syncWithStaff);
  const purchases = useGameStore((s) => s.purchases);
  const roomRef = useRef<HTMLDivElement>(null);
  const [skinModalOpen, setSkinModalOpen] = useState(false);

  const avgMorale = staff.length > 0
    ? staff.reduce((n, d) => n + d.morale, 0) / staff.length
    : 70;
  const hasActive = clients.some((c) => c.status === 'active');
  const decor = companyBuffs.decor;

  const level = OFFICE_LEVELS[officeLevel];
  const stage = companyStage(reputation, avgMorale, staff.length, projectsCompleted);
  const hint = companyHint(money, reputation, avgMorale, hasActive);

  useEffect(() => {
    const el = roomRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const floorTop = h * 0.25;
      const floorH = h - floorTop;
      const gridObs = computeGridObstacles(purchases);
      const obstacles = gridObs.map((g) => ({
        x: ((g.cx - g.w / 2) / ROOM_GRID) * w,
        y: floorTop + ((g.cy - g.h / 2) / ROOM_GRID) * floorH,
        w: (g.w / ROOM_GRID) * w,
        h: (g.h / ROOM_GRID) * floorH,
      }));
      setBounds({ w, h, floorTop, obstacles });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [setBounds, purchases]);

  useEffect(() => {
    syncWalkers(staff);
  }, [staff, syncWalkers]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl flex flex-col min-h-[400px] md:min-h-[600px] xl:min-h-[700px]"
      style={{
        border: '1px solid var(--line)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,249,255,0.9))',
        boxShadow: 'var(--shadow), inset 0 1px 0 rgba(255,255,255,0.95)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 gap-2"
        style={{
          borderBottom: '1px solid var(--line)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(234,244,255,0.76))',
        }}
      >
        <div>
          <div className="flex items-center gap-2 font-extrabold text-lg">
            <SvgIcon name="office" size={24} />
            <span>{level.name}</span>
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            員工 {staff.length} / {level.maxStaff} · 裝飾 Lv {decor}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSkinModalOpen(true)}
            className="rounded-lg whitespace-nowrap font-extrabold inline-flex items-center gap-1"
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              lineHeight: 1,
              background: 'linear-gradient(180deg, #ffffff, #eaf4ff)',
              color: 'var(--text)',
              border: '1px solid var(--line)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(46,104,180,0.1)',
            }}
            title="更換辦公室造型"
          >
            <SvgIcon name="wand" size={14} />
            換造型
          </button>
          <Badge className="inline-flex items-center gap-1" style={{ padding: '6px 10px', fontSize: '12px', lineHeight: 1 }}>
            <SvgIcon name="growth" size={14} />
            {stage}
          </Badge>
        </div>
      </div>
      {skinModalOpen && <OfficeSkinModal onClose={() => setSkinModalOpen(false)} />}

      <div
        ref={roomRef}
        className="relative flex-1 min-h-[520px] md:min-h-[780px]"
        style={{
          background: 'linear-gradient(180deg, #f7fbff 0%, #eaf4ff 100%)',
        }}
      >
        <ThreeRoom />

        <div
          className="absolute left-3 bottom-3 z-10 max-w-[60%] rounded-full px-3 py-1.5 text-xs"
          style={{
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid var(--line)',
            color: 'var(--muted)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          {hint}
        </div>
      </div>
    </div>
  );
}
