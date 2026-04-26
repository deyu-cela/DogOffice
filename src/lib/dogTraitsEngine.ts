import type { Dog } from '@/types';
import type { DogTraitId } from '@/constants/dogTraits';

function has(dog: Dog, id: DogTraitId): boolean {
  return (dog.learnedTraits ?? []).includes(id);
}

export function getDogSpeedMul(dog: Dog): number {
  let mul = 1;
  if (has(dog, 'overtime')) mul *= 1.15;
  if (has(dog, 'perfectionist')) mul *= 0.9;
  return mul;
}

export function getDogQualityMul(dog: Dog): number {
  let mul = 1;
  if (has(dog, 'perfectionist')) mul *= 1.2;
  return mul;
}

export function getDogCharismaMul(dog: Dog): number {
  let mul = 1;
  if (has(dog, 'social')) mul *= 1.15;
  return mul;
}

// 每日 fatigue 累積倍率（10 點為基準）
export function getDogFatigueAccumMul(dog: Dog): number {
  let mul = 1;
  if (has(dog, 'overtime')) mul *= 1.5;
  if (has(dog, 'enduring')) mul *= 0.7;
  return mul;
}

// 個人士氣下限（鋼鐵心 = 30，否則 0）
export function getDogMoraleFloor(dog: Dog): number {
  return has(dog, 'ironHeart') ? 30 : 0;
}

// 每日自然士氣調整（八面玲瓏 +1）
export function getDogDailyMoraleDelta(dog: Dog): number {
  let delta = 0;
  if (has(dog, 'social')) delta += 1;
  return delta;
}

// 案件層級：化學催化（PM/CEO/客服 在隊上 → chem speed/quality mul ×1.2）
export function getProjectChemBoost(assignedDogs: Dog[]): number {
  return assignedDogs.some((d) => has(d, 'catalyst')) ? 1.2 : 1.0;
}

// 案件層級：議價達人結案 reward 額外 ×1.08
export function getProjectRewardMul(assignedDogs: Dog[]): number {
  return assignedDogs.some((d) => has(d, 'haggler')) ? 1.08 : 1.0;
}

// 案件層級：老師讓「同案其他隊員」exp ×1.5（隊上有 mentor 即生效，給其他人）
export function getProjectExpMulForDog(dog: Dog, assignedDogs: Dog[]): number {
  // 隊伍中有別人是 mentor（不是自己）
  const hasOtherMentor = assignedDogs.some((d) => d.id !== dog.id && has(d, 'mentor'));
  return hasOtherMentor ? 1.5 : 1.0;
}
