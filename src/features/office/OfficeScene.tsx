import { useEffect, useMemo, useRef } from 'react';
import { useGameStore, INDUSTRIES } from '@/store/gameStore';
import { useUiStore } from '@/store/uiStore';
import { useWalkerStore } from '@/store/walkerStore';
import type { Dog } from '@/types';
import { ThreeRoom } from './ThreeRoom';
import { OfficeSkinModal } from './OfficeSkinModal';
import { computeGridObstacles } from './layout';
import { ROOM_GRID } from './iso';

export function OfficeScene() {
  const staff = useGameStore((s) => s.staff);
  const teams = useGameStore((s) => s.teams);
  const setBounds = useWalkerStore((s) => s.setBounds);
  const syncWalkers = useWalkerStore((s) => s.syncWithStaff);
  const purchases = useGameStore((s) => s.purchases);
  const skinModalOpen = useUiStore((s) => s.skinModalOpen);
  const closeSkinModal = useUiStore((s) => s.closeSkinModal);
  const roomRef = useRef<HTMLDivElement>(null);

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

  // 螢幕只顯示有在工作的狗，每隊最多前 2 隻 → 最多 8 隻
  const visibleStaff = useMemo<Dog[]>(() => {
    const byId = new Map(staff.map((d) => [d.id, d]));
    const result: Dog[] = [];
    for (const ind of INDUSTRIES) {
      const working = teams[ind].memberIds
        .map((id) => byId.get(id))
        .filter((d): d is Dog => !!d && d.assignedProjectId != null)
        .slice(0, 2);
      result.push(...working);
    }
    return result;
  }, [staff, teams]);

  useEffect(() => {
    syncWalkers(visibleStaff);
  }, [visibleStaff, syncWalkers]);

  return (
    <>
      <div
        ref={roomRef}
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #f7fbff 0%, #eaf4ff 100%)',
        }}
      >
        <ThreeRoom />
      </div>
      {skinModalOpen && <OfficeSkinModal onClose={closeSkinModal} />}
    </>
  );
}
