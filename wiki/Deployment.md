---
tags: [tech]
---

# Deployment

GitHub Pages 自動部署。

## Workflow

`.github/workflows/deploy.yml`：

1. push 到 `main` 觸發
2. `actions/setup-node@v4` Node 20
3. `npm ci`
4. `npm run build`（tsc -b + vite build）
5. `actions/upload-pages-artifact@v3` 把 `dist/` 打包
6. `actions/deploy-pages@v4` 發佈

網址：https://deyu-cela.github.io/DogOffice/

## Vite base 設定

```ts
// vite.config.ts
base: '/DogOffice/'
```

所有資產 URL 都會自動加上 `/DogOffice/` prefix。

## PWA

- manifest：`name: 狗狗公司`, `start_url: /DogOffice/`, `scope: /DogOffice/`
- Service Worker 自動生成，快取 7.2 MB 資產（含圖片）
- 初次造訪後支援離線遊玩

## 本地開發

```bash
npm run dev        # http://localhost:5173/DogOffice/
npm run build      # 生產建置
npm run preview    # 本地預覽 dist
```

## 相關

- [[Tech Stack]]
- [[Architecture]]
