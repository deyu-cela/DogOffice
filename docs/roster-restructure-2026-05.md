# Roster 重整（2026-05-04）

PM 復活、化學反應改 4 條、4 隻 D 升 A，新 3 個 tech 工具。本文件記錄角色 / 工具 / 存檔影響。

## 1. 新隊伍編組

每產業 16 隻 = 主 10 + 副 6。化學反應觸發條件：主+副兩個 role 同時被指派到該產業案件。

| 產業 | 主（10 隻） | 副（6 隻） | 化學反應 |
|------|-------------|------------|----------|
| tech 工程 | 工程師 | PM | 工程師+PM：quality×1.2, speed×1.2 |
| design 美術 | 美術 | QA | 美術+QA：quality×1.2, speed×1.2 |
| marketing 行銷 | 行銷 | 業務 | 行銷+業務：quality×1.2, speed×1.2 |
| service 客服 | 客服 | 企劃 | 客服+企劃：quality×1.2, speed×1.2 |

每 16 隻 grade 分布：
- 主 10：1S + 2A + 2B + 2C + 3D
- 副 6：1A + 1B + 2C + 2D（無 S）

全 roster 共 65 = 4 × 16 + 1（CEO `u-1` 刀霸翎）。

## 2. 角色搬遷（不改 name/breed/stats，只改 role + industry）

| 角色 | 原產業 | 新產業 | 數量 | 備註 |
|------|--------|--------|------|------|
| QA | tech | design | 6 | Steve 升 A、其餘維持原 grade |
| 企劃 | design | service | 6 | 泡芙 升 A、其餘維持 |
| 業務（蘑菇/哼哼）| marketing 主 | marketing 主（轉為「行銷」）| 2 | 蘑菇 A、哼哼 B 改 role 為行銷 |
| 業務 其餘 | marketing 主 | marketing 副 | 6 | Max 升 A、其餘維持 |
| 客服（罐頭/典典/Sherry/百變/小星/米米）| service | tech | 6 | 全部改 role 為 PM；罐頭 升 A |
| 缺缺 | tech / QA | tech / 工程師 | 1 | 改 role 為工程師（補 tech 主 2A） |
| 恐龍 | design / 企劃 | design / 美術 | 1 | 改 role 為美術（補 design 主 2A） |

## 3. 升級 4 隻 D→A 並重設 stats

A 預算 30-34，每隻分配約 30。

| 名字 | 原 [s/q/t/c] | 新 [s/q/t/c] | 新 role / 產業 |
|------|---------------|---------------|-----------------|
| 罐頭（比熊）| [3,4,4,4]=15 | [7,8,8,7]=30 | PM / tech |
| Steve（雪納瑞）| [3,5,2,2]=12 | [7,9,7,7]=30 | QA / design |
| 泡芙（柴犬）| [3,4,3,4]=14 | [8,7,7,8]=30 | 企劃 / service |
| Max（巴哥）| [4,3,2,4]=13 | [9,6,7,8]=30 | 業務 / marketing |

stats 第 3 欄是 teamwork（→ patience，clamp 1-10）。

## 4. 角色重新命名

- `Flash` → `Sherry`（svc-C-3 客服 → tech-C-3 PM）

## 5. roster ID 對照（變動部分）

新 grade 分布每產業改為 D5+C4+B3+A3+S1（原本 D6+C4+B3+A2+S1）。多了 A-3、少了 D-6。

完整對照見 `src/constants/dogRoster.ts`。

## 6. 化學反應重寫

`src/constants/chemistryCombo.ts` 從 7 條改為 4 條，全部 positive，category 限定該產業：

```ts
[
  { roles: ['工程師', 'PM'],  category: 'tech',      qua×1.2, spd×1.2 },
  { roles: ['美術', 'QA'],    category: 'design',    qua×1.2, spd×1.2 },
  { roles: ['行銷', '業務'],  category: 'marketing', qua×1.2, spd×1.2 },
  { roles: ['客服', '企劃'],  category: 'service',   qua×1.2, spd×1.2 },
]
```

化學反應已套到 `estimateDailyContrib` 與 `computeTeamEffectiveQuality`，TeamEditModal「預估表現」的「💰 ×N」「📅 N/天」都會反應該乘數。

## 7. 角色 category map 同步更新

新版每 role 對口的 category 變單一（除 CEO）：

| role | 對口 category |
|------|----------------|
| 工程師 | tech |
| PM | tech |
| 美術 | design |
| QA | design |
| 行銷 | marketing |
| 業務 | marketing |
| 客服 | service |
| 企劃 | service |
| CEO | tech / design / marketing / service |

更新檔案：
- `src/constants/dogRoles.ts`（QA `tech→design`、企劃 `design→service`、PM `all→tech`）
- `src/lib/projectGen.ts:266` `roleMatch` map
- `src/lib/autoAssign.ts:6` `ROLE_CATEGORY` map
- `src/lib/toolsEngine.ts:167` `ROLE_TOOL_CATEGORY` map（PM 從 `null` 改 `tech`）

## 8. 新工具 3 個（tech 池）

`src/constants/tools.ts` 加：

| defId | name | iconName | category |
|-------|------|----------|----------|
| `tech-board` | 看板牆 | `toolBoard` | tech |
| `tech-gantt` | 甘特圖 | `toolGantt` | tech |
| `tech-plan` | 時程表 | `toolPlan` | tech |

對應 `ToolIconName` type 與 `SvgIcon.tsx` 都加上 3 個新 case（純 SVG 繪製）。

PM 因 `toolCategory` 改 `tech`，可裝備全部 6 種 tech 工具。

## 9. 存檔影響

### 9.1 後端白名單同步（必做）

`docs/saves-api.md`（draft-12）兩處白名單都已換版：

- 「Dog 名冊白名單」段（rosterId | name | breed | role | industry | grade 表格）
- 「完整白名單（複製給後端用，65 筆）」純 ID 清單

新增：`tech-A-3` / `design-A-3` / `mkt-A-3` / `svc-A-3`
移除：`tech-D-6` / `design-D-6` / `mkt-D-6` / `svc-D-6`
其餘 ID 仍存在，但角色 / 名字 / 產業可能變動（例 `svc-C-3` 從 Flash 客服 → 阿雅 企劃；`tech-D-4` 從 Steve QA → 米米 PM）。

**已 cp 同步到後端 repo**：`C:\Users\User\Desktop\dog_company\docs\saves-api.md`。
後端 server 必須同步換掉 hardcode 的白名單，否則新 ID（例 `svc-A-3`）寫入會被 4002 reject。

### 9.2 舊存檔讀回行為

舊存檔的 `staff[].rosterId` 可能出現：

| 情況 | 範例 | 影響 |
|------|------|------|
| ID 不存在於新清單 | `tech-D-6`（舊小吉 D QA）| 反查 `ROSTER_BY_ID` 拿不到，圖鑑顯示破掉；server 也會 reject |
| ID 存在但映射的狗變了 | `tech-A-2`（舊 缺缺 QA → 新 缺缺 工程師）| grade 對得上但 role 可能變動 |
| ID 存在且映射相同 | `tech-D-3`（Bug 工程師 D）| 完全 OK |

**處置方針**：本次重整不做自動遷移（產品決策「先不管舊存檔」）。雲端舊存檔讀回時依 `applySave` 流程：

- `staff[]` 內 rosterId 找不到 → 圖像 / flavor 走 fallback；payload 上傳會被 server reject。
- TeamEditModal 顯示時 role/category 以 `dog.role` 為準（saveSerializer 沿用存檔內欄位），化學反應觸發正確。

若日後要做自動遷移，需在 `src/lib/saveSerializer.ts` 加 rosterId remap 表，把舊 ID（例 `tech-D-6` 小吉 → `design-D-5`）映射過去。
