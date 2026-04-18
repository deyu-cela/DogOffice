import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useWalkerStore } from '@/store/walkerStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { Badge } from '@/components/Panel';
import { companyHint, companyStage } from '@/lib/utils';
import { ThreeRoom } from './ThreeRoom';

export function OfficeScene() {
  const officeLevel = useGameStore((s) => s.officeLevel);
  const staff = useGameStore((s) => s.staff);
  const decor = useGameStore((s) => s.decor);
  const money = useGameStore((s) => s.money);
  const morale = useGameStore((s) => s.morale);
  const health = useGameStore((s) => s.health);
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
      const w = rect.width;
      const h = rect.height;
      const floorTop = h * 0.25;
      const floorH = h - floorTop;
      // 三個建築的 walker 禁區（百分比對應 iso 地板上的 sprite 投影）
      const obstacles = [
        // 商店：後牆中央
        { x: w * 0.38, y: floorTop + floorH * 0.05, w: w * 0.22, h: floorH * 0.28 },
        // 宿舍：左中
        { x: w * 0.05, y: floorTop + floorH * 0.28, w: w * 0.28, h: floorH * 0.32 },
        // 人資：右前
        { x: w * 0.58, y: floorTop + floorH * 0.55, w: w * 0.3, h: floorH * 0.35 },
      ];
      setBounds({ w, h, floorTop, obstacles });
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
        border: '2px solid rgba(139,106,69,0.25)',
        background: 'var(--jp-washi)',
        boxShadow: '0 10px 30px rgba(90,70,54,0.12)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 gap-2"
        style={{
          borderBottom: '2px solid var(--jp-wood-dark)',
          background: 'linear-gradient(180deg, var(--jp-washi-warm), var(--jp-washi))',
        }}
      >
        <div>
          <div className="font-extrabold text-lg">🏮 {level.name}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            員工 {staff.length} / {level.maxStaff}・裝飾 Lv {decor}
          </div>
        </div>
        <Badge>{stage}</Badge>
      </div>

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
