import type { HintId } from '@/types';

export type AnchorId =
  | 'hr-building'
  | 'dorm-building'
  | 'shop-building'
  | 'gacha-pull'
  | 'achievement-button'
  | 'leaderboard-button'
  | 'construction-dog'
  | 'team-close'
  | 'recruit-close'
  | 'first-task'
  | 'starter-pack';

export type Bubble = {
  title: string;
  body: string; // 支援 <b>、<br/>
  tip?: string;
};

// 步號對應（含 welcome）
export const STEP_WELCOME = 1;
export const STEP_BUILDINGS = 2;
export const STEP_GACHA = 3;
export const STEP_CLOSE_GACHA = 4;
export const STEP_DORM = 5;
export const STEP_FATIGUE = 6;
export const STEP_CLOSE_TEAM = 7;

export type TutorialStepConfig =
  | {
      step: typeof STEP_WELCOME | typeof STEP_FATIGUE;
      mode: 'modal';
      bubble: Bubble;
      diagram?: 'fatigue-stats';
    }
  | {
      step: typeof STEP_BUILDINGS;
      mode: 'spotlight-multi';
      slides: Array<{ anchor: AnchorId; bubble: Bubble }>;
    }
  | {
      step:
        | typeof STEP_GACHA
        | typeof STEP_CLOSE_GACHA
        | typeof STEP_DORM
        | typeof STEP_CLOSE_TEAM;
      mode: 'spotlight-gate';
      anchor: AnchorId;
      bubble: Bubble;
      // gate 由對應 store action 內呼叫 completeTutorialGate(step)
    };

export const TUTORIAL_CONFIG: TutorialStepConfig[] = [
  {
    step: STEP_WELCOME,
    mode: 'modal',
    bubble: {
      title: '歡迎來到帕托邦！',
      body:
        '汪汪～我是你的<b>新手教練</b>！<br/>' +
        '在你正式開張之前，先帶你認識一下公司的基本玩法。<br/>' +
        '只要 5 步就學完，跟我來吧～',
      tip: '隨時可以按左下角「跳過教學」',
    },
  },
  {
    step: STEP_BUILDINGS,
    mode: 'spotlight-multi',
    slides: [
      {
        anchor: 'hr-building',
        bubble: {
          title: '人資辦公室',
          body: '這裡可以<b>抽卡招募</b>新狗狗，組成你的員工陣容。',
          tip: '抽到的狗會自動加入對應產業隊伍',
        },
      },
      {
        anchor: 'dorm-building',
        bubble: {
          title: '員工宿舍',
          body: '管理你的<b>員工陣容</b>：分配 4 個產業隊伍、查看狀態、調整人選。',
          tip: '隊伍只要有人就會自動接同產業案件，不用滿',
        },
      },
      {
        anchor: 'shop-building',
        bubble: {
          title: '商店',
          body: '在這裡<b>升級辦公室</b>、購買設施與裝飾。<br/>擴建後可解鎖更多隊伍位與造型。',
          tip: '擴建是長期目標',
        },
      },
    ],
  },
  {
    step: STEP_GACHA,
    mode: 'spotlight-gate',
    anchor: 'gacha-pull',
    bubble: {
      title: '先抽一張試試',
      body: '按<b>「招募 1 次」</b>抽出你的第一隻員工！<br/>抽到後會自動分到對應產業隊伍。',
      tip: '不同等級的狗能力不同，慢慢蒐集',
    },
  },
  {
    step: STEP_CLOSE_GACHA,
    mode: 'spotlight-gate',
    anchor: 'recruit-close',
    bubble: {
      title: '關閉招募視窗',
      body: '看完抽卡結果後，按右上角的 <b>X</b> 關閉招募視窗，繼續下一步！',
    },
  },
  {
    step: STEP_DORM,
    mode: 'spotlight-gate',
    anchor: 'dorm-building',
    bubble: {
      title: '看看你的隊伍',
      body:
        '點<b>員工宿舍</b>查看 4 個產業隊伍。<br/>' +
        '只要該產業<b>隊伍裡有人</b>，系統就會自動接同類型的案件。<br/>不用排滿，先有就會動工。',
      tip: '隨時可手動調整人選',
    },
  },
  {
    step: STEP_FATIGUE,
    mode: 'modal',
    bubble: {
      title: '員工三大數值',
      body:
        '每隻狗有<b>速度</b>、<b>專業</b>、<b>耐心</b>三項數值。<br/>' +
        '・<b>速度</b>：推進案件的快慢<br/>' +
        '・<b>專業</b>：完成品質與獎勵<br/>' +
        '・<b>耐心</b>：抗疲勞能力<br/><br/>' +
        '工作會累積<b>疲勞</b>，過勞會無法接案。記得用<b>休息區</b>或玩遊戲幫他們恢復！',
      tip: '剩下的就交給你了，加油！',
    },
    diagram: 'fatigue-stats',
  },
  {
    step: STEP_CLOSE_TEAM,
    mode: 'spotlight-gate',
    anchor: 'team-close',
    bubble: {
      title: '關閉隊伍視窗',
      body: '按右上角的 <b>X</b> 關閉隊伍視窗，正式開始經營！',
    },
  },
];

// 觸發式提示可選 anchor：有 anchor 時走 spotlight 樣式（暗化遮罩 + 圈圈），否則置中浮卡
export const HINT_ANCHORS: Partial<Record<HintId, AnchorId>> = {
  achievement: 'achievement-button',
  leaderboard: 'leaderboard-button',
  expand: 'construction-dog',
  'first-task': 'first-task',
  'starter-pack': 'starter-pack',
};

export const HINT_CONTENT: Record<HintId, Bubble> = {
  expand: {
    title: '解鎖：辦公室擴建',
    body:
      '商店裡有<b>擴建</b>選項，可以升級辦公室等級。<br/>擴建後解鎖更多隊伍人數、新案件 tier、與專屬辦公室造型。',
    tip: '擴建需要先完成特殊任務',
  },
  toy: {
    title: '狗狗玩具區',
    body:
      '這裡是<b>工具庫存</b>，收集到的玩具都放這。<br/>' +
      '新玩具會<b>自動裝備</b>給員工，提升速度或專業。<br/>' +
      '想換裝備時，<b>點員工卡片</b>就能更換。',
    tip: '每隻狗一次裝一個，不同等級加成不同',
  },
  achievement: {
    title: '解鎖：成就',
    body:
      '達成特定條件會<b>解鎖成就</b>並送獎勵金。<br/>右上角的成就頁可以查看全部成就與紀念 CG。',
    tip: '繼續經營會解鎖更多',
  },
  leaderboard: {
    title: '挑戰排行榜',
    body:
      '你的公司可以<b>提交到全球排行榜</b>！<br/>看你能撐多少天、多少員工、多少資金，挑戰最強狗狗老闆。',
    tip: '隨時可從右上角提交紀錄',
  },
  'first-task': {
    title: '任務牆來囉！',
    body:
      '剛剛組好的隊伍幫你接到<b>第一個案件</b>，貼在牆上。<br/>點任務便利貼可以看詳情、進度，跟隊伍配置。',
    tip: '隊伍會自動推進案件，定期回辦公室看看進度',
  },
  'starter-pack': {
    title: '別忘了領禮包',
    body:
      '左下角有<b>新手禮包</b>等你領取！<br/>裡面有起手資金和一隻 CEO 級狗狗。<br/>點一下開啟並按「領取」吧～',
    tip: '領完才能開始經營',
  },
  'special-task': {
    title: '辦公室擴建說明',
    body:
      '擴建到下一階需要兩個條件：<br/>' +
      '・<b>完成特殊任務</b>：派隊伍累積指定能力值<br/>' +
      '・<b>備齊必要設施</b>：先在商店買齊指定家具<br/><br/>' +
      '兩個都達成才能花錢升級，等級越高員工上限與案件 tier 越高！',
    tip: '可隨時打開來看進度',
  },
  'ready-to-start': {
    title: '準備好了嗎？',
    body:
      '基本玩法都教完啦！<br/>剩下的就是你的舞台——招募狗狗、組隊接案、賺錢擴建，看你能把公司經營成什麼樣！',
    tip: '汪汪加油！',
  },
};

// 觸發式提示的主按鈕文案（不在這裡指定的預設用「下一步」）
export const HINT_PRIMARY_LABEL: Partial<Record<HintId, string>> = {
  'ready-to-start': '開始經營！',
};
