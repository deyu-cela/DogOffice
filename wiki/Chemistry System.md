---
tags: [mechanic, role]
---

# Chemistry System

職業搭配會產生化學反應，好組合讓公司更強，差組合則拖後腿。

## 觸發

當新員工被 [[錄用]] 時，呼叫 `applyChemistry(newDog)`：

1. 遍歷 `CHEMISTRY_COMBOS`
2. 檢查新員工職業 + 既有員工是否符合 combo
3. 符合且未曾觸發過（避免重複）→ 套用效果 + 顯示 toast

## 效果套用

```
morale += combo.bonus.morale
health += combo.bonus.stability
money += combo.bonus.revenue × 5
productivityBoost += combo.bonus.productivity
```

## 正面組合

| 組合 | 效果 |
|------|------|
| [[Roles/Engineer\|工程師]] + [[Roles/QA\|QA]] | 穩定+3, 士氣-1 |
| [[Roles/Sales\|業務]] + [[Roles/Marketing\|行銷]] | 收入+4, 穩定-1 |
| [[Roles/Manager\|主管]] + [[Roles/Operations\|營運]] | 穩定+5, 士氣+2 |
| [[Roles/Planner\|企劃]] + [[Roles/Artist\|美術]] | 士氣+3, 收入+2 |
| [[Roles/HR\|HR]] + [[Roles/Support\|客服]] | 士氣+4, 穩定+2 |
| [[Roles/PM\|PM]] + [[Roles/Developer\|開發]] | 產能+4, 穩定+2 |
| [[Roles/Data\|數據分析]] + [[Roles/Finance\|財務]] | 收入+3, 穩定+2 |
| [[Roles/Translator\|翻譯]] + [[Roles/Sales\|業務]] | 收入+3, 士氣+1 |

## 負面組合

| 組合 | 效果 |
|------|------|
| [[Roles/Planner\|企劃]] + [[Roles/Operations\|營運]] | 穩定-3, 士氣-2 |
| [[Roles/Engineer\|工程師]] + [[Roles/Sales\|業務]] | 士氣-2, 穩定-1 |
| [[Roles/QA\|QA]] + [[Roles/Planner\|企劃]] | 士氣-2, 產能-1 |

## 資遣的影響

[[PIP System|資遣員工]] 時，`activeChemistry` 會移除所有包含該員工職業的 combo key。下次這個組合重新成立時，可以再次觸發。

## 相關

- [[Roles Overview]]
- [[Daily Settlement]]
