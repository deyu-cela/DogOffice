import type { ChemistryCombo } from '@/types';

// 4 組化學反應（每產業主+副）
// 觸發條件：兩人都被指派到同一案子，且案件 category 對應
export const CHEMISTRY_COMBOS: ChemistryCombo[] = [
  {
    roles: ['工程師', 'PM'],
    type: 'positive',
    category: 'tech',
    bonus: { qualityMul: 1.2, speedMul: 1.2 },
    msg: '工程師+PM：tech 案 專業×1.2 速度×1.2',
  },
  {
    roles: ['美術', 'QA'],
    type: 'positive',
    category: 'design',
    bonus: { qualityMul: 1.2, speedMul: 1.2 },
    msg: '美術+QA：design 案 專業×1.2 速度×1.2',
  },
  {
    roles: ['行銷', '業務'],
    type: 'positive',
    category: 'marketing',
    bonus: { qualityMul: 1.2, speedMul: 1.2 },
    msg: '行銷+業務：marketing 案 專業×1.2 速度×1.2',
  },
  {
    roles: ['客服', '企劃'],
    type: 'positive',
    category: 'service',
    bonus: { qualityMul: 1.2, speedMul: 1.2 },
    msg: '客服+企劃：service 案 專業×1.2 速度×1.2',
  },
];
