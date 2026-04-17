import type { Dog, Stats } from '@/types';
import { CEO_CHANCE, CEO_DOG, DOG_ROLES, ROLE_IMAGE_MAP } from '@/constants/dogRoles';
import { INTERVIEW_QUESTIONS } from '@/constants/questions';
import { rand, clamp } from './utils';

export function generateCandidate(): Dog {
  const isCeoRoll = Math.random() < CEO_CHANCE;
  const template = isCeoRoll ? CEO_DOG : rand(DOG_ROLES);

  const gradeRoll = Math.random();
  let grade: Dog['grade'];
  let statMod: number;
  if (isCeoRoll) {
    grade = 'S';
    statMod = 3;
  } else if (gradeRoll < 0.1) {
    grade = 'S';
    statMod = 2;
  } else if (gradeRoll < 0.3) {
    grade = 'A';
    statMod = 1;
  } else if (gradeRoll < 0.7) {
    grade = 'B';
    statMod = 0;
  } else if (gradeRoll < 0.9) {
    grade = 'C';
    statMod = -1;
  } else {
    grade = 'D';
    statMod = -2;
  }

  const stats: Stats = { ...template.baseStats };
  (Object.keys(stats) as (keyof Stats)[]).forEach((k) => {
    stats[k] = clamp(stats[k] + statMod, -5, 10);
  });

  const score = stats.productivity + stats.morale + stats.stability + stats.revenue;
  const baseSalary = isCeoRoll ? 80 : 12 + Math.max(0, score) * 3;
  const expectedSalary = Math.round(baseSalary + (Math.random() * 10 - 5));
  const severance = Math.round(expectedSalary * 3);
  const patience = isCeoRoll ? 1 : 2 + Math.floor(Math.random() * 3);

  return {
    role: template.role,
    breed: template.breed,
    emoji: template.emoji,
    name: rand(template.names),
    traits: template.traits,
    flavor: template.flavor,
    passive: template.passive,
    motto: template.motto,
    stats,
    grade,
    expectedSalary,
    severance,
    patience,
    score,
    image: ROLE_IMAGE_MAP[template.role],
    isCEO: template.isCEO,
    interview: rand(INTERVIEW_QUESTIONS),
    status: 'active',
  };
}

export function ensureQueueLength(queue: Dog[], n = 3): Dog[] {
  const next = [...queue];
  while (next.length < n) next.push(generateCandidate());
  return next;
}
