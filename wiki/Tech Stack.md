---
tags: [tech]
---

# Tech Stack

| 類別 | 套件 | 版本 |
|------|------|------|
| 打包工具 | Vite | 7.3 |
| UI Framework | React | 19.2 |
| 語言 | TypeScript | 6.0 |
| 狀態管理 | Zustand | 5.0 |
| 樣式 | Tailwind CSS | 4.2 |
| PWA | vite-plugin-pwa | 1.2 |

## 為什麼鎖 Vite 7 而非 8

vite-plugin-pwa 1.2 目前 peer 只支援到 Vite 7。Vite 8 是 2026 年初出的，生態還沒全部跟上。

## 為什麼用 Zustand

原本 vanilla JS 是單一 mutable `state` 物件，改 React 後：

- Context 太吃性能（每次 provider 值變所有 consumer 都 re-render）
- Redux 太 boilerplate
- Zustand：極簡 API，selector 只訂閱需要的 state，immutable 友善

詳見 [[State Management]]。

## PWA

- Manifest 名稱「狗狗公司」
- 圖示用 CEO 大頭貼
- 可安裝到手機首頁、支援離線（Service Worker 快取）

## 相關

- [[Architecture]]
- [[State Management]]
- [[Deployment]]
