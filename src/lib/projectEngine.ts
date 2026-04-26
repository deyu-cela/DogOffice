import type {
  ChemistryCombo,
  Dog,
  GameState,
  LogEntry,
  Project,
  ProjectCategory,
  ProjectEvent,
  ProjectEventKind,
} from '@/types';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import { isRoleMatched } from './projectGen';
import { clamp } from './utils';

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
      // S 級 ×0.7、A 級 ×0.85，其他正常累積
      const mul = d.grade === 'S' ? 0.7 : d.grade === 'A' ? 0.85 : 1.0;
      nextFatigue = clamp(d.fatigue + 10 * mul, 0, 100);
    } else {
      nextFatigue = clamp(d.fatigue - 15, 0, 100);
    }
    return { ...d, fatigue: nextFatigue };
  });
}

// === 每日 loyalty 自然累積 ===
function applyDailyLoyalty(staff: Dog[]): Dog[] {
  return staff.map((d) => {
    let next = d.loyalty;
    // 每 7 天 +1（用 daysAtCompany 判斷）
    if (d.daysAtCompany > 0 && d.daysAtCompany % 7 === 0) next += 1;
    // 個人士氣 > 80 → +0.5；< 30 → -1
    if (d.morale >= 80) next += 0.5;
    if (d.morale < 30) next -= 1;
    return { ...d, loyalty: clamp(next, 0, 100), daysAtCompany: d.daysAtCompany + 1 };
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
  const assignedDogs = project.assignedStaffIds
    .map((id) => ctx.staffById.get(id))
    .filter((d): d is Dog => !!d);
  if (assignedDogs.length === 0) {
    return { project, chemTriggered: [], chemMoraleDelta: 0, assignedDogs: [] };
  }
  const catMul = categoryMulFor(project.category);
  const chem = computeChemistry(assignedDogs, project.category);
  const pmTeamBoost = assignedDogs.some((d) => d.role === 'PM' || d.role === 'CEO');
  const synergy = teamSynergy(assignedDogs, pmTeamBoost);

  let workAdded = 0;
  let qualityAdded = 0;

  for (const dog of assignedDogs) {
    const speed = dog.stats.speed + buffs.speedBoost;
    const quality = dog.stats.quality + buffs.qualityBoost;

    // contrib = speed × catMul × roleMatch × synergy × chemSpeedMul × moraleMul × fatigueMul
    const roleMatch = isRoleMatched(dog, project.category) ? 1.15 : 1.0;
    const contrib =
      speed *
      catMul.speedMul *
      roleMatch *
      synergy *
      chem.speedMul *
      moraleMul(dog) *
      fatigueMul(dog);

    workAdded += contrib;
    qualityAdded += quality * catMul.qualityMul * chem.qualityMul * contrib;
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
  // 期限處理：超期 1~2 天 reward × 0.7
  const overDays = Math.max(0, currentDay - project.deadlineDay);
  const lateMul = overDays === 0 ? 1.0 : overDays <= project.graceDays ? 0.7 : 1.0;

  const finalReward = Math.max(
    0,
    Math.round(project.reward * payoutMul * project.rewardMul * project.qualityMul * bargain * lateMul),
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
const EXP_THRESHOLDS: Record<Dog['grade'], number> = {
  D: 8,
  C: 25,
  B: 60,
  A: 130,
  S: Infinity, // 封頂
};

function checkUpgrade(dog: Dog): { dog: Dog; upgraded: boolean; newGrade: Dog['grade'] | null } {
  if (dog.isCEO) return { dog, upgraded: false, newGrade: null };
  if (dog.grade === 'S') return { dog, upgraded: false, newGrade: null };
  const threshold = EXP_THRESHOLDS[dog.grade];
  if (dog.experience < threshold) return { dog, upgraded: false, newGrade: null };
  const order: Dog['grade'][] = ['D', 'C', 'B', 'A', 'S'];
  const idx = order.indexOf(dog.grade);
  const newGrade = order[idx + 1];
  // stat 倍率 D 0.6 → C 0.8 →...，提升 ratio = newMul / oldMul
  const mulMap: Record<Dog['grade'], number> = { D: 0.6, C: 0.8, B: 1.0, A: 1.2, S: 1.4 };
  const ratio = mulMap[newGrade] / mulMap[dog.grade];
  const newStats = {
    speed: clamp(Math.round(dog.stats.speed * ratio), 1, 10),
    quality: clamp(Math.round(dog.stats.quality * ratio), 1, 10),
    teamwork: clamp(Math.round(dog.stats.teamwork * ratio), 1, 10),
    charisma: clamp(Math.round(dog.stats.charisma * ratio), 1, 10),
  };
  // 薪水跟漲（薪資修正比）
  const salaryMap: Record<Dog['grade'], number> = { D: 0.7, C: 0.85, B: 1.0, A: 1.25, S: 1.6 };
  const salaryRatio = salaryMap[newGrade] / salaryMap[dog.grade];
  const newSalary = Math.round(dog.expectedSalary * salaryRatio);
  return {
    dog: {
      ...dog,
      grade: newGrade,
      stats: newStats,
      expectedSalary: newSalary,
      severance: newSalary * 3,
    },
    upgraded: true,
    newGrade,
  };
}

// === 中途事件觸發判定（每 active 案每天 15% 基準）===
const MID_EVENT_KINDS: ProjectEventKind[] = [
  'changeRequest',
  'earlyDeliver',
  'upsell',
  'bugBurst',
  'dogLeaveAsk',
  'poaching',
];

function rollMidEvent(
  project: Project,
  assignedDogs: Dog[],
  currentDay: number,
): ProjectEvent | null {
  // 每個案件最多只觸發 1 次中途事件
  if (project.eventCount >= 1) return null;
  if (project.pendingEvent) return null;
  const baseChance = 0.15 + project.bonusEventChance;
  if (Math.random() > baseChance) return null;

  // 過濾可用事件（依條件）
  const candidates: ProjectEventKind[] = [];
  // 1 client change request: any
  candidates.push('changeRequest');
  // 2 early deliver: 進度 ≥ 50%
  if (project.workDone / Math.max(1, project.workRequired) >= 0.5) {
    candidates.push('earlyDeliver');
  }
  // 3 upsell: 品質比 > 1.0（粗略判斷：currentQuality / expected）
  const currentRatio =
    project.workDone > 0
      ? (project.qualitySum / project.workDone) / Math.max(1, project.expectedQuality)
      : 0;
  if (currentRatio > 1.0) candidates.push('upsell');
  // 4 bug burst: tech case
  if (project.category === 'tech') candidates.push('bugBurst');
  // 5 leave ask: 隊員 fatigue > 70
  const tiredDog = assignedDogs.find((d) => d.fatigue > 70);
  if (tiredDog) candidates.push('dogLeaveAsk');
  // 6 poaching: 隊上有 A/S 級且 loyalty < 80
  const targetDog = assignedDogs.find(
    (d) => (d.grade === 'A' || d.grade === 'S') && d.loyalty < 80,
  );
  if (targetDog) candidates.push('poaching');

  if (candidates.length === 0) return null;
  const kind = candidates[Math.floor(Math.random() * candidates.length)];

  const event: ProjectEvent = {
    kind,
    triggeredDay: currentDay,
    resolved: false,
  };

  // 鎖定特定員工
  if (kind === 'dogLeaveAsk' && tiredDog) {
    event.targetDogId = tiredDog.id;
  }
  if (kind === 'poaching' && targetDog) {
    event.targetDogId = targetDog.id;
  }
  void MID_EVENT_KINDS;
  return event;
}

// === 估算：給一組員工，每天可推進多少 work（給 inbox 預覽用）===
// 不含士氣 / 疲勞 / 化學反應動態因素，給玩家一個粗估數字
export function estimateDailyContrib(
  category: ProjectCategory,
  dogs: Dog[],
  buffs: { speedBoost: number; qualityBoost: number; teamworkBoost: number; charismaBoost: number },
): number {
  if (dogs.length === 0) return 0;
  void buffs; // 簡化：buffs 已包含在 dog.stats 顯示中
  const catMul = categoryMulFor(category);
  const chem = computeChemistry(dogs, category);
  const pmTeamBoost = dogs.some((d) => d.role === 'PM' || d.role === 'CEO');
  const synergy = teamSynergy(dogs, pmTeamBoost);

  let total = 0;
  for (const dog of dogs) {
    const speed = dog.stats.speed + buffs.speedBoost;
    const roleMatch = isRoleMatched(dog, category) ? 1.15 : 1.0;
    const contrib =
      speed *
      catMul.speedMul *
      roleMatch *
      synergy *
      chem.speedMul;
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
  newEventCount: number;
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
    newEventCount: 0,
  };

  // 1. 每日 fatigue / loyalty 處理
  s.staff = applyDailyFatigue(s.staff);
  s.staff = applyDailyLoyalty(s.staff);

  // 2. 推進每個 active 案的進度
  const ctx: DayProgress = { staffById: buildDogIdMap(s.staff) };
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
    if (project.workDone >= project.workRequired) {
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
      const assignedIds = new Set(assignedDogs.map((d) => d.id));
      s.staff = s.staff.map((d) =>
        assignedIds.has(d.id)
          ? {
              ...d,
              experience: d.experience + settled.experienceGain,
              morale: clamp(d.morale + 3, 0, 100),
              loyalty: clamp(d.loyalty + 2, 0, 100),
              assignedProjectId: null,
            }
          : d,
      );
      newLogs.push({
        day: s.day,
        msg: `🎉 完成「${project.title}」(${project.clientName})：拿 $${settled.finalReward}、信譽 ${settled.reputationDelta >= 0 ? '+' : ''}${settled.reputationDelta}`,
      });
      if (!toast) {
        toast = { msg: `🎉 案件完成！+$${settled.finalReward}`, type: 'positive' };
      }
    } else {
      settledClients.push(project);
    }
  }
  s.clients = settledClients;
  s.projectsCompleted += projectsCompletedAdd;

  // 4. 判失敗（超 graceDays）
  const finalClients: Project[] = [];
  let projectsFailedAdd = 0;
  for (const project of s.clients) {
    if (project.status !== 'active') {
      finalClients.push(project);
      continue;
    }
    const overDays = s.day - project.deadlineDay;
    if (overDays > project.graceDays) {
      finalClients.push({ ...project, status: 'failed' });
      projectsFailedAdd += 1;
      s.money = Math.max(0, s.money - project.penalty);
      const repBefore = s.reputation;
      s.reputation = clamp(s.reputation + project.reputationDelta.fail, 0, 100);
      summary.reputationDelta += s.reputation - repBefore;
      // 隊員 morale -5、解除指派
      const assignedIds = new Set(project.assignedStaffIds);
      s.staff = s.staff.map((d) =>
        assignedIds.has(d.id)
          ? { ...d, morale: clamp(d.morale - 5, 0, 100), assignedProjectId: null }
          : d,
      );
      newLogs.push({
        day: s.day,
        msg: `💔 失敗「${project.title}」(${project.clientName})：扣 $${project.penalty}、信譽 ${project.reputationDelta.fail}`,
      });
      if (!toast) {
        toast = { msg: `💔 案件失敗：-$${project.penalty}`, type: 'negative' };
      }
    } else {
      finalClients.push(project);
    }
  }
  s.clients = finalClients;
  s.projectsFailed += projectsFailedAdd;
  summary.completedCount = projectsCompletedAdd;
  summary.failedCount = projectsFailedAdd;

  // 5. 中途事件 roll（只對仍 active 的案）
  const ctx2: DayProgress = { staffById: buildDogIdMap(s.staff) };
  s.clients = s.clients.map((project) => {
    if (project.status !== 'active') return project;
    const assignedDogs = project.assignedStaffIds
      .map((id) => ctx2.staffById.get(id))
      .filter((d): d is Dog => !!d);
    const event = rollMidEvent(project, assignedDogs, s.day);
    if (!event) return project;
    summary.newEventCount += 1;
    return {
      ...project,
      pendingEvent: event,
      events: [...project.events, event],
      eventCount: project.eventCount + 1,
    };
  });

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
    newLogs.push({ day: s.day, msg: `🎓 ${u.name} 從 ${u.from} 級升到 ${u.to} 級！` });
    s.staff = s.staff.map((d) =>
      d.name === u.name ? { ...d, morale: clamp(d.morale + 5, 0, 100), loyalty: clamp(d.loyalty + 5, 0, 100) } : d,
    );
    summary.levelUps.push({ name: u.name, to: u.to });
  }

  return { state: s, newLogs, toast, summary };
}

// === 解析中途事件玩家選擇（A/B）===
export type EventResolveResult = {
  state: GameState;
  newLogs: LogEntry[];
  toast: GameState['toast'];
};

export function resolveProjectEvent(
  state: GameState,
  projectId: string,
  choice: 'A' | 'B',
): EventResolveResult {
  let s = { ...state };
  const newLogs: LogEntry[] = [];
  let toast: GameState['toast'] = null;

  const project = s.clients.find((c) => c.id === projectId);
  if (!project || !project.pendingEvent) return { state: s, newLogs, toast };
  const event = project.pendingEvent;

  // 取出本案隊員
  const assignedIds = new Set(project.assignedStaffIds);
  const updateProject = (mut: Partial<Project>): void => {
    s.clients = s.clients.map((c) => (c.id === projectId ? { ...c, ...mut, pendingEvent: null } : c));
  };
  const updateAssignedStaff = (fn: (d: Dog) => Dog): void => {
    s.staff = s.staff.map((d) => (assignedIds.has(d.id) ? fn(d) : d));
  };
  const updateOneStaff = (id: string, fn: (d: Dog) => Dog): void => {
    s.staff = s.staff.map((d) => (d.id === id ? fn(d) : d));
  };

  switch (event.kind) {
    case 'changeRequest': {
      if (choice === 'A') {
        // 接受變更：work +25%、workDone ×0.85、qualitySum ×0.85、reward ×1.25、士氣 -2、fatigue +5
        updateProject({
          workRequired: Math.round(project.workRequired * 1.25),
          workDone: project.workDone * 0.85,
          qualitySum: project.qualitySum * 0.85,
          rewardMul: project.rewardMul * 1.25,
          bonusEventChance: project.bonusEventChance + 0.05,
        });
        updateAssignedStaff((d) => ({
          ...d,
          fatigue: clamp(d.fatigue + 5, 0, 100),
          morale: clamp(d.morale - 2, 0, 100),
        }));
        newLogs.push({ day: s.day, msg: `📝 接受 ${project.clientName} 的變更需求（reward+25%、工作量+25%）` });
        toast = { msg: '📝 接受客戶變更需求', type: 'positive' };
      } else {
        // 拒絕：reward ×0.9、信譽 -2、隊員士氣 +1、quality ×0.92
        updateProject({
          rewardMul: project.rewardMul * 0.9,
          qualityMul: project.qualityMul * 0.92,
        });
        s.reputation = clamp(s.reputation - 2, 0, 100);
        updateAssignedStaff((d) => ({ ...d, morale: clamp(d.morale + 1, 0, 100) }));
        newLogs.push({ day: s.day, msg: `📝 拒絕 ${project.clientName} 的變更需求（信譽 -2、reward -10%）` });
        toast = { msg: '📝 拒絕客戶變更需求', type: 'negative' };
      }
      break;
    }
    case 'earlyDeliver': {
      if (choice === 'A') {
        updateProject({
          deadlineDay: project.deadlineDay - 2,
          rewardMul: project.rewardMul * 1.15,
          bonusEventChance: project.bonusEventChance - 0.075, // -50% of base 0.15
        });
        updateAssignedStaff((d) => ({ ...d, fatigue: clamp(d.fatigue + 8, 0, 100) }));
        newLogs.push({ day: s.day, msg: `🏃 ${project.clientName} 提前交件（deadline -2、reward +15%）` });
        toast = { msg: '🏃 答應提前交件', type: 'positive' };
      } else {
        s.reputation = clamp(s.reputation - 0.5, 0, 100);
        updateProject({});
        newLogs.push({ day: s.day, msg: `🏃 維持 ${project.clientName} 原期限` });
      }
      break;
    }
    case 'upsell': {
      if (choice === 'A') {
        const newTier = Math.min(5, project.clientTier + 1) as Project['clientTier'];
        const tierStatsMap: Record<number, { rewardMin: number; rewardMax: number; expectedQuality: number; repSuccess: number; repFail: number }> = {
          1: { rewardMin: 80, rewardMax: 130, expectedQuality: 1.5, repSuccess: 2, repFail: -3 },
          2: { rewardMin: 200, rewardMax: 300, expectedQuality: 3.0, repSuccess: 3, repFail: -5 },
          3: { rewardMin: 450, rewardMax: 650, expectedQuality: 4.5, repSuccess: 5, repFail: -8 },
          4: { rewardMin: 950, rewardMax: 1300, expectedQuality: 6.0, repSuccess: 8, repFail: -12 },
          5: { rewardMin: 1900, rewardMax: 2600, expectedQuality: 7.5, repSuccess: 12, repFail: -18 },
        };
        const newStats = tierStatsMap[newTier];
        const newReward = Math.round((newStats.rewardMin + newStats.rewardMax) / 2);
        updateProject({
          workRequired: Math.round(project.workRequired * 1.5),
          clientTier: newTier,
          reward: newReward,
          penalty: Math.round(newReward * 0.4),
          expectedQuality: newStats.expectedQuality,
          reputationDelta: { success: newStats.repSuccess + 5, fail: newStats.repFail },
        });
        newLogs.push({ day: s.day, msg: `🎁 ${project.clientName} 加碼成 tier${newTier}（reward $${newReward}、工作量 +50%）` });
        toast = { msg: '🎁 案子升級了！', type: 'positive' };
      } else {
        updateProject({});
        newLogs.push({ day: s.day, msg: `🎁 維持 ${project.clientName} 原 tier${project.clientTier}` });
      }
      break;
    }
    case 'bugBurst': {
      if (choice === 'A') {
        updateAssignedStaff((d) => ({
          ...d,
          fatigue: clamp(d.fatigue + 20, 0, 100),
          loyalty: clamp(d.loyalty - 2, 0, 100),
        }));
        updateProject({});
        newLogs.push({ day: s.day, msg: `🐛 全員加班修 ${project.clientName} 的 bug（fatigue +20）` });
        toast = { msg: '🐛 加班修 bug', type: 'negative' };
      } else {
        updateProject({ qualityMul: project.qualityMul * 0.85 });
        s.reputation = clamp(s.reputation - 1, 0, 100);
        newLogs.push({ day: s.day, msg: `🐛 認賠 ${project.clientName} 的 bug（quality ×0.85、信譽 -1）` });
      }
      break;
    }
    case 'dogLeaveAsk': {
      const targetId = event.targetDogId;
      if (!targetId) {
        updateProject({});
        break;
      }
      if (choice === 'A') {
        updateOneStaff(targetId, (d) => ({
          ...d,
          fatigue: clamp(d.fatigue - 30, 0, 100),
          loyalty: clamp(d.loyalty + 5, 0, 100),
          morale: clamp(d.morale + 5, 0, 100),
          unhappyLeaveDays: 0,
        }));
        // 其他隊員 loyalty +1
        s.staff = s.staff.map((d) =>
          assignedIds.has(d.id) && d.id !== targetId
            ? { ...d, loyalty: clamp(d.loyalty + 1, 0, 100) }
            : d,
        );
        const targetName = s.staff.find((d) => d.id === targetId)?.name ?? '員工';
        newLogs.push({ day: s.day, msg: `😴 准 ${targetName} 請假，狀態恢復` });
        toast = { msg: '😴 准請假', type: 'positive' };
        updateProject({});
      } else {
        const target = s.staff.find((d) => d.id === targetId);
        const targetName = target?.name ?? '員工';
        const newUnhappy = (target?.unhappyLeaveDays ?? 0) + 1;
        if (newUnhappy >= 3) {
          // 連 3 次不准 → 直接離職
          s.staff = s.staff.filter((d) => d.id !== targetId);
          // 該案的指派也移除
          updateProject({
            assignedStaffIds: project.assignedStaffIds.filter((id) => id !== targetId),
          });
          newLogs.push({ day: s.day, msg: `📨 ${targetName} 連續 3 次被拒請假，遞了離職信走人了！` });
          toast = { msg: `📨 ${targetName} 離職`, type: 'negative' };
        } else {
          updateOneStaff(targetId, (d) => ({
            ...d,
            fatigue: clamp(d.fatigue + 10, 0, 100),
            morale: clamp(d.morale - 8, 0, 100),
            loyalty: clamp(d.loyalty - 8, 0, 100),
            unhappyLeaveDays: newUnhappy,
          }));
          // 其他隊員 loyalty -2
          s.staff = s.staff.map((d) =>
            assignedIds.has(d.id) && d.id !== targetId
              ? { ...d, loyalty: clamp(d.loyalty - 2, 0, 100) }
              : d,
          );
          updateProject({ bonusEventChance: project.bonusEventChance + 0.05 });
          newLogs.push({ day: s.day, msg: `😡 不准 ${targetName} 請假（loyalty -8、士氣 -8）` });
          toast = { msg: '😡 不准請假', type: 'negative' };
        }
      }
      break;
    }
    case 'poaching': {
      const targetId = event.targetDogId;
      if (!targetId) {
        updateProject({});
        break;
      }
      const target = s.staff.find((d) => d.id === targetId);
      const targetName = target?.name ?? '員工';
      if (choice === 'A') {
        // 加薪留人：loyalty < 50 +$20、loyalty 50~80 +$15
        const raiseAmount = (target?.loyalty ?? 0) < 50 ? 20 : 15;
        const loyaltyGain = (target?.loyalty ?? 0) < 50 ? 15 : 10;
        updateOneStaff(targetId, (d) => ({
          ...d,
          expectedSalary: d.expectedSalary + raiseAmount,
          severance: (d.expectedSalary + raiseAmount) * 3,
          loyalty: clamp(d.loyalty + loyaltyGain, 0, 100),
        }));
        // 隊員士氣 +2
        updateAssignedStaff((d) => ({ ...d, morale: clamp(d.morale + 2, 0, 100) }));
        updateProject({});
        newLogs.push({ day: s.day, msg: `🤝 加薪 $${raiseAmount} 留下 ${targetName}` });
        toast = { msg: `🤝 加薪留人 +$${raiseAmount}/天`, type: 'positive' };
      } else {
        const loyalty = target?.loyalty ?? 50;
        const jumpRate = loyalty < 30 ? 0.25 : loyalty < 50 ? 0.10 : loyalty < 80 ? 0.05 : 0;
        if (Math.random() < jumpRate) {
          // 跳槽
          s.staff = s.staff.filter((d) => d.id !== targetId);
          // 同事 loyalty -3
          s.staff = s.staff.map((d) =>
            assignedIds.has(d.id) ? { ...d, loyalty: clamp(d.loyalty - 3, 0, 100) } : d,
          );
          // 該員所有 active 案直接判 failed
          s.clients = s.clients.map((c) => {
            if (c.status === 'active' && c.assignedStaffIds.includes(targetId)) {
              s.money = Math.max(0, s.money - c.penalty);
              s.reputation = clamp(s.reputation + c.reputationDelta.fail, 0, 100);
              s.projectsFailed += 1;
              return { ...c, status: 'failed', pendingEvent: null };
            }
            return c;
          });
          newLogs.push({ day: s.day, msg: `💔 ${targetName} 跳槽到對手公司！活案連帶判 failed！` });
          toast = { msg: `💔 ${targetName} 跳槽了`, type: 'negative' };
        } else {
          updateOneStaff(targetId, (d) => ({
            ...d,
            loyalty: clamp(d.loyalty - 10, 0, 100),
          }));
          // 同事 loyalty -3
          s.staff = s.staff.map((d) =>
            assignedIds.has(d.id) && d.id !== targetId
              ? { ...d, loyalty: clamp(d.loyalty - 3, 0, 100) }
              : d,
          );
          updateProject({});
          newLogs.push({ day: s.day, msg: `🤝 ${targetName} 拒絕了挖角，但對老闆有點不滿（loyalty -10）` });
        }
      }
      break;
    }
  }

  return { state: s, newLogs, toast };
}
