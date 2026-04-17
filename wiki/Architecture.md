---
tags: [tech]
---

# Architecture

Feature-based 資料夾結構 + Zustand 全域狀態。

## 資料夾

```
src/
├── App.tsx                 # 3 欄響應式 grid
├── main.tsx                # entry
├── index.css               # Tailwind + CSS vars + keyframes
├── types/index.ts          # Dog, GameState, Walker, MiniGame 型別
├── constants/              # 遊戲資料（職業、化學反應、辦公室、商店、問題）
├── lib/
│   ├── utils.ts            # rand, clamp, textLevel, companyStage, companyHint
│   └── candidateGen.ts     # generateCandidate, ensureQueueLength
├── store/
│   ├── gameStore.ts        # 主狀態 + actions
│   └── walkerStore.ts      # [[Walker System]]
├── hooks/
│   └── useGameLoop.ts      # requestAnimationFrame 主迴圈
├── components/             # 跨 feature UI：Panel, Meter, RadarChart, Toast
└── features/               # 依功能分類
    ├── splash/             # 開始畫面
    ├── tutorial/           # [[Tutorial Flow]]
    ├── hud/                # StatPanel, DayTimer
    ├── recruit/            # ResumeCard
    ├── office/             # OfficeScene, WalkingDogs
    ├── shop/               # ShopPanel
    ├── staff/              # StaffList, StaffActionModal
    ├── log/                # GameLog
    └── minigames/          # [[Mini Games/Frisbee]], [[Mini Games/Memory]], [[Mini Games/Training]]
```

## 資料流

```
使用者動作 → action (gameStore) → setState → React 重新渲染
         ↓
      每幀 useGameLoop → tick(dt) → 可能觸發 advanceDay
```

## 關鍵原則

- **Feature-based** 分資料夾，不用 by-type
- **Immutable** 狀態更新（一律 spread）
- **Hooks over class**：沒有 class component
- **No mutations**：[[Daily Settlement]] 這種複雜邏輯用純函數，回傳新 state

## 相關

- [[Tech Stack]]
- [[State Management]]
- [[Deployment]]
