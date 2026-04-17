---
tags: [mechanic, economy]
---

# Daily Settlement

每天觸發一次，結算收支、更新士氣/營運、處理 PIP、檢查破產。

## 公式

```
# 基礎
revenueBase = Σ(staff.stats.revenue) × 4
productivity = Σ(staff.stats.productivity) + productivityBoost
stability = Σ(staff.stats.stability) + stabilityBoost
moraleGain = Σ(staff.stats.morale)
expense = Σ(staff.expectedSalary) - 財務人數 × 3

# 處罰
scalePenalty = max(0, staff.length - maxStaff) × 4
noManagerPenalty = 主管=0 ? 9 : 0
noOpsPenalty = 營運=0 ? 7 : 0

# 加成
managerMoodBonus = 主管=0 ? 3 : 0
marketingBonus = 行銷人數 × 5
artBoost = 美術人數 × max(1, decor)
translationStability = 翻譯 × 3
opsStability = 營運 × 4
qaStability = QA × 3
pmBoost = PM × 3
ceoBoost = CEO × 10

# 營運加成
operationBonus = round(
  productivity × 1.5
  + (stability + translationStability + opsStability + qaStability + pmBoost) × 1.2
  + trainingBoost
  + marketingBonus
  + artBoost
  + ceoBoost
)

# 最終結算
income = max(0, revenueBase + operationBonus - scalePenalty - round(noManagerPenalty × 0.4))
money += income - max(0, expense)

health += round((productivity + stability + 翻譯+營運+QA 加成) / 2)
       - max(0, staff.length - 6) × 2
       - noManagerPenalty
       - noOpsPenalty

morale += moraleGain
       - max(0, staff.length - 5)
       - (money < 40 ? 4 : 0)
       + managerMoodBonus
       + min(4, 美術人數)
       + ceoBoost

day += 1
trainingBoost = max(0, round(trainingBoost × 0.35))   # 每日衰減
```

## 後續處理

1. 處理所有 [[PIP System|PIP]] 員工：`pipDaysLeft--`、累積 `pipScore`
2. 檢查 [[Bankruptcy|破產條件]]
3. 處理 [[Vacancy Period|人才荒期]] 倒數
4. 處理候選人耐心倒數（超時自動離開）
5. 加日誌

## 相關

- [[Game Loop]]
- [[Roles Overview]] — 職業加成細節
- [[Bankruptcy]]
