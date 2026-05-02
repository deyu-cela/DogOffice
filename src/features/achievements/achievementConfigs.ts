import type { Dog, GameState } from '@/types';
import { OFFICE_LEVELS } from '@/constants/officeLevels';

const BASE = `${import.meta.env.BASE_URL}assets/achievements/`;

export type AchievementEvent =
  | 'game_start'
  | 'hire'
  | 'day_end'
  | 'office_upgrade'
  | 'retroactive';

export type AchievementCheckPayload = {
  dog?: Dog;
  prevStaffCount?: number;
};

export type Achievement = {
  id: string;
  title: string;
  storyBlurb: string;
  hint: string;
  cgPath: string;
  triggerEvents: AchievementEvent[];
  check: (state: GameState, payload?: AchievementCheckPayload) => boolean;
};

export const ACHIEVEMENT_MONEY_GOAL = 100_000;
export const ACHIEVEMENT_PROJECTS_GOAL = 10;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'founded',
    title: '創立汪德遊戲',
    storyBlurb:
      '貝力辭掉文件傳遞犬的工作，租下最便宜的地下室，掛上「汪德遊戲」的招牌。從現在起，這群狗狗要為了快樂而流汗。',
    hint: '按下「開始經營」開啟你的狗狗公司。',
    cgPath: `${BASE}founded.png`,
    triggerEvents: ['game_start', 'retroactive'],
    check: (state) => state.day >= 1 && !state.bankrupt,
  },
  {
    id: 'first_hire',
    title: '第一位夥伴',
    storyBlurb:
      '第一隻員工狗加入了汪德遊戲。地下室突然不再那麼冷清，貝力第一次覺得創業好像沒那麼孤單。',
    hint: '招到第一隻狗狗員工。',
    cgPath: `${BASE}first_hire.png`,
    triggerEvents: ['hire', 'retroactive'],
    check: (state, payload) => {
      if (payload && typeof payload.prevStaffCount === 'number') {
        return payload.prevStaffCount === 0 && state.staff.length >= 1;
      }
      return state.staff.length >= 1;
    },
  },
  {
    id: 'border_collie',
    title: '完美主義者上線',
    storyBlurb:
      '邊境牧羊犬連夜把全公司的代碼重寫了一遍。隔天大家上班發現自己的工作被做完了，只好集體去午睡。',
    hint: '招到一隻邊境牧羊犬。',
    cgPath: `${BASE}border_collie.png`,
    triggerEvents: ['hire', 'retroactive'],
    check: (state, payload) => {
      if (payload?.dog) return payload.dog.breed === '邊境牧羊犬';
      return state.staff.some((d) => d.breed === '邊境牧羊犬');
    },
  },
  {
    id: 'schnauzer_qa',
    title: 'Bug 獵人上線',
    storyBlurb:
      '雪納瑞 QA 發現了一個 Bug，全公司集體圍著螢幕對它狂吠，試圖把 Bug 趕出來。貝力決定：在數位世界，我們要用邏輯取代吠叫。',
    hint: '招到一隻雪納瑞。',
    cgPath: `${BASE}schnauzer_qa.png`,
    triggerEvents: ['hire', 'retroactive'],
    check: (state, payload) => {
      if (payload?.dog) return payload.dog.breed === '雪納瑞';
      return state.staff.some((d) => d.breed === '雪納瑞');
    },
  },
  {
    id: 'golden_pr',
    title: '公關小災難',
    storyBlurb:
      '黃金獵犬太熱情了，舔了貓咪評論家的臉。負評寫得很尷尬：「員工過於失禮，但遊戲意外地好玩。」',
    hint: '招到一隻黃金獵犬。',
    cgPath: `${BASE}golden_pr.png`,
    triggerEvents: ['hire', 'retroactive'],
    check: (state, payload) => {
      if (payload?.dog) return payload.dog.breed === '黃金獵犬';
      return state.staff.some((d) => d.breed === '黃金獵犬');
    },
  },
  {
    id: 'shiba_treasure',
    title: '消失的隨身碟',
    storyBlurb:
      '柴犬把存有重要備份的隨身碟當成戰利品，埋到後花園的樹下。幾個小土堆下還有襪子、骨頭、玩具⋯',
    hint: '招到一隻柴犬。',
    cgPath: `${BASE}shiba_treasure.png`,
    triggerEvents: ['hire', 'retroactive'],
    check: (state, payload) => {
      if (payload?.dog) return payload.dog.breed === '柴犬';
      return state.staff.some((d) => d.breed === '柴犬');
    },
  },
  {
    id: 'farewell_basement',
    title: '告別地下室',
    storyBlurb:
      '營運上軌道了。狗狗們抬著辦公桌、紙箱、盆栽搬進中型辦公室，第一次看到陽光從窗戶透進來。',
    hint: '把辦公室升級到「中型辦公室」。',
    cgPath: `${BASE}farewell_basement.png`,
    triggerEvents: ['office_upgrade', 'retroactive'],
    check: (state) => state.officeLevel >= 2,
  },
  {
    id: 'chasing_shadow',
    title: '追逐影子大爆紅',
    storyBlurb:
      '汪德遊戲的首款作品紅遍帕特邦。連高傲的豹子都偷偷下單，貝力站在發表會台上聽全場歡呼。',
    hint: `累積完成 ${ACHIEVEMENT_PROJECTS_GOAL} 個案件。`,
    cgPath: `${BASE}chasing_shadow.png`,
    triggerEvents: ['day_end', 'retroactive'],
    check: (state) => state.projectsCompleted >= ACHIEVEMENT_PROJECTS_GOAL,
  },
  {
    id: 'million_woof',
    title: '拒絕收購',
    storyBlurb:
      '大型動物財團的合約被推回桌的另一端。貝力微笑著搖頭：「我們不賣，因為我們才剛開始玩。」',
    hint: `公司資金累積到 $${ACHIEVEMENT_MONEY_GOAL.toLocaleString()}。`,
    cgPath: `${BASE}million_woof.png`,
    triggerEvents: ['day_end', 'retroactive'],
    check: (state) => state.money >= ACHIEVEMENT_MONEY_GOAL,
  },
  {
    id: 'forced_play_day',
    title: '強制玩耍日',
    storyBlurb:
      '汪德遊戲升上豪華總部那天傍晚，門口貼著一張公告：「今日目標已達成，所有員工強制去公園玩耍。」',
    hint: '辦公室升級到豪華總部。',
    cgPath: `${BASE}forced_play_day.png`,
    triggerEvents: ['day_end', 'retroactive'],
    check: (state) => state.officeLevel >= OFFICE_LEVELS.length - 1,
  },
];

export const ACHIEVEMENT_BY_ID: Record<string, Achievement> = ACHIEVEMENTS.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, Achievement>,
);
