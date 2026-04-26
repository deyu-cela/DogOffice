export function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function textLevel(v: number, labels: [string, string, string]): string {
  return v >= 75 ? labels[0] : v >= 45 ? labels[1] : labels[2];
}

export function companyStage(reputation: number, avgMorale: number, staffLen: number, projectsCompleted: number): string {
  // 接案制版本：依信譽 + 員工平均士氣 + 員工數 + 完成案數
  const score = reputation + avgMorale + staffLen * 4 + projectsCompleted * 2;
  if (score >= 200) return '蓬勃成長';
  if (score >= 130) return '穩定營運';
  if (score >= 80) return '勉強撐住';
  return '快撐不住';
}

export function companyHint(money: number, reputation: number, avgMorale: number, hasActive: boolean): string {
  if (money < 100) return '資金偏低，先接幾個 tier1 小案穩住現金流。';
  if (reputation < 25) return '信譽偏低，連 tier3 案都看不到。先穩穩做 tier2 累積口碑。';
  if (avgMorale < 40) return '員工士氣低落，買零食或開派對給點關懷。';
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

