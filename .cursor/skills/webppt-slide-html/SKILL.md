---
name: webppt-slide-html
description: >-
  Generate WebPPT slide HTML for Puppeteer→document.json export. Use when
  authoring slide HTML, data-element markers, HTML-to-PPT layout, LayoutAgent
  pages, or converting flex/grid HTML into absolute-position canvas JSON.
---

# WebPPT Slide HTML

Generate **one 16:9 slide** as HTML. Layout may use flex/grid. Exportable nodes must be marked. Downstream Puppeteer measures `[data-element="1"]` with `getBoundingClientRect` and maps them into `document.json`.

## Canvas

| | |
|--|--|
| Size | **1000 × 562.5 px** (16:9) |
| Root | `#slide` with exactly those dimensions, `position: relative`, `overflow: hidden` |
| Unit | px only |

## Hard rules

1. **Scaffold vs export**
   - Unmarked nodes = layout only (flex wrappers, spacers). They do **not** appear in JSON.
   - Every visible thing that must exist in the PPT editor needs `data-element="1"`.
   - Card backgrounds, accent bars, images, icons, text: **mark them**. If unmarked, they vanish after compile.

2. **Allowed `data-type`** (only these):  
   `text` | `image` | `icon` | `shape` | `chart` | `table`  
   Do **not** emit `mindmap`, `richHtml`, `video`, or custom types.

3. **Attributes — write them all（硬约束）**
   - Prefer **`data-*`** for export fields (source of truth). **Do not omit** and rely on CSS-only or compile defaults.
   - Every `text` node **must** include at least:  
     `data-font-size` `data-font-family` `data-color` `data-line-height` `data-placement` **`data-z-index`**  
     plus flags when true: `data-bold` / `data-italic` / `data-underline` / `data-strikethrough`  
     plus when used: `data-background-color` `data-border` `data-border-width` `data-border-color` `data-border-style` `data-shadow*`
   - **Every** export node（text/image/icon/shape/chart/table）**must** include `data-z-index`.
   - **CSS must mirror data-***: `font-size` / `font-family` / `line-height` / `font-weight` / `color` / `z-index` identical to the matching `data-*` (so preview = measure = JSON).
   - Other types: write every required field in [reference.md](reference.md) (icon name+theme+fill; shape type+fill; image key+prompt+radius; chart type+series; table data; slide `data-bg` + `data-page-id`).
   - No `transform` / `scale` / `rotate` on export nodes（硬禁止；`translate(-50%,-50%)` 会导致量宽过紧）。需要旋转时才用 `data-rotate` 并自测。
   - Do **not** set a fixed tiny `height` on text export nodes; let content define height (or omit height). Give single-line text an explicit **`width`**.

4. **Fidelity — HTML ≡ JSON（硬约束）**
   - **几何**：导出节点以测量 `getBoundingClientRect` 为准；**text** 在落盘时会加上编辑器 `padding` 补偿（与 Text 组件一致），不是估字宽。禁止随意改写其它类型几何。
   - **元素集合**：HTML 里每个 `data-element="1"` 对应 JSON 里恰好一个元素；不要用未标记节点冒充可见内容。
   - **属性**：JSON 字段来自 `data-*`（+ 文案 `innerText`）；`data-*` 与同名 CSS 必须一致；缺属性就写缺，不要靠编译猜。
   - **层级**：每个导出节点 **必须**写 `data-z-index`（整数）。卡片底板 &lt; 卡上图标/文案；装饰 &lt; 内容；后画的不一定更大，以 `data-z-index` 为准。禁止只写 CSS `z-index:1` 而不写 `data-z-index`。
   - 推荐层段：背景装饰 `0–5` → 卡片/色块 `10–20` → 卡内文字/图标 `30–50` → 顶栏强调 `60+`。

5. **Coordinates**
   - Do **not** invent final `x/y` for export. Browser layout + rect measurement owns geometry.
   - Keep all content inside the 1000×562.5 root (no overflow clipping of critical text).
   - **禁止**在导出节点上使用 `transform` / `translate(-50%,-50%)` / `scale`（编译会剥离，但布局易量错）。KPI/居中：用 flex/`text-align`/`data-placement`，并给 text **显式 width**（或 `width:100%` 相对卡片）。
   - 卡片：`position:relative` 容器 + shape `absolute;inset:0` + 文案在文档流或相对定位，并设好 `data-z-index`。

6. **Output**
   - Return a single HTML fragment or full document with one `#slide`.
   - No markdown fences unless asked. No explanation unless asked.

## Aesthetic（版式好看 — 按页执行）

目标：像顾问路演稿，不要像默认后台表格或四等分白卡片墙。

### 全局
- 一页一个主信息；标题具体（带对象/结果/数字），副标题一句支撑。
- 边距：内容离画布边缘 ≥ 40～56px；区块间距 20～32px，松紧交替。
- 字号阶梯（建议）：封面主标题 40–48 → 页标题 28–32 → 卡标题 18–20 → 正文 14–16 → 辅助 12–13。
- 颜色只用主题五色；大面积底用 `background` / 深色 hero 底，强调只用 `primary`/`secondary` 一条色带或数字，不要满页高饱和。
- **少卡片**：默认无白底卡片。卡片仅用于 KPI/并列对比；同一页最多 3～4 张，圆角 12～16，轻阴影可选，忌多层阴影堆叠。
- **有呼吸**：允许一侧留白或大数字；禁止四角塞满、字墙拉满。
- 禁止：紫粉渐变、emoji 串、圆角胶囊标签堆、花哨贴纸、装饰图压字。

### 按 pageType 构图（优先套用）
| pageType | 推荐构图 |
|----------|----------|
| hero | 全幅深色 bg 图或深色实底 + 左/中标题区；底边一条 accent 色条；勿等分四卡 |
| agenda | 左标题 + 右 4～6 条编号要点（图标+文字行），或上下目录 |
| problem / solution | 左叙事 40% + 右要点/步骤；或上下：问题条 → 方案条 |
| pillars | **最多 3 列**（非 4 列挤爆）；每列：图标 + 短标题 + 2～3 行说明 |
| metrics | 大数字 KPI 一行 3～4 个；数字用 primary/secondary，说明用正文色；底板 z &lt; 字 |
| evidence | 左 chart/table（约 55%）+ 右 3 条解读；或全宽图+下方结论句 |
| timeline | 横向 4 节点：圆点 shape + 年份 + 事件，忌竖直挤成列表墙 |
| team | 2～3 人横排：圆角头像位 + 姓名职级 + 一句亮点 |
| breath | 一句金句 + 短支撑，大量留白 |
| close | 感谢 + 收束句 + 联系方式；深色底；信息少而稳 |

### 细节加分
- 页眉：短标题 + 下方 4×48 accent `shape` 色条（几乎每页都有，成本低观感好）。
- 图标行：`flex; align-items:center; gap:12～14px`，图标 28～36px。
- 列表：用独立 text 行或 `<br>`，行距 1.5～1.6；不要一整段糊成墙。
- 至少 1 个内容页带 chart 或具体数字表，避免全是口号卡。
- hero/close 认真写 `data-bg-image-prompt`（偏暗、留字区）；内容页可用浅底 + 少量插图栏，勿每页都全幅暗图。

### 自检观感
- [ ] 3 秒内能看出本页在讲什么
- [ ] 有明确字号层级，不是满页同号
- [ ] 没有白卡片把字盖住（z-index 正确）
- [ ] 没有四列等宽塞满 + 大片空洞同时存在
- [ ] 颜色不超过主题五色

## Element contracts

Minimal required `data-*` per type. Full field list: [reference.md](reference.md). Examples: [examples.md](examples.md).

### text
```html
<div data-element="1" data-type="text"
     data-font-size="28" data-font-family="PingFang SC"
     data-bold data-color="#FFFFFF" data-line-height="1.4"
     data-placement="left-center" data-z-index="30"
     style="font-size:28px;font-family:PingFang SC,sans-serif;font-weight:700;line-height:1.4;color:#FFFFFF;z-index:30;position:relative;">
  标题文案
</div>
```
- Text content = plain text（可用 `<br>`；测量用 `innerText` 转成 `\n`）。不要嵌套 `<b>`/`<span>` 富文本。
- **必写**：`data-font-size`、`data-font-family`、`data-color`、`data-line-height`、`data-placement`、`data-z-index`；加粗等用 presence flag。
- CSS 的 font/line-height/color/weight/**z-index** 必须与 data-* 一致。

### icon
```html
<div data-element="1" data-type="icon"
     data-icon-name="Lightning" data-icon-theme="outline"
     data-fill="#F5B942" data-stroke-width="3" data-z-index="30"
     style="width:32px;height:32px;z-index:30;position:relative;"></div>
```
- **必写**：`data-icon-name`、`data-icon-theme`、`data-fill`、`data-z-index`；可选 `data-stroke-width`。

### shape
```html
<div data-element="1" data-type="shape"
     data-shape-type="roundedRect" data-fill="#FFFFFF" data-opacity="1"
     data-border-radius="16" data-z-index="10"
     style="width:280px;height:160px;border-radius:16px;background:#FFFFFF;z-index:10;"></div>
```
- **必写**：`data-shape-type`、`data-fill`、`data-z-index`；有描边时写全 `data-border*`。
- **圆角矩形**：`data-shape-type="roundedRect"` 时必须写 `data-border-radius`（px），且 CSS `border-radius` 与之一致；编译写入 document 的 `borderRadius`。
- 直角矩形用 `rect`，不要写圆角。
- 卡片：底板 `data-z-index` **小于** 卡上 text/icon。推荐结构：`position:relative` 容器内先 shape（`absolute;inset:0`）再文案。

### image
```html
<div data-element="1" data-type="image"
     data-asset-key="page_2_img" data-border-radius="16"
     data-image-prompt="Clean editorial photo of a dual-monitor developer desk, soft daylight, light surface matching theme background, restrained blue UI glow accents, subject on the right third with clean left negative space, no readable text on screens, no logos, no watermark"
     style="width:380px;height:400px"></div>
```
- **Required:** `data-asset-key` + **detailed** English `data-image-prompt` (≈40–120 words). Short slogans like `soft abstract, no text` are forbidden.
- Prompt must cover: **subject**, **composition/framing**, **lighting & palette** (name theme hex when useful), **mood**, and bans (`no text`, `no logos`, `no watermark`).
- Side/content images: prefer clean, **lighter** midtones that match content-page `data-bg` / theme.background — not dark cinematic washes under dark body text.
- `src` may be filled later before measure.

### chart
```html
<div data-element="1" data-type="chart"
     data-chart-type="bar1"
     data-series='[{"label":"A","value":12},{"label":"B","value":20}]'
     style="width:840px;height:280px"></div>
```
- Geometry from rect; series from `data-series` (never invent full ECharts option).

### table
```html
<div data-element="1" data-type="table"
     data-table='{"headers":["项","值"],"rows":[["A",1],["B",2]]}'
     style="width:800px;height:240px"></div>
```

## Page chrome

On `#slide`:
- `data-bg` — solid page background hex (always set)
- `data-page-id` — stable id hint
- **Cover / ending (hero / close):** prefer `data-bg-image-key` + **detailed** `data-bg-image-prompt` for full-bleed page background (do **not** also place a full-slide `image` element).
  - If overlay text is light/`textOnDark`, the bg prompt **must** demand darker midtones, soft vignette, and a clear darker band for titles — never a pale/white wash.
  - If you skip the bg image and only use solid `data-bg`, use a **dark** solid when text is white; do not rely on the global light atmosphere texture.
- Example bg prompt: `Cinematic 16:9 cover, deep navy #1A3A5C atmosphere with soft cyan #4A90D9 accents, darker lower third and center for white title overlay, subtle night-city bokeh, professional corporate mood, no readable text, no logos, no pure white wash`

## Workflow

1. Read theme tokens / page brief if provided.
2. Choose composition (hero, split, cards, metrics row, etc.).
3. Build scaffold with flex/grid; mark every export node.
4. Self-check (below).
5. Output HTML only.

## Self-check

- [ ] `#slide` is 1000×562.5
- [ ] Every visible PPT object has `data-element="1"` and valid `data-type`
- [ ] **Text**: font-size / font-family / color / line-height / placement / **z-index**（data-* + matching CSS）
- [ ] **Every** export node has `data-z-index`; card shape z &lt; text/icon on that card
- [ ] Geometry: no transform on export nodes; text has enough width; KPI not centered via translate(-50%,-50%)
- [ ] Card/accent fills are marked `shape` with shape-type + fill + z-index
- [ ] Icons have name + theme + fill + z-index; charts have chart-type + series; images have asset-key + detailed prompt
- [ ] Icon+text rows use flex `align-items: center`
- [ ] Text is plain (no `<b>`/`<span>`); `<br>` OK → stored as `\n`
- [ ] Icons use whitelist names; charts use enum `data-chart-type`
- [ ] No critical content within ~16px of edges or overflowing
- [ ] Every `image` / page bg has a detailed English prompt; light text never pairs with a pale/white bg prompt
- [ ] `#slide` has `data-bg` + `data-page-id`（hero/close 另有 bg-image-key/prompt 时写全）

## Downstream (do not implement unless asked)

Puppeteer: fonts ready → images loaded → for each `[data-element="1"]` subtract slide origin from `getBoundingClientRect` → map `data-*` → `document.json` elements.
