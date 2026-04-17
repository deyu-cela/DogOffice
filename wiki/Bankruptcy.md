---
tags: [mechanic]
---

# Bankruptcy

公司破產條件與結算。

## 判定（[[Daily Settlement|每日結算]] 後）

```python
if money <= 0 and staff.length > 0 and day > 5:
    money = 0
    morale -= 15
    if health <= 10 and morale <= 15:
        → BANKRUPT 🐕💔
    else:
        log('⚠️ 資金見底了！再撐不住就要破產了！')

elif money <= 0:
    money = 0
    morale -= 8
    log('資金見底了，大家看起來有點不安。')
```

## 破產畫面

- 全螢幕 overlay
- 顯示撐了幾天、多少員工、最終資金
- 按「重新開始」→ `restart()` 重置狀態回初始

## 設計意圖

- `day > 5` 保護期：前 5 天不會破產，讓新手有緩衝
- 要同時：資金 <= 0 + 營運 <= 10 + 士氣 <= 15 才真破產
- 只有資金見底但營運/士氣還 OK 不會立刻倒

## 相關

- [[Daily Settlement]]
- [[Game Overview]]
