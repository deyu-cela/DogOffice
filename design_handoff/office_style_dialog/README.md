# Handoff — 辦公室造型 Dialog（V2 拍立得照片牆）

## 設計概念
紙感拼貼風格，把每種辦公室造型做成「可翻看的拍立得照片」，跟為公司命名 / GameJam / 排行榜 dialog 同一視覺系統。
- 後紙堆疊 + 紙膠帶 + 房子徽章浮出（呼應排行榜獎盃徽章）
- eyebrow 英文 + 主標 + pill 副標
- 2 欄 grid，每張造型獨立拍立得卡（縮圖 4:3 + 上方紙膠帶 + 名稱 + Lv 金徽 + 主題）
- 第 6 格用虛線紙條「升級辦公室解鎖更多造型」，避免空著
- 三種狀態：使用中（粉紅邊框 + 「使用中」紅貼紙 + 粉紅膠帶）、可選（米色膠帶）、未解鎖（grayscale + 半透明 + 🔒 遮罩）

## 顏色 Token
- `paper-cream`: `#fffaf2`
- `paper-back-1`: `#fff7ec`
- `paper-back-2`: `#ffe8e0`
- `washi-blue`: `#cfe6f5`
- `washi-pink`: `#ffc1ce`
- `washi-cream`: `#e8d8c0`（一般卡的紙膠帶）
- `accent-pink`: `#df6374`（active 邊框）
- `cta-pink-from`: `#ff8aa6`
- `cta-pink-to`: `#ef6f8f`
- `gold-from`: `#ffd86b`（Lv 徽章）
- `gold-to`: `#ffb838`
- `text-deep`: `#7a3a52`
- `text-body`: `#5b382d`
- `text-muted`: `#a37a82`
- `locked-bg`: `rgba(60,40,55,0.35)`

## 結構
```
OfficeStyleDialog
├─ BackPaperLayer × 2
└─ MainCard
   ├─ WashiTape × 2
   ├─ HouseBadge (top center)
   ├─ CloseButton (right-top, 圓形)
   ├─ Header (eyebrow + title + pill subtitle)
   └─ Grid (2 cols, gap 12)
      ├─ OfficeCard × N
      │  ├─ Tape (頂端釘紙)
      │  ├─ Thumb (4:3 aspect)
      │  ├─ LockOverlay (locked only)
      │  ├─ UsingTag (active only, 旋轉貼紙)
      │  ├─ Name + LvBadge
      │  └─ Theme
      └─ MorePlaceholder (虛線紙條, last cell)
```

## 規格
- Dialog 寬：480px
- Padding：26 / 22 / 20
- Grid：2 columns, gap 12
- 卡片旋轉：每張不同（-1.5° / +1.2° / -1° / +1.5° / -0.8°），補充紙條 +0.8°
- 縮圖：aspect-ratio 4/3
- Active 邊框：2px 粉紅、額外 shadow `0 8px 18px rgba(223,99,116,0.28)`

## 互動建議
- Hover (unlocked)：translateY(-2px)、卡片旋轉拉直、shadow 加深
- Hover (locked)：cursor not-allowed、輕微 shake
- 點選：active 從前一張轉移時加一段 fade + tape 換色動畫
- 入場：卡片從底部隨機方向飛入，stagger 60ms

## 圖片需求
建議再開工單：每張 office 縮圖（5 種 × `4:3` 風景插畫，例如 240×180 @2x = 480×360 PNG）。目前是 emoji + 漸層占位。

## Props 建議
```ts
type Office = {
  id: string;
  name: string;
  lv: number;
  theme: string;
  thumbnail: string;       // 4:3 圖檔
  state: 'active' | 'unlocked' | 'locked';
};

type Props = {
  offices: Office[];
  onSelect: (id: string) => void;
  onClose: () => void;
};
```

## 檔案
- `Office Style Dialog.html` — 預覽
- `office-style-dialog.jsx` — 原始碼（V2Grid 為最終版）
- `preview.png` — 視覺截圖
