import type { Stats } from '@/types';
import { rand } from '@/lib/utils';

// === 地區 ===
export const REGIONS = ['南部', '北部'] as const;
export type Region = (typeof REGIONS)[number];

// === 人格 tag（避開既有 learnedTraits 的「加班王」名稱）===
export const PERSONALITY_TAGS = ['網紅', '拚命郎', '運動咖'] as const;
export type PersonalityTag = (typeof PERSONALITY_TAGS)[number];

// === Synergy key 統一型別 ===
export type SynergyKey = Region | PersonalityTag;

export const ALL_SYNERGY_KEYS: SynergyKey[] = [
  ...REGIONS,
  ...PERSONALITY_TAGS,
];

// === 門檻 ===
export const SYNERGY_TIER1 = 2;
export const SYNERGY_TIER2 = 4;

// === 固定 buff 表（依台灣南北人特性 + tag 個性）===
type SynergyBuffDef = {
  tier1: Partial<Stats>;
  tier2: Partial<Stats>;
  desc: { tier1: string; tier2: string };
  flavor: string;
};

export const SYNERGY_BUFFS: Record<SynergyKey, SynergyBuffDef> = {
  南部: {
    tier1: { charisma: 1 },
    tier2: { charisma: 2, teamwork: 1 },
    desc: {
      tier1: '魅力 +1',
      tier2: '魅力 +2、協作 +1',
    },
    flavor: '熱情好客、人情味重',
  },
  北部: {
    tier1: { speed: 1 },
    tier2: { speed: 2, quality: 1 },
    desc: {
      tier1: '速度 +1',
      tier2: '速度 +2、專業 +1',
    },
    flavor: '講效率、節奏快',
  },
  網紅: {
    tier1: { charisma: 1 },
    tier2: { charisma: 2, quality: 1 },
    desc: {
      tier1: '魅力 +1',
      tier2: '魅力 +2、專業 +1',
    },
    flavor: '自帶流量、產出有顏值',
  },
  拚命郎: {
    tier1: { quality: 1 },
    tier2: { quality: 2, speed: 1 },
    desc: {
      tier1: '專業 +1',
      tier2: '專業 +2、速度 +1',
    },
    flavor: '精雕細琢、多工輸出',
  },
  運動咖: {
    tier1: { teamwork: 1 },
    tier2: { teamwork: 2, speed: 1 },
    desc: {
      tier1: '協作 +1',
      tier2: '協作 +2、速度 +1',
    },
    flavor: '團隊運動、活力四射',
  },
};

// === 視覺分組（UI 可用）===
// 接受任意字串，方便從 traits（string[]）直接判斷
export function isRegion(key: string): key is Region {
  return (REGIONS as readonly string[]).includes(key);
}

export function isPersonality(key: string): key is PersonalityTag {
  return (PERSONALITY_TAGS as readonly string[]).includes(key);
}

// === 隨機抽取 ===
export function pickRegion(): Region {
  return rand(REGIONS as unknown as Region[]);
}

// 一隻狗的狗格 tag 數量分佈：30% 沒有、50% 一個、20% 兩個（從 3 個池抽，不重複）
export function pickPersonalities(): PersonalityTag[] {
  const r = Math.random();
  let count = 0;
  if (r < 0.2) count = 2;
  else if (r < 0.7) count = 1;
  // 其餘 0 個
  if (count === 0) return [];
  const pool: PersonalityTag[] = [...PERSONALITY_TAGS];
  // 洗牌取前 N 個
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
