# Handoff — 排行榜（Leaderboard · V3 領獎台 · 紙感版）

## 設計概念
紙感拼貼風格的排行榜 dialog，跟「為公司命名 dialog」、「GameJam 投票送禮 dialog」同一個視覺系統。
- **後紙堆疊** 兩層（鵝黃 / 粉色微旋）
- **頂端中央獎盃徽章**浮出，兩側點綴小閃光
- **eyebrow 英文 + 粉紅圓點 pill 副標** 統一的標題排版
- **TOP 3 podium** 用紙感容器包住，左上「★ TOP 3」歪斜貼紙
- **三張 podium 卡** 改成主設計色票（米白 + 粉 + 桃，不再用銀灰），每張頂端紙膠帶釘住、微旋，第一名額外金色高亮
- **#4–#10** 用撕線分區，中間小膠囊標示，緊湊清單

## 圖片需求
詳見 `DogOffice/img_order/leaderboard/`（另外打包的工單），實作前可先用 emoji 占位，圖到位再換。

## 顏色 Token
- `paper-cream`: `#fffaf2`
- `paper-back-1`: `#fff7ec`
- `paper-back-2`: `#ffe8e0`
- `washi-yellow`: `#ffd86b`
- `washi-pink`: `#ffc1ce`
- `accent-pink`: `#df6374`
- `cta-pink-from`: `#ff8aa6`
- `cta-pink-to`: `#ef6f8f`
- `gold-from`: `#ffd86b`
- `gold-to`: `#ffb838`
- `gold-text`: `#5a3a00`
- `text-deep`: `#7a3a52`
- `text-body`: `#5b382d`
- `text-muted`: `#a37a82`
- `border-soft`: `rgba(220,170,150,0.4)`

## 結構
```
LeaderboardDialog
├─ BackPaperLayer × 2 (rotated, offset)
└─ MainCard (paperTexture)
   ├─ WashiTape × 2 (左上鵝黃 / 右中粉紅)
   ├─ TrophyBadge (top center, 浮出)
   ├─ Sparkle × 2
   ├─ CloseButton (絕對定位 right-top)
   ├─ Header (置中：eyebrow + title + pill subtitle)
   ├─ PodiumZone (虛線框)
   │  ├─ TopBadge 「★ TOP 3」(歪斜貼紙)
   │  └─ PodiumCard × 3
   │     ├─ Tape (頂端釘紙)
   │     ├─ Medal (🥇/🥈/🥉)
   │     ├─ RankRibbon (#1/#2/#3)
   │     ├─ Name
   │     └─ DataChip (第N天 + 金額)
   ├─ Divider 「#4 — #10」(撕線 + 中間膠囊)
   ├─ RowSlim × 7 (第 4–10 名，斑馬條)
   └─ Footer (虛線提示 「把辦公室升級到豪華總部就能登榜！」)
```

## 規格
- Dialog 寬：460px（桌機），手機 100% - 32px margin
- Padding：26 / 22 / 20
- Podium 卡：第 1 名 height 168 / 第 2 名 142 / 第 3 名 130
- Podium grid：1fr 1.15fr 1fr（中間略寬）
- Podium 旋轉：第 1 名 0° / 第 2 名 -2.5° / 第 3 名 +2°
- 第 1 名額外 shadow `0 10px 20px rgba(220,160,40,0.32)`
- 撕線：`repeating-linear-gradient(90deg, rgba(180,120,140,0.4) 0 6px, transparent 6px 12px)`

## 互動建議
- 入場：dialog scale(0.94) + rotate(-2°→0)，podium 卡逐個 stagger 進場
- Hover row：背景 lift + translateY(-1px)
- 自己上榜時：那行加金色高亮 + 永久發光動畫
- 關閉：fade out + scale 0.96

## Props 建議
```ts
type LeaderboardEntry = {
  rank: number;
  name: string;
  day: number;
  money: number;
  staff: number;
  date: string;
  isMe?: boolean;
};

type Props = {
  entries: LeaderboardEntry[]; // length up to 10
  onClose: () => void;
};
```

## 檔案
- `Leaderboard Dialog.html` — 預覽
- `leaderboard.jsx` — 原始碼（V3Podium 為最終版）
- `preview.png` — 視覺截圖
