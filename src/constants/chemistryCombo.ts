import type { ChemistryCombo } from '@/types';

// 7 組化學反應（plan §7.1）
// 觸發條件：兩人都被指派到同一案子（per-project，而非招人時）
// 大部分有 category 限制，符合該類別才觸發
export const CHEMISTRY_COMBOS: ChemistryCombo[] = [
  {
    roles: ['工程師', 'QA'],
    type: 'positive',
    category: 'tech',
    bonus: { qualityMul: 1.2, speedMul: 0.9 },
    msg: '⚗ 工程師+QA：品質大幅提升，但拖慢速度（吵架但精細）',
  },
  {
    roles: ['業務', '行銷'],
    type: 'positive',
    category: 'marketing',
    bonus: { qualityMul: 1.25 },
    msg: ' 業務+行銷：行銷案品質 ×1.25（業績火箭式）',
  },
  {
    roles: ['PM', '工程師'],
    type: 'positive',
    category: 'tech',
    bonus: { speedMul: 1.25 },
    msg: ' PM+工程師：tech 案速度 ×1.25（敏捷管理）',
  },
  {
    roles: ['企劃', '美術'],
    type: 'positive',
    category: 'design',
    bonus: { qualityMul: 1.2, speedMul: 1.1 },
    msg: ' 企劃+美術：design 案品質×1.2、速度×1.1（創意火花）',
  },
  {
    roles: ['客服', '業務'],
    type: 'positive',
    category: 'service',
    bonus: { speedMul: 1.15, qualityMul: 1.1 },
    msg: ' 客服+業務：service 案速度×1.15、品質×1.1',
  },
  {
    roles: ['工程師', '業務'],
    type: 'negative',
    category: 'any',
    bonus: { qualityMul: 0.9 },
    msg: ' 工程師+業務：同案 quality ×0.9（工程師覺得業務亂開支票）',
  },
  {
    roles: ['QA', '企劃'],
    type: 'negative',
    category: 'design',
    bonus: { qualityMul: 0.85 },
    msg: ' QA+企劃：design 案 quality ×0.85（規格戰爭）',
  },
];
