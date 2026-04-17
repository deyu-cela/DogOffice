import { create } from 'zustand';
import type { Dog, GameState, PipTask, ShopItemEffectKey, TrainingSession } from '@/types';
import { CHEMISTRY_COMBOS } from '@/constants/chemistryCombo';
import { OFFICE_LEVELS } from '@/constants/officeLevels';
import { TRAINING_QUESTIONS } from '@/constants/questions';
import { SHOP_ITEMS } from '@/constants/shopItems';
import { clamp, nextTreatId, rand } from '@/lib/utils';
import { ensureQueueLength, generateCandidate } from '@/lib/candidateGen';

const initialQueue = [generateCandidate(), generateCandidate(), generateCandidate()];

type Actions = {
  startGame: () => void;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  setSpeed: (s: number) => void;
  tick: (dt: number) => void;

  hireCandidate: () => void;
  rejectCandidate: () => void;

  buyShopItem: (id: ShopItemEffectKey) => void;
  upgradeOffice: () => void;

  openStaffAction: (index: number) => void;
  closeStaffAction: () => void;
  startPip: (index: number) => void;
  togglePipTask: (index: number, taskIndex: number) => void;
  keepStaff: (index: number) => void;
  fireStaff: (index: number) => void;

  openFrisbee: () => void;
  openMemory: () => void;
  openPlayMiniGame: () => void;
  closeMiniGame: () => void;
  frisbeeTick: (dt: number) => void;
  setFrisbeeDir: (dir: number) => void;
  finishFrisbee: (endedEarly?: boolean) => void;
  memoryTick: (dt: number) => void;
  flipMemoryCard: (id: number) => void;
  finishMemory: () => void;

  openTraining: () => void;
  answerTraining: (optionIndex: number) => void;
  nextTrainingQuestion: () => void;
  closeTraining: () => void;

  setActiveTab: (tab: 'shop' | 'staff') => void;
  restart: () => void;
  dismissToast: () => void;
};

export type GameStore = GameState & Actions;

const initialState: GameState = {
  day: 1,
  money: 300,
  morale: 58,
  health: 55,
  decor: 1,
  productivityBoost: 0,
  stabilityBoost: 0,
  trainingBoost: 0,
  officeLevel: 0,
  staff: [],
  staffActionModal: null,
  queue: initialQueue.slice(1),
  current: initialQueue[0],
  candidatePatience: initialQueue[0].patience,
  log: [{ day: 1, msg: '公司剛開張，等著第一位狗狗同事。' }],
  miniGame: null,
  trainingSession: null,
  candidateReaction: null,
  showSplash: true,
  tutorialStep: 0,
  vacancy: false,
  vacancyTimer: 0,
  activeChemistry: [],
  bankrupt: false,
  activeTab: 'shop',
  speedMultiplier: 1,
  dayElapsed: 0,
  toast: null,
};

function refillCurrent(state: GameState): GameState {
  let queue = ensureQueueLength(state.queue);
  let current = state.current;
  let candidatePatience = state.candidatePatience;
  let vacancy = state.vacancy;
  let vacancyTimer = state.vacancyTimer;
  let log = state.log;
  if (!current && !vacancy) {
    if (Math.random() < 0.1) {
      vacancy = true;
      vacancyTimer = 1 + Math.floor(Math.random() * 2);
      const entry = [...log, { day: state.day, msg: '😴 目前沒有狗狗來面試...' }];
      if (entry.length > 18) entry.splice(0, entry.length - 18);
      log = entry;
    } else {
      const [first, ...rest] = queue;
      if (first) {
        current = first;
        queue = ensureQueueLength(rest);
        candidatePatience = first.patience;
      }
    }
  }
  return { ...state, queue, current, candidatePatience, vacancy, vacancyTimer, log };
}

function pushLog(state: GameState, msg: string): GameState {
  const next = [...state.log, { day: state.day, msg }];
  if (next.length > 18) next.splice(0, next.length - 18);
  return { ...state, log: next };
}

function applyChemistry(state: GameState, newDog: Dog): { state: GameState; toast: GameState['toast'] } {
  const existingRoles = new Set(state.staff.map((d) => d.role));
  let s = state;
  let toast: GameState['toast'] = null;
  for (const combo of CHEMISTRY_COMBOS) {
    const [r1, r2] = combo.roles;
    if ((newDog.role === r1 && existingRoles.has(r2)) || (newDog.role === r2 && existingRoles.has(r1))) {
      const key = [...combo.roles].sort().join('+');
      if (!s.activeChemistry.find((e) => e.key === key)) {
        s = {
          ...s,
          activeChemistry: [...s.activeChemistry, { key, combo }],
          morale: clamp(s.morale + (combo.bonus.morale ?? 0), 0, 100),
          health: clamp(s.health + (combo.bonus.stability ?? 0), 0, 100),
          money: s.money + (combo.bonus.revenue ?? 0) * 5,
          productivityBoost: s.productivityBoost + (combo.bonus.productivity ?? 0),
        };
        toast = { msg: combo.msg, type: combo.type };
      }
    }
  }
  return { state: s, toast };
}

function maxStaff(state: GameState): number {
  return OFFICE_LEVELS[state.officeLevel].maxStaff;
}

function atCapacity(state: GameState): boolean {
  return state.staff.length >= maxStaff(state);
}

function hasOverlayOpen(state: GameState): boolean {
  return !!state.miniGame || !!state.trainingSession || (state.tutorialStep > 0 && state.tutorialStep < 7);
}

function runAdvanceDay(prev: GameState): GameState {
  let s = { ...prev };
  const roleCounts: Record<string, number> = {};
  s.staff.forEach((d) => {
    roleCounts[d.role] = (roleCounts[d.role] ?? 0) + 1;
  });

  const revenueBase = s.staff.reduce((n, d) => n + d.stats.revenue, 0) * 4;
  const productivity = s.staff.reduce((n, d) => n + d.stats.productivity, 0) + s.productivityBoost;
  const stability = s.staff.reduce((n, d) => n + d.stats.stability, 0) + s.stabilityBoost;
  const moraleGain = s.staff.reduce((n, d) => n + d.stats.morale, 0);
  const expense = s.staff.reduce((n, d) => n + d.expectedSalary, 0) - (roleCounts['財務'] ?? 0) * 3;
  const scalePenalty = Math.max(0, s.staff.length - maxStaff(s)) * 4;
  const noManagerPenalty = (roleCounts['主管'] ?? 0) === 0 ? 9 : 0;
  const noOpsPenalty = (roleCounts['營運'] ?? 0) === 0 ? 7 : 0;
  const managerMoodBonus = (roleCounts['主管'] ?? 0) === 0 ? 3 : 0;
  const marketingBonus = (roleCounts['行銷'] ?? 0) * 5;
  const artBoost = (roleCounts['美術'] ?? 0) * Math.max(1, s.decor);
  const translationStability = (roleCounts['翻譯'] ?? 0) * 3;
  const opsStability = (roleCounts['營運'] ?? 0) * 4;
  const qaStability = (roleCounts['QA'] ?? 0) * 3;
  const pmBoost = (roleCounts['PM'] ?? 0) * 3;
  const ceoBoost = (roleCounts['CEO'] ?? 0) * 10;
  const operationBonus = Math.round(
    productivity * 1.5 +
      (stability + translationStability + opsStability + qaStability + pmBoost) * 1.2 +
      s.trainingBoost +
      marketingBonus +
      artBoost +
      ceoBoost,
  );
  const income = Math.max(0, revenueBase + operationBonus - scalePenalty - Math.round(noManagerPenalty * 0.4));
  s.money = s.money + income - Math.max(0, expense);
  s.health = clamp(
    s.health +
      Math.round((productivity + stability + translationStability + opsStability + qaStability) / 2) -
      Math.max(0, s.staff.length - 6) * 2 -
      noManagerPenalty -
      noOpsPenalty,
    0,
    100,
  );
  s.morale = clamp(
    s.morale +
      moraleGain -
      Math.max(0, s.staff.length - 5) -
      (s.money < 40 ? 4 : 0) +
      managerMoodBonus +
      Math.min(4, roleCounts['美術'] ?? 0) +
      ceoBoost,
    0,
    100,
  );

  s.day += 1;
  s.trainingBoost = Math.max(0, Math.round(s.trainingBoost * 0.35));

  // PIP
  s.staff = s.staff.map((dog) => {
    if (dog.status !== 'pip') return dog;
    const pipDaysLeft = Math.max(0, (dog.pipDaysLeft ?? 0) - 1);
    const pipScore = (dog.pipScore ?? 0) + dog.stats.productivity + dog.stats.stability + (dog.stats.morale > 0 ? 1 : 0);
    const endedMsg = pipDaysLeft === 0 ? `${dog.name} 的 PIP 結束了，可以決定留任或資遣。` : null;
    if (endedMsg) s = pushLog(s, endedMsg);
    return { ...dog, pipDaysLeft, pipScore };
  });

  if ((roleCounts['主管'] ?? 0) === 0 && s.staff.length >= 2) s = pushLog(s, '公司沒有主管，營運容易混亂。');
  if ((roleCounts['營運'] ?? 0) === 0 && s.staff.length >= 3) s = pushLog(s, '缺少營運狗狗，流程卡卡的。');

  if (s.money <= 0 && s.staff.length > 0 && s.day > 5) {
    s.money = 0;
    s.morale = clamp(s.morale - 15, 0, 100);
    if (s.health <= 10 && s.morale <= 15) {
      s.bankrupt = true;
      return s;
    }
    s = pushLog(s, '⚠️ 資金見底了！再撐不住就要破產了！');
  } else if (s.money <= 0) {
    s.money = 0;
    s.morale = clamp(s.morale - 8, 0, 100);
    s = pushLog(s, '資金見底了，大家看起來有點不安。');
  }

  if (s.vacancy) {
    s.vacancyTimer -= 1;
    if (s.vacancyTimer <= 0) {
      s.vacancy = false;
      const [first, ...rest] = s.queue;
      if (first) {
        s.current = first;
        s.queue = rest;
        s.candidatePatience = first.patience;
        s = pushLog(s, '新的候選狗狗終於來了！');
      }
    }
  }

  if (s.current) {
    s.candidatePatience -= 1;
    if (s.candidatePatience <= 0) {
      const leavingName = s.current.name;
      s = pushLog(s, `${leavingName} 等太久了，不耐煩走掉了！`);
      s.toast = { msg: `😤 ${leavingName} 等太久了走掉了！`, type: 'negative' };
      s.current = null;
      s = refillCurrent(s);
    }
  } else {
    s = refillCurrent(s);
  }

  if (s.staff.length > 0) {
    s = pushLog(s, `本日結算：收入 $${income}，支出 $${Math.max(0, expense)}，淨變動 $${income - Math.max(0, expense)}`);
  } else {
    s = pushLog(s, '今天還沒有正式員工，辦公室很安靜。');
  }
  return s;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: () => set({ showSplash: false, tutorialStep: 1 }),
  advanceTutorial: () => set((s) => ({ tutorialStep: s.tutorialStep + 1 })),
  skipTutorial: () => set({ tutorialStep: 7 }),
  setSpeed: (speedMultiplier) => set({ speedMultiplier }),

  tick: (dt) => {
    const s = get();
    if (s.bankrupt || s.showSplash) return;
    if (hasOverlayOpen(s)) return;
    const BASE_DAY_MS = 7000;
    const newElapsed = s.dayElapsed + dt * s.speedMultiplier;
    if (newElapsed >= BASE_DAY_MS) {
      const next = runAdvanceDay({ ...s, dayElapsed: 0 });
      set(next as Partial<GameStore>);
    } else {
      set({ dayElapsed: newElapsed });
    }
  },

  dismissToast: () => set({ toast: null }),

  hireCandidate: () => {
    const s = get();
    if (!s.current || atCapacity(s)) return;
    const dog: Dog = {
      ...s.current,
      status: 'active',
      pipDaysLeft: 0,
      pipScore: 0,
      pipTasks: [],
      severance: Math.max(18, s.current.expectedSalary * 2),
    };
    let next: GameState = {
      ...s,
      staff: [...s.staff, dog],
      money: Math.max(0, s.money - dog.expectedSalary * 2),
      morale: clamp(s.morale + dog.stats.morale * 2, 0, 100),
      health: clamp(s.health + dog.stats.productivity + Math.max(0, dog.stats.stability), 0, 100),
      toast: { msg: `🥹💼✨ ${dog.name} 開心得尾巴狂搖，加入公司！`, type: 'positive' },
      current: null,
    };
    const chem = applyChemistry(next, dog);
    next = chem.state;
    if (chem.toast) next.toast = chem.toast;
    next = pushLog(
      next,
      dog.isCEO
        ? `🎉🎉🎉 傳說中的 CEO ${dog.name} 加入了！全公司都沸騰了！`
        : `錄用了 ${dog.name}（${dog.breed} ${dog.role} ${dog.grade}級），${dog.flavor}`,
    );
    next = refillCurrent(next);
    set(next as Partial<GameStore>);
  },

  rejectCandidate: () => {
    const s = get();
    if (!s.current) return;
    const dog = s.current;
    let next: GameState = {
      ...s,
      toast: { msg: `🥺📄 ${dog.name} 有點可惜地收起履歷，默默離開了。`, type: 'negative' },
      current: null,
    };
    next = pushLog(next, `婉拒了 ${dog.name}，下一位！`);
    next = refillCurrent(next);
    set(next as Partial<GameStore>);
  },

  buyShopItem: (id) => {
    const item = SHOP_ITEMS.find((i) => i.id === id);
    if (!item) return;
    const s = get();
    if (s.money < item.cost) return;
    let next: GameState = { ...s, money: s.money - item.cost };
    switch (id) {
      case 'snack':
        next.morale = clamp(next.morale + 10, 0, 100);
        next = pushLog(next, '買了高級零食，大家尾巴搖更快了。');
        break;
      case 'toy':
        next.morale = clamp(next.morale + 12, 0, 100);
        next.decor += 1;
        next = pushLog(next, '玩具區啟用，辦公室更有活力了。');
        break;
      case 'desk':
        next.productivityBoost += 1;
        next = pushLog(next, '新辦公桌到了，設備更專業。');
        break;
      case 'policy':
        next.stabilityBoost += 1;
        next = pushLog(next, '團隊流程更清楚，犯錯率降低。');
        break;
      case 'lamp':
        next.decor += 1;
        next.morale = clamp(next.morale + 6, 0, 100);
        next = pushLog(next, '新吊燈裝上了，整間辦公室可愛很多。');
        break;
      case 'sofa':
        next.decor += 2;
        next.morale = clamp(next.morale + 8, 0, 100);
        next.health = clamp(next.health + 4, 0, 100);
        next = pushLog(next, '休息區升級後，狗狗們看起來放鬆多了。');
        break;
      case 'artwall':
        next.decor += 2;
        next.morale = clamp(next.morale + 4, 0, 100);
        next.productivityBoost += 1;
        next = pushLog(next, '展示牆完成，整體氣氛更像新創公司了。');
        break;
      case 'coffee':
        next.productivityBoost += 1;
        next.morale = clamp(next.morale + 5, 0, 100);
        next = pushLog(next, '咖啡機上線了，效率跟心情都變好。');
        break;
      case 'gym':
        next.stabilityBoost += 2;
        next.morale = clamp(next.morale + 6, 0, 100);
        next.health = clamp(next.health + 3, 0, 100);
        next = pushLog(next, '健身區開放了，狗狗們精神抖擻！');
        break;
    }
    set(next as Partial<GameStore>);
  },

  upgradeOffice: () => {
    const s = get();
    const nextLevel = s.officeLevel + 1;
    if (nextLevel >= OFFICE_LEVELS.length) return;
    const cost = OFFICE_LEVELS[nextLevel].upgradeCost;
    if (s.money < cost) return;
    let next: GameState = { ...s, officeLevel: nextLevel, money: s.money - cost };
    next = pushLog(next, `辦公室升級為「${OFFICE_LEVELS[nextLevel].name}」！`);
    set(next as Partial<GameStore>);
  },

  openStaffAction: (index) => set({ staffActionModal: { staffIndex: index } }),
  closeStaffAction: () => set({ staffActionModal: null }),

  startPip: (index) => {
    const s = get();
    const dog = s.staff[index];
    if (!dog || dog.status === 'pip') return;
    const tasks: PipTask[] = [
      `完成 1 次與 ${dog.role} 有關的改善會議`,
      `提交 1 份${dog.role}改進紀錄`,
      `讓主管確認本週表現是否進步`,
      `完成 1 項跨部門協作任務`,
      `撰寫個人改善計畫書`,
    ]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((text) => ({ text, done: false }));
    const newStaff = [...s.staff];
    newStaff[index] = { ...dog, status: 'pip', pipDaysLeft: 3, pipScore: 0, pipTasks: tasks };
    let next: GameState = { ...s, staff: newStaff, morale: clamp(s.morale - 4, 0, 100) };
    next = pushLog(next, `⚠️ ${dog.name} 進入 PIP 改善流程（3天觀察期），需完成改善任務。`);
    set(next as Partial<GameStore>);
  },

  togglePipTask: (index, taskIndex) => {
    const s = get();
    const dog = s.staff[index];
    if (!dog || dog.status !== 'pip' || !dog.pipTasks?.[taskIndex]) return;
    const tasks = dog.pipTasks.map((t, i) => (i === taskIndex ? { ...t, done: !t.done } : t));
    const newStaff = [...s.staff];
    newStaff[index] = { ...dog, pipTasks: tasks };
    set({ staff: newStaff });
  },

  keepStaff: (index) => {
    const s = get();
    const dog = s.staff[index];
    if (!dog) return;
    const newStaff = [...s.staff];
    newStaff[index] = { ...dog, status: 'active', pipDaysLeft: 0, pipScore: 0, pipTasks: [] };
    let next: GameState = { ...s, staff: newStaff, staffActionModal: null, morale: clamp(s.morale + 2, 0, 100) };
    next = pushLog(next, `✅ ${dog.name} 通過 PIP，決定留任。`);
    set(next as Partial<GameStore>);
  },

  fireStaff: (index) => {
    const s = get();
    const dog = s.staff[index];
    if (!dog) return;
    const newStaff = s.staff.filter((_, i) => i !== index);
    let next: GameState = {
      ...s,
      staff: newStaff,
      money: Math.max(0, s.money - dog.severance),
      morale: clamp(s.morale - 6, 0, 100),
      activeChemistry: s.activeChemistry.filter((e) => !e.key.includes(dog.role)),
      staffActionModal: null,
    };
    next = pushLog(next, `${dog.name} 完成資遣，支付 $${dog.severance}。`);
    set(next as Partial<GameStore>);
  },

  openPlayMiniGame: () => {
    const s = get();
    if (s.miniGame || s.trainingSession) return;
    const pick = rand(['frisbee', 'memory']);
    if (pick === 'memory') get().openMemory();
    else get().openFrisbee();
  },
  openFrisbee: () =>
    set({
      miniGame: {
        type: 'frisbee',
        timeLeft: 30,
        score: 0,
        treats: [],
        dogX: 50,
        spawnTick: 0,
        running: true,
        moveDir: 0,
      },
    }),
  openMemory: () => {
    const emojis = ['🐕', '🐩', '🐶', '🐺', '🐾', '🦴', '🥏', '🧀'];
    const cards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
    set({
      miniGame: {
        type: 'memory',
        cards,
        flippedIds: [],
        matches: 0,
        moves: 0,
        running: true,
        timeLeft: 60,
      },
    });
  },
  closeMiniGame: () => set({ miniGame: null }),

  frisbeeTick: (dt) => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'frisbee' || !s.miniGame.running) return;
    const mg = { ...s.miniGame };
    mg.timeLeft = Math.max(0, mg.timeLeft - dt);
    mg.spawnTick += dt;
    mg.dogX = clamp(mg.dogX + mg.moveDir * dt * 42, 6, 94);
    let treats = mg.treats.map((t) => ({ ...t, y: t.y + t.speed * dt }));
    let score = mg.score;
    treats = treats.filter((t) => {
      const hit = Math.abs(t.x - mg.dogX) < 10 && t.y > 72 && t.y < 90;
      if (hit) score += t.pts;
      return t.y < 104 && !hit;
    });
    if (mg.spawnTick > 0.65) {
      mg.spawnTick = 0;
      const emojis = ['🥏', '🦴', '🍖', '🧀', '⭐'];
      const e = rand(emojis);
      const pts = e === '⭐' ? 3 : e === '🥏' ? 2 : 1;
      treats.push({ id: nextTreatId(), x: 10 + Math.random() * 80, y: -8, speed: 18 + Math.random() * 20, emoji: e, pts });
    }
    mg.treats = treats;
    mg.score = score;
    set({ miniGame: mg });
    if (mg.timeLeft <= 0) get().finishFrisbee();
  },

  setFrisbeeDir: (dir) => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'frisbee') return;
    set({ miniGame: { ...s.miniGame, moveDir: dir } });
  },

  finishFrisbee: (endedEarly = false) => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'frisbee') return;
    const score = s.miniGame.score;
    const moraleGain = 6 + Math.min(14, score);
    let next: GameState = {
      ...s,
      miniGame: null,
      morale: clamp(s.morale + moraleGain, 0, 100),
      money: Math.max(0, s.money - 10),
    };
    next = pushLog(
      next,
      endedEarly ? `提早結束陪玩，得 ${score} 分，士氣 +${moraleGain}。` : `陪玩結束！得 ${score} 分，士氣 +${moraleGain}。`,
    );
    set(next as Partial<GameStore>);
  },

  memoryTick: (dt) => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'memory' || !s.miniGame.running) return;
    const timeLeft = Math.max(0, s.miniGame.timeLeft - dt);
    set({ miniGame: { ...s.miniGame, timeLeft } });
    if (timeLeft <= 0) get().finishMemory();
  },

  flipMemoryCard: (id) => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'memory' || !s.miniGame.running) return;
    const mg = s.miniGame;
    const card = mg.cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched || mg.flippedIds.length >= 2) return;
    const cards = mg.cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    const flippedIds = [...mg.flippedIds, id];
    let moves = mg.moves + 1;
    let matches = mg.matches;

    if (flippedIds.length === 2) {
      const [aId, bId] = flippedIds;
      const a = cards.find((c) => c.id === aId)!;
      const b = cards.find((c) => c.id === bId)!;
      if (a.emoji === b.emoji) {
        const matchedCards = cards.map((c) => (c.id === aId || c.id === bId ? { ...c, matched: true } : c));
        matches += 1;
        set({ miniGame: { ...mg, cards: matchedCards, flippedIds: [], matches, moves } });
        if (matches >= 8) setTimeout(() => get().finishMemory(), 300);
      } else {
        set({ miniGame: { ...mg, cards, flippedIds, moves } });
        setTimeout(() => {
          const cur = get().miniGame;
          if (!cur || cur.type !== 'memory') return;
          const reset = cur.cards.map((c) => (c.id === aId || c.id === bId ? { ...c, flipped: false } : c));
          set({ miniGame: { ...cur, cards: reset, flippedIds: [] } });
        }, 800);
      }
    } else {
      set({ miniGame: { ...mg, cards, flippedIds, moves } });
    }
  },

  finishMemory: () => {
    const s = get();
    if (!s.miniGame || s.miniGame.type !== 'memory') return;
    const mg = s.miniGame;
    const bonus = mg.matches >= 8 ? 15 : Math.round(mg.matches * 2);
    const moraleGain = 8 + bonus;
    let next: GameState = {
      ...s,
      miniGame: null,
      morale: clamp(s.morale + moraleGain, 0, 100),
      money: Math.max(0, s.money - 10),
    };
    next = pushLog(next, `翻牌遊戲結束！配對 ${mg.matches}/8，${mg.moves} 步，士氣 +${moraleGain}。`);
    set(next as Partial<GameStore>);
  },

  openTraining: () => {
    const s = get();
    if (s.trainingSession || s.miniGame || s.staffActionModal) return;
    const questions = [...TRAINING_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    const ts: TrainingSession = {
      question: questions[0],
      selected: null,
      correct: null,
      totalReward: 0,
      questionIndex: 0,
      maxQuestions: questions.length,
      finished: false,
    };
    // attach questions into trainingSession via closure on module-level map
    trainingBank.set('current', questions);
    set({ trainingSession: ts });
  },

  answerTraining: (optionIndex) => {
    const s = get();
    if (!s.trainingSession || s.trainingSession.finished) return;
    const bank = trainingBank.get('current')!;
    const q = bank[s.trainingSession.questionIndex];
    const correct = optionIndex === q.answer;
    const totalReward = s.trainingSession.totalReward + (correct ? q.reward : 0);
    set({
      trainingSession: {
        ...s.trainingSession,
        selected: optionIndex,
        correct,
        totalReward,
      },
    });
  },

  nextTrainingQuestion: () => {
    const s = get();
    if (!s.trainingSession) return;
    const bank = trainingBank.get('current')!;
    const ts = s.trainingSession;
    if (ts.questionIndex >= ts.maxQuestions - 1) {
      const gain = Math.round(ts.totalReward * 0.8);
      const healthGain = Math.max(4, Math.round(ts.totalReward * 0.35));
      let next: GameState = {
        ...s,
        trainingBoost: s.trainingBoost + gain,
        health: clamp(s.health + healthGain, 0, 100),
        money: Math.max(0, s.money - 18),
        trainingSession: { ...ts, finished: true },
      };
      next = pushLog(next, `培訓完成，問答 ${ts.totalReward} 分，產能加成 +${gain}（每日衰減型）`);
      set(next as Partial<GameStore>);
    } else {
      const nextIndex = ts.questionIndex + 1;
      set({
        trainingSession: {
          ...ts,
          questionIndex: nextIndex,
          question: bank[nextIndex],
          selected: null,
          correct: null,
        },
      });
    }
  },

  closeTraining: () => set({ trainingSession: null }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  restart: () => {
    const fresh = [generateCandidate(), generateCandidate(), generateCandidate()];
    set({
      ...initialState,
      queue: fresh.slice(1),
      current: fresh[0],
      candidatePatience: fresh[0].patience,
      log: [{ day: 1, msg: '公司剛開張，等著第一位狗狗同事。' }],
      showSplash: false,
      tutorialStep: 7,
    });
  },
}));

const trainingBank = new Map<string, typeof TRAINING_QUESTIONS>();
