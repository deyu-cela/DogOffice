# Handoff — 第 N 天結算 Dialog（V3 紙膠帶便條 + 章戳）

## 設計概念
紙膠帶便條風格，跟為公司命名 / 排行榜 / 辦公室造型 dialog 同一視覺系統。
- 後紙堆疊 + 紙膠帶 + 圓形 X（旋轉 8°）
- 紙質貼圖（paperTexture）
- 主數字用手寫感字體（Caveat）放大
- **兩種狀態切換**（透過 `profit` prop）：
  - `profit=true`：賺錢日 → 粉色紙膠帶 + 暖色漸層條 + 紅圈章「★ DAY ★ 13 達標」+ 簽名「今天也辛苦了 ♡」
  - `profit=false`：賠錢日 → 藍色紙膠帶 + 冷灰漸層條 + 藍灰圈章「DAY 13 赤字」+ 簽名「明天再加油吧…」

## 規格
- 寬度：320px
- Padding：14px
- 標題：第 N 天結算（22px Caveat + 9px DAY eyebrow）
- 主數字區：10/12 padding + gradient bg + 28px 手寫數字 + 56px 圓章
- 圓章：56×56、border 2.5px、opacity 0.78、旋轉 -8° / +6°、紙紋（噪點 background-image 模擬蓋章不均勻）
- 明細：11px、虛線分隔
- 簽名：13px Caveat 右對齊
- X 按鈕：28×28 圓、右上 -10/-10、旋轉 8°

## 顏色 Token
- `paper-cream`: `#fffaf2`
- `paper-back-pink`: `#ffe3eb`（賺）
- `paper-back-blue`: `#dde7ee`（賠）
- `tape-pink`: `#ffc1ce`（賺）
- `tape-blue`: `#cfe6f5`（賠）
- `accent-pink`: `#df6374`（賺：章戳/數字/簽名）
- `accent-blue`: `#5b7a8c`（賠：章戳/數字/簽名）
- `bg-warm-from`: `#fff5f0`、`bg-warm-to`: `#ffe8dd`（賺：主數字背景）
- `bg-cold-from`: `#f3f6f9`、`bg-cold-to`: `#e3eaf0`（賠：主數字背景）
- `income-green`: `#5a7a3f`
- `expense-red`: `#a85a72`
- `text-deep`: `#7a3a52`
- `text-body`: `#5b382d`
- `text-muted`: `#a37a82`

## 字型
- 中文 / 數字 UI：`Noto Sans TC`（700/800/900）
- 手寫感（標題、主數字、簽名）：`Caveat`（500/700）

## Props
```ts
type Props = {
  profit: boolean;     // true = 達標 / false = 赤字
  day: number;
  income: number;
  expense: number;
  completed: number;
};
```

## 狀態判斷邏輯（建議）
- `net = income - expense`
- `profit = net >= 0`（或業務自訂門檻 e.g. 達不到目標就顯示赤字）

## 章戳 Stamp 元件
獨立成 `<Stamp color eyebrow big sub rotate />`，方便日後擴充：
- 連勝 N 天：金章「★ STREAK 5 ★」
- 破紀錄：紫章「NEW HIGH」
- 第一桶金：彩虹章「FIRST $1K」

## 互動建議
- 入場：dialog 從 scale(0.85) + opacity(0) 彈入；章戳延遲 200ms scale(1.4 → 1) + 旋轉，模擬「蓋章」動作
- 章戳蓋下時加一個短促搖晃 + 短促陰影
- X 按鈕 hover：scale(1.1) + 轉 -8°

## 檔案
- `Daily Summary Dialog.html` — 兩種狀態並排預覽
- `daily-summary-dialog.jsx` — 原始碼（CompactNote、Stamp 為主）
- `preview.png` — 視覺截圖
