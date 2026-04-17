export type Stats = {
  productivity: number;
  morale: number;
  stability: number;
  revenue: number;
};

export type DogRole = {
  role: string;
  breed: string;
  emoji: string;
  names: string[];
  traits: string[];
  flavor: string;
  passive: string;
  motto: string;
  baseStats: Stats;
  isCEO?: boolean;
};

export type Dog = {
  role: string;
  breed: string;
  emoji: string;
  name: string;
  traits: string[];
  flavor: string;
  passive: string;
  motto: string;
  stats: Stats;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  expectedSalary: number;
  severance: number;
  patience: number;
  score: number;
  image: string;
  isCEO?: boolean;
  interview?: { q: string; goodAnswer: string; badAnswer: string };
  status?: 'active' | 'pip';
  pipDaysLeft?: number;
  pipScore?: number;
  pipTasks?: PipTask[];
};

export type PipTask = {
  text: string;
  done: boolean;
};

export type ChemistryCombo = {
  roles: string[];
  type: 'positive' | 'negative';
  bonus: Partial<Stats>;
  msg: string;
};

export type InterviewQuestion = {
  q: string;
  goodAnswer: string;
  badAnswer: string;
};

export type TrainingQuestion = {
  q: string;
  options: string[];
  answer: number;
  reward: number;
};

export type OfficeLevel = {
  name: string;
  maxStaff: number;
  upgradeCost: number;
  wall: string;
  floor: string;
  desks: number;
  windows: number;
  shelves: number;
  plants: number;
  coffee: number;
  lights: number;
  lounge: number;
};

export type ShopItemEffectKey =
  | 'snack'
  | 'toy'
  | 'desk'
  | 'policy'
  | 'lamp'
  | 'sofa'
  | 'artwall'
  | 'coffee'
  | 'gym';

export type ShopItem = {
  id: ShopItemEffectKey;
  name: string;
  cost: number;
  desc: string;
  statTags: { label: string; type: 'up' | 'down' }[];
};

export type Walker = {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  idleTimer: number;
  facingRight: boolean;
  dogData: Dog;
};

export type FrisbeeTreat = {
  x: number;
  y: number;
  speed: number;
  emoji: string;
  pts: number;
  id: number;
};

export type FrisbeeGameState = {
  type: 'frisbee';
  timeLeft: number;
  score: number;
  treats: FrisbeeTreat[];
  dogX: number;
  spawnTick: number;
  running: boolean;
  moveDir: number;
};

export type MemoryCard = {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
};

export type MemoryGameState = {
  type: 'memory';
  cards: MemoryCard[];
  flippedIds: number[];
  matches: number;
  moves: number;
  running: boolean;
  timeLeft: number;
};

export type MiniGameState = FrisbeeGameState | MemoryGameState;

export type TrainingSession = {
  question: TrainingQuestion;
  selected: number | null;
  correct: boolean | null;
  totalReward: number;
  questionIndex: number;
  maxQuestions: number;
  finished: boolean;
};

export type StaffActionModal = {
  staffIndex: number;
};

export type ChemistryEntry = {
  key: string;
  combo: ChemistryCombo;
};

export type LogEntry = {
  day: number;
  msg: string;
};

export type TutorialStep = {
  title: string;
  body: string;
  target?: string;
};

export type GameState = {
  day: number;
  money: number;
  morale: number;
  health: number;
  decor: number;
  productivityBoost: number;
  stabilityBoost: number;
  trainingBoost: number;
  officeLevel: number;
  staff: Dog[];
  staffActionModal: StaffActionModal | null;
  queue: Dog[];
  current: Dog | null;
  candidatePatience: number;
  log: LogEntry[];
  miniGame: MiniGameState | null;
  trainingSession: TrainingSession | null;
  candidateReaction: string | null;
  showSplash: boolean;
  tutorialStep: number;
  vacancy: boolean;
  vacancyTimer: number;
  activeChemistry: ChemistryEntry[];
  bankrupt: boolean;
  activeTab: 'shop' | 'staff';
  speedMultiplier: number;
  dayElapsed: number;
  toast: { msg: string; type: 'positive' | 'negative' } | null;
};
