---
tags: [ui, tech]
---

# Walker System

辦公室內員工走來走去的動畫系統，獨立於 [[State Management|主遊戲狀態]]。

## Store：`walkerStore`

```ts
{
  walkers: Walker[]     // 每隻員工的位置/目標
  bounds: RoomBounds    // 房間尺寸（由 OfficeScene 量測注入）
}
```

## Walker 結構

```ts
{
  id, x, y, targetX, targetY,
  speed,                    // 0.35 ~ 0.80
  idleTimer,                // 大於 0 時停在原地數 frame
  facingRight,              // 決定 img scaleX
  dogData                   // 對應 Dog 物件
}
```

## 動畫邏輯（每幀）

1. `speedPenalty = morale < 35 || health < 35 ? 0.55 : 1`
2. 若 `idleTimer > 0`：idleTimer-- 並跳過
3. 計算到目標距離：
   - 距離 < 4：抵達 → 重新抽新目標，`idleTimer = 35 + random(80)`
   - 否則按方向向量移動 × `speed × speedPenalty`
4. 更新 `facingRight`

## 同步 `syncWithStaff(staff)`

OfficeScene 監聽 `staff` 陣列變化，呼叫：
- 移除 staff 中不存在的 walker（被 [[PIP System|資遣]] 或破產清空）
- 補上 staff 中還沒有對應 walker 的新員工

## 視覺狀態

員工頭頂會浮現 emoji：
- `💤` — 士氣 < 40 或 營運 < 35
- `✨` — 士氣 >= 60 且 營運 >= 55
- `😵` — 營運 < 45

## 相關

- `src/store/walkerStore.ts`
- `src/features/office/WalkingDogs.tsx`
- `src/features/office/OfficeScene.tsx`
