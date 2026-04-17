import type { DogRole } from '@/types';

export const DOG_ROLES: DogRole[] = [
  { role: 'HR', breed: '黃金獵犬', emoji: '🐕', names: ['旺財', '拿鐵', '布丁', '小金'], traits: ['療癒系', '很會社交'], flavor: '進公司後大家都比較願意合作。', passive: '有 HR 時，團隊摩擦會少一點。', motto: '「履歷我先幫你排好，面試不要怕。」', baseStats: { productivity: 1, morale: 3, stability: 2, revenue: 1 } },
  { role: '工程師', breed: '邊境牧羊犬', emoji: '🐩', names: ['衝衝', '可可', '阿碼', 'Byte'], traits: ['工作狂', '抗壓王'], flavor: '做事超快，但偶爾給同事壓力。', passive: '工程師多時，產能會上升很快。', motto: '「先修 bug，其他等等再說。」', baseStats: { productivity: 4, morale: -1, stability: 1, revenue: 2 } },
  { role: '主管', breed: '德國牧羊犬', emoji: '🐕‍🦺', names: ['團團', '阿柴', '豆皮', '隊長'], traits: ['可靠', '有點固執'], flavor: '能穩住場面，但不一定聽話。', passive: '沒有主管時，營運會比較亂。', motto: '「先對齊方向，再衝刺成果。」', baseStats: { productivity: 2, morale: 1, stability: 3, revenue: 1 } },
  { role: '業務', breed: '米格魯', emoji: '🐶', names: ['短腿', '啵啵', '元氣', 'Rich'], traits: ['氣氛擔當', '超會推銷'], flavor: '帶來熱鬧與訂單，偶爾有點吵。', passive: '業務會明顯拉高收入。', motto: '「只要見到客戶，就有機會成交！」', baseStats: { productivity: 1, morale: 2, stability: -1, revenue: 4 } },
  { role: '企劃', breed: '柴犬', emoji: '🐺', names: ['暴風', '跳跳', '阿極', '二哈'], traits: ['點子很多', '容易暴走'], flavor: '高爆發型人才，好時很好，亂時很亂。', passive: '企劃能拉高爆發，但可能影響穩定。', motto: '「這裡我有 3 個超酷的新提案。」', baseStats: { productivity: 3, morale: 1, stability: -3, revenue: 3 } },
  { role: '行政', breed: '臘腸犬', emoji: '🐾', names: ['棉花糖', '白白', '雪球', '長長'], traits: ['細心', '怕生'], flavor: '讓公司比較整齊，失誤也會變少。', passive: '行政在時，營運更穩。', motto: '「表單、流程、檔案，我都整理好了。」', baseStats: { productivity: 1, morale: 0, stability: 4, revenue: 1 } },
  { role: '客服', breed: '貴賓犬', emoji: '🐕', names: ['奶油', '小麥', '阿福', '甜甜'], traits: ['超有耐心', '超會安撫'], flavor: '讓客戶比較滿意，也比較能穩住團隊節奏。', passive: '客服會提升團隊士氣與穩定。', motto: '「別擔心，我先幫你把情緒接住。」', baseStats: { productivity: 2, morale: 2, stability: 2, revenue: 2 } },
  { role: '數據分析', breed: '黑色拉布拉多', emoji: '🐾', names: ['黑糖', '偵探', 'Cookie', '數數'], traits: ['好奇心強', '聞得到問題'], flavor: '很會抓出問題，但偶爾太鑽牛角尖。', passive: '分析會讓決策更準，收入更穩。', motto: '「先看數據，不然都只是感覺。」', baseStats: { productivity: 3, morale: 0, stability: 2, revenue: 3 } },
  { role: '美術', breed: '黃金獵犬', emoji: '🐕', names: ['泡芙', '彩筆', '米露', '雪白'], traits: ['審美很好', '有點挑'], flavor: '讓公司視覺質感大升級，作品更討喜。', passive: '美術會提高裝飾與士氣的效果。', motto: '「再調一下配色，整體就會活起來。」', baseStats: { productivity: 2, morale: 2, stability: 1, revenue: 2 } },
  { role: '翻譯', breed: '柯基', emoji: '🐶', names: ['雙雙', '露比', '圓圓', '語語'], traits: ['語感很好', '超級細膩'], flavor: '能把訊息整理得更清楚，跨部門溝通更順。', passive: '翻譯能降低溝通失誤，改善穩定度。', motto: '「意思不能跑掉，語氣也要到位。」', baseStats: { productivity: 2, morale: 1, stability: 3, revenue: 1 } },
  { role: '行銷', breed: '柴犬', emoji: '🐕', names: ['焦糖', '多多', '芋圓', '吸睛'], traits: ['很會包裝', '超有梗'], flavor: '總能把公司包裝得更可愛、更有話題。', passive: '行銷能明顯推高收入與曝光。', motto: '「這個點子發出去一定會有人轉發。」', baseStats: { productivity: 2, morale: 2, stability: 0, revenue: 4 } },
  { role: '營運', breed: '邊境牧羊犬', emoji: '🐕‍🦺', names: ['阿穩', '墨墨', '老大', '牧牧'], traits: ['節奏控', '超重流程'], flavor: '會盯流程與節奏，讓公司少出很多包。', passive: '營運在時，每日結算會更穩。', motto: '「先把節奏排順，事情才不會炸開。」', baseStats: { productivity: 2, morale: -1, stability: 5, revenue: 1 } },
  { role: 'QA', breed: '雪納瑞', emoji: '🐾', names: ['Bug', '查查', '嗅嗅', '抓抓'], traits: ['極度龜毛', '眼尖'], flavor: '能幫團隊抓到很多問題，但也常讓工程師崩潰。', passive: 'QA 在時，穩定度會提升，但工程師壓力可能增加。', motto: '「這裡有個 bug，那裡也有。」', baseStats: { productivity: 1, morale: -1, stability: 4, revenue: 1 } },
  { role: 'PM', breed: '米格魯', emoji: '🐕', names: ['排排', '規規', '敏捷', 'Sprint'], traits: ['協調高手', '愛開會'], flavor: '讓專案不會迷路，但會議可能太多。', passive: 'PM 能顯著提升團隊協作效率。', motto: '「先拉個時程表，我們對齊一下。」', baseStats: { productivity: 2, morale: 1, stability: 3, revenue: 2 } },
  { role: '財務', breed: '查理斯王騎士犬', emoji: '🐾', names: ['算盤', 'Money', '帳帳', '精算'], traits: ['精打細算', '有點小氣'], flavor: '幫公司省下不少冤枉錢，但有時太省了。', passive: '財務在時，每日支出會降低一些。', motto: '「這筆預算，我覺得可以再省。」', baseStats: { productivity: 1, morale: -1, stability: 3, revenue: 3 } },
  { role: '開發', breed: '黃金獵犬', emoji: '🐕‍🦺', names: ['Code', '架構', '全端', 'Deploy'], traits: ['技術狂', '沉默寡言'], flavor: '寫出來的東西很穩，但不太愛社交。', passive: '開發在時，產能會穩定提升。', motto: '「不要催，我在想架構。」', baseStats: { productivity: 4, morale: -2, stability: 2, revenue: 2 } },
];

export const CEO_DOG: DogRole = {
  role: 'CEO',
  breed: '松獅犬',
  emoji: '👑',
  names: ['社長', 'Boss', '大王', 'Elon'],
  traits: ['天生領袖', '自帶光環', '超級稀有'],
  flavor: '傳說中的狗界 CEO，所到之處士氣與收入雙雙暴漲。',
  passive: 'CEO 在場時，全公司數值大幅提升！',
  motto: '「我不是來工作的，我是來改變世界的。」',
  baseStats: { productivity: 5, morale: 5, stability: 3, revenue: 5 },
  isCEO: true,
};

export const CEO_CHANCE = 0.02;

const base = import.meta.env.BASE_URL;

export const ROLE_IMAGE_MAP: Record<string, string> = {
  HR: `${base}assets/dog-profiles/hr.png`,
  工程師: `${base}assets/dog-profiles/engineering.png`,
  主管: `${base}assets/dog-profiles/manager.png`,
  業務: `${base}assets/dog-profiles/business.png`,
  企劃: `${base}assets/dog-profiles/planning.png`,
  行政: `${base}assets/dog-profiles/admin.png`,
  客服: `${base}assets/dog-profiles/customer-service.png`,
  數據分析: `${base}assets/dog-profiles/data.png`,
  美術: `${base}assets/dog-profiles/design.png`,
  翻譯: `${base}assets/dog-profiles/translation.png`,
  行銷: `${base}assets/dog-profiles/marketing.png`,
  營運: `${base}assets/dog-profiles/operations.png`,
  QA: `${base}assets/dog-profiles/qa.png`,
  PM: `${base}assets/dog-profiles/pm.png`,
  財務: `${base}assets/dog-profiles/finance.png`,
  開發: `${base}assets/dog-profiles/dev.png`,
  CEO: `${base}assets/dog-profiles/ceo.png`,
};
