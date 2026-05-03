# Handoff: 右上工具列改版 — 掛繩夾子（Hanging Clothesline Toolbar）

## Overview
把 DogOffice 遊戲畫面右上角的工具列從 Blue Archive 風格的玻璃晶片，改成跟登入畫面一致的紙感拼貼風格。

設計概念：一條微微下垂的麻繩兩端用釘子釘住，每顆按鈕（成就 / 相簿 / 工具 / 音樂 / 存檔 / 重整）變成一張歪斜的便利貼，用木製曬衣夾掛在繩子上。Hover 時整顆按鈕往上跳一下，並從下方彈出便利貼風格的小提示。

## About the Design Files
這個資料夾內附的 `Toolbar Sticky Notes.html` 與 `toolbar-c.jsx` 是**設計參考稿** — 用瀏覽器可直接打開的 HTML/JSX 原型，呈現預期的視覺與互動，不是要直接 ship 的 production code。

實作時請**用 DogOffice 既有的 React + TypeScript + Tailwind 環境重做這個設計**，沿用專案現有的 component / store / icon system，不要把這份 demo 程式碼直接複製進去。

## Fidelity
**High-fidelity** — 確切的顏色、尺寸、陰影、互動、字體都已經敲定。請按照下方規格 1:1 還原。

## Target Files in DogOffice Codebase

需要動的檔案：

| 檔案 | 動作 |
|---|---|
| `src/features/hud/TopRightButtons.tsx` | **重寫** — 改成掛繩容器 + 6 個 clip 按鈕 |
| `src/features/hud/topRightToolbar.css` | **新建** — 紙感拼貼樣式 |
| `src/components/BgmToggle.tsx` | **修改** — 改成接受 `className` / 共用 clip 樣式 |
| `src/features/hud/SaveIndicator.tsx` | **修改** — 改成 clip 樣式（保留 status 邏輯） |
| `src/features/hud/RestartButton.tsx` | **修改** — 改成 clip 樣式（保留 modal 邏輯） |

> 註：可考慮把 clip 按鈕抽成共用 `<HangingClipButton>`，這樣 4 個按鈕（trophy / gallery / wand / bgm）共用同一份外觀，`SaveIndicator` 和 `RestartButton` 也只要包一層 clip 樣式即可。

## 整體佈局

容器：右上角 `position: absolute; top: 12px; right: 12px; z-index: 700;`

```
[ 釘子 ●━━━━━━━━━━━━━━━━━━━━━━● 釘子 ]   ← 兩端錨點 + 微下垂的繩子
   │      │      │      │      │      │
  夾子   夾子   夾子   夾子   夾子   夾子    ← 每顆按鈕上方都有木夾
   │      │      │      │      │      │
 [成就] [相簿] [造型] [音樂] [存檔] [重整]   ← 6 張歪斜便利貼（顏色不同）
                ↑ hover 時往上跳，下方彈出便利貼小提示
```

- 佈局方向：`flex-row`
- 按鈕間距：`gap: 8px`
- 容器 padding：`paddingTop: 18px`（給繩子留位置）
- 整體可呼吸 wrapper：`padding: 4px 4px 0`

## 設計規格

### 1. 容器（外層 wrapper）
```tsx
<div className="toprt-clothesline">
  <KnotAnchor side="left" />
  <KnotAnchor side="right" />
  <RopeSvg />
  {/* 6 個 ClipButton */}
</div>
```

容器尺寸：以內容寬度為主（`display: inline-block`），高度約 76px（含 hang offset 和按鈕本身）。

### 2. 兩端釘子（Knot Anchor）
- 大小：`8x8px` 圓形
- 顏色：`#7a5a4a`（深棕）
- 位置：左端 `top:4, left:-2`；右端 `top:8, right:-2`（微錯位讓繩子有方向感）
- 陰影：`0 1px 2px rgba(0,0,0,0.3)`
- z-index：`3`（高於繩子）

### 3. 繩子（Rope）
SVG 路徑，下垂的弧線。容器右邊比左邊高 4px，視覺上像繩子真的因為按鈕重量微微下垂。

```svg
<svg viewBox="0 0 360 30" preserveAspectRatio="none"
  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 30, zIndex: 1 }}>
  <!-- 主繩 -->
  <path d="M2 6 Q 90 22, 180 18 T 358 10"
    stroke="#8a6858" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  <!-- 高光（淺色細線往上偏 1px） -->
  <path d="M2 6 Q 90 22, 180 18 T 358 10"
    stroke="#a88878" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.6"
    transform="translate(0, -1)"/>
</svg>
```

### 4. 每顆按鈕（ClipButton）

#### 4a. 木夾（Clip）
位置：絕對定位於便利貼正上方中央。
- 尺寸：`12 × 18px`（寬窄高比 = 細長型）
- top: `hangY[i]` —— 沿著下垂的繩子排列，每顆位置不同（見下方表）
- transform：`translateX(-50%) rotate(${tilt * 0.4}deg)` —— 跟便利貼同方向但只轉 40%，看起來像夾子順著傾斜
- 圓角：`3px 3px 2px 2px`（上面比下面圓）
- 木紋漸層：`linear-gradient(180deg, ${clipColor}, ${shade(clipColor, -18)})`
- 接合縫：中央一條 `1×12px`、`rgba(0,0,0,0.18)` 直線（從 top:4 開始）
- 鉚釘：中央 `3×3px` 圓點，`rgba(0,0,0,0.3)`，top:7
- 陰影：`0 2px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)`

#### 4b. 便利貼按鈕（Sticky Note Button）
- 尺寸：`48 × 48px`
- 圓角：`8px`
- transform：`rotate(${tilt}deg)`（每顆角度不同 → 隨手夾的感覺）
- background：每顆指定的色（見下表 `color`）
- 紙質紋理（疊在純色上）：
  ```css
  background-image:
    linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%),
    radial-gradient(circle at 6px 6px, rgba(0,0,0,0.025) 1px, transparent 1.5px);
  background-size: auto, 12px 12px;
  ```
- 陰影（normal）：`0 6px 10px rgba(180,120,140,0.24), inset 0 0 0 1px rgba(255,255,255,0.6)`
- 陰影（hover）：`0 10px 14px rgba(180,120,140,0.32), inset 0 0 0 1px rgba(255,255,255,0.6)`
- icon：放在中央 `22×22px`，顏色用該顆的 `iconColor`
- 整顆 hover 時 wrapper `translateY(-3px)`，過渡 `transform 0.18s ease`

#### 4c. 角標（Badge，僅成就有）
- 位置：`top: -4, right: -4`
- 形狀：藥丸狀，`min-width: 16px, height: 16px, borderRadius: 999, padding: 0 4px`
- 配色：`linear-gradient(180deg, #ff8aa6, #ef6f8f)` 粉紅
- 文字：`color: #fff, fontSize: 10, fontWeight: 900`
- 陰影：`0 2px 4px rgba(239,111,143,0.5)`
- transform：`rotate(${-tilt}deg)` —— 反向旋轉，讓數字保持水平
- z-index：`3`

#### 4d. Hover Tooltip（便利貼小提示）
- 位置：`top: 70, left: 50%, transform: translateX(-50%) rotate(-2deg)`
- 樣式：奶白底 `#fffafc`，圓角 6px，padding `4px 10px`
- 文字：`fontSize: 11, fontWeight: 800, color: #7a3a52, whiteSpace: nowrap`
- 陰影：`0 4px 8px rgba(180,120,140,0.28), inset 0 0 0 1px rgba(255,255,255,0.7)`
- 只在 hover 顯示；`pointer-events: none`
- z-index：`10`

### 5. 六顆按鈕的設定表

按照陣列順序從左到右擺：

| 順序 | key | label | color (便利貼) | iconColor | tilt (°) | clip (木夾色) | hangY (px) | badge |
|---|---|---|---|---|---|---|---|---|
| 1 | `trophy` | 成就 | `#ffd97a` | `#a37434` | `-4` | `#e8a868` | `2` | `"3"` |
| 2 | `gallery` | 相簿 | `#ffd0dc` | `#c44a6a` | `3` | `#d896a8` | `5` | — |
| 3 | `wand` | 造型 | `#e8d6f5` | `#7a4ab0` | `-3` | `#b89ad0` | `7` | — |
| 4 | `music` | 音樂 | `#c8e6f5` | `#3d7aa0` | `4` | `#90b6d0` | `6` | — |
| 5 | `save` | 存檔 | `#d6efd0` | `#3a7a4a` | `-2` | `#9ac890` | `4` | — |
| 6 | `restart` | 重整 | `#ffe0c8` | `#a86438` | `3` | `#d8a888` | `1` | — |

> Demo 裡第 3 顆原本叫「筆記」用 pen icon，改版後請換成 DogOffice 既有的「造型」按鈕（`wand` icon，呼叫 `useUiStore().openSkinModal`）。

## Interactions & Behavior

### 共用：onClick mapping
保留 `TopRightButtons.tsx` 原本的所有行為：

| key | onClick | conditional render |
|---|---|---|
| `trophy` | `setLbOpen(true)`（開啟 LeaderboardPanel） | 永遠顯示 |
| `gallery` | `useUiStore().openAchievements()` | 永遠顯示 |
| `wand` | `useUiStore().openSkinModal()` | 永遠顯示 |
| `music` | `useBgmStore().toggleMute()` | 永遠顯示；icon 隨 `muted` 切換 |
| `save` | `useSaveStore().saveToCloud()` | 只在 `authedUser` 存在時顯示 |
| `restart` | 開啟 RestartButton 的確認 modal | 只在 `authedUser` 存在時顯示 |

### Hover
- 整顆 wrapper `translateY(-3px)`，transition `0.18s ease`
- 卡片陰影增強（見 4b）
- Tooltip 顯示

### Active / Pressed
- `translateY(-1px)`（比 hover 低一點，按下感）

### Music 按鈕特殊狀態
- `muted = true` → 顯示「靜音」icon（或 emoji 🔇），iconColor 用較灰的 `#9aacc5`
- `muted = false` → 顯示音符 icon，正常 `#3d7aa0`
- `aria-label` 與 tooltip 隨狀態切換：「開啟音樂」/「關閉音樂」

### Save 按鈕特殊狀態
保留原本的三種狀態（`saving` / `conflict` / `error`）：
- `saving` → 卡片顯示 loading 動畫（可用 `...` 或自轉的 svg）
- `conflict` / `error` → 卡片底色換成警告色 `linear-gradient(180deg, #fff8e0 0%, #ffe89a 100%)`，icon 換成 ⚠ 並用 `#c08a14` 色
- `disabled = true` 時 `cursor: wait, opacity: 0.7`
- tooltip 顯示原本的 status 訊息（「剛剛儲存」、「儲存失敗：...」等）

### Restart 按鈕
- 點擊開啟原本的確認 modal（`RestartButton.tsx` 內已實作的 `<div className="fixed inset-0 z-[920]">...`）
- modal 本身**不需要改**，只要外層按鈕變成掛繩夾子樣式

### 行動版響應式（max-width: 640px）
- 容器 `gap: 6px`
- 便利貼 `40 × 40px`
- 木夾 `10 × 15px`
- icon `18 × 18px`
- 各角度 `tilt` 乘 0.6（減少歪斜避免太擠）

### Accessibility
- 每顆按鈕保留 `aria-label`（中文，跟 tooltip 同字）
- `title` 屬性同步（給原生 tooltip fallback）
- Tooltip 是視覺裝飾、不應該是唯一的 label
- 焦點可見：`:focus-visible` 時 outline `2px solid #ff7591, outline-offset: 3px`，跟 hover 表現一致

## Design Tokens

紙感拼貼系列（DogOffice `index.css` 已經有 `--kawaii-pin-pink` 等變數，可沿用）：

```css
--toprt-rope:           #8a6858;
--toprt-rope-highlight: #a88878;
--toprt-knot:           #7a5a4a;

--toprt-tooltip-bg:     #fffafc;
--toprt-tooltip-text:   #7a3a52;
--toprt-tooltip-shadow: rgba(180,120,140,0.28);

--toprt-card-shadow:       rgba(180,120,140,0.24);
--toprt-card-shadow-hover: rgba(180,120,140,0.32);

--toprt-badge-from: #ff8aa6;
--toprt-badge-to:   #ef6f8f;
```

便利貼六色 + 木夾六色見上方表格，建議直接寫在 `TOOLS` 陣列裡。

## Implementation Notes

### 建議檔案結構
```
src/features/hud/
├── TopRightButtons.tsx        ← 改寫成掛繩容器
├── HangingClipButton.tsx      ← 新增（共用按鈕）
├── topRightToolbar.css        ← 新增
├── BgmToggle.tsx              ← 改成接受 ClipButton 的 props
├── SaveIndicator.tsx          ← 改成接受 ClipButton 的 props
└── RestartButton.tsx          ← 改成接受 ClipButton 的 props
```

`HangingClipButton` 介面建議：

```tsx
type HangingClipButtonProps = {
  // 視覺
  bgColor: string;          // 便利貼底色
  iconColor: string;        // icon 顏色
  clipColor: string;        // 木夾顏色
  tilt: number;             // -5 ~ 5 度
  hangY: number;            // 0 ~ 8 px

  // 內容
  icon: React.ReactNode;    // 22x22 SVG
  label: string;            // tooltip + aria-label
  badge?: string | number;  // 角標數字
  state?: 'default' | 'warning' | 'busy';  // 給 SaveIndicator 用

  // 行為
  onClick?: () => void;
  disabled?: boolean;
};
```

`SaveIndicator` / `RestartButton` 的整合範例：

```tsx
// SaveIndicator.tsx 改寫示意
return (
  <HangingClipButton
    bgColor="#d6efd0"
    iconColor="#3a7a4a"
    clipColor="#9ac890"
    tilt={-2}
    hangY={4}
    icon={<SaveIcon />}
    label={tooltip}  // 動態 tooltip
    state={status === 'saving' ? 'busy' : (status === 'error' || status === 'conflict') ? 'warning' : 'default'}
    onClick={() => !disabled && saveToCloud()}
    disabled={disabled}
  />
);
```

### Icon 選用
DogOffice `SvgIcon.tsx` 已經有所有 icon：
- `trophy` / `gallery` / `wand` / `restart` 直接用 `<SvgIcon name="..." size={22} />`
- `music` 沿用 `BgmToggle` 原本的 emoji（🎵 / 🔇）或自畫一個 SVG
- `save` 沿用 `SaveIndicator` 原本內嵌的 `<SaveIcon />`

設定 SvgIcon 顏色時記得透過 `currentColor` 或 fill prop 換成該顆的 `iconColor`。

## Files in This Bundle

| 檔案 | 用途 |
|---|---|
| `Toolbar Sticky Notes.html` | 完整可開啟的設計稿（含 ABCD 四種版型，掛繩夾子是 **Variation C**） |
| `toolbar-c.jsx` | 掛繩夾子版的 React component 原始碼（純設計稿，不要 ship） |
| `preview.png` | 設計稿截圖預覽 |

## Out of Scope
- 登入畫面（`AuthScreen.tsx` / `AuthForm.tsx` / `auth.css`）已經改好，**不要動**
- 成就頁（`AchievementsScreen.tsx`）已經改好，**不要動**
- 主畫面 HUD（左上資源 / 左下狀態）目前**還沒接**到 codebase，這次也**不要做**
- 製作人員名單頁目前**還沒接**到 codebase，這次也**不要做**

## Acceptance Criteria
- [ ] 右上 6 顆按鈕視覺上跟 demo 1:1 一致（顏色、tilt、hangY、繩子下垂）
- [ ] 所有原有功能保留（leaderboard / achievements / skin modal / bgm toggle / save / restart）
- [ ] Save 三種狀態 + Music 兩種狀態正確切換
- [ ] Hover tooltip 出現在按鈕下方，內容是中文 label
- [ ] `authedUser` 為 null 時 save 和 restart 不顯示
- [ ] 行動版（≤640px）按鈕縮小、不會跑版
- [ ] 鍵盤可 focus、`aria-label` 完整
- [ ] `npm run typecheck` / `npm run lint` 通過
