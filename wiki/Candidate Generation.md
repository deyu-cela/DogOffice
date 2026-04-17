---
tags: [mechanic, role]
---

# Candidate Generation

`generateCandidate()` 在 `src/lib/candidateGen.ts`。

## 流程

1. **CEO 彩蛋判定**：2% 機率回傳 [[Roles/CEO|CEO]]（固定 grade=S, statMod=+3, patience=1）
2. **一般候選人**：從 [[Roles Overview|16 種職業]] 隨機選
3. **等級抽籤**：

| 機率 | 等級 | 能力修正 |
|------|------|---------|
| 10% | S | +2 |
| 20% | A | +1 |
| 40% | B | +0 |
| 20% | C | -1 |
| 10% | D | -2 |

4. **能力**：`stat = baseStat + statMod`（clamp -5 ~ 10）
5. **薪資**：
   - 一般：`expectedSalary = 12 + max(0, totalScore) × 3 ± random(5)`
   - CEO：固定 80
   - `severance = expectedSalary × 3`
6. **耐心**：`2 + random(3)` 天（CEO 1 天，因為太稀有）
7. **面試問題**：從 16 題 `INTERVIEW_QUESTIONS` 隨機抽一題

## 補位邏輯 `refillCurrent()`

hire / reject / 超時離開 / 每日結算都會呼叫：

1. `ensureQueueLength(queue, 3)` 補齊候選人池
2. 若 `current` 為空且非 [[Vacancy Period|空窗期]]：
   - **10% 機率** 進入空窗期，1-2 天
   - **90% 機率** 從 queue 取下一位到 `current`，`candidatePatience = dog.patience`

## 相關

- [[Vacancy Period]]
- [[Chemistry System]] — 新人加入時觸發
- [[Roles Overview]]
