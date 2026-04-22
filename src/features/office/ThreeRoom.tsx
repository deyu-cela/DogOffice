import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useTexture, Billboard, Html } from '@react-three/drei';
import { CanvasTexture, DoubleSide, LinearFilter, LinearMipmapLinearFilter, NearestFilter, Object3D, type InstancedMesh as ThreeInstancedMesh, type Texture } from 'three';
import { JP_ASSETS } from './assets';
import { gridToWorld } from './threeIso';
import { useUiStore, type BuildingKind } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { ROLE_IMAGE_MAP } from '@/constants/dogRoles';
import { useWalkerStore } from '@/store/walkerStore';
import { ROOM_GRID } from './iso';
import { BUILDING_LAYOUT, PURCHASE_LAYOUT } from './layout';
import type { ShopItemEffectKey } from '@/types';

// 房間尺寸（world units）
const ROOM = 17;       // 地板 17x17
const WALL_H = 8;      // 牆高 8
const HALF = ROOM / 2; // 8.5

// 預載常用 texture（放進 effect 避免 HMR 每次 reload 重跑）
const PRELOAD_URLS = [
  JP_ASSETS.shopBuilding,
  JP_ASSETS.dormBuilding,
  JP_ASSETS.hrOffice,
  JP_ASSETS.woodenDesk,
  JP_ASSETS.coffeeMachine,
  JP_ASSETS.beanBag,
  JP_ASSETS.clipboard,
  JP_ASSETS.snackJar,
  JP_ASSETS.pictureFrame,
  JP_ASSETS.toyBall,
  JP_ASSETS.gymArea,
  JP_ASSETS.sakuraPetal,
  JP_ASSETS.gptFloor,
  JP_ASSETS.gptWall,
];

function usePixelTexture(src: string): Texture {
  const tex = useTexture(src);
  useLayoutEffect(() => {
    tex.magFilter = LinearFilter;
    tex.minFilter = LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
  }, [tex]);
  return tex;
}

// kawaii 主題地板：貼 gpt_floor.png 當 texture + 厚度讓地板浮起來
// 原圖 1536x1024，pattern 實際在 x=270~1266（~996 寬、置中），左右是深棕邊框
// 用 BoxGeometry 做厚度，頂面貼圖、側面給偏暗粉色（模仿 kawaii home shop 浮起地板的立體感）
const FLOOR_THICKNESS = 0.5;
const FLOOR_SIDE_COLOR = '#dca997'; // 稍深的奶茶粉，當地板側邊
// 地板要延伸到牆外緣下方（-x 和 -z 各多一個 WALL_THICKNESS），讓牆看起來是站在地板上
// 只向左後擴，前與右邊（-x/-z 視為後左，+x/+z 視為前右）保持 HALF 不變
function FloorImageMesh() {
  const tex = usePixelTexture(JP_ASSETS.gptFloor);
  useLayoutEffect(() => {
    tex.repeat.set(996 / 1536, 1020 / 1024);
    tex.offset.set(270 / 1536, 2 / 1024);
    tex.needsUpdate = true;
  }, [tex]);
  const floorW = ROOM + WALL_THICKNESS;
  const floorCx = -WALL_THICKNESS / 2;
  return (
    <mesh position={[floorCx, -FLOOR_THICKNESS / 2, floorCx]}>
      <boxGeometry args={[floorW, FLOOR_THICKNESS, floorW]} />
      {/* BoxGeometry 面序：[+x, -x, +y(top), -y, +z, -z] */}
      <meshBasicMaterial attach="material-0" color={FLOOR_SIDE_COLOR} />
      <meshBasicMaterial attach="material-1" color={FLOOR_SIDE_COLOR} />
      <meshBasicMaterial attach="material-2" map={tex} />
      <meshBasicMaterial attach="material-3" color={FLOOR_SIDE_COLOR} />
      <meshBasicMaterial attach="material-4" color={FLOOR_SIDE_COLOR} />
      <meshBasicMaterial attach="material-5" color={FLOOR_SIDE_COLOR} />
    </mesh>
  );
}

// kawaii 主題牆壁：BoxGeometry 向外延伸出厚度，iso 視角會看到牆頂和側邊的立體邊
// 兩面牆共用同一個 useTexture 來源，需 clone 才能各自設定 repeat/offset
const WALL_THICKNESS = 0.5;
const WALL_CAP_COLOR = '#ebc9b4'; // 牆面 cap（頂 + 端）顏色，比貼圖底色稍深
function WallImageMesh({ variant }: { variant: 'left' | 'right' }) {
  const baseTex = usePixelTexture(JP_ASSETS.gptWall);
  const tex = useMemo(() => baseTex.clone(), [baseTex]);
  useLayoutEffect(() => {
    if (variant === 'right') {
      tex.repeat.set(-1, 1);
      tex.offset.set(1, 0);
    } else {
      tex.repeat.set(1, 1);
      tex.offset.set(0, 0);
    }
    tex.needsUpdate = true;
  }, [tex, variant]);

  if (variant === 'left') {
    // 左牆：box 向 -x 方向延伸，內面（+x）貼圖
    return (
      <mesh position={[-HALF - WALL_THICKNESS / 2, WALL_H / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, WALL_H, ROOM]} />
        {/* [+x, -x, +y, -y, +z, -z] */}
        <meshBasicMaterial attach="material-0" map={tex} />
        <meshBasicMaterial attach="material-1" color={WALL_CAP_COLOR} />
        <meshBasicMaterial attach="material-2" color={WALL_CAP_COLOR} />
        <meshBasicMaterial attach="material-3" color={WALL_CAP_COLOR} />
        <meshBasicMaterial attach="material-4" color={WALL_CAP_COLOR} />
        <meshBasicMaterial attach="material-5" color={WALL_CAP_COLOR} />
      </mesh>
    );
  }
  // 右牆：box 向 -z 方向延伸，內面（+z）貼圖
  return (
    <mesh position={[0, WALL_H / 2, -HALF - WALL_THICKNESS / 2]}>
      <boxGeometry args={[ROOM, WALL_H, WALL_THICKNESS]} />
      <meshBasicMaterial attach="material-0" color={WALL_CAP_COLOR} />
      <meshBasicMaterial attach="material-1" color={WALL_CAP_COLOR} />
      <meshBasicMaterial attach="material-2" color={WALL_CAP_COLOR} />
      <meshBasicMaterial attach="material-3" color={WALL_CAP_COLOR} />
      <meshBasicMaterial attach="material-4" map={tex} />
      <meshBasicMaterial attach="material-5" color={WALL_CAP_COLOR} />
    </mesh>
  );
}

class CanvasErrorBoundary extends Component<
  { onReset: () => void; children: ReactNode },
  { error: Error | null }
> {
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ThreeRoom crashed:', error, info);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => {
      this.props.onReset();
      this.setState({ error: null });
    }, 250);
  }
  componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }
  render() {
    if (this.state.error) {
      return (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
          style={{ background: 'rgba(255,245,230,0.95)', color: '#7a685a' }}
        >
          <div className="text-3xl mb-2">😵</div>
          <div className="text-sm font-bold mb-1">3D 畫面重載中...</div>
          <button
            type="button"
            className="mt-3 text-xs px-3 py-1.5 rounded-full"
            style={{ background: '#ffc7d1', color: 'white' }}
            onClick={() => {
              this.props.onReset();
              this.setState({ error: null });
            }}
          >
            立即重試
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function CameraKeepLookAt() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 4, 0);
  }, [camera]);
  return null;
}

/**
 * R3F iso 房間（Three.js Canvas）
 * - Orthographic iso 視角
 * - L 形房間：地板 + 左後牆 + 右後牆 + 天花橫樑 + 地板格線
 */
export function ThreeRoom() {
  const [remountKey, setRemountKey] = useState(0);
  const [gpuPaused, setGpuPaused] = useState(false);
  const remountScheduled = useRef(false);
  const failureCount = useRef(0);
  const lastFailureAt = useRef(0);
  const loggedLost = useRef(false);
  const officeLevel = useGameStore((s) => s.officeLevel);
  const level = OFFICE_LEVELS[officeLevel];
  const wallLeft = level?.wall ?? '#ffe8b8';
  const wallRight = level?.wallRight ?? level?.wall ?? '#fff2d4';
  const floorCol = level?.floor ?? '#fadec0';
  const accent = level?.accent;

  // texture 預載（放在 effect 內，HMR 時不會重跑 side effect）
  useEffect(() => {
    PRELOAD_URLS.forEach((u) => useTexture.preload(u));
  }, []);

  const forceRemount = useCallback(() => {
    if (remountScheduled.current) return;
    const now = Date.now();
    // 5 秒內連續失敗 → 累加；否則重設
    if (now - lastFailureAt.current < 5000) {
      failureCount.current += 1;
    } else {
      failureCount.current = 1;
    }
    lastFailureAt.current = now;

    // 連續 3 次 → 暫停等 GPU，避免 remount 迴圈把 VRAM 吃光
    if (failureCount.current >= 3) {
      console.warn('[ThreeRoom] 連續 context lost，暫停 3D 等 GPU 釋放');
      setGpuPaused(true);
      return;
    }

    remountScheduled.current = true;
    // 指數退避：200ms → 600ms → 1500ms
    const delay = [200, 600, 1500][Math.min(failureCount.current - 1, 2)];
    setTimeout(() => {
      remountScheduled.current = false;
      setRemountKey((k) => k + 1);
    }, delay);
  }, []);

  const manualResume = useCallback(() => {
    failureCount.current = 0;
    loggedLost.current = false;
    setGpuPaused(false);
    setRemountKey((k) => k + 1);
  }, []);

  if (gpuPaused) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
        style={{ background: 'linear-gradient(180deg, #fbf0dc, #fde0cf)', color: '#7a685a' }}
      >
        <div className="text-4xl mb-2">💤</div>
        <div className="text-sm font-bold mb-1">3D 場景暫停</div>
        <div className="text-xs mb-3 leading-relaxed">
          GPU 忙碌中（可能正在跑 AI / 影片編輯）<br />
          關閉其他 GPU 高負載程式後重試
        </div>
        <button
          type="button"
          onClick={manualResume}
          className="text-xs px-4 py-2 rounded-full font-bold"
          style={{ background: 'linear-gradient(180deg, #ffc7d1, #eb93a3)', color: 'white' }}
        >
          重新啟動 3D
        </button>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(180deg, #fbf0dc, #fde0cf)',
        minHeight: 400,
      }}
    >
      <CanvasErrorBoundary onReset={forceRemount}>
      <Canvas
        key={remountKey}
        orthographic
        flat
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'default', preserveDrawingBuffer: false, stencil: false, depth: true }}
        camera={{ position: [20, 18, 20], zoom: 38, near: -30, far: 100 }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 4, 0);
          gl.setClearColor(0x000000, 0); // 確保透明背景，避免 context lost 留紫色殘影
          const canvas = gl.domElement;
          const handleLost = (e: Event) => {
            e.preventDefault();
            // 只在第一次失敗時 log，避免重複 remount 造成 log 洪水
            if (!loggedLost.current) {
              console.warn('[ThreeRoom] WebGL context lost → 指數退避重建');
              loggedLost.current = true;
            }
            forceRemount();
          };
          const handleRestored = () => {
            loggedLost.current = false;
          };
          canvas.addEventListener('webglcontextlost', handleLost);
          canvas.addEventListener('webglcontextrestored', handleRestored);
        }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <CameraKeepLookAt />

        {/* 地板：kawaii 主題用 gpt_floor.png 貼圖，其他主題保留程式繪製 */}
        {level?.theme === 'kawaii' ? (
          <FloorImageMesh />
        ) : (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[ROOM, ROOM]} />
            <meshBasicMaterial map={getFloorTexture(floorCol, floorGridColorFor(level?.theme, floorCol))} />
          </mesh>
        )}

        {/* 左後牆（依 officeLevel 變色） */}
        {level?.theme === 'kawaii' ? (
          <WallImageMesh variant="left" />
        ) : (
          <mesh position={[-HALF, WALL_H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[ROOM, WALL_H]} />
            <meshBasicMaterial map={getWallTexture(wallLeft)} side={DoubleSide} />
          </mesh>
        )}

        {/* 右後牆（kawaii 主題水平鏡像避免和左牆完全一樣） */}
        {level?.theme === 'kawaii' ? (
          <WallImageMesh variant="right" />
        ) : (
          <mesh position={[0, WALL_H / 2, -HALF]}>
            <planeGeometry args={[ROOM, WALL_H]} />
            <meshBasicMaterial map={getWallTexture(wallRight)} side={DoubleSide} />
          </mesh>
        )}


        {/* Accent 橫帶（中型以上有：左牆 + 右牆各一條） */}
        {accent && (
          <>
            <mesh position={[-HALF + 0.01, WALL_H * 0.86, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[ROOM, 0.25]} />
              <meshBasicMaterial color={accent} side={DoubleSide} />
            </mesh>
            <mesh position={[0, WALL_H * 0.86, -HALF + 0.01]}>
              <planeGeometry args={[ROOM, 0.25]} />
              <meshBasicMaterial color={accent} side={DoubleSide} />
            </mesh>
          </>
        )}

        {/* 牆面窗戶：小辦公室以上才出現（依 officeLevel.windows 數量） */}
        <Windows3D />

        {/* 天花 + 牆角邊線（3 根合併為 1 個 instancedMesh） */}
        <CeilingBars />

        {/* Phase 4-8：互動建築 + 家具 + walker + 粒子 + HUD */}
        <Suspense fallback={null}>
          {BUILDING_LAYOUT.map((b) => (
            <Building3D key={b.kind} kind={b.kind} gx={b.gx} gy={b.gy} w={b.w} h={b.h} />
          ))}
          {/* 家具 sprite 角度不符 iso，暫時隱藏，待重產 */}
          {/* <ZoneFurniture3D /> */}
          <Walkers3D />
          <SakuraRain3D />
          <HrNotice3D />
          <PurchaseArea3D />
          <WallPolicy3D />
        </Suspense>
      </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

function PurchaseArea3D() {
  const purchases = useGameStore((s) => s.purchases);

  return (
    <>
      {PURCHASE_LAYOUT.map((item) => {
        const count = purchases[item.id] ?? 0;
        if (count === 0) return null;
        return (
          <FurnitureSprite
            key={item.id}
            src={item.src}
            gx={item.gx}
            gy={item.gy}
            w={item.w}
            h={item.h}
            yOffset={item.yOffset ?? 0}
            shadow={false}
          />
        );
      })}
    </>
  );
}

function CeilingBars() {
  const ref = useRef<ThreeInstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new Object3D();
    // 3 根：左上橫樑（沿 Z）、右上橫樑（沿 X）、左後角柱（沿 Y）
    const bars: Array<[[number, number, number], [number, number, number]]> = [
      [[-HALF, WALL_H, 0],        [0.06, 0.06, ROOM]],
      [[0, WALL_H, -HALF],        [ROOM, 0.06, 0.06]],
      [[-HALF, WALL_H / 2, -HALF], [0.06, WALL_H, 0.06]],
    ];
    bars.forEach(([pos, scale], i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.scale.set(scale[0], scale[1], scale[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 3]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#6d5a3a" />
    </instancedMesh>
  );
}

function WallPolicy3D() {
  const count = useGameStore((s) => s.purchases.policy ?? 0);
  const texture = usePixelTexture(JP_ASSETS.policyWall);
  if (count === 0) return null;
  // 貼在左牆（normal +X），放在背後區（z=-3），高度約一人半
  return (
    <mesh
      position={[-HALF + 0.04, WALL_H * 0.55, -3]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <planeGeometry args={[1.3, 1.8]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.1} side={DoubleSide} />
    </mesh>
  );
}

function Windows3D() {
  const officeLevel = useGameStore((s) => s.officeLevel);
  const level = OFFICE_LEVELS[officeLevel];
  const windows = level?.windows ?? 0;
  const theme = (level?.theme as WindowTheme | undefined) ?? 'kawaii';
  if (windows <= 0) return null;
  return (
    <>
      <WallWindow
        position={[-HALF + 0.03, WALL_H * 0.58, 0.5]}
        rotationY={Math.PI / 2}
        theme={theme}
      />
      {windows >= 2 && (
        <WallWindow
          position={[-1, WALL_H * 0.58, -HALF + 0.03]}
          rotationY={0}
          theme={theme}
        />
      )}
    </>
  );
}

function SakuraRain3D() {
  const texture = usePixelTexture(JP_ASSETS.sakuraPetal);
  const ref = useRef<ThreeInstancedMesh>(null);
  const count = 6;
  const petals = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * ROOM * 1.2,
        y: Math.random() * WALL_H + 2,
        z: (Math.random() - 0.5) * ROOM * 1.2,
        vy: 0.6 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        size: 0.25 + Math.random() * 0.25,
        rotZ: Math.random() * Math.PI * 2,
      })),
    [],
  );
  const dummy = useMemo(() => new Object3D(), []);

  useFrame((_, dt) => {
    if (typeof document !== 'undefined' && document.hidden) return;
    const mesh = ref.current;
    if (!mesh) return;
    const clampedDt = Math.min(dt, 0.1);
    for (let i = 0; i < count; i++) {
      const p = petals[i];
      p.y -= p.vy * clampedDt;
      p.x += p.vx * clampedDt;
      p.rotZ += clampedDt * 0.8;
      if (p.y < -0.2) {
        p.y = WALL_H + 2;
        p.x = (Math.random() - 0.5) * ROOM * 1.2;
        p.z = (Math.random() - 0.5) * ROOM * 1.2;
      }
      dummy.position.set(p.x, p.y, p.z);
      // 先 Y 轉 FACING_Y 面向 iso 相機，再 Z 軸自轉（花瓣翻面）
      dummy.rotation.set(0, FACING_Y, p.rotZ);
      dummy.scale.setScalar(p.size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.1} side={DoubleSide} opacity={0.9} />
    </instancedMesh>
  );
}

function IsoZoneLabels3D() {
  const zones = [
    { name: '🏋️ 健身', color: '#c0392b', gx: 1, gy: 1 },
    { name: '🖥️ 辦公', color: '#a36a3a', gx: 4.5, gy: 4.5 },
    { name: '🎾 玩具', color: '#2980b9', gx: 8, gy: 1 },
    { name: '🌸 裝飾', color: '#8e44ad', gx: 1, gy: 8 },
  ];
  return (
    <>
      {zones.map((z) => {
        const [x, , zPos] = gridToWorld(z.gx, z.gy);
        return (
          <Html
            key={z.name}
            position={[x, 0.5, zPos]}
            center
            distanceFactor={12}
            style={{ pointerEvents: 'none' }}
          >
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: 'rgba(253,247,234,0.92)',
                color: z.color,
                border: `1.5px solid ${z.color}`,
              }}
            >
              {z.name}
            </span>
          </Html>
        );
      })}
    </>
  );
}

function HrNotice3D() {
  const current = useGameStore((s) => s.current);
  const candidatePatience = useGameStore((s) => s.candidatePatience);
  const vacancy = useGameStore((s) => s.vacancy);
  const openDrawer = useUiStore((s) => s.openDrawer);

  if (!current && !vacancy) return null;
  // 候選人站在地板最南方（iso 前角外）
  const [x, , z] = gridToWorld(9.5, 9.5);
  const y = 1.8;

  const patienceBg =
    !current ? '#eadfce'
      : candidatePatience <= 1 ? '#ffd4d4'
        : candidatePatience <= 2 ? '#ffe3c3'
          : '#d4ecd4';
  const patienceColor =
    !current ? '#7a685a'
      : candidatePatience <= 1 ? '#c0392b'
        : candidatePatience <= 2 ? '#b45a1c'
          : '#2f7a3a';

  // 不用 distanceFactor（orthographic 下會偶發 scale 失控變巨大橢圓），改用固定 HTML 大小
  return (
    <Html position={[x, y, z]} center zIndexRange={[10, 0]}>
      <div
        className="flex flex-col items-center"
        style={{ cursor: current ? 'pointer' : 'default' }}
        onClick={() => current && openDrawer('hr')}
      >
        <div
          className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{
            background: 'rgba(255,255,255,0.97)',
            border: '1.5px solid #8b6a45',
            color: '#3d2f25',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
        >
          {current ? `${current.name} 來面試！` : '今天沒人來...'}
        </div>
        {current && (
          <>
            <div style={{ fontSize: 28, marginTop: 2, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))' }}>
              {current.emoji}
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ background: patienceBg, color: patienceColor, marginTop: 2 }}
            >
              剩 {candidatePatience} 天
            </span>
          </>
        )}
      </div>
    </Html>
  );
}

function Walkers3D() {
  const walkers = useWalkerStore((s) => s.walkers);
  const bounds = useWalkerStore((s) => s.bounds);

  if (!bounds || bounds.w === 0 || bounds.h <= bounds.floorTop) return null;

  return (
    <>
      {walkers.map((w) => {
        const image = w.dogData.image || ROLE_IMAGE_MAP[w.dogData.role];
        if (!image) return null;
        // px 座標 → iso grid
        const gx = (w.x / bounds.w) * ROOM_GRID;
        const gy =
          ((w.y - bounds.floorTop) / (bounds.h - bounds.floorTop)) * ROOM_GRID;
        return (
          <WalkerSprite
            key={w.id}
            gx={gx}
            gy={gy}
            src={image}
            facingRight={w.facingRight}
            walking={w.idleTimer <= 0}
          />
        );
      })}
    </>
  );
}

function WalkerSprite({
  gx,
  gy,
  src,
  facingRight,
  walking,
}: {
  gx: number;
  gy: number;
  src: string;
  facingRight: boolean;
  walking: boolean;
}) {
  const texture = usePixelTexture(src);
  const [x, , z] = gridToWorld(gx, gy);
  const bob = walking ? Math.sin(Date.now() / 160) * 0.04 : 0;
  const img = texture.image as HTMLImageElement | undefined;
  const aspect = img && img.width && img.height ? img.width / img.height : 1;
  const height = 1.3;
  const width = height * aspect;
  return (
    <mesh
      position={[x, height / 2 + bob - SPRITE_Y_COMPENSATION * 0.4, z]}
      rotation={[0, FACING_Y, 0]}
      scale={[facingRight ? 1 : -1, 1, 1]}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.1} side={DoubleSide} />
    </mesh>
  );
}

function GroundShadow({
  gx,
  gy,
  radius = 0.5,
  opacity = 1,
  yOffset = 0,
}: {
  gx: number;
  gy: number;
  radius?: number;
  opacity?: number;
  yOffset?: number;
}) {
  const tex = getShadowTexture();
  const [x, , z] = gridToWorld(gx, gy);
  const w = radius * 2;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02 + yOffset, z]}>
      <planeGeometry args={[w, w * 0.55]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

// 面朝 iso 相機（[20,18,20]）的固定 Y 軸旋轉角度
const FACING_Y = Math.PI / 4;

// Sprite 底部補償（0 = plane 底邊貼地，避免被地板裁切）
const SPRITE_Y_COMPENSATION = 0;

// 產生 radial-gradient 陰影 texture（比純色圓更像真實投影）
let _shadowTex: CanvasTexture | null = null;
function getShadowTexture(): CanvasTexture {
  if (_shadowTex) return _shadowTex;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.45, 'rgba(0,0,0,0.3)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  _shadowTex = new CanvasTexture(canvas);
  return _shadowTex;
}

// 窗外風景（按 theme 挑選 + 窗框一體）
// 把所有元素畫到一張 CanvasTexture，整個窗戶從 10+ plane meshes 降到 1 個 draw call
type WindowTheme = 'kawaii' | 'shibuya' | 'skyline' | 'zen';

// 共用工具：在任一 ctx 上畫窗框 + 窗格 + 窗台
function drawWindowFrame(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  frameCol: string, frameHi: string, muntinCol: string, sillCol: string,
) {
  const frameT = 10;
  const muntinT = 3;
  const sillH = 6;
  ctx.fillStyle = frameCol;
  ctx.fillRect(0, 0, W, frameT);
  ctx.fillRect(0, H - frameT - sillH, W, frameT);
  ctx.fillRect(0, 0, frameT, H);
  ctx.fillRect(W - frameT, 0, frameT, H);
  ctx.fillStyle = frameHi;
  ctx.fillRect(frameT, frameT - 2, W - frameT * 2, 2);
  ctx.fillRect(frameT - 2, frameT, 2, H - frameT * 2 - sillH);
  ctx.fillStyle = muntinCol;
  ctx.fillRect(frameT, H / 2 - muntinT / 2, W - frameT * 2, muntinT);
  ctx.fillRect(W / 2 - muntinT / 2, frameT, muntinT, H - frameT * 2 - sillH);
  ctx.fillStyle = sillCol;
  ctx.fillRect(0, H - sillH, W, sillH);
}

function finalizeTex(canvas: HTMLCanvasElement): CanvasTexture {
  const tex = new CanvasTexture(canvas);
  tex.magFilter = NearestFilter;
  tex.minFilter = NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

// --- kawaii 花園（Lv0-1） ---
let _sceneryTex: CanvasTexture | null = null;
function getSceneryTexture(): CanvasTexture {
  if (_sceneryTex) return _sceneryTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;

  // 天空（kawaii pastel 粉藍→蜜桃）
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.75);
  sky.addColorStop(0, '#cfe8f5');
  sky.addColorStop(0.6, '#fce9dc');
  sky.addColorStop(1, '#fff0e4');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.72);

  // 蓬蓬雲
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  const clouds: Array<[number, number, number]> = [
    [48, 32, 14],
    [155, 22, 12],
    [215, 42, 13],
  ];
  clouds.forEach(([cx, cy, r]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.75, cy + 2, r * 0.85, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.75, cy + 3, r * 0.75, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.3, cy - r * 0.5, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  });

  // 小太陽
  ctx.beginPath();
  ctx.arc(W * 0.82, H * 0.22, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe5a0';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W * 0.82, H * 0.22, 18, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 220, 150, 0.35)';
  ctx.fill();

  // 後排蓬蓬樹叢（淡綠）
  ctx.fillStyle = '#c4dcb4';
  for (let i = 0; i < 6; i++) {
    const cx = i * (W / 5) - 10;
    const cy = H * 0.66;
    const r = 18 + (i % 2) * 6;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.65, cy + 2, r * 0.85, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.65, cy + 2, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  // 前排灌木（較深綠）
  ctx.fillStyle = '#8fc080';
  for (let i = 0; i < 4; i++) {
    const cx = i * (W / 3) + 20;
    const cy = H * 0.78;
    const r = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.7, cy, r * 0.85, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.7, cy, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  // 草地（底層漸層）
  const grass = ctx.createLinearGradient(0, H * 0.82, 0, H);
  grass.addColorStop(0, '#b8d89a');
  grass.addColorStop(1, '#9ec47c');
  ctx.fillStyle = grass;
  ctx.fillRect(0, H * 0.82, W, H * 0.18);

  // 小花（粉、黃、紫、白點點）
  const flowers: Array<[number, number, string]> = [
    [20, 150, '#ffb3c6'],
    [40, 172, '#ffd36a'],
    [72, 158, '#d4aef5'],
    [96, 176, '#ffffff'],
    [128, 162, '#ffb3c6'],
    [155, 178, '#ffd36a'],
    [188, 154, '#d4aef5'],
    [212, 170, '#ffb3c6'],
    [238, 160, '#ffffff'],
  ];
  flowers.forEach(([fx, fy, col]) => {
    // 花瓣（4 小圓）
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(fx - 2, fy, 2.2, 0, Math.PI * 2);
    ctx.arc(fx + 2, fy, 2.2, 0, Math.PI * 2);
    ctx.arc(fx, fy - 2, 2.2, 0, Math.PI * 2);
    ctx.arc(fx, fy + 2, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // 花心
    ctx.fillStyle = '#fff2a0';
    ctx.beginPath();
    ctx.arc(fx, fy, 1.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 蝴蝶
  const butterfly = (bx: number, by: number, col: string) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(bx - 4, by, 3.5, 4.5, -0.3, 0, Math.PI * 2);
    ctx.ellipse(bx + 4, by, 3.5, 4.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(bx - 0.5, by - 2, 1, 4);
  };
  butterfly(W * 0.3, H * 0.4, '#ff9bb8');
  butterfly(W * 0.6, H * 0.35, '#c8a6f0');

  drawWindowFrame(ctx, W, H, '#d4a574', '#f3d9b0', '#e8c49b', '#b88862');
  _sceneryTex = finalizeTex(canvas);
  return _sceneryTex;
}

// --- Shibuya 辦公室（Lv2）：白天公園 + 矮樓 + 行道樹 ---
let _shibuyaTex: CanvasTexture | null = null;
function getShibuyaTexture(): CanvasTexture {
  if (_shibuyaTex) return _shibuyaTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width, H = canvas.height;
  // 天空（白天淡藍）
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
  sky.addColorStop(0, '#b8d7e8'); sky.addColorStop(1, '#dce8ed');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.6);
  // 遠矮樓（灰階分層）
  const buildings: Array<[number, number, number, string]> = [
    [10, 90, 40, '#a8b0b8'], [45, 75, 35, '#9098a0'], [75, 85, 45, '#b0b8c0'],
    [115, 70, 38, '#969ea8'], [150, 90, 42, '#a8b0b8'], [188, 78, 36, '#8a92a0'],
    [220, 88, 30, '#a0a8b0'],
  ];
  buildings.forEach(([x, y, h, col]) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, 30, h);
    // 窗戶（規律小方格）
    ctx.fillStyle = '#ffe599';
    for (let wy = y + 8; wy < y + h - 8; wy += 10) {
      for (let wx = x + 4; wx < x + 26; wx += 8) ctx.fillRect(wx, wy, 3, 4);
    }
  });
  // 行道樹（圓球樹冠）
  ctx.fillStyle = '#6a8a5f';
  for (let i = 0; i < 8; i++) {
    const cx = i * 32 + 12, cy = H * 0.73;
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(cx - 1, cy + 8, 2, 6);
    ctx.fillStyle = '#6a8a5f';
  }
  // 人行道
  ctx.fillStyle = '#c0b8ac'; ctx.fillRect(0, H * 0.82, W, H * 0.18);
  ctx.fillStyle = '#9a9288';
  for (let x = 0; x < W; x += 16) ctx.fillRect(x, H * 0.85, 1, H * 0.12);

  drawWindowFrame(ctx, W, H, '#a3896a', '#c4a882', '#b89a7a', '#7a6444');
  _shibuyaTex = finalizeTex(canvas);
  return _shibuyaTex;
}

// --- 高層辦公樓（Lv3）：天際線 + 雲 ---
let _skylineTex: CanvasTexture | null = null;
function getSkylineTexture(): CanvasTexture {
  if (_skylineTex) return _skylineTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width, H = canvas.height;
  // 天空（高空藍）
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#7ca8cc'); sky.addColorStop(0.7, '#b8d4e4'); sky.addColorStop(1, '#d8e4ec');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // 層狀雲（半透白）
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  [[30, 50, 18], [120, 35, 22], [200, 55, 16], [70, 80, 14], [170, 75, 20]].forEach(([cx, cy, r]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.7, cy + 1, r * 0.8, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.7, cy + 2, r * 0.75, 0, Math.PI * 2);
    ctx.fill();
  });
  // 高層建築群（俯瞰感，下半部）
  const sky2: Array<[number, number, number, string]> = [
    [8, 60, 100, '#5a6878'], [32, 40, 120, '#6a7888'],
    [60, 30, 130, '#4a5868'], [90, 50, 110, '#7888a0'],
    [118, 25, 135, '#5a6a7a'], [150, 45, 115, '#6a7a8a'],
    [180, 35, 125, '#4a5868'], [208, 50, 110, '#7888a0'],
    [230, 42, 118, '#5a6878'],
  ];
  sky2.forEach(([x, topY, bh, col]) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, topY, 22, bh);
    // 玻璃窗反光（規律小方格）
    ctx.fillStyle = '#d8e8f0';
    for (let wy = topY + 6; wy < topY + bh - 4; wy += 7) {
      for (let wx = x + 3; wx < x + 20; wx += 5) ctx.fillRect(wx, wy, 2, 3);
    }
  });
  // 前景矮雲（讓畫面有層次）
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.arc(45, H - 15, 12, 0, Math.PI * 2);
  ctx.arc(58, H - 18, 10, 0, Math.PI * 2); ctx.fill();

  drawWindowFrame(ctx, W, H, '#7a94a8', '#a5bac9', '#94a8b8', '#5a6a80');
  _skylineTex = finalizeTex(canvas);
  return _skylineTex;
}

// --- 和風禪意頂樓（Lv4）：夜景 + 月亮 + 櫻花樹 ---
let _zenTex: CanvasTexture | null = null;
function getZenTexture(): CanvasTexture {
  if (_zenTex) return _zenTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width, H = canvas.height;
  // 夜空（深藍紫漸層）
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#1a1838'); sky.addColorStop(0.5, '#2d2a50'); sky.addColorStop(1, '#4a3c5c');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // 星星
  ctx.fillStyle = '#fffaea';
  const stars = [[35, 25], [80, 18], [140, 32], [175, 15], [220, 28], [60, 40], [195, 42], [110, 22]];
  stars.forEach(([x, y]) => {
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1);
    ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1);
  });
  // 月亮
  ctx.beginPath(); ctx.arc(W * 0.78, H * 0.24, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#fff2c4'; ctx.fill();
  ctx.beginPath(); ctx.arc(W * 0.78, H * 0.24, 25, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 230, 160, 0.2)'; ctx.fill();
  // 遠山剪影
  ctx.fillStyle = '#2a2040';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.65);
  ctx.lineTo(40, H * 0.5); ctx.lineTo(85, H * 0.58);
  ctx.lineTo(130, H * 0.48); ctx.lineTo(175, H * 0.55);
  ctx.lineTo(220, H * 0.5); ctx.lineTo(W, H * 0.58);
  ctx.lineTo(W, H * 0.72); ctx.lineTo(0, H * 0.72); ctx.closePath(); ctx.fill();
  // 櫻花樹剪影（前景）
  ctx.fillStyle = '#1a0e24';
  ctx.fillRect(20, H * 0.55, 3, H * 0.28);
  // 樹冠（粉色點點）
  ctx.fillStyle = '#ffb3d1';
  for (let i = 0; i < 30; i++) {
    const rx = 21 + Math.sin(i * 1.7) * 18;
    const ry = H * 0.58 + Math.cos(i * 1.3) * 14;
    ctx.beginPath(); ctx.arc(rx, ry, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  // 城市夜景小點（遠處建築窗燈）
  ctx.fillStyle = '#ffcc66';
  for (let i = 0; i < 40; i++) {
    const x = 60 + Math.sin(i * 2.3) * 80 + i * 4;
    const y = H * 0.66 + (i % 3) * 3;
    if (x < W - 15) ctx.fillRect(x, y, 1, 1);
  }

  drawWindowFrame(ctx, W, H, '#2a1a10', '#c9a064', '#8a6a40', '#1a0e08');
  _zenTex = finalizeTex(canvas);
  return _zenTex;
}

function getSceneryTextureFor(theme: WindowTheme): CanvasTexture {
  switch (theme) {
    case 'shibuya': return getShibuyaTexture();
    case 'skyline': return getSkylineTexture();
    case 'zen': return getZenTexture();
    default: return getSceneryTexture();
  }
}

// 地板 grid（烘焙到 CanvasTexture，零 shader cost；不同底色獨立 cache）
const _floorTexCache = new Map<string, CanvasTexture>();
function shadeHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const adj = (v: number) => {
    const t = amount >= 0 ? 255 - v : v;
    return Math.max(0, Math.min(255, Math.round(v + t * amount)));
  };
  return `rgb(${adj(r)},${adj(g)},${adj(b)})`;
}

function randSeed(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

function getFloorTexture(floorCol: string, gridCol: string): CanvasTexture {
  const key = `${floorCol}|${gridCol}`;
  const hit = _floorTexCache.get(key);
  if (hit) return hit;
  const SIZE = 1024;
  const GRID = 17;
  const CELL = SIZE / GRID;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;

  const lightCol = shadeHex(floorCol, 0.10);
  const darkCol = shadeHex(floorCol, -0.06);

  // 西洋棋盤：淡 vs 稍深交錯
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      ctx.fillStyle = (gx + gy) % 2 === 0 ? lightCol : darkCol;
      ctx.fillRect(gx * CELL, gy * CELL, CELL, CELL);
    }
  }

  // 淡大理石紋路：每格 1-2 條柔和曲線
  ctx.strokeStyle = shadeHex(floorCol, 0.20);
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.32;
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const cx = gx * CELL;
      const cy = gy * CELL;
      const lineN = 1 + Math.floor(randSeed(gx * 13 + gy * 17) * 2);
      for (let i = 0; i < lineN; i++) {
        ctx.beginPath();
        const x1 = cx + randSeed(gx + gy * 11 + i * 3) * CELL;
        const y1 = cy + randSeed(gx + gy * 7 + i * 5) * CELL;
        const x2 = cx + randSeed(gx + gy * 5 + i * 7) * CELL;
        const y2 = cy + randSeed(gx + gy * 3 + i * 11) * CELL;
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(
          cx + randSeed(gx + gy * 2 + i * 2) * CELL,
          cy + randSeed(gx + gy + i * 5) * CELL,
          x2,
          y2,
        );
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;

  // 淡粉色縫線
  ctx.strokeStyle = shadeHex(floorCol, -0.15);
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID; i++) {
    const p = i * CELL;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(SIZE, p); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  void gridCol;

  const tex = new CanvasTexture(canvas);
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  _floorTexCache.set(key, tex);
  return tex;
}

const _wallTexCache = new Map<string, CanvasTexture>();
function getWallTexture(wallCol: string): CanvasTexture {
  const hit = _wallTexCache.get(wallCol);
  if (hit) return hit;
  const W = 1024;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // 底色
  ctx.fillStyle = wallCol;
  ctx.fillRect(0, 0, W, H);

  // 直向細條紋（比底色再深一點點的壁紙條紋）
  ctx.fillStyle = shadeHex(wallCol, -0.08);
  ctx.globalAlpha = 0.45;
  const STRIPE_GAP = 24;
  const STRIPE_W = 1;
  for (let x = 0; x < W; x += STRIPE_GAP) {
    ctx.fillRect(x, 0, STRIPE_W, H);
  }
  ctx.globalAlpha = 1;

  // 肉球 paw prints：交錯分佈、稀疏
  const pawCol = shadeHex(wallCol, -0.14);
  ctx.fillStyle = pawCol;
  ctx.globalAlpha = 0.28;
  const ROWS = 5;
  const COLS = 7;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const offset = r % 2 === 0 ? 0.25 : 0.75;
      const cx = (c + offset) * (W / COLS);
      const cy = (r + 0.5) * (H / ROWS);
      drawPaw(ctx, cx, cy, 9);
    }
  }
  ctx.globalAlpha = 1;

  const tex = new CanvasTexture(canvas);
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  _wallTexCache.set(wallCol, tex);
  return tex;
}

function drawPaw(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  // 主掌
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.35, size * 0.65, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // 四個腳趾（扇形排列在上方）
  const toeAngles = [-0.75, -0.28, 0.28, 0.75];
  for (const a of toeAngles) {
    const tx = cx + Math.sin(a) * size * 0.85;
    const ty = cy - Math.cos(a) * size * 0.55;
    ctx.beginPath();
    ctx.ellipse(tx, ty, size * 0.25, size * 0.33, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 每個主題配對應的 grid 色（避免暗底板上畫暗格看不到、亮底板上畫亮格太刺眼）
function floorGridColorFor(theme: WindowTheme | undefined, floorCol: string): string {
  if (theme === 'zen') return '#8a6a3a';       // 暖深木 → 淺金 grid
  if (theme === 'skyline') return '#7a6850';   // 冷色深地板 → 暗棕 grid
  if (theme === 'shibuya') return '#8a7458';   // 原木地板 → 深棕 grid
  void floorCol;
  return '#d9b890';                            // 預設 kawaii 淡粉棕
}

/**
 * 牆面窗戶 + 窗外花園
 * 單 plane mesh（框/窗格/窗台/風景都畫在同一張 CanvasTexture）
 */
function WallWindow({
  position,
  rotationY,
  theme = 'kawaii',
  width = 2.8,
  height = 2.2,
}: {
  position: [number, number, number];
  rotationY: number;
  theme?: WindowTheme;
  width?: number;
  height?: number;
}) {
  const tex = getSceneryTextureFor(theme);
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={tex} side={DoubleSide} toneMapped={false} transparent />
    </mesh>
  );
}

function FurnitureSprite({
  src,
  gx,
  gy,
  w,
  h,
  yOffset = 0,
  shadow = true,
}: {
  src: string;
  gx: number;
  gy: number;
  w: number;
  h: number;
  yOffset?: number;
  shadow?: boolean;
}) {
  const texture = usePixelTexture(src);
  const [x, , z] = gridToWorld(gx, gy);
  return (
    <>
      {/* 陰影暫時關閉 */}
      {false && shadow && yOffset === 0 && (
        <GroundShadow gx={gx} gy={gy} radius={Math.min(w, h) * 0.45} opacity={0.3} />
      )}
      <mesh
        position={[x, h / 2 + yOffset - SPRITE_Y_COMPENSATION, z]}
        rotation={[0, FACING_Y, 0]}
      >
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.1} side={DoubleSide} />
      </mesh>
    </>
  );
}

function ZoneFurniture3D() {
  const staff = useGameStore((s) => s.staff);
  void staff;
  const officeLevel = useGameStore((s) => s.officeLevel);
  const decor = useGameStore((s) => s.decor);
  const purchases = useGameStore((s) => s.purchases);
  const level = OFFICE_LEVELS[officeLevel];

  const cap = (id: ShopItemEffectKey) => Math.min(purchases[id] ?? 0, 4);
  const items: React.ReactNode[] = [];

  // 健身區：啞鈴
  const gymGrids: [number, number][] = [[1, 0], [0, 1], [1, 1], [0, 2]];
  const gymTotal = Math.min(1 + cap('gym'), gymGrids.length);
  for (let i = 0; i < gymTotal; i++) {
    const [gx, gy] = gymGrids[i];
    items.push(
      <FurnitureSprite key={`gym-${i}`} src={JP_ASSETS.dumbbell} gx={gx} gy={gy} w={1.1} h={0.7} />,
    );
  }

  // 辦公區：桌子 + CRT
  const deskGrids: [number, number][] = [
    [3, 3], [5, 3], [3, 5], [5, 5], [4, 4], [6, 4], [4, 6], [6, 6], [3, 4], [5, 4],
  ];
  const deskCount = Math.min(level.desks, deskGrids.length);
  for (let i = 0; i < deskCount; i++) {
    const [gx, gy] = deskGrids[i];
    items.push(
      <FurnitureSprite key={`desk-${i}`} src={JP_ASSETS.woodenDesk} gx={gx} gy={gy} w={1.8} h={1.2} />,
    );
    if (i < cap('desk')) {
      items.push(
        <FurnitureSprite
          key={`monitor-${i}`}
          src={JP_ASSETS.crtMonitor}
          gx={gx}
          gy={gy}
          w={0.9}
          h={0.8}
          yOffset={1.0}
        />,
      );
    }
  }

  // 書架（後牆右側）
  const shelfGrids: [number, number][] = [[8, 0], [7, 0], [9, 0]];
  const shelfCount = Math.min(level.shelves, shelfGrids.length);
  for (let i = 0; i < shelfCount; i++) {
    const [gx, gy] = shelfGrids[i];
    items.push(
      <FurnitureSprite key={`shelf-${i}`} src={JP_ASSETS.bookshelf} gx={gx} gy={gy} w={1.6} h={1.4} />,
    );
  }

  // 辦公區點綴
  for (let i = 0; i < cap('policy'); i++) {
    items.push(
      <FurnitureSprite key={`policy-${i}`} src={JP_ASSETS.clipboard} gx={3 + (i % 3)} gy={6} w={0.7} h={0.9} />,
    );
  }
  for (let i = 0; i < cap('snack'); i++) {
    items.push(
      <FurnitureSprite
        key={`snack-${i}`}
        src={JP_ASSETS.snackJar}
        gx={4 + (i % 2)}
        gy={3}
        w={0.5}
        h={0.65}
        yOffset={1.2}
      />,
    );
  }
  for (let i = 0; i < cap('artwall'); i++) {
    items.push(
      <FurnitureSprite
        key={`art-${i}`}
        src={JP_ASSETS.pictureFrame}
        gx={3.5 + i * 1.2}
        gy={0.3}
        w={1.2}
        h={1.0}
        yOffset={2.5}
      />,
    );
  }

  // 玩具區：網球
  const toyGrids: [number, number][] = [[8, 1], [9, 1], [7, 2], [8, 2], [9, 2], [7, 3]];
  const toyTotal = Math.min(1 + cap('toy'), toyGrids.length);
  for (let i = 0; i < toyTotal; i++) {
    const [gx, gy] = toyGrids[i];
    items.push(
      <FurnitureSprite key={`ball-${i}`} src={JP_ASSETS.toyBall} gx={gx} gy={gy} w={0.6} h={0.6} />,
    );
  }

  // 裝飾角：盆栽
  const plantGrids: [number, number][] = [[0, 7], [1, 8], [0, 9], [2, 7], [0, 8], [1, 9]];
  const plantSrcs = [JP_ASSETS.bonsai, JP_ASSETS.bambooPot, JP_ASSETS.sakuraBranch];
  const plantTotal = Math.min(level.plants + decor, plantGrids.length);
  for (let i = 0; i < plantTotal; i++) {
    const [gx, gy] = plantGrids[i];
    items.push(
      <FurnitureSprite
        key={`plant-${i}`}
        src={plantSrcs[i % plantSrcs.length]}
        gx={gx}
        gy={gy}
        w={1.0}
        h={1.2}
      />,
    );
  }

  return <>{items}</>;
}

const SRC_MAP: Record<BuildingKind, string> = {
  shop: JP_ASSETS.shopBuilding,
  dorm: JP_ASSETS.dormBuilding,
  hr: JP_ASSETS.hrOffice,
};

function Building3D({
  kind,
  gx,
  gy,
  w,
  h,
}: {
  kind: BuildingKind;
  gx: number;
  gy: number;
  w: number;
  h: number;
}) {
  const openDrawer = useUiStore((s) => s.openDrawer);
  const hasCurrent = useGameStore((s) => !!s.current);
  const morale = useGameStore((s) => s.morale);
  const money = useGameStore((s) => s.money);
  const [hover, setHover] = useState(false);

  const texture = usePixelTexture(SRC_MAP[kind]);
  const [x, , z] = gridToWorld(gx, gy);

  const needNotif =
    kind === 'hr' ? hasCurrent : kind === 'dorm' ? morale < 40 : money < 50;
  const hoverScale = hover ? 1.08 : 1;
  const yOffset = hover ? 0.15 : 0;

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(true);
    document.body.style.cursor = 'pointer';
  };
  const handleOut = () => {
    setHover(false);
    document.body.style.cursor = 'auto';
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    openDrawer(kind);
  };

  return (
    <group position={[x, 0, z]}>
      <mesh
        position={[0, h / 2 + yOffset - SPRITE_Y_COMPENSATION, 0]}
        rotation={[0, FACING_Y, 0]}
        scale={[hoverScale, hoverScale, 1]}
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.1} side={DoubleSide} />
      </mesh>
      {needNotif && (
        <Billboard position={[w / 2 - 0.15, h - 0.15 + yOffset, 0]}>
          <mesh>
            <circleGeometry args={[0.15, 24]} />
            <meshBasicMaterial color="#d75d5d" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <ringGeometry args={[0.15, 0.19, 24]} />
            <meshBasicMaterial color="#fffaf0" />
          </mesh>
        </Billboard>
      )}
    </group>
  );
}
