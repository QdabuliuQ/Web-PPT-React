# HTML 页模板（60+ 套）

版式手写固化，Agent **只填槽位 JSON**，再 `renderHtmlTemplate` / `materializeTemplatePage` 得到可测量 HTML。

**12 个 pageType × 各 ≥5 套签名构图**（另含 `narrative-column`）。源文件：`pages/heroes.ts` / `metricsFamily.ts` / `pillarsClose.ts` / `story.ts` / `expand.ts`。

HTML 流水线（`runHtmlPipeline`）已接入：LayoutHtmlAgent → 选 `templateId` + `slots` → 模板渲染 → Image → Compile。

## 设计方向

**工程述职简报**（`frontend-design`）：墨青纸面 + 黄铜强调；签名元素按套分化。  
硬约束遵守 `webppt-slide-html`：无 transform、文字够宽、`data-z-index`、`data-*` 与 CSS 镜像。

校对与节奏层（`web-design-guidelines`）：

- 内容页统一 `padding:44px 56px`、内容宽 `888px`、页标题 `28–30`
- KPI / 序号：`font-variant-numeric: tabular-nums`；方案序号统一 `01–03`
- 标题 `text-wrap: balance`；长文 `pretty` + `overflow-wrap: anywhere`
- Flex 文列 `min-width: 0`；分隔线用实色 token `divider` / `hairline`（不用 opacity）
- 封面/封底竖轨统一 `5×268 @ (64,156)`；装饰 icon `aria-hidden`；英文标识 `translate="no"`
- 预览壳：`color-scheme: dark`、链接 hover / `:focus-visible`

## 接入说明

- LLM 输出 `{ name, pages:[{ pageId, pageType, templateId?, slots }] }`
- `materializeTemplatePage` 规范化槽位并渲染 HTML
- Gate/Score 回炉只改 slots，再重新渲染（不重写版式）

## 用法

```ts
import { renderHtmlTemplate } from "@/agent/htmlTemplates";

const html = renderHtmlTemplate("metrics-focus", slots, theme);
```

预览：`npx tsx scripts/preview-html-templates.ts`
