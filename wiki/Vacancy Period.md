---
tags: [mechanic]
---

# Vacancy Period

人才荒期——偶爾沒有狗狗來面試的窘境。

## 觸發

在 [[Candidate Generation#補位邏輯 refillCurrent|refillCurrent()]] 中，當 `current` 為空且非空窗期：
- **10% 機率** 進入空窗期
- `vacancyTimer = 1 + random(2)`（1-2 天）

## 持續

- [[Game Loop|計時器]] 繼續推進（不暫停）
- UI 顯示：`ResumeCard` 顯示 😴 人才荒期卡片，顯示剩餘天數
- 「錄用 / 婉拒」按鈕 disabled
- 玩家只能做：[[Mini Games/Training|培訓]]、買 [[Shop Items|道具]]、[[Office Levels|升級辦公室]]

## 結束

每日結算時：

```
if (vacancy) {
  vacancyTimer -= 1
  if (vacancyTimer <= 0) {
    vacancy = false
    current = queue.shift()
    candidatePatience = current.patience
    log('新的候選狗狗終於來了！')
  }
}
```

## 設計意圖

讓玩家不會一直只盯著履歷卡片按鈕，偶爾被迫去做別的事（培訓、買道具、升級）。

## 相關

- [[Candidate Generation]]
- [[Game Loop]]
