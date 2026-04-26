import type {
  CompanyBuffs,
  Dog,
  LogEntry,
  Project,
  ShopItemEffectKey,
} from './index';

export const SAVE_VERSION = 2;

// v2: 接案制版本（plan §6 對應）
export type GameSaveData = {
  day: number;
  money: number;
  reputation: number;
  tierBudget: number;
  companyBuffs: CompanyBuffs;
  officeLevel: number;
  officeSkin: number;
  purchases: Partial<Record<ShopItemEffectKey, number>>;

  // 接案制
  clients: Project[];
  projectsCompleted: number;
  projectsFailed: number;
  lastRerollDay: number;

  vacancy: boolean;
  vacancyTimer: number;
  bankrupt: boolean;
  bankruptCountdown: number;
  tutorialStep: number;
  recruitmentClosed: boolean;

  staff: Dog[];
  log: LogEntry[];

  ipoAchievedAt: number | null;
  ipoDismissed: boolean;

  loanTaken: boolean;
  loanRepayDaysLeft: number;
};

export type SavePayload = {
  version: number;
  revision?: number;
  data: GameSaveData;
};

export type SaveMeta = {
  version: number;
  revision: number;
  updated_at: string;
  data: GameSaveData;
};

export type UpsertResponse = {
  version: number;
  revision: number;
  updated_at: string;
};

export type SaveConflict = {
  server_revision: number;
  server_updated_at: string;
  server_data: GameSaveData;
};

export type SaveStatus = 'idle' | 'loading' | 'saving' | 'conflict' | 'error';
