---
tags: [mechanic, minigame]
---

# 培訓問答

答題賺產能加成。需要員工 >= 2。

## 規則

1. 從 100 題題庫 (`TRAINING_QUESTIONS`) 隨機抽 5 題
2. 每題 3 選項，答對得 `reward`（6-9 分不等）
3. 作答後秀結果（綠/紅高亮），再下一題
4. 5 題做完可完成或結束

## 結算

```
gain = round(totalReward × 0.8)
healthGain = max(4, round(totalReward × 0.35))

trainingBoost += gain               # 每日衰減 ×0.35
health += healthGain (clamp 0-100)
money -= 18
```

## trainingBoost 的衰減

在 [[Daily Settlement]] 結算完當日 operationBonus 後：

```
trainingBoost = max(0, round(trainingBoost × 0.35))
```

→ 連續培訓效果會疊加但每天只保留 35%，鼓勵定期做。

## 相關

- `src/features/minigames/TrainingQuiz.tsx`
- `src/constants/questions.ts` 的 `TRAINING_QUESTIONS`
