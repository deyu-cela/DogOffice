import { CEO_DOG, ROLE_IMAGE_MAP } from '@/constants/dogRoles';
import type { Dog } from '@/types';
import { nextDogId } from './utils';

export function createStarterCeo(): Dog {
  const stats = { ...CEO_DOG.baseStats };
  return {
    id: nextDogId(),
    role: CEO_DOG.role,
    breed: CEO_DOG.breed,
    emoji: CEO_DOG.emoji,
    name: '任勞任怨狗',
    traits: CEO_DOG.traits,
    flavor: CEO_DOG.flavor,
    passive: CEO_DOG.passive,
    motto: 'Never be afraid, keep on moving!',
    stats,
    grade: 'S',
    expectedSalary: 0,
    severance: 0,
    patience: 1,
    score: stats.speed + stats.quality + stats.patience,
    image: ROLE_IMAGE_MAP[CEO_DOG.role] ?? '',
    isCEO: true,
    status: 'active',
    fatigue: 0,
    loyalty: 100,
    experience: 0,
    pipDaysLeft: 0,
    pipScore: 0,
    pipTasks: [],
    assignedProjectId: null,
    daysAtCompany: 0,
    unhappyLeaveDays: 0,
    onLeaveDay: null,
    learnedTraits: [],
    pendingTraitChoice: null,
    level: 1,
    fragments: 0,
    equippedToolId: null,
  };
}
