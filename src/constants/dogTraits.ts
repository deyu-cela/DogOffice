import type { Dog } from '@/types';

export type DogTraitId =
  | 'overtime'       // 加班王
  | 'perfectionist'  // 完美主義
  | 'haggler'        // 議價達人
  | 'ironHeart'      // 鋼鐵心
  | 'catalyst'       // 化學催化
  | 'enduring'       // 抗疲勞
  | 'social';        // 八面玲瓏

export type DogTraitDef = {
  id: DogTraitId;
  name: string;
  emoji: string;
  desc: string;
  roleFilter?: string[];
  gradeFilter?: Dog['grade'][];
};

export const DOG_TRAITS: DogTraitDef[] = [
  {
    id: 'overtime',
    name: '加班王',
    emoji: '',
    desc: '推進速度 +15%，但每日疲勞累積 +50%。',
  },
  {
    id: 'perfectionist',
    name: '完美主義',
    emoji: '',
    desc: '案件專業 +20%，但推進速度 -10%。',
  },
  {
    id: 'haggler',
    name: '議價達人',
    emoji: '',
    desc: '只要有他在隊上，案件 reward +8%。',
    roleFilter: ['業務', '行銷', 'PM'],
  },
  {
    id: 'ironHeart',
    name: '鋼鐵心',
    emoji: '',
    desc: '士氣不會跌破 30，抗住低潮。',
  },
  {
    id: 'catalyst',
    name: '化學催化',
    emoji: '⚗',
    desc: '同案內化學反應 speed/quality 倍率 +20%。',
    roleFilter: ['PM', 'CEO', '客服'],
  },
  {
    id: 'enduring',
    name: '抗疲勞',
    emoji: '',
    desc: '工作日疲勞累積 ×0.7。',
  },
  {
    id: 'social',
    name: '八面玲瓏',
    emoji: '',
    desc: '魅力 +15%，每日士氣自然 +1。',
    roleFilter: ['業務', '行銷', '客服'],
  },
];

export const DOG_TRAITS_MAP: Record<DogTraitId, DogTraitDef> = DOG_TRAITS.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<DogTraitId, DogTraitDef>,
);

// 篩選某狗可選的特性（排除已習得、套用 role/grade filter）
export function eligibleTraitsFor(dog: Dog): DogTraitDef[] {
  const learned = new Set(dog.learnedTraits ?? []);
  return DOG_TRAITS.filter((t) => {
    if (learned.has(t.id)) return false;
    if (t.roleFilter && !t.roleFilter.includes(dog.role)) return false;
    if (t.gradeFilter && !t.gradeFilter.includes(dog.grade)) return false;
    return true;
  });
}

// 從 eligible 池中抽 n 個
export function pickTraitChoices(dog: Dog, n = 3): DogTraitId[] {
  const pool = eligibleTraitsFor(dog);
  if (pool.length === 0) return [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map((t) => t.id);
}
