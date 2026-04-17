export function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function textLevel(v: number, labels: [string, string, string]): string {
  return v >= 75 ? labels[0] : v >= 45 ? labels[1] : labels[2];
}

let walkerIdCounter = 0;
export const nextWalkerId = () => ++walkerIdCounter;

let treatIdCounter = 0;
export const nextTreatId = () => ++treatIdCounter;
