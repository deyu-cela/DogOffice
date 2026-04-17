# DogOffice 狗狗公司

可愛又療癒的狗狗公司經營小遊戲，以 Vite + React + TypeScript + Zustand + Tailwind CSS 4 打造。

## 開發

```bash
npm install
npm run dev         # 開發伺服器
npm run build       # 生產建置
npm run preview     # 預覽建置結果
```

## 專案結構

```
src/
├── app/            # App.tsx
├── components/     # 共用元件 (Panel, Meter, RadarChart, Toast)
├── constants/      # 遊戲資料常數 (DOG_ROLES, SHOP_ITEMS...)
├── features/       # 功能模組
│   ├── splash/
│   ├── tutorial/
│   ├── hud/
│   ├── recruit/
│   ├── office/
│   ├── staff/
│   ├── shop/
│   ├── log/
│   └── minigames/
├── hooks/          # 自定義 hooks (useGameLoop)
├── lib/            # 工具函式
├── store/          # Zustand stores (gameStore, walkerStore)
└── types/          # TypeScript 型別定義
```

## 部署

推送到 GitHub `main` 分支後，GitHub Actions 會自動建置並部署到 GitHub Pages。

遊戲網址：`https://<username>.github.io/DogOffice/`

## 原始版本

單檔 HTML 原始版本保留為 `game-original.html` 作為參考。
