# HTML 页模板（84 套）

版式手写固化，Agent **只填槽位 JSON**，再 `renderHtmlTemplate` / `materializeTemplatePage` 得到可测量 HTML。

**12 个 pageType × 各 ≥6 套签名构图**（另含 `narrative-column`）。源文件：`pages/heroes.ts` / `metricsFamily.ts` / `pillarsClose.ts` / `story.ts` / `expand.ts` / `wave2.ts` / `wave3.ts` / `wave4.ts`。

HTML 流水线（`runHtmlPipeline`）已接入：LayoutHtmlAgent → 选 `templateId` + `slots` → 模板渲染 → Image → Compile。

## 设计方向

按场合换气质（`theme/genre.ts`）：年会暖金 / 消费奶油 / 工程冷灰 / 路演高对比 — Theme 与 Layout 共用，禁止永远「墨青+黄铜」。  
硬约束遵守 `webppt-slide-html`：无 transform、文字够宽、`data-z-index`、`data-*` 与 CSS 镜像。

**拨盘（taste）**：VARIANCE≈7 / MOTION=1（静态导出）/ DENSITY≈5。模板按题材分流选套；贵价签名提高被选概率；目录展示顺序按 prompt seed 打乱。

校对与节奏层：

- 内容页默认 `padding:44px 56px`；Wave-4 故意打破（如 `pillars-loose` 56×80、`problem-tight` 28×40、`evidence-plaza` 32×72）
- 内容页标题 `32–34`；封面标题 `52–72`；eyebrow `10` + 字距 `0.28em`
- 封面/封底左上叠字：`scrim` 薄色带托住 eyebrow
- KPI / 序号：`fontNumeric` + `tabular-nums`
- 字体默认：`fontTitle=Source Han Serif SC`，`fontBody=PingFang SC`
- **呼吸硬约束**：每场 ≥1 页 breath / metrics-monument / evidence-plaza（敢空）
- **文案压短**：封面副标题 ≤1 行；pillars body ≤2 行；禁「赋能/闭环」类词
- **生图门槛**：封面禁科技网格/贴纸/廉价插画；要求材质+真实光影+暗部留字

## Wave-4 贵价签名（优先）

| pageType | id | 签名 |
|----------|-----|------|
| hero | hero-slab | 左半幅实色板托巨型标题 |
| metrics | metrics-monument | 单数字占屏纪念碑 |
| breath | breath-billboard | 巨幅引语 + 极端留白 |
| evidence | evidence-plaza | 疏边距全宽证据图 |
| pillars | pillars-loose | 宽松边距三栏 |
| problem | problem-tight | 紧边距问题页（节奏对比） |

LayoutAgent 按场合分流；若缺呼吸页会后处理插入/换套；若仍命中默认同质栈会去同质化。

## Wave-2 / Wave-3

见既有签名表（地台/专栏/半幅/脊柱/舞台等）。

## 接入说明

- LLM 输出 `{ name, pages:[{ pageId, pageType, templateId?, slots }] }`
- `materializeTemplatePage` 规范化槽位并渲染 HTML
- Gate/Score 回炉只改 slots，再重新渲染（不重写版式）

## 用法

```ts
import { renderHtmlTemplate } from "@/agent/htmlTemplates";

const html = renderHtmlTemplate("metrics-monument", slots, theme);
```

预览：`npx tsx scripts/preview-html-templates.ts`
