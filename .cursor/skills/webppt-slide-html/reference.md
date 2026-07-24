# WebPPT Slide HTML — Attribute Reference

Aligned with `src/agent/catalog/platform.ts` (`ELEMENT_SCHEMAS`, enums).

## Common (all `data-element="1"`)

| Attribute | Required | Notes |
|-----------|----------|--------|
| `data-element` | yes | Must be `"1"` |
| `data-type` | yes | `text\|image\|icon\|shape\|chart\|table` |
| `data-z-index` | **yes** | Integer stacking；卡片底板 &lt; 卡上文案/图标。须与 CSS `z-index` 一致 |
| `data-rotate` | no | Degrees; avoid unless needed |

Geometry (`x,y,width,height`) comes from measured rect. **text** boxes are then expanded by editor padding (`TEXT_EDITOR_PADDING_PX`, currently 4px each side) so PPT Text content area matches HTML glyphs. Do not invent sizes; do not use `transform` on export nodes.

> **必写六项**：font-size、font-family、color、line-height、placement、**z-index**。禁止只写 CSS 不写对应 `data-*`。  
> 映射优先级：`data-border*` > CSS `getComputedStyle` 边框。透明/`none` 边框不会写入 JSON。  
> 单行 KPI/标题/页脚须有足够 **显式 `width`**（或 `width:100%`）；禁止 `translate(-50%,-50%)` 居中。

**Placements:**  
`left-top` `left-center` `left-bottom`  
`center-top` `center-center` `center-bottom`  
`right-top` `right-center` `right-bottom`

## image

| Attribute | Notes |
|-----------|--------|
| `data-asset-key` | preferred asset id (`page_{n}_img`) |
| `data-image-prompt` | **required**, detailed English (≈40–120 words): subject, framing, lighting, palette/hex, mood, bans (`no text/logos/watermark`). Forbidden: 3–8 word slogans |
| `data-src` | optional; filled before measure |
| `data-opacity` | 0–1 |
| `data-border-radius` | px |
| `data-border` / width / color / style | optional |
| `data-keep-ratio` | presence = true |
| `data-shadow*` | optional |

**Content images:** lighter/clean midtones matching page `data-bg`.  
**Hero/close full-bleed:** use `#slide` `data-bg-image-*` instead of a full-size image element.

## icon

| Attribute | Required | Notes |
|-----------|----------|--------|
| `data-icon-name` | **yes** | IconPark PascalCase |
| `data-icon-theme` | **yes** | `outline\|filled\|two-tone\|multi-color` |
| `data-fill` | **yes** | hex color |
| `data-z-index` | **yes** | integer |
| `data-stroke-width` | recommended | number |

**Whitelist (prefer these):**  
`Home` `User` `Setting` `CheckOne` `Star` `Like` `Lightning` `Aiming` `ChartHistogram` `Peoples` `Success` `FilePdf` `Pic` `Text` `TableFile` `DiamondThree`

## shape

| Attribute | Required | Notes |
|-----------|----------|--------|
| `data-shape-type` | **yes** | enum |
| `data-fill` | **yes** | hex |
| `data-z-index` | **yes** | 卡片底板应小于卡内 text/icon |
| `data-opacity` | recommended | 0–1，默认可视作 1 |
| `data-border-radius` | **roundedRect 必写** | px；须与 CSS `border-radius` 一致 → document `borderRadius` |
| `data-border` / width / color / style | when used | style may include `double` |

**shape-type:**  
`rect` `roundedRect` `oval` `triangle` `rightTriangle` `diamond` `pentagon` `hexagon` `star5` `arrowRight` `heart`

卡片底板用 `roundedRect` + `data-border-radius="12|14|16"`；强调条用 `rect`（无圆角）。

## chart

| Attribute | Notes |
|-----------|--------|
| `data-chart-type` | enum below |
| `data-series` | JSON array `[{label,value},…]` |

**chart-type:**  
`bar1` `bar2` `bar3` `bar4` `line1` `line2` `line3` `line4` `pie1` `pie2` `scatter1` `radar1` `funnel1`

## table

| Attribute | Notes |
|-----------|--------|
| `data-table` | JSON `{headers:string[], rows:(string\|number)[][]}` |
| Max grid | 10×10 |

Do not emit per-cell rich styles in HTML; theme mapper can style after compile.

## Page (`#slide`)

| Attribute | Notes |
|-----------|--------|
| `data-bg` | solid background hex (always) |
| `data-bg-image-key` | full-bleed bg asset (hero/close) |
| `data-bg-image-prompt` | detailed English hero prompt; if overlay text is white/light → darker midtones + text-safe band, **never pale/white wash** |
| `data-page-id` | id hint |
| `style` | must include `width:1000px;height:562.5px;position:relative;overflow:hidden` |

## Forbidden

- `data-type` outside the allowlist
- Nested rich HTML inside `text` (`<b>`, `<span>`). `<br>` is OK（编译为 `\n`）。多段也可拆成多个 text 节点。
- Unmarked decorative backgrounds that are meant to export
- `mindmap`, video, audio, group, SmartArt, richHtml
- Viewport other than 1000×562.5
