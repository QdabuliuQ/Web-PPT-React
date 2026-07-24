# WebPPT 智能模板生成 Agent 技术方案

> 版本：v1.0（对齐当前 WebPPT 代码库）  
> 适用范围：自研网页 PPT 编辑器模板自动生成  
> 真源约束：最终产物必须可被现有 Zustand 文档模型直接加载渲染

---

## 0. 方案概述

### 0.1 目标

搭建解耦、可校验、可断点、可自修复的 AI PPT 模板生成工作流，根据用户自然语言需求，自动完成主题规划、文稿填充、差异化配图、结构编译、视觉校验，输出可直接进入 WebPPT 画布的标准文档 JSON、素材图与市场预览图。

### 0.2 与代码对齐的硬约束

| 项 | 代码实际（真源） |
|----|------------------|
| 画布尺寸 | `1000 × 562.5` px（16:9），见 `src/constants/canvas.ts` |
| 文档模型 | `{ name, pages[], grid*… }`，页内绝对坐标 `elements[]` |
| 元素类型 | 仅 `text \| table \| image \| icon \| chart \| mindmap` |
| 图片字段 | `image.src`（URL / dataURL），无 `assetKey` 运行时字段 |
| 页背景 | `backgroundType`: `solidColor` \| `texture`；纹理为内置 SVG |
| 主题 | 无全局品牌色板；颜色写在元素 / 页面字段上 |
| 数量上限 | `MAX_PAGES=50`，`MAX_ELEMENTS_PER_PAGE=50` |
| 缩略图 | 已有 `PreviewCanvas` + `pageThumbnail`（snapdom） |
| PPTX | 仅导出，无导入；不可作为 Agent 输入源 |

### 0.3 核心痛点与对策

| 痛点 | 对策 |
|------|------|
| LLM 无像素认知 | Layout 骨架锁死几何；LLM 只填槽位内容 |
| 输出结构混乱 | 中间态 meta ≠ 最终 JSON；CompileEngine 唯一写 Document |
| 审美不统一 | 样例约束 + ThemeMapper 统一注入样式 |
| 配图同质化 | 每页独立插图 Prompt + asset 映射回填 |
| 流程脆弱 | 分层解耦、中间文件断点、单页回炉 |
| 质量不可控 | 同构渲染测高校验 + 定向重生成 |

---

## 1. 整体架构与执行流程

### 1.1 设计原则

1. **权限三分**：骨架管几何，ThemeMapper 管样式，LLM 管文案与创意素材。  
2. **中间态与交付态分离**：`meta.json` 可人工改；`document.json` 必须可加载。  
3. **同构校验**：视觉检测走与编辑器一致的 React 渲染路径，避免双套像素差。  
4. **失败局部化**：单图失败、单页不合格不拖垮全流程。

### 1.2 执行链路（定稿）

```
用户自然语言
  → ThemeAgent（主题 token + 对比度预检）
  → ContentAgent（固定骨架槽位填文案 + 每页绘图 Prompt）
  → meta.json（可人工微调 / 断点）
  → ImageAgent（批量绘图 + 容错）
  → asset-map.json
  → CompileEngine（骨架 ⊕ 主题 ⊕ 文案 ⊕ 图片 → Document JSON）
  → VisualGate（越界 / 对比度 / 空图 / 标题与密度等硬规则）
       ↓ 不合格：定向回炉对应页槽位
  → 产出 document.json + assets/ + preview.png
```

### 1.3 模块边界

| 模块 | 输入 | 输出 | 部署建议 |
|------|------|------|----------|
| ThemeAgent | 用户需求 + 审美样例 | 主题 token | LLM 服务 |
| ContentAgent | 主题 + Layout 骨架库 | meta.json | LLM 服务 |
| ImageAgent | meta 绘图任务 | asset-map.json + 本地图 | 绘图 API |
| CompileEngine | meta + asset-map + 骨架 | document.json | Node（确定性代码） |
| VisualGate | document.json | 缺陷报告 / 回炉指令 | Node + 现有渲染组件 |
| PreviewAgent | document 封面页 | preview.png | 复用 pageThumbnail |

---

## 2. WebPPT 文档契约（最终交付真源）

### 2.1 Document

```ts
{
  name: string;
  gridSize?: number;
  gridType?: "grid" | "line" | "none";
  // …编辑器辅助字段可给默认值
  pages: Page[];
}
```

### 2.2 Page（对齐 `pptStore.Page`）

| 字段 | 说明 |
|------|------|
| `id` | `page_<id>` |
| `elements` | 元素列表，zIndex 升序渲染 |
| `visible` | 导出过滤 `false` |
| `backgroundType` | `solidColor` \| `texture`（短期）；长期可扩 `image` |
| `background` | 纯色色值，或 texture 模式下的兼容字段 |
| `bgColor` / `fgColor` / `bgOpacity` | 纹理底色 / 前景色 / 透明度 |
| `selectedTexture` | 纹理 id（如 `texture-1`），运行时已用、类型可补齐 |
| `toggleInAnimation` / `Duration` / `Delay` | 进场动画，生成时用默认值 |
| `autoToggle` / `autoToggleTime` | 自动翻页默认关闭 |
| `remark` | 备注 |

### 2.3 Element 公共字段

`id, type, x, y, width, height, rotate, zIndex`  
坐标单位：画布 px；合法范围落在 `[0,1000] × [0,562.5]`（允许轻微贴边，校验出界）。

ID 约定：`{type}_{random}`，与现有 `getRandomId` 一致。

### 2.4 各类型必填（生成侧按 Create* 补齐）

**text**  
`text, fontSize(12–50 建议偶数), fontFamily, color, bold, italic, underline, strikethrough, lineHeight, shadow*, border*, backgroundColor, placement`  
`placement` 仅 9 档：`left|center|right` × `top|center|bottom`。

**image**  
`src, opacity, border*, borderRadius, keepRatio?…`  
Compile 时：`src = asset-map[assetKey].url`。

**table**  
`dataSource`（单元格含 value/样式/placement）、`columnWidths`（% 和≈100）、`rowHeights?`、边框样式。无合并单元格；网格建议 ≤10×10。

**chart**  
`chartType`（既有枚举）+ 完整合法 `option`（ECharts）。**禁止 LLM 自由写 option**，由数据表 + option 模板填充。

**icon**  
`iconName`（IconPark 白名单）、`fill[], theme, strokeWidth`。

**mindmap**  
短期模板可不生成；若需要，用 X6 `{ nodes, edges }` 模板填充。

### 2.5 背景策略（短期落地）

优先方案（零改引擎）：AI 背景/装饰作为 **全页底层 `image` 元素**（最低 zIndex），页 `backgroundType=solidColor` + 主题底色。

备选：继续用内置 `texture` + ThemeMapper 写 `bgColor/fgColor/bgOpacity/selectedTexture`。

长期：扩展 `backgroundType: "image"` 并改 Canvas/导出。

---

## 3. Layout 骨架机制

### 3.1 定义

骨架 = 预置的 `Page` 片段：几何与 `type` 锁死，槽位带语义角色。

```ts
type SlotRole = "title" | "subtitle" | "body" | "bullet" | "image" | "chart" | "icon" | "decor";

type LayoutSlot = {
  role: SlotRole;
  elementId: string;       // 骨架内稳定 id，Compile 可重映射
  type: Elements["type"];
  x: number; y: number; width: number; height: number;
  zIndex: number;
  // 给 LLM 的软约束（非运行时字段）
  maxChars?: number;
  hint?: string;
};
```

### 3.2 预设 6 类页面（推荐）

| layoutKey | 用途 | 主要元素 |
|-----------|------|----------|
| `cover` | 封面 | text×2 + image |
| `toc` | 目录 | text 标题 + 多条 text/bullet |
| `two-column` | 双栏图文 | text + image |
| `three-points` | 三要点 | text×4 + 可选 icon×3 |
| `chart` | 数据页 | text + chart（+ 可选 table） |
| `ending` | 封底 | text + image |

页数：默认 **6–10** 页，类型合理搭配；硬上限 50。

### 3.3 LLM 禁止事项（Prompt 强制）

- 禁止增删改槽位、改 x/y/w/h/zIndex/type  
- 禁止自创元素类型 / shape / group  
- 禁止输出最终 Document；只输出槽位内容与绘图 Prompt  

### 3.4 样式注入归属

字号、颜色、行高、placement、圆角、阴影、边框 → **ThemeMapper** 按主题 token + 槽位角色写入，不由 LLM 决定。

---

## 4. 样例学习

| 类型 | 格式 | 用途 | 接入点 |
|------|------|------|--------|
| 视觉样例 | PNG/JPG 页面截图 | 留白、配色、层级、质感 | Theme / Content 多模态 Prompt |
| 格式样例 | 合规 meta.json | 字段、命名、槽位填充范式 | 全部 LLM 子 Agent |
| Layout 样例 | 骨架 JSON | 版式参考 | ContentAgent + Compile |

**禁止**将原始 PPTX 直接喂给 Agent（仓库无导入能力）。PPTX 仅人工预处理为截图 + Layout JSON。

---

## 5. 各 Agent 技术规格

### 5.1 ThemeAgent

**输入**：用户需求、视觉样例  
**输出**（主题 token，非 Document）：

```ts
{
  templateName: string;
  category: string;
  tags: string[];
  primary: string;
  secondary: string;
  background: string;      // 页底色
  textOnLight: string;
  textOnDark: string;
  fontTitle: string;
  fontBody: string;
  globalBgPrompt?: string;
  globalDecorPrompt?: string;
}
```

**校验**：文字色与背景对比度 ≥ 4.5（WCAG）；不达标重生成或自动换 `textOnLight/Dark`。

### 5.2 ContentAgent

**输入**：主题 token、选定骨架序列、格式样例  
**能力**：

- 规划 6–10 页 layoutKey 序列  
- 按槽位生成文案（尊重 `maxChars` 软上限）  
- 每页生成专属插图 Prompt（一页一图）  
- 绑定 `pageId`、槽位 `assetKey`  

**输出**：`meta.json`

### 5.3 ImageAgent

**输入**：meta 中全部绘图任务  
**分类**：全局背景/装饰、逐页插图  
**能力**：并发限制、超时重试（建议 3 次）、单失败不中断、本地下载、写 CDN/本地路径  

**输出**：`asset-map.json`

```ts
{
  [assetKey: string]: { url: string; localPath?: string; width?: number; height?: number }
}
```

### 5.4 CompileEngine（确定性，非 LLM）

**步骤**：

1. 按 meta 页序列加载 Layout 骨架  
2. ThemeMapper 注入元素样式与页背景字段  
3. 槽位文案写入对应元素  
4. `assetKey` → `image.src`  
5. 图表：系列数据 → 预置 ECharts option 模板  
6. 自动修复：超长截断、对比度二次写色、非法 placement/icon 名兜底  
7. 输出完整 `document.json`（Zod 校验）

### 5.5 VisualGate

**渲染**：`PreviewCanvas`（与缩略图同源）  
**检测项**：

- 元素出画布  
- text：`scrollHeight > height`（真溢出，优于纯字符数）  
- 对比度不足  
- image 空 src / 加载失败  
- 单页元素数 > 50  

**回炉**：生成定向修复指令（页 id + 槽位 + 缺陷类型）→ ContentAgent 仅改该页 → 重 Compile → 重检，设最大迭代次数（建议 3）。

### 5.6 PreviewAgent

复用 / 封装 `pageThumbnail` 管线，对封面页导出市场尺寸（如 480×270）。不必强制 Puppeteer。

---

## 6. 文件规范

### 6.1 meta.json（中间态）

```ts
{
  version: "1.0",
  theme: { /* ThemeAgent 输出 */ },
  pages: Array<{
    pageId: string;
    layoutKey: string;
    slots: Array<{
      role: string;
      elementId: string;
      content?: string;          // text
      tableData?: unknown;       // table
      chartSeries?: unknown;     // chart 数据
      assetKey?: string;         // image
      imagePrompt?: string;
    }>;
  }>;
  drawTasks: Array<{
    assetKey: string;
    prompt: string;
    scope: "global" | "page";
    pageId?: string;
  }>;
}
```

### 6.2 asset-map.json

见 5.3。

### 6.3 最终产物

| 产物 | 说明 |
|------|------|
| `document.json` | 可 `setPages` / 初始化加载的 WebPPT 文档 |
| `assets/` | AI 图本地文件 |
| `preview.png` | 市场封面缩略图 |
| `report.json`（可选） | 校验结果、回炉次数、失败任务 |

---

## 7. 视觉修复规则（Compile + Gate）

| 规则 | 实现 |
|------|------|
| 文本超高 | 由 Layout/HTML 测量保证；Gate 不再做文字截断测高 |
| 图片 | 容器几何锁死；前端 `object-fit` 行为与编辑器一致；禁止 LLM 改框 |
| 对比度 | chroma-js 或等价；不达标切换 textOnLight/Dark |
| 样式统一 | 仅 ThemeMapper 写样式字段 |
| Icon | 白名单校验，失败用默认 `iconName` |
| Chart | 仅填数据进模板，保证 `chartType` 合法 |

---

## 8. 异常与容错

| 场景 | 策略 |
|------|------|
| LLM 调用失败 | 重试 3 次；记日志；可从断点续跑 |
| 单图失败 | 跳过并标记；支持只重跑 ImageAgent |
| 文案仍溢出 | Gate 回炉该槽；达上限则硬截断并告警 |
| 主题对比度失败 | 自动换文字色；再失败重跑 ThemeAgent |
| 校验渲染失败 | 记日志；支持手动重触 VisualGate |
| Zod 不通过 | Compile 失败，不进入 Gate |

断点：任意阶段可读已有 `meta.json` / `asset-map.json` 续跑。

---

## 9. 性能与扩展

### 9.1 性能

- 绘图分片并发 + 限流  
- meta / asset-map 缓存复用  
- 图片压缩后入库（注意与编辑器上传 3MB/最长边 1920 策略协调）  
- VisualGate 可并行多页截图（控制并发）

### 9.2 扩展

**短期**：扩骨架库、样例库、修复规则；补齐 `Page.selectedTexture` 类型；图表模板库。  

**中期**：`backgroundType: "image"`；批量生成；OSS 上传写 CDN url。  

**长期**：质量分级、自动打标、入库模板市场。

---

## 10. 落地实施计划

| 阶段 | 交付 | 依赖代码 |
|------|------|----------|
| P0 | Layout 骨架库（1000×562.5）+ Zod Document schema | `canvas.ts`, element 类型 |
| P0 | CompileEngine（无 LLM 可单测） | Create* 默认字段 |
| P1 | ThemeMapper + Content/Theme Prompt | — |
| P1 | ImageAgent + asset-map → src | `IImageProps.src` |
| P2 | VisualGate 接 PreviewCanvas / pageThumbnail | `PreviewCanvas`, `pageThumbnail.ts` |
| P2 | 回炉闭环 + preview 导出 | — |
| P3 | 服务化 API / 本地 CLI | — |

验收标准：生成的 `document.json` 可在编辑器打开，无大面积溢出/重叠，封面有 preview，抽检对比度达标。

---

## 11. 明确不做（本期）

- 以 1920×1080 为生成坐标系  
- 让 LLM 直接输出最终 pages/elements  
- 直接解析 PPTX 进 Agent  
- 以 PPTX 导出视觉为唯一验收金标准（纹理/滤镜/圆角有损）  
- 宣称「零人工」：默认自动，保留 meta 微调入口  

---

## 12. 价值总结

本方案在保留「骨架锁结构、样例锁审美、引擎修瑕疵、校验锁质量」四层闭环的同时，把交付物严格锚定到 **WebPPT 现有 Document / 元素模型 / 1000×562.5 画布 / 同构缩略图管线**。LLM 只负责创意内容，CompileEngine 负责结构合法，VisualGate 负责商用质量，从而可直接对接编辑器渲染与模板市场业务。
