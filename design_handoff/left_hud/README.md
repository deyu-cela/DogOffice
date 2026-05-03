# Handoff: 左上 / 左下 HUD 改版 — 紙感拼貼

## Overview
DogOffice 主畫面左上的金錢/公司列、日期/速度列，與左下的進度條，全部改成跟登入畫面、右上工具列同系列的紙感拼貼風格。

組合方案：
- **左上 row 1**：橘棕皮夾（avatar / $錢 / 公司名 / 登出）
- **左上 row 2**：3 張歪斜便利貼（第N天 / 倒數 / 1x 速度）
- **左下**：2 張便利貼（完成任務 / 精神），左上角紅色圖釘 + 內嵌進度條

## Fidelity
**High-fidelity** — 顏色、尺寸、陰影、字級已敲定。

## Target Files

| 檔案 | 動作 |
|---|---|
| `src/features/hud/MoneyDayCluster.tsx` | **重寫** — 左上整列換成皮夾 + 便利貼 |
| `src/features/hud/StatBars.tsx` | **重寫** — 左下兩張便利貼進度條 |
| `src/features/hud/UserBadge.tsx` | **刪除或廢棄** — 登出按鈕已整合進皮夾 |
| `src/features/hud/leftHud.css`（新建） | 紙感共用樣式（如沿用 inline style 可省） |

## Visual Spec

### 左上 Row 1：皮夾（Wallet）
- 容器：`width: 380px; padding: 10px 12px; border-radius: 12px;`
- 主背景：`linear-gradient(180deg, #f8d4b8, #e8a868)`（橘棕皮革漸層）
- 邊框：`1px solid rgba(120,70,40,0.4)`
- 陰影：`0 10px 18px rgba(140,80,50,0.28), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -3px 6px rgba(120,60,30,0.18)`
- 內側「車線」：絕對定位 `inset:4`、`1.5px dashed rgba(255,255,255,0.55)`、`border-radius:9px`
- 內含 4 個元素橫排（gap: 10px, align: center）：
  1. **Avatar 圓**：`36×36`、白底圓、`2px solid rgba(255,255,255,0.7)`、放 `appDog` icon（22×22, `#c44a6a`）
  2. **金錢盒**：白色透明 `rgba(255,255,255,0.7)` 底、`5px 10px`、`border-radius:7px`
     - 第一行：`$` icon (18, `#a37434`) + `$220`（`color: #7a4612, fontSize: 18, fontWeight: 900`）
     - 第二行：`▼ -$20/天`（`color: #c44a3a, fontSize: 10, fontWeight: 800`）
  3. **公司名牌（flex:1）**：`linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,240,220,0.75))` 底、置中、`color: #7a4612, fontSize: 13, fontWeight: 900`
  4. **登出按鈕**：`28px 高、padding 0 10px`、`linear-gradient(180deg, #fff, #ffd6dc)` 底、`1px solid rgba(180,80,90,0.5)`、`color: #a8344a`、icon (12×12) + 「登出」

#### Hover
整顆皮夾 `translateY(-2px)`，過渡 `0.2s ease`。

### 左上 Row 2：3 張小便利貼
緊接皮夾下方，`paddingTop: 8px`、`gap: 8px`、橫排。共用樣式：

```css
{
  position: relative;
  min-height: 44px;
  padding: 8px 10px;
  border-radius: 6px;
  transform: rotate(${tilt}deg);
  box-shadow: 0 6px 10px rgba(180,120,140,0.22), inset 0 0 0 1px rgba(255,255,255,0.55);
  /* + 紙質紋理 */
  background-image:
    linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%),
    radial-gradient(circle at 6px 6px, rgba(0,0,0,0.022) 1px, transparent 1.6px);
  background-size: auto, 12px 12px;
}
```

每張頂端有一片「假紙膠帶」（絕對定位 top:-7、左右置中、寬 32×12、粉色斜紋 `rgba(255,210,225,0.85)`、反向旋轉 `rotate(${-tilt * 1.3}deg)`）。

| 便利貼 | tilt | bg | iconColor | textColor | width | 內容 |
|---|---|---|---|---|---|---|
| 第 N 天 | -2° | `#d8efe0` | `#3a7a4a` | `#2f5a3e` | 88px | calendar(16) + `第 30 天` (12, 900) |
| 下一天 倒數 | 3° | `#cfe6f5` | `#3d7aa0` | `#2c5670` | 112px | hourglass(16) + `下一天 12.3s` (12, 900) |
| 速度 | -3° | `#ffd0c0` | `#a64428` | `#a64428` | 56px | play(12) + `1x` (13, 900)，置中 |

速度便利貼 onClick 沿用 `useGameStore.setSpeed` 的 cycle (1→2→3→1)。

#### Hover
每張獨立 `translateY(-3px)`、`transition 0.2s ease`。

### 左下：2 張便利貼進度條

容器：`position: absolute; left: 12px; bottom: 12px; flex-col; gap: 10px`

每張卡：
- `width: 200px; padding: 8px 12px 10px; border-radius: 8px;`
- `transform: rotate(${tilt}deg);`
- `box-shadow: 0 8px 14px rgba(180,120,140,0.22), inset 0 0 0 1px rgba(255,255,255,0.55);`
- 同上紙質紋理

左上角紅色圖釘（絕對定位 left:8 top:6）：
```css
{
  width: 14; height: 14; border-radius: 50%;
  background:
    radial-gradient(circle at 35% 25%, rgba(255,255,255,0.92) 0 24%, transparent 25%),
    linear-gradient(135deg, #ef94a3, #df6374);
  border: 1px solid #6b2030 55;
  box-shadow: 0 3px 0 rgba(140,65,65,0.18), 0 6px 12px rgba(171,78,78,0.22);
}
```

第一行（`paddingLeft: 18` 避開圖釘）：
- icon (16) + label (`color: #5b382d, fontSize: 12, fontWeight: 900`)
- 右側 value（`color: #5b382d, fontSize: 13, fontWeight: 900, marginLeft: auto`）

進度條：
- 外框：`marginTop:6, height:6, borderRadius:999, background: rgba(255,255,255,0.55), border: 1px solid rgba(150,100,90,0.2)`
- 填色：`linear-gradient(90deg, ${shade(barColor, 20)}, ${barColor}), inset 0 1px 0 rgba(255,255,255,0.4)`
- 寬度：`${pct}%`（與現有 `clampPct` 邏輯相同）

| 便利貼 | tilt | bg | icon | iconColor | label | value | barColor |
|---|---|---|---|---|---|---|---|
| 完成任務 | -2° | `#ffd9b8` | briefcase | `#a86438` | 完成任務 | `${projectsCompleted}` | `#e88a4c` |
| 精神 | 1.5° | `#e0d0f0` | coffee | `#7a4ab0` | 精神 | `${fatigueText}` | `#a070d8` |

進度比例同現有 `StatBars`：完成任務固定 100%；精神 = `100 - avgFatigue` 或直接 `avgFatigue`，請保留現有邏輯。

#### Hover
整張 `translateY(-3px)`，`transition 0.2s ease`。

## Behavior（保留）
- **金錢顯示** 沿用 `moneyShort()` 與 `OFFICE_DAILY_EXPENSE` 計算
- **公司名** 用 `displayCompanyName(companyName)`
- **登出** 沿用 `MoneyDayCluster.tsx` 內的 `onLogout` (先存雲端再 logout)；只在 `authedUser` 存在時顯示
- **倒數** 沿用 `BASE_DAY_MS / dayElapsed / speedMultiplier` 算法
- **速度** 沿用 `cycleSpeed`
- **疲勞文字** 沿用「疲憊 / 普通 / 精神」三段判定

## Files in This Bundle

| 檔案 | 用途 |
|---|---|
| `HUD Final.html` | 可直接打開的設計稿 |
| `hud-final.jsx` | React 原始碼（純設計稿，**不要直接 ship**） |
| `design-canvas.jsx` | DesignCanvas runtime（不會用到，僅供 demo） |
| `preview.png` | 截圖預覽 |

## Acceptance
- [ ] 左上皮夾 4 元素橫排，dashed 內框完整
- [ ] 3 張便利貼正確 tilt、頂端有粉色紙膠帶
- [ ] 速度便利貼點擊可 cycle 1x → 2x → 3x
- [ ] 左下 2 張便利貼，紅圖釘 + 進度條
- [ ] 所有卡 hover 都有微浮起
- [ ] `authedUser = null` 時登出按鈕不顯示
- [ ] 視覺與 `Toolbar Sticky Notes` (右上) 一致
- [ ] `npm run typecheck` / `lint` 通過
