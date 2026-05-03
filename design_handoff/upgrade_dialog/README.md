# Handoff — 道具升級 Dialog（V1 卡片橫式）

## 設計概念
紙感卡片風，跟結算 / 排行榜 / 借貸 / 辦公室造型 dialog 同一視覺系統。
- 後紙堆疊（粉、米黃）+ 紙膠帶 + 圓形 X
- 左邊小張拍立得縮圖（道具 icon + 英文標）
- 右邊標題 + Lv 1→2 金色 pill
- 5 階金色狗腳印階梯顯示等級進度
- 「目前 LV1」白底虛線 → 「升級後 LV2」金色高亮（NEW 標籤）並列對比
- 升級花費粉色虛線條
- 金色「★ 升級」主按鈕（金色厚陰影邊）+ 「關閉」次按鈕

## 結構
```
UpgradeItemCard
├─ BackPaper × 2 (粉、米黃)
└─ MainPaper
   ├─ Tape × 2 (粉 / 藍)
   ├─ CloseBtn (right-top)
   ├─ Header (Polaroid thumb + Title + Lv pill)
   ├─ LevelStairs (5 階, 1 已達, 1 待升, 3 未解鎖)
   ├─ EffectCompare (目前 → 升級後)
   ├─ CostBar
   └─ Buttons (升級 / 關閉)
```

## 規格
- 寬：460px
- Padding：20 / 22
- Polaroid 縮圖：100px 寬、aspect 1:1、旋轉 -3°、4px 4px 16px padding
- Lv pill：金色漸層 `linear-gradient(180, #ffd86b, #ffb838)`、圓角 999、2px 厚陰影 `#c87a1a`
- 階梯：5 顆，高度遞增 22→38px、已達金色實心、待升白底虛線粉框 `#df6374`、未解鎖白底淺粉框
- 效果對比：grid 1fr / auto / 1fr，中間是旋轉 8° 的紅箭頭 →
- 升級花費條：linear-gradient `#fff5f0 → #ffe8dd`、虛線 `rgba(180,120,90,0.3)`
- 主按鈕：金色漸層、5px 厚陰影 `#c87a1a` + 大投影
- 次按鈕：白底 + 2px inset 粉邊框

## 顏色 Token
- `paper-cream`: `#fffaf2`
- `paper-back-pink`: `#ffe3eb`
- `paper-back-cream`: `#fff0d5`
- `tape-pink`: `#ffc1ce`
- `tape-blue`: `#cfe6f5`
- `gold-from`: `#ffd86b`
- `gold-to`: `#ffb838`
- `gold-shadow`: `#c87a1a`
- `gold-text`: `#7a3a1a`
- `gold-bg-from`: `#fffbe8`（升級後高亮卡背景）
- `gold-bg-to`: `#fff3c8`
- `accent-pink`: `#df6374`（eyebrow + 箭頭）
- `cta-pink-edge`: `#f0c8d4`
- `text-deep`: `#7a3a52`
- `text-muted`: `#a37a82`
- `income-green`: `#5a7a3f`（效果加成數字）

## 字型
- 中文 / UI：`Noto Sans TC`（700/800/900）
- 手寫感（標題、花費金額）：`Caveat`（500/700）

## Props 建議
```ts
type UpgradeProps = {
  item: {
    id: string;
    name: string;            // "辦公桌"
    icon: string;            // emoji 或 image url
    englishLabel: string;    // "OFFICE DESK"
  };
  level: { current: number; max: number };  // {current: 1, max: 5}
  effect: {
    current: string;          // "全 team 案件速度 +1"
    next: string;             // "全 team 案件速度 +2"
  };
  cost: number;              // 120
  affordable: boolean;       // 金錢不夠時主按鈕應 disabled
  onUpgrade: () => void;
  onClose: () => void;
};
```

## 互動建議
- 入場：dialog scale(0.9) → 1，180ms
- 階梯：當前那一階加呼吸動畫（scale 1 → 1.06，1.4s ease-in-out infinite）
- 升級成功：階梯下一格從虛線變實心金色 + 短暫金光、效果框從目前移到升級後（slide）
- 主按鈕 hover：translateY(-1px)、shadow 加深
- 金錢不足：主按鈕灰化、改顯「金錢不足」、改顏色為灰

## 滿級狀態（LV5/5）建議
- 標題改「滿級囉 ♡」
- 階梯全亮 + 加金色彩帶或皇冠 emoji
- 主按鈕變「已滿級」灰按鈕、不可點
- 升級花費隱藏，改顯「MAX」徽章

## 檔案
- `Upgrade Dialog.html` — 預覽
- `upgrade-dialog.jsx` — 原始碼（V1 / V2 都在裡面，handoff 採 V1 UpgradeItemCard）
- `preview.png` — 視覺截圖
