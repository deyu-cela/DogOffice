import type { CompanyBuffs, GameState, ProjectCategory, Tool, ToolGrade, ToolTraitId } from '@/types';
import type { GameSaveData } from '@/types/save';
import { SAVE_VERSION } from '@/types/save';
import { getToolIconByDefId, TOOL_TRAIT_DEFS } from '@/constants/tools';

const TOOL_GRADES: ReadonlyArray<ToolGrade> = ['S', 'A', 'B'];
const TOOL_CATEGORIES: ReadonlyArray<ProjectCategory> = ['tech', 'design', 'marketing', 'service'];
const VALID_TOOL_TRAITS = new Set(Object.keys(TOOL_TRAIT_DEFS));

function clampNum(v: unknown, min: number, max: number, fb: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fb;
  return Math.max(min, Math.min(max, v));
}

const LOG_TAIL_LIMIT = 10;

const defaultCompanyBuffs: CompanyBuffs = {
  speedBoost: 0,
  qualityBoost: 0,
  teamworkBoost: 0,
  charismaBoost: 0,
  decor: 1,
  categorySpeed: { tech: 0, design: 0, marketing: 0, service: 0 },
  categoryQuality: { tech: 0, design: 0, marketing: 0, service: 0 },
  patienceBoost: 0,
  fatigueRecoveryBonus: 0,
};

function normalizeCompanyBuffs(raw: unknown): CompanyBuffs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const cs = (r.categorySpeed && typeof r.categorySpeed === 'object' ? r.categorySpeed : {}) as Record<string, unknown>;
  const cq = (r.categoryQuality && typeof r.categoryQuality === 'object' ? r.categoryQuality : {}) as Record<string, unknown>;
  const num = (v: unknown, fb: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fb);
  return {
    speedBoost: num(r.speedBoost, 0),
    qualityBoost: num(r.qualityBoost, 0),
    teamworkBoost: num(r.teamworkBoost, 0),
    charismaBoost: num(r.charismaBoost, 0),
    decor: num(r.decor, 1),
    categorySpeed: {
      tech: num(cs.tech, 0),
      design: num(cs.design, 0),
      marketing: num(cs.marketing, 0),
      service: num(cs.service, 0),
    },
    categoryQuality: {
      tech: num(cq.tech, 0),
      design: num(cq.design, 0),
      marketing: num(cq.marketing, 0),
      service: num(cq.service, 0),
    },
    patienceBoost: num(r.patienceBoost, 0),
    fatigueRecoveryBonus: num(r.fatigueRecoveryBonus, 0),
  };
}

function clampInt(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function estimateReputation(state: GameState): number {
  const staff = state.staff;
  const avgLoyalty = staff.length
    ? staff.reduce((sum, dog) => sum + dog.loyalty, 0) / staff.length
    : 55;
  const avgFatigue = staff.length
    ? staff.reduce((sum, dog) => sum + dog.fatigue, 0) / staff.length
    : 20;
  const projectScore = clampInt(50 + state.projectsCompleted * 2 - state.projectsFailed * 5, 0, 100);
  return clampInt(avgLoyalty * 0.45 + (100 - avgFatigue) * 0.25 + projectScore * 0.3, 0, 100);
}

function serializeStaff(state: GameState): GameSaveData['staff'] {
  return state.staff.map((dog) => ({
    ...dog,
    stats: {
      ...dog.stats,
      teamwork: dog.stats.teamwork ?? dog.stats.patience,
      charisma: dog.stats.charisma ?? clampInt(dog.loyalty / 14, 1, 10),
    },
  })) as GameSaveData['staff'];
}

export function serialize(state: GameState): GameSaveData {
  return {
    companyName: state.companyName,
    day: state.day,
    money: state.money,
    reputation: estimateReputation(state),
    tierBudget: state.tierBudget,
    companyBuffs: normalizeCompanyBuffs(state.companyBuffs),
    officeLevel: state.officeLevel,
    officeSkin: state.officeSkin ?? state.officeLevel,
    purchases: state.purchases,
    clients: state.clients,
    projectsCompleted: state.projectsCompleted,
    projectsFailed: state.projectsFailed,
    lastRerollDay: state.lastRerollDay,
    vacancy: state.vacancy,
    vacancyTimer: state.vacancyTimer,
    bankrupt: state.bankrupt,
    bankruptCountdown: state.bankruptCountdown,
    tutorialStep: Math.max(0, Math.min(state.tutorialStep, 7)),
    recruitmentClosed: state.recruitmentClosed,
    staff: serializeStaff(state),
    log: state.log.slice(-LOG_TAIL_LIMIT),
    loanTaken: state.loanTaken,
    loanRepayDaysLeft: state.loanRepayDaysLeft,
    unlockedAchievementIds: [...state.unlockedAchievementIds],
    teams: state.teams,
    claimedStarterPack: state.claimedStarterPack,
    specialTasks: state.specialTasks,
    tools: state.tools,
  };
}

function asNum(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function asInt(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback;
}

// 修復舊存檔的浮點數欄位 + 將舊 4 stats 遷移為新 3 stats
function roundDogFields(dog: Record<string, unknown>): Record<string, unknown> {
  const stats = (dog.stats && typeof dog.stats === 'object' ? dog.stats : {}) as Record<string, unknown>;
  // 舊存檔：用 teamwork 當 patience；若沒有就用 5 預設
  const patience = asInt(stats.patience ?? stats.teamwork, 5);
  return {
    ...dog,
    fatigue: asInt(dog.fatigue, 0),
    loyalty: asInt(dog.loyalty, 50),
    level: asInt(dog.level, 1),
    fragments: asInt(dog.fragments, 0),
    daysAtCompany: asInt(dog.daysAtCompany, 0),
    stats: {
      speed: asInt(stats.speed, 1),
      quality: asInt(stats.quality, 1),
      patience,
      teamwork: asInt(stats.teamwork ?? patience, patience),
      charisma: asInt(stats.charisma, 1),
    },
  };
}

function roundProjectFields(proj: Record<string, unknown>): Record<string, unknown> {
  return {
    ...proj,
    workDone: asInt(proj.workDone, 0),
    qualitySum: asInt(proj.qualitySum, 0),
    expectedQuality: asInt(proj.expectedQuality, 1),
  };
}

export function deserialize(raw: unknown): GameSaveData | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Partial<GameSaveData>;
  if (typeof d.day !== 'number' || d.day < 1) return null;
  if (!Array.isArray(d.staff)) return null;

  const staff = (d.staff as Array<Record<string, unknown>>).map((dog) => ({
    ...roundDogFields(dog),
    learnedTraits: Array.isArray(dog.learnedTraits) ? dog.learnedTraits : [],
    pendingTraitChoice:
      dog.pendingTraitChoice && typeof dog.pendingTraitChoice === 'object'
        ? dog.pendingTraitChoice
        : null,
    onLeaveDay: typeof dog.onLeaveDay === 'number' ? dog.onLeaveDay : null,
    equippedToolId: typeof dog.equippedToolId === 'string' ? dog.equippedToolId : null,
  })) as GameSaveData['staff'];

  const tools = Array.isArray(d.tools)
    ? (d.tools as Array<Record<string, unknown>>).flatMap((t) => {
        const instanceId = typeof t.instanceId === 'string' ? t.instanceId : '';
        const defId = typeof t.defId === 'string' ? t.defId : '';
        if (!instanceId || !defId) return [];
        const category = TOOL_CATEGORIES.includes(t.category as ProjectCategory)
          ? (t.category as ProjectCategory)
          : null;
        if (!category) return [];
        const grade = TOOL_GRADES.includes(t.grade as ToolGrade) ? (t.grade as ToolGrade) : 'B';
        const iconName = typeof t.iconName === 'string'
          ? (t.iconName as Tool['iconName'])
          : getToolIconByDefId(defId);
        const traits = Array.isArray(t.traits)
          ? (t.traits.filter((x): x is ToolTraitId => typeof x === 'string' && VALID_TOOL_TRAITS.has(x)) as Tool['traits']).slice(0, 4)
          : [];
        const normalized: Tool = {
          instanceId,
          defId,
          name: typeof t.name === 'string' ? t.name : defId,
          iconName,
          category,
          grade,
          speedBoost: clampNum(t.speedBoost, 0, 5, 0),
          qualityBoost: clampNum(t.qualityBoost, 0, 5, 0),
          traits,
          obtainedDay: typeof t.obtainedDay === 'number' && t.obtainedDay > 0 ? Math.round(t.obtainedDay) : 1,
        };
        return [normalized];
      })
    : [];

  const validToolIds = new Set(tools.map((t) => t.instanceId));
  for (const dog of staff as Array<Record<string, unknown>>) {
    if (typeof dog.equippedToolId === 'string' && !validToolIds.has(dog.equippedToolId)) {
      dog.equippedToolId = null;
    }
  }

  const clients = (Array.isArray(d.clients)
    ? (d.clients as Array<Record<string, unknown>>).map(roundProjectFields)
    : []) as GameSaveData['clients'];

  return {
    companyName: typeof d.companyName === 'string' ? d.companyName : '',
    day: asNum(d.day, 1),
    money: asNum(d.money, 800),
    reputation: asNum(d.reputation, 55),
    tierBudget: asNum(d.tierBudget, 0),
    companyBuffs: normalizeCompanyBuffs(d.companyBuffs),
    officeLevel: asNum(d.officeLevel, 0),
    officeSkin: asNum(d.officeSkin, asNum(d.officeLevel, 0)),
    purchases: d.purchases && typeof d.purchases === 'object' ? d.purchases : {},
    clients,
    projectsCompleted: asNum(d.projectsCompleted, 0),
    projectsFailed: asNum(d.projectsFailed, 0),
    lastRerollDay: asNum(d.lastRerollDay, 0),
    vacancy: d.vacancy === true,
    vacancyTimer: asNum(d.vacancyTimer, 0),
    bankrupt: d.bankrupt === true,
    bankruptCountdown: asNum(d.bankruptCountdown, 0),
    tutorialStep: Math.max(0, Math.min(asNum(d.tutorialStep, 7), 7)),
    recruitmentClosed: d.recruitmentClosed === true,
    staff,
    log: Array.isArray(d.log) ? d.log.slice(-LOG_TAIL_LIMIT) : [],
    loanTaken: d.loanTaken === true,
    loanRepayDaysLeft: asNum(d.loanRepayDaysLeft, 0),
    unlockedAchievementIds: Array.isArray(d.unlockedAchievementIds)
      ? d.unlockedAchievementIds.filter((x): x is string => typeof x === 'string')
      : [],
    teams: d.teams,
    claimedStarterPack: d.claimedStarterPack === true,
    specialTasks: d.specialTasks && typeof d.specialTasks === 'object' ? d.specialTasks : undefined,
    tools,
  };
}

export function migrate(version: number, raw: unknown): GameSaveData | null {
  if (typeof version !== 'number' || version > SAVE_VERSION) return null;
  if (version === 1) return null;
  // v2 → v3：deserialize 已對 dog.equippedToolId/tools 做 fallback，無需額外動作
  return deserialize(raw);
}
