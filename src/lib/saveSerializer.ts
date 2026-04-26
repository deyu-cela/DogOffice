import type { CompanyBuffs, GameState } from '@/types';
import type { GameSaveData } from '@/types/save';
import { SAVE_VERSION } from '@/types/save';

const LOG_TAIL_LIMIT = 10;

const defaultCompanyBuffs: CompanyBuffs = {
  speedBoost: 0,
  qualityBoost: 0,
  teamworkBoost: 0,
  charismaBoost: 0,
  decor: 1,
};

export function serialize(state: GameState): GameSaveData {
  return {
    day: state.day,
    money: state.money,
    reputation: state.reputation,
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
  };
}

function asNum(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

export function deserialize(raw: unknown): GameSaveData | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Partial<GameSaveData>;
  if (typeof d.day !== 'number' || d.day < 1) return null;
  if (!Array.isArray(d.staff)) return null;

  // 舊存檔補 learnedTraits / pendingTraitChoice / onLeaveDay 預設
  const staff = (d.staff as Array<Record<string, unknown>>).map((dog) => ({
    ...dog,
    learnedTraits: Array.isArray(dog.learnedTraits) ? dog.learnedTraits : [],
    pendingTraitChoice:
      dog.pendingTraitChoice && typeof dog.pendingTraitChoice === 'object'
        ? dog.pendingTraitChoice
        : null,
    onLeaveDay: typeof dog.onLeaveDay === 'number' ? dog.onLeaveDay : null,
  })) as GameSaveData['staff'];

  return {
    day: asNum(d.day, 1),
    money: asNum(d.money, 800),
    reputation: asNum(d.reputation, 30),
    tierBudget: asNum(d.tierBudget, 21),
    companyBuffs: d.companyBuffs ?? { ...defaultCompanyBuffs },
    officeLevel: asNum(d.officeLevel, 0),
    officeSkin: asNum(d.officeSkin, asNum(d.officeLevel, 0)),
    purchases: d.purchases && typeof d.purchases === 'object' ? d.purchases : {},
    clients: Array.isArray(d.clients) ? d.clients : [],
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
  };
}

export function migrate(version: number, raw: unknown): GameSaveData | null {
  if (typeof version !== 'number' || version > SAVE_VERSION) return null;
  // v1 → v2：接案制版本不相容舊存檔，視為無效
  // 玩家會看到「沒存檔」並從新初始狀態開始
  if (version === 1) return null;
  // v2 直接 deserialize
  return deserialize(raw);
}
