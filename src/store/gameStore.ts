import { create } from 'zustand';
import type {
  CompanyBuffs,
  Dog,
  GameState,
  LeaderboardEntry,
  PipTask,
  Project,
  ProjectCategory,
  ShopItemEffectKey,
  Team,
  TrainingSession,
} from '@/types';
import {
  saveLocalEntry,
  submitLeaderboard,
  isIgnorableApiError,
} from '@/lib/leaderboardApi';
import type { GameSaveData } from '@/types/save';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { TRAINING_QUESTIONS } from '@/constants/questions';
import { SHOP_ITEMS } from '@/constants/shopItems';
import {
  SPECIAL_TASK_NAMES,
  createInitialSpecialTasks,
  specialTaskWorkRequired,
} from '@/constants/specialTasks';
import type { SpecialTask } from '@/types';
import { pickTraitChoices } from '@/constants/dogTraits';
import { clamp, nextDogId, nextTreatId, rand } from '@/lib/utils';
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

// === IPO 勝利條件（信譽門檻已移除）===
const IPO_MONEY = 50000;
const IPO_OFFICE_LEVEL = 4;
const IPO_PROJECTS = 80;

// === 辦公室固定每日支出 ===
export const OFFICE_DAILY_EXPENSE = [5, 8, 14, 22, 35];

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
    tech: { industry: 'tech', open: false, memberIds: [] },
    design: { industry: 'design', open: false, memberIds: [] },
    marketing: { industry: 'marketing', open: false, memberIds: [] },
    service: { industry: 'service', open: false, memberIds: [] },
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

// 碎片轉錢：每碎片折抵 $50（也是 Lv10 重複時的退款單位）
export const FRAGMENT_TO_MONEY = 50;

// Lv N → Lv N+1 需要的碎片數
export function dogLevelUpFragmentCost(currentLevel: number): number {
  if (currentLevel >= DOG_LEVEL_MAX) return Infinity;
  return currentLevel; // Lv1→2 需 1，Lv2→3 需 2，依此類推；總 1+2+..+9 = 45
}

export type GachaResult = {
  dog: Dog;
  duplicate: boolean;
  fragmentGained: number;  // 重複時加幾個碎片（通常 1）
  refunded: number;        // Lv 10 重複時：(碎片+1) × $50
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
    status: 'active',
    pipDaysLeft: 0,
    pipScore: 0,
    pipTasks: [],
    fatigue: 0,
    loyalty: 50,
    experience: 0,
    assignedProjectId: null,
    daysAtCompany: 0,
    unhappyLeaveDays: 0,
    onLeaveDay: null,
    learnedTraits: [],
    pendingTraitChoice: null,
    level: 1,
    fragments: 0,
  };
}

// === 設施升級上限 + 成本公式 ===
export const MAX_SHOP_LEVEL = 5;
export function nextShopCost(baseCost: number, currentLevel: number): number {
  // Lv1: 1×、Lv2: 1.5×、Lv3: 2×、Lv4: 2.5×、Lv5: 3×
  return Math.round(baseCost * (1 + 0.5 * currentLevel));
}

type Actions = {
  startGame: () => void;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  setSpeed: (s: number) => void;
  tick: (dt: number) => void;

  rejectCandidate: () => void;

  buyShopItem: (id: ShopItemEffectKey) => void;
  upgradeOffice: () => void;
  setOfficeSkin: (skin: number) => void;

  openStaffAction: (index: number) => void;
  closeStaffAction: () => void;
  startPip: (index: number) => void;
  togglePipTask: (index: number, taskIndex: number) => void;
  keepStaff: (index: number) => void;
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

  dismissIpo: () => void;

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

  // === 抽卡 / 團隊 / 強化 ===
  recruitFromGacha: () => GachaResult | null;
  recruitFromGachaTen: () => GachaResult[];
  toggleTeamOpen: (industry: ProjectCategory) => void;
  addDogToTeam: (industry: ProjectCategory, dogId: string) => void;
  removeDogFromTeam: (industry: ProjectCategory, dogId: string) => void;
  autoFillTeam: (industry: ProjectCategory) => void;
  upgradeDogLevel: (dogId: string) => void;          // 用 $
  upgradeDogWithFragments: (dogId: string) => void;  // 用碎片

  // === 新手禮包 ===
  claimStarterPack: () => void;

  // === 特殊任務 ===
  startSpecialTask: (targetLevel: number) => void;
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

  bankrupt: false,
  bankruptCountdown: 0,
  activeTab: 'shop',
  speedMultiplier: 1,
  dayElapsed: 0,
  toast: null,

  ipoAchievedAt: null,
  ipoDismissed: false,
  traitChoiceModal: null,
  dailySummary: null,
  loanTaken: false,
  loanRepayDaysLeft: 0,
  loanModalOpen: false,

  unlockedAchievementIds: [],
  pendingAchievementToasts: [],
  pendingCoinBursts: [],

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
export function teamTotalAbility(state: GameState): number {
  const ids = new Set<string>();
  for (const team of Object.values(state.teams)) {
    for (const id of team.memberIds) ids.add(id);
  }
  let sum = 0;
  for (const dog of state.staff) {
    if (ids.has(dog.id)) sum += dogAbility(dog);
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
  return new Set(team?.open ? team.memberIds : []);
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
// 對每個 open team：若該 team 沒人在做案 → 接該產業 inbox 最前面的 offered，team 成員全上工
// 在抽卡、team 開關、結算後呼叫
function applyAutoAccept(state: GameState): GameState {
  let s = sanitizeProjectAssignments(state);
  for (const industry of INDUSTRIES) {
    const team = s.teams[industry];
    if (!team.open || team.memberIds.length === 0) continue;
    // 任一 team 成員已被指派 → team 視為忙碌（一次只接 1 案）
    const busy = team.memberIds.some((id) => {
      const dog = s.staff.find((d) => d.id === id);
      return dog?.assignedProjectId != null;
    });
    if (busy) continue;
    // 找該產業最前面的 offered
    const offered = s.clients.find((c) => c.status === 'offered' && c.category === industry);
    if (!offered) continue;
    // 過濾過勞 / 不存在的成員
    const validIds = team.memberIds.filter((id) => {
      const dog = s.staff.find((d) => d.id === id);
      return dog && dog.fatigue < 100;
    });
    if (validIds.length === 0) continue;
    const projectId = offered.id;
    s = {
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
    s = pushLog(s, ` ${industry} team 接案：${offered.title}（tier${offered.clientTier}・${validIds.length} 人）`);
  }
  return s;
}

function hasOverlayOpen(state: GameState): boolean {
  return (
    !!state.miniGame ||
    !!state.trainingSession ||
    (state.tutorialStep > 0 && state.tutorialStep < 7) ||
    state.loanModalOpen
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
  const openInds = INDUSTRIES.filter((ind) => s.teams[ind].open);
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

  // === Phase 6.5: 貸款扣款（每日 $5 利息）===
  let loanPaidToday = 0;
  if (s.loanRepayDaysLeft > 0) {
    s.money -= 5;
    s.loanRepayDaysLeft -= 1;
    loanPaidToday = 5;
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

  // === Phase 9: IPO 達成檢查（信譽門檻已移除）===
  if (
    s.ipoAchievedAt === null &&
    s.money >= IPO_MONEY &&
    s.officeLevel >= IPO_OFFICE_LEVEL &&
    s.projectsCompleted >= IPO_PROJECTS
  ) {
    s.ipoAchievedAt = s.day;
    s.ipoDismissed = false;
    s = pushLog(s, ` 公司 IPO 上市成功！用時 ${s.day} 天！`);
  }

  return s;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: () => {
    set((s) => ({ showSplash: false, tutorialStep: s.tutorialStep > 0 ? s.tutorialStep : 1 }));
    get().checkAchievements('game_start');
  },
  advanceTutorial: () => set((s) => ({ tutorialStep: Math.min(s.tutorialStep + 1, 7) })),
  skipTutorial: () => set({ tutorialStep: 7 }),
  setSpeed: (speedMultiplier) => set({ speedMultiplier }),

  tick: (dt) => {
    const s = get();
    if (s.bankrupt || s.showSplash) return;
    if (hasOverlayOpen(s)) return;
    const BASE_DAY_MS = 15000;
    const newElapsed = s.dayElapsed + dt * s.speedMultiplier;
    if (newElapsed >= BASE_DAY_MS) {
      const next = runAdvanceDay({ ...s, dayElapsed: 0 });
      set(next as Partial<GameStore>);
      get().checkAchievements('day_end');
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
    if (currentLevel >= MAX_SHOP_LEVEL) return; // 已滿級
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
  },

  upgradeOffice: () => {
    const s = get();
    const nextLevel = s.officeLevel + 1;
    if (nextLevel >= OFFICE_LEVELS.length) return;
    const task = s.specialTasks[nextLevel];
    if (!task || task.status !== 'completed') return;  // 必須先完成特殊任務
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
    get().checkAchievements('office_upgrade');
  },

  openStaffAction: (index) => set({ staffActionModal: { staffIndex: index } }),
  closeStaffAction: () => set({ staffActionModal: null }),

  startPip: (index) => {
    const s = get();
    const dog = s.staff[index];
    if (!dog || dog.status === 'pip') return;
    const tasks: PipTask[] = [
      `完成 1 次與 ${dog.role} 有關的改善會議`,
      `提交 1 份${dog.role}改進紀錄`,
      `讓主管確認本週表現是否進步`,
      `完成 1 項跨部門協作任務`,
      `撰寫個人改善計畫書`,
    ]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((text) => ({ text, done: false }));
    const newStaff = [...s.staff];
    newStaff[index] = { ...dog, status: 'pip', pipDaysLeft: 3, pipScore: 0, pipTasks: tasks };
    let next: GameState = {
      ...s,
      staff: newStaff,
    };
    next = pushLog(next, ` ${dog.name} 進入 PIP 改善流程（3天觀察期），需完成改善任務。`);
    set(next as Partial<GameStore>);
  },

  togglePipTask: (index, taskIndex) => {
    const s = get();
    const dog = s.staff[index];
    if (!dog || dog.status !== 'pip' || !dog.pipTasks?.[taskIndex]) return;
    const tasks = dog.pipTasks.map((t, i) => (i === taskIndex ? { ...t, done: !t.done } : t));
    const newStaff = [...s.staff];
    newStaff[index] = { ...dog, pipTasks: tasks };
    set({ staff: newStaff });
  },

  keepStaff: (index) => {
    const s = get();
    const dog = s.staff[index];
    if (!dog) return;
    const newStaff = [...s.staff];
    newStaff[index] = { ...dog, status: 'active', pipDaysLeft: 0, pipScore: 0, pipTasks: [] };
    let next: GameState = { ...s, staff: newStaff, staffActionModal: null };
    next = pushLog(next, `✅ ${dog.name} 通過 PIP，決定留任。`);
    set(next as Partial<GameStore>);
  },

  fireStaff: (index) => {
    const s = get();
    const dog = s.staff[index];
    if (!dog) return;
    // 移除該員工的所有指派
    const remainingClients = s.clients.map((c) => ({
      ...c,
      assignedStaffIds: c.assignedStaffIds.filter((id) => id !== dog.id),
    }));
    // 同事 loyalty -3
    const newStaff = s.staff
      .filter((_, i) => i !== index)
      .map((d) => ({ ...d, loyalty: clamp(d.loyalty - 3, 0, 100) }));
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
    let next: GameState = {
      ...s,
      money: s.money - cost,
      lastRerollDay: s.day,
      clients: rerollInbox(s.clients, s.tierBudget, s.day, s.officeLevel),
    };
    next = pushLog(next, ` 花 $${cost} 重新整理收件匣（5 個新案）`);
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
      if (liveCount < 5) {
        next.clients = [
          ...next.clients,
          generateProject(next.tierBudget, next.day, next.officeLevel, false, forced as 1 | 2 | 3 | 4 | 5),
        ];
      }
      next = pushLog(next, ` Pitch Memory 全配對！inbox 多了 1 個 tier${forced} 案`);
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
    set({ leaderboardSubmitModal: null });
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
      // 培訓 → 答對題數每題給選定員工 +1 stat（簡化：第一個 active 員工 +1 quality；給 experience）
      const cashReward = ts.correctCount * 2;
      let next: GameState = {
        ...s,
        money: Math.max(0, s.money - 18 + cashReward),
        // 全員獲得 ts.correctCount 經驗
        staff: s.staff.map((d) => ({ ...d, experience: d.experience + ts.correctCount })),
        trainingSession: { ...ts, finished: true },
      };
      const cashMsg = cashReward > 0 ? `，回饋 $${cashReward}` : '';
      next = pushLog(next, `培訓完成，答對 ${ts.correctCount}/${ts.maxQuestions}，全員 +${ts.correctCount} 經驗${cashMsg}`);
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
      tutorialStep: data.tutorialStep,
      staff: data.staff.map((d) => ({ ...d, level: d.level ?? 1 })),
      teams: data.teams ?? emptyTeams(),
      clients: data.clients ?? initialInbox(),
      projectsCompleted: data.projectsCompleted ?? 0,
      projectsFailed: data.projectsFailed ?? 0,
      lastRerollDay: data.lastRerollDay ?? 0,
      ipoAchievedAt: data.ipoAchievedAt ?? null,
      ipoDismissed: data.ipoDismissed ?? false,
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
      tutorialStep: 7,
      specialTasks: createInitialSpecialTasks(0),
    }));
  },

  dismissIpo: () => set({ ipoDismissed: true }),

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
      money: s.money + 300,
      loanTaken: true,
      loanRepayDaysLeft: 80,
      loanModalOpen: false,
      bankruptCountdown: 0,
      log: [
        ...s.log,
        { day: s.day, msg: ' 銀行貸款 +$300，未來 80 天每日扣 $5 利息' },
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

  recruitFromGacha: () => {
    const s = get();
    if (s.money < GACHA_COST) return null;
    // 從圖鑑隨機抽一條
    const entry = DOG_ROSTER[Math.floor(Math.random() * DOG_ROSTER.length)];
    const owned = s.staff.find((d) => d.rosterId === entry.rosterId);

    if (owned) {
      // 重複：Lv 10 → 全碎片 + 1 都轉錢；未滿級 → 加 1 碎片
      let next: GameState = { ...s, money: s.money - GACHA_COST };
      if (owned.level >= DOG_LEVEL_MAX) {
        const totalFragments = owned.fragments + 1;
        const refund = totalFragments * FRAGMENT_TO_MONEY;
        next = {
          ...next,
          money: next.money + refund,
          staff: next.staff.map((d) => (d.id === owned.id ? { ...d, fragments: 0 } : d)),
        };
        next = pushLog(next, ` 抽到重複：${owned.name} 已 Lv.10 → ${totalFragments} 碎片轉成 $${refund}`);
        set(next as Partial<GameStore>);
        const updated = next.staff.find((d) => d.id === owned.id) ?? owned;
        return { dog: updated, duplicate: true, fragmentGained: 0, refunded: refund };
      }
      next = {
        ...next,
        staff: next.staff.map((d) => (d.id === owned.id ? { ...d, fragments: d.fragments + 1 } : d)),
      };
      next = pushLog(next, ` 抽到重複：${owned.name} +1 碎片（${owned.fragments + 1} 個）`);
      set(next as Partial<GameStore>);
      const updated = next.staff.find((d) => d.id === owned.id) ?? owned;
      return { dog: updated, duplicate: true, fragmentGained: 1, refunded: 0 };
    }

    // 新狗：實例化、加入 staff、自動分配 team
    const hired = instantiateRosterDog(entry);
    const industry = dogPrimaryIndustry(hired.role);
    const team = s.teams[industry];
    let updatedTeam = team;
    if (team.memberIds.length < teamMaxMembers(s.officeLevel)) {
      updatedTeam = { ...team, memberIds: [...team.memberIds, hired.id] };
      // 第一隻該產業的狗 → 自動開啟該 team
      if (team.memberIds.length === 0) {
        updatedTeam = { ...updatedTeam, open: true };
      }
    }
    let next: GameState = {
      ...s,
      money: s.money - GACHA_COST,
      staff: [...s.staff, hired],
      teams: { ...s.teams, [industry]: updatedTeam },
    };
    next = pushLog(
      next,
      hired.isCEO
        ? ` 抽到傳說 ${hired.name}！全公司沸騰`
        : ` 抽卡得到 ${hired.name}（${hired.breed} ${hired.role}・${entry.grade}）→ ${industry} team`,
    );
    next.tierBudget = recomputeTierBudget(next);
    // 開新 team 後 inbox 立即補該產業案件 + 嘗試自動接
    const openInds = INDUSTRIES.filter((ind) => next.teams[ind].open);
    next.clients = fillInbox(next.clients, next.tierBudget, next.day, next.officeLevel, false, openInds);
    next = applyAutoAccept(next);
    set(next as Partial<GameStore>);
    get().checkAchievements('hire', { dog: hired, prevStaffCount: s.staff.length });
    return { dog: hired, duplicate: false, fragmentGained: 0, refunded: 0 };
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

  toggleTeamOpen: (industry) => {
    const s = get();
    const team = s.teams[industry];
    if (!team) return;
    // 沒成員不允許開啟
    if (!team.open && team.memberIds.length === 0) return;
    let next: GameState = {
      ...s,
      teams: { ...s.teams, [industry]: { ...team, open: !team.open } },
    };
    next = sanitizeProjectAssignments(next);
    const openInds = INDUSTRIES.filter((ind) => next.teams[ind].open);
    next.clients = fillInbox(next.clients, next.tierBudget, next.day, next.officeLevel, false, openInds);
    next = applyAutoAccept(next);
    set(next as Partial<GameStore>);
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
    const next = sanitizeProjectAssignments({
      ...s,
      teams: {
        ...s.teams,
        [industry]: { ...team, memberIds: [...team.memberIds, dogId] },
      },
    });
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
    const next = sanitizeProjectAssignments({
      ...s,
      teams: {
        ...s.teams,
        [industry]: { ...team, memberIds: newIds },
      },
    });
    set(next as Partial<GameStore>);
  },

  removeDogFromTeam: (industry, dogId) => {
    const s = get();
    const team = s.teams[industry];
    if (!team) return;
    if (!team.memberIds.includes(dogId)) return;
    const newIds = team.memberIds.filter((id) => id !== dogId);
    // 移除最後一隻 → 自動關閉 team
    const open = newIds.length === 0 ? false : team.open;
    let next: GameState = {
      ...s,
      teams: {
        ...s.teams,
        [industry]: { ...team, memberIds: newIds, open },
      },
    };
    next = sanitizeProjectAssignments(next);
    // 若關閉了 team → 該產業 offered 應清掉
    if (!open && team.open) {
      const openInds = INDUSTRIES.filter((ind) => next.teams[ind].open);
      next.clients = fillInbox(next.clients, next.tierBudget, next.day, next.officeLevel, false, openInds);
    }
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

  upgradeDogWithFragments: (dogId) => {
    const s = get();
    const dog = s.staff.find((d) => d.id === dogId);
    if (!dog) return;
    if (dog.level >= DOG_LEVEL_MAX) return;
    const need = dogLevelUpFragmentCost(dog.level);
    if (dog.fragments < need) return;
    // 先扣碎片
    const reduced = {
      ...s,
      staff: s.staff.map((d) => (d.id === dogId ? { ...d, fragments: d.fragments - need } : d)),
    };
    set(applyDogLevelUp(reduced, dog.id) as Partial<GameStore>);
  },

  claimStarterPack: () => {
    const s = get();
    if (s.claimedStarterPack) return;
    const dog = createStarterCeo();
    let next: GameState = {
      ...s,
      staff: [...s.staff, dog],
      claimedStarterPack: true,
    };
    next = pushLog(next, ` 開局禮包到貨：${dog.name}（CEO）加入了！0 元薪水、永不抱怨。`);
    next.tierBudget = recomputeTierBudget(next);
    set(next as Partial<GameStore>);
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
  // 升到 Lv10 → 把剩下的碎片轉成錢
  let extraMoney = 0;
  let finalFragments = updatedDog.fragments;
  if (newLevel >= DOG_LEVEL_MAX && updatedDog.fragments > 0) {
    extraMoney = updatedDog.fragments * FRAGMENT_TO_MONEY;
    finalFragments = 0;
  }
  let next: GameState = {
    ...state,
    money: state.money + extraMoney,
    staff: state.staff.map((d) =>
      d.id === dogId
        ? { ...updatedDog, pendingTraitChoice, fragments: finalFragments }
        : d,
    ),
  };
  next = pushLog(
    next,
    grantsTrait
      ? ` ${dog.name} 強化至 Lv.${newLevel} → 解鎖新特性！`
      : ` ${dog.name} 強化至 Lv.${newLevel}`,
  );
  if (extraMoney > 0) {
    next = pushLog(next, ` ${dog.name} 已 Lv.10，剩餘碎片轉成 $${extraMoney}`);
  }
  return next;
}

const trainingBank = new Map<string, typeof TRAINING_QUESTIONS>();
