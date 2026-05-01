import type { Dog, ProjectCategory } from '@/types';

export const INDUSTRY_LABEL: Record<ProjectCategory, string> = {
  tech: '工程',
  design: '美術',
  marketing: '行銷',
  service: '客服',
};

export const INDUSTRY_COLOR: Record<ProjectCategory, string> = {
  tech: '#5a8ce6',
  design: '#e88aaa',
  marketing: '#e8a85a',
  service: '#5fb38f',
};

export type StarTier = 1 | 2 | 3;

export type StarStyle = {
  tier: StarTier;
  pillarFrom: string;
  pillarTo: string;
  glow: string;
  border: string;
  starColor: string;
  bgFrom: string;
  bgTo: string;
};

const TIER_3: StarStyle = {
  tier: 3,
  pillarFrom: 'rgba(255,217,90,0.95)',
  pillarTo: 'rgba(240,168,24,0)',
  glow: 'rgba(255,217,90,0.65)',
  border: '#f0a818',
  starColor: '#ffd95a',
  bgFrom: '#fff7d8',
  bgTo: '#ffd95a',
};

const TIER_2_PURPLE: StarStyle = {
  tier: 2,
  pillarFrom: 'rgba(199,155,255,0.9)',
  pillarTo: 'rgba(138,92,240,0)',
  glow: 'rgba(199,155,255,0.55)',
  border: '#8a5cf0',
  starColor: '#c79bff',
  bgFrom: '#f1e8ff',
  bgTo: '#c79bff',
};

const TIER_2_BLUE: StarStyle = {
  tier: 2,
  pillarFrom: 'rgba(95,179,255,0.9)',
  pillarTo: 'rgba(32,128,214,0)',
  glow: 'rgba(95,179,255,0.55)',
  border: '#2080d6',
  starColor: '#5fb3ff',
  bgFrom: '#dcefff',
  bgTo: '#5fb3ff',
};

const TIER_1: StarStyle = {
  tier: 1,
  pillarFrom: 'rgba(216,227,238,0.85)',
  pillarTo: 'rgba(138,162,200,0)',
  glow: 'rgba(216,227,238,0.4)',
  border: '#8aa2c8',
  starColor: '#c8d4e6',
  bgFrom: '#f4f7fb',
  bgTo: '#c8d4e6',
};

export function dogStarStyle(dog: Dog): StarStyle {
  if (dog.isCEO) return TIER_3;
  switch (dog.grade) {
    case 'S':
      return TIER_3;
    case 'A':
      return TIER_2_PURPLE;
    case 'B':
      return TIER_2_BLUE;
    case 'C':
    case 'D':
    default:
      return TIER_1;
  }
}

// 蔚藍檔案配色：明亮 / 深色
export const BA_LIGHT = {
  bg: 'linear-gradient(180deg, #ffffff 0%, #eef6ff 100%)',
  bannerBg: 'linear-gradient(135deg, #5fb3ff 0%, #2080d6 100%)',
  border: '#5fb3ff',
  borderSoft: 'rgba(95,179,255,0.35)',
  text: '#17356f',
  muted: '#6d82a8',
  accent: '#2080d6',
  glow: '0 24px 70px rgba(95,179,255,0.32)',
};

export const BA_DARK = {
  bg: 'linear-gradient(180deg, #0a1845 0%, #1d3a8c 100%)',
  centerGlow:
    'radial-gradient(ellipse at 50% 55%, rgba(95,179,255,0.35) 0%, rgba(10,24,69,0) 60%)',
  text: '#ffffff',
  muted: 'rgba(255,255,255,0.7)',
};
