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
      // 從 grid 空間 obstacle 轉 px 空間（共用 layout.ts 的定義，確保 3D 場景與 walker 碰撞一致）
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
      className="relative overflow-hidden rounded-3xl flex flex-col min-h-[400px] md:min-h-[600px] xl:min-h-[700px]"
      style={{
        border: '2px solid rgba(214,145,150,0.3)',
        background: 'var(--jp-washi)',
        boxShadow:
          'inset 0 1.5px 0 rgba(255,255,255,0.9), 0 4px 10px rgba(214,145,150,0.12), 0 18px 40px rgba(180,100,130,0.18)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 gap-2"
        style={{
          borderBottom: '2px dashed rgba(214,145,150,0.5)',
          background: 'linear-gradient(180deg, var(--jp-washi-warm), var(--jp-washi))',
        }}
      >
        <div>
          <div className="font-extrabold text-lg">🏮 {level.name}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            員工 {staff.length} / {level.maxStaff}・裝飾 Lv {decor}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSkinModalOpen(true)}
            className="text-[11px] px-2 py-1 rounded-full font-bold"
            style={{
              background: 'linear-gradient(180deg, #f0e0ff, #d4b8f0)',
              color: '#5a3a8a',
              border: '1px solid #b89adb',
            }}
            title="切換辦公室造型"
          >
            🎨 換造型
          </button>
          <Badge>{stage}</Badge>
        </div>
      </div>
      {skinModalOpen && <OfficeSkinModal onClose={() => setSkinModalOpen(false)} />}

      <div
        ref={roomRef}
        className="relative flex-1 min-h-[520px] md:min-h-[780px]"
        style={{
          background: 'linear-gradient(180deg, #fbf0dc 0%, #fde0cf 100%)',
        }}
      >
        <ThreeRoom />

        <div
          className="absolute left-3 bottom-3 text-xs px-3 py-1.5 rounded-full z-10"
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
