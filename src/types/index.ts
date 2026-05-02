// === 員工 3 維 stats（範圍 1-10）===
// speed = 推進度速度；quality = 影響獎勵；patience = 影響疲勞累積速度
export type Stats = {
  speed: number;
  quality: number;
  patience: number;
  teamwork?: number;
  charisma?: number;
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

  // 接案制欄位
  fatigue: number;               // 疲勞 0-100，初始 0
  loyalty: number;               // 忠誠度 0-100，初始 50
  experience: number;            // 累積經驗，0 起跳
  assignedProjectId: string | null; // 目前指派到的案子 id
  daysAtCompany: number;         // 在公司多少天（loyalty 自然累積）
  unhappyLeaveDays: number;      // 連續被拒請假的次數（連 3 直接離職）
  onLeaveDay: number | null;     // 准假當天的 day 編號（該日 0 貢獻；隔天自動清空）

  // 升級習得特性
  learnedTraits: string[];                       // DogTraitId 列表，升級時 +1
  pendingTraitChoice: { choices: string[]; roundsLeft?: number } | null; // 升級後待玩家選的 3 選項；roundsLeft > 1 代表選完還會接下一輪（S 直接面試會一次給 2 輪）

  // === 新團隊重構：強化系統 ===
  level: number;                                // 1-10，玩家用 $ 或碎片升級
  rosterId?: string;                            // 對應 DOG_ROSTER 條目；圖鑑唯一（重抽 → 加碎片）
  fragments: number;                            // 累積碎片：升 Lv N→N+1 需要 N 個（與 $ 二擇一）；Lv 10 後抽到 → 全轉錢

  // === 工具系統 ===
  equippedToolId?: string | null;               // 裝備中的工具 instanceId，null/undefined = 沒裝
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
  // 設施對應的職業類別；'all' 代表全員受惠（如 sofa）
  category: ProjectCategory | 'all';
};

// === 工具系統 ===
export type ToolGrade = 'S' | 'A' | 'B';

export type ToolTraitId =
  | 'fastStart'        // 該員工 speed 整體 ×1.20
  | 'antiFatigue'      // fatigue 累積 ×0.85
  | 'chainBoost'       // 同案隊友 +5% speed（每位戴此 trait 工具者疊加）
  | 'highTierExpert'   // tier ≥4 案 quality ×1.15
  | 'expGain'          // 完成案 experienceGain ×1.20
  | 'luckyCharm'       // 該案完成後再 +5% 工具掉落機率
  | 'guardian'         // 疲勞對 speed 的懲罰減半
  | 'precision';       // quality 額外 +1（加性）

export type ToolIconName =
  | 'toolKeyboard'
  | 'toolMonitor'
  | 'toolGpu'
  | 'toolTablet'
  | 'toolColor'
  | 'toolBrush'
  | 'toolBible'
  | 'toolDashboard'
  | 'toolLight'
  | 'toolManual'
  | 'toolHeadset'
  | 'toolMirror';

export type ToolDef = {
  defId: string;
  name: string;
  iconName: ToolIconName;
  category: ProjectCategory;
  desc: string;
};

export type Tool = {
  instanceId: string;
  defId: string;
  name: string;          // 冗餘存：避免 def 改名後既有 tool 顯示破掉
  iconName: ToolIconName;
  category: ProjectCategory;
  grade: ToolGrade;
  speedBoost: number;
  qualityBoost: number;
  traits: ToolTraitId[];
  obtainedDay: number;
};

export type ToolPickerModal = {
  dogId: string;
} | null;

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
  teamworkBoost?: number;
  charismaBoost?: number;
  decor: number;
  categorySpeed: Record<ProjectCategory, number>;
  categoryQuality: Record<ProjectCategory, number>;
  patienceBoost: number;
  fatigueRecoveryBonus: number;
};

export const ZERO_CATEGORY_MAP: Record<ProjectCategory, number> = {
  tech: 0,
  design: 0,
  marketing: 0,
  service: 0,
};

// === 升級特性選擇 modal ===
export type TraitChoiceModal = {
  dogId: string;
} | null;

// === 產業團隊（重構後核心） ===
export type Team = {
  industry: ProjectCategory;
  open: boolean;        // 是否接該產業的案
  memberIds: string[];  // 1-4 隻
};

export type DailySummary = {
  day: number;
  income: number;            // 案件酬勞總和
  expense: number;           // 薪資 + 辦公室
  cashDelta: number;         // income - expense
  completedCount: number;    // 完成案件
  failedCount: number;       // 失敗案件
  levelUps: { name: string; to: 'S' | 'A' | 'B' | 'C' | 'D' }[];
  bankruptCountdown: number; // 連續無錢天數（>0 顯示警告）
};

export type GameState = {
  companyName: string;            // 公司名稱（玩家自訂，綁帳號一次定終身；空字串代表尚未命名）
  day: number;
  money: number;
  tierBudget: number;            // 案件稀有度預算，每天 morning 重算
  companyBuffs: CompanyBuffs;
  officeLevel: number;
  officeSkin: number;            // 辦公室造型（視覺用，0..officeLevel 自由切換；不影響容量/解鎖）
  purchases: Partial<Record<ShopItemEffectKey, number>>;
  staff: Dog[];
  staffActionModal: StaffActionModal | null;

  // 工具系統
  tools: Tool[];
  toolPickerModal: ToolPickerModal;

  // 案件
  clients: Project[];                  // offered 5 + active N + 最近結算（done/failed）5
  projectsCompleted: number;
  projectsFailed: number;
  lastRerollDay: number;               // 最近重 roll 的天數，0 = 沒重 roll 過

  // 產業團隊（重構後核心）
  teams: Record<ProjectCategory, Team>;

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

  // 升級特性選擇 modal
  traitChoiceModal: TraitChoiceModal;

  // 每日結算摘要（toast 用，3 秒自動消失）
  dailySummary: DailySummary | null;

  // 銀行貸款（一次性救急）
  loanTaken: boolean;            // 已借過（一輩子限一次）
  loanRepayDaysLeft: number;     // 剩餘還款天數，0 = 無貸款
  loanModalOpen: boolean;        // 貸款 modal 是否顯示

  // 成就系統
  unlockedAchievementIds: string[];      // 已解鎖（持久化）
  pendingAchievementToasts: string[];    // 待播 toast 佇列（純 UI，不持久化）

  // 完成案件金幣動畫（純 UI，不持久化）
  pendingCoinBursts: { id: string; projectId: string; reward: number }[];

  // 工具掉落飛行動畫（純 UI，不持久化）
  pendingToolDrops: { id: string; projectId: string; tool: Tool }[];

  // 新手禮包：本局是否已領（重新開局會重置）
  claimedStarterPack: boolean;

  // 辦公室升級特殊任務（key = targetLevel 1..4）
  specialTasks: Record<number, SpecialTask>;

  // 達到最高等級辦公室時觸發排行榜上傳 modal（純 UI，不持久化）
  leaderboardSubmitModal: LeaderboardSubmitModal | null;
};

// === 辦公室升級特殊任務 ===
export type SpecialTaskStatus = 'locked' | 'available' | 'inProgress' | 'completed';

export type SpecialTask = {
  targetLevel: number;        // 1..4 (升到此等級)
  name: string;
  baseDays: number;           // 10 / 20 / 40 / 80（基準員工等級下需要的天數）
  workRequired: number;       // 啟動時計算後鎖定 = baseDays × baseline_per_dog × maxStaff
  workDone: number;           // 累積工時，每日 += 當前 team 綜合能力
  status: SpecialTaskStatus;
};

export type LeaderboardEntry = {
  days: number;        // 達到最高等級辦公室時的天數（主排序，少→前）
  money: number;       // 達成當下的現金
  staffCount: number;  // 達成當下的員工數
  date: string;
  companyName?: string;  // 公司名（取代 nickname 顯示）
  nickname?: string;     // 舊欄位保留，新版不顯示
};

export type LeaderboardSubmitModal = {
  days: number;
  money: number;
  staffCount: number;
  companyName: string;
};

// === 化學反應快取記錄（保留結構給 UI 顯示用，不是觸發狀態）===
export type ChemistryEntry = {
  key: string;
  combo: ChemistryCombo;
};
