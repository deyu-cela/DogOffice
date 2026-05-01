import type { CompanyBuffs, GameState } from '@/types';
import type { GameSaveData } from '@/types/save';
import { SAVE_VERSION } from '@/types/save';

const LOG_TAIL_LIMIT = 10;

const defaultCompanyBuffs: CompanyBuffs = {
  speedBoost: 0,
  qualityBoost: 0,
  decor: 1,
  categorySpeed: { tech: 0, design: 0, marketing: 0, service: 0 },
  categoryQuality: { tech: 0, design: 0, marketing: 0, service: 0 },
};

function normalizeCompanyBuffs(raw: unknown): CompanyBuffs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const cs = (r.categorySpeed && typeof r.categorySpeed === 'object' ? r.categorySpeed : {}) as Record<string, unknown>;
  const cq = (r.categoryQuality && typeof r.categoryQuality === 'object' ? r.categoryQuality : {}) as Record<string, unknown>;
  const num = (v: unknown, fb: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fb);
  return {
    speedBoost: num(r.speedBoost, 0),
    qualityBoost: num(r.qualityBoost, 0),
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
  };
}

export function serialize(state: GameState): GameSaveData {
  return {
    day: state.day,
    money: state.money,
    tierBudget: state.tierBudget,
    companyBuffs: state.companyBuffs,
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
    staff: state.staff,
    log: state.log.slice(-LOG_TAIL_LIMIT),
    ipoAchievedAt: state.ipoAchievedAt,
    ipoDismissed: state.ipoDismissed,
    loanTaken: state.loanTaken,
    loanRepayDaysLeft: state.loanRepayDaysLeft,
    unlockedAchievementIds: [...state.unlockedAchievementIds],
    teams: state.teams,
    claimedStarterPack: state.claimedStarterPack,
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
    experience: asInt(dog.experience, 0),
    level: asInt(dog.level, 1),
    fragments: asInt(dog.fragments, 0),
    daysAtCompany: asInt(dog.daysAtCompany, 0),
    stats: {
      speed: asInt(stats.speed, 1),
      quality: asInt(stats.quality, 1),
      patience,
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
  })) as GameSaveData['staff'];

  const clients = (Array.isArray(d.clients)
    ? (d.clients as Array<Record<string, unknown>>).map(roundProjectFields)
    : []) as GameSaveData['clients'];

  return {
    day: asNum(d.day, 1),
    money: asNum(d.money, 800),
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
    ipoAchievedAt: typeof d.ipoAchievedAt === 'number' ? d.ipoAchievedAt : null,
    ipoDismissed: d.ipoDismissed === true,
    loanTaken: d.loanTaken === true,
    loanRepayDaysLeft: asNum(d.loanRepayDaysLeft, 0),
    unlockedAchievementIds: Array.isArray(d.unlockedAchievementIds)
      ? d.unlockedAchievementIds.filter((x): x is string => typeof x === 'string')
      : [],
    teams: d.teams,
    claimedStarterPack: d.claimedStarterPack === true,
  };
}

export function migrate(version: number, raw: unknown): GameSaveData | null {
  if (typeof version !== 'number' || version > SAVE_VERSION) return null;
  if (version === 1) return null;
  return deserialize(raw);
}
