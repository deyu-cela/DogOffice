import type { ShopItem } from '@/types';

// 9 個 id 保留，效果改新 buff key（plan §7.2）
// 員工關懷類（snack/toy/sofa/gym/artwall）一次性 +loyalty
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'snack',
    name: '高級零食',
    cost: 28,
    desc: '全員士氣 +15、忠誠 +3。',
    statTags: [
      { label: '士氣+15', type: 'up' },
      { label: '忠誠+3', type: 'up' },
    ],
  },
  {
    id: 'toy',
    name: '狗狗玩具區',
    cost: 42,
    desc: '士氣 +12、忠誠 +5、裝飾 +1。',
    statTags: [
      { label: '士氣+12', type: 'up' },
      { label: '忠誠+5', type: 'up' },
      { label: '裝飾+1', type: 'up' },
    ],
  },
  {
    id: 'desk',
    name: '升級辦公桌',
    cost: 65,
    desc: '全公司速度加成 +1（影響每日案件進度）。',
    statTags: [{ label: '速度+1', type: 'up' }],
  },
  {
    id: 'policy',
    name: '流程優化手冊',
    cost: 45,
    desc: '全公司專業加成 +1（影響案件品質與酬勞）。',
    statTags: [{ label: '專業+1', type: 'up' }],
  },
  {
    id: 'lamp',
    name: '暖光吊燈',
    cost: 48,
    desc: '裝飾 +1、隊員魅力臨時 +1（5 天）。',
    statTags: [
      { label: '裝飾+1', type: 'up' },
      { label: '魅力+1·5天', type: 'up' },
    ],
  },
  {
    id: 'sofa',
    name: '懶骨頭休息區',
    cost: 72,
    desc: '協作 +1、士氣 +8、忠誠 +8（強化員工歸屬感）。',
    statTags: [
      { label: '協作+1', type: 'up' },
      { label: '士氣+8', type: 'up' },
      { label: '忠誠+8', type: 'up' },
    ],
  },
  {
    id: 'artwall',
    name: '品牌展示牆',
    cost: 75,
    desc: '裝飾 +2、忠誠 +4、tierBudget 永久 +8（拉高 inbox 稀有度）。',
    statTags: [
      { label: '裝飾+2', type: 'up' },
      { label: '忠誠+4', type: 'up' },
      { label: '稀有度+8', type: 'up' },
    ],
  },
  {
    id: 'coffee',
    name: '精品咖啡機',
    cost: 48,
    desc: '速度 +1、士氣 +5。',
    statTags: [
      { label: '速度+1', type: 'up' },
      { label: '士氣+5', type: 'up' },
    ],
  },
  {
    id: 'gym',
    name: '狗狗健身區',
    cost: 78,
    desc: '速度 +1、協作 +1、忠誠 +6。',
    statTags: [
      { label: '速度+1', type: 'up' },
      { label: '協作+1', type: 'up' },
      { label: '忠誠+6', type: 'up' },
    ],
  },
];
