import type {
  ChemistryCombo,
  Dog,
  GameState,
  LogEntry,
  Project,
  ProjectCategory,
} from '@/types';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import { isRoleMatched } from './projectGen';
import { clamp } from './utils';
import {
  getDogSpeedMul,
  getDogQualityMul,
  getDogCharismaMul,
  getDogFatigueAccumMul,
  getDogMoraleFloor,
  getDogDailyMoraleDelta,
  getProjectChemBoost,
  getProjectRewardMul,
  getProjectExpMulForDog,
} from './dogTraitsEngine';

// === 類別主/次 stat 加成（plan §2.2）===
type CategoryMul = {
  speedMul: number;
  qualityMul: number;
  charismaMul: number;
  teamworkMul: number;
};

function categoryMulFor(category: ProjectCategory): CategoryMul {
  switch (category) {
    case 'tech':
      // quality 主 ×1.3、speed 副 ×1.2
      return { qualityMul: 1.3, speedMul: 1.2, charismaMul: 1.0, teamworkMul: 1.0 };
    case 'design':
      // quality 主 ×1.4、charisma 副 ×1.1、speed 補 ×1.15（避免推進過慢）
      return { qualityMul: 1.4, charismaMul: 1.1, speedMul: 1.15, teamworkMul: 1.0 };
    case 'marketing':
      // charisma 主 ×1.5、speed 副 ×1.1
      return { charismaMul: 1.5, speedMul: 1.1, qualityMul: 1.0, teamworkMul: 1.0 };
    case 'service':
      // teamwork 主 ×1.4、quality 副 ×1.1、speed 補 ×1.15（避免推進過慢）
      return { teamworkMul: 1.4, qualityMul: 1.1, speedMul: 1.15, charismaMul: 1.0 };
  }
}

// === 員工士氣乘數（plan §2.4-6）===
function moraleMul(dog: Dog): number {
  if (dog.morale >= 80) return 1.15;
  if (dog.morale < 30) return 0.7;
  return 1.0;
}

// === 員工疲勞乘數（plan §2.7）===
function fatigueMul(dog: Dog): number {
  if (dog.fatigue >= 100) return 0; // 強制請假當天不貢獻
  if (dog.fatigue >= 80) return 0.55;
  if (dog.fatigue >= 60) return 0.75;
  if (dog.fatigue >= 40) return 0.9;
  return 1.0;
}

// === 化學反應 per-project 計算（plan §7.1）===
type ChemEffect = {
  speedMul: number;
  qualityMul: number;
  teamworkMul: number;
  charismaMul: number;
  dailyMoraleDelta: number;
  triggered: ChemistryCombo[];
};

function computeChemistry(assignedDogs: Dog[], category: ProjectCategory): ChemEffect {
  const out: ChemEffect = {
    speedMul: 1, qualityMul: 1, teamworkMul: 1, charismaMul: 1,
    dailyMoraleDelta: 0, triggered: [],
  };
  if (assignedDogs.length < 2) return out;
  const roles = new Set(assignedDogs.map((d) => d.role));
  for (const combo of CHEMISTRY_COMBOS) {
    const [r1, r2] = combo.roles;
    if (!roles.has(r1) || !roles.has(r2)) continue;
    if (combo.category && combo.category !== 'any' && combo.category !== category) continue;
    out.speedMul *= combo.bonus.speedMul ?? 1;
    out.qualityMul *= combo.bonus.qualityMul ?? 1;
    out.teamworkMul *= combo.bonus.teamworkMul ?? 1;
    out.charismaMul *= combo.bonus.charismaMul ?? 1;
    out.dailyMoraleDelta += combo.bonus.moraleDelta ?? 0;
    out.triggered.push(combo);
  }
  return out;
}

// === 議價倍率（隊上有業務或行銷 ×1.1）===
function bargainMulFor(assignedDogs: Dog[]): number {
  return assignedDogs.some((d) => d.role === '業務' || d.role === '行銷') ? 1.1 : 1.0;
}

// === 隊伍同步加成 ===
function teamSynergy(assignedDogs: Dog[], pmTeamBoost: boolean): number {
  if (assignedDogs.length <= 1) return 1;
  const avgTeamwork =
    assignedDogs.reduce((n, d) => n + d.stats.teamwork, 0) / assignedDogs.length;
  // PM 隊長 +15% team buff
  const buff = pmTeamBoost ? 1.15 : 1.0;
  return (1 + 0.05 * avgTeamwork * (assignedDogs.length - 1)) * buff;
}

// === 每日推進案件進度 ===
type DayProgress = {
  staffById: Map<string, Dog>;
  currentDay: number;
};

function buildDogIdMap(staff: Dog[]): Map<string, Dog> {
  const m = new Map<string, Dog>();
  for (const d of staff) m.set(d.id, d);
  return m;
}

// === 每日 fatigue 變化 ===
function applyDailyFatigue(staff: Dog[]): Dog[] {
  return staff.map((d) => {
    const wasAssigned = !!d.assignedProjectId;
    let nextFatigue = d.fatigue;
    if (wasAssigned) {
      if (d.fatigue >= 100) {
        // 過勞中：強制當日休息回血，避免卡死無限循環
        nextFatigue = clamp(d.fatigue - 15, 0, 100);
      } else {
        // S 級 ×0.7、A 級 ×0.85，其他正常累積；再乘特性疲勞係數
        const gradeMul = d.grade === 'S' ? 0.7 : d.grade === 'A' ? 0.85 : 1.0;
        const traitMul = getDogFatigueAccumMul(d);
        nextFatigue = clamp(d.fatigue + 10 * gradeMul * traitMul, 0, 100);
      }
    } else {
      nextFatigue = clamp(d.fatigue - 15, 0, 100);
    }
    return { ...d, fatigue: nextFatigue };
  });
}

// === 每日 loyalty 自然累積 + 特性 morale delta ===
function applyDailyLoyalty(staff: Dog[]): Dog[] {
  return staff.map((d) => {
    let next = d.loyalty;
    // 每 7 天 +1（用 daysAtCompany 判斷）
    if (d.daysAtCompany > 0 && d.daysAtCompany % 7 === 0) next += 1;
    // 個人士氣 > 80 → +0.5；< 30 → -1
    if (d.morale >= 80) next += 0.5;
    if (d.morale < 30) next -= 1;
    const moraleAdj = getDogDailyMoraleDelta(d);
    return {
      ...d,
      loyalty: clamp(next, 0, 100),
      daysAtCompany: d.daysAtCompany + 1,
      morale: clamp(d.morale + moraleAdj, 0, 100),
    };
  });
}

// === 推進進度（plan §2.4）===
function pushProjectProgress(
  project: Project,
  ctx: DayProgress,
  buffs: { speedBoost: number; qualityBoost: number; teamworkBoost: number; charismaBoost: number },
): { project: Project; chemTriggered: ChemistryCombo[]; chemMoraleDelta: number; assignedDogs: Dog[] } {
  if (project.status !== 'active') {
    return { project, chemTriggered: [], chemMoraleDelta: 0, assignedDogs: [] };
  }
  // 篩出今天還在工作（沒請假）的隊員
  const assignedDogs = project.assignedStaffIds
    .map((id) => ctx.staffById.get(id))
    .filter((d): d is Dog => !!d && d.onLeaveDay !== ctx.currentDay);
  if (assignedDogs.length === 0) {
    return { project, chemTriggered: [], chemMoraleDelta: 0, assignedDogs: [] };
  }
  const catMul = categoryMulFor(project.category);
  const chem = computeChemistry(assignedDogs, project.category);
  const pmTeamBoost = assignedDogs.some((d) => d.role === 'PM' || d.role === 'CEO');
  const synergy = teamSynergy(assignedDogs, pmTeamBoost);
  // 化學催化：隊上有 catalyst → chem speed/quality 倍率再 ×1.2
  const chemBoost = getProjectChemBoost(assignedDogs);
  const effChemSpeed = 1 + (chem.speedMul - 1) * chemBoost;
  const effChemQuality = 1 + (chem.qualityMul - 1) * chemBoost;

  let workAdded = 0;
  let qualityAdded = 0;

  for (const dog of assignedDogs) {
    const speed = dog.stats.speed + buffs.speedBoost;
    const quality = dog.stats.quality + buffs.qualityBoost;

    // contrib = speed × catMul × roleMatch × synergy × chemSpeedMul × moraleMul × fatigueMul × traitSpeedMul
    const roleMatch = isRoleMatched(dog, project.category) ? 1.15 : 1.0;
    const traitSpeed = getDogSpeedMul(dog);
    const traitQuality = getDogQualityMul(dog);
    // 行銷類案件：charisma 影響 → 特性 charisma 加成乘上 catMul.charismaMul（用近似：在 charismaMul 上做修正）
    // 簡單做法：把 social 的 charisma 加成轉成行銷案的 quality 微加成 + speed 微加成
    const traitCharisma = getDogCharismaMul(dog);
    // 行銷案吃 charisma；其他案 charisma 影響很小，這裡用：speed 與 quality 都乘 charisma 平方根的偏移
    const charismaApply =
      project.category === 'marketing'
        ? traitCharisma // 行銷案完整套用
        : 1 + (traitCharisma - 1) * 0.3; // 其他案 30% 折扣

    const contrib =
      speed *
      catMul.speedMul *
      roleMatch *
      synergy *
      effChemSpeed *
      moraleMul(dog) *
      fatigueMul(dog) *
      traitSpeed *
      charismaApply;

    workAdded += contrib;
    qualityAdded += quality * catMul.qualityMul * effChemQuality * traitQuality * contrib;
  }

  return {
    project: {
      ...project,
      workDone: project.workDone + workAdded,
      qualitySum: project.qualitySum + qualityAdded,
    },
    chemTriggered: chem.triggered,
    chemMoraleDelta: chem.dailyMoraleDelta,
    assignedDogs,
  };
}

// === 結算完成案 ===
function settleProject(
  project: Project,
  assignedDogs: Dog[],
  currentDay: number,
): {
  project: Project;
  finalReward: number;
  qualityRatio: number;
  reputationDelta: number;
  experienceGain: number;
} {
  if (project.workDone < project.workRequired || project.status !== 'active') {
    return {
      project,
      finalReward: 0,
      qualityRatio: 0,
      reputationDelta: 0,
      experienceGain: 0,
    };
  }
  const avgQuality = project.workDone > 0 ? project.qualitySum / project.workDone : 0;
  const qualityRatio = avgQuality / Math.max(1, project.expectedQuality);
  const payoutMul = clamp(0.5 + qualityRatio * 0.6, 0.5, 1.5);
  const bargain = bargainMulFor(assignedDogs);

  // 議價達人特性：reward 再 ×1.08
  const traitReward = getProjectRewardMul(assignedDogs);
  const finalReward = Math.max(
    0,
    Math.round(project.reward * payoutMul * project.rewardMul * project.qualityMul * bargain * traitReward),
  );
  const repDelta =
    qualityRatio >= 1
      ? project.reputationDelta.success
      : Math.round(project.reputationDelta.success * qualityRatio);

  // 經驗：tier1=2, tier2=4, tier3=8, tier4=14, tier5=24
  const expByTier = [0, 2, 4, 8, 14, 24];
  const experienceGain = expByTier[project.clientTier] ?? 0;

  return {
    project: { ...project, status: 'done' },
    finalReward,
    qualityRatio,
    reputationDelta: repDelta,
    experienceGain,
  };
}

// === 升級檢查 ===
// 重構後：階級升等取消，改用 level 系統。保留函式 stub 給呼叫處不破。
function checkUpgrade(dog: Dog): { dog: Dog; upgraded: boolean; newGrade: Dog['grade'] | null } {
  return { dog, upgraded: false, newGrade: null };
}

// === 多日模擬：算一組員工要幾天才能把工作量推完，會把每日疲勞累積算進去 ===
// 用於 auto-assign / accept gate / wait-vs-now 比較，比單日 contrib 更準
export function simulateProjectDays(
  dogs: Dog[],
  workRequired: number,
  workDoneStart: number,
  category: ProjectCategory,
  buffs: { speedBoost: number; qualityBoost: number; teamworkBoost: number; charismaBoost: number },
  maxDays = 60,
): { days: number; finalDogs: Dog[]; complete: boolean } {
  if (dogs.length === 0 || workRequired <= 0) {
    return { days: workRequired <= 0 ? 0 : maxDays, finalDogs: dogs, complete: workRequired <= 0 };
  }
  let workDone = workDoneStart;
  let current = dogs.map((d) => ({ ...d }));
  for (let day = 1; day <= maxDays; day++) {
    // 1. 套用每日疲勞變化（指派狀態下 +10×grade×trait；100 強制休息 -15）
    current = current.map((d) => {
      let nextFatigue = d.fatigue;
      if (d.fatigue >= 100) {
        nextFatigue = clamp(d.fatigue - 15, 0, 100);
      } else {
        const gradeMul = d.grade === 'S' ? 0.7 : d.grade === 'A' ? 0.85 : 1.0;
        const traitMul = getDogFatigueAccumMul(d);
        nextFatigue = clamp(d.fatigue + 10 * gradeMul * traitMul, 0, 100);
      }
      return { ...d, fatigue: nextFatigue };
    });
    // 2. 用更新後的 fatigue 算今日 contrib（fatigueMul 會在 estimateDailyContrib 內套用）
    const contrib = estimateDailyContrib(category, current, buffs);
    workDone += contrib;
    if (workDone >= workRequired) {
      return { days: day, finalDogs: current, complete: true };
    }
  }
  return { days: maxDays, finalDogs: current, complete: false };
}

// === 估算：給一組員工，每天可推進多少 work（給 inbox 預覽用）===
// 公式與 pushProjectProgress 對齊（含士氣/疲勞/特性/化學催化），給玩家準確預估
export function estimateDailyContrib(
  category: ProjectCategory,
  dogs: Dog[],
  buffs: { speedBoost: number; qualityBoost: number; teamworkBoost: number; charismaBoost: number },
): number {
  if (dogs.length === 0) return 0;
  const catMul = categoryMulFor(category);
  const chem = computeChemistry(dogs, category);
  const pmTeamBoost = dogs.some((d) => d.role === 'PM' || d.role === 'CEO');
  const synergy = teamSynergy(dogs, pmTeamBoost);
  // 化學催化：隊上有 catalyst → chem speed 倍率再強化
  const chemBoost = getProjectChemBoost(dogs);
  const effChemSpeed = 1 + (chem.speedMul - 1) * chemBoost;

  let total = 0;
  for (const dog of dogs) {
    const speed = dog.stats.speed + buffs.speedBoost;
    const roleMatch = isRoleMatched(dog, category) ? 1.15 : 1.0;
    const traitSpeed = getDogSpeedMul(dog);
    const traitCharisma = getDogCharismaMul(dog);
    const charismaApply =
      category === 'marketing'
        ? traitCharisma
        : 1 + (traitCharisma - 1) * 0.3;
    const contrib =
      speed *
      catMul.speedMul *
      roleMatch *
      synergy *
      effChemSpeed *
      moraleMul(dog) *
      fatigueMul(dog) *
      traitSpeed *
      charismaApply;
    total += contrib;
  }
  return total;
}

// === 主入口：跑一天的所有案件邏輯 ===
export type DaySummaryPartial = {
  income: number;
  reputationDelta: number;
  completedCount: number;
  failedCount: number;
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
    reputationDelta: 0,
    completedCount: 0,
    failedCount: 0,
    levelUps: [],
  };

  // 1. 每日 fatigue / loyalty 處理
  s.staff = applyDailyFatigue(s.staff);
  s.staff = applyDailyLoyalty(s.staff);
  // 清理「過期的」休假旗標（昨天放假的，今天就回崗）
  s.staff = s.staff.map((d) =>
    d.onLeaveDay != null && d.onLeaveDay < s.day ? { ...d, onLeaveDay: null } : d,
  );

  // 2. 推進每個 active 案的進度
  const ctx: DayProgress = { staffById: buildDogIdMap(s.staff), currentDay: s.day };
  const updatedClients: Project[] = [];
  const moraleDeltaByDogId = new Map<string, number>();

  for (const project of s.clients) {
    if (project.status !== 'active') {
      updatedClients.push(project);
      continue;
    }
    const result = pushProjectProgress(project, ctx, s.companyBuffs);
    updatedClients.push(result.project);
    // 化學反應 morale 變化分配給隊員
    if (result.chemMoraleDelta !== 0) {
      for (const d of result.assignedDogs) {
        moraleDeltaByDogId.set(d.id, (moraleDeltaByDogId.get(d.id) ?? 0) + result.chemMoraleDelta);
      }
    }
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
    // 案件最快 2 天：受理當天到結案至少跨 2 個 runProjectsDay cycle
    const daysSinceAccepted = s.day - (project.acceptedDay ?? s.day);
    if (project.workDone >= project.workRequired && daysSinceAccepted >= 1) {
      const assignedDogs = project.assignedStaffIds
        .map((id) => ctx.staffById.get(id))
        .filter((d): d is Dog => !!d);
      const settled = settleProject(project, assignedDogs, s.day);
      settledClients.push(settled.project);
      projectsCompletedAdd += 1;
      // 加錢、加信譽
      s.money += settled.finalReward;
      const repBefore = s.reputation;
      s.reputation = clamp(s.reputation + settled.reputationDelta, 0, 100);
      summary.income += settled.finalReward;
      summary.reputationDelta += s.reputation - repBefore;
      // 給隊員經驗、士氣 +3、loyalty +2、解除指派 → 用 immutable update（避免 mutate 不觸發 re-render）
      // 老師特性：同案中其他人有 mentor → exp ×1.5
      const assignedIds = new Set(assignedDogs.map((d) => d.id));
      s.staff = s.staff.map((d) => {
        if (!assignedIds.has(d.id)) return d;
        const expMul = getProjectExpMulForDog(d, assignedDogs);
        return {
          ...d,
          experience: d.experience + Math.round(settled.experienceGain * expMul),
          morale: clamp(d.morale + 3, 0, 100),
          loyalty: clamp(d.loyalty + 2, 0, 100),
          assignedProjectId: null,
        };
      });
      newLogs.push({
        day: s.day,
        msg: ` 完成「${project.title}」(${project.clientName})：拿 $${settled.finalReward}、信譽 ${settled.reputationDelta >= 0 ? '+' : ''}${settled.reputationDelta}`,
      });
      s.pendingCoinBursts = [
        ...s.pendingCoinBursts,
        {
          id: `coin-${s.day}-${project.id}-${s.pendingCoinBursts.length}`,
          projectId: project.id,
          reward: settled.finalReward,
        },
      ];
    } else {
      settledClients.push(project);
    }
  }
  s.clients = settledClients;
  s.projectsCompleted += projectsCompletedAdd;
  summary.completedCount = projectsCompletedAdd;

  // 6. 套用化學反應產生的隊員 morale delta
  if (moraleDeltaByDogId.size > 0) {
    s.staff = s.staff.map((d) => {
      const delta = moraleDeltaByDogId.get(d.id);
      if (delta == null || delta === 0) return d;
      return { ...d, morale: clamp(d.morale + delta, 0, 100) };
    });
  }

  // 7. 升級檢查（完成案後 experience 變動）
  const upgrades: { name: string; from: Dog['grade']; to: Dog['grade'] }[] = [];
  s.staff = s.staff.map((d) => {
    const result = checkUpgrade(d);
    if (result.upgraded && result.newGrade) {
      upgrades.push({ name: d.name, from: d.grade, to: result.newGrade });
    }
    return result.dog;
  });
  for (const u of upgrades) {
    newLogs.push({ day: s.day, msg: ` ${u.name} 從 ${u.from} 級升到 ${u.to} 級！可挑選新特性！` });
    s.staff = s.staff.map((d) =>
      d.name === u.name ? { ...d, morale: clamp(d.morale + 5, 0, 100), loyalty: clamp(d.loyalty + 5, 0, 100) } : d,
    );
    summary.levelUps.push({ name: u.name, to: u.to });
  }

  // 8. 套用「鋼鐵心」士氣下限
  s.staff = s.staff.map((d) => {
    const floor = getDogMoraleFloor(d);
    if (d.morale < floor) return { ...d, morale: floor };
    return d;
  });

  return { state: s, newLogs, toast, summary };
}

