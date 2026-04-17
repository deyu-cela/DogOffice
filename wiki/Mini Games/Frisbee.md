---
tags: [mechanic, minigame]
---

# 飛盤接接樂

30 秒接零食小遊戲，提升士氣。

## 觸發

`openPlayMiniGame()` 時，50% 機率開這個（另 50% 是 [[Memory|翻牌]]）。需要員工 >= 3。

## 規則

- 用 ← → 或 A/D 移動狗狗
- 每 0.65 秒從頂部生一個零食
- 零食表：

| emoji | 分數 |
|-------|------|
| ⭐ | 3 |
| 🥏 | 2 |
| 🦴 🍖 🧀 | 1 |

- 零食落下速度 18-38
- 狗狗 hitbox：`|x - dogX| < 10` 且 `y > 72 && y < 90`

## 結算

```
moraleGain = 6 + min(14, score)
morale += moraleGain (clamp 0-100)
money -= 10
```

提早結束亦可（扣 10、士氣依當下分數）。

## 相關

- `src/features/minigames/FrisbeeGame.tsx`
- `src/store/gameStore.ts` 的 `frisbeeTick`
- [[Memory]]
