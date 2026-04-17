---
tags: [mechanic, tech]
---

# Game Loop

主迴圈由 `useGameLoop` hook 驅動 `requestAnimationFrame`。

## 每幀工作

1. `walkerStore.tick(morale, health)` — 更新員工位置
2. `gameStore.tick(dt)` — 累加 dayElapsed
3. 若有小遊戲進行中：`frisbeeTick(dt)` 或 `memoryTick(dt)`

## 日期推進

```
BASE_DAY_MS = 7000ms
每幀：dayElapsed += dt × speedMultiplier
當 dayElapsed >= 7000：
  觸發 advanceDay（見 [[Daily Settlement]]）
  dayElapsed = 0
```

## 計時器暫停條件

以下情況 `tick` 直接 return，不推進：

- [[Bankruptcy|破產]]
- splash 未按「開始經營」
- 教學進行中（step 1-6）
- 小遊戲開啟中
- 培訓問答開啟中

> ⚠️ **不要**因 `candidateReaction` 或 `staffActionModal` 阻擋，原版不會（[[State Management#避免 tick 過度阻擋]]）。

## 相關

- [[Architecture]]
- [[Candidate Generation]]
