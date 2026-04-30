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
  stats: [number, number, number, number], // speed, quality, teamwork, charisma
  flavor: string,
): RosterEntry => ({
  rosterId, name, breed, role, industry, grade,
  stats: { speed: stats[0], quality: stats[1], teamwork: stats[2], charisma: stats[3] },
  flavor,
});

// 數值預算（每 grade 四維大致範圍）：
//   D: 12~16  C: 18~22  B: 24~28  A: 30~34  S: 36~40  U: 50
// 各產業偏向：tech=speed/quality、design=quality/charisma、marketing=charisma/speed、service=teamwork/quality

export const DOG_ROSTER: RosterEntry[] = [
  // ===== TECH 工程（D6 + C4 + B3 + A2 + S1 = 16）=====
  mk('tech-D-1', '汪程', '柴犬', '工程師', 'tech', 'D', [4, 4, 2, 2], '剛畢業的菜鳥工程'),
  mk('tech-D-2', '咬咬', '哈士奇', '工程師', 'tech', 'D', [5, 3, 2, 2], '熱衷半夜寫 code'),
  mk('tech-D-3', '小汪迪', '柯基', '工程師', 'tech', 'D', [3, 4, 3, 2], '腳短卻打字超快'),
  mk('tech-D-4', '抓蟲俠', '雪納瑞', 'QA', 'tech', 'D', [3, 5, 2, 2], '只想找 bug 的 QA'),
  mk('tech-D-5', '回報王', '貴賓', 'QA', 'tech', 'D', [3, 4, 3, 3], '每天回報 3 顆 bug'),
  mk('tech-D-6', '測試醬', '比熊', 'QA', 'tech', 'D', [4, 4, 2, 3], '剛轉職進 QA 的萌新'),
  mk('tech-C-1', '邊界', '邊境牧羊犬', '工程師', 'tech', 'C', [6, 6, 4, 3], '愛重構的邏輯狂'),
  mk('tech-C-2', 'Push', '黃金獵犬', '工程師', 'tech', 'C', [7, 5, 4, 4], '一天能 push 50 commit'),
  mk('tech-C-3', '雷射眼', '臘腸', 'QA', 'tech', 'C', [5, 7, 4, 3], '一眼看穿 race condition'),
  mk('tech-C-4', '泡牢', '阿拉斯加', 'QA', 'tech', 'C', [5, 6, 5, 4], '永遠在泡 QA log'),
  mk('tech-B-1', '主架構', '德國牧羊犬', '工程師', 'tech', 'B', [8, 8, 5, 5], '第一次當 tech lead'),
  mk('tech-B-2', '跑得快', '惠比特', '工程師', 'tech', 'B', [9, 7, 5, 5], 'optimize 之神'),
  mk('tech-B-3', '炸測試', '杜賓', 'QA', 'tech', 'B', [7, 9, 6, 5], '專業壓力測試員'),
  mk('tech-A-1', 'Senior 阿', '羅威那', '工程師', 'tech', 'A', [10, 10, 6, 6], 'Senior 工程，年薪天花板'),
  mk('tech-A-2', '解 bug 專家', '伯恩山犬', 'QA', 'tech', 'A', [8, 11, 7, 7], '從沒漏過一個 bug'),
  mk('tech-S-1', 'CTO 望', '大白熊', '工程師', 'tech', 'S', [12, 13, 8, 8], '傳說中的 CTO 候選'),

  // ===== DESIGN 美術（16）=====
  mk('design-D-1', '塗塗', '比熊', '美術', 'design', 'D', [3, 4, 2, 4], '剛學 Photoshop 的萌新'),
  mk('design-D-2', '畫個圈', '蝴蝶犬', '美術', 'design', 'D', [3, 5, 2, 3], '只會畫圓的設計菜鳥'),
  mk('design-D-3', '色色', '馬爾濟斯', '美術', 'design', 'D', [3, 4, 3, 4], '配色品味奇特'),
  mk('design-D-4', '想點子', '柴犬', '企劃', 'design', 'D', [3, 4, 3, 4], '愛開無厘頭腦力激盪'),
  mk('design-D-5', '寫文案', '柯基', '企劃', 'design', 'D', [3, 5, 2, 4], '靈感很多但執行慢'),
  mk('design-D-6', '小規劃', '巴哥', '企劃', 'design', 'D', [4, 4, 3, 3], '最愛開會的菜鳥企劃'),
  mk('design-C-1', '畫工', '貴賓', '美術', 'design', 'C', [5, 6, 4, 5], '能交圖也能改稿'),
  mk('design-C-2', 'UI 君', '雪納瑞', '美術', 'design', 'C', [4, 7, 4, 5], 'UI/UX 雙修'),
  mk('design-C-3', '案企', '哈士奇', '企劃', 'design', 'C', [5, 6, 4, 5], '一週寫得出五份提案'),
  mk('design-C-4', '腦動', '邊境牧羊犬', '企劃', 'design', 'C', [4, 7, 5, 4], '腦洞很大但做事細'),
  mk('design-B-1', '接圖王', '黃金獵犬', '美術', 'design', 'B', [6, 8, 5, 6], '已能獨立接案'),
  mk('design-B-2', '視覺嘉', '臘腸', '美術', 'design', 'B', [6, 9, 5, 5], '視覺系設計師'),
  mk('design-B-3', '提案大師', '伯恩山犬', '企劃', 'design', 'B', [6, 8, 6, 6], '提案命中率 80%'),
  mk('design-A-1', 'Art 總監', '阿富汗獵犬', '美術', 'design', 'A', [8, 11, 7, 6], '視覺總監等級'),
  mk('design-A-2', '產品總企', '邊境牧羊犬', '企劃', 'design', 'A', [7, 10, 8, 7], '產品線總企劃'),
  mk('design-S-1', '設計神', '薩摩耶', '美術', 'design', 'S', [10, 13, 8, 9], '一筆畫出國際金獎'),

  // ===== MARKETING 行銷（16）=====
  mk('mkt-D-1', '推銷', '巴哥', '業務', 'marketing', 'D', [4, 3, 2, 4], '剛拿到 KPI 的菜鳥業務'),
  mk('mkt-D-2', '電話狂', '吉娃娃', '業務', 'marketing', 'D', [5, 2, 2, 4], '一天打 100 通電話'),
  mk('mkt-D-3', '名片汪', '比熊', '業務', 'marketing', 'D', [4, 3, 3, 4], '名片發完馬上跑'),
  mk('mkt-D-4', '貼文小', '柯基', '行銷', 'marketing', 'D', [4, 3, 2, 4], '會發 IG 貼文的小編'),
  mk('mkt-D-5', '社群醬', '波士頓㹴', '行銷', 'marketing', 'D', [4, 3, 3, 4], '熱衷追熱門 hashtag'),
  mk('mkt-D-6', '廣告嬰', '蝴蝶犬', '行銷', 'marketing', 'D', [3, 4, 2, 5], '只會下 FB 廣告的萌新'),
  mk('mkt-C-1', '案件獵', '哈士奇', '業務', 'marketing', 'C', [6, 4, 4, 6], '能接到大客戶'),
  mk('mkt-C-2', '人脈廣', '黃金獵犬', '業務', 'marketing', 'C', [5, 5, 5, 6], '誰都認識誰'),
  mk('mkt-C-3', '創意小編', '雪納瑞', '行銷', 'marketing', 'C', [5, 5, 4, 7], '梗圖一發即爆'),
  mk('mkt-C-4', '品牌妹', '貴賓', '行銷', 'marketing', 'C', [4, 6, 4, 7], '愛談品牌精神'),
  mk('mkt-B-1', '簽約王', '德國牧羊犬', '業務', 'marketing', 'B', [7, 6, 5, 8], '簽約一支獨秀'),
  mk('mkt-B-2', '代理人', '杜賓', '業務', 'marketing', 'B', [8, 5, 5, 8], '代理談判一級棒'),
  mk('mkt-B-3', '行銷腦', '邊境牧羊犬', '行銷', 'marketing', 'B', [6, 7, 6, 8], 'campaign 規劃高手'),
  mk('mkt-A-1', '頂尖業務', '羅威那', '業務', 'marketing', 'A', [9, 7, 7, 10], '一個月成交 10 案'),
  mk('mkt-A-2', '品牌總監', '英國牧羊犬', '行銷', 'marketing', 'A', [7, 9, 7, 11], '品牌總監級'),
  mk('mkt-S-1', 'CMO 行銷魔王', '阿拉斯加', '行銷', 'marketing', 'S', [9, 10, 9, 13], 'CMO 等級的魔人'),

  // ===== SERVICE 客服（16）=====
  mk('svc-D-1', '接電話', '馬爾濟斯', '客服', 'service', 'D', [3, 4, 4, 3], '剛上線的菜鳥客服'),
  mk('svc-D-2', '微笑姐', '吉娃娃', '客服', 'service', 'D', [3, 4, 5, 3], '永遠保持微笑'),
  mk('svc-D-3', '回信君', '蝴蝶犬', '客服', 'service', 'D', [4, 3, 4, 4], '一天回 50 封信'),
  mk('svc-D-4', '罐頭模板', '比熊', '客服', 'service', 'D', [3, 4, 4, 4], '只會發罐頭回覆'),
  mk('svc-D-5', '客訴小', '巴哥', '客服', 'service', 'D', [3, 3, 5, 4], '專處理客訴的菜鳥'),
  mk('svc-D-6', '陪聊弟', '柴犬', '客服', 'service', 'D', [3, 4, 4, 4], '什麼都聽，什麼都聊'),
  mk('svc-C-1', '客戶心', '黃金獵犬', '客服', 'service', 'C', [4, 5, 7, 5], '懂客戶情緒'),
  mk('svc-C-2', '溫柔派', '柯基', '客服', 'service', 'C', [4, 6, 7, 4], '永遠輕聲細語'),
  mk('svc-C-3', '快速應', '惠比特', '客服', 'service', 'C', [6, 5, 6, 4], '回應速度 No.1'),
  mk('svc-C-4', '雙語客服', '貴賓', '客服', 'service', 'C', [4, 6, 6, 5], '中英文 hotline'),
  mk('svc-B-1', '客戶專屬', '伯恩山犬', '客服', 'service', 'B', [5, 7, 9, 6], 'VIP 專屬客服'),
  mk('svc-B-2', 'Helpdesk 王', '英國牧羊犬', '客服', 'service', 'B', [6, 7, 8, 6], 'Helpdesk 老兵'),
  mk('svc-B-3', '糾紛調解', '德國牧羊犬', '客服', 'service', 'B', [5, 8, 9, 5], '調解客戶大戰'),
  mk('svc-A-1', '客服經理', '伯恩山犬', '客服', 'service', 'A', [6, 9, 11, 7], '管理整個客服部'),
  mk('svc-A-2', 'CRM 大師', '邊境牧羊犬', '客服', 'service', 'A', [7, 9, 10, 7], 'CRM 系統一手包'),
  mk('svc-S-1', 'CXO 客服女王', '大白熊', '客服', 'service', 'S', [8, 11, 13, 9], '客戶體驗女王'),

  // ===== U 全能型（1 隻，CEO 等級，跨產業通用）=====
  mk('u-1', 'CEO 汪汪', '柴犬', 'CEO', 'tech', 'U', [13, 13, 12, 12], '傳說中的全能 CEO，每個產業都能扛'),
];

// rosterId → entry 快查
export const ROSTER_BY_ID: Map<string, RosterEntry> = new Map(
  DOG_ROSTER.map((e) => [e.rosterId, e]),
);

export const ROSTER_TOTAL = DOG_ROSTER.length;
