import type { Dog, ProjectCategory, Tool, ToolGrade, ToolTraitId } from '@/types';
import {
  LUCKY_CHARM_BONUS,
  TOOL_GRADE_PROB,
  TOOL_STAT_RANGE,
  TOOL_TRAIT_PROB,
  getToolDefsForCategory,
} from '@/constants/tools';
import { dogPower, rand } from './utils';

let toolIdCounter = 0;
export function nextToolId(): string {
  return `tool_${++toolIdCounter}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

const GRADE_RANK: Record<ToolGrade, number> = { S: 3, A: 2, B: 1 };

// 找出可被新工具擠掉的舊工具 instanceId；找不到回 null
// 規則：
//  1. 優先：同 category 且 grade 嚴格低於 newTool 且未裝備
//  2. 退一步：任何 category 且 grade 嚴格低於 newTool 且未裝備
//  在候選集中：先按 grade 升序（先擠最低階），再按 obtainedDay 升序（同階則擠最舊）
export function pickToolToReplace(
  tools: Tool[],
  newTool: Tool,
  staff: Dog[],
): string | null {
  const equipped = new Set<string>();
  for (const d of staff) if (d.equippedToolId) equipped.add(d.equippedToolId);
  const newRank = GRADE_RANK[newTool.grade];

  const candidates = tools.filter(
    (t) => GRADE_RANK[t.grade] < newRank && !equipped.has(t.instanceId),
  );
  if (candidates.length === 0) return null;

  const sameCat = candidates.filter((t) => t.category === newTool.category);
  const pool = sameCat.length > 0 ? sameCat : candidates;
  pool.sort(
    (a, b) =>
      GRADE_RANK[a.grade] - GRADE_RANK[b.grade] ||
      a.obtainedDay - b.obtainedDay,
  );
  return pool[0].instanceId;
}

export function rollGrade(): ToolGrade {
  const r = Math.random();
  // 累加：B(0.6) → A(0.3) → S(0.1)
  if (r < TOOL_GRADE_PROB.B) return 'B';
  if (r < TOOL_GRADE_PROB.B + TOOL_GRADE_PROB.A) return 'A';
  return 'S';
}

const ALL_TRAIT_IDS: ToolTraitId[] = [
  'fastStart',
  'antiFatigue',
  'chainBoost',
  'highTierExpert',
  'expGain',
  'luckyCharm',
  'guardian',
  'precision',
];

export function rollTraits(grade: ToolGrade): ToolTraitId[] {
  const prob = TOOL_TRAIT_PROB[grade];
  if (prob <= 0) return [];
  if (Math.random() >= prob) return [];
  return [rand(ALL_TRAIT_IDS)];
}

function rollInRange(range: [number, number]): number {
  const [lo, hi] = range;
  const v = lo + Math.random() * (hi - lo);
  // 留一位小數，避免顯示過長
  return Math.round(v * 10) / 10;
}

export function rollTool(category: ProjectCategory, day: number): Tool | null {
  const defs = getToolDefsForCategory(category);
  if (defs.length === 0) return null;
  const def = rand(defs);
  const grade = rollGrade();
  const range = TOOL_STAT_RANGE[grade];
  return {
    instanceId: nextToolId(),
    defId: def.defId,
    name: def.name,
    iconName: def.iconName,
    category: def.category,
    grade,
    speedBoost: rollInRange(range.speed),
    qualityBoost: rollInRange(range.quality),
    traits: rollTraits(grade),
    obtainedDay: day,
  };
}

// 根據 staff 的 equippedToolId 與 tools 列表，建立 dogId → Tool 的 map
export function buildToolMap(staff: Dog[], tools: Tool[]): Map<string, Tool> {
  const byInstanceId = new Map<string, Tool>();
  for (const t of tools) byInstanceId.set(t.instanceId, t);
  const out = new Map<string, Tool>();
  for (const d of staff) {
    if (!d.equippedToolId) continue;
    const tool = byInstanceId.get(d.equippedToolId);
    if (!tool) continue;
    if (tool.category !== getDogToolCategory(d)) continue;
    out.set(d.id, tool);
  }
  return out;
}

// 取得員工可裝備的 category；PM/CEO 視為 null（不可裝）
// 用 dog.role 反查避免循環依賴 dogPrimaryIndustry（gameStore 內已有）
const ROLE_TOOL_CATEGORY: Record<string, ProjectCategory | null> = {
  工程師: 'tech',
  QA: 'tech',
  美術: 'design',
  企劃: 'design',
  業務: 'marketing',
  行銷: 'marketing',
  客服: 'service',
  PM: null,
  CEO: null,
};

export function getDogToolCategory(dog: Dog): ProjectCategory | null {
  return ROLE_TOOL_CATEGORY[dog.role] ?? null;
}

// === 推進階段使用 ===

export function getToolSpeedBoost(toolMap: Map<string, Tool>, dogId: string): number {
  return toolMap.get(dogId)?.speedBoost ?? 0;
}

export function getToolQualityBoost(toolMap: Map<string, Tool>, dogId: string): number {
  const tool = toolMap.get(dogId);
  if (!tool) return 0;
  let bonus = tool.qualityBoost;
  if (tool.traits.includes('precision')) bonus += 1;
  return bonus;
}

// 直接針對單一 dog 取得已裝備工具（不靠 toolMap，給 UI 用）
export function getDogEquippedTool(dog: Dog, tools: Tool[]): Tool | null {
  if (!dog.equippedToolId) return null;
  const cat = getDogToolCategory(dog);
  if (!cat) return null;
  const t = tools.find((x) => x.instanceId === dog.equippedToolId);
  if (!t || t.category !== cat) return null;
  return t;
}

export type DogStatBoost = {
  speed: number;
  quality: number;
};

// 取得單一 dog 因裝備工具獲得的 stats 加成（speed / quality；不含團隊 chain 等乘數）
export function getDogToolStatBoost(dog: Dog, tools: Tool[]): DogStatBoost {
  const tool = getDogEquippedTool(dog, tools);
  if (!tool) return { speed: 0, quality: 0 };
  let quality = tool.qualityBoost;
  if (tool.traits.includes('precision')) quality += 1;
  return { speed: tool.speedBoost, quality };
}

// 含已裝備工具加成的工作能力
export function dogPowerWithTools(dog: Dog, tools: Tool[]): number {
  return dogPower(dog, getDogToolStatBoost(dog, tools));
}

// 個別員工的 trait 速度乘數
export function getToolSelfSpeedMul(toolMap: Map<string, Tool>, dogId: string): number {
  const tool = toolMap.get(dogId);
  if (!tool) return 1;
  let mul = 1;
  if (tool.traits.includes('fastStart')) mul *= 1.2;
  return mul;
}

// 個別員工的 trait 品質乘數（含高難度專家）
export function getToolSelfQualityMul(
  toolMap: Map<string, Tool>,
  dogId: string,
  clientTier: number,
): number {
  const tool = toolMap.get(dogId);
  if (!tool) return 1;
  let mul = 1;
  if (tool.traits.includes('highTierExpert') && clientTier >= 4) mul *= 1.15;
  return mul;
}

// 隊伍級別的 chainBoost：每位戴此 trait 的隊友讓全隊 +5%
export function getTeamChainBoost(toolMap: Map<string, Tool>, dogIds: string[]): number {
  let n = 0;
  for (const id of dogIds) {
    const t = toolMap.get(id);
    if (t?.traits.includes('chainBoost')) n++;
  }
  return 1 + n * 0.05;
}

// guardian：fatigue 對 speed 的懲罰減半（fatigueMul → 1 - (1-fatigueMul)/2）
export function getToolGuardedFatigueMul(
  toolMap: Map<string, Tool>,
  dogId: string,
  rawFatigueMul: number,
): number {
  const tool = toolMap.get(dogId);
  if (!tool || !tool.traits.includes('guardian')) return rawFatigueMul;
  return 1 - (1 - rawFatigueMul) / 2;
}

// antiFatigue：fatigue 累積 ×0.85
export function getToolFatigueAccumMul(toolMap: Map<string, Tool>, dogId: string): number {
  const tool = toolMap.get(dogId);
  if (!tool || !tool.traits.includes('antiFatigue')) return 1;
  return 0.85;
}

// expGain：經驗 ×1.20
export function getToolExpMul(toolMap: Map<string, Tool>, dogId: string): number {
  const tool = toolMap.get(dogId);
  if (!tool || !tool.traits.includes('expGain')) return 1;
  return 1.2;
}

// luckyCharm：每位戴此 trait 的指派員工讓掉落機率 +5%
export function getTeamLuckyBonus(toolMap: Map<string, Tool>, dogIds: string[]): number {
  let bonus = 0;
  for (const id of dogIds) {
    const t = toolMap.get(id);
    if (t?.traits.includes('luckyCharm')) bonus += LUCKY_CHARM_BONUS;
  }
  return bonus;
}
