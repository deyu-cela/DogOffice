import type {
  ChemistryCombo,
  CompanyBuffs,
  Dog,
  GameState,
  LogEntry,
  Project,
  ProjectCategory,
  Tool,
} from '@/types';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import { isRoleMatched } from './projectGen';
import { clamp } from './utils';
import {
  getDogSpeedMul,
  getDogQualityMul,
  getDogFatigueAccumMul,
  getProjectChemBoost,
  getProjectRewardMul,
} from './dogTraitsEngine';
import {
  buildToolMap,
  findAutoEquipTarget,
  findReplaceableInInventory,
  getTeamChainBoost,
  getTeamLuckyBonus,
  getToolFatigueAccumMul,
  getToolGuardedFatigueMul,
  getToolQualityBoost,
  getToolSelfQualityMul,
  getToolSelfSpeedMul,
  getToolSpeedBoost,
  rollTool,
} from './toolsEngine';
import { TOOL_CAP, TOOL_DROP_CHANCE } from '@/constants/tools';

// === 類別主/次 stat 加成（只剩 speed/quality）===
type CategoryMul = {
  speedMul: number;
  qualityMul: number;
};

function categoryMulFor(category: ProjectCategory): CategoryMul {
  switch (category) {
    case 'tech':
      // tech：quality 主、speed 副
      return { qualityMul: 1.3, speedMul: 1.2 };
    case 'design':
      // design：quality 大主、speed 補
      return { qualityMul: 1.4, speedMul: 1.15 };
    case 'marketing':
      // marketing：speed 主推（取代原 charisma 主）
      return { qualityMul: 1.1, speedMul: 1.3 };
    case 'service':
      // service：均衡
      return { qualityMul: 1.2, speedMul: 1.15 };
  }
}

// === 員工疲勞乘數（不變）===
function fatigueMul(dog: Dog): number {
  if (dog.fatigue >= 100) return 0;
  if (dog.fatigue >= 80) return 0.55;
  if (dog.fatigue >= 60) return 0.75;
  if (dog.fatigue >= 40) return 0.9;
  return 1.0;
}

// === 化學反應 per-project 計算 ===
type ChemEffect = {
  speedMul: number;
  qualityMul: number;
  triggered: ChemistryCombo[];
};

function computeChemistry(assignedDogs: Dog[], category: ProjectCategory): ChemEffect {
  const out: ChemEffect = { speedMul: 1, qualityMul: 1, triggered: [] };
  if (assignedDogs.length < 2) return out;
  const roles = new Set(assignedDogs.map((d) => d.role));
  for (const combo of CHEMISTRY_COMBOS) {
    const [r1, r2] = combo.roles;
    if (!roles.has(r1) || !roles.has(r2)) continue;
    if (combo.category && combo.category !== 'any' && combo.category !== category) continue;
    out.speedMul *= combo.bonus.speedMul ?? 1;
    out.qualityMul *= combo.bonus.qualityMul ?? 1;
    out.triggered.push(combo);
  }
  return out;
}

// === 議價倍率（隊上有業務或行銷 ×1.1）===
function bargainMulFor(assignedDogs: Dog[]): number {
  return assignedDogs.some((d) => d.role === '業務' || d.role === '行銷') ? 1.1 : 1.0;
}

// === 每日疲勞變化（納入 patience）===
// 基礎 +10/天，patience 每 1 點減 0.5 累積；patience 10 → +5/天，patience 0 → +10/天
function applyDailyFatigue(
  staff: Dog[],
  patienceBoost: number = 0,
  toolMap: Map<string, Tool> = new Map(),
): Dog[] {
  return staff.map((d) => {
    const wasAssigned = !!d.assignedProjectId;
    let nextFatigue = d.fatigue;
    if (wasAssigned) {
      if (d.fatigue >= 100) {
        nextFatigue = clamp(d.fatigue - 15, 0, 100);
      } else {
        const gradeMul = d.grade === 'S' ? 0.7 : d.grade === 'A' ? 0.85 : 1.0;
        const traitMul = getDogFatigueAccumMul(d);
        const toolMul = getToolFatigueAccumMul(toolMap, d.id);
        const effPatience = d.stats.patience + patienceBoost;
        const patienceFactor = Math.max(2, 10 - effPatience * 0.5);
        nextFatigue = clamp(
          Math.round(d.fatigue + patienceFactor * gradeMul * traitMul * toolMul),
          0,
          100,
        );
      }
    } else {
      nextFatigue = clamp(d.fatigue - 15, 0, 100);
    }
    return { ...d, fatigue: nextFatigue };
  });
}

// === 每日 daysAtCompany 累積 ===
function applyDailyDaysAtCompany(staff: Dog[]): Dog[] {
  return staff.map((d) => ({ ...d, daysAtCompany: d.daysAtCompany + 1 }));
}

type DayProgress = {
  staffById: Map<string, Dog>;
  currentDay: number;
  toolMap: Map<string, Tool>;
};

function buildDogIdMap(staff: Dog[]): Map<string, Dog> {
  const m = new Map<string, Dog>();
  for (const d of staff) m.set(d.id, d);
  return m;
}

// === 推進進度 ===
function pushProjectProgress(
  project: Project,
  ctx: DayProgress,
  buffs: CompanyBuffs,
): { project: Project; chemTriggered: ChemistryCombo[]; assignedDogs: Dog[] } {
  if (project.status !== 'active') {
    return { project, chemTriggered: [], assignedDogs: [] };
  }
  const assignedDogs = project.assignedStaffIds
    .map((id) => ctx.staffById.get(id))
    .filter((d): d is Dog => !!d && d.onLeaveDay !== ctx.currentDay);
  if (assignedDogs.length === 0) {
    return { project, chemTriggered: [], assignedDogs: [] };
  }
  const catMul = categoryMulFor(project.category);
  const chem = computeChemistry(assignedDogs, project.category);
  const chemBoost = getProjectChemBoost(assignedDogs);
  const effChemSpeed = 1 + (chem.speedMul - 1) * chemBoost;

  let workAdded = 0;

  const catSpeedBonus = buffs.categorySpeed[project.category] ?? 0;
  const assignedIds = assignedDogs.map((d) => d.id);
  const chainBoost = getTeamChainBoost(ctx.toolMap, assignedIds);
  for (const dog of assignedDogs) {
    const toolSpeed = getToolSpeedBoost(ctx.toolMap, dog.id);
    const speed = dog.stats.speed + buffs.speedBoost + catSpeedBonus + toolSpeed;
    const roleMatch = isRoleMatched(dog, project.category) ? 1.15 : 1.0;
    const traitSpeed = getDogSpeedMul(dog);
    const toolSpeedMul = getToolSelfSpeedMul(ctx.toolMap, dog.id);
    const guardedFatigueMul = getToolGuardedFatigueMul(ctx.toolMap, dog.id, fatigueMul(dog));

    const contrib =
      speed *
      catMul.speedMul *
      roleMatch *
      effChemSpeed *
      guardedFatigueMul *
      traitSpeed *
      toolSpeedMul *
      chainBoost;

    workAdded += contrib;
  }

  return {
    project: {
      ...project,
      workDone: Math.round(project.workDone + workAdded),
    },
    chemTriggered: chem.triggered,
    assignedDogs,
  };
}

// === 計算隊伍「有效品質」加總（結算用，不依賴每日累積、不取平均）===
export function computeTeamEffectiveQuality(
  dogs: Dog[],
  category: ProjectCategory,
  buffs: CompanyBuffs,
  toolMap: Map<string, Tool> = new Map(),
  clientTier: number = 1,
): number {
  if (dogs.length === 0) return 0;
  const catMul = categoryMulFor(category);
  const chem = computeChemistry(dogs, category);
  const chemBoost = getProjectChemBoost(dogs);
  const effChemQuality = 1 + (chem.qualityMul - 1) * chemBoost;
  const catQualityBonus = buffs.categoryQuality[category] ?? 0;

  let total = 0;
  for (const dog of dogs) {
    const toolQuality = getToolQualityBoost(toolMap, dog.id);
    const quality = dog.stats.quality + buffs.qualityBoost + catQualityBonus + toolQuality;
    const traitQuality = getDogQualityMul(dog);
    const toolQualityMul = getToolSelfQualityMul(toolMap, dog.id, clientTier);
    total +=
      quality *
      catMul.qualityMul *
      effChemQuality *
      traitQuality *
      toolQualityMul;
  }
  return total;
}

// === 品質倍率（payoutMul）===
// 從 eff=40 起 1.0，每 +80 漲 1.0，上限 3.5（在 eff=240 達到）
export function computeQualityPayoutMul(effectiveQuality: number): number {
  const raw = 1 + Math.max(0, effectiveQuality - 40) / 80;
  return Math.round(clamp(raw, 1, 3.5) * 100) / 100;
}

// === 結算完成案 ===
function settleProject(
  project: Project,
  assignedDogs: Dog[],
  buffs: CompanyBuffs,
  toolMap: Map<string, Tool>,
): {
  project: Project;
  finalReward: number;
  payoutMul: number;
} {
  if (project.workDone < project.workRequired || project.status !== 'active') {
    return { project, finalReward: 0, payoutMul: 0 };
  }
  const avgEffQuality = computeTeamEffectiveQuality(
    assignedDogs,
    project.category,
    buffs,
    toolMap,
    project.clientTier,
  );
  const payoutMul = computeQualityPayoutMul(avgEffQuality);
  const bargain = bargainMulFor(assignedDogs);
  const traitReward = getProjectRewardMul(assignedDogs);
  const finalReward = Math.max(
    0,
    Math.round(project.reward * payoutMul * bargain * traitReward),
  );

  return {
    project: { ...project, status: 'done' },
    finalReward,
    payoutMul,
  };
}

// === 多日模擬 ===
export function simulateProjectDays(
  dogs: Dog[],
  workRequired: number,
  workDoneStart: number,
  category: ProjectCategory,
  buffs: CompanyBuffs,
  maxDays = 60,
  toolMap: Map<string, Tool> = new Map(),
): { days: number; finalDogs: Dog[]; complete: boolean } {
  if (dogs.length === 0 || workRequired <= 0) {
    return {
      days: workRequired <= 0 ? 0 : maxDays,
      finalDogs: dogs,
      complete: workRequired <= 0,
    };
  }
  let workDone = workDoneStart;
  let current = dogs.map((d) => ({ ...d }));
  for (let day = 1; day <= maxDays; day++) {
    current = current.map((d) => {
      let nextFatigue = d.fatigue;
      if (d.fatigue >= 100) {
        nextFatigue = clamp(d.fatigue - 15, 0, 100);
      } else {
        const gradeMul = d.grade === 'S' ? 0.7 : d.grade === 'A' ? 0.85 : 1.0;
        const traitMul = getDogFatigueAccumMul(d);
        const effPatience = d.stats.patience + (buffs.patienceBoost ?? 0);
        const patienceFactor = Math.max(2, 10 - effPatience * 0.5);
        nextFatigue = clamp(d.fatigue + patienceFactor * gradeMul * traitMul, 0, 100);
      }
      return { ...d, fatigue: nextFatigue };
    });
    const contrib = estimateDailyContrib(category, current, buffs, toolMap);
    workDone += contrib;
    if (workDone >= workRequired) {
      return { days: day, finalDogs: current, complete: true };
    }
  }
  return { days: maxDays, finalDogs: current, complete: false };
}

// === 估算每日推進 ===
export function estimateDailyContrib(
  category: ProjectCategory,
  dogs: Dog[],
  buffs: CompanyBuffs,
  toolMap: Map<string, Tool> = new Map(),
): number {
  if (dogs.length === 0) return 0;
  const catMul = categoryMulFor(category);
  const chem = computeChemistry(dogs, category);
  const chemBoost = getProjectChemBoost(dogs);
  const effChemSpeed = 1 + (chem.speedMul - 1) * chemBoost;
  const catSpeedBonus = buffs.categorySpeed[category] ?? 0;
  const dogIds = dogs.map((d) => d.id);
  const chainBoost = getTeamChainBoost(toolMap, dogIds);

  let total = 0;
  for (const dog of dogs) {
    const toolSpeed = getToolSpeedBoost(toolMap, dog.id);
    const speed = dog.stats.speed + buffs.speedBoost + catSpeedBonus + toolSpeed;
    const roleMatch = isRoleMatched(dog, category) ? 1.15 : 1.0;
    const traitSpeed = getDogSpeedMul(dog);
    const toolSpeedMul = getToolSelfSpeedMul(toolMap, dog.id);
    const guardedFatigueMul = getToolGuardedFatigueMul(toolMap, dog.id, fatigueMul(dog));
    const contrib =
      speed *
      catMul.speedMul *
      roleMatch *
      effChemSpeed *
      guardedFatigueMul *
      traitSpeed *
      toolSpeedMul *
      chainBoost;
    total += contrib;
  }
  return total;
}

// === 主入口 ===
export type DaySummaryPartial = {
  income: number;
  completedCount: number;
  failedCount: number;
  penaltyTotal: number;
  levelUps: { name: string; to: Dog['grade'] }[];
};

export type DayResult = {
  state: GameState;
  newLogs: LogEntry[];
  toast: GameState['toast'];
  summary: DaySummaryPartial;
};

export function runProjectsDay(state: GameState): DayResult {
  let s = { ...state };
  const newLogs: LogEntry[] = [];
  let toast: GameState['toast'] = null;
  const summary: DaySummaryPartial = {
    income: 0,
    completedCount: 0,
    failedCount: 0,
    penaltyTotal: 0,
    levelUps: [],
  };

  // 1. 每日 fatigue / daysAtCompany
  const initialToolMap = buildToolMap(s.staff, s.tools, s.teams);
  s.staff = applyDailyFatigue(s.staff, s.companyBuffs.patienceBoost ?? 0, initialToolMap);
  s.staff = applyDailyDaysAtCompany(s.staff);
  s.staff = s.staff.map((d) =>
    d.onLeaveDay != null && d.onLeaveDay < s.day ? { ...d, onLeaveDay: null } : d,
  );

  // 2. 推進每個 active 案
  const ctx: DayProgress = {
    staffById: buildDogIdMap(s.staff),
    currentDay: s.day,
    toolMap: buildToolMap(s.staff, s.tools, s.teams),
  };
  const updatedClients: Project[] = [];
  for (const project of s.clients) {
    if (project.status !== 'active') {
      updatedClients.push(project);
      continue;
    }
    const result = pushProjectProgress(project, ctx, s.companyBuffs);
    updatedClients.push(result.project);
  }
  s.clients = updatedClients;

  // 3. 結算完成案
  const settledClients: Project[] = [];
  let projectsCompletedAdd = 0;
  for (const project of s.clients) {
    if (project.status !== 'active') {
      settledClients.push(project);
      continue;
    }
    if (project.workDone >= project.workRequired) {
      const assignedDogs = project.assignedStaffIds
        .map((id) => ctx.staffById.get(id))
        .filter((d): d is Dog => !!d);
      const settled = settleProject(project, assignedDogs, s.companyBuffs, ctx.toolMap);
      settledClients.push(settled.project);
      projectsCompletedAdd += 1;
      s.money += settled.finalReward;
      summary.income += settled.finalReward;
      const assignedIds = new Set(assignedDogs.map((d) => d.id));
      s.staff = s.staff.map((d) => {
        if (!assignedIds.has(d.id)) return d;
        return {
          ...d,
          assignedProjectId: null,
        };
      });
      newLogs.push({
        day: s.day,
        msg: ` 完成「${project.title}」(${project.clientName})：拿 $${settled.finalReward}`,
      });
      s.pendingCoinBursts = [
        ...s.pendingCoinBursts,
        {
          id: `coin-${s.day}-${project.id}-${s.pendingCoinBursts.length}`,
          projectId: project.id,
          reward: settled.finalReward,
        },
      ];
      // === 玩具掉落（需先購買「狗狗玩具區」；按 category；luckyCharm 加成）===
      const hasToyZone = (s.purchases?.toy ?? 0) > 0;
      const luckyBonus = getTeamLuckyBonus(ctx.toolMap, assignedDogs.map((d) => d.id));
      const dropChance = TOOL_DROP_CHANCE + luckyBonus;
      if (hasToyZone && Math.random() < dropChance) {
        const tool = rollTool(project.category, s.day);
        if (tool) {
          const inventoryFull = s.tools.filter((t) => !t.lockedToDogId).length >= TOOL_CAP;
          const target = findAutoEquipTarget(s.staff, s.teams, s.tools, tool);
          let acquired = false;

          if (target) {
            // 自動裝備給上陣員工
            const oldTool = target.oldToolId
              ? s.tools.find((t) => t.instanceId === target.oldToolId) ?? null
              : null;
            let nextTools = s.tools;
            let droppedOldMsg = '';
            let canEquip = true;
            if (oldTool && inventoryFull) {
              // 庫存滿 → 舊裝備丟掉
              nextTools = s.tools.filter((t) => t.instanceId !== oldTool.instanceId);
              droppedOldMsg = `（丟掉舊 ${oldTool.grade} ${oldTool.name}）`;
            } else if (!oldTool && inventoryFull) {
              // 目標狗沒裝備，但庫存已滿 → 擠掉庫存中更差的
              const removeId = findReplaceableInInventory(s.tools, s.staff, tool);
              if (removeId) {
                const replaced = s.tools.find((t) => t.instanceId === removeId) ?? null;
                nextTools = s.tools.filter((t) => t.instanceId !== removeId);
                droppedOldMsg = replaced
                  ? `（擠掉 ${replaced.grade} ${replaced.name}）`
                  : '';
              } else {
                canEquip = false;
              }
            }
            if (canEquip) {
              nextTools = [...nextTools, tool];
              s.tools = nextTools;
              s.staff = s.staff.map((d) =>
                d.id === target.dogId ? { ...d, equippedToolId: tool.instanceId } : d,
              );
              const dogName = s.staff.find((d) => d.id === target.dogId)?.name ?? '';
              const oldEquipMsg = oldTool && !inventoryFull
                ? `（換下 ${oldTool.grade} ${oldTool.name}）`
                : '';
              newLogs.push({
                day: s.day,
                msg: `🧸 撿到 ${tool.grade} ${tool.name} → 自動裝給 ${dogName}${oldEquipMsg}${droppedOldMsg}`,
              });
              toast = {
                msg: `🧸 ${tool.grade} ${tool.name} → ${dogName}`,
                type: 'positive',
              };
              acquired = true;
            } else {
              newLogs.push({
                day: s.day,
                msg: `🧸 撿到 ${tool.grade} ${tool.name}，但庫存已滿且無可擠掉項目，丟棄`,
              });
              toast = { msg: `${tool.name} 庫存滿，丟棄`, type: 'negative' };
            }
          } else if (!inventoryFull) {
            // 沒人需要升級，但庫存有空 → 收入庫存
            s.tools = [...s.tools, tool];
            newLogs.push({
              day: s.day,
              msg: `🧸 撿到玩具：${tool.name}（${tool.grade}）`,
            });
            toast = { msg: `🧸 撿到 ${tool.grade} ${tool.name}`, type: 'positive' };
            acquired = true;
          } else {
            // 沒人需要 + 庫存滿 → 嘗試擠掉庫存中更差的
            const removeId = findReplaceableInInventory(s.tools, s.staff, tool);
            if (removeId) {
              const replaced = s.tools.find((t) => t.instanceId === removeId) ?? null;
              s.tools = [
                ...s.tools.filter((t) => t.instanceId !== removeId),
                tool,
              ];
              newLogs.push({
                day: s.day,
                msg: `🧸 撿到玩具：${tool.name}（${tool.grade}），擠掉 ${replaced?.grade} ${replaced?.name}`,
              });
              toast = {
                msg: `🧸 撿到 ${tool.grade} ${tool.name}，擠掉 ${replaced?.name}`,
                type: 'positive',
              };
              acquired = true;
            } else {
              newLogs.push({
                day: s.day,
                msg: `🧸 撿到 ${tool.grade} ${tool.name}，但所有人裝備與庫存都更好，丟棄`,
              });
              toast = { msg: `${tool.name} 較差，丟棄`, type: 'negative' };
            }
          }

          if (acquired) {
            s.pendingToolDrops = [
              ...s.pendingToolDrops,
              {
                id: `tool-${s.day}-${project.id}-${s.pendingToolDrops.length}`,
                projectId: project.id,
                tool,
              },
            ];
          }
        }
      }
    } else {
      settledClients.push(project);
    }
  }
  s.clients = settledClients;
  s.projectsCompleted += projectsCompletedAdd;
  summary.completedCount = projectsCompletedAdd;

  // 4. 處理超期失敗：active 案件 day > deadlineDay + graceDays 即失敗
  const expiredClients: Project[] = [];
  let projectsFailedAdd = 0;
  for (const project of s.clients) {
    if (project.status !== 'active' || project.deadlineDay < 0) {
      expiredClients.push(project);
      continue;
    }
    const expiry = project.deadlineDay + project.graceDays;
    if (s.day > expiry) {
      s.money = Math.max(0, s.money - project.penalty);
      summary.penaltyTotal += project.penalty;
      projectsFailedAdd += 1;
      const ids = new Set(project.assignedStaffIds);
      s.staff = s.staff.map((d) =>
        ids.has(d.id) ? { ...d, assignedProjectId: null } : d,
      );
      expiredClients.push({ ...project, status: 'failed' });
      newLogs.push({
        day: s.day,
        msg: `❌ 「${project.title}」(${project.clientName}) 超期失敗，違約金 $${project.penalty}`,
      });
    } else {
      expiredClients.push(project);
    }
  }
  s.clients = expiredClients;
  s.projectsFailed += projectsFailedAdd;
  summary.failedCount += projectsFailedAdd;

  return { state: s, newLogs, toast, summary };
}
