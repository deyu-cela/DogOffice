import type { ProjectCategory, ToolDef, ToolGrade, ToolTraitId } from '@/types';

// 案件完成基礎掉落機率
export const TOOL_DROP_CHANCE = 0.2;

// 工具庫存上限
export const TOOL_CAP = 50;

// 等級獨立骰（U 不從掉落取得，由 CEO 取得時專屬發放）
export const TOOL_GRADE_PROB: Record<ToolGrade, number> = {
  B: 0.6,
  A: 0.3,
  S: 0.1,
  U: 0,
};

// 等級對應數值區間（加性，疊在 stats 上）
export const TOOL_STAT_RANGE: Record<ToolGrade, { speed: [number, number]; quality: [number, number] }> = {
  B: { speed: [0.5, 1.0], quality: [0.5, 1.0] },
  A: { speed: [1.0, 2.0], quality: [1.0, 2.0] },
  S: { speed: [2.0, 3.5], quality: [2.0, 3.5] },
  U: { speed: [3, 5], quality: [3, 5] },
};

// 隨機特性機率（roll 1 個；U 級固定全給三件最強）
export const TOOL_TRAIT_PROB: Record<ToolGrade, number> = {
  B: 0,
  A: 0.5,
  S: 1,
  U: 1,
};

// CEO U 級工具固定特性：加速啟動 + 命中 + 高難度專家
export const CEO_U_TOOL_TRAITS: ToolTraitId[] = ['fastStart', 'precision', 'highTierExpert'];

export const CEO_U_TOOL_DEF_ID = 'ceo-katana';
export const CEO_U_TOOL_NAME = '武士刀';

// luckyCharm 加成
export const LUCKY_CHARM_BONUS = 0.05;

export const TOOL_TRAIT_DEFS: Record<ToolTraitId, { name: string; desc: string; emoji: string }> = {
  fastStart: { name: '加速啟動', desc: '速度 ×1.20', emoji: '⚡' },
  antiFatigue: { name: '抗疲勞', desc: '疲勞累積 ×0.85', emoji: '🛡' },
  chainBoost: { name: '連鎖', desc: '同案隊友 +5% 速度', emoji: '🔗' },
  highTierExpert: { name: '高難度專家', desc: 'tier 4-5 案專業 ×1.15', emoji: '🎯' },
  luckyCharm: { name: '幸運符', desc: '完成案 +5% 工具掉落', emoji: '🍀' },
  guardian: { name: '守護', desc: '疲勞對速度的懲罰減半', emoji: '✨' },
  precision: { name: '命中', desc: '專業 +1（加性）', emoji: '🎯' },
};

const TOOL_DEFS_BY_CATEGORY: Record<ProjectCategory, ToolDef[]> = {
  tech: [
    { defId: 'tech-keyboard', name: '機械鍵盤', iconName: 'toolKeyboard', category: 'tech', desc: '清脆手感，工程師最愛。' },
    { defId: 'tech-monitor', name: '雙螢幕', iconName: 'toolMonitor', category: 'tech', desc: '視野翻倍，效率翻倍。' },
    { defId: 'tech-gpu', name: 'GPU 工作站', iconName: 'toolGpu', category: 'tech', desc: '算力滿載。' },
    { defId: 'tech-board', name: '看板牆', iconName: 'toolBoard', category: 'tech', desc: '流程一目了然，PM 最愛。' },
    { defId: 'tech-gantt', name: '甘特圖', iconName: 'toolGantt', category: 'tech', desc: '時程不延宕。' },
    { defId: 'tech-plan', name: '時程表', iconName: 'toolPlan', category: 'tech', desc: '進度精準掌控。' },
  ],
  design: [
    { defId: 'design-tablet', name: '繪圖板', iconName: 'toolTablet', category: 'design', desc: '筆觸細膩。' },
    { defId: 'design-color', name: '校色螢幕', iconName: 'toolColor', category: 'design', desc: '色準專業。' },
    { defId: 'design-brush', name: '設計筆刷組', iconName: 'toolBrush', category: 'design', desc: '靈感無限。' },
  ],
  marketing: [
    { defId: 'mkt-bible', name: '文案聖經', iconName: 'toolBible', category: 'marketing', desc: '一句封神。' },
    { defId: 'mkt-dashboard', name: '數據儀表板', iconName: 'toolDashboard', category: 'marketing', desc: '掌握流量。' },
    { defId: 'mkt-light', name: '直播打光燈', iconName: 'toolLight', category: 'marketing', desc: '上鏡狗都美。' },
  ],
  service: [
    { defId: 'svc-manual', name: '客訴手冊', iconName: 'toolManual', category: 'service', desc: '化解危機。' },
    { defId: 'svc-headset', name: '翻譯耳機', iconName: 'toolHeadset', category: 'service', desc: '溝通無阻。' },
    { defId: 'svc-mirror', name: '微笑訓練鏡', iconName: 'toolMirror', category: 'service', desc: '專業微笑。' },
  ],
};

// CEO 專屬 U 級工具圖示反查（不屬於任何產業 def 表）
const CEO_TOOL_ICON_BY_DEF_ID: Record<string, ToolDef['iconName']> = {
  [CEO_U_TOOL_DEF_ID]: 'toolKatana',
};

export const TOOL_DEFS: ToolDef[] = Object.values(TOOL_DEFS_BY_CATEGORY).flat();

export function getToolDefsForCategory(category: ProjectCategory): ToolDef[] {
  return TOOL_DEFS_BY_CATEGORY[category] ?? [];
}

// 舊存檔遷移：defId → iconName 反查
const TOOL_ICON_BY_DEF_ID: Record<string, ToolDef['iconName']> = TOOL_DEFS.reduce(
  (acc, def) => {
    acc[def.defId] = def.iconName;
    return acc;
  },
  {} as Record<string, ToolDef['iconName']>,
);

export function getToolIconByDefId(defId: string): ToolDef['iconName'] {
  return TOOL_ICON_BY_DEF_ID[defId] ?? CEO_TOOL_ICON_BY_DEF_ID[defId] ?? 'toolKeyboard';
}
