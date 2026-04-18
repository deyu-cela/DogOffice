import { useEffect, useRef, type CSSProperties } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useWalkerStore } from '@/store/walkerStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { Badge } from '@/components/Panel';
import { WalkingDogs } from './WalkingDogs';
import { companyHint, companyStage } from '@/lib/utils';
import { JP_ASSETS, PIXEL_IMG_STYLE } from './assets';
import { IsoRoom } from './IsoRoom';
import { Building } from './Building';
import { gridToHtml, gridZ } from './iso';
import { useUiStore } from '@/store/uiStore';
import type { Dog, ShopItemEffectKey } from '@/types';

function isoSprite(gx: number, gy: number, width: number, height: number): CSSProperties {
  const { x, y } = gridToHtml(gx + 0.5, gy + 0.5);
  return {
    ...PIXEL_IMG_STYLE,
    position: 'absolute',
    left: x - width / 2,
    top: y - height + 6, // 微調 sprite 底部稍微嵌入格子
    width,
    height,
    zIndex: gridZ(gx, gy),
    filter: 'drop-shadow(0 3px 3px rgba(90,50,20,0.28))',
  };
}

export function OfficeScene() {
  const officeLevel = useGameStore((s) => s.officeLevel);
  const staff = useGameStore((s) => s.staff);
  const decor = useGameStore((s) => s.decor);
  const purchases = useGameStore((s) => s.purchases);
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

  const floorTexture = officeLevel >= 2 ? JP_ASSETS.tatamiTexture : JP_ASSETS.woodFloorTexture;

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
          backgroundImage: `
            repeating-linear-gradient(60deg, transparent 0 19px, rgba(139,106,69,0.08) 19px 20px),
            repeating-linear-gradient(-60deg, transparent 0 19px, rgba(139,106,69,0.08) 19px 20px),
            radial-gradient(circle at 20% 20%, rgba(158,194,156,0.25) 0, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(248,199,206,0.25) 0, transparent 50%),
            linear-gradient(180deg, #fbf0dc 0%, #fde0cf 100%)
          `,
          backgroundSize: '40px 40px, 40px 40px, 100% 100%, 100% 100%, 100% 100%',
        }}
      >
        <IsoRoom health={health}>
          <ZoneFurniture level={level} decor={decor} purchases={purchases} />

          {/* 互動家具（室內） */}
          <Building kind="shop" gx={5} gy={0} width={110} height={150} anchor="back" />
          <Building kind="dorm" gx={1} gy={4} width={150} height={120} />
          <Building kind="hr" gx={7} gy={8} width={150} height={130} />

          <IsoZoneLabels />

          {/* 候選人提示（浮在人資建築上方） */}
          <HrNotice
            current={current}
            candidatePatience={candidatePatience}
            vacancy={vacancy}
          />
        </IsoRoom>

        {/* Walkers（暫保留浮動座標） */}
        <WalkingDogs />

        {/* 櫻花飄落 */}
        <SakuraRain />

        {/* Banner (bottom hint) */}
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

function DecoLayer({ level, decor }: { level: (typeof OFFICE_LEVELS)[number]; decor: number }) {
  const items: React.ReactNode[] = [];
  for (let i = 0; i < level.desks; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    items.push(
      <img
        key={`desk-${i}`}
        src={JP_ASSETS.woodenDesk}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: 90 + col * 140 + (row % 2) * 60,
          top: `calc(55% + ${26 + row * 62}px)`,
          width: 72,
          height: 48,
          filter: 'drop-shadow(0 3px 4px rgba(90,50,20,0.22))',
        }}
      />,
    );
  }
  const plantSprites = [JP_ASSETS.bonsai, JP_ASSETS.bambooPot, JP_ASSETS.sakuraBranch];
  for (let i = 0; i < level.plants + decor; i++) {
    items.push(
      <img
        key={`plant-${i}`}
        src={plantSprites[i % plantSprites.length]}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: 70 + ((i * 128) % 420),
          top: `calc(55% - 40px + ${(i % 2) * 10}px)`,
          width: 52,
          height: 52,
          filter: 'drop-shadow(0 2px 3px rgba(90,50,20,0.22))',
        }}
      />,
    );
  }
  for (let i = 0; i < level.coffee; i++) {
    items.push(
      <img
        key={`coffee-${i}`}
        src={JP_ASSETS.coffeeMachine}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: 180 + i * 160,
          top: `calc(55% + ${8 + (i % 2) * 44}px)`,
          width: 40,
          height: 40,
        }}
      />,
    );
  }
  for (let i = 0; i < level.lounge; i++) {
    items.push(
      <img
        key={`lounge-${i}`}
        src={JP_ASSETS.beanBag}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: 36 + i * 72,
          top: `calc(55% + ${36 + i * 14}px)`,
          width: 52,
          height: 52,
        }}
      />,
    );
  }
  for (let i = 0; i < level.windows; i++) {
    items.push(
      <img
        key={`win-${i}`}
        src={JP_ASSETS.shojiWindow}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: 120 + i * 140,
          top: 22,
          width: 108,
          height: 74,
          filter: 'drop-shadow(0 2px 4px rgba(90,50,20,0.2))',
        }}
      />,
    );
  }
  for (let i = 0; i < level.shelves; i++) {
    items.push(
      <img
        key={`shelf-${i}`}
        src={JP_ASSETS.bookshelf}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          right: 30 + i * 60,
          top: 100 + i * 40,
          width: 56,
          height: 56,
        }}
      />,
    );
  }
  for (let i = 0; i < level.lights; i++) {
    items.push(
      <img
        key={`light-${i}`}
        src={JP_ASSETS.lanternRed}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: 90 + i * 150,
          top: 18,
          width: 40,
          height: 52,
          transformOrigin: 'top center',
          animation: `lantern-sway ${3 + (i % 3) * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
          filter: 'drop-shadow(0 3px 4px rgba(90,50,20,0.3))',
        }}
      />,
    );
  }

  return <>{items}</>;
}

function PurchaseLayer({ purchases }: { purchases: Partial<Record<ShopItemEffectKey, number>> }) {
  const items: React.ReactNode[] = [];
  const cap = (id: ShopItemEffectKey) => Math.min(purchases[id] ?? 0, 4);

  const drop = 'drop-shadow(0 2px 3px rgba(90,50,20,0.22))';
  // 暖光吊燈（掛橫樑下）
  for (let i = 0; i < cap('lamp'); i++) {
    items.push(
      <img
        key={`buy-lamp-${i}`}
        src={JP_ASSETS.lanternRed}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: 60 + i * 92,
          top: 16,
          width: 32,
          height: 42,
          animation: `lantern-sway ${4 + (i % 2)}s ease-in-out infinite`,
          animationDelay: `${i * 0.3}s`,
          transformOrigin: 'top center',
          filter: 'drop-shadow(0 3px 4px rgba(255,200,100,0.55))',
        }}
      />,
    );
  }
  // 品牌展示牆（相框）
  for (let i = 0; i < cap('artwall'); i++) {
    items.push(
      <img
        key={`buy-art-${i}`}
        src={JP_ASSETS.pictureFrame}
        alt=""
        className="absolute"
        style={{ ...PIXEL_IMG_STYLE, left: 30 + i * 82, top: 104 + (i % 2) * 28, width: 56, height: 44, filter: drop }}
      />,
    );
  }
  // 流程優化手冊（公告板）
  for (let i = 0; i < cap('policy'); i++) {
    items.push(
      <img
        key={`buy-policy-${i}`}
        src={JP_ASSETS.clipboard}
        alt=""
        className="absolute"
        style={{ ...PIXEL_IMG_STYLE, right: 24 + i * 48, top: 88 + (i % 2) * 30, width: 40, height: 48, filter: drop }}
      />,
    );
  }
  // 高級零食（桌面小餅乾罐）
  for (let i = 0; i < cap('snack'); i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    items.push(
      <img
        key={`buy-snack-${i}`}
        src={JP_ASSETS.snackJar}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: 112 + col * 140 + (row % 2) * 60,
          top: `calc(55% + ${18 + row * 62}px)`,
          width: 22,
          height: 24,
          filter: drop,
        }}
      />,
    );
  }
  // 狗狗玩具區（地板球）
  for (let i = 0; i < cap('toy'); i++) {
    items.push(
      <img
        key={`buy-toy-${i}`}
        src={JP_ASSETS.toyBall}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: 180 + i * 58,
          top: `calc(55% + ${62 + (i % 2) * 18}px)`,
          width: 28,
          height: 28,
          filter: drop,
        }}
      />,
    );
  }
  // 懶骨頭休息區
  for (let i = 0; i < cap('sofa'); i++) {
    items.push(
      <img
        key={`buy-sofa-${i}`}
        src={JP_ASSETS.beanBag}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: 24 + i * 74,
          top: `calc(55% + ${58 + (i % 2) * 12}px)`,
          width: 58,
          height: 50,
          filter: drop,
        }}
      />,
    );
  }
  // 精品咖啡機
  for (let i = 0; i < cap('coffee'); i++) {
    items.push(
      <img
        key={`buy-coffee-${i}`}
        src={JP_ASSETS.coffeeMachine}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          right: 80 + i * 48,
          top: `calc(55% + ${10 + (i % 2) * 30}px)`,
          width: 42,
          height: 44,
          filter: drop,
        }}
      />,
    );
  }
  // 狗狗健身區
  for (let i = 0; i < cap('gym'); i++) {
    items.push(
      <img
        key={`buy-gym-${i}`}
        src={JP_ASSETS.dumbbell}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          right: 22 + i * 52,
          top: `calc(55% + ${62 + (i % 2) * 14}px)`,
          width: 44,
          height: 26,
          filter: drop,
        }}
      />,
    );
  }
  // 升級辦公桌（螢幕疊在現有桌子上）
  for (let i = 0; i < cap('desk'); i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    items.push(
      <img
        key={`buy-monitor-${i}`}
        src={JP_ASSETS.crtMonitor}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: 104 + col * 140 + (row % 2) * 60,
          top: `calc(55% + ${18 + row * 62}px)`,
          width: 32,
          height: 30,
          filter: drop,
        }}
      />,
    );
  }

  return <>{items}</>;
}

function IsoZoneLabels() {
  const zones: { name: string; color: string; gx: number; gy: number }[] = [
    { name: '🏋️ 健身', color: '#c0392b', gx: 1, gy: 1 },
    { name: '🖥️ 辦公', color: '#a36a3a', gx: 4.5, gy: 4.5 },
    { name: '🎾 玩具', color: '#2980b9', gx: 8, gy: 1 },
    { name: '🌸 裝飾', color: '#8e44ad', gx: 1, gy: 8 },
  ];
  return (
    <>
      {zones.map((z) => {
        const { x, y } = gridToHtml(z.gx, z.gy);
        return (
          <span
            key={z.name}
            className="absolute text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none"
            style={{
              left: x,
              top: y - 8,
              transform: 'translate(-50%, -50%)',
              background: 'rgba(253,247,234,0.92)',
              color: z.color,
              border: `1.5px solid ${z.color}`,
              zIndex: 80,
            }}
          >
            {z.name}
          </span>
        );
      })}
    </>
  );
}

function HrNotice({
  current,
  candidatePatience,
  vacancy,
}: {
  current: Dog | null;
  candidatePatience: number;
  vacancy: boolean;
}) {
  const openDrawer = useUiStore((s) => s.openDrawer);
  // 候選人站在右前門口（iso 菱形前角附近）
  const anchor = gridToHtml(9.5, 9);

  if (!current && !vacancy) return null;

  const bubbleText = current
    ? candidatePatience <= 1
      ? '我快走了...'
      : candidatePatience <= 2
        ? '還在考慮嗎？'
        : '來面試！'
    : '今天沒人來';

  const patienceBg = !current
    ? '#eadfce'
    : candidatePatience <= 1
      ? '#ffd4d4'
      : candidatePatience <= 2
        ? '#ffe3c3'
        : '#d4ecd4';
  const patienceColor = !current
    ? '#7a685a'
    : candidatePatience <= 1
      ? '#c0392b'
      : candidatePatience <= 2
        ? '#b45a1c'
        : '#2f7a3a';

  return (
    <div
      onClick={() => current && openDrawer('hr')}
      className="absolute flex flex-col items-center"
      style={{
        left: anchor.x - 56,
        top: anchor.y - 230,
        width: 112,
        zIndex: 600,
        cursor: current ? 'pointer' : 'default',
        pointerEvents: current ? 'auto' : 'none',
        animation: current && candidatePatience <= 1 ? 'pulse 1.2s ease-in-out infinite' : 'none',
      }}
    >
      <div
        className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
        style={{
          background: 'rgba(255,255,255,0.97)',
          border: '1.5px solid var(--jp-wood-dark, #8b6a45)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
          color: 'var(--text)',
          opacity: current ? 1 : 0.7,
        }}
      >
        {current ? `${current.name}${bubbleText}` : bubbleText}
      </div>
      {current && (
        <>
          <div className="text-4xl mt-0.5" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))' }}>
            {current.emoji}
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 whitespace-nowrap"
            style={{ background: patienceBg, color: patienceColor }}
          >
            剩 {candidatePatience} 天
          </span>
        </>
      )}
    </div>
  );
}

function ZoneFurniture({
  level,
  decor,
  purchases,
}: {
  level: (typeof OFFICE_LEVELS)[number];
  decor: number;
  purchases: Partial<Record<ShopItemEffectKey, number>>;
}) {
  const cap = (id: ShopItemEffectKey) => Math.min(purchases[id] ?? 0, 4);
  const items: React.ReactNode[] = [];

  // 健身區 gx 0-2 gy 0-2：啞鈴
  const gymGrids: [number, number][] = [[1, 0], [0, 1], [1, 1], [0, 2]];
  const gymTotal = Math.min(1 + cap('gym'), gymGrids.length);
  for (let i = 0; i < gymTotal; i++) {
    const [gx, gy] = gymGrids[i];
    items.push(
      <img key={`gym-${i}`} src={JP_ASSETS.dumbbell} alt="" style={isoSprite(gx, gy, 44, 28)} />,
    );
  }

  // 辦公區 gx 3-6 gy 3-6：木桌 + CRT 疊上（避開 shop/dorm/hr 建築）
  const deskGrids: [number, number][] = [
    [3, 3], [5, 3], [3, 5], [5, 5], [4, 4], [6, 4], [4, 6], [6, 6], [3, 4], [5, 4],
  ];
  const deskCount = Math.min(level.desks, deskGrids.length);
  for (let i = 0; i < deskCount; i++) {
    const [gx, gy] = deskGrids[i];
    items.push(
      <img key={`desk-${i}`} src={JP_ASSETS.woodenDesk} alt="" style={isoSprite(gx, gy, 72, 52)} />,
    );
    if (i < cap('desk')) {
      const pos = gridToHtml(gx + 0.5, gy + 0.5);
      items.push(
        <img
          key={`monitor-${i}`}
          src={JP_ASSETS.crtMonitor}
          alt=""
          style={{
            ...PIXEL_IMG_STYLE,
            position: 'absolute',
            left: pos.x - 18,
            top: pos.y - 52 - 22,
            width: 36,
            height: 32,
            zIndex: gridZ(gx, gy) + 1,
            filter: 'drop-shadow(0 2px 2px rgba(90,50,20,0.25))',
          }}
        />,
      );
    }
  }

  // 後牆右側書架（避開 shop 建築）
  const shelfGrids: [number, number][] = [[8, 0], [7, 0], [9, 0]];
  const shelfCount = Math.min(level.shelves, shelfGrids.length);
  for (let i = 0; i < shelfCount; i++) {
    const [gx, gy] = shelfGrids[i];
    items.push(
      <img key={`shelf-${i}`} src={JP_ASSETS.bookshelf} alt="" style={isoSprite(gx, gy, 68, 56)} />,
    );
  }

  // 辦公區點綴：公告板 + 零食
  for (let i = 0; i < cap('policy'); i++) {
    items.push(
      <img key={`policy-${i}`} src={JP_ASSETS.clipboard} alt="" style={isoSprite(3 + (i % 3), 6, 28, 36)} />,
    );
  }
  for (let i = 0; i < cap('snack'); i++) {
    items.push(
      <img key={`snack-${i}`} src={JP_ASSETS.snackJar} alt="" style={isoSprite(4 + (i % 2), 3, 22, 26)} />,
    );
  }

  // 玩具區 gx 7-9 gy 0-3：網球
  const toyGrids: [number, number][] = [[8, 1], [9, 1], [7, 2], [8, 2], [9, 2], [7, 3]];
  const toyTotal = Math.min(1 + cap('toy'), toyGrids.length);
  for (let i = 0; i < toyTotal; i++) {
    const [gx, gy] = toyGrids[i];
    items.push(
      <img key={`ball-${i}`} src={JP_ASSETS.toyBall} alt="" style={isoSprite(gx, gy, 30, 30)} />,
    );
  }

  // 裝飾角 gx 0-2 gy 7-9：盆栽（bonsai/bamboo/sakura 輪替）
  const plantGrids: [number, number][] = [[0, 7], [1, 8], [0, 9], [2, 7], [0, 8], [1, 9]];
  const plantSprites = [JP_ASSETS.bonsai, JP_ASSETS.bambooPot, JP_ASSETS.sakuraBranch];
  const plantTotal = Math.min(level.plants + decor, plantGrids.length);
  for (let i = 0; i < plantTotal; i++) {
    const [gx, gy] = plantGrids[i];
    items.push(
      <img
        key={`plant-${i}`}
        src={plantSprites[i % plantSprites.length]}
        alt=""
        style={isoSprite(gx, gy, 46, 50)}
      />,
    );
  }

  // 展示牆相框：掛右牆上（固定像素位置）
  for (let i = 0; i < cap('artwall'); i++) {
    items.push(
      <img
        key={`art-${i}`}
        src={JP_ASSETS.pictureFrame}
        alt=""
        style={{
          ...PIXEL_IMG_STYLE,
          position: 'absolute',
          right: 40 + i * 56,
          top: 70 + (i % 2) * 36,
          width: 50,
          height: 40,
          zIndex: 30,
          filter: 'drop-shadow(0 2px 3px rgba(90,50,20,0.25))',
        }}
      />,
    );
  }
  return <>{items}</>;
}

function Daruma() {
  const { x, y } = gridToHtml(9, 3);
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x - 24,
        top: y - 56,
        zIndex: gridZ(9, 3),
      }}
    >
      <img
        src={JP_ASSETS.daruma}
        alt="達摩"
        style={{
          ...PIXEL_IMG_STYLE,
          width: 48,
          height: 48,
          filter: 'drop-shadow(0 3px 3px rgba(90,50,20,0.25))',
        }}
      />
    </div>
  );
}

function ManekiNeko() {
  const { x, y } = gridToHtml(2.5, 9.5);
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x - 36,
        top: y - 78,
        zIndex: gridZ(2, 9),
      }}
    >
      <img
        src={JP_ASSETS.manekiNeko}
        alt="招財貓"
        style={{
          ...PIXEL_IMG_STYLE,
          width: 72,
          height: 72,
          transformOrigin: 'bottom center',
          animation: 'bob 2.4s ease-in-out infinite',
          filter: 'drop-shadow(0 3px 3px rgba(90,50,20,0.2))',
        }}
      />
    </div>
  );
}

function SakuraRain() {
  const petals = Array.from({ length: 14 }).map((_, i) => {
    const left = (i * 73) % 100;
    const dur = 9 + (i % 5) * 1.6;
    const delay = (i * 0.7) % 7;
    const driftX = (i % 2 === 0 ? 1 : -1) * (25 + ((i * 11) % 35));
    const size = 14 + (i % 3) * 6;
    return (
      <img
        key={i}
        src={JP_ASSETS.sakuraPetal}
        alt=""
        className="absolute"
        style={{
          ...PIXEL_IMG_STYLE,
          left: `${left}%`,
          top: -16,
          width: size,
          height: size,
          animation: `sakura-drift ${dur}s linear infinite`,
          animationDelay: `${delay}s`,
          opacity: 0.85,
          ['--drift-x' as unknown as string]: `${driftX}px`,
          ['--drift-y' as unknown as string]: '540px',
        } as CSSProperties}
      />
    );
  });
  return <div className="pointer-events-none absolute inset-0 overflow-hidden">{petals}</div>;
}
