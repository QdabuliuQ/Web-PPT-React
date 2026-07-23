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
     `data-font-size` `data-font-family` `data-color` `data-line-height` `data-placement`  
     plus flags when true: `data-bold` / `data-italic` / `data-underline` / `data-strikethrough`  
     plus when used: `data-background-color` `data-border` `data-border-width` `data-border-color` `data-border-style` `data-shadow*`
   - **CSS must mirror data-***: `font-size` / `font-family` / `line-height` / `font-weight` / `color` identical to the matching `data-*` (so preview = measure = JSON).
   - Other types: write every required field in [reference.md](reference.md) (icon name+theme+fill; shape type+fill; image key+prompt+radius; chart type+series; table data; slide `data-bg` + `data-page-id`).
   - Do **not** set a fixed tiny `height` on text export nodes; let content define height (or omit height).
   - No `transform` / `scale` / `rotate` on export nodes (unless also exposing `data-rotate` and tested). Prefer no transform.

4. **Coordinates**
   - Do **not** invent final `x/y` for export. Browser layout + rect measurement owns geometry.
   - Keep all content inside the 1000×562.5 root (no overflow clipping of critical text).

5. **Output**
   - Return a single HTML fragment or full document with one `#slide`.
   - No markdown fences unless asked. No explanation unless asked.

## Aesthetic (soft)

- One clear hierarchy: title → support → body; avoid equal-weight walls of text.
- Prefer flex row with `align-items: center` for icon + label (vertical centering).
- Generous padding; avoid edge-hugging (&lt; 24px margins).
- CSS `border` on marked nodes maps to JSON (`data-border*` preferred; else computed style).
- **Geometry**: compile writes DOM `getBoundingClientRect` width/height/x/y as-is — no estimate rewrite. Use separate text nodes or `\n`/`<br>` for multi-line; do not rely on post-measure box expansion.
- Few surfaces: not every block needs a white card.
- Avoid generic AI looks: purple-on-white gradients, emoji clusters, pill soup, heavy multi-shadow stacks.
- Colors: use provided theme tokens / CSS variables when given; otherwise a tight palette (bg + text + one accent).
- **Density**: content pages need real substance in the **first** HTML (3–6 bullets / 3 cards / ≥3 KPIs). When the brief is thin, invent credible specifics here — do not rely on later Gate/Score passes to flesh copy out.
- **No overlapping deco images**: never place a `data-type="image"` on top of cards or text. KPI/card rows = shapes + text + icons only. Full-bleed visuals use `data-bg-image-key` on `#slide`, not a floating image element.
- **Text width**: title/subtitle/one-line labels must be wide enough for one line (no orphan last character). Set an adequate CSS width or stretch in flex.

## Element contracts

Minimal required `data-*` per type. Full field list: [reference.md](reference.md). Examples: [examples.md](examples.md).

### text
```html
<div data-element="1" data-type="text"
     data-font-size="28" data-font-family="PingFang SC"
     data-bold data-color="#FFFFFF" data-line-height="1.4"
     data-placement="left-center"
     style="font-size:28px;font-family:PingFang SC,sans-serif;font-weight:700;line-height:1.4;color:#FFFFFF;">
  标题文案
</div>
```
- Text content = plain text（可用 `<br>`；测量用 `innerText` 转成 `\n`）。不要嵌套 `<b>`/`<span>` 富文本。
- **必写**：`data-font-size`（12–50，偶数优先）、`data-font-family`（主题 fontTitle/fontBody）、`data-color`、`data-line-height`、`data-placement`；加粗等用 presence flag。
- CSS 的 font/line-height/color/weight 必须与 data-* 一致。

### icon
```html
<div data-element="1" data-type="icon"
     data-icon-name="Lightning" data-icon-theme="outline"
     data-fill="#F5B942" data-stroke-width="3"
     style="width:32px;height:32px"></div>
```
- **必写**：`data-icon-name`（白名单 PascalCase）、`data-icon-theme`、`data-fill`；可选 `data-stroke-width`。
- Size via width/height styles (measured by rect).

### shape
```html
<div data-element="1" data-type="shape"
     data-shape-type="roundedRect" data-fill="#FFFFFF" data-opacity="1"
     style="width:280px;height:160px"></div>
```
- **必写**：`data-shape-type`、`data-fill`；有描边时写全 `data-border*`。
- Accent bars, cards, dividers = `shape`, not unmarked `div` backgrounds.

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
- [ ] **Text**: every node has font-size / font-family / color / line-height / placement（data-* + matching CSS）
- [ ] Card/accent fills are marked `shape` with shape-type + fill
- [ ] Icons have name + theme + fill; charts have chart-type + series; images have asset-key + detailed prompt
- [ ] Icon+text rows use flex `align-items: center`
- [ ] Text is plain (no `<b>`/`<span>`); `<br>` OK → stored as `\n`
- [ ] Icons use whitelist names; charts use enum `data-chart-type`
- [ ] No critical content within ~16px of edges or overflowing
- [ ] Every `image` / page bg has a detailed English prompt (subject + light + palette + bans); light text never pairs with a pale/white bg prompt
- [ ] `#slide` has `data-bg` + `data-page-id`（hero/close 另有 bg-image-key/prompt 时写全）

## Downstream (do not implement unless asked)

Puppeteer: fonts ready → images loaded → for each `[data-element="1"]` subtract slide origin from `getBoundingClientRect` → map `data-*` → `document.json` elements.
