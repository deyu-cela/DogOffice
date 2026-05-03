# Handoff — 為公司命名 Dialog（V1 三層紙堆疊）

## 設計概念
紙感、便利貼風格的 Dialog，呼應遊戲整體的手繪／拼貼視覺。
- 三層紙張堆疊（鵝黃／粉色／主卡片），下方兩層微旋轉錯位，營造「便條紙夾在一起」的感覺
- 頂端粉色紙膠帶 (washi tape) 稍微歪斜
- 右上角圓形腳印徽章（裝飾）
- 標題下方漸層短分隔線
- 輸入欄位用淺米色背景＋柔和邊框，避免硬邊
- CTA 按鈕用粉紅漸層，浮起陰影

## 適用場景
任何需要彈出小視窗的場合（命名、確認、表單填寫等），保持手帳氛圍。

## 顏色 Token（建議加進 design tokens）
- `paper-cream`: `#fffaf2`（主紙底色）
- `paper-cream-deep`: `#fff2e8`（主卡漸層下緣）
- `paper-back-1`: `#fff7ec`（後層紙 1）
- `paper-back-2`: `#ffe8e0`（後層紙 2）
- `washi-pink`: `#ffc1ce`
- `accent-pink`: `#df6374`（重點色 / paw / dot）
- `cta-pink-from`: `#ff8aa6`
- `cta-pink-to`: `#ef6f8f`
- `text-deep`: `#7a3a52`（標題）
- `text-body`: `#5b382d`（輸入字）
- `text-muted`: `#a37a82`（提示）
- `border-soft`: `rgba(220,170,150,0.4)`
- `border-input`: `rgba(220,150,165,0.5)`

## 結構
```
DialogShell
├─ BackPaperLayer1   (rotate -2.5deg, translate(-6, 4))
├─ BackPaperLayer2   (rotate  1.5deg, translate( 4, 2))
└─ MainCard
   ├─ WashiTape (top center)
   ├─ PawBadge (right-top, rotate 8deg)
   ├─ Title  「為公司命名」
   ├─ DividerGradient
   ├─ Subtitle 「一旦取了，這個帳號就無法再改囉 🐾」
   ├─ Label 「• 公司名稱（2–8 字，中英數）」
   ├─ Input
   └─ ConfirmButton 「確定，開始經營！」
```

## 規格
- 主卡寬度：380px（桌機），手機 100% - 32px margin
- 主卡 radius：14px
- 主卡 padding：26px 28px 22px
- 紙張紋理：alpha 0.022 的點點 + 漸層高光（已包成 paperTexture，可作為 mixin）
- 主卡陰影：`0 14px 28px rgba(150,90,80,0.22)` + inset highlight

## 互動建議
- 整個 Dialog 進場：`scale(0.92) → 1`，duration 220ms，easing `cubic-bezier(.2,.8,.2,1)`
- Hover CTA：translateY(-1px) + shadow 加深
- 字數超過 8 時：邊框轉 `--state-warning`，下方 helper 顯示提示
- 「確定」前 disable 直到字數 ≥ 2

## 檔案
- `Company Name Dialog.html` — 可直接開啟預覽
- `dialog-variations.jsx` — React 原始碼（V1Stacked）
- `preview.png` — 視覺截圖

## 開發提示
- React props 建議：`<CompanyNameDialog onConfirm={(name)=>...} />`
- 需要 i18n：把所有中文字串拉到 messages，title/subtitle/placeholder/cta
- a11y：給 Dialog 加 `role="dialog" aria-labelledby="..."`，input 加 `aria-describedby` 指向 helper
