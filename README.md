# DogOffice 狗狗公司

可愛又療癒的狗狗公司經營小遊戲 DEMO。

## 玩法

直接在瀏覽器打開 `index.html` 即可開始遊玩，或透過任何靜態伺服器啟動：

```bash
python3 -m http.server 8000
# 然後打開 http://localhost:8000
```

## 結構

- `index.html` — 單檔遊戲主體（HTML + CSS + JS）
- `assets/start-screen.png` — 開始畫面背景圖
- `assets/dog-profiles/*.png` — 各部門狗勾大頭照

## 部署

因為是純靜態檔案，可以直接部署到 GitHub Pages、Netlify、Vercel 等任何靜態主機。
