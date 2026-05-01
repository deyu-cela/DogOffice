import type { ShopItem } from '@/types';

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'desk',
    name: '升級辦公桌',
    cost: 650,
    category: 'all',
    desc: '全 team 接案時速度 +1。',
    statTags: [{ label: '全 team 速度+1', type: 'up' }],
  },
  {
    id: 'policy',
    name: '流程優化手冊',
    cost: 450,
    category: 'tech',
    desc: 'SOP 與 code review 落地，工程師專業 +1、速度 +1。',
    statTags: [
      { label: '工程 專業+1', type: 'up' },
      { label: '工程 速度+1', type: 'up' },
    ],
  },
  {
    id: 'artwall',
    name: '品牌展示牆',
    cost: 750,
    category: 'design',
    desc: '看到自己作品被展示，美術專業 +1、速度 +1。',
    statTags: [
      { label: '美術 專業+1', type: 'up' },
      { label: '美術 速度+1', type: 'up' },
    ],
  },
  {
    id: 'lamp',
    name: '暖光吊燈',
    cost: 480,
    category: 'all',
    desc: '辦公室更舒適，每日疲勞恢復 +1。',
    statTags: [{ label: '每日疲勞恢復+1', type: 'up' }],
  },
  {
    id: 'coffee',
    name: '精品咖啡機',
    cost: 480,
    category: 'service',
    desc: '客服打電話更有勁，客服專業 +1、速度 +1。',
    statTags: [
      { label: '客服 專業+1', type: 'up' },
      { label: '客服 速度+1', type: 'up' },
    ],
  },
  {
    id: 'snack',
    name: '高級零食',
    cost: 280,
    category: 'marketing',
    desc: '帶客戶訪談備料，行銷專業 +1、速度 +1。',
    statTags: [
      { label: '行銷 專業+1', type: 'up' },
      { label: '行銷 速度+1', type: 'up' },
    ],
  },
  {
    id: 'toy',
    name: '狗狗玩具區',
    cost: 420,
    category: 'all',
    desc: '可愛裝飾用，狗狗們都喜歡（暫無數值效果）。',
    statTags: [{ label: '裝飾用', type: 'up' }],
  },
  {
    id: 'gym',
    name: '狗狗健身區',
    cost: 780,
    category: 'all',
    desc: '體力好脾氣才好，全員耐心 +1（疲勞累積變慢）。',
    statTags: [{ label: '全員 耐心+1', type: 'up' }],
  },
  {
    id: 'sofa',
    name: '懶骨頭休息區',
    cost: 720,
    category: 'all',
    desc: '每日結算時，全員疲勞 −(3 + 等級×2)。',
    statTags: [{ label: '每日疲勞−', type: 'up' }],
  },
];
