import { create } from 'zustand';
import type {
  CompanyBuffs,
  Dog,
  GameState,
  HintId,
  LeaderboardEntry,
  Project,
  ProjectCategory,
  ShopItemEffectKey,
  Team,
  Tool,
  TrainingSession,
} from '@/types';
import {
  createCeoUTool,
  getDogToolCategory,
  getDogToolStatBoost,
  pickBestUnequippedToolForDog,
} from '@/lib/toolsEngine';
import {
  saveLocalEntry,
  submitLeaderboard,
  startLeaderboardRun,
  isIgnorableApiError,
} from '@/lib/leaderboardApi';
import { logEvent } from '@/lib/eventApi';
import { useAuthStore } from '@/store/authStore';
import { useSaveStore } from '@/store/saveStore';
import type { GameSaveData } from '@/types/save';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { TRAINING_QUESTIONS } from '@/constants/questions';
import { SHOP_ITEMS } from '@/constants/shopItems';
import { LOAN_AMOUNT, LOAN_DAILY_DEDUCT, LOAN_TERM_DAYS } from '@/constants/loan';
import {
  SPECIAL_TASK_NAMES,
  createInitialSpecialTasks,
  specialTaskWorkRequired,
} from '@/constants/specialTasks';
import type { SpecialTask } from '@/types';
import { pickTraitChoices } from '@/constants/dogTraits';
import { clamp, dogPower, nextDogId, nextTreatId, rand } from '@/lib/utils';
import { ensureQueueLength, generateCandidate } from '@/lib/candidateGen';
import { createStarterCeo } from '@/lib/starterPackDog';
import {
  ACHIEVEMENTS,
  type AchievementCheckPayload,
  type AchievementEvent,
} from '@/features/achievements/achievementConfigs';
import { DOG_ROSTER, type RosterEntry } from '@/constants/dogRoster';
import { ROLE_IMAGE_MAP } from '@/constants/dogRoles';
import {
  computeTierBudget,
  fillInbox,
  generateProject,
  pruneExpiredOffered,
  rerollCost,
  rerollInbox,
  trimSettled,
} from '@/lib/projectGen';
import { runProjectsDay } from '@/lib/projectEngine';
import { pickBestTeamForIndustry } from '@/lib/autoAssign';

const initialQueue = [generateCandidate(), generateCandidate(), generateCandidate()];

// 開新局時通知後端紀錄起始時間，用於排行榜時長下界驗證。
// 未登入直接略過；網路 / 伺服器失敗只 log，不阻擋遊戲流程。
// 失敗者送排行榜時會被後端拒收（"no active run"），可接受。
function fireStartLeaderboardRun(): void {
  if (!useAuthStore.getState().user) return;
  void startLeaderboardRun().catch((err) => {
    if (!isIgnorableApiError(err)) {
      console.warn('[leaderboard-run] start failed:', err);
    }
  });
}

// === 辦公室固定每日支出 ===
export const OFFICE_DAILY_EXPENSE = [20, 48, 129, 285, 608];

// === 重構：產業 / 抽卡 / 強化 ===
export const INDUSTRIES: ProjectCategory[] = ['tech', 'design', 'marketing', 'service'];
// 絕對上限（最高 office level 時的隊伍上限）
export const TEAM_MAX_MEMBERS = 5;
// 依辦公室等級計算：初始 2，每擴建 +1，封頂 5
export function teamMaxMembers(officeLevel: number): number {
  return Math.min(TEAM_MAX_MEMBERS, 2 + officeLevel);
}
export const GACHA_COST = 100;
export const DOG_LEVEL_MAX = 10;
// 強化升級成本：Lv n→n+1 = base × ratio^(n-1)，整數
export function dogLevelUpCost(currentLevel: number): number {
  if (currentLevel >= DOG_LEVEL_MAX) return Infinity;
  const base = 80;
  const ratio = 1.5;
  return Math.round(base * Math.pow(ratio, currentLevel - 1));
}

function emptyTeams(): Record<ProjectCategory, Team> {
  return {
    tech: { industry: 'tech', memberIds: [] },
    design: { industry: 'design', memberIds: [] },
    marketing: { industry: 'marketing', memberIds: [] },
    service: { industry: 'service', memberIds: [] },
  };
}

// 員工→主產業：用於抽卡後自動分配 team
const ROLE_PRIMARY_INDUSTRY: Record<string, ProjectCategory> = {
  工程師: 'tech', QA: 'tech',
  美術: 'design', 企劃: 'design',
  業務: 'marketing', 行銷: 'marketing',
  客服: 'service',
  PM: 'tech',     // 通才預設 tech，玩家可手動換 team
  CEO: 'tech',
};
export function dogPrimaryIndustry(role: string): ProjectCategory {
  return ROLE_PRIMARY_INDUSTRY[role] ?? 'tech';
}

// 突破上限：超過後重複抽到 → 自動轉錢
export const DOG_BREAKTHROUGH_MAX = 10;
// 突破滿後再抽到重複的折抵金額
export const FRAGMENT_TO_MONEY = 10;
// 突破後 stats 上限放寬（一般升級仍走 20 上限）
export const DOG_STAT_BREAKTHROUGH_MAX = 30;

export type GachaResult = {
  dog: Dog;
  duplicate: boolean;
  breakthroughGained: number; // 重複時觸發幾次突破（通常 1，已滿則 0）
  refunded: number;           // 已滿突破時：1 × $10
};

// 把 RosterEntry 實例化成完整 Dog
function instantiateRosterDog(entry: RosterEntry): Dog {
  // 用 grade 推估薪水（保留與舊系統相容）
  const SALARY_BY_GRADE: Record<RosterEntry['grade'], number> = {
    D: 8, C: 12, B: 18, A: 28, S: 40, U: 60,
  };
  const salary = SALARY_BY_GRADE[entry.grade];
  return {
    id: nextDogId(),
    rosterId: entry.rosterId,
    role: entry.role,
    breed: entry.breed,
    emoji: '',
    name: entry.name,
    traits: [],
    flavor: entry.flavor,
    passive: '',
    motto: entry.flavor,
    stats: { ...entry.stats },
    grade: entry.grade === 'U' ? 'S' : entry.grade,  // U 的 grade 對舊欄位用 S 表示
    expectedSalary: salary,
    severance: salary * 3,
    patience: 99,
    score: 0,
    image: ROLE_IMAGE_MAP[entry.role] ?? '',
    isCEO: entry.grade === 'U',
    fatigue: 0,
    assignedProjectId: null,
    daysAtCompany: 0,
    unhappyLeaveDays: 0,
    onLeaveDay: null,
    learnedTraits: [],
    pendingTraitChoice: null,
    level: 1,
    breakthroughs: 0,
    equippedToolId: null,
  };
}

// === 設施升級上限 + 成本公式 ===
export const MAX_SHOP_LEVEL = 5;
export function nextShopCost(baseCost: number, currentLevel: number): number {
  // Lv1: 1×、Lv2: 1.5×、Lv3: 2×、Lv4: 2.5×、Lv5: 3×
  return Math.round(baseCost * (1 + 0.5 * currentLevel));
}

// 開局教學總步數（1=welcome, 2=三建築, 3=抽卡, 4=關閉招募, 5=員工宿舍, 6=三維+疲勞, 7=關閉隊伍, 8=完成）
export const TUTORIAL_DONE_STEP = 8;

type Actions = {
  startGame: () => void;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  // gate 用：只在 tutorialStep === expected 時才推進到下一步
  completeTutorialGate: (expected: number) => void;
  // spotlight-multi 用的子索引推進
  advanceTutorialSubStep: () => void;
  // 觸發式提示
  triggerHint: (id: HintId) => void;
  dismissHint: () => void;
  setSpeed: (s: number) => void;
  tick: (dt: number) => void;

  rejectCandidate: () => void;

  buyShopItem: (id: ShopItemEffectKey) => void;
  upgradeOffice: () => void;
  setOfficeSkin: (skin: number) => void;

  openStaffAction: (index: number) => void;
  closeStaffAction: () => void;
  fireStaff: (index: number) => void;

  // === 接案制核心 actions ===
  acceptProject: (projectId: string, staffIds?: string[]) => void;
  rejectProject: (projectId: string) => void;
  abandonProject: (projectId: string) => void;
  assignStaff: (projectId: string, dogId: string) => void;
  unassignStaff: (projectId: string, dogId: string) => void;
  rerollInbox: () => void;

  openFrisbee: () => void;
  openMemory: () => void;
  openPlayMiniGame: () => void;
  closeMiniGame: () => void;
  frisbeeTick: (dt: number) => void;
  setFrisbeeDir: (dir: number) => void;
  finishFrisbee: (endedEarly?: boolean) => void;
  memoryTick: (dt: number) => void;
  flipMemoryCard: (id: number) => void;
  finishMemory: () => void;

  submitOfficeRecord: () => Promise<LeaderboardEntry | null>;
  closeLeaderboardSubmit: () => void;

  openTraining: () => void;
  answerTraining: (optionIndex: number) => void;
  nextTrainingQuestion: () => void;
  closeTraining: () => void;

  setActiveTab: (tab: 'shop' | 'staff') => void;
  setShowSplash: (show: boolean) => void;
  setCompanyName: (name: string) => void;
  applySave: (data: GameSaveData) => void;
  resetToInitialGame: () => void;
  restart: () => void;
  dismissToast: () => void;
  dismissDailySummary: () => void;

  toggleRecruitment: () => void;

  takeBankLoan: () => void;
  dismissLoanModal: () => void;

  applyTrainingBoost: (dogId: string, stat: 'speed' | 'quality' | 'patience') => void;

  openTraitChoiceModal: (dogId: string) => void;
  closeTraitChoiceModal: () => void;
  chooseTrait: (dogId: string, traitId: string) => void;

  // === 成就 ===
  unlockAchievement: (id: string, silent?: boolean) => void;
  dismissAchievementToast: (id: string) => void;
  checkAchievements: (event: AchievementEvent, payload?: AchievementCheckPayload) => void;

  consumeCoinBurst: (id: string) => void;
  consumeToolDrop: (id: string) => void;

  // === 抽卡 / 團隊 / 強化 ===
  recruitFromGacha: () => GachaResult | null;
  recruitFromGachaTen: () => GachaResult[];
  addDogToTeam: (industry: ProjectCategory, dogId: string) => void;
  removeDogFromTeam: (industry: ProjectCategory, dogId: string) => void;
  autoFillTeam: (industry: ProjectCategory) => void;
  upgradeDogLevel: (dogId: string) => void;          // 用 $

  // === 新手禮包 ===
  claimStarterPack: () => void;

  // === 特殊任務 ===
  startSpecialTask: (targetLevel: number) => void;

  // === 工具系統 ===
  equipTool: (dogId: string, toolInstanceId: string) => void;
  unequipTool: (dogId: string) => void;
  destroyTool: (toolInstanceId: string) => void;
  openToolPicker: (dogId: string) => void;
  closeToolPicker: () => void;
};

export type GameStore = GameState & Actions;

const emptyCompanyBuffs: CompanyBuffs = {
  speedBoost: 0,
  qualityBoost: 0,
  decor: 1,
  categorySpeed: { tech: 0, design: 0, marketing: 0, service: 0 },
  categoryQuality: { tech: 0, design: 0, marketing: 0, service: 0 },
  patienceBoost: 0,
  fatigueRecoveryBonus: 0,
};

// 舊存檔的 companyBuffs 沒有 categorySpeed/Quality，但 purchases 還在
// → 依新版設施對應規則從 purchases 重建 buffs（避免玩家已花的錢失效）
function rebuildBuffsFromPurchases(
  purchases: Partial<Record<string, number>>,
): CompanyBuffs {
  const buffs: CompanyBuffs = {
    speedBoost: 0,
    qualityBoost: 0,
    decor: 1,
    categorySpeed: { tech: 0, design: 0, marketing: 0, service: 0 },
    categoryQuality: { tech: 0, design: 0, marketing: 0, service: 0 },
    patienceBoost: 0,
    fatigueRecoveryBonus: 0,
  };
  for (const item of SHOP_ITEMS) {
    const lv = purchases[item.id] ?? 0;
    if (lv <= 0) continue;
    switch (item.id) {
      case 'desk': buffs.speedBoost += lv; break;
      case 'policy':
        buffs.categoryQuality.tech += lv;
        buffs.categorySpeed.tech += lv;
        break;
      case 'artwall':
        buffs.categoryQuality.design += lv;
        buffs.categorySpeed.design += lv;
        break;
      case 'lamp': buffs.fatigueRecoveryBonus += lv; break;
      case 'coffee':
        buffs.categoryQuality.service += lv;
        buffs.categorySpeed.service += lv;
        break;
      case 'snack':
        buffs.categoryQuality.marketing += lv;
        buffs.categorySpeed.marketing += lv;
        break;
      case 'toy': /* 暫無作用 */ break;
      case 'gym': buffs.patienceBoost += lv; break;
      case 'sofa': /* 每日結算讀 purchases.sofa，不寫入 buffs */ break;
    }
  }
  return buffs;
}

// Day 1 起始：team 都還沒開，inbox 為空；抽到第一隻狗後該 team 自動開、案件才會補進來
function initialInbox(): Project[] {
  return [];
}

const initialState: GameState = {
  companyName: '',
  day: 1,
  money: 800,
  tierBudget: 0, // 沒員工 → 0；招到第一隻會 trigger computeTierBudget
  companyBuffs: { ...emptyCompanyBuffs },
  officeLevel: 0,
  officeSkin: 0,
  purchases: {},
  staff: [],
  staffActionModal: null,

  tools: [],
  toolPickerModal: null,

  clients: initialInbox(),
  projectsCompleted: 0,
  projectsFailed: 0,
  lastRerollDay: 0,

  teams: emptyTeams(),

  queue: initialQueue.slice(1),
  current: initialQueue[0],
  candidatePatience: initialQueue[0].patience,
  vacancy: false,
  vacancyTimer: 0,
  recruitmentClosed: false,

  log: [{ day: 1, msg: '公司剛開張，先去人資招員工，才能接案賺錢！' }],
  miniGame: null,
  trainingSession: null,
  candidateReaction: null,
  showSplash: true,
  tutorialStep: 0,
  tutorialSubStep: 0,
  seenHints: {},
  activeHint: null,

  bankrupt: false,
  bankruptCountdown: 0,
  activeTab: 'shop',
  speedMultiplier: 1,
  dayElapsed: 0,
  toast: null,

  traitChoiceModal: null,
  dailySummary: null,
  loanTaken: false,
  loanRepayDaysLeft: 0,
  loanModalOpen: false,

  unlockedAchievementIds: [],
  pendingAchievementToasts: [],
  pendingCoinBursts: [],
  pendingToolDrops: [],

  claimedStarterPack: false,
  specialTasks: createInitialSpecialTasks(0),
  leaderboardSubmitModal: null,
};

// === 員工綜合能力（特殊任務用）===
export function dogAbility(d: Dog): number {
  const s = d.stats ?? { speed: 0, quality: 0, patience: 0 };
  const speed = Number.isFinite(s.speed) ? s.speed : 0;
  const quality = Number.isFinite(s.quality) ? s.quality : 0;
  const patience = Number.isFinite(s.patience) ? s.patience : 0;
  const lv = Number.isFinite(d.level) ? d.level : 1;
  return speed * 0.4 + quality * 0.4 + patience * 0.2 + (lv - 1) * 0.5;
}

// 所有放在 team 裡的員工，綜合能力總和（不論 team open/close）
// 工具加成：依 dog 已裝備工具，把 speedBoost / qualityBoost 加進 ability，立即影響營建特殊任務
export function teamTotalAbility(state: GameState): number {
  const ids = new Set<string>();
  for (const team of Object.values(state.teams)) {
    for (const id of team.memberIds) ids.add(id);
  }
  let sum = 0;
  for (const dog of state.staff) {
    if (!ids.has(dog.id)) continue;
    sum += dogAbility(dog);
    const boost = getDogToolStatBoost(dog, state.tools, state.teams);
    sum += boost.speed * 0.4 + boost.quality * 0.4;
  }
  return sum;
}

// 載入存檔時把 specialTasks 整理成新欄位（workRequired/workDone）
// 舊存檔可能有 requiredDays/daysElapsed，或欄位 undefined → 一律補 0 並依 officeLevel 校正狀態
export function sanitizeSpecialTasks(
  raw: unknown,
  officeLevel: number,
): Record<number, SpecialTask> {
  const tasks = createInitialSpecialTasks(officeLevel);
  if (!raw || typeof raw !== 'object') return tasks;
  const src = raw as Record<string, unknown>;
  for (const key of Object.keys(tasks)) {
    const lv = Number(key);
    const t = src[key] as Partial<SpecialTask> | undefined;
    if (!t || typeof t !== 'object') continue;
    const num = (v: unknown): number =>
      typeof v === 'number' && Number.isFinite(v) ? v : 0;
    const status: SpecialTask['status'] =
      t.status === 'completed' || t.status === 'inProgress' || t.status === 'available' || t.status === 'locked'
        ? t.status
        : tasks[lv].status;
    let normalizedStatus = status;
    const wr = num(t.workRequired);
    // inProgress 但 workRequired 缺失（舊存檔或損毀）→ 退回 available 讓玩家重啟
    if (normalizedStatus === 'inProgress' && wr <= 0) normalizedStatus = 'available';
    tasks[lv] = {
      ...tasks[lv],
      workRequired: wr,
      workDone: num(t.workDone),
      status: normalizedStatus,
    };
    // 已升過該等級 → 強制視為已完成
    if (lv <= officeLevel) tasks[lv].status = 'completed';
  }
  return tasks;
}

// 預估剩餘天數（純顯示用，不影響完成判定）
export function estimateSpecialTaskRemainingDays(
  state: GameState,
  targetLevel: number,
): number {
  const t = state.specialTasks?.[targetLevel];
  if (!t) return 0;
  const required = Number.isFinite(t.workRequired) ? t.workRequired : 0;
  const done = Number.isFinite(t.workDone) ? t.workDone : 0;
  if (required <= 0) return 0;
  const remain = Math.max(0, required - done);
  if (remain === 0) return 0;
  const rawAbility = teamTotalAbility(state);
  const ability = Number.isFinite(rawAbility) ? rawAbility : 0;
  if (ability <= 0) return Infinity;
  return Math.max(1, Math.ceil(remain / ability));
}

// === 排行榜（金融海嘯傷害榜）localStorage 邏輯放 src/lib/leaderboardApi.ts ===

function refillCurrent(state: GameState): GameState {
  if (state.recruitmentClosed) {
    return { ...state, queue: [], current: null, candidatePatience: 0, vacancy: false, vacancyTimer: 0 };
  }
  let queue = ensureQueueLength(state.queue);
  let current = state.current;
  let candidatePatience = state.candidatePatience;
  let vacancy = state.vacancy;
  let vacancyTimer = state.vacancyTimer;
  let log = state.log;
  if (!current && !vacancy) {
    if (Math.random() < 0.1) {
      vacancy = true;
      vacancyTimer = 1 + Math.floor(Math.random() * 2);
      const entry = [...log, { day: state.day, msg: ' 目前沒有狗狗來面試...' }];
      if (entry.length > 18) entry.splice(0, entry.length - 18);
      log = entry;
    } else {
      const [first, ...rest] = queue;
      if (first) {
        current = first;
        queue = ensureQueueLength(rest);
        candidatePatience = first.patience;
      }
    }
  }
  return { ...state, queue, current, candidatePatience, vacancy, vacancyTimer, log };
}

function pushLog(state: GameState, msg: string): GameState {
  const next = [...state.log, { day: state.day, msg }];
  if (next.length > 18) next.splice(0, next.length - 18);
  return { ...state, log: next };
}

function openTeamMemberIds(state: GameState, industry: ProjectCategory): Set<string> {
  const team = state.teams[industry];
  return new Set(team ? team.memberIds : []);
}

// 把指定 dogIds 的 equippedToolId 清空（玩具留在 s.tools，不銷毀）
// CEO 鎖定的 U 工具不會被拆下
function unequipDogs(staff: Dog[], dogIds: string[], tools: Tool[]): Dog[] {
  if (dogIds.length === 0) return staff;
  const ids = new Set(dogIds);
  const lockedSet = new Set(
    tools.filter((t) => t.lockedToDogId).map((t) => t.instanceId),
  );
  let changed = false;
  const next = staff.map((d) => {
    if (!ids.has(d.id) || !d.equippedToolId) return d;
    if (lockedSet.has(d.equippedToolId)) return d;
    changed = true;
    return { ...d, equippedToolId: null };
  });
  return changed ? next : staff;
}

// CEO 入隊時生成綁定 U 工具（若該 CEO 尚未綁過）
function attachCeoUTool(
  state: GameState,
  dogId: string,
): { staff: Dog[]; tools: Tool[] } {
  const dog = state.staff.find((d) => d.id === dogId);
  if (!dog || !dog.isCEO) return { staff: state.staff, tools: state.tools };
  const existing = state.tools.find((t) => t.lockedToDogId === dogId);
  if (existing) {
    if (dog.equippedToolId === existing.instanceId) {
      return { staff: state.staff, tools: state.tools };
    }
    const staff = state.staff.map((d) =>
      d.id === dogId ? { ...d, equippedToolId: existing.instanceId } : d,
    );
    return { staff, tools: state.tools };
  }
  const tool = createCeoUTool(dogId, state.day);
  const staff = state.staff.map((d) =>
    d.id === dogId ? { ...d, equippedToolId: tool.instanceId } : d,
  );
  return { staff, tools: [...state.tools, tool] };
}

// 為一批新加入 team 的員工依序挑最佳未裝備工具；dogPower desc 優先
function autoEquipForNewMembers(staff: Dog[], tools: Tool[], newDogIds: string[]): Dog[] {
  if (newDogIds.length === 0) return staff;
  const ordered = [...newDogIds].sort((a, b) => {
    const da = staff.find((d) => d.id === a);
    const db = staff.find((d) => d.id === b);
    if (!da || !db) return 0;
    return dogPower(db) - dogPower(da);
  });
  let nextStaff = staff;
  for (const dogId of ordered) {
    const dog = nextStaff.find((d) => d.id === dogId);
    if (!dog || dog.equippedToolId) continue;
    const pickId = pickBestUnequippedToolForDog(tools, nextStaff, dog);
    if (!pickId) continue;
    nextStaff = nextStaff.map((d) =>
      d.id === dogId ? { ...d, equippedToolId: pickId } : d,
    );
  }
  return nextStaff;
}

function sanitizeProjectAssignments(state: GameState): GameState {
  const validAssignedIds = new Map<string, string>();
  const clients = state.clients.map((project) => {
    if (project.status !== 'active') return project;
    const allowed = openTeamMemberIds(state, project.category);
    const assignedStaffIds = project.assignedStaffIds.filter((id) => allowed.has(id));
    for (const id of assignedStaffIds) validAssignedIds.set(id, project.id);
    return assignedStaffIds.length === project.assignedStaffIds.length
      ? project
      : { ...project, assignedStaffIds };
  });
  const staff = state.staff.map((dog) => {
    const assignedProjectId = validAssignedIds.get(dog.id) ?? null;
    return dog.assignedProjectId === assignedProjectId ? dog : { ...dog, assignedProjectId };
  });
  return { ...state, clients, staff };
}

// Team-based 自動接案
// 對每個有成員的 team：若該 team 沒人在做案 → 接該產業 inbox 最前面的 offered，team 成員全上工
// 也會撿回「active 但 assignedStaffIds 被 sanitize 清空」的孤兒案
// 在抽卡、team 變動、結算後呼叫
function applyAutoAccept(state: GameState): GameState {
  let s = sanitizeProjectAssignments(state);
  for (const industry of INDUSTRIES) {
    const team = s.teams[industry];
    if (team.memberIds.length === 0) continue;
    // 任一 team 成員已被指派 → team 視為忙碌（一次只接 1 案）
    const busy = team.memberIds.some((id) => {
      const dog = s.staff.find((d) => d.id === id);
      return dog?.assignedProjectId != null;
    });
    if (busy) continue;
    // 優先撿孤兒（active 但無人指派），再找該產業最前面的 offered
    const orphan = s.clients.find(
      (c) => c.status === 'active' && c.category === industry && c.assignedStaffIds.length === 0,
    );
    const offered = orphan
      ? null
      : s.clients.find((c) => c.status === 'offered' && c.category === industry);
    const target = orphan ?? offered;
    if (!target) continue;
    // 過濾過勞 / 不存在的成員
    const validIds = team.memberIds.filter((id) => {
      const dog = s.staff.find((d) => d.id === id);
      return dog && dog.fatigue < 100;
    });
    if (validIds.length === 0) continue;
    const projectId = target.id;
    const isOrphan = !!orphan;
    s = {
      ...s,
      clients: s.clients.map((c) =>
        c.id === projectId
          ? isOrphan
            ? { ...c, assignedStaffIds: validIds }
            : { ...c, status: 'active', acceptedDay: s.day, assignedStaffIds: validIds }
          : c,
      ),
      staff: s.staff.map((d) =>
        validIds.includes(d.id) ? { ...d, assignedProjectId: projectId } : d,
      ),
    };
    s = pushLog(
      s,
      isOrphan
        ? ` ${industry} team 接手「${target.title}」（${validIds.length} 人）`
        : ` ${industry} team 接案：${target.title}（tier${target.clientTier}・${validIds.length} 人）`,
    );
  }
  return s;
}

function hasOverlayOpen(state: GameState): boolean {
  return (
    !!state.miniGame ||
    !!state.trainingSession ||
    (state.tutorialStep > 0 && state.tutorialStep < TUTORIAL_DONE_STEP) ||
    state.loanModalOpen ||
    !!state.activeHint
  );
}

// === 重算 tierBudget（含 artwall 加成）===
function recomputeTierBudget(state: GameState): number {
  const base = computeTierBudget(state);
  const artwallBonus = (state.purchases.artwall ?? 0) * 8;
  return base + artwallBonus;
}

// === 一天結算（plan §5）===
function runAdvanceDay(prev: GameState): GameState {
  let s: GameState = { ...prev };

  // === Phase 1: 推進案件 + 結算 + 中途事件 ===
  const dayResult = runProjectsDay(s);
  s = dayResult.state;
  for (const log of dayResult.newLogs) {
    s = pushLog(s, log.msg);
  }
  if (dayResult.toast && !s.toast) s.toast = dayResult.toast;
  const projSummary = dayResult.summary;

  // === Phase 1.5: 推進進行中的特殊任務（每日累積當前 team 綜合能力） ===
  {
    const tasks = { ...s.specialTasks };
    let changed = false;
    const rawAbility = teamTotalAbility(s);
    const ability = Number.isFinite(rawAbility) ? Math.max(0, rawAbility) : 0;
    for (const key of Object.keys(tasks)) {
      const lv = Number(key);
      const t = tasks[lv];
      if (!t || t.status !== 'inProgress') continue;
      const required = Number.isFinite(t.workRequired) && t.workRequired > 0 ? t.workRequired : 0;
      const prevDone = Number.isFinite(t.workDone) ? t.workDone : 0;
      if (required <= 0) continue;
      const workDone = prevDone + ability;
      if (workDone >= required) {
        tasks[lv] = { ...t, workRequired: required, workDone: required, status: 'completed' };
        s = pushLog(s, `✨ 特殊任務完成：${t.name}！可前往商店升級辦公室。`);
      } else {
        tasks[lv] = { ...t, workRequired: required, workDone };
      }
      changed = true;
    }
    if (changed) s.specialTasks = tasks;
  }

  // === Phase 2: 員工底薪 + 辦公室固定費 ===
  // 只付有在工作（指派到案件）的狗的薪水；沒接案的不算成本
  const totalSalary = s.staff
    .filter((d) => d.assignedProjectId != null)
    .reduce((n, d) => n + d.expectedSalary, 0);
  const officeCost = OFFICE_DAILY_EXPENSE[s.officeLevel] ?? 0;
  const expense = totalSalary + officeCost;
  s.money -= expense;

  // === Phase 3: sofa 休息區 + 暖光吊燈每日疲勞回復 ===
  const sofaLv = s.purchases.sofa ?? 0;
  const lampBonus = s.companyBuffs.fatigueRecoveryBonus ?? 0;
  const sofaRecover = sofaLv > 0 ? 3 + sofaLv * 2 : 0;
  const totalRecover = sofaRecover + lampBonus;
  if (totalRecover > 0 && s.staff.length > 0) {
    s.staff = s.staff.map((d) => ({ ...d, fatigue: clamp(d.fatigue - totalRecover, 0, 100) }));
    const parts: string[] = [];
    if (sofaRecover > 0) parts.push(`休息區 −${sofaRecover}`);
    if (lampBonus > 0) parts.push(`暖光吊燈 −${lampBonus}`);
    s = pushLog(s, `${parts.join('、')}，全員疲勞共 −${totalRecover}。`);
  }

  // === Phase 4: 推天數 + 重算 tierBudget ===
  s.day += 1;
  s.tierBudget = recomputeTierBudget(s);

  // === Phase 5: 補 inbox（清掉 10 天到期） + 自然補位 ===
  const pruneResult = pruneExpiredOffered(s.clients, s.day);
  s.clients = pruneResult.next;
  if (pruneResult.expiredCount > 0) {
    s = pushLog(s, ` ${pruneResult.expiredCount} 個放太久的案子過期消失了`);
  }
  const openInds = INDUSTRIES.filter((ind) => s.teams[ind].memberIds.length > 0);
  s.clients = fillInbox(s.clients, s.tierBudget, s.day, s.officeLevel, false, openInds);
  s.clients = trimSettled(s.clients);
  // === Phase 5.5: 自動接案 + 自動指派 ===
  s = applyAutoAccept(s);

  // === Phase 6: 候選人耐心 ===
  if (s.vacancy) {
    s.vacancyTimer -= 1;
    if (s.vacancyTimer <= 0) {
      s.vacancy = false;
      const [first, ...rest] = s.queue;
      if (first) {
        s.current = first;
        s.queue = rest;
        s.candidatePatience = first.patience;
        s = pushLog(s, '新的候選狗狗終於來了！');
      }
    }
  }
  if (s.current) {
    s.candidatePatience -= 1;
    if (s.candidatePatience <= 0) {
      const leavingName = s.current.name;
      s = pushLog(s, `${leavingName} 等太久了，不耐煩走掉了！`);
      s.current = null;
      s = refillCurrent(s);
    }
  } else {
    s = refillCurrent(s);
  }

  // === Phase 6.5: 貸款扣款（每日利息）===
  let loanPaidToday = 0;
  if (s.loanRepayDaysLeft > 0) {
    s.money -= LOAN_DAILY_DEDUCT;
    s.loanRepayDaysLeft -= 1;
    loanPaidToday = LOAN_DAILY_DEDUCT;
    if (s.loanRepayDaysLeft === 0) {
      s = pushLog(s, ' 銀行貸款已還清！');
    }
  }

  // === Phase 7: 破產判定（資金 ≤ 0 連 5 天）===
  if (s.money <= 0) {
    s.bankruptCountdown += 1;
    s.money = 0;
    s = pushLog(s, ` 資金見底（已連續 ${s.bankruptCountdown} 天）`);
    if (s.bankruptCountdown === 1 && !s.loanTaken && s.loanRepayDaysLeft === 0) {
      s.loanModalOpen = true;
    }
    if (s.bankruptCountdown >= 5) {
      s.bankrupt = true;
      return s;
    }
  } else {
    s.bankruptCountdown = 0;
  }

  // === Phase 8: 日結算 log ===
  s = pushLog(
    s,
    `本日結算：支出 $${expense}（薪 $${totalSalary} + 辦公 $${officeCost}）`,
  );

  // === Phase 8.5: 組裝每日摘要（toast 用）===
  const totalExpense = expense + loanPaidToday;
  s.dailySummary = {
    day: s.day,
    income: projSummary.income,
    expense: totalExpense,
    cashDelta: projSummary.income - totalExpense,
    completedCount: projSummary.completedCount,
    failedCount: projSummary.failedCount,
    levelUps: projSummary.levelUps,
    bankruptCountdown: s.bankruptCountdown,
  };

  return s;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: () => {
    // 有雲端存檔 = 從 splash 點開始是「繼續遊戲」，不觸發 StartRun
    // （否則 reload / 換機後 server 端 started_at 會被重置，累積的真實時長被吃掉）
    const isResuming = !!useSaveStore.getState().cloud?.data;
    set((s) => ({
      showSplash: false,
      tutorialStep: s.tutorialStep > 0 ? s.tutorialStep : 1,
      tutorialSubStep: s.tutorialStep > 0 ? s.tutorialSubStep : 0,
    }));
    if (!isResuming) {
      fireStartLeaderboardRun();
    }
    get().checkAchievements('game_start');
  },
  advanceTutorial: () =>
    set((s) => ({
      tutorialStep: Math.min(s.tutorialStep + 1, TUTORIAL_DONE_STEP),
      tutorialSubStep: 0,
    })),
  advanceTutorialSubStep: () =>
    set((s) => ({ tutorialSubStep: s.tutorialSubStep + 1 })),
  skipTutorial: () => set({ tutorialStep: TUTORIAL_DONE_STEP, tutorialSubStep: 0 }),
  completeTutorialGate: (expected) =>
    set((s) =>
      s.tutorialStep === expected
        ? {
            tutorialStep: Math.min(s.tutorialStep + 1, TUTORIAL_DONE_STEP),
            tutorialSubStep: 0,
          }
        : {},
    ),
  triggerHint: (id) =>
    set((s) => {
      if (s.seenHints[id]) return {};
      if (s.activeHint) return {}; // 排隊：已有 hint 顯示中就先不蓋
      return { activeHint: id };
    }),
  dismissHint: () => {
    const s = get();
    if (!s.activeHint) return;
    const justDismissed = s.activeHint;
    set({
      activeHint: null,
      seenHints: { ...s.seenHints, [justDismissed]: true },
    });
    // 教學鏈：成就 → 擴建 → 任務牆 → 領取禮包 → 準備開始
    if (justDismissed === 'achievement') {
      get().triggerHint('expand');
    } else if (justDismissed === 'expand') {
      get().triggerHint('first-task');
    } else if (justDismissed === 'first-task') {
      // 已領過禮包就跳過 starter-pack hint（避免指向已消失的 banner）
      if (get().claimedStarterPack) {
        get().triggerHint('ready-to-start');
      } else {
        get().triggerHint('starter-pack');
      }
    } else if (justDismissed === 'starter-pack') {
      get().triggerHint('ready-to-start');
    }
  },
  setSpeed: (speedMultiplier) => set({ speedMultiplier }),

  tick: (dt) => {
    const s = get();
    if (s.bankrupt || s.showSplash) return;
    if (hasOverlayOpen(s)) return;
    const BASE_DAY_MS = 15000;
    const newElapsed = s.dayElapsed + dt * s.speedMultiplier;
    if (newElapsed >= BASE_DAY_MS) {
      const prevDay = s.day;
      const next = runAdvanceDay({ ...s, dayElapsed: 0 });
      set(next as Partial<GameStore>);
      get().checkAchievements('day_end');
      // hint 觸發點：跨過第 30 天（玩具 hint 改在玩家首次點玩具區時觸發）
      if (prevDay < 30 && next.day >= 30) {
        get().triggerHint('leaderboard');
      }
    } else {
      set({ dayElapsed: newElapsed });
    }
  },

  dismissToast: () => set({ toast: null }),
  dismissDailySummary: () => set({ dailySummary: null }),

  rejectCandidate: () => {
    const s = get();
    if (!s.current) return;
    const dog = s.current;
    let next: GameState = {
      ...s,
      current: null,
    };
    next = pushLog(next, `婉拒了 ${dog.name}，下一位！`);
    next = refillCurrent(next);
    set(next as Partial<GameStore>);
  },

  buyShopItem: (id) => {
    const item = SHOP_ITEMS.find((i) => i.id === id);
    if (!item) return;
    const s = get();
    const currentLevel = s.purchases[id] ?? 0;
    const cap = item.maxLevel ?? MAX_SHOP_LEVEL;
    if (currentLevel >= cap) return; // 已滿級
    const cost = nextShopCost(item.cost, currentLevel);
    if (s.money < cost) return;
    let next: GameState = {
      ...s,
      money: s.money - cost,
      purchases: { ...s.purchases, [id]: currentLevel + 1 },
    };
    const buffs: CompanyBuffs = {
      ...next.companyBuffs,
      categorySpeed: { ...next.companyBuffs.categorySpeed },
      categoryQuality: { ...next.companyBuffs.categoryQuality },
    };
    switch (id) {
      case 'desk':
        buffs.speedBoost += 1;
        next = pushLog(next, '新辦公桌到了，全 team 案件速度 +1。');
        break;
      case 'policy':
        buffs.categoryQuality.tech += 1;
        buffs.categorySpeed.tech += 1;
        next = pushLog(next, '流程手冊上線，工程師專業 +1、速度 +1。');
        break;
      case 'artwall':
        buffs.categoryQuality.design += 1;
        buffs.categorySpeed.design += 1;
        next = pushLog(next, '品牌展示牆完成，美術專業 +1、速度 +1。');
        break;
      case 'lamp':
        buffs.fatigueRecoveryBonus += 1;
        next = pushLog(next, '暖光吊燈裝上，每日疲勞恢復 +1。');
        break;
      case 'coffee':
        buffs.categoryQuality.service += 1;
        buffs.categorySpeed.service += 1;
        next = pushLog(next, '精品咖啡機上線，客服專業 +1、速度 +1。');
        break;
      case 'snack':
        buffs.categoryQuality.marketing += 1;
        buffs.categorySpeed.marketing += 1;
        next = pushLog(next, '高級零食備好，行銷專業 +1、速度 +1。');
        break;
      case 'toy':
        next = pushLog(next, '狗狗玩具區啟用，狗狗們很開心。');
        break;
      case 'gym':
        buffs.patienceBoost += 1;
        next = pushLog(next, '狗狗健身區開放，全員耐心 +1。');
        break;
      case 'sofa': {
        const lv = currentLevel + 1;
        next = pushLog(next, `休息區升級到 Lv ${lv}，每日全員疲勞 −${3 + lv * 2}。`);
        break;
      }
    }
    next.companyBuffs = buffs;
    next.tierBudget = recomputeTierBudget(next);
    set(next as Partial<GameStore>);
    if (useAuthStore.getState().user) {
      logEvent('buy_shop_item', { item_id: id, level: currentLevel + 1 });
    }
  },

  upgradeOffice: () => {
    const s = get();
    const nextLevel = s.officeLevel + 1;
    if (nextLevel >= OFFICE_LEVELS.length) return;
    const task = s.specialTasks[nextLevel];
    if (!task || task.status !== 'completed') return;  // 必須先完成特殊任務
    const requiredItems = OFFICE_LEVELS[nextLevel].requiredItems ?? [];
    const itemsReady = requiredItems.every((id) => (s.purchases[id] ?? 0) >= 1);
    if (!itemsReady) return;  // 必須先購買升級條件物品
    const cost = OFFICE_LEVELS[nextLevel].upgradeCost;
    if (s.money < cost) return;
    // 升級後解鎖下一級任務（從 locked → available）
    const newSpecialTasks = { ...s.specialTasks };
    const followUp = newSpecialTasks[nextLevel + 1];
    if (followUp && followUp.status === 'locked') {
      newSpecialTasks[nextLevel + 1] = { ...followUp, status: 'available' };
    }
    // 升級後自動切到新造型（玩家可在「換造型」面板切回舊的）
    let next: GameState = {
      ...s,
      officeLevel: nextLevel,
      officeSkin: nextLevel,
      money: s.money - cost,
      specialTasks: newSpecialTasks,
    };
    next = pushLog(next, `辦公室升級為「${OFFICE_LEVELS[nextLevel].name}」！`);
    next.tierBudget = recomputeTierBudget(next);
    // 達到最高等級辦公室 → 觸發排行榜上傳 modal
    if (nextLevel === OFFICE_LEVELS.length - 1) {
      next.leaderboardSubmitModal = {
        days: next.day,
        money: next.money,
        staffCount: next.staff.length,
        companyName: next.companyName,
      };
    }
    set(next as Partial<GameStore>);
    if (useAuthStore.getState().user) {
      logEvent('office_upgrade', { from_level: s.officeLevel, to_level: nextLevel });
    }
    get().checkAchievements('office_upgrade');
  },

  openStaffAction: (index) => set({ staffActionModal: { staffIndex: index } }),
  closeStaffAction: () => set({ staffActionModal: null }),

  fireStaff: (index) => {
    const s = get();
    const dog = s.staff[index];
    if (!dog) return;
    // 移除該員工的所有指派
    const remainingClients = s.clients.map((c) => ({
      ...c,
      assignedStaffIds: c.assignedStaffIds.filter((id) => id !== dog.id),
    }));
    const newStaff = s.staff.filter((_, i) => i !== index);
    let next: GameState = {
      ...s,
      staff: newStaff,
      clients: remainingClients,
      money: Math.max(0, s.money - dog.severance),
      staffActionModal: null,
    };
    next = pushLog(next, `${dog.name} 完成資遣，支付 $${dog.severance}。`);
    next.tierBudget = recomputeTierBudget(next);
    next = applyAutoAccept(next);
    set(next as Partial<GameStore>);
  },

  // ==== 接案制 ====

  acceptProject: (projectId, staffIds) => {
    const s = get();
    const project = s.clients.find((c) => c.id === projectId);
    if (!project || project.status !== 'offered') return;
    const allowed = openTeamMemberIds(s, project.category);
    // 過濾掉非待命的員工（不允許強佔別案的人）
    const validIds = (staffIds ?? []).filter((id) => {
      const d = s.staff.find((dog) => dog.id === id);
      return d && allowed.has(id) && (!d.assignedProjectId || d.assignedProjectId === projectId);
    });
    if (validIds.length === 0) return;
    const updated: GameState = {
      ...s,
      clients: s.clients.map((c) =>
        c.id === projectId
          ? { ...c, status: 'active', acceptedDay: s.day, assignedStaffIds: validIds }
          : c,
      ),
      staff: s.staff.map((d) =>
        validIds.includes(d.id) ? { ...d, assignedProjectId: projectId } : d,
      ),
    };
    const staffMsg = validIds.length > 0 ? `（${validIds.length} 人已上工）` : '（待命）';
    const next = pushLog(sanitizeProjectAssignments(updated), ` 接案：${project.title}（tier${project.clientTier}）${staffMsg}`);
    set(next as Partial<GameStore>);
  },

  rejectProject: (projectId) => {
    const s = get();
    const project = s.clients.find((c) => c.id === projectId);
    if (!project || project.status !== 'offered') return;
    let next: GameState = {
      ...s,
      // 拒絕後直接移除，其他案件位置保留（隔天 morning 才補位）
      clients: s.clients.filter((c) => c.id !== projectId),
    };
    next = pushLog(next, `❌ 拒絕：${project.title}（${project.clientName}）`);
    next.tierBudget = recomputeTierBudget(next);
    set(next as Partial<GameStore>);
  },

  // 中途放棄已接的案：付違約金、釋出員工
  abandonProject: (projectId) => {
    const s = get();
    const project = s.clients.find((c) => c.id === projectId);
    if (!project || project.status !== 'active') return;
    const assignedIds = new Set(project.assignedStaffIds);
    let next: GameState = {
      ...s,
      money: Math.max(0, s.money - project.penalty),
      projectsFailed: s.projectsFailed + 1,
      clients: s.clients.map((c) =>
        c.id === projectId ? { ...c, status: 'failed', pendingEvent: null } : c,
      ),
      staff: s.staff.map((d) =>
        assignedIds.has(d.id)
          ? { ...d, assignedProjectId: null }
          : d,
      ),
    };
    next = pushLog(
      next,
      ` 放棄案件「${project.title}」(${project.clientName})：扣 $${project.penalty}`,
    );
    next.tierBudget = recomputeTierBudget(next);
    next = applyAutoAccept(next);
    set(next as Partial<GameStore>);
  },

  assignStaff: (projectId, dogId) => {
    const s = get();
    const project = s.clients.find((c) => c.id === projectId);
    if (!project || project.status !== 'active') return;
    const allowed = openTeamMemberIds(s, project.category);
    if (!allowed.has(dogId)) return;
    const dog = s.staff.find((d) => d.id === dogId);
    if (!dog) return;
    if (project.assignedStaffIds.includes(dogId)) return; // 已指派
    // 員工已被指派到別案 → 不允許
    if (dog.assignedProjectId && dog.assignedProjectId !== projectId) return;
    // 過勞中（fatigue 100）→ 禁止指派，避免 0 貢獻佔位
    if (dog.fatigue >= 100) return;
    const next: GameState = {
      ...s,
      clients: s.clients.map((c) =>
        c.id === projectId ? { ...c, assignedStaffIds: [...c.assignedStaffIds, dogId] } : c,
      ),
      staff: s.staff.map((d) => (d.id === dogId ? { ...d, assignedProjectId: projectId } : d)),
    };
    set(sanitizeProjectAssignments(next) as Partial<GameStore>);
  },

  unassignStaff: (projectId, dogId) => {
    const s = get();
    const project = s.clients.find((c) => c.id === projectId);
    if (!project) return;
    let next: GameState = {
      ...s,
      clients: s.clients.map((c) =>
        c.id === projectId
          ? { ...c, assignedStaffIds: c.assignedStaffIds.filter((id) => id !== dogId) }
          : c,
      ),
      staff: s.staff.map((d) =>
        d.id === dogId && d.assignedProjectId === projectId ? { ...d, assignedProjectId: null } : d,
      ),
    };
    next = applyAutoAccept(next);
    set(next as Partial<GameStore>);
  },

  rerollInbox: () => {
    const s = get();
    if (s.lastRerollDay >= s.day) return; // 每天最多 1 次
    const cost = rerollCost(s.tierBudget);
    if (s.money < cost) return;
    const openInds = INDUSTRIES.filter((ind) => s.teams[ind].memberIds.length > 0);
    const nextClients = rerollInbox(s.clients, s.tierBudget, s.day, s.officeLevel, openInds);
    const newOfferedCount = nextClients.filter((c) => c.status === 'offered').length;
    let next: GameState = {
      ...s,
      money: s.money - cost,
      lastRerollDay: s.day,
      clients: nextClients,
    };
    next = pushLog(next, ` 花 $${cost} 重新整理收件匣（${newOfferedCount} 個新案）`);
    next = applyAutoAccept(next);
    set(next as Partial<GameStore>);
  },

  setOfficeSkin: (skin) => {
    const s = get();
    if (skin < 0 || skin > s.officeLevel) return; // 只能選已解鎖的
    if (skin >= OFFICE_LEVELS.length) return;
    set({ officeSkin: skin });
  },

  openPlayMiniGame: () => {
    const s = get();
    if (s.miniGame || s.trainingSession) return;
    const pick = rand(['frisbee', 'memory']);
    if (pick === 'memory') get().openMemory();
    else get().openFrisbee();
  },
  openFrisbee: () =>
    set({
      miniGame: {
        type: 'frisbee',
        timeLeft: 30,
        score: 0,
        treats: [],
        dogX: 50,
        spawnTick: 0,
        running: true,
        moveDir: 0,
      },
    }),
  openMemory: () => {
    const emojis = ['', '', '', '', '', '', '', ''];
    const cards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
    set({
      miniGame: {
        type: 'memory',
        cards,
        flippedIds: [],
        matches: 0,
        moves: 0,
        running: true,
        timeLeft: 60,
      },
    });
  },
  closeMiniGame: () => set({ miniGame: null }),

  frisbeeTick: (dt) => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'frisbee' || !s.miniGame.running) return;
    const mg = { ...s.miniGame };
    mg.timeLeft = Math.max(0, mg.timeLeft - dt);
    mg.spawnTick += dt;
    mg.dogX = clamp(mg.dogX + mg.moveDir * dt * 42, 6, 94);
    let treats = mg.treats.map((t) => ({ ...t, y: t.y + t.speed * dt }));
    let score = mg.score;
    treats = treats.filter((t) => {
      const hit = Math.abs(t.x - mg.dogX) < 10 && t.y > 72 && t.y < 90;
      if (hit) score += t.pts;
      return t.y < 104 && !hit;
    });
    if (mg.spawnTick > 0.65) {
      mg.spawnTick = 0;
      const emojis = ['', '', '', '', '⭐'];
      const e = rand(emojis);
      const pts = e === '⭐' ? 3 : e === '' ? 2 : 1;
      treats.push({ id: nextTreatId(), x: 10 + Math.random() * 80, y: -8, speed: 18 + Math.random() * 20, emoji: e, pts });
    }
    mg.treats = treats;
    mg.score = score;
    set({ miniGame: mg });
    if (mg.timeLeft <= 0) get().finishFrisbee();
  },

  setFrisbeeDir: (dir) => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'frisbee') return;
    set({ miniGame: { ...s.miniGame, moveDir: dir } });
  },

  finishFrisbee: (endedEarly = false) => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'frisbee') return;
    const score = s.miniGame.score;
    // 飛盤 → Crunch Sprint：選 1 active 案 +score×2 工作量（暫時不選擇，給最早 active 案）
    const activeProject = s.clients.find((c) => c.status === 'active');
    const cashReward = 3 + Math.floor(score / 3);
    let next: GameState = {
      ...s,
      miniGame: null,
      money: Math.max(0, s.money - 10 + cashReward),
    };
    if (activeProject) {
      const sprintBonus = score * 2;
      next.clients = next.clients.map((c) =>
        c.id === activeProject.id ? { ...c, workDone: c.workDone + sprintBonus } : c,
      );
      next = pushLog(
        next,
        endedEarly
          ? `提早結束陪玩，得 ${score} 分，案件「${activeProject.title}」進度 +${sprintBonus}`
          : `陪玩結束！得 ${score} 分，案件「${activeProject.title}」進度 +${sprintBonus}，回饋 $${cashReward}。`,
      );
    } else {
      next = pushLog(
        next,
        endedEarly
          ? `提早結束陪玩，得 ${score} 分，回饋 $${cashReward}。`
          : `陪玩結束！得 ${score} 分，回饋 $${cashReward}（沒有 active 案，純士氣加成）。`,
      );
    }
    set(next as Partial<GameStore>);
  },

  memoryTick: (dt) => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'memory' || !s.miniGame.running) return;
    const timeLeft = Math.max(0, s.miniGame.timeLeft - dt);
    set({ miniGame: { ...s.miniGame, timeLeft } });
    if (timeLeft <= 0) get().finishMemory();
  },

  flipMemoryCard: (id) => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'memory' || !s.miniGame.running) return;
    const mg = s.miniGame;
    const card = mg.cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched || mg.flippedIds.length >= 2) return;
    const cards = mg.cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    const flippedIds = [...mg.flippedIds, id];
    let moves = mg.moves + 1;
    let matches = mg.matches;

    if (flippedIds.length === 2) {
      const [aId, bId] = flippedIds;
      const a = cards.find((c) => c.id === aId)!;
      const b = cards.find((c) => c.id === bId)!;
      if (a.emoji === b.emoji) {
        const matchedCards = cards.map((c) => (c.id === aId || c.id === bId ? { ...c, matched: true } : c));
        matches += 1;
        set({ miniGame: { ...mg, cards: matchedCards, flippedIds: [], matches, moves } });
        if (matches >= 8) setTimeout(() => get().finishMemory(), 300);
      } else {
        set({ miniGame: { ...mg, cards, flippedIds, moves } });
        setTimeout(() => {
          const cur = get().miniGame;
          if (!cur || cur.type !== 'memory') return;
          const reset = cur.cards.map((c) => (c.id === aId || c.id === bId ? { ...c, flipped: false } : c));
          set({ miniGame: { ...cur, cards: reset, flippedIds: [] } });
        }, 800);
      }
    } else {
      set({ miniGame: { ...mg, cards, flippedIds, moves } });
    }
  },

  finishMemory: () => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'memory') return;
    const mg = s.miniGame;
    // Pitch Memory: 完美 → 隔天保送 1 個高 tier 案
    const cashReward = mg.matches >= 8 ? 10 : mg.matches >= 6 ? 5 : 0;
    let next: GameState = {
      ...s,
      miniGame: null,
      money: Math.max(0, s.money - 10 + cashReward),
    };
    if (mg.matches >= 8) {
      // 保送 1 個 tier 平均 +1 的案到 inbox
      const avgTier = Math.round(1 + next.tierBudget / 25);
      const forced = Math.min(5, Math.max(1, avgTier + 1));
      const liveCount = next.clients.filter((c) => c.status === 'offered' || c.status === 'active').length;
      const openInds = INDUSTRIES.filter((ind) => next.teams[ind].memberIds.length > 0);
      const occupiedInds = new Set(
        next.clients
          .filter((c) => c.status === 'offered' || c.status === 'active')
          .map((c) => c.category),
      );
      const availableInds = openInds.filter((ind) => !occupiedInds.has(ind));
      if (liveCount < 5 && availableInds.length > 0) {
        const pickInd = availableInds[Math.floor(Math.random() * availableInds.length)];
        next.clients = [
          ...next.clients,
          generateProject(next.tierBudget, next.day, next.officeLevel, false, forced as 1 | 2 | 3 | 4 | 5, pickInd),
        ];
        next = pushLog(next, ` Pitch Memory 全配對！inbox 多了 1 個 tier${forced} 案`);
      } else {
        next = pushLog(next, ` Pitch Memory 全配對！但目前無可補位產業`);
      }
    }
    const cashMsg = cashReward > 0 ? `，回饋 $${cashReward}` : '';
    next = pushLog(next, `翻牌結束！配對 ${mg.matches}/8${cashMsg}。`);
    set(next as Partial<GameStore>);
  },

  submitOfficeRecord: async () => {
    const s = get();
    const snap = s.leaderboardSubmitModal;
    if (!snap) return null;
    const companyName = (s.companyName ?? '').trim();
    const entry: LeaderboardEntry = {
      days: snap.days,
      money: snap.money,
      staffCount: snap.staffCount,
      date: new Date().toISOString(),
      companyName: companyName || undefined,
    };
    saveLocalEntry(entry);
    try {
      await submitLeaderboard({
        days: entry.days,
        money: entry.money,
        staff_count: entry.staffCount,
        company_name: entry.companyName,
      });
    } catch (err) {
      if (!isIgnorableApiError(err)) {
        console.warn('[office-leaderboard] submit failed:', err);
      }
    }
    return entry;
  },

  closeLeaderboardSubmit: () => set({ leaderboardSubmitModal: null }),

  openTraining: () => {
    const s = get();
    if (s.trainingSession || s.miniGame || s.staffActionModal) return;
    const questions = [...TRAINING_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    const ts: TrainingSession = {
      question: questions[0],
      selected: null,
      correct: null,
      totalReward: 0,
      correctCount: 0,
      questionIndex: 0,
      maxQuestions: questions.length,
      finished: false,
    };
    trainingBank.set('current', questions);
    set({ trainingSession: ts });
  },

  answerTraining: (optionIndex) => {
    const s = get();
    if (!s.trainingSession || s.trainingSession.finished) return;
    const bank = trainingBank.get('current')!;
    const q = bank[s.trainingSession.questionIndex];
    const correct = optionIndex === q.answer;
    const totalReward = s.trainingSession.totalReward + (correct ? q.reward : 0);
    const correctCount = s.trainingSession.correctCount + (correct ? 1 : 0);
    set({
      trainingSession: {
        ...s.trainingSession,
        selected: optionIndex,
        correct,
        totalReward,
        correctCount,
      },
    });
  },

  nextTrainingQuestion: () => {
    const s = get();
    if (!s.trainingSession) return;
    const bank = trainingBank.get('current')!;
    const ts = s.trainingSession;
    if (ts.questionIndex >= ts.maxQuestions - 1) {
      const cashReward = ts.correctCount * 2;
      let next: GameState = {
        ...s,
        money: Math.max(0, s.money - 18 + cashReward),
        trainingSession: { ...ts, finished: true },
      };
      const cashMsg = cashReward > 0 ? `，回饋 $${cashReward}` : '';
      next = pushLog(next, `培訓完成，答對 ${ts.correctCount}/${ts.maxQuestions}${cashMsg}`);
      set(next as Partial<GameStore>);
    } else {
      const nextIndex = ts.questionIndex + 1;
      set({
        trainingSession: {
          ...ts,
          questionIndex: nextIndex,
          question: bank[nextIndex],
          selected: null,
          correct: null,
        },
      });
    }
  },

  closeTraining: () => set({ trainingSession: null }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowSplash: (show) => set({ showSplash: show }),
  setCompanyName: (name) => set({ companyName: name }),

  resetToInitialGame: () => {
    const fresh = [generateCandidate(), generateCandidate(), generateCandidate()];
    const [first, ...rest] = fresh;
    set((s) => ({
      ...initialState,
      staff: [],
      clients: initialInbox(),
      teams: emptyTeams(),
      queue: rest,
      current: first ?? null,
      candidatePatience: first?.patience ?? 0,
      log: [{ day: 1, msg: '公司剛開張，先去人資招員工，才能接案賺錢！' }],
      showSplash: s.showSplash,
      specialTasks: createInitialSpecialTasks(0),
      tools: [],
      toolPickerModal: null,
    }));
  },

  applySave: (data) => {
    const fresh = [generateCandidate(), generateCandidate(), generateCandidate()];
    const [first, ...rest] = fresh;
    const loadedBuffs: CompanyBuffs = data.companyBuffs ?? { ...emptyCompanyBuffs };
    const purchases = (data.purchases ?? {}) as Partial<Record<string, number>>;
    const isLegacyBuffs =
      Object.values(loadedBuffs.categorySpeed).every((v) => v === 0) &&
      Object.values(loadedBuffs.categoryQuality).every((v) => v === 0) &&
      Object.keys(purchases).length > 0;
    const rebuiltBuffs: CompanyBuffs = isLegacyBuffs
      ? rebuildBuffsFromPurchases(purchases)
      : loadedBuffs;
    set({
      companyName: data.companyName ?? '',
      day: data.day,
      money: data.money,
      tierBudget: data.tierBudget ?? 0,
      companyBuffs: rebuiltBuffs,
      officeLevel: data.officeLevel,
      officeSkin: data.officeSkin ?? data.officeLevel,
      purchases: data.purchases,
      bankrupt: data.bankrupt,
      bankruptCountdown: data.bankruptCountdown ?? 0,
      // 老存檔可能 tutorialStep 為 7（舊版完成值）→ clamp 到新版 5
      tutorialStep: Math.min(data.tutorialStep, TUTORIAL_DONE_STEP),
      tutorialSubStep: 0,
      seenHints: data.seenHints ?? {},
      activeHint: null,
      staff: data.staff.map((d) => ({
        ...d,
        level: d.level ?? 1,
        equippedToolId: d.equippedToolId ?? null,
      })),
      tools: data.tools ?? [],
      toolPickerModal: null,
      teams: data.teams ?? emptyTeams(),
      clients: data.clients ?? initialInbox(),
      projectsCompleted: data.projectsCompleted ?? 0,
      projectsFailed: data.projectsFailed ?? 0,
      lastRerollDay: data.lastRerollDay ?? 0,
      log: data.log,
      vacancy: data.vacancy,
      vacancyTimer: data.vacancyTimer,
      queue: rest,
      current: first ?? null,
      candidatePatience: first?.patience ?? 0,
      dayElapsed: 0,
      speedMultiplier: 1,
      miniGame: null,
      trainingSession: null,
      staffActionModal: null,
      candidateReaction: null,
      toast: null,
      traitChoiceModal: null,
      recruitmentClosed: data.recruitmentClosed ?? false,
      loanTaken: data.loanTaken ?? false,
      loanRepayDaysLeft: data.loanRepayDaysLeft ?? 0,
      loanModalOpen: false,
      dailySummary: null,
      unlockedAchievementIds: data.unlockedAchievementIds ?? [],
      pendingAchievementToasts: [],
      claimedStarterPack: data.claimedStarterPack ?? false,
      specialTasks: sanitizeSpecialTasks(data.specialTasks, data.officeLevel ?? 0),
      leaderboardSubmitModal: null,
    });
    // 舊存檔（沒有 unlockedAchievementIds 欄位）載入後，
    // 對已達條件的成就靜默補頒，不噴 toast。
    const after = get();
    const already = new Set(after.unlockedAchievementIds);
    ACHIEVEMENTS.forEach((a) => {
      if (already.has(a.id)) return;
      if (a.check(after)) get().unlockAchievement(a.id, true);
    });
    set(applyAutoAccept(get()) as Partial<GameStore>);
  },

  restart: () => {
    fireStartLeaderboardRun();
    const fresh = [generateCandidate(), generateCandidate(), generateCandidate()];
    set((s) => ({
      ...initialState,
      // 同帳號 once-and-done：保留公司名，重開新局不再命名
      companyName: s.companyName,
      staff: [],
      clients: initialInbox(),
      teams: emptyTeams(),
      queue: fresh.slice(1),
      current: fresh[0],
      candidatePatience: fresh[0].patience,
      log: [{ day: 1, msg: '公司剛開張，先去人資招員工，才能接案賺錢！' }],
      showSplash: false,
      tutorialStep: TUTORIAL_DONE_STEP,
      tutorialSubStep: 0,
      seenHints: s.seenHints,
      activeHint: null,
      specialTasks: createInitialSpecialTasks(0),
      tools: [],
      toolPickerModal: null,
    }));
  },

  toggleRecruitment: () => {
    const s = get();
    const next = !s.recruitmentClosed;
    if (next) {
      set({
        recruitmentClosed: true,
        current: null,
        candidatePatience: 0,
        queue: [],
        vacancy: false,
        vacancyTimer: 0,
      });
    } else {
      const fresh = [generateCandidate(), generateCandidate(), generateCandidate()];
      const [first, ...rest] = fresh;
      set({
        recruitmentClosed: false,
        current: first,
        candidatePatience: first.patience,
        queue: rest,
        vacancy: false,
        vacancyTimer: 0,
      });
    }
  },

  openTraitChoiceModal: (dogId) => {
    const s = get();
    const dog = s.staff.find((d) => d.id === dogId);
    if (!dog || !dog.pendingTraitChoice) return;
    set({ traitChoiceModal: { dogId } });
  },

  closeTraitChoiceModal: () => set({ traitChoiceModal: null }),

  chooseTrait: (dogId, traitId) => {
    const s = get();
    const dog = s.staff.find((d) => d.id === dogId);
    if (!dog || !dog.pendingTraitChoice) {
      set({ traitChoiceModal: null });
      return;
    }
    if (!dog.pendingTraitChoice.choices.includes(traitId)) {
      set({ traitChoiceModal: null });
      return;
    }
    // 還有下一輪 → 重新抽 3 個（排除已習得 + 剛選的）；沒有則清 pendingTraitChoice
    const roundsLeft = dog.pendingTraitChoice.roundsLeft ?? 1;
    const newLearned = [...(dog.learnedTraits ?? []), traitId];
    let nextChoice: { choices: string[]; roundsLeft?: number } | null = null;
    if (roundsLeft > 1) {
      const tempDog = { ...dog, learnedTraits: newLearned };
      const newChoices = pickTraitChoices(tempDog, 3);
      if (newChoices.length > 0) {
        nextChoice = { choices: newChoices, roundsLeft: roundsLeft - 1 };
      }
    }
    let next: GameState = {
      ...s,
      staff: s.staff.map((d) =>
        d.id === dogId
          ? {
              ...d,
              learnedTraits: newLearned,
              pendingTraitChoice: nextChoice,
            }
          : d,
      ),
      // 還有下一輪保持 modal，否則關閉
      traitChoiceModal: nextChoice ? { dogId } : null,
    };
    next = pushLog(next, `✨ ${dog.name} 習得新特性！`);
    set(next as Partial<GameStore>);
  },

  applyTrainingBoost: (dogId, stat) => {
    const s = get();
    if (!s.trainingSession || !s.trainingSession.finished) return;
    const ts = s.trainingSession;
    // 必須答對 ≥ 4 題才能套用（鼓勵認真）
    if (ts.correctCount < 4) {
      set({ trainingSession: null });
      return;
    }
    const dog = s.staff.find((d) => d.id === dogId);
    if (!dog) {
      set({ trainingSession: null });
      return;
    }
    set({
      staff: s.staff.map((d) =>
        d.id === dogId
          ? { ...d, stats: { ...d.stats, [stat]: clamp(d.stats[stat] + 1, 1, 10) } }
          : d,
      ),
      trainingSession: null,
      log: [
        ...s.log,
        { day: s.day, msg: ` ${dog.name} 培訓 +1 ${stat === 'speed' ? '速度' : stat === 'quality' ? '專業' : '耐心'}！` },
      ].slice(-30),
    });
  },

  takeBankLoan: () => {
    const s = get();
    if (s.loanTaken) return;
    set({
      money: s.money + LOAN_AMOUNT,
      loanTaken: true,
      loanRepayDaysLeft: LOAN_TERM_DAYS,
      loanModalOpen: false,
      bankruptCountdown: 0,
      log: [
        ...s.log,
        {
          day: s.day,
          msg: ` 銀行貸款 +$${LOAN_AMOUNT}，未來 ${LOAN_TERM_DAYS} 天每日扣 $${LOAN_DAILY_DEDUCT} 利息`,
        },
      ].slice(-30),
    });
  },
  dismissLoanModal: () => set({ loanModalOpen: false }),

  unlockAchievement: (id, silent = false) => {
    const s = get();
    if (s.unlockedAchievementIds.includes(id)) return;
    set({
      unlockedAchievementIds: [...s.unlockedAchievementIds, id],
      pendingAchievementToasts: silent
        ? s.pendingAchievementToasts
        : [...s.pendingAchievementToasts, id],
    });
    // 第一個非靜默成就解鎖時，觸發成就系統提示
    if (!silent) get().triggerHint('achievement');
  },

  dismissAchievementToast: (id) => {
    const s = get();
    if (!s.pendingAchievementToasts.includes(id)) return;
    set({
      pendingAchievementToasts: s.pendingAchievementToasts.filter((x) => x !== id),
    });
  },

  checkAchievements: (event, payload) => {
    const state = get();
    const unlocked = new Set(state.unlockedAchievementIds);
    for (const a of ACHIEVEMENTS) {
      if (unlocked.has(a.id)) continue;
      if (!a.triggerEvents.includes(event)) continue;
      if (a.check(state, payload)) {
        get().unlockAchievement(a.id, false);
      }
    }
  },

  consumeCoinBurst: (id) => {
    const s = get();
    if (!s.pendingCoinBursts.some((b) => b.id === id)) return;
    set({ pendingCoinBursts: s.pendingCoinBursts.filter((b) => b.id !== id) });
  },

  consumeToolDrop: (id) => {
    const s = get();
    if (!s.pendingToolDrops.some((b) => b.id === id)) return;
    set({ pendingToolDrops: s.pendingToolDrops.filter((b) => b.id !== id) });
  },

  recruitFromGacha: () => {
    const s = get();
    if (s.money < GACHA_COST) return null;
    // 從圖鑑隨機抽一條
    const entry = DOG_ROSTER[Math.floor(Math.random() * DOG_ROSTER.length)];
    const owned = s.staff.find((d) => d.rosterId === entry.rosterId);

    if (owned) {
      // 重複：未滿突破 → 自動觸發 1 次突破（全能力+1）；已滿 → +$10
      let next: GameState = { ...s, money: s.money - GACHA_COST };
      if (owned.breakthroughs >= DOG_BREAKTHROUGH_MAX) {
        const refund = FRAGMENT_TO_MONEY;
        next = { ...next, money: next.money + refund };
        next = pushLog(next, ` 抽到重複：${owned.name} 突破已滿 → +$${refund}`);
        set(next as Partial<GameStore>);
        // 教學 step 3 gate：放在 set 之後，避免被 ...s spread 覆寫掉新的 tutorialStep
        get().completeTutorialGate(3);
        return { dog: owned, duplicate: true, breakthroughGained: 0, refunded: refund };
      }
      const newBreak = owned.breakthroughs + 1;
      const newStats = {
        speed: clamp(owned.stats.speed + 1, 1, DOG_STAT_BREAKTHROUGH_MAX),
        quality: clamp(owned.stats.quality + 1, 1, DOG_STAT_BREAKTHROUGH_MAX),
        patience: clamp(owned.stats.patience + 1, 1, DOG_STAT_BREAKTHROUGH_MAX),
      };
      next = {
        ...next,
        staff: next.staff.map((d) =>
          d.id === owned.id ? { ...d, breakthroughs: newBreak, stats: newStats } : d,
        ),
      };
      next = pushLog(next, `✨ ${owned.name} 觸發突破！全能力 +1（${newBreak}/${DOG_BREAKTHROUGH_MAX}）`);
      set(next as Partial<GameStore>);
      get().completeTutorialGate(3);
      const updated = next.staff.find((d) => d.id === owned.id) ?? owned;
      return { dog: updated, duplicate: true, breakthroughGained: 1, refunded: 0 };
    }

    // 新狗：實例化、加入 staff、自動分配 team
    const hired = instantiateRosterDog(entry);
    const industry = dogPrimaryIndustry(hired.role);
    const team = s.teams[industry];
    let updatedTeam = team;
    const joinedTeam = team.memberIds.length < teamMaxMembers(s.officeLevel);
    if (joinedTeam) {
      updatedTeam = { ...team, memberIds: [...team.memberIds, hired.id] };
    }
    const initialStaff = [...s.staff, hired];
    const equippedStaff = joinedTeam
      ? autoEquipForNewMembers(initialStaff, s.tools, [hired.id])
      : initialStaff;
    let next: GameState = {
      ...s,
      money: s.money - GACHA_COST,
      staff: equippedStaff,
      teams: { ...s.teams, [industry]: updatedTeam },
    };
    if (hired.isCEO) {
      const attached = attachCeoUTool(next, hired.id);
      next = { ...next, staff: attached.staff, tools: attached.tools };
    }
    next = pushLog(
      next,
      hired.isCEO
        ? ` 抽到傳說 ${hired.name}！全公司沸騰，武士刀（U 級）永久綁定！`
        : ` 抽卡得到 ${hired.name}（${hired.breed} ${hired.role}・${entry.grade}）→ ${industry} team`,
    );
    next.tierBudget = recomputeTierBudget(next);
    // 開新 team 後 inbox 立即補該產業案件 + 嘗試自動接
    const openInds = INDUSTRIES.filter((ind) => next.teams[ind].memberIds.length > 0);
    next.clients = fillInbox(next.clients, next.tierBudget, next.day, next.officeLevel, false, openInds);
    next = applyAutoAccept(next);
    set(next as Partial<GameStore>);
    get().checkAchievements('hire', { dog: hired, prevStaffCount: s.staff.length });
    get().completeTutorialGate(3);
    return { dog: hired, duplicate: false, breakthroughGained: 0, refunded: 0 };
  },

  recruitFromGachaTen: () => {
    const results: GachaResult[] = [];
    for (let i = 0; i < 10; i++) {
      const r = get().recruitFromGacha();
      if (!r) break; // 錢不夠就停
      results.push(r);
    }
    return results;
  },

  addDogToTeam: (industry, dogId) => {
    const s = get();
    const team = s.teams[industry];
    if (!team) return;
    if (team.memberIds.includes(dogId)) return;
    if (team.memberIds.length >= teamMaxMembers(s.officeLevel)) return;
    if (!s.staff.some((d) => d.id === dogId)) return;
    // 員工不能同時在多個 team
    const inOther = INDUSTRIES.some((ind) => ind !== industry && s.teams[ind].memberIds.includes(dogId));
    if (inOther) return;
    const equippedStaff = autoEquipForNewMembers(s.staff, s.tools, [dogId]);
    let next = sanitizeProjectAssignments({
      ...s,
      staff: equippedStaff,
      teams: {
        ...s.teams,
        [industry]: { ...team, memberIds: [...team.memberIds, dogId] },
      },
    });
    next = applyAutoAccept(next);
    set(next as Partial<GameStore>);
  },

  autoFillTeam: (industry) => {
    const s = get();
    const team = s.teams[industry];
    if (!team) return;
    const capacity = teamMaxMembers(s.officeLevel);
    // 候選人 = 沒被其他 team 佔住的員工
    const candidates = s.staff.filter((d) =>
      !INDUSTRIES.some((ind) => ind !== industry && s.teams[ind].memberIds.includes(d.id)),
    );
    const picks = pickBestTeamForIndustry(candidates, industry, capacity);
    const newIds = picks.map((d) => d.id);
    // 算出實際 add/remove 集合，再套用裝備調整
    const oldIds = new Set(team.memberIds);
    const newSet = new Set(newIds);
    const removed = team.memberIds.filter((id) => !newSet.has(id));
    const added = newIds.filter((id) => !oldIds.has(id));
    let staff = unequipDogs(s.staff, removed, s.tools);
    staff = autoEquipForNewMembers(staff, s.tools, added);
    let next = sanitizeProjectAssignments({
      ...s,
      staff,
      teams: {
        ...s.teams,
        [industry]: { ...team, memberIds: newIds },
      },
    });
    next = applyAutoAccept(next);
    set(next as Partial<GameStore>);
  },

  removeDogFromTeam: (industry, dogId) => {
    const s = get();
    const team = s.teams[industry];
    if (!team) return;
    if (!team.memberIds.includes(dogId)) return;
    const newIds = team.memberIds.filter((id) => id !== dogId);
    let next: GameState = {
      ...s,
      staff: unequipDogs(s.staff, [dogId], s.tools),
      teams: {
        ...s.teams,
        [industry]: { ...team, memberIds: newIds },
      },
    };
    next = sanitizeProjectAssignments(next);
    // 移除最後一隻 → 該產業視為休業，重補 inbox（清掉該類 offered）
    if (newIds.length === 0 && team.memberIds.length > 0) {
      const openInds = INDUSTRIES.filter((ind) => next.teams[ind].memberIds.length > 0);
      next.clients = fillInbox(next.clients, next.tierBudget, next.day, next.officeLevel, false, openInds);
    }
    next = applyAutoAccept(next);
    set(next as Partial<GameStore>);
  },

  upgradeDogLevel: (dogId) => {
    const s = get();
    const dog = s.staff.find((d) => d.id === dogId);
    if (!dog) return;
    if (dog.level >= DOG_LEVEL_MAX) return;
    const cost = dogLevelUpCost(dog.level);
    if (s.money < cost) return;
    set(applyDogLevelUp({ ...s, money: s.money - cost }, dog.id) as Partial<GameStore>);
  },

  claimStarterPack: () => {
    const s = get();
    if (s.claimedStarterPack) return;
    // 若玩家已從 gacha 抽到 u-1（同一隻 CEO），不重複加入 → 視為突破一次
    const existing = s.staff.find((d) => d.rosterId === 'u-1');
    if (existing) {
      let next: GameState = { ...s, claimedStarterPack: true };
      if (existing.breakthroughs < DOG_BREAKTHROUGH_MAX) {
        const newBreak = existing.breakthroughs + 1;
        const newStats = {
          speed: clamp(existing.stats.speed + 1, 1, DOG_STAT_BREAKTHROUGH_MAX),
          quality: clamp(existing.stats.quality + 1, 1, DOG_STAT_BREAKTHROUGH_MAX),
          patience: clamp(existing.stats.patience + 1, 1, DOG_STAT_BREAKTHROUGH_MAX),
        };
        next = {
          ...next,
          staff: next.staff.map((d) =>
            d.id === existing.id ? { ...d, breakthroughs: newBreak, stats: newStats } : d,
          ),
        };
        next = pushLog(next, `✨ 開局禮包：${existing.name} 已在隊伍中 → 觸發突破（${newBreak}/${DOG_BREAKTHROUGH_MAX}）`);
      } else {
        next = { ...next, money: next.money + FRAGMENT_TO_MONEY };
        next = pushLog(next, ` 開局禮包：${existing.name} 突破已滿 → +$${FRAGMENT_TO_MONEY}`);
      }
      next.tierBudget = recomputeTierBudget(next);
      set(next as Partial<GameStore>);
      // 教學中領取禮包：自動推進 hint chain 到 ready-to-start
      if (get().activeHint === 'starter-pack') get().dismissHint();
      return;
    }
    const dog = createStarterCeo();
    let next: GameState = {
      ...s,
      staff: [...s.staff, dog],
      claimedStarterPack: true,
    };
    const attached = attachCeoUTool(next, dog.id);
    next = { ...next, staff: attached.staff, tools: attached.tools };
    next = pushLog(next, ` 開局禮包到貨：${dog.name}（CEO）加入了！0 元薪水、永不抱怨。`);
    next = pushLog(next, `🗡 ${dog.name} 帶著武士刀（U 級）登場，永遠綁定。`);
    next.tierBudget = recomputeTierBudget(next);
    set(next as Partial<GameStore>);
    if (get().activeHint === 'starter-pack') get().dismissHint();
  },

  startSpecialTask: (targetLevel) => {
    const s = get();
    const task = s.specialTasks[targetLevel];
    if (!task || task.status !== 'available') return;
    if (targetLevel !== s.officeLevel + 1) return;
    const maxStaff = OFFICE_LEVELS[s.officeLevel].maxStaff;
    const workRequired = specialTaskWorkRequired(targetLevel, maxStaff);
    const updated: SpecialTask = {
      ...task,
      workRequired,
      workDone: 0,
      status: 'inProgress',
    };
    let next: GameState = {
      ...s,
      specialTasks: { ...s.specialTasks, [targetLevel]: updated },
    };
    next = pushLog(
      next,
      `📋 啟動特殊任務「${SPECIAL_TASK_NAMES[targetLevel] ?? task.name}」，每日依 team 綜合能力推進。`,
    );
    set(next as Partial<GameStore>);
  },

  // === 工具系統 ===
  equipTool: (dogId, toolInstanceId) => {
    const s = get();
    const targetDog = s.staff.find((d) => d.id === dogId);
    const tool = s.tools.find((t) => t.instanceId === toolInstanceId);
    if (!targetDog || !tool) return;
    // 鎖定工具（CEO U）禁止外部操作
    if (tool.lockedToDogId) return;
    // 目標狗已裝鎖定工具 → 不可覆蓋
    if (targetDog.equippedToolId) {
      const existing = s.tools.find((t) => t.instanceId === targetDog.equippedToolId);
      if (existing?.lockedToDogId) return;
    }
    // category 必須相符；PM/CEO（getDogToolCategory=null）禁止
    const dogCat = getDogToolCategory(targetDog);
    if (!dogCat || tool.category !== dogCat) return;
    // 不變式：先把已裝此 tool 的人卸下；再裝給 target
    const newStaff = s.staff.map((d) => {
      if (d.equippedToolId === toolInstanceId && d.id !== dogId) {
        return { ...d, equippedToolId: null };
      }
      if (d.id === dogId) {
        return { ...d, equippedToolId: toolInstanceId };
      }
      return d;
    });
    set({ staff: newStaff });
  },

  unequipTool: (dogId) => {
    const s = get();
    const dog = s.staff.find((d) => d.id === dogId);
    if (!dog || !dog.equippedToolId) return;
    const equipped = s.tools.find((t) => t.instanceId === dog.equippedToolId);
    if (equipped?.lockedToDogId) return;
    set({
      staff: s.staff.map((d) => (d.id === dogId ? { ...d, equippedToolId: null } : d)),
    });
  },

  destroyTool: (toolInstanceId) => {
    const s = get();
    const target = s.tools.find((t) => t.instanceId === toolInstanceId);
    if (!target) return;
    if (target.lockedToDogId) return;
    set({
      tools: s.tools.filter((t) => t.instanceId !== toolInstanceId),
      staff: s.staff.map((d) =>
        d.equippedToolId === toolInstanceId ? { ...d, equippedToolId: null } : d,
      ),
      log: [...s.log, { day: s.day, msg: `🗑 銷毀玩具：${target.name}（${target.grade}）` }],
    });
  },

  openToolPicker: (dogId) => {
    const s = get();
    const dog = s.staff.find((d) => d.id === dogId);
    if (!dog) return;
    // CEO/PM 也可開啟（唯讀模式，由 ToolPickerModal 處理）
    set({ toolPickerModal: { dogId } });
  },

  closeToolPicker: () => set({ toolPickerModal: null }),
}));

// === 升級執行：扣完成本後呼叫，負責 stats 隨機加、特性解鎖、Lv10 碎片轉錢、log ===
function applyDogLevelUp(state: GameState, dogId: string): GameState {
  const dog = state.staff.find((d) => d.id === dogId);
  if (!dog) return state;
  // 每升一級 stats +0 或 +1（50% 機率），保證整數
  const rollGain = (): number => (Math.random() < 0.5 ? 0 : 1);
  const newLevel = dog.level + 1;
  const newStats = {
    speed: clamp(dog.stats.speed + rollGain(), 1, 20),
    quality: clamp(dog.stats.quality + rollGain(), 1, 20),
    patience: clamp(dog.stats.patience + rollGain(), 1, 20),
  };
  // 只在升到滿等（Lv.10）時給特性選擇
  const grantsTrait = newLevel === DOG_LEVEL_MAX;
  const updatedDog: Dog = { ...dog, level: newLevel, stats: newStats };
  let pendingTraitChoice = updatedDog.pendingTraitChoice;
  if (grantsTrait) {
    const choices = pickTraitChoices(updatedDog, 3);
    if (choices.length > 0) pendingTraitChoice = { choices, roundsLeft: 1 };
  }
  let next: GameState = {
    ...state,
    staff: state.staff.map((d) =>
      d.id === dogId ? { ...updatedDog, pendingTraitChoice } : d,
    ),
  };
  next = pushLog(
    next,
    grantsTrait
      ? ` ${dog.name} 強化至 Lv.${newLevel} → 解鎖新特性！`
      : ` ${dog.name} 強化至 Lv.${newLevel}`,
  );
  return next;
}

const trainingBank = new Map<string, typeof TRAINING_QUESTIONS>();
