import type { ShopItem } from '@/types';

// 設施對應 4 個職業類別 + sofa 全員特殊
// 每個 category 配 1 個 speed 設施 + 1 個 quality 設施
export const SHOP_ITEMS: ShopItem[] = [
  // tech
  {
    id: 'desk',
    name: '升級辦公桌',
    cost: 650,
    category: 'tech',
    desc: '工程師更專心，tech 案件速度 +1。',
    statTags: [{ label: 'tech 速度+1', type: 'up' }],
  },
  {
    id: 'policy',
    name: '流程優化手冊',
    cost: 450,
    category: 'tech',
    desc: 'SOP 與 code review 落地，tech 案件品質 +1。',
    statTags: [{ label: 'tech 品質+1', type: 'up' }],
  },
  // design
  {
    id: 'artwall',
    name: '品牌展示牆',
    cost: 750,
    category: 'design',
    desc: '看到自己作品被展示，design 案件速度 +1（裝飾 +2、稀有度預算 +8）。',
    statTags: [
      { label: 'design 速度+1', type: 'up' },
      { label: '裝飾+2', type: 'up' },
      { label: '稀有度+8', type: 'up' },
    ],
  },
  {
    id: 'lamp',
    name: '暖光吊燈',
    cost: 480,
    category: 'design',
    desc: '看色彩更準，design 案件品質 +1（裝飾 +1）。',
    statTags: [
      { label: 'design 品質+1', type: 'up' },
      { label: '裝飾+1', type: 'up' },
    ],
  },
  // marketing
  {
    id: 'coffee',
    name: '精品咖啡機',
    cost: 480,
    category: 'marketing',
    desc: '業務跑客戶有衝勁，marketing 案件速度 +1。',
    statTags: [{ label: 'marketing 速度+1', type: 'up' }],
  },
  {
    id: 'snack',
    name: '高級零食',
    cost: 280,
    category: 'marketing',
    desc: '帶客戶訪談備料，marketing 案件品質 +1。',
    statTags: [{ label: 'marketing 品質+1', type: 'up' }],
  },
  // service
  {
    id: 'toy',
    name: '狗狗玩具區',
    cost: 420,
    category: 'service',
    desc: '客服解壓提速，service 案件速度 +1（裝飾 +1）。',
    statTags: [
      { label: 'service 速度+1', type: 'up' },
      { label: '裝飾+1', type: 'up' },
    ],
  },
  {
    id: 'gym',
    name: '狗狗健身區',
    cost: 780,
    category: 'service',
    desc: '體力好脾氣才好，service 案件品質 +1。',
    statTags: [{ label: 'service 品質+1', type: 'up' }],
  },
  // 全員特殊
  {
    id: 'sofa',
    name: '懶骨頭休息區',
    cost: 720,
    category: 'all',
    desc: '每日結算時，全員疲勞 −(3 + 等級×2)。',
    statTags: [{ label: '每日疲勞−', type: 'up' }],
  },
];
