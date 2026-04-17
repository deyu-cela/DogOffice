import type { OfficeLevel } from '@/types';

export const OFFICE_LEVELS: OfficeLevel[] = [
  { name: '車庫工作室', maxStaff: 2, upgradeCost: 0, wall: '#f8efe6', floor: '#dfccb1', desks: 1, windows: 0, shelves: 0, plants: 1, coffee: 0, lights: 1, lounge: 0 },
  { name: '小辦公室', maxStaff: 4, upgradeCost: 110, wall: '#fff4df', floor: '#e8d3b3', desks: 3, windows: 1, shelves: 1, plants: 2, coffee: 1, lights: 2, lounge: 1 },
  { name: '中型辦公室', maxStaff: 6, upgradeCost: 240, wall: '#fff7ea', floor: '#ecd9ba', desks: 5, windows: 2, shelves: 2, plants: 3, coffee: 2, lights: 3, lounge: 1 },
  { name: '大型辦公室', maxStaff: 8, upgradeCost: 420, wall: '#fff9ef', floor: '#efddc0', desks: 7, windows: 3, shelves: 3, plants: 4, coffee: 3, lights: 4, lounge: 2 },
  { name: '豪華總部', maxStaff: 12, upgradeCost: 720, wall: '#fffdf5', floor: '#f4e4ca', desks: 10, windows: 4, shelves: 4, plants: 5, coffee: 4, lights: 5, lounge: 3 },
];

export const BASE_DAY_MS = 7000;
