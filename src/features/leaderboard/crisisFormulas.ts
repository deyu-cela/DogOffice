import type { Dog, ProjectCategory, Team } from '@/types';

export type CrisisCeoStats = {
  hp: number;
  atk: number;
  interval: number;
  teamSize: number;
};

export const MONSTER_ATK = 5;
export const MONSTER_INTERVAL = 1.0;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function getTeamDogs(staff: Dog[], teams: Record<ProjectCategory, Team>): Dog[] {
  const memberSet = new Set<string>();
  for (const t of Object.values(teams)) {
    for (const id of t.memberIds) memberSet.add(id);
  }
  return staff.filter((d) => memberSet.has(d.id));
}

export function computeCeoStats(
  staff: Dog[],
  teams: Record<ProjectCategory, Team>,
): CrisisCeoStats {
  const dogs = getTeamDogs(staff, teams);
  if (dogs.length === 0) {
    return { hp: 0, atk: 0, interval: 1.4, teamSize: 0 };
  }
  const sumPatience = dogs.reduce((n, d) => n + d.stats.patience, 0);
  const sumQuality = dogs.reduce((n, d) => n + d.stats.quality, 0);
  const avgSpeed = dogs.reduce((n, d) => n + d.stats.speed, 0) / dogs.length;
  return {
    hp: sumPatience * 5,
    atk: sumQuality,
    interval: clamp(1.5 - avgSpeed * 0.1, 0.4, 1.4),
    teamSize: dogs.length,
  };
}
