import type { OfficeLevel } from '@/types';

export const OFFICE_LEVELS: OfficeLevel[] = [
  // Lv0-1：kawaii 奶油粉調（花園窗景）
  { name: '車庫工作室', maxStaff: 3, upgradeCost: 0,
    wall: '#f9dccd', wallRight: '#fbe6d5', floor: '#f5c9b5', theme: 'kawaii',
    desks: 1, windows: 0, shelves: 0, plants: 1, coffee: 0, lights: 1, lounge: 0 },
  { name: '小辦公室', maxStaff: 5, upgradeCost: 950,
    wall: '#f9dccd', wallRight: '#fbe6d5', floor: '#f5c9b5', theme: 'kawaii',
    desks: 3, windows: 1, shelves: 1, plants: 2, coffee: 1, lights: 2, lounge: 1,
    requiredItems: ['sofa', 'toy'] },
  // Lv2：Shibuya 辦公室（水泥灰 + 原木 accent + 城市公園）
  { name: '中型辦公室', maxStaff: 7, upgradeCost: 2580,
    wall: '#d8d6cf', wallRight: '#e3e0d6', floor: '#c9b29c', accent: '#a3896a', theme: 'shibuya',
    desks: 5, windows: 2, shelves: 2, plants: 3, coffee: 2, lights: 3, lounge: 1,
    requiredItems: ['desk', 'gym', 'policy'] },
  // Lv3：高層辦公樓（冷調藍灰 + 天際線）
  { name: '大型辦公室', maxStaff: 9, upgradeCost: 12000,
    wall: '#c9d6e0', wallRight: '#d4dde5', floor: '#a89680', accent: '#7a94a8', theme: 'skyline',
    desks: 7, windows: 3, shelves: 3, plants: 4, coffee: 3, lights: 4, lounge: 2,
    requiredItems: ['lamp', 'coffee', 'snack', 'artwall'] },
  // Lv4：和風禪意頂樓（暖深木 + 金色 accent + 夜景）
  { name: '豪華總部', maxStaff: 12, upgradeCost: 50000,
    wall: '#5a4230', wallRight: '#6a4e36', floor: '#3e2a1a', accent: '#c9a064', theme: 'zen',
    desks: 10, windows: 4, shelves: 4, plants: 5, coffee: 4, lights: 5, lounge: 3,
    requireAllShopMax: true },
];

export const BASE_DAY_MS = 15000;
