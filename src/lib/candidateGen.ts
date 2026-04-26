import type { Dog, Stats } from '@/types';
import { CEO_CHANCE, CEO_DOG, DOG_ROLES, ROLE_IMAGE_MAP } from '@/constants/dogRoles';
import { INTERVIEW_QUESTIONS } from '@/constants/questions';
import { rand, clamp, nextDogId } from './utils';

// Grade 修正：乘法（取代原本的加減）
// D 0.6 / C 0.8 / B 1.0 / A 1.2 / S 1.4 / CEO 1.7
type GradeInfo = { grade: Dog['grade']; statMul: number; salaryMul: number };

function rollGrade(isCeoRoll: boolean): GradeInfo {
  if (isCeoRoll) return { grade: 'S', statMul: 1.7, salaryMul: 1.6 };
  const r = Math.random();
  if (r < 0.09) return { grade: 'S', statMul: 1.4, salaryMul: 1.6 };
  if (r < 0.24) return { grade: 'A', statMul: 1.2, salaryMul: 1.25 };
  if (r < 0.54) return { grade: 'B', statMul: 1.0, salaryMul: 1.0 };
  if (r < 0.79) return { grade: 'C', statMul: 0.8, salaryMul: 0.85 };
  return { grade: 'D', statMul: 0.6, salaryMul: 0.7 };
}

function jitter(): number {
  // -1 ~ +1 整數
  return Math.floor(Math.random() * 3) - 1;
}

export function generateCandidate(opts?: { role?: string }): Dog {
  const targetRole = opts?.role;
  let isCeoRoll = false;
  let template: typeof CEO_DOG;
  if (targetRole) {
    const found = DOG_ROLES.find((r) => r.role === targetRole);
    if (found) {
      template = found;
    } else {
      isCeoRoll = Math.random() < CEO_CHANCE;
      template = isCeoRoll ? CEO_DOG : rand(DOG_ROLES);
    }
  } else {
    isCeoRoll = Math.random() < CEO_CHANCE;
    template = isCeoRoll ? CEO_DOG : rand(DOG_ROLES);
  }
  const { grade, statMul, salaryMul } = rollGrade(isCeoRoll);

  // 新 4 維 stats，1-10 範圍
  const stats: Stats = {
    speed: clamp(Math.round(template.baseStats.speed * statMul + jitter()), 1, 10),
    quality: clamp(Math.round(template.baseStats.quality * statMul + jitter()), 1, 10),
    teamwork: clamp(Math.round(template.baseStats.teamwork * statMul + jitter()), 1, 10),
    charisma: clamp(Math.round(template.baseStats.charisma * statMul + jitter()), 1, 10),
  };

  const score = stats.speed + stats.quality + stats.teamwork + stats.charisma;

  // 新薪資公式（plan §1.4）
  const contribution =
    stats.speed * 0.8 + stats.quality * 1.5 + stats.teamwork * 0.6 + stats.charisma * 0.9;
  const baseSalary = isCeoRoll ? 90 : 6 + contribution * salaryMul;
  const expectedSalary = Math.max(5, Math.round(baseSalary + (Math.random() * 6 - 3)));
  const severance = Math.round(expectedSalary * 3);
  const patience = isCeoRoll ? 1 : 2 + Math.floor(Math.random() * 3);

  return {
    id: nextDogId(),
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
    image: ROLE_IMAGE_MAP[template.role] ?? '',
    isCEO: template.isCEO,
    interview: rand(INTERVIEW_QUESTIONS),
    status: 'active',
    // 接案制新欄位
    morale: 70,
    fatigue: 0,
    loyalty: 50,
    experience: 0,
    assignedProjectId: null,
    daysAtCompany: 0,
    unhappyLeaveDays: 0,
  };
}

export function ensureQueueLength(queue: Dog[], n = 3): Dog[] {
  const next = [...queue];
  while (next.length < n) next.push(generateCandidate());
  return next;
}
