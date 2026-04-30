// 完成案件動畫用：快取每個 project card 最後一次 layout 時的 bounding rect
// 卡片在 status='done' 後會立刻被 trim 掉，DOM 找不到，所以需要靠 cache 拿源頭座標
export const projectCardRectCache = new Map<string, DOMRect>();
