import type { SpecialTask } from '@/types';

export const SPECIAL_TASK_BASE_DAYS: Record<number, number> = {
  1: 10,
  2: 20,
  3: 40,
  4: 80,
};

export const SPECIAL_TASK_BASELINE_LEVEL: Record<number, number> = {
  1: 2,
  2: 3,
  3: 5,
  4: 7,
};

export const SPECIAL_TASK_NAMES: Record<number, string> = {
  1: '裝潢小辦公室',
  2: '拿下中型辦公室租約',
  3: '申請大型辦公室許可',
  4: '進駐豪華總部簽約',
};

// 移除：requiredDays 鎖定 → 改用 workDone/workRequired 模型，每日依當前能力推進
// SPECIAL_TASK_MIN_DAYS / MAX_DAYS 不再需要

export const SPECIAL_TASK_DESCRIPTIONS: Record<number, string> = {
  1: '把車庫改造成有模有樣的小辦公室。',
  2: '說服房東簽下中型辦公室租約。',
  3: '走完大型辦公室的審查與許可流程。',
  4: '完成豪華總部進駐前的最後簽約手續。',
};

export const SPECIAL_TASK_TARGET_LEVELS = [1, 2, 3, 4];

// stats 平均 5 → speed×0.4 + quality×0.4 + patience×0.2 = 5
// per_dog 基準 = 5 + (baselineLevel - 1) × 0.5
export function specialTaskBaselinePerDog(targetLevel: number): number {
  const lv = SPECIAL_TASK_BASELINE_LEVEL[targetLevel] ?? 3;
  return 5 + (lv - 1) * 0.5;
}

// 任務需要的總工時（啟動時鎖定）：
// = baseDays × baseline_per_dog × maxStaff(officeLevel)
export function specialTaskWorkRequired(targetLevel: number, maxStaff: number): number {
  const baseDays = SPECIAL_TASK_BASE_DAYS[targetLevel] ?? 20;
  const baselinePerDog = specialTaskBaselinePerDog(targetLevel);
  return Math.round(baseDays * baselinePerDog * maxStaff);
}

export function createInitialSpecialTasks(officeLevel: number): Record<number, SpecialTask> {
  const tasks: Record<number, SpecialTask> = {};
  for (const lv of SPECIAL_TASK_TARGET_LEVELS) {
    tasks[lv] = {
      targetLevel: lv,
      name: SPECIAL_TASK_NAMES[lv],
      baseDays: SPECIAL_TASK_BASE_DAYS[lv],
      workRequired: 0,
      workDone: 0,
      status:
        lv <= officeLevel
          ? 'completed'        // 已升過的等級任務視為已完成（讀檔相容）
          : lv === officeLevel + 1
            ? 'available'
            : 'locked',
    };
  }
  return tasks;
}
