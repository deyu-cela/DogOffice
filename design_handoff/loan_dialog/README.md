# Handoff — 銀行救急貸款 Dialog（V1 借據合約風）

## 設計概念
紙質契約風格，跟結算 / 排行榜 / 辦公室造型 dialog 同一視覺系統。
- 後紙堆疊（粉、米黃各一張）+ 紙膠帶 + 圓形 X
- 大手寫金額（Caveat 字體）+ 紅圈「DOGGO BANK 核准」官印
- 虛線契約框包住主金額區
- 條款明細列表（每日扣款 / 還款期 / 總還款）
- 手寫感警語小字
- 「借 $300」粉色主按鈕 + 「不借」次按鈕

## 結構
```
LoanContract
├─ BackPaper × 2 (粉、米黃)
└─ MainPaper
   ├─ Tape (top center)
   ├─ CloseBtn (right-top)
   ├─ Header (eyebrow + title + pill)
   ├─ HeroAmount  ← 虛線框 + 大金額 + 紅章
   ├─ ContractRows (每日扣款 / 還款期 / 總還款)
   ├─ HandwrittenNote (※ 一輩子只能借一次…)
   └─ Buttons (借 $300 / 不借)
```

## 規格
- Dialog 寬：460px
- Padding：22 / 26
- 主金額區：16 / 18 padding，2px dashed border `rgba(180,120,90,0.3)`，bg `linear-gradient(180, #fff5f0, #ffe8dd)`
- 大金額：Caveat 56px，色 `#df6374`
- 銀行官印：64×64 圓，2.5px border，旋轉 -12°，opacity 0.78，蓋章不均勻紋（噪點 background）
- 條款明細：1.5px dashed `#f0c8d4` 框、白底、12px 內文、16px 數值
- 警語：11px Caveat、`#a37a82`、置中
- 主按鈕：linear-gradient 粉、5px 陰影邊（`#c14a68`）+ 大投影
- 次按鈕：白底 + 2px inset 粉邊框

## 顏色 Token
- `paper-cream`: `#fffaf2`
- `paper-back-pink`: `#ffe3eb`
- `paper-back-cream`: `#fff0d5`
- `tape-cream`: `#ffd9a6`
- `pill-bg-pink`: `#ffe3eb`
- `dashed-pink`: `#f0c8d4`
- `accent-pink`: `#df6374`（章戳、主金額、主按鈕）
- `cta-from`: `#ff96b3`
- `cta-to`: `#ef6f8f`
- `cta-shadow`: `#c14a68`
- `bg-warm-from`: `#fff5f0`
- `bg-warm-to`: `#ffe8dd`
- `expense-red`: `#a85a72`
- `text-deep`: `#7a3a52`
- `text-body`: `#5b382d`
- `text-muted`: `#a37a82`

## 字型
- 中文 / UI：`Noto Sans TC`（700/800/900）
- 手寫感（標題、大金額、警語）：`Caveat`（500/700）

## Props 建議
```ts
type LoanProps = {
  amount: number;          // 立即取得 (e.g. 300)
  dailyDeduct: number;     // 每日扣款 (e.g. 5)
  termDays: number;        // 還款期 (e.g. 80)
  totalRepay: number;      // 總還款 (e.g. 400)
  netCost: number;         // 淨成本 (e.g. 100)
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
};
```

## 互動建議
- 入場：dialog scale(0.85) + opacity(0) → 1，180ms
- 章戳延遲 250ms 從 scale(1.6) + opacity(0) 蓋下，加一個短促搖晃（rotate -12° → -10° → -12°）
- 主按鈕 hover：translateY(-1px)、shadow 加深
- 確認後：章戳閃爍 + 紅光 → dialog fade out

## 額外狀態（可擴充）
- 已借過：禁用主按鈕、改顯「已使用」灰章
- 借款中：右上加金色「LOAN ACTIVE」徽章、剩餘天數
- 還款完成：金色彩帶 + 「PAID OFF」章

## 檔案
- `Loan Dialog.html` — 預覽
- `loan-dialog.jsx` — 原始碼（LoanContract / LoanPassbook 兩個版本，handoff 採 V1 LoanContract）
- `preview.png` — 視覺截圖
