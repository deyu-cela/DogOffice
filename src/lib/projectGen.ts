import type {
  ClientTier,
  Dog,
  GameState,
  Project,
  ProjectCategory,
} from '@/types';
import { clamp, nextProjectId, rand } from './utils';

// ---- 客戶名稱（可愛梗）+ 案件標題庫 ----
const CLIENT_NAMES = [
  '貓貓重工', '金毛家具行', '柴柴拉麵', '布丁烘焙坊', '雪納瑞精品',
  '巧克力工坊', '汪汪健身房', '哈士奇旅行社', '柯基書店', '黃金影業',
  '多多便利商店', '邊牧雲端', '臘腸電子', '貴賓婚紗', '法鬥媒體',
  '吉娃娃藥局', '阿拉斯加冰品', '比熊洗衣', '雪橇音樂', '巴哥茶飲',
];

const TITLES_BY_CATEGORY: Record<ProjectCategory, string[]> = {
  tech: [
    '會員系統重構', '購物車優化', 'API 性能調校', 'CI/CD 建置',
    '資料庫遷移', '行動 APP 開發', '後台管理系統', 'AI 推薦引擎',
  ],
  design: [
    '品牌 Logo 設計', '產品包裝視覺', 'UI/UX 改版', '官網主視覺',
    '形象廣告插畫', '吉祥物設計', '名片印刷物', '展場視覺',
  ],
  marketing: [
    '社群行銷活動', '品牌曝光企劃', 'KOL 合作專案', '節慶廣告投放',
    '產品上市發表', '會員促銷活動', 'Podcast 業配', '導購漏斗優化',
  ],
  service: [
    '客服系統建置', '售後流程優化', '會員溝通策略', '客訴處理 SOP',
    '電話客服訓練', '線上問答整合', '評價回覆機制', 'VIP 客戶關懷',
  ],
};

const CATEGORIES: ProjectCategory[] = ['tech', 'design', 'marketing', 'service'];

// ---- Tier 對應數值表（plan §2.3.1）----
type TierStats = {
  rewardMin: number;
  rewardMax: number;
  workMin: number;
  workMax: number;
  deadlineDays: number;
  expectedQuality: number;
};

const TIER_TABLE: Record<ClientTier, TierStats> = {
  1: { rewardMin: 80, rewardMax: 130, workMin: 12, workMax: 18, deadlineDays: 4, expectedQuality: 2 },
  2: { rewardMin: 200, rewardMax: 300, workMin: 50, workMax: 70, deadlineDays: 5, expectedQuality: 3 },
  3: { rewardMin: 450, rewardMax: 650, workMin: 90, workMax: 120, deadlineDays: 6, expectedQuality: 5 },
  4: { rewardMin: 950, rewardMax: 1300, workMin: 160, workMax: 200, deadlineDays: 7, expectedQuality: 6 },
  5: { rewardMin: 1900, rewardMax: 2600, workMin: 250, workMax: 320, deadlineDays: 8, expectedQuality: 8 },
};

// 辦公室加成（plan §3.5）
const OFFICE_TIER_BONUS = [0, 5, 12, 22, 35];

// 辦公室解鎖最高 tier（plan §3.5）
const OFFICE_TIER_CAP: ClientTier[] = [3, 3, 4, 4, 5];

// ---- tierBudget 計算（員工總 quality + officeBonus） ----
export function computeTierBudget(state: Pick<GameState, 'staff' | 'officeLevel'>): number {
  const totalQuality = state.staff.reduce((n, d) => n + d.stats.quality, 0);
  const officeBonus = OFFICE_TIER_BONUS[state.officeLevel] ?? 0;
  const hasCEO = state.staff.some((d) => d.isCEO);
  // 員工不足 4 人時線性壓縮，早期讓 tier 1 主場
  const staffFactor = state.staff.length >= 4 ? 1 : state.staff.length / 4;
  const baseBudget = (totalQuality + officeBonus) * staffFactor;
  return Math.round(hasCEO ? baseBudget * 1.5 : baseBudget);
}

// ---- pickTier：依 tierBudget 用 weighted random 挑 tier ----
function weightedTierPick(tierBudget: number, tierCap: ClientTier, rerollPenalty: boolean): ClientTier {
  // avgTier = clamp(1 + tierBudget / 25, 1, 5)
  const avgTier = clamp(1 + tierBudget / 25, 1, 5);
  // 重 roll 後當天 tier 上限 -1（防無腦抽）
  const effectiveCap = (rerollPenalty ? Math.max(1, tierCap - 1) : tierCap) as ClientTier;

  // 每個 tier 給權重：圍繞 avgTier，距離越遠權重越低
  const weights: Record<ClientTier, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (let t = 1; t <= 5; t++) {
    if (t > effectiveCap) continue;
    const dist = Math.abs(t - avgTier);
    weights[t as ClientTier] = Math.max(0.05, Math.exp(-dist * 1.1));
  }

  const totalWeight = (Object.values(weights) as number[]).reduce((a, b) => a + b, 0);
  if (totalWeight <= 0) return 1;
  let r = Math.random() * totalWeight;
  for (let t = 1; t <= 5; t++) {
    const w = weights[t as ClientTier];
    if (w === 0) continue;
    if (r < w) return t as ClientTier;
    r -= w;
  }
  return 1;
}

// ---- generateProject ----
function pickInRange(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

export function generateProject(
  tierBudget: number,
  currentDay: number,
  officeLevel: number,
  rerollPenalty: boolean,
  forcedTier?: ClientTier,
  forcedCategory?: ProjectCategory,
): Project {
  const tierCap = OFFICE_TIER_CAP[officeLevel] ?? 3;
  const tier = forcedTier ?? weightedTierPick(tierBudget, tierCap, rerollPenalty);
  const category = forcedCategory ?? rand(CATEGORIES);
  const stats = TIER_TABLE[tier];

  const reward = pickInRange(stats.rewardMin, stats.rewardMax);
  const workRequired = pickInRange(stats.workMin, stats.workMax);

  return {
    id: nextProjectId(),
    clientName: rand(CLIENT_NAMES),
    clientTier: tier,
    category,
    title: rand(TITLES_BY_CATEGORY[category]),
    difficulty: tier,
    workRequired,
    workDone: 0,
    qualitySum: 0,
    expectedQuality: stats.expectedQuality,
    reward,
    penalty: Math.round(reward * 0.4),
    defaultDeadlineDays: stats.deadlineDays,
    // offered 狀態 deadlineDay = -1 表示尚未啟動，接案時才設為 state.day + defaultDeadlineDays
    deadlineDay: -1,
    graceDays: 2,
    assignedStaffIds: [],
    status: 'offered',
    createdDay: currentDay,
    events: [],
    pendingEvent: null,
    rewardMul: 1,
    qualityMul: 1,
    eventCount: 0,
    bonusEventChance: 0,
  };
}

// ---- 補位 inbox 到 5 案 ----
const INBOX_SIZE = 5;

export function fillInbox(
  clients: Project[],
  tierBudget: number,
  currentDay: number,
  officeLevel: number,
  rerollPenalty: boolean,
  openIndustries: ProjectCategory[] = [],
): Project[] {
  // 沒有 open team → 不留任何 offered，全清掉；active 案不動繼續做
  if (openIndustries.length === 0) {
    return clients.filter((c) => c.status !== 'offered');
  }
  const allowed = new Set(openIndustries);
  // 1. 把已關閉產業的 offered 清掉
  const culled = clients.filter((c) => c.status !== 'offered' || allowed.has(c.category));
  const active = culled.filter((c) => c.status === 'active');
  const offered = culled.filter((c) => c.status === 'offered');
  const liveSlotsLeft = Math.max(0, INBOX_SIZE - active.length);
  // 2. 每種產業只保留 1 張 offered（多張時保留最早建立的）
  const keptByIndustry = new Map<ProjectCategory, Project>();
  for (const p of offered) {
    const cur = keptByIndustry.get(p.category);
    if (!cur || p.createdDay < cur.createdDay) {
      keptByIndustry.set(p.category, p);
    }
  }
  const keptIds = new Set(Array.from(keptByIndustry.values()).map((p) => p.id));
  const cappedClients = culled.filter((c) => c.status !== 'offered' || keptIds.has(c.id));
  // 3. 為缺席的 open 產業各補 1 張（受 liveSlotsLeft 限制）
  //    缺席 = 該產業沒有 offered 也沒有 active（active 也算佔位）
  const occupiedInds = new Set<ProjectCategory>([
    ...keptByIndustry.keys(),
    ...active.map((p) => p.category),
  ]);
  const missingIndustries = openIndustries.filter((ind) => !occupiedInds.has(ind));
  const slotsAvailable = Math.max(0, liveSlotsLeft - keptByIndustry.size);
  const toGenerate = Math.min(missingIndustries.length, slotsAvailable);
  const fresh: Project[] = [];
  for (let i = 0; i < toGenerate; i++) {
    fresh.push(generateProject(tierBudget, currentDay, officeLevel, rerollPenalty, undefined, missingIndustries[i]));
  }
  return [...cappedClients, ...fresh];
}

// ---- 重 roll 收件匣費用 ----
export function rerollCost(tierBudget: number): number {
  return Math.round(50 + 5 * tierBudget * 0.5);
}

// ---- 重 roll inbox：每個 open 產業重生成 1 張 ----
export function rerollInbox(
  clients: Project[],
  tierBudget: number,
  currentDay: number,
  officeLevel: number,
  openIndustries: ProjectCategory[] = [],
): Project[] {
  const others = clients.filter((c) => c.status !== 'offered');
  if (openIndustries.length === 0) return others;
  const activeList = others.filter((c) => c.status === 'active');
  const activeInds = new Set(activeList.map((c) => c.category));
  const offeredSlots = Math.max(0, INBOX_SIZE - activeList.length);
  // 已有 active 的產業不再補 offered（同產業只能 1 張）
  const eligibleInds = openIndustries.filter((ind) => !activeInds.has(ind));
  const toGenerate = Math.min(eligibleInds.length, offeredSlots);
  const fresh: Project[] = [];
  for (let i = 0; i < toGenerate; i++) {
    fresh.push(generateProject(tierBudget, currentDay, officeLevel, true, undefined, eligibleInds[i]));
  }
  return [...fresh, ...others];
}

// ---- 移除 10 天到期未接 offered ----
export const OFFER_TTL_DAYS = 10;
export function pruneExpiredOffered(clients: Project[], currentDay: number): {
  next: Project[];
  expiredCount: number;
} {
  const next: Project[] = [];
  let expiredCount = 0;
  for (const p of clients) {
    if (p.status === 'offered' && currentDay - p.createdDay >= OFFER_TTL_DAYS) {
      expiredCount += 1;
      continue; // 移除
    }
    next.push(p);
  }
  return { next, expiredCount };
}

// ---- 限制保留結算紀錄到 5 筆 ----
export const RECENT_SETTLED_LIMIT = 5;
export function trimSettled(clients: Project[]): Project[] {
  const live = clients.filter((c) => c.status === 'offered' || c.status === 'active');
  const settled = clients
    .filter((c) => c.status === 'done' || c.status === 'failed' || c.status === 'late')
    .slice(-RECENT_SETTLED_LIMIT);
  return [...live, ...settled];
}

// ---- 員工是否符合對口加成 ----
export function isRoleMatched(dog: Dog, category: ProjectCategory): boolean {
  // 全能（PM / CEO）任何案都對口
  // 由 dogRoles 決定，這裡用 role string 簡單判斷
  const roleMatch: Record<string, ProjectCategory[]> = {
    工程師: ['tech'],
    QA: ['tech'],
    美術: ['design'],
    企劃: ['design', 'marketing'],
    業務: ['marketing', 'service'],
    行銷: ['marketing'],
    客服: ['service'],
    PM: ['tech', 'design', 'marketing', 'service'],
    CEO: ['tech', 'design', 'marketing', 'service'],
  };
  return roleMatch[dog.role]?.includes(category) ?? false;
}

export { TIER_TABLE, OFFICE_TIER_BONUS, OFFICE_TIER_CAP, INBOX_SIZE };
