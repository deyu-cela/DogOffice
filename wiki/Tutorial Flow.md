---
tags: [ui, mechanic]
---

# Tutorial Flow

6 步新手教學，在 splash「開始經營」後啟動。

## 步驟

| # | 狗狗 | 標題 | 重點 |
|---|------|------|------|
| 1 | 🐕 | 歡迎來到狗狗公司！ | 小柴自我介紹 |
| 2 | 📋 | 看看誰來面試了！ | 履歷、能力、等級、面試問題 |
| 3 | ✅ | 錄用或婉拒 | 耐心值概念 |
| 4 | 🏢 | 你的辦公室 | [[Walker System\|員工走動]]、[[Office Levels\|升級]] |
| 5 | 🛒 | 商店與培訓 | [[Shop Items\|道具]]、[[Mini Games/Frisbee\|陪玩]]、[[Mini Games/Training\|培訓]] |
| 6 | 🚀 | 準備好了嗎？ | [[Chemistry System\|化學反應]]、[[Bankruptcy\|破產]] 提醒 |

## 行為

- 每步彈窗有 `dog` 大頭、`title`、`text`（支援 HTML `<b>` 粗體）、`tip` 提示條、進度點點
- 教學期間 [[Game Loop|計時器]] 暫停
- `tutorialStep` 欄位：0 = 未開始，1-6 = 教學中，7 = 完成

## 相關

- `src/features/tutorial/Tutorial.tsx`
- `src/constants/questions.ts` 的 `TUTORIAL_STEPS`
