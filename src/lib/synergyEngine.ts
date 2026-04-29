import type { Dog, Stats, SynergyBuff, ActiveSynergies } from '@/types';
import {
  ALL_SYNERGY_KEYS,
  SYNERGY_BUFFS,
  SYNERGY_TIER1,
  SYNERGY_TIER2,
  type SynergyKey,
} from '@/constants/dogTags';

// === 計算每個 tag 在員工列表中的擁有者數量 ===
function countByTag(staff: Dog[]): Record<SynergyKey, string[]> {
  const out: Record<string, string[]> = {};
  for (const key of ALL_SYNERGY_KEYS) out[key] = [];
  for (const dog of staff) {
    if (dog.region && out[dog.region]) out[dog.region].push(dog.id);
    for (const p of dog.personalities ?? []) {
      if (out[p]) out[p].push(dog.id);
    }
  }
  return out as Record<SynergyKey, string[]>;
}

// === 由員工列表算出當前 synergy 表 ===
export function computeSynergiesFromStaff(staff: Dog[]): ActiveSynergies {
  const counts = countByTag(staff);
  const result: ActiveSynergies = {};
  for (const key of ALL_SYNERGY_KEYS) {
    const ids = counts[key];
    const count = ids.length;
    if (count >= SYNERGY_TIER2) {
      result[key] = { key, tier: 2, memberIds: ids };
    } else if (count >= SYNERGY_TIER1) {
      result[key] = { key, tier: 1, memberIds: ids };
    }
  }
  return result;
}

// === 取得某狗從所有觸發中 synergy 拿到的 stat 加成 ===
export function getSynergyBonusForDog(
  dog: Dog,
  active: ActiveSynergies,
): Stats {
  const bonus: Stats = { speed: 0, quality: 0, teamwork: 0, charisma: 0 };
  const tags: SynergyKey[] = [];
  if (dog.region) tags.push(dog.region);
  for (const p of dog.personalities ?? []) tags.push(p);
  for (const key of tags) {
    const synergy = active[key];
    if (!synergy) continue;
    const def = SYNERGY_BUFFS[key];
    const buff = synergy.tier === 2 ? def.tier2 : def.tier1;
    bonus.speed += buff.speed ?? 0;
    bonus.quality += buff.quality ?? 0;
    bonus.teamwork += buff.teamwork ?? 0;
    bonus.charisma += buff.charisma ?? 0;
  }
  return bonus;
}

// === UI helper：給定員工列表與某 key，回傳成員 + 進度資訊 ===
export type SynergyRowInfo = {
  key: SynergyKey;
  count: number;
  tier: 0 | 1 | 2;
  memberIds: string[];
  toTier1: number; // 還差幾隻達 tier 1（已達為 0）
  toTier2: number; // 還差幾隻達 tier 2（已達為 0）
};

export function getSynergyRowInfo(staff: Dog[]): SynergyRowInfo[] {
  const counts = countByTag(staff);
  return ALL_SYNERGY_KEYS.map<SynergyRowInfo>((key) => {
    const memberIds = counts[key];
    const count = memberIds.length;
    let tier: 0 | 1 | 2 = 0;
    if (count >= SYNERGY_TIER2) tier = 2;
    else if (count >= SYNERGY_TIER1) tier = 1;
    return {
      key,
      count,
      tier,
      memberIds,
      toTier1: Math.max(0, SYNERGY_TIER1 - count),
      toTier2: Math.max(0, SYNERGY_TIER2 - count),
    };
  });
}
