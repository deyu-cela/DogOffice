import type { DogRole } from '@/types';

// 9 種職業（從 17 砍半）+ CEO 彩蛋
// 每對口類別（tech/design/marketing/service）各 2 人 + 1 隊長 PM + CEO
// 砍掉：HR、主管、行政、數據分析、翻譯、營運、財務、開發
export const DOG_ROLES: DogRole[] = [
  {
    role: '工程師',
    breed: '邊境牧羊犬',
    emoji: '',
    names: ['衝衝', '可可', '阿碼', 'Byte'],
    traits: ['工作狂', '抗壓王'],
    flavor: '做事超快，但偶爾給同事壓力。',
    passive: 'tech 案速度主力，quality 也不錯。',
    motto: '「先修 bug，其他等等再說。」',
    baseStats: { speed: 9, quality: 7, patience: 6 },
    category: 'tech',
  },
  {
    role: 'QA',
    breed: '雪納瑞',
    emoji: '',
    names: ['Bug', '查查', '嗅嗅', '抓抓'],
    traits: ['極度龜毛', '眼尖'],
    flavor: '能幫團隊抓到很多問題，但也常讓工程師崩潰。',
    passive: '專業之王（quality 10），tech 案專業保證。',
    motto: '「這裡有個 bug，那裡也有。」',
    baseStats: { speed: 4, quality: 10, patience: 8 },
    category: 'design',
  },
  {
    role: '美術',
    breed: '黃金獵犬',
    emoji: '',
    names: ['泡芙', '彩筆', '米露', '雪白'],
    traits: ['審美很好', '有點挑'],
    flavor: '讓公司視覺質感大升級，作品更討喜。',
    passive: 'design 案專業主力，作品非常吸睛。',
    motto: '「再調一下配色，整體就會活起來。」',
    baseStats: { speed: 5, quality: 9, patience: 5 },
    category: 'design',
  },
  {
    role: '企劃',
    breed: '柴犬',
    emoji: '',
    names: ['暴風', '跳跳', '阿極', '二哈'],
    traits: ['點子很多', '容易暴走'],
    flavor: '高爆發型人才，好時很好，亂時很亂。',
    passive: 'design 案速度型，創意豐富但耐心不足。',
    motto: '「這裡我有 3 個超酷的新提案。」',
    baseStats: { speed: 7, quality: 6, patience: 4 },
    category: 'service',
  },
  {
    role: '業務',
    breed: '米格魯',
    emoji: '',
    names: ['短腿', '啵啵', '元氣', 'Rich'],
    traits: ['氣氛擔當', '超會推銷'],
    flavor: '帶來熱鬧與訂單，偶爾有點吵。',
    passive: 'marketing 案速度尚可，但耐心偏低（容易疲勞）。',
    motto: '「只要見到客戶，就有機會成交！」',
    baseStats: { speed: 6, quality: 4, patience: 4 },
    category: 'marketing',
  },
  {
    role: '行銷',
    breed: '柴犬',
    emoji: '',
    names: ['焦糖', '多多', '芋圓', '吸睛'],
    traits: ['很會包裝', '超有梗'],
    flavor: '總能把公司包裝得更可愛、更有話題。',
    passive: 'marketing 案核心戰力，全能型。',
    motto: '「這個點子發出去一定會有人轉發。」',
    baseStats: { speed: 6, quality: 5, patience: 5 },
    category: 'marketing',
  },
  {
    role: '客服',
    breed: '貴賓犬',
    emoji: '',
    names: ['奶油', '小麥', '阿福', '甜甜'],
    traits: ['超有耐心', '超會安撫'],
    flavor: '讓客戶比較滿意，也比較能穩住團隊節奏。',
    passive: '耐心之王（patience 9），疲勞累積最慢。',
    motto: '「別擔心，我先幫你把情緒接住。」',
    baseStats: { speed: 5, quality: 6, patience: 9 },
    category: 'service',
  },
  {
    role: 'PM',
    breed: '米格魯',
    emoji: '',
    names: ['排排', '規規', '敏捷', 'Sprint'],
    traits: ['協調高手', '愛開會'],
    flavor: '讓專案不會迷路，但會議可能太多。',
    passive: '全能型隊長，耐心高、產能均衡。',
    motto: '「先拉個時程表，我們對齊一下。」',
    baseStats: { speed: 6, quality: 6, patience: 8 },
    category: 'tech',
  },
];

export const CEO_DOG: DogRole = {
  role: 'CEO',
  breed: '松獅犬',
  emoji: '',
  names: ['社長', 'Boss', '大王', 'Elon'],
  traits: ['天生領袖', '自帶光環', '超級稀有'],
  flavor: '傳說中的狗界 CEO，所到之處收入暴漲。',
  passive: 'CEO 在場時，全公司 tierBudget ×1.5、案件超賺！',
  motto: '「我不是來工作的，我是來改變世界的。」',
  baseStats: { speed: 8, quality: 9, patience: 9 },
  category: 'all',
  isCEO: true,
};

export const CEO_CHANCE = 0.02;

const base = import.meta.env.BASE_URL;

export const ROLE_IMAGE_MAP: Record<string, string> = {
  工程師: `${base}assets/dog-profiles/engineering.png`,
  QA: `${base}assets/dog-profiles/qa.png`,
  美術: `${base}assets/dog-profiles/design.png`,
  企劃: `${base}assets/dog-profiles/planning.png`,
  業務: `${base}assets/dog-profiles/business.png`,
  行銷: `${base}assets/dog-profiles/marketing.png`,
  客服: `${base}assets/dog-profiles/customer-service.png`,
  PM: `${base}assets/dog-profiles/pm.png`,
  CEO: `${base}assets/dog-profiles/ceo.png`,
};

export const ROSTER_IMAGE_MAP: Partial<Record<string, string>> = {
  'u-2': `${base}assets/dog-profiles/jensen-doberman.png`,
};

export const ROLE_WAITING_IMAGE_MAP: Partial<Record<string, string>> = {
  工程師: `${base}assets/dog-sprites/engineering-waiting.png`,
  QA: `${base}assets/dog-sprites/qa-waiting.png`,
  美術: `${base}assets/dog-sprites/design-waiting.png`,
  企劃: `${base}assets/dog-sprites/planning-waiting.png`,
  業務: `${base}assets/dog-sprites/business-waiting.png`,
  行銷: `${base}assets/dog-sprites/marketing-waiting.png`,
  客服: `${base}assets/dog-sprites/customer-service-waiting.png`,
  PM: `${base}assets/dog-sprites/pm-waiting.png`,
  CEO: `${base}assets/dog-sprites/ceo-waiting.png`,
};

export const ROSTER_WAITING_IMAGE_MAP: Partial<Record<string, string>> = {
  'u-2': `${base}assets/dog-sprites/jensen-doberman-waiting.png`,
};

export const ROLE_WAITING_SPRITE_MAP: Partial<Record<string, string>> = {
  工程師: `${base}assets/dog-sprites/engineering-waiting-idle-sheet.png`,
  QA: `${base}assets/dog-sprites/qa-waiting-idle-sheet.png`,
  美術: `${base}assets/dog-sprites/design-waiting-idle-sheet.png`,
  企劃: `${base}assets/dog-sprites/planning-waiting-idle-sheet.png`,
  業務: `${base}assets/dog-sprites/business-waiting-idle-sheet.png`,
  行銷: `${base}assets/dog-sprites/marketing-waiting-idle-sheet.png`,
  客服: `${base}assets/dog-sprites/customer-service-waiting-idle-sheet.png`,
  PM: `${base}assets/dog-sprites/pm-waiting-idle-sheet.png`,
  CEO: `${base}assets/dog-sprites/ceo-waiting-idle-sheet.png`,
};

export const ROSTER_WAITING_SPRITE_MAP: Partial<Record<string, string>> = {
  'u-2': `${base}assets/dog-sprites/jensen-doberman-waiting-idle-sheet.png`,
};

export const ROLE_WAITING_SPRITE_FRAMES: Partial<Record<string, number>> = {};

export function getDogProfileImage(role: string, rosterId?: string): string {
  return (rosterId ? ROSTER_IMAGE_MAP[rosterId] : undefined) ?? ROLE_IMAGE_MAP[role] ?? '';
}

export function getDogWaitingImage(role: string, rosterId?: string): string {
  return (rosterId ? ROSTER_WAITING_IMAGE_MAP[rosterId] : undefined) ?? ROLE_WAITING_IMAGE_MAP[role] ?? '';
}

export function getDogWaitingSprite(role: string, rosterId?: string): string {
  return (rosterId ? ROSTER_WAITING_SPRITE_MAP[rosterId] : undefined) ?? ROLE_WAITING_SPRITE_MAP[role] ?? '';
}
