import type { ChemistryCombo } from '@/types';

export const CHEMISTRY_COMBOS: ChemistryCombo[] = [
  { roles: ['工程師', 'QA'], type: 'positive', bonus: { stability: 3, morale: -1 }, msg: '⚗️ 工程師+QA：品質大幅提升！但他們吵翻天了...（穩定+3, 士氣-1）' },
  { roles: ['業務', '行銷'], type: 'positive', bonus: { revenue: 4, stability: -1 }, msg: '🔥 業務+行銷：業績火箭式成長！但流程有點亂（收入+4, 穩定-1）' },
  { roles: ['主管', '營運'], type: 'positive', bonus: { stability: 5, morale: 2 }, msg: '🤝 主管+營運：公司超穩！大家安心做事（穩定+5, 士氣+2）' },
  { roles: ['企劃', '美術'], type: 'positive', bonus: { morale: 3, revenue: 2 }, msg: '🎨 企劃+美術：創意大爆發！作品超吸睛（士氣+3, 收入+2）' },
  { roles: ['HR', '客服'], type: 'positive', bonus: { morale: 4, stability: 2 }, msg: '💕 HR+客服：公司氛圍超溫暖！（士氣+4, 穩定+2）' },
  { roles: ['PM', '開發'], type: 'positive', bonus: { productivity: 4, stability: 2 }, msg: '🚀 PM+開發：專案準時交付！效率倍增（產能+4, 穩定+2）' },
  { roles: ['數據分析', '財務'], type: 'positive', bonus: { revenue: 3, stability: 2 }, msg: '📊 數據+財務：精準決策，錢花在刀口上（收入+3, 穩定+2）' },
  { roles: ['翻譯', '業務'], type: 'positive', bonus: { revenue: 3, morale: 1 }, msg: '🌍 翻譯+業務：海外市場打開了！（收入+3, 士氣+1）' },
  { roles: ['企劃', '營運'], type: 'negative', bonus: { stability: -3, morale: -2 }, msg: '💥 企劃+營運：理想與現實大衝突！（穩定-3, 士氣-2）' },
  { roles: ['工程師', '業務'], type: 'negative', bonus: { morale: -2, stability: -1 }, msg: '😵 工程師+業務：工程師覺得業務亂開支票（士氣-2, 穩定-1）' },
  { roles: ['QA', '企劃'], type: 'negative', bonus: { morale: -2, productivity: -1 }, msg: '🔥 QA+企劃：QA 說「這規格根本做不了」（士氣-2, 產能-1）' },
];
