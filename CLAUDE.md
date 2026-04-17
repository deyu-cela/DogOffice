# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Language

所有回覆一律使用繁體中文。

## Project

**DogOffice 狗狗公司** — 可愛又療癒的狗狗公司經營小遊戲。玩家扮演狗狗老闆，招募 16 種職業的狗狗員工，管理公司營運、士氣與資金。

- 部署：https://deyu-cela.github.io/DogOffice/
- 原始單檔備份：`game-original.html`（2062 行 vanilla HTML+JS，重構的參考來源）

## Tech Stack

| 類別 | 版本 |
|------|------|
| Vite | 7 |
| React | 19 |
| TypeScript | 6 |
| Zustand | 5 |
| Tailwind CSS | 4 |
| vite-plugin-pwa | 1.2（Vite 8 尚未支援，所以鎖 7） |

## Commands

```bash
npm run dev         # 開發伺服器
npm run build       # tsc -b + vite build（產出 dist/）
npm run preview     # 預覽 build 結果
```

部署：push 到 `main` 觸發 `.github/workflows/deploy.yml`，自動建置推 GitHub Pages。

## Architecture

Feature-based 結構，Zustand 管全域狀態：

```
src/
├── App.tsx                 # 3 欄 grid（響應式：手機單欄 / 平板 2 欄 / 桌機 3 欄）
├── types/                  # Dog, GameState, Walker, MiniGame 等型別
├── constants/              # DOG_ROLES, CHEMISTRY_COMBOS, OFFICE_LEVELS, SHOP_ITEMS, 問題庫
├── lib/
│   ├── utils.ts            # rand, clamp, textLevel, companyStage, companyHint
│   └── candidateGen.ts     # generateCandidate, ensureQueueLength
├── store/
│   ├── gameStore.ts        # 主遊戲狀態 + actions（hire/reject/advanceDay/mini-games/...）
│   └── walkerStore.ts      # 辦公室 walker 動畫狀態
├── hooks/
│   └── useGameLoop.ts      # requestAnimationFrame 主迴圈
├── components/             # 跨 feature 共用：Panel, Meter, RadarChart, Toast
└── features/
    ├── splash/             # 開始畫面
    ├── tutorial/           # 6 步教學
    ├── hud/                # 左欄：狀態、日期計時
    ├── recruit/            # 候選人履歷卡
    ├── office/             # 辦公室場景 + walker
    ├── shop/               # 商店列表（擴建放第一項）
    ├── staff/              # 員工列表 + PIP 管理 modal
    ├── log/                # 日誌
    └── minigames/          # 飛盤、翻牌、培訓問答
```

## 關鍵規則

### Zustand Selector

**禁止用 object selector**（會觸發無限 re-render）：

```tsx
// ❌ 會爆
const { a, b } = useGameStore(s => ({ a: s.a, b: s.b }));

// ✅ 多個單值 selector
const a = useGameStore(s => s.a);
const b = useGameStore(s => s.b);
```

### 狀態更新

Store action 內一律用 immutable spread，不要直接 mutate：

```ts
// ❌
state.staff.push(dog);

// ✅
set({ staff: [...state.staff, dog] });
```

### 補位邏輯

`hireCandidate` / `rejectCandidate` / 面試超時 / 每日結算都要呼叫 `refillCurrent()`：
- 補齊 queue 到 3 人
- 若 `current` 為空且非空窗期 → 從 queue 取下一位
- 10% 機率進入空窗期（1-2 天）

### 計時器阻擋

`tick()` 只在這些情況停止推進：`bankrupt` / `showSplash` / 小遊戲 / 培訓 / 教學中。
**不要** 因 `candidateReaction` 或 `staffActionModal` 阻擋（原版行為）。

## 遊戲規格詳情

- [詳細機制與公式](docs/game-spec.md)
- [重構計畫](../../.claude/plans/plan-libs-luminous-rabbit.md)（僅供歷史參考）

## 資產

- `public/assets/dog-profiles/*.png` — 17 個職業大頭貼（含 CEO 彩蛋）
- `public/assets/start-screen.png` — 開始畫面背景
- 載入路徑：`${import.meta.env.BASE_URL}assets/...`（會自動處理 `/DogOffice/` prefix）

## 常見任務

- **加新職業**：編輯 `src/constants/dogRoles.ts` 的 `DOG_ROLES` 並補 `ROLE_IMAGE_MAP`；若要化學反應，也編 `src/constants/chemistryCombo.ts`。
- **改結算公式**：`src/store/gameStore.ts` 的 `runAdvanceDay()`。
- **加商店物品**：`src/constants/shopItems.ts` 加 item（要先擴 `ShopItemEffectKey` 型別），並在 `gameStore.ts` 的 `buyShopItem` switch 補 case。
- **調 UI 佈局**：`src/App.tsx` 的 `.app-grid` media query。
- **加小遊戲**：在 `features/minigames/` 新增元件、`gameStore` 加 action、`useGameLoop` 配合驅動。
