import type {
  CompanyBuffs,
  Dog,
  LogEntry,
  Project,
  ProjectCategory,
  ShopItemEffectKey,
  Team,
} from './index';

export const SAVE_VERSION = 2;

// v2: 接案制版本（plan §6 對應）
export type GameSaveData = {
  day: number;
  money: number;
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

  // 成就系統（v3 起；舊存檔沒有此欄位 → 載入時會以遊戲狀態靜默補頒）
  unlockedAchievementIds?: string[];

  // 團隊重構（v4 起；舊存檔沒有此欄位 → 載入時 fallback 為空 teams + 員工補 level=1）
  teams?: Record<ProjectCategory, Team>;

  // 新手禮包：本局是否已領
  claimedStarterPack?: boolean;
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
