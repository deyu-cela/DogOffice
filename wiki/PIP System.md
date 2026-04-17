---
tags: [mechanic]
---

# PIP System

員工改善計畫（Performance Improvement Plan）。

## 流程

1. 點員工卡開啟 `StaffActionModal`
2. 按「⚠️ 進入 PIP」：
   - `status = 'pip'`, `pipDaysLeft = 3`, `pipScore = 0`
   - 隨機抽 3 個 PIP 任務
   - 士氣 -4
3. 每日結算時 PIP 員工：
   - `pipDaysLeft -= 1`
   - `pipScore += productivity + stability + (morale > 0 ? 1 : 0)`
   - 到 0 天時 log 通知
4. 玩家再點員工卡決定：
   - **✅ 留任**：狀態回 active，士氣 +2
   - **資遣**：扣 `severance` 錢、士氣 -6、移除該員工、清除相關 [[Chemistry System|化學反應]] key、移除 [[Walker System|walker]]

## PIP 任務

從以下 5 個隨機抽 3 個：

- 完成 1 次與 {職業} 有關的改善會議
- 提交 1 份 {職業} 改進紀錄
- 讓主管確認本週表現是否進步
- 完成 1 項跨部門協作任務
- 撰寫個人改善計畫書

玩家可自行勾選（純 UI，不影響數值）。

## 相關

- `src/features/staff/StaffActionModal.tsx`
- [[Chemistry System]]
