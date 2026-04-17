---
tags: [mechanic, minigame]
---

# 翻牌記憶

60 秒翻牌記憶遊戲，提升士氣。

## 觸發

由 `openPlayMiniGame()` 50% 機率開啟。需要員工 >= 3。

## 規則

- 8 種 emoji × 2 = 16 張卡牌，隨機排列
- `🐕 🐩 🐶 🐺 🐾 🦴 🥏 🧀`
- 一次最多翻 2 張
- 相同 → 保持翻開並標記 matched
- 不同 → 0.8 秒後翻回
- 湊齊 8 對 → 0.3 秒後結束

## 結算

```
bonus = matches >= 8 ? 15 : matches × 2
moraleGain = 8 + bonus
morale += moraleGain (clamp 0-100)
money -= 10
```

## 相關

- `src/features/minigames/MemoryGame.tsx`
- `src/store/gameStore.ts` 的 `memoryTick`、`flipMemoryCard`
- [[Frisbee]]
