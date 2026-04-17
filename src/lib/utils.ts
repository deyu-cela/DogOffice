export function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function textLevel(v: number, labels: [string, string, string]): string {
  return v >= 75 ? labels[0] : v >= 45 ? labels[1] : labels[2];
}

export function companyStage(health: number, morale: number, staffLen: number, decor: number): string {
  const score = health + morale + staffLen * 4 + decor * 5;
  if (score >= 180) return '蓬勃成長';
  if (score >= 120) return '穩定營運';
  if (score >= 80) return '勉強撐住';
  return '快撐不住';
}

export function companyHint(money: number, health: number, morale: number): string {
  if (money < 60) return '資金偏低，先穩住現金流再擴編。';
  if (health < 40) return '營運有點亂，先補穩定度比盲目賺錢重要。';
  if (morale < 40) return '大家看起來累了，陪玩或補零食比較有感。';
  return '目前公司節奏還可以，找對人比亂堆數值更重要。';
}

let walkerIdCounter = 0;
export const nextWalkerId = () => ++walkerIdCounter;

let treatIdCounter = 0;
export const nextTreatId = () => ++treatIdCounter;
