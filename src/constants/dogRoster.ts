import type { ProjectCategory, Stats } from '@/types';

export type DogGrade = 'D' | 'C' | 'B' | 'A' | 'S' | 'U';

export type RosterEntry = {
  rosterId: string;
  name: string;
  breed: string;
  role: string;
  industry: ProjectCategory;
  grade: DogGrade;
  stats: Stats;
  flavor: string;
};

// 內部 helper：縮減每筆條目寫法
const mk = (
  rosterId: string,
  name: string,
  breed: string,
  role: string,
  industry: ProjectCategory,
  grade: DogGrade,
  stats: [number, number, number, number], // 舊格式 [speed, quality, teamwork, charisma]；patience 由 teamwork 派生（teamwork × 1.0 clamp 1-10）
  flavor: string,
): RosterEntry => ({
  rosterId, name, breed, role, industry, grade,
  // 從舊 4 stat 遷移為 3 stat：teamwork → patience
  stats: { speed: stats[0], quality: stats[1], patience: Math.max(1, Math.min(10, stats[2])) },
  flavor,
});

// 數值預算（每 grade 四維大致範圍）：
//   D: 12~16  C: 18~22  B: 24~28  A: 30~34  S: 36~40  U: 50
// 各產業偏向：tech=speed/quality、design=quality/charisma、marketing=charisma/speed、service=teamwork/quality

export const DOG_ROSTER: RosterEntry[] = [
  // ===== TECH 工程（D6 + C4 + B3 + A2 + S1 = 16）=====
  mk('tech-D-1', '橘長', '柴犬', '工程師', 'tech', 'D', [4, 4, 2, 2], '剛畢業的菜鳥工程'),
  mk('tech-D-2', '咬咬', '哈士奇', '工程師', 'tech', 'D', [5, 3, 2, 2], '熱衷半夜寫 code'),
  mk('tech-D-3', 'Bug', '柯基', '工程師', 'tech', 'D', [3, 4, 3, 2], '腳短卻打字超快'),
  mk('tech-D-4', 'Steve', '雪納瑞', 'QA', 'tech', 'D', [3, 5, 2, 2], '只想找 bug 的 QA'),
  mk('tech-D-5', 'Howhow', '貴賓', 'QA', 'tech', 'D', [3, 4, 3, 3], '每天回報 3 顆 bug'),
  mk('tech-D-6', '小吉', '比熊', 'QA', 'tech', 'D', [4, 4, 2, 3], '剛轉職進 QA 的萌新'),
  mk('tech-C-1', '魷魚', '邊境牧羊犬', '工程師', 'tech', 'C', [6, 6, 4, 3], '愛重構的邏輯狂'),
  mk('tech-C-2', 'Tony', '黃金獵犬', '工程師', 'tech', 'C', [7, 5, 4, 4], '一天能 push 50 commit'),
  mk('tech-C-3', 'CC', '臘腸', 'QA', 'tech', 'C', [5, 7, 4, 3], '一眼看穿 race condition'),
  mk('tech-C-4', '泡泡', '阿拉斯加', 'QA', 'tech', 'C', [5, 6, 5, 4], '永遠在泡 QA log'),
  mk('tech-B-1', 'Nancy', '德國牧羊犬', '工程師', 'tech', 'B', [8, 8, 5, 5], '第一次當 tech lead'),
  mk('tech-B-2', 'Luke', '惠比特', '工程師', 'tech', 'B', [9, 7, 5, 5], 'optimize 之神'),
  mk('tech-B-3', 'Vivi', '杜賓', 'QA', 'tech', 'B', [7, 9, 6, 5], '專業壓力測試員'),
  mk('tech-A-1', '小得', '羅威那', '工程師', 'tech', 'A', [10, 10, 6, 6], 'Senior 工程，年薪天花板'),
  mk('tech-A-2', '缺缺', '伯恩山犬', 'QA', 'tech', 'A', [8, 11, 7, 7], '從沒漏過一個 bug'),
  mk('tech-S-1', '小蘇', '大白熊', '工程師', 'tech', 'S', [12, 13, 8, 8], '傳說中的 CTO 候選'),

  // ===== DESIGN 美術（16）=====
  mk('design-D-1', '塗塗', '比熊', '美術', 'design', 'D', [3, 4, 2, 4], '剛學 Photoshop 的萌新'),
  mk('design-D-2', '甜甜圈', '蝴蝶犬', '美術', 'design', 'D', [3, 5, 2, 3], '只會畫圓的設計菜鳥'),
  mk('design-D-3', '色色', '馬爾濟斯', '美術', 'design', 'D', [3, 4, 3, 4], '配色品味奇特'),
  mk('design-D-4', '泡芙', '柴犬', '企劃', 'design', 'D', [3, 4, 3, 4], '愛開無厘頭腦力激盪'),
  mk('design-D-5', '舒舒', '柯基', '企劃', 'design', 'D', [3, 5, 2, 4], '靈感很多但執行慢'),
  mk('design-D-6', 'Wish', '巴哥', '企劃', 'design', 'D', [4, 4, 3, 3], '最愛開會的菜鳥企劃'),
  mk('design-C-1', 'Joy', '貴賓', '美術', 'design', 'C', [5, 6, 4, 5], '能交圖也能改稿'),
  mk('design-C-2', '小麥', '雪納瑞', '美術', 'design', 'C', [4, 7, 4, 5], 'UI/UX 雙修'),
  mk('design-C-3', '阿雅', '哈士奇', '企劃', 'design', 'C', [5, 6, 4, 5], '一週寫得出五份提案'),
  mk('design-C-4', '青青', '邊境牧羊犬', '企劃', 'design', 'C', [4, 7, 5, 4], '腦洞很大但做事細'),
  mk('design-B-1', '香蕉', '黃金獵犬', '美術', 'design', 'B', [6, 8, 5, 6], '已能獨立接案'),
  mk('design-B-2', '小玲', '臘腸', '美術', 'design', 'B', [6, 9, 5, 5], '視覺系設計師'),
  mk('design-B-3', 'ㄧ加', '伯恩山犬', '企劃', 'design', 'B', [6, 8, 6, 6], '提案命中率 80%'),
  mk('design-A-1', '小成', '阿富汗獵犬', '美術', 'design', 'A', [8, 11, 7, 6], '視覺總監等級'),
  mk('design-A-2', '恐龍', '邊境牧羊犬', '企劃', 'design', 'A', [7, 10, 8, 7], '產品線總企劃'),
  mk('design-S-1', '嚕比醬', '薩摩耶', '美術', 'design', 'S', [10, 13, 8, 9], '一筆畫出國際金獎'),

  // ===== MARKETING 行銷（16）=====
  mk('mkt-D-1', 'Max', '巴哥', '業務', 'marketing', 'D', [4, 3, 2, 4], '剛拿到 KPI 的菜鳥業務'),
  mk('mkt-D-2', 'Coco', '吉娃娃', '業務', 'marketing', 'D', [5, 2, 2, 4], '一天打 100 通電話'),
  mk('mkt-D-3', '呱呱', '比熊', '業務', 'marketing', 'D', [4, 3, 3, 4], '名片發完馬上跑'),
  mk('mkt-D-4', '貼貼', '柯基', '行銷', 'marketing', 'D', [4, 3, 2, 4], '會發 IG 貼文的小編'),
  mk('mkt-D-5', '宇宙', '波士頓㹴', '行銷', 'marketing', 'D', [4, 3, 3, 4], '熱衷追熱門 hashtag'),
  mk('mkt-D-6', '毛毛', '蝴蝶犬', '行銷', 'marketing', 'D', [3, 4, 2, 5], '只會下 FB 廣告的萌新'),
  mk('mkt-C-1', 'Peeta', '哈士奇', '業務', 'marketing', 'C', [6, 4, 4, 6], '能接到大客戶'),
  mk('mkt-C-2', '桃桃', '黃金獵犬', '業務', 'marketing', 'C', [5, 5, 5, 6], '誰都認識誰'),
  mk('mkt-C-3', '小安', '雪納瑞', '行銷', 'marketing', 'C', [5, 5, 4, 7], '梗圖一發即爆'),
  mk('mkt-C-4', '靜靜', '貴賓', '行銷', 'marketing', 'C', [4, 6, 4, 7], '愛談品牌精神'),
  mk('mkt-B-1', 'KK', '德國牧羊犬', '業務', 'marketing', 'B', [7, 6, 5, 8], '簽約一支獨秀'),
  mk('mkt-B-2', '哼哼', '杜賓', '業務', 'marketing', 'B', [8, 5, 5, 8], '代理談判一級棒'),
  mk('mkt-B-3', '阿瑋', '邊境牧羊犬', '行銷', 'marketing', 'B', [6, 7, 6, 8], 'campaign 規劃高手'),
  mk('mkt-A-1', '蘑菇', '羅威那', '業務', 'marketing', 'A', [9, 7, 7, 10], '一個月成交 10 案'),
  mk('mkt-A-2', '雪莉', '英國牧羊犬', '行銷', 'marketing', 'A', [7, 9, 7, 11], '品牌總監級'),
  mk('mkt-S-1', '七yo', '阿拉斯加', '行銷', 'marketing', 'S', [9, 10, 9, 13], 'CMO 等級的魔人'),

  // ===== SERVICE 客服（16）=====
  mk('svc-D-1', '熙熙', '馬爾濟斯', '客服', 'service', 'D', [3, 4, 4, 3], '剛上線的菜鳥客服'),
  mk('svc-D-2', '笑笑', '吉娃娃', '客服', 'service', 'D', [3, 4, 5, 3], '永遠保持微笑'),
  mk('svc-D-3', '糖糖', '蝴蝶犬', '客服', 'service', 'D', [4, 3, 4, 4], '一天回 50 封信'),
  mk('svc-D-4', '罐頭', '比熊', '客服', 'service', 'D', [3, 4, 4, 4], '只會發罐頭回覆'),
  mk('svc-D-5', '小星', '巴哥', '客服', 'service', 'D', [3, 3, 5, 4], '專處理客訴的菜鳥'),
  mk('svc-D-6', '米米', '柴犬', '客服', 'service', 'D', [3, 4, 4, 4], '什麼都聽，什麼都聊'),
  mk('svc-C-1', '維力', '黃金獵犬', '客服', 'service', 'C', [4, 5, 7, 5], '懂客戶情緒'),
  mk('svc-C-2', '柔柔', '柯基', '客服', 'service', 'C', [4, 6, 7, 4], '永遠輕聲細語'),
  mk('svc-C-3', 'Flash', '惠比特', '客服', 'service', 'C', [6, 5, 6, 4], '回應速度 No.1'),
  mk('svc-C-4', '百變', '貴賓', '客服', 'service', 'C', [4, 6, 6, 5], '中英文 hotline'),
  mk('svc-B-1', 'York', '伯恩山犬', '客服', 'service', 'B', [5, 7, 9, 6], 'VIP 專屬客服'),
  mk('svc-B-2', '魚魚', '英國牧羊犬', '客服', 'service', 'B', [6, 7, 8, 6], 'Helpdesk 老兵'),
  mk('svc-B-3', '典典', '德國牧羊犬', '客服', 'service', 'B', [5, 8, 9, 5], '調解客戶大戰'),
  mk('svc-A-1', '水獺', '伯恩山犬', '客服', 'service', 'A', [6, 9, 11, 7], '管理整個客服部'),
  mk('svc-A-2', 'Yuna', '邊境牧羊犬', '客服', 'service', 'A', [7, 9, 10, 7], 'CRM 系統一手包'),
  mk('svc-S-1', '露西亞', '大白熊', '客服', 'service', 'S', [8, 11, 13, 9], '客戶體驗女王'),

  // ===== U 全能型（1 隻，CEO 等級，跨產業通用）=====
  mk('u-1', '刀霸翎', '鬆獅犬', 'CEO', 'tech', 'U', [13, 13, 12, 12], '傳說中的全能 CEO，每個產業都能扛'),
];

// rosterId → entry 快查
export const ROSTER_BY_ID: Map<string, RosterEntry> = new Map(
  DOG_ROSTER.map((e) => [e.rosterId, e]),
);

export const ROSTER_TOTAL = DOG_ROSTER.length;
