// === 員工 4 維 stats（範圍 1-10）===
export type Stats = {
  speed: number;
  quality: number;
  teamwork: number;
  charisma: number;
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
  category: ProjectCategory | 'all'; // 對口類別，all 代表全能（PM/CEO）
  isCEO?: boolean;
};

export type Dog = {
  id: string;                    // 唯一識別（升級/挖角/事件用）
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

  // 接案制新欄位
  morale: number;                // 個人士氣 0-100，初始 70
  fatigue: number;               // 疲勞 0-100，初始 0
  loyalty: number;               // 忠誠度 0-100，初始 50
  experience: number;            // 累積經驗，0 起跳
  assignedProjectId: string | null; // 目前指派到的案子 id
  daysAtCompany: number;         // 在公司多少天（loyalty 自然累積）
  unhappyLeaveDays: number;      // 連續被拒請假的次數（連 3 直接離職）
};

export type PipTask = {
  text: string;
  done: boolean;
};

// === 案件相關 ===
export type ProjectCategory = 'tech' | 'design' | 'marketing' | 'service';

export type ClientTier = 1 | 2 | 3 | 4 | 5;

export type ProjectStatus = 'offered' | 'active' | 'done' | 'failed' | 'late';

export type ProjectEventKind =
  | 'changeRequest'   // 客戶變更需求（合併加塞+規格大改）
  | 'earlyDeliver'    // 驗收提前
  | 'upsell'          // 客戶加碼
  | 'bugBurst'        // BUG 大爆發
  | 'dogLeaveAsk'     // 員工想請假
  | 'poaching';       // 競爭對手挖角

export type ProjectEvent = {
  kind: ProjectEventKind;
  triggeredDay: number;
  resolved: boolean;
  // 挖角/請假事件需要鎖定特定員工
  targetDogId?: string;
};

export type Project = {
  id: string;
  clientName: string;
  clientTier: ClientTier;
  category: ProjectCategory;
  title: string;
  difficulty: number;
  workRequired: number;
  workDone: number;
  qualitySum: number;            // Σ(每日 quality × 該日 speed 貢獻)
  expectedQuality: number;
  reward: number;
  penalty: number;
  defaultDeadlineDays: number;   // tier 對應的期限天數（接案時用來算 deadlineDay）
  deadlineDay: number;           // 絕對 day 數，offered 狀態 = -1 表示未啟動
  graceDays: number;             // 容忍超期
  assignedStaffIds: string[];
  status: ProjectStatus;
  reputationDelta: { success: number; fail: number };
  createdDay: number;
  acceptedDay?: number;
  // 中途事件
  events: ProjectEvent[];
  pendingEvent: ProjectEvent | null;  // 玩家待處理事件
  // 連鎖效果暫存
  rewardMul: number;             // 累積 reward 倍率（事件可改）
  qualityMul: number;            // 累積 quality 倍率（事件可改）
  eventCount: number;            // 已觸發事件次數（最多 2 次）
  bonusEventChance: number;      // 後續事件機率加成（事件可改）
};

export type ChemistryCombo = {
  roles: string[];
  type: 'positive' | 'negative';
  // 對口加成（多種可能 key，per-project 觸發）
  bonus: {
    speedMul?: number;
    qualityMul?: number;
    teamworkMul?: number;
    charismaMul?: number;
    moraleDelta?: number;       // 隊員士氣變化（每日）
  };
  category?: ProjectCategory | 'any';  // 限定哪類案才觸發
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

export type OfficeTheme = 'kawaii' | 'shibuya' | 'skyline' | 'zen';

export type OfficeLevel = {
  name: string;
  maxStaff: number;
  upgradeCost: number;
  wall: string;
  wallRight?: string;
  floor: string;
  accent?: string;
  theme?: OfficeTheme;
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
  idleTimer: number;       // 內部 frame counter（保留給移動中的 UI 判斷）
  idleUntil: number;       // performance.now() timestamp，達到後才會啟動下一輪走動
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
  correctCount: number;
  questionIndex: number;
  maxQuestions: number;
  finished: boolean;
};

export type StaffActionModal = {
  staffIndex: number;
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

// === 公司 buff 集合 ===
export type CompanyBuffs = {
  speedBoost: number;
  qualityBoost: number;
  teamworkBoost: number;
  charismaBoost: number;
  decor: number;
};

// === 中途事件待處理 modal ===
export type ProjectEventModal = {
  projectId: string;
} | null;

export type DailySummary = {
  day: number;
  income: number;            // 案件酬勞總和
  expense: number;           // 薪資 + 辦公室
  cashDelta: number;         // income - expense
  reputationDelta: number;   // 信譽淨變化
  completedCount: number;    // 完成案件
  failedCount: number;       // 失敗案件
  levelUps: { name: string; to: 'S' | 'A' | 'B' | 'C' | 'D' }[];
  newEventCount: number;     // 觸發的中途事件數
  bankruptCountdown: number; // 連續無錢天數（>0 顯示警告）
};

export type GameState = {
  day: number;
  money: number;
  // 廢除：morale (全公司)、health；改用 reputation + 員工個人 morale
  reputation: number;            // 信譽 0-100，初始 30
  tierBudget: number;            // 案件稀有度預算，每天 morning 重算
  companyBuffs: CompanyBuffs;
  officeLevel: number;
  purchases: Partial<Record<ShopItemEffectKey, number>>;
  staff: Dog[];
  staffActionModal: StaffActionModal | null;

  // 案件
  clients: Project[];                  // offered 5 + active N + 最近結算（done/failed）5
  projectsCompleted: number;
  projectsFailed: number;
  lastRerollDay: number;               // 最近重 roll 的天數，0 = 沒重 roll 過

  // 候選人（保留招聘流程）
  queue: Dog[];
  current: Dog | null;
  candidatePatience: number;
  vacancy: boolean;
  vacancyTimer: number;
  recruitmentClosed: boolean;

  log: LogEntry[];
  miniGame: MiniGameState | null;
  trainingSession: TrainingSession | null;
  candidateReaction: string | null;
  showSplash: boolean;
  tutorialStep: number;

  bankrupt: boolean;
  bankruptCountdown: number;           // 連續資金 ≤0 的天數，達 5 → 破產
  activeTab: 'shop' | 'staff';
  speedMultiplier: number;
  dayElapsed: number;
  toast: { msg: string; type: 'positive' | 'negative' } | null;

  // IPO 勝利
  ipoAchievedAt: number | null;        // IPO 達成天數
  ipoDismissed: boolean;

  // 事件 modal
  projectEventModal: ProjectEventModal;

  // 每日結算摘要（toast 用，3 秒自動消失）
  dailySummary: DailySummary | null;

  // 銀行貸款（一次性救急）
  loanTaken: boolean;            // 已借過（一輩子限一次）
  loanRepayDaysLeft: number;     // 剩餘還款天數，0 = 無貸款
  loanModalOpen: boolean;        // 貸款 modal 是否顯示
};

export type LeaderboardEntry = {
  days: number;
  money: number;
  goal: number;       // 保留欄位以相容；新版傳固定 50000
  officeLevel: number;
  staffCount: number;
  projectsCompleted: number;  // v2 IPO 條件之一
  date: string;
  nickname?: string;
};

// === 化學反應快取記錄（保留結構給 UI 顯示用，不是觸發狀態）===
export type ChemistryEntry = {
  key: string;
  combo: ChemistryCombo;
};
