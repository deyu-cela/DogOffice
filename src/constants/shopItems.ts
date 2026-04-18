import type { ShopItem } from '@/types';

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'snack', name: '高級零食', cost: 28, desc: '全體心情變好。', statTags: [{ label: '士氣+10', type: 'up' }] },
  { id: 'toy', name: '狗狗玩具區', cost: 42, desc: '士氣提升，辦公室更多裝飾。', statTags: [{ label: '士氣+12', type: 'up' }, { label: '裝飾+1', type: 'up' }] },
  { id: 'desk', name: '升級辦公桌', cost: 65, desc: '整體工作效率小幅提升。', statTags: [{ label: '產能+1', type: 'up' }] },
  { id: 'policy', name: '流程優化手冊', cost: 45, desc: '改善穩定度，減少亂流。', statTags: [{ label: '穩定+1', type: 'up' }] },
  { id: 'lamp', name: '暖光吊燈', cost: 48, desc: '辦公室更溫暖，士氣與美觀同步提升。', statTags: [{ label: '裝飾+1', type: 'up' }, { label: '士氣+6', type: 'up' }] },
  { id: 'sofa', name: '懶骨頭休息區', cost: 72, desc: '休息空間更舒服，能提升士氣與穩定。', statTags: [{ label: '裝飾+2', type: 'up' }, { label: '士氣+8', type: 'up' }, { label: '營運+4', type: 'up' }] },
  { id: 'artwall', name: '品牌展示牆', cost: 75, desc: '讓辦公室更有風格，也能帶來話題。', statTags: [{ label: '裝飾+2', type: 'up' }, { label: '士氣+4', type: 'up' }, { label: '產能+1', type: 'up' }] },
  { id: 'coffee', name: '精品咖啡機', cost: 48, desc: '提神醒腦！產能與士氣都微幅提升。', statTags: [{ label: '產能+1', type: 'up' }, { label: '士氣+5', type: 'up' }] },
  { id: 'gym', name: '狗狗健身區', cost: 78, desc: '強身健體，穩定度大幅提升。', statTags: [{ label: '穩定+2', type: 'up' }, { label: '士氣+6', type: 'up' }, { label: '營運+3', type: 'up' }] },
];
