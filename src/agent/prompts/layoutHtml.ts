import { readFileSync, existsSync } from "fs";
import path from "path";
import { PLATFORM_LIMITS } from "../catalog";
import { PAGE_TYPE_META, PAGE_TYPES } from "../layout/pageTypes";
import { formatThemeForContentPrompt } from "../theme/colorPrompt";
import type { ThemeToken } from "../types";

function loadSlideHtmlSkill(): string {
  const candidates = [
    path.join(process.cwd(), ".cursor/skills/webppt-slide-html/SKILL.md"),
    path.join(process.cwd(), ".cursor/skills/webppt-slide-html/reference.md"),
  ];
  const parts: string[] = [];
  for (const p of candidates) {
    if (existsSync(p)) {
      parts.push(readFileSync(p, "utf-8"));
    }
  }
  if (parts.length === 0) {
    return `Generate 16:9 slides (1000×562.5) as HTML. Mark export nodes with data-element="1" and data-type in text|image|icon|shape|chart|table. Layout may use flex/grid.`;
  }
  return parts.join("\n\n---\n\n");
}

const skillBody = loadSlideHtmlSkill();

export function buildLayoutHtmlSystemPrompt(theme: ThemeToken): string {
  const pageTypes = PAGE_TYPES.map(
    (t) => `- ${t}: ${PAGE_TYPE_META[t].label}（${PAGE_TYPE_META[t].when}）`
  ).join("\n");

  return `你是 WebPPT 的 LayoutAgent，也是内容策划。根据用户需求生成整份幻灯片 HTML（无骨架、无绝对坐标填槽）。
目标：做出「信息充实、可上台讲」的顾问级路演稿，而不是只有标题的空壳页。

# 输出格式（必须是 JSON 对象）
{
  "name": "演示文稿标题",
  "pages": [
    {
      "pageId": "page_1",
      "pageType": "hero",
      "html": "<section id=\\"slide\\" ...>...</section>"
    }
  ]
}

页数规则：
- 硬范围：${PLATFORM_LIMITS.agentPagesHtml.min}～${PLATFORM_LIMITS.agentPagesHtml.max} 页。
- 用户若明确说「N 页 / 只要 N 页 / 生成 N 页」，必须严格输出 N 页（落在硬范围内）。
- 用户未指定页数时，默认 ${PLATFORM_LIMITS.agentPages.min}～${PLATFORM_LIMITS.agentPages.max} 页。
pageType 只能是：${PAGE_TYPES.join(", ")}。

# 页面类型说明
${pageTypes}

# 内容扩写（首轮 HTML 必须定稿 — 重要）
- 用户输入往往很短/很笼统：你必须在**本轮 pages[].html** 里主动补全合理的业务叙事、要点、数据、案例与下一步，不要只复述用户原句。
- 可自由发挥：虚构但可信的指标、里程碑、对比、风险与对策、方法论步骤；语气贴合主题场景（述职/路演/总结/方案等）。
- **禁止依赖后续 Gate/Score 回炉补字**：信息密度与文案完整度必须在首次输出就达标。
- 禁止空洞套话标题（如「核心优势」「未来展望」「工作总结」光秃秃三个字）；标题要带对象/结果/数字。
- 叙事节奏建议：hero → agenda/背景 → 问题或挑战 → 方案/支柱 → 数据或证据 → 规划或收尾(close)。
- **内容页最低密度**（hero/close 除外）：
  - 至少 1 个具体标题 + 副句或导语；
  - 至少 3～6 条要点，或 3 张卡片，或 1 组 KPI（≥3）+ 简短说明；
  - 鼓励穿插 chart/table（真实小数即可）或侧栏插图；
  - 正文合计建议 ≥ 120 汉字（不含纯装饰），避免大片留白只摆标题。
- hero：主标题 + 副标题 + 汇报人/场合/时间等 1～2 行信息，可加一句价值主张。
- close：首次输出即含感谢语 + 一句成果/价值收束 + 联系方式或下一步 CTA（可 3～5 行信息层级）；勿只有「谢谢」，也勿写成第二篇正文长文。

# 主题（颜色/字体必须全部写进 data-* 与匹配 CSS；text 用 fontTitle/fontBody）
${formatThemeForContentPrompt(theme)}
注意：每个 text 的 data-font-family 只能用上述 fonts（标题倾向 fontTitle，正文倾向 fontBody），并同步写到 style.font-family。

# 幻灯片 HTML 规范（必须遵守）
${skillBody}

# 额外要求
1. 每页 html 必须包含唯一 #slide，尺寸 1000×562.5；必须写 data-bg 与 data-page-id。
2. **属性写全（硬约束）**：凡 data-element 节点，reference 中标为 required 的 data-* **全部写出**，禁止只写 CSS、指望编译默认值。
   - text **必写**：data-font-size、data-font-family（用主题 fontTitle/fontBody）、data-color、data-line-height、data-placement；加粗等用 data-bold 等 flag；style 里 font-size/family/line-height/color/weight 必须与 data-* 一致。
   - icon 必写：data-icon-name、data-icon-theme、data-fill。
   - shape 必写：data-shape-type、data-fill。
   - image 必写：data-asset-key、data-image-prompt（详细英文）、建议 data-border-radius。
   - chart 必写：data-chart-type、data-series；table 必写 data-table。
3. 需要生图的节点：
   - 内容图：data-type="image" + data-asset-key + **详细英文** data-image-prompt；
   - 封面/封底全幅：#slide 上 data-bg-image-key + **详细英文** data-bg-image-prompt（写入页背景，不要再叠一张全幅 image 元素）。
4. **生图提示词（硬约束）**：
   - 英文，约 40～120 词；禁止「soft abstract / modern dashboard, no text」这类超短口号。
   - 必须写清：主体、构图/留白、光影、色调（尽量点名主题 hex）、气质、禁止项（no text / no logos / no watermark）。
   - 叠浅色/白色文字（textOnDark）时：bg 图或实色必须偏暗；data-bg-image-prompt 必须要求 darker midtones、text-safe darker band，**禁止浅白/高亮冲淡底**。
   - 内容页侧栏插图：偏干净浅亮，与浅色 data-bg 协调，不要暗黑电影感盖住深色正文。
5. assetKey 全局唯一，建议 page_{n}_img / page_{n}_bg。
6. 不要输出 markdown 围栏；html 字段内是原始 HTML 字符串。
7. 不要使用 layoutKey / skeleton / 绝对坐标 JSON。
8. **文本宽度**：标题/副标题/单行说明的容器要够宽，禁止把整句挤成「最后一字单独换行」；可给 text 节点写足够的 width 或用 flex 拉满可用列宽。
9. **禁止装饰图压内容**：metrics/KPI/卡片横排页不要在卡片上叠加插图；内容页优先文字+图标+色块，插图仅放在独立不重叠的栏位。
10. **信息密度**：内容页必须有多条可讲述的信息点；宁可略满也不要空洞。密疏交替可以，但「疏」页也至少有一句有信息量的导语 + 视觉焦点，不能空场。
`;
}

export function parseRequestedPageCount(userPrompt: string): number | undefined {
  const min = PLATFORM_LIMITS.agentPagesHtml.min;
  const max = PLATFORM_LIMITS.agentPagesHtml.max;
  const patterns = [
    /(\d+)\s*页/,
    /生成\s*(\d+)/,
    /只要\s*(\d+)/,
    /共\s*(\d+)/,
    /(\d+)\s*pages?/i,
  ];
  for (const re of patterns) {
    const m = userPrompt.match(re);
    if (!m) continue;
    const n = Number(m[1]);
    if (Number.isFinite(n) && n >= min && n <= max) return n;
  }
  return undefined;
}

export function buildLayoutHtmlUserPrompt(userPrompt: string): string {
  const n = parseRequestedPageCount(userPrompt);
  const pageHint = n
    ? `\n\n【页数硬约束】用户要求 ${n} 页，pages 数组长度必须正好是 ${n}。`
    : `\n\n【页数】未指定时请生成 ${PLATFORM_LIMITS.agentPages.min}～${PLATFORM_LIMITS.agentPages.max} 页。`;
  return `用户需求：
${userPrompt}${pageHint}

【内容策略】若用户描述简陋、缺细节，请你作为资深顾问**在本轮 HTML 中自由扩写定稿**：补全背景、挑战、方案、数据、里程碑与下一步；写出可上台讲的充实文案与版式。不要生成只有标题的空壳页，也不要指望后续流程再补内容。

请输出符合规范的 JSON（含 name 与 pages[].html）。`;
}

export function buildRepairHtmlPagePrompt(opts: {
  pageId: string;
  pageType: string;
  html: string;
  instruction: string;
}): string {
  return `修复单页幻灯片 HTML。保持 #slide 1000×562.5 与 data-element 契约。

pageId: ${opts.pageId}
pageType: ${opts.pageType}

当前 HTML:
${opts.html}

修复说明:
${opts.instruction}

原则：优先修越界、溢出、空图、对比/层级等结构与版式问题；**不要为了「显得更满」大幅新增长文**（内容密度应已在首轮 Layout 写好）。若确有截断/不可读，可短句微调。hero/close 保持收束，勿改成内容页长文。

只返回 JSON：{ "pageId": "...", "pageType": "...", "html": "..." }`;
}
