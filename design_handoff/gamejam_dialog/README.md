# Handoff — GameJam 投票送禮 Dialog（V2 拍立得 CEO）

## 設計概念
保持遊戲整體紙感／手帳風格，把 CEO 狗狗做成「可收藏的拍立得」當作禮物賣點。

- 主紙微旋 -0.8°，左右兩條紙膠帶夾住，最有手帳風
- 標題列左側放金色禮盒徽章，右側 GameJam 小標 + 主標
- CEO 卡片做成傾斜 -2° 的拍立得：白底、深色照片格、底部留白給名片資訊
- 拍立得右下蓋「EXCLUSIVE」印章，強化限定感
- 名字旁三顆 chips：S 級（金）/ 限定（粉）/ CEO 角色
- 引言用 italic 強調 CEO 個性
- 兩顆 CTA：左灰右粉，比例 1:1.6（粉色按鈕主導，但「先不要」也夠醒目）

## 顏色 Token
- `paper-cream`: `#fffaf2`
- `washi-yellow`: `#ffe1a8`
- `washi-blue`: `#cfe6f5`
- `accent-pink`: `#df6374`
- `cta-pink-from`: `#ff8aa6`
- `cta-pink-to`: `#ef6f8f`
- `gold-from`: `#ffd86b`
- `gold-to`: `#ffb838`
- `gold-text`: `#5a3a00`
- `gift-from`: `#ffe28a`
- `gift-to`: `#ffb84a`
- `text-deep`: `#7a3a52`
- `text-body`: `#5b382d`
- `text-muted`: `#a37a82`
- `polaroid-photo-from`: `#6b4a3a`
- `polaroid-photo-to`: `#3d2a20`

## 結構
```
DialogShell (rotate -0.8deg, paperTexture)
├─ WashiTape × 2 (top-left -30°, top-right 30°)
├─ Header
│  ├─ GiftBadge 🎁 (rotate -6°)
│  └─ TitleStack
│     ├─ Eyebrow 「GAMEJAM 投票送禮」
│     └─ Title 「幫我們投一票，送你狗狗」
├─ Description
├─ PolaroidCard (rotate -2°)
│  ├─ PolaroidTape (top center)
│  ├─ PhotoFrame (90×90, dog gradient)
│  ├─ Info
│  │  ├─ Name + ChipS + ChipLimited
│  │  ├─ Role 「CEO · 月薪 $0」
│  │  └─ Quote (italic)
│  └─ Stamp 「EXCLUSIVE」(rotate -8°)
└─ CTARow
   ├─ Cancel 「先不要」(flex 1)
   └─ Confirm 「投了！領禮包 🎁」(flex 1.6)
```

## 規格
- Dialog 寬：420px
- Padding：26 / 24 / 22
- Polaroid：照片 90×90 (1:1)、底部 padding 14px、外框 radius 6
- Polaroid 旋轉：-2°
- Polaroid tape：50×14、半透明米色

## 互動建議
- 入場：scale(0.92) + rotate(-3°→ -0.8°)，220ms ease-out
- Hover Confirm：translateY(-1px)、shadow 加深
- 點 Confirm：拍立得「飛出」動畫到角色欄（後續流程）
- 點 Cancel：dialog fade out

## Props 建議
```ts
type Props = {
  ceo: {
    name: string;
    rank: 'S' | 'A' | 'B' | 'C' | 'D';
    role: string;
    salary: number;
    quote: string;
    avatarUrl: string;
  };
  onAccept: () => void;
  onCancel: () => void;
};
```

## 檔案
- `GameJam Vote Dialog.html` — 預覽
- `gamejam-dialog.jsx` — 原始碼（V2Polaroid）
- `preview.png` — 視覺截圖
