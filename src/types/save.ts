import type { ChemistryEntry, Dog, LogEntry, ShopItemEffectKey } from './index';

export const SAVE_VERSION = 1;

export type GameSaveData = {
  day: number;
  money: number;
  morale: number;
  health: number;
  decor: number;

  productivityBoost: number;
  stabilityBoost: number;
  trainingBoost: number;

  officeLevel: number;
  purchases: Partial<Record<ShopItemEffectKey, number>>;

  vacancy: boolean;
  vacancyTimer: number;
  bankrupt: boolean;
  tutorialStep: number;

  staff: Dog[];
  activeChemistry: ChemistryEntry[];
  log: LogEntry[];
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
