import { useUiStore, type BuildingKind } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { JP_ASSETS } from './assets';
import { gridToHtml, gridZ } from './iso';

type Props = {
  kind: BuildingKind;
  gx: number;
  gy: number;
  width: number;
  height: number;
  /** 'bottom' (預設)：sprite 底部嵌入格子中心；'back'：sprite 頂端貼後牆 */
  anchor?: 'bottom' | 'back';
};

const SPRITE_MAP: Record<BuildingKind, string> = {
  shop: JP_ASSETS.shopBuilding,
  dorm: JP_ASSETS.dormBuilding,
  hr: JP_ASSETS.hrOffice,
};

const LABEL_MAP: Record<BuildingKind, string> = {
  shop: '🛒 商店',
  dorm: '👥 宿舍',
  hr: '📋 人資',
};

export function Building({ kind, gx, gy, width, height, anchor = 'bottom' }: Props) {
  const openDrawer = useUiStore((s) => s.openDrawer);
  const openBuilding = useUiStore((s) => s.openBuilding);
  const hasCurrent = useGameStore((s) => !!s.current);
  const morale = useGameStore((s) => s.morale);
  const money = useGameStore((s) => s.money);

  const { x, y } = gridToHtml(gx + 0.5, gy + 0.5);
  const isActive = openBuilding === kind;
  // 'back' 時讓 sprite 頂端貼近後牆（y 往上延伸），'bottom' 時底部在 grid 中心
  const topPx = anchor === 'back' ? y - height + 80 : y - height + 14;

  // notification dots
  const needNotif =
    kind === 'hr' ? hasCurrent : kind === 'dorm' ? morale < 40 : money < 50;

  return (
    <button
      type="button"
      onClick={() => openDrawer(kind)}
      className="absolute group"
      style={{
        left: x - width / 2,
        top: topPx,
        width,
        height,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        zIndex: gridZ(gx, gy) + 10,
        filter: isActive
          ? 'drop-shadow(0 0 10px rgba(255,207,107,0.9)) drop-shadow(0 4px 6px rgba(90,50,20,0.35))'
          : 'drop-shadow(0 4px 6px rgba(90,50,20,0.35))',
        transition: 'transform 0.15s, filter 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <img
        src={SPRITE_MAP[kind]}
        alt={LABEL_MAP[kind]}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      <span
        className="absolute text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap"
        style={{
          left: '50%',
          bottom: -10,
          transform: 'translateX(-50%)',
          background: '#fdf7ea',
          color: 'var(--text)',
          border: '1.5px solid var(--jp-wood-dark, #8b6a45)',
        }}
      >
        {LABEL_MAP[kind]}
      </span>
      {needNotif && (
        <span
          className="absolute rounded-full animate-pulse"
          style={{
            top: 2,
            right: 2,
            width: 16,
            height: 16,
            background: '#d75d5d',
            border: '2px solid #fffaf0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
      )}
    </button>
  );
}
