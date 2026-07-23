# WebPPT Agent：HTML 排版 → document.json 解决方案

## 1. 背景与问题

### 现状（旧流水线）

```
ThemeAgent → ContentAgent(meta) → ImageAgent → compileDocument(skeleton) → document.json
```

- 布局由 **固定骨架**（约 20+ 套绝对坐标 slot）决定，LLM 只填文案/图标/图。
- 图标对齐、疏密、卡片层次依赖事后补丁（如 `alignIconText`），整体易显「模板感 / 对不齐」。

### 目标

- 提升版式与对齐质量（尤其 icon–文字、卡片组）。
- 最终产物仍是可编辑的 **`document.json`**（编辑器 + 现有 PPTX 矢量导出不断）。
- **禁止**整页截图当 PPT；元素须为原生 text/shape/icon/image/chart/table。
- **新流水线不依赖布局骨架**（无 `layoutKey` / `skeletons/*` / slot 填空）。

---

## 2. 方案概述

**用浏览器当排版引擎，用标记节点当导出边界；坐标与构图不再来自骨架。**

1. Agent 按项目 Skill 生成 **受限幻灯片 HTML**（布局可用 flex/grid）。
2. 凡进入 PPT 的可视对象标记 `data-element="1"` + `data-type` + 白名单 `data-*`。
3. Puppeteer 以 **1000×562.5** 渲染；对标记节点做 `getBoundingClientRect`。
4. 确定性编译为绝对定位 `Elements[]`，组装 `document.json`。

核心原则：

| 角色 | 负责 |
|------|------|
| LLM + Skill | 结构、文案、视觉意图、自由 CSS 布局（替代骨架） |
| 浏览器 | 最终几何（x/y/w/h） |
| 代码编译器 | 校验、属性映射、主题注入、图片回填 |
| 现有导出 | `document.json` → pptxgenjs（不变） |

### 为何不需要骨架

| 骨架原职责 | 新流水线 |
|------------|----------|
| 写死 slot 的 x/y/w/h | Puppeteer 实测 rect |
| 规定一页有哪些坑位 | LLM 在 HTML 中放置 `data-element` 节点 |
| 绑定 `layoutKey` | 不再使用；可选保留 **pageType / 页序** 仅管叙事节奏 |
| 限制 LLM「乱排」 | Skill 契约 + 白名单校验 + VisualGate |

**结论：新流水线目标态下 `layout/skeletons/*`、`layoutKey`、基于 slot 的 `compileDocument` 均不需要。**  
旧骨架代码仅作迁移期对照或删除对象，不是运行依赖。

---

## 3. 端到端流程（无骨架）

```
用户 Prompt
    │
    ▼
┌─────────────┐
│ ThemeAgent  │  主题色 / 字体
└──────┬──────┘
       ▼
┌──────────────────┐
│ PagePlan（可选） │  仅叙事：页数 / pageType 顺序
│                  │  不绑定 layoutKey / 骨架
└──────┬───────────┘
       ▼
┌──────────────────┐
│ LayoutAgent      │  注入 webppt-slide-html Skill
│ 每页 → slide.html│  data-element + flex/grid 自由布局
└──────┬───────────┘
       ▼
┌──────────────────┐
│ ImageAgent       │  data-asset-key / data-image-prompt
│ 写回 img src     │  全幅背景 data-bg-image-key
└──────┬───────────┘
       ▼
┌──────────────────────────────┐
│ htmlCompile (Puppeteer)      │  ← 唯一布局编译入口（替代 skeleton compile）
│ 1. 固定视口 1000×562.5       │
│ 2. fonts.ready + 图片 load   │
│ 3. query [data-element="1"]  │
│ 4. rect 相对 #slide 原点     │
│ 5. data-* → Element 字段     │
│ 6. 可选：对齐/出界后处理     │
└──────┬───────────────────────┘
       ▼
┌──────────────────┐
│ document.json    │  loadDocument / 编辑器 / exportPptx
└──────────────────┘
       │
       ▼
  VisualGate / VL 打分（可对 HTML 或编译结果截图）
```

### 与旧流程对照

| 环节 | 旧（骨架） | 新（本方案） |
|------|------------|--------------|
| 布局源 | `skeletons/*` + `layoutKey` | **无骨架**；HTML + CSS |
| 中间 IR | `meta.json`（slot fills） | 每页 HTML |
| 坐标 | 骨架写死 | Puppeteer 实测 |
| 对齐 | 启发式补丁 | CSS flex + 可选后处理 |
| Compile | `compile/engine.ts` | **仅** `htmlCompile` |
| 页序 | pageType → 白名单 layout | pageType（可选）只指导内容，不选骨架 |
| 导出 PPTX | 已有 | 不变 |

---

## 4. HTML 契约（导出方言）

### 画布

- 根节点 `#slide`：`width:1000px; height:562.5px; position:relative; overflow:hidden`
- 坐标系：rect 减去 slide 原点 → 元素 `x/y/width/height`

### 脚手架 vs 导出节点

- **无** `data-element`：仅布局（flex 容器、spacer），**不进 JSON**。
- **有** `data-element="1"`：必须进编辑器；卡片底板、强调条也必须自标 `shape`，不可只靠父级背景。

### 允许的 `data-type`

`text` | `image` | `icon` | `shape` | `chart` | `table`  
（对齐 `src/agent/catalog/platform.ts`；禁止 mindmap/richHtml/video 等）

### 属性

- 导出字段以 **`data-*` 为准**（字号、颜色、粗体、iconName、shapeType、chart series…）。
- CSS 负责排版；文本样式不要只写在 CSS 里。
- 尽量避免 export 节点上的 `transform`/`scale`。

完整枚举与字段见：

- `.cursor/skills/webppt-slide-html/SKILL.md`
- `.cursor/skills/webppt-slide-html/reference.md`
- `.cursor/skills/webppt-slide-html/examples.md`

---

## 5. Skill 策略

| 层级 | 用途 |
|------|------|
| **webppt-slide-html**（项目 Skill，已建） | Pipeline / LayoutAgent 必读：方言 + 自检 + 样例（**替代骨架约束**） |
| 通用 frontend-design（可选） | 仅人工设计讨论；**不**直接挂自动生成，以免产出无法映射的网页 |

Pipeline 须 **显式把 Skill 正文注入** LayoutAgent system prompt（Cursor Skill 不会自动进 `run-agent`）。

---

## 6. 编译器设计要点

模块：`src/agent/htmlCompile/`（命名可调整）——**新流水线的唯一 compile 路径**，不调用 `getLayout(layoutKey)`。

| 步骤 | 说明 |
|------|------|
| `renderSlide(html)` | Puppeteer，`deviceScaleFactor: 1`，视口对齐画布 |
| `waitReady` | `document.fonts.ready` + 图片 decode/load |
| `collectNodes` | `[data-element="1"]` |
| `measure` | `getBoundingClientRect` 或 `boundingBox`，相对 `#slide`，`Math.round` |
| `mapElement` | `data-type` → Create* / 与 `ELEMENT_SCHEMAS` 对齐 |
| `postProcess` | 出界裁剪；icon-text 中线微调；`fitTextBox` |
| `assembleDocument` | `{ name, theme, pages[] }` 兼容 `loadDocument` |

### 类型映射注意

- **text**：`textContent` 纯文本；`height` 用实测或再 fit。
- **icon**：`data-icon-name` → 平台 Icon，不要栅格化 SVG 进 JSON。
- **shape**：卡片/装饰条；`data-shape-type` + `data-fill`。
- **image**：测前必须有可加载 `src`；失败则占位并记 gate 缺陷。
- **chart/table**：几何用 rect；数据用 `data-series` / `data-table`，禁止从 DOM 反推 ECharts option。

---

## 7. 图片与主题

1. Layout 阶段 HTML 须带详细英文 `data-image-prompt` / `data-bg-image-prompt`（主体、光影、色板、禁项）；封面叠白字时 bg 图必须偏暗。
2. **文案与信息密度在 Layout 首轮 HTML 定稿**；短需求须自由扩写。Gate/Score 不负责把空壳页写满。
3. ImageAgent 生成后写本地/`/agent-assets/` URL，再编译。
4. 编译：无页级 `data-bg-image-key` 时，hero/close 或深色 `data-bg` **不**回退浅色 `bg_global`，避免白字不可读。
5. **文本几何**：`document.json` 的 x/y/width/height **等于** Puppeteer `getBoundingClientRect`；文案用 **`innerText`**（`<br>` → `\n`），不用会丢换行的 `textContent`。
6. Gate 回炉后须同步写回 `html-pages/`，与 `document.json` 同源。
7. Layout 的每个 text 节点必须写全 data-font-size / data-font-family / data-color / data-line-height / data-placement，且 CSS 与之一致；禁止只写 style 漏 data-*（否则易出现本机 1.6、JSON 默认 1.4 等偏差）。

---

## 8. 质量门禁

- **结构校验**：未知 type、缺标记可视块启发式检测、出界、icon 白名单。
- **视觉**：复用截图 + VL score；可直接对 HTML 截图（与测量同源）。
- **修复**：优先改 HTML 再编译；避免 LLM 直接改 `document.json` 坐标。

---

## 9. 明确不做什么

- **不使用** `layout/skeletons`、`layoutKey`、meta slot 填空作为新流水线输入。
- 不把任意互联网级 HTML/CSS 一键转 PPT。
- 不依赖 pptxgenjs `tableToSlides` 做整页转换。
- 不整页截图嵌入 PPTX 冒充矢量。
- 不把通用「生成网页」Skill 当作唯一生成约束。

---

## 10. 落地分期与双轨运行

当前仓库 **同时保留两种生成方式**（默认 skeleton）：

| 模式 | 入口 | 说明 |
|------|------|------|
| **skeleton**（默认） | `pnpm agent -- "..."` / `runTemplatePipeline` | 原 ContentAgent + skeletons + `compileDocument` |
| **html** | `pnpm agent -- --html -- "..."` / `AGENT_PIPELINE=html` / `runHtmlPipeline` | LayoutHtmlAgent + Puppeteer `htmlCompile`，**无骨架** |

统一入口：`runPipeline`（按 `config.pipelineMode` 分流）。

| 阶段 | 交付 | 验收 |
|------|------|------|
| **P0** | Skill + `htmlCompile` + `--html` mock 可出 `document.json` | 编辑器可打开 |
| **P1** | LayoutAgent 真 LLM 多页 | 对齐与观感可用 |
| **P2** | ImageAgent + Gate/Score 在 html 路径稳定 | 6～10 页完整 deck |
| **P3** | 视效果决定是否将默认切到 html；骨架可归档 | 产品主路径选定 |

迁移期双轨并存，便于对比；html 路径不调用 `getLayout` / skeletons。

---

## 11. 风险与对策

| 风险 | 对策 |
|------|------|
| 无骨架后版式发散 | Skill few-shot + pageType 内容指引 + VL 打分 |
| 漏标底板 → 预览有、JSON 无 | Skill 强调 + 编译前启发式告警 |
| 字体不一致 → 测高偏差 | Puppeteer 与编辑器统一 web font |
| 图片未加载就测量 | 强制 wait + 超时失败重试 |
| LLM 输出非法 HTML | Zod/白名单校验，失败重生成 |
| 元素过多超限 | `MAX_ELEMENTS_PER_PAGE` 校验 |

---

## 12. 成功标准

- 同行 icon 与标题视觉垂直居中稳定。
- 生成路径 **零 skeleton / 零 layoutKey**。
- VL/人工观感优于旧骨架流水线，且导出 PPTX 仍为可编辑对象。
- `document.json` 可被现有 `loadDocument` 加载，无需改编辑器模型。

---

## 13. 相关路径

| 资源 | 路径 |
|------|------|
| Skill | `.cursor/skills/webppt-slide-html/` |
| 平台白名单 | `src/agent/catalog/platform.ts` |
| 画布尺寸 | `src/constants/canvas.ts`（1000×562.5） |
| 新 Compile | `src/agent/htmlCompile/` |
| LayoutAgent | `src/agent/agents/layoutHtmlAgent.ts` |
| HTML 流水线 | `src/agent/pipeline/runHtml.ts` |
| 统一入口 | `src/agent/pipeline/run.ts` → `runPipeline` |
| 旧 Compile / 骨架 | `src/agent/compile/engine.ts`、`src/agent/layout/skeletons/*`（保留） |
| 现 Pipeline | `src/agent/pipeline/run.ts` |
| 加载文档 | `src/utils/loadDocument.ts` |
| PPTX 导出 | `src/utils/pptx/` |
| 已有 Puppeteer | `src/agent/gate/screenshotPages.ts` 等 |

---

## 14. 一句话

**无骨架：Skill 约束下的自由布局 HTML → Puppeteer 结算坐标 → 白名单映射 document.json → 沿用编辑器与矢量 PPTX 导出。**
