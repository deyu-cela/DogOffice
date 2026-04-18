const BASE = `${import.meta.env.BASE_URL}assets/jp-office/`;

export const JP_ASSETS = {
  manekiNeko: `${BASE}maneki_neko.png`,
  lanternRed: `${BASE}lantern_red.png`,
  bonsai: `${BASE}bonsai.png`,
  bambooPot: `${BASE}bamboo_pot.png`,
  sakuraBranch: `${BASE}sakura_branch.png`,
  sakuraPetal: `${BASE}sakura_petal.png`,
  beanBag: `${BASE}bean_bag.png`,
  coffeeMachine: `${BASE}coffee_machine.png`,
  bookshelf: `${BASE}bookshelf.png`,
  pictureFrame: `${BASE}picture_frame.png`,
  snackJar: `${BASE}snack_jar.png`,
  toyBall: `${BASE}toy_ball.png`,
  clipboard: `${BASE}clipboard.png`,
  crtMonitor: `${BASE}crt_monitor.png`,
  dumbbell: `${BASE}dumbbell.png`,
  shojiWindow: `${BASE}shoji_window.png`,
  shojiDoor: `${BASE}shoji_door.png`,
  tatamiTexture: `${BASE}tatami_texture.png`,
  woodFloorTexture: `${BASE}wood_floor_texture.png`,
  woodenDesk: `${BASE}wooden_desk.png`,
  daruma: `${BASE}daruma.png`,
  shopBuilding: `${BASE}shop_building.png`,
  dormBuilding: `${BASE}dorm_building.png`,
  hrOffice: `${BASE}hr_office.png`,
  wallClock: `${BASE}wall_clock.png`,
  wallScroll: `${BASE}wall_scroll.png`,
} as const;

export const PIXEL_IMG_STYLE: React.CSSProperties = {
  imageRendering: 'pixelated',
  userSelect: 'none',
  pointerEvents: 'none',
};
