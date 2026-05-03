# 09 · house-badge.png

## 用途
辦公室造型 dialog 頂端中央浮出的房子徽章。位置與功能跟排行榜的 `trophy-badge.png` 對應 — 整顆 dialog 最吸睛的元素，告訴玩家這個視窗是「換辦公室外觀」。

## 規格
- 顯示尺寸：56 × 56 px
- 出圖尺寸：**112 × 112 px @2x**
- 格式：PNG，透明背景
- 內容須在中心 90% 範圍內（外圍留 5% 邊距）
- 檔案路徑：`public/assets/leaderboard/house-badge.png`
  > 註：跟 trophy-badge 等放在同個 `leaderboard/` 資料夾共用「徽章資產」目錄；如要拆獨立 `office/` 也可，到時改 import 路徑即可。

## 視覺方向
一個被「貼」在草綠色圓角方形貼紙上的可愛小屋。
- **底牌**：草綠漸層圓角方塊（圓角 ~16px），漸層 `#b8d8a0 → #88a868`，外圍白色描邊 3px，柔和陰影（呼應 trophy-badge 的橘黃版型）
- **小屋**：手繪扁平風、暖色系（米色牆 + 紅褐屋頂 + 圓門 + 一兩扇窗戶），不要太寫實
- **比例**：小屋佔底牌 ~70%，置中略偏下，留出屋頂上方的空間
- **整體**：底牌微微旋轉 -4°（旋轉留給 CSS 處理，PNG 出直立的就好）

## 不要
- 不要 3D 渲染
- 不要鋸齒邊或像素風
- 不要寫實建築攝影感
- 不要包含「Office / Studio」等英文字
- 屋頂顏色避免太亮的紅，跟整體紙感色票（粉/米/暖色）協調

## AI Prompt（參考用）
> Hand-drawn flat illustration of a cute cozy house on a rounded square sticker badge. Sticker is a soft sage-green gradient (#b8d8a0 to #88a868) with a thick white border. The house has a warm cream wall, a red-brown gabled roof, a round door, and one or two small windows. Friendly hand-drawn outline style, slightly chunky, soft drop shadow. Transparent background. Scrapbook / paper craft aesthetic, slightly playful, no text. 112x112 px.

中文版：
> 手繪扁平風格的可愛小屋，貼在一張草綠漸層的圓角方形貼紙上，貼紙有白色厚邊與柔和陰影。小屋為米色牆 + 紅褐屋頂 + 圓門 + 一兩扇小窗戶，圓潤手繪線條、不寫實。透明背景，紙感拼貼風格，無文字。112×112 px。

## 系列關係
此圖跟 `trophy-badge.png`、`crown-tag.png` 是同一套「紙貼紙徽章」系列，**請保持風格一致**：
- 同樣的圓角方形 / 白色厚邊 / 柔和陰影
- 同樣的手繪線條粗細
- 用色系：trophy 是橘黃、crown 是金黃、house 是草綠（區分用途，但風格一致）
