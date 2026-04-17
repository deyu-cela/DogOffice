import type { GameState } from '@/types';
import type { GameSaveData } from '@/types/save';
import { SAVE_VERSION } from '@/types/save';

const LOG_TAIL_LIMIT = 10;

export function serialize(state: GameState): GameSaveData {
  return {
    day: state.day,
    money: state.money,
    morale: state.morale,
    health: state.health,
    decor: state.decor,
    productivityBoost: state.productivityBoost,
    stabilityBoost: state.stabilityBoost,
    trainingBoost: state.trainingBoost,
    officeLevel: state.officeLevel,
    purchases: state.purchases,
    vacancy: state.vacancy,
    vacancyTimer: state.vacancyTimer,
    bankrupt: state.bankrupt,
    tutorialStep: state.tutorialStep,
    staff: state.staff,
    activeChemistry: state.activeChemistry,
    log: state.log.slice(-LOG_TAIL_LIMIT),
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

  return {
    day: asNum(d.day, 1),
    money: asNum(d.money, 0),
    morale: asNum(d.morale, 50),
    health: asNum(d.health, 50),
    decor: asNum(d.decor, 0),
    productivityBoost: asNum(d.productivityBoost, 0),
    stabilityBoost: asNum(d.stabilityBoost, 0),
    trainingBoost: asNum(d.trainingBoost, 0),
    officeLevel: asNum(d.officeLevel, 0),
    purchases: d.purchases && typeof d.purchases === 'object' ? d.purchases : {},
    vacancy: d.vacancy === true,
    vacancyTimer: asNum(d.vacancyTimer, 0),
    bankrupt: d.bankrupt === true,
    tutorialStep: asNum(d.tutorialStep, 7),
    staff: d.staff as GameSaveData['staff'],
    activeChemistry: Array.isArray(d.activeChemistry) ? d.activeChemistry : [],
    log: Array.isArray(d.log) ? d.log.slice(-LOG_TAIL_LIMIT) : [],
  };
}

export function migrate(version: number, raw: unknown): GameSaveData | null {
  if (typeof version !== 'number' || version > SAVE_VERSION) return null;
  // 目前只有 v1，未來擴充時於此分派到對應 upgrade 路徑
  return deserialize(raw);
}
