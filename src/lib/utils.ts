import type { Dog } from '@/types';

export function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function dogPower(
  dog: Dog,
  toolBoost?: { speed: number; quality: number },
): number {
  const { speed, quality, patience } = dog.stats;
  const s = speed + (toolBoost?.speed ?? 0);
  const q = quality + (toolBoost?.quality ?? 0);
  return Math.round((s + q + patience) * dog.level);
}

export function dogPowerStars(power: number): number {
  // 3 stats × 10 × level 10 = 300 max
  if (power >= 240) return 5;
  if (power >= 180) return 4;
  if (power >= 120) return 3;
  if (power >= 60) return 2;
  return 1;
}

export type DogGradeUI = 'U' | 'S' | 'A' | 'B' | 'C' | 'D';
export function dogGrade(dog: Dog): DogGradeUI {
  return dog.isCEO ? 'U' : dog.grade;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// 金額縮寫：>=1M 顯示 1.2M，>=10K 顯示 12.3K，否則千分位
export function moneyShort(value: number): string {
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 10000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function textLevel(v: number, labels: [string, string, string]): string {
  return v >= 75 ? labels[0] : v >= 45 ? labels[1] : labels[2];
}

export function companyStage(staffLen: number, projectsCompleted: number, money: number): string {
  // 簡化：依員工數 + 完成案數 + 資金
  const score = staffLen * 6 + projectsCompleted * 3 + Math.min(80, money / 200);
  if (score >= 200) return '蓬勃成長';
  if (score >= 130) return '穩定營運';
  if (score >= 80) return '勉強撐住';
  return '快撐不住';
}

export function companyHint(money: number, hasActive: boolean): string {
  if (money < 100) return '資金偏低，先接幾個 tier1 小案穩住現金流。';
  if (!hasActive) return '沒有活案就只有支出。打開接案處，挑個案接吧！';
  return '目前公司節奏還可以，記得輪換員工避免疲勞。';
}

let walkerIdCounter = 0;
export const nextWalkerId = () => ++walkerIdCounter;

let treatIdCounter = 0;
export const nextTreatId = () => ++treatIdCounter;

let dogIdCounter = 0;
export const nextDogId = () => `dog_${++dogIdCounter}_${Date.now().toString(36)}`;

let projectIdCounter = 0;
export const nextProjectId = () => `prj_${++projectIdCounter}_${Date.now().toString(36)}`;

