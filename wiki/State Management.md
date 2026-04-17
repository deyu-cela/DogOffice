---
tags: [tech]
---

# State Management

Zustand 雙 store 設計：`gameStore`（主狀態）+ `walkerStore`（[[Walker System|動畫狀態]]）。

## 為什麼分兩個

[[Walker System|Walker 動畫]] 每幀都 tick，若放在 `gameStore` 會導致所有訂閱者頻繁 re-render。分開後：
- `gameStore`：遊戲邏輯更動才觸發，頻率低
- `walkerStore`：高頻更新但只有 `WalkingDogs` 元件訂閱

## gameStore 狀態欄位

| 欄位 | 用途 |
|------|------|
| `day` | 當前日 |
| `money` / `morale` / `health` / `decor` | 四大指標 |
| `productivityBoost` / `stabilityBoost` / `trainingBoost` | [[Shop Items\|商店]] 與 [[Mini Games/Training\|培訓]] 累加的加成 |
| `officeLevel` | 當前 [[Office Levels]] index |
| `staff` | 員工陣列 |
| `queue` / `current` / `candidatePatience` | [[Candidate Generation\|候選人]] |
| `vacancy` / `vacancyTimer` | [[Vacancy Period]] |
| `activeChemistry` | 已觸發的 [[Chemistry System\|化學反應]] |
| `miniGame` / `trainingSession` / `staffActionModal` | 各種 overlay |
| `showSplash` / `tutorialStep` | 初始流程 |
| `bankrupt` | [[Bankruptcy]] 旗標 |
| `activeTab` | 右欄 shop/staff 頁籤 |
| `speedMultiplier` / `dayElapsed` | [[Game Loop]] |
| `toast` | 目前顯示的 toast 訊息 |
| `log` | 日誌陣列（最多 18 條） |

## 規範

### 禁止用 object selector

```tsx
// ❌ 每次 render 建新 object，觸發無限 re-render
const { a, b } = useGameStore(s => ({ a: s.a, b: s.b }));

// ✅ 多個單值 selector
const a = useGameStore(s => s.a);
const b = useGameStore(s => s.b);
```

### 避免 tick 過度阻擋

`tick()` 不應該因小事暫停（原版不會）。只在這些情況 return：
- `bankrupt` / `showSplash` / 小遊戲 / 培訓 / 教學中

### Immutable 更新

```ts
// ❌ 直接 mutate state
state.staff.push(dog);

// ✅ spread 出新陣列
set({ staff: [...state.staff, dog] });
```

### 跨狀態更新用純函數

像 [[Daily Settlement]] 的 `runAdvanceDay(state) → newState` 放在 store 檔頂端，不依賴閉包，易測試。

## 相關

- [[Architecture]]
- [[Game Loop]]
