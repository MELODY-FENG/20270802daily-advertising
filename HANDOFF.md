# Handoff 归档 — 广告日监控看板

> 📅 归档日期：2026-08-02  
> 👤 作者：CC - AI 助理  

## 🔗 三端联动速查

| 端 | 地址 | 说明 |
|------|------|------|
| 🖥️ **本地** | `C:\Users\melod\Desktop\AD-3` | 开发主目录，所有源码在此 |
| 📦 **GitHub** | https://github.com/MELODY-FENG/20270802daily-advertising | 代码仓库（已推送 52 文件） |
| 🌐 **Vercel** | https://client-five-ashen-11.vercel.app | 生产网站（保持不变） |

```
本地修改 → GitHub Push → Vercel 自动构建部署 → 网站更新
  ↓
C:\Users\melod\Desktop\AD-3
  │  npm run build → client/dist/
  │  npm run dev   → http://127.0.0.1:5174
  │  npx vercel --prod --yes → https://client-five-ashen-11.vercel.app
  ↓
git push origin main → https://github.com/MELODY-FENG/20270802daily-advertising
```

> ⚠️ **注意**：当前 Vercel 部署是通过 CLI 手动 `npx vercel --prod --yes` 触发，**未**绑定 Git 自动部署。如需 Vercel 自动部署，在 Vercel Dashboard 中关联 GitHub 仓库。

### Vercel 项目凭证

| 项目 | 值 |
|------|------|
| Vercel 项目名 | `client`（显示为 `client-five-ashen-11`） |
| 项目 ID | `prj_AC6eOCdYFqqSNj8760lxI2ibEubZ` |
| 团队 ID | `team_GqJajlaJBXZlsh8ZtRUiJMo0` |
| 团队名 | `melody-feng` |
| 构建设置 | Vite 自动检测，`npm run build` → `vite build` |
| 输出目录 | `client/dist/`（`vercel.json` 如需要可添加） |

---

## 1. 网站与数据提取规范

### 1.1 数据来源与代码仓库

| 项目 | 说明 |
|------|------|
| 数据类型 | 亚马逊广告报表 Excel (.xlsx / .xls) |
| 数据业务 | 美线客厅家具柜 全部搜索广告-日监控 |
| 上传方式 | 浏览器端 SheetJS 解析（不上传服务器） |
| 示例文件 | `client/public/default-data.json`（5MB 示例数据） |
| 代码仓库 | https://github.com/MELODY-FENG/20270802daily-advertising |
| 生产网站 | https://client-five-ashen-11.vercel.app（三端保持一致） |

### 1.2 文件名格式规范

```
YYYYMMDD_YYYYMMDD.xlsx
例：20260715_20260721.xlsx
```

- 前半部分 = 起始日期，后半部分 = 结束日期
- 正则：`/^(\d{8})_(\d{8})$/`
- 工具函数：`src/utils/file-name.ts` → `validateFileName()`, `parseFileDates()`, `sortFileNamesByDate()`

### 1.3 数据字段映射表（16 列元组）

| 索引 | 字段名 | 类型 | 说明 |
|:--:|------|------|------|
| 0 | 投放状态 | `string` | 如 "已启用" / "已暂停" |
| 1 | 店铺 | `string` | 店铺名称 |
| 2 | 业务组 | `string` | 业务分组 |
| 3 | 业务负责人 | `string` | 负责人姓名 |
| 4 | 三级分类 | `string` | 商品三级分类 |
| 5 | 广告类型 | `string` | SP / SB / SD |
| 6 | 广告活动 | `string` | Campaign Name（唯一标识） |
| 7 | 日预算 | `number` | 货币值，去除 `$` 和逗号 |
| 8 | 当前预算 | `number` | 同上 |
| 9 | 花费 | `number` | 去除 `,` |
| 10 | 曝光量 | `number` | Impression |
| 11 | 点击量 | `number` | Clicks |
| 12 | 销量 | `number` | Sales Units |
| 13 | 销售额 | `number` | Sales Amount |
| 14 | 推广商品销量 | `number` | Promoted SKU Sales |
| 15 | 开关 | `string` | 广告开关状态 |

> **不可变约束**：索引映射定义在 `src/constants/col-mapping.ts` → `COL` 对象，所有组件通过 `COL.字段名` 引用，禁止硬编码索引数字。

### 1.4 Excel 解析规则

| 规则 | 实现 |
|------|------|
| 库 | SheetJS (`xlsx` 0.18.5) |
| 解析器 | `src/services/excel-parser.ts` → `parseExcelFile()` |
| 表头匹配 | 通过 `NEEDED_COLS` 数组按名称 `findIndex`，**不依赖列顺序** |
| 货币清洗 | `$`, `,` 去除后 `parseFloat` |
| 百分比清洗 | `%`, `,` 去除后 `parseFloat` |
| 空值处理 | `null`, `undefined`, `'--'`, `''` → `0`（数值列）/ `''`（文本列） |
| 空行跳过 | `row.every(c => c === null \|\| c === undefined \|\| c === '')` |

### 1.5 筛选器定义（10 个）

| 筛选器 ID | 标签 | 类型 | 映射列 |
|------|------|------|:--:|
| `filter-switch` | 开关 | dropdown | 15 |
| `filter-file` | 文件 | dropdown | — (动态) |
| `filter-status` | 投放状态 | dropdown | 0 |
| `filter-store` | 店铺 | dropdown | 1 |
| `filter-bizgroup` | 业务组 | dropdown | 2 |
| `filter-owner` | 业务负责人 | dropdown | 3 |
| `filter-category` | 三级分类 | dropdown | 4 |
| `filter-adtype` | 广告类型 | dropdown | 5 |
| `filter-isnew` | 是否新增 | dropdown | — (特殊逻辑) |
| `filter-campaign` | 广告活动 | text | 6 (模糊匹配) |

> 定义文件：`src/constants/filter-defs.ts` → `FILTER_DEFS`  
> 过滤逻辑：`src/utils/filter.ts` → `rowPassesFilters()`, `applyFilters()`

---

## 2. 视觉与设计规范

### 2.1 色号系统

| Token | 值 | 用途 |
|------|------|------|
| `--c-primary` | `#A67C52` | 主色调 / 强调 |
| `--c-accent` | `#8B6239` | 副色调 / 副标题 |
| `--c-light` | `#D9C8B4` | 浅色 / 边框 |
| `--c-bg` | `#F8F3ED` | 页面背景（暖奶油） |
| `--c-tint` | `#E8C9B0` | 装饰渐变 |
| `--text-primary` | `#4A3828` | 主文字 |
| `--text-secondary` | `#776251` | 辅助文字 |
| `--c-good` | `#7BA068` | 绿色（利好） |
| `--c-bad` | `#C0805A` | 红色/棕色（不利） |

ECharts 色板：`src/theme/tokens.ts` → `echartsWarmBrownPalette`（10 色暖棕系）

### 2.2 条件格式色阶

**ACOS 色阶**（越低越好）：≤0 灰 → ≤30% 绿 → ≤50% 金 → ≤100% 橙 → >100% 红

**CVR 色阶**（越高越好）：≤0 灰 → >15% 青绿 → >10% 蓝 → >5% 浅蓝 → ≤5% 淡蓝

**CPC 色阶**（越低越好）：≤0 灰 → ≤0.5 绿 → ≤1.0 金 → ≤2.0 橙 → >2.0 紫

**进度条 5 档**：`lvl-1`(#D9C8B4) → `lvl-5`(#6B4A2A)（`src/components/shared/ProgressBarCell.tsx`）

### 2.3 字体

| 用途 | 字体栈 |
|------|------|
| 正文 | `Fira Sans`, `PingFang SC`, `Microsoft YaHei`, sans-serif |
| 等宽/数字 | `Fira Code`, `Cascadia Code`, monospace |
| 来源 | Google Fonts (Fira Code + Fira Sans) |

### 2.4 布局与组件

| 层级 | 组件 | 说明 |
|------|------|------|
| 框架 | Ant Design 5.23 + React 19 | ConfigProvider + 中文 locale |
| 状态 | Zustand 5 | 全局 Store（`src/store/dashboardStore.ts`） |
| 图表 | ECharts 5.6 + echarts-for-react | 按需注册模块 |
| 表格 | antd Table | 手风琴折叠 (Collapse) + 分页 |
| 样式 | CSS Variables | `src/theme/globals.css`，玻璃拟态卡片 |

### 2.5 响应式断点

| 断点 | 行为 |
|------|------|
| ≤1400px | 字号缩小，卡片压缩 |
| ≤1200px | 左栏自动折叠 |
| ≤900px | 紧凑模式 |
| ≤600px | 手机适配 |

---

## 3. 已完成工作与交付物

### 3.1 页面导航（5 个一级板块）

```
📊 广告日监控看板
├── 📈 汇总数据 (summary)      ← 指标概览 + 汇总警示 + 最新趋势 + 业务组/负责人数据
├── 🏪 店铺数据 (store)        ← 店铺明细 + 广告类型明细
├── 🏷️ 三级分类 (category)     ← 三级分类明细 + 分类×广告类型
├── 📉 多日趋势 (trend)        ← 5 个二级主题 ⬇
└── 🗃️ 全量数据 (full)         ← 原始明细表
```

### 3.2 多日趋势 — 5 个二级主题

| # | 面板 | 组件 | 说明 |
|:--:|------|------|------|
| 1 | 数据趋势图 | `DataTrendChart` | 柱状（花费）+ 折线（ACOS%），立体柱状设计，数据标签白底金文 |
| 2 | 业务组数据趋势表格 | `BusinessGroupTrendTable` | 行=业务组，列=日期组（$CPC/CVR%/ACOS%），三色进度条+环比箭头 |
| 3 | 三级分类数据趋势表格 | `CategoryTrendTable` | 同设计，维度=三级分类 |
| 4 | 异常CAM日进度表格 | `AbnormalCamTable` | 业务负责人×日期 → 异常N/新增N/持续N |
| 5 | 异常CAM日表现表格 | `AbnormalCamPerformanceTable` | 异常CAM逐日花费/点击量/ACOS%+环比箭头，右侧绿色总计 |

### 3.3 指标概览卡片

> `MetricCardRow` → 9 个 `MetricCard`：花费、点击量、销量、销售额、CPC、CTR、CVR、CPO、ACOS

### 3.4 图表组件

| 组件 | 类型 | 用途 |
|------|------|------|
| `DataTrendChart` | 柱+折线 | 跨日期 花费+ACOS% 趋势 |
| `SpendBarChart` | 水平柱状 | Top10 业务组花费对比 |
| `TrendLineChart` | 双折线 | ACOS% + ROAS 趋势 |
| `BusinessGroupTrendChart` | 折线 | ⚠️ 已废弃，被表格版替代 |

### 3.5 工具模块

| 文件 | 功能 |
|------|------|
| `utils/calc.ts` | 聚合计算（`calcAggregates`, `groupByCampaign`, `groupBy`, `groupByTwo`） |
| `utils/format.ts` | 格式化（`safeDiv`, `fmtMoney`, `fmtPct`, `fmtInt`） |
| `utils/filter.ts` | 筛选过滤（`rowPassesFilters`, `applyFilters`） |
| `utils/file-name.ts` | 文件名验证/解析/排序 |
| `utils/sort.ts` | 表格排序 |
| `utils/acos.ts` | ACOS 范围判断 |
| `utils/table-stats.ts` | 表格统计（max/min/avg） |
| `services/excel-parser.ts` | Excel 解析（SheetJS） |
| `services/excel-exporter.ts` | 数据导出 |

### 3.6 部署与仓库

| 项目 | 配置 |
|------|------|
| 生产 URL | https://client-five-ashen-11.vercel.app |
| GitHub 仓库 | https://github.com/MELODY-FENG/20270802daily-advertising |
| 平台 | Vercel（CLI 手动部署） |
| Vercel 项目 ID | `prj_AC6eOCdYFqqSNj8760lxI2ibEubZ` |
| Vercel 团队 ID | `team_GqJajlaJBXZlsh8ZtRUiJMo0` |
| 框架 | Vite 6 + React 19 |
| 构建命令 | `npm run build`（= `vite build`） |
| 输出目录 | `client/dist/` |
| Git 分支 | `main` |

---

## 4. 关键决策与碎片信息

### 4.1 设计决策

1. **纯前端架构**：无后端服务器，Excel 解析在浏览器完成，数据存 Zustand Store。
2. **列映射不可变**：`COL` 对象使用中文键名直接映射 16 列索引，所有组件通过 `COL.字段名` 引用，不硬编码数字。
3. **筛选不自动刷新**：FilterBar 点击"确认"才应用筛选，支持批量选择后统一计算。
4. **手风琴折叠**：所有二级面板使用 Ant Design Collapse，`accordion: true` 同时只展开一个。
5. **环比定义**：每个日期与前一个日期文件比较（文件按日期排序），非同比。
6. **异常CAM 定义**：ACOS=0% 且点击量≥50，或 ACOS>100%。
7. **趋势表格设计**：用 `DimensionTrendTable` 工厂组件复用，传入 `dimensionCol` + `dimensionName` 即可生成不同维度表格。
8. **日期展示**：趋势图横轴取文件名尾部日期 `parsed[1]`（如 `20260721`），趋势表格取 `parsed[1].slice(4)`（如 `0721`）。

### 4.2 已解决的 Bug

| Bug | 修复 |
|-----|------|
| 数据趋势图日期不统一 | 有数据时 `dates.push(fn)` 用了完整文件名，修复为统一用 `parseFileDates` 取尾部 |
| 日期遮挡 Y 轴标签 | 去掉 X 轴 `offset`，加大 `grid.bottom`，`fontSize: 12` + `fontWeight: 500` |
| ACOS/CVR 标签被剪切 | 加大 `grid.top: 55`，`distance: 14`，标签加白底背景 |
| 数据标签颜色 | 花费用 `insideBottom` + 白底金文 `#D4A857`；ACOS 用 `top` + 同色系 |

### 4.3 未写入代码的约定

- 所有数值展示用 `en-US` locale（逗号千分位）
- 环比的 ↑ 红色表示上升（花费/ACOS 上升=不好），↓ 绿色表示下降
- 文件按 `parseFileDates` 的起始日期排序
- `BusinessGroupTrendChart` (echarts 折线图版) 已废弃但文件保留，Dashboard 不再引用

---

## 5. 待办事项与下一步计划

### 5.1 待开发功能

- [ ] 三级分类趋势图 → 考虑是否也升级为三指标表格（目前是复刻业务组表格）✅ 已完成
- [ ] 广告活动级别的日趋势表格（维度=广告活动，同设计模板）
- [ ] 数据自动刷新 / WebSocket 推送
- [ ] 移动端触摸优化（当前响应式仅基础适配）
- [ ] Excel 模板导出（当前仅支持原始数据导出）
- [ ] 告警阈值自定义配置面板
- [ ] 历史数据对比（选定两个日期范围对比）

### 5.2 已知限制

- 大文件（>10MB）时浏览器解析可能卡顿，建议分文件上传
- `default-data.json` 为示例数据（~5MB），生产环境应删除或替换
- 无后端持久化：刷新页面后数据丢失，需重新上传

---

## 6. 运行与验证指令

### 6.1 本地开发

```bash
# 进入客户端目录
cd C:\Users\melod\Desktop\AD-3\client

# 安装依赖
npm install

# 启动开发服务器 (http://127.0.0.1:5174)
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npx vite preview
```

### 6.2 部署到 Vercel

```bash
cd C:\Users\melod\Desktop\AD-3\client

# 部署到预览环境
npx vercel

# 部署到生产环境
npx vercel --prod --yes
```

### 6.3 验证清单

```bash
# 1. 检查 TypeScript 编译
npx tsc --noEmit

# 2. 检查构建产物
npm run build
ls -la dist/

# 3. 访问生产环境
# https://client-five-ashen-11.vercel.app

# 4. 验证关键功能
# - 上传 Excel 文件（支持文件夹批量上传）
# - 切换左侧导航栏 5 个板块
# - 筛选器选择 + 确认按钮联动
# - 多日趋势 → 5 个手风琴面板全部可展开
# - 数据趋势图：柱状体 + 折线 + 数据标签
# - 业务组/三级分类趋势表格：三指标 + 三色进度条 + 环比箭头
# - 异常CAM 表格：进度 + 表现 + 绿色总计条数
# - 导出功能
```

---

> 🤖 本文档由 Claude Code 生成于 2026-08-02，供后续 AI 无缝接管。  
> 📁 项目仓库：`20270802daily-advertising`  
> 📧 咨询老师：PowerVIP
