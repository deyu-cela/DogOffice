import type { CompanyBuffs, Dog, ProjectCategory } from '@/types';
import type { DogTraitId } from '@/constants/dogTraits';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import { simulateProjectDays } from '@/lib/projectEngine';

const ROLE_CATEGORY: Record<string, ProjectCategory[]> = {
  工程師: ['tech'], QA: ['tech'],
  美術: ['design'], 企劃: ['design', 'marketing'],
  業務: ['marketing', 'service'], 行銷: ['marketing'],
  客服: ['service'],
  PM: ['tech', 'design', 'marketing', 'service'],
  CEO: ['tech', 'design', 'marketing', 'service'],
};

function isSpecialistFor(role: string, category: ProjectCategory): boolean {
  const cats = ROLE_CATEGORY[role];
  return !!cats && cats.length === 1 && cats[0] === category;
}

function dogScoreFor(dog: Dog, category: ProjectCategory): number {
  const matched = (dog as Dog & { role: string }).role;
  const cats = ROLE_CATEGORY[matched] ?? [];
  const specialistBonus = cats.length === 1 ? 5 : cats.length === 2 ? 2 : 0;
  const matchBonus = cats.includes(category) ? 10 + specialistBonus : 0;
  const fatiguePenalty = dog.fatigue / 10;
  let mainWeight = 0;
  switch (category) {
    case 'tech': mainWeight = dog.stats.quality * 1.3 + dog.stats.speed * 1.2; break;
    case 'design': mainWeight = dog.stats.quality * 1.4 + dog.stats.speed * 1.15; break;
    case 'marketing': mainWeight = dog.stats.speed * 1.3 + dog.stats.quality * 1.1; break;
    case 'service': mainWeight = dog.stats.quality * 1.2 + dog.stats.speed * 1.15; break;
  }
  return mainWeight + matchBonus - fatiguePenalty;
}

function traitScoreFor(dog: Dog, category: ProjectCategory, alreadyPicked: Dog[]): number {
  const traits = (dog.learnedTraits ?? []) as DogTraitId[];
  if (traits.length === 0) return 0;
  let score = 0;
  for (const t of traits) {
    switch (t) {
      case 'overtime': score += 3; break;
      case 'perfectionist':
        score += category === 'tech' || category === 'design' || category === 'service' ? 5 : 1; break;
      case 'haggler': score += 6; break;
      case 'ironHeart': score += 1; break;
      case 'catalyst': score += alreadyPicked.length > 0 ? 5 : 1; break;
      case 'enduring': score += dog.fatigue > 50 ? 5 : 2; break;
      case 'social': score += category === 'marketing' ? 6 : 3; break;
    }
  }
  return score;
}

function chemistryBonus(testRoles: Set<string>, category: ProjectCategory): number {
  let bonus = 0;
  for (const combo of CHEMISTRY_COMBOS) {
    if (combo.category && combo.category !== 'any' && combo.category !== category) continue;
    const all = combo.roles.every((r) => testRoles.has(r));
    if (!all) continue;
    bonus += combo.type === 'positive' ? 6 : -6;
  }
  return bonus;
}

function hasNegativeChemistry(testRoles: Set<string>, category: ProjectCategory): boolean {
  return CHEMISTRY_COMBOS.some((combo) => {
    if (combo.type !== 'negative') return false;
    if (combo.category && combo.category !== 'any' && combo.category !== category) return false;
    return combo.roles.every((r) => testRoles.has(r));
  });
}

// 自動配對隊伍：貪心填滿到 capacity，純看 base + trait + chemistry 分數，沒有 project 模擬
// 用在 TeamEditModal 的「自動配對」按鈕
export function pickBestTeamForIndustry(
  candidates: Dog[],
  category: ProjectCategory,
  capacity: number,
): Dog[] {
  if (capacity <= 0 || candidates.length === 0) return [];
  const result: Dog[] = [];
  const pool = candidates.slice();

  while (result.length < capacity && pool.length > 0) {
    let bestIdx = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < pool.length; i++) {
      const d = pool[i];
      const baseScore = dogScoreFor(d, category);
      const traitScore = traitScoreFor(d, category, result);
      const newRoles = new Set([...result.map((r) => r.role), d.role]);
      if (hasNegativeChemistry(newRoles, category)) continue;
      const oldRoles = new Set(result.map((r) => r.role));
      const chemDelta = chemistryBonus(newRoles, category) - chemistryBonus(oldRoles, category);
      const total = baseScore + traitScore + chemDelta;
      if (total > bestScore) {
        bestScore = total;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) break;
    // 第一隻保證選；之後若加進去整體分數變負，就停
    if (result.length >= 1 && bestScore < 0) break;
    result.push(pool[bestIdx]);
    pool.splice(bestIdx, 1);
  }
  return result;
}

// 自動指派：貪心挑分數最高的，最多 3 隻；當加人不能再縮短預估天數時停止
export function pickAutoAssign(
  candidates: Dog[],
  category: ProjectCategory,
  alreadyPicked: Dog[],
  remainingWork: number,
  buffs: CompanyBuffs,
): Dog[] {
  const result: Dog[] = [...alreadyPicked];
  const pool = candidates.slice();
  const MAX = 3;

  // 案件最快 2 天完成；估算 ≤ 2 不再算作更快，避免多派員工
  // 模擬 day-by-day（含疲勞累積）讓估天數更貼近實際
  const MIN_PROJECT_DAYS = 2;
  const daysFor = (dogs: Dog[]): number => {
    if (dogs.length === 0) return Infinity;
    const sim = simulateProjectDays(dogs, remainingWork, 0, category, buffs);
    if (!sim.complete) return Infinity;
    return Math.max(MIN_PROJECT_DAYS, sim.days);
  };

  let prevDays = daysFor(result);

  while (result.length < MAX && pool.length > 0) {
    let searchIndices: number[] = pool.map((_, i) => i);
    if (result.length === 0) {
      const specialistIdx = pool
        .map((d, i) => (isSpecialistFor(d.role, category) ? i : -1))
        .filter((i) => i >= 0);
      if (specialistIdx.length > 0) searchIndices = specialistIdx;
    }

    let bestIdx = -1;
    let bestScore = -Infinity;
    for (const i of searchIndices) {
      const d = pool[i];
      const baseScore = dogScoreFor(d, category);
      const traitScore = traitScoreFor(d, category, result);
      const newRoles = new Set([...result.map((r) => r.role), d.role]);
      if (hasNegativeChemistry(newRoles, category)) continue;
      const oldRoles = new Set(result.map((r) => r.role));
      const chemDelta = chemistryBonus(newRoles, category) - chemistryBonus(oldRoles, category);
      const total = baseScore + traitScore + chemDelta;
      if (total > bestScore) {
        bestScore = total;
        bestIdx = i;
      }
    }
    if (bestIdx === -1 || (result.length >= 1 && bestScore < 0)) break;

    if (result.length >= 1) {
      const newDays = daysFor([...result, pool[bestIdx]]);
      if (newDays >= prevDays) break;
      prevDays = newDays;
    } else {
      prevDays = daysFor([pool[bestIdx]]);
    }

    result.push(pool[bestIdx]);
    pool.splice(bestIdx, 1);
  }
  return result;
}
