import { CEO_DOG, ROLE_IMAGE_MAP } from '@/constants/dogRoles';
import { ROSTER_BY_ID } from '@/constants/dogRoster';
import type { Dog } from '@/types';
import { nextDogId } from './utils';

// 開局贈送的 CEO（視為「無償抽到」u-1）：跟 gacha 抽到同一隻
// 圖鑑上 → 之後 gacha 抽到 u-1 直接觸發突破
export function createStarterCeo(): Dog {
  const entry = ROSTER_BY_ID.get('u-1');
  const stats = entry ? { ...entry.stats } : { ...CEO_DOG.baseStats };
  const breed = entry?.breed ?? CEO_DOG.breed;
  const flavor = entry?.flavor ?? CEO_DOG.flavor;
  return {
    id: nextDogId(),
    rosterId: 'u-1',
    role: 'CEO',
    breed,
    emoji: CEO_DOG.emoji,
    name: '刀霸翎',
    traits: CEO_DOG.traits,
    flavor,
    passive: CEO_DOG.passive,
    motto: 'Never be afraid, keep on moving!',
    stats,
    grade: 'S', // U 在舊欄位用 S 表示
    expectedSalary: 0,
    severance: 0,
    patience: 1,
    score: stats.speed + stats.quality + stats.patience,
    image: ROLE_IMAGE_MAP['CEO'] ?? '',
    isCEO: true,
    fatigue: 0,
    assignedProjectId: null,
    daysAtCompany: 0,
    unhappyLeaveDays: 0,
    onLeaveDay: null,
    learnedTraits: [],
    pendingTraitChoice: null,
    level: 1,
    breakthroughs: 0,
    equippedToolId: null,
  };
}
