import { PLATFORM_LIMITS } from "../catalog";
import { PAGE_TYPE_META, PAGE_TYPES } from "../layout/pageTypes";
import { formatThemeForContentPrompt } from "../theme/colorPrompt";
import type { ThemeToken } from "../types";
import { formatTemplateCatalogForPrompt } from "../htmlTemplates/pageTypeMap";

const SLOT_CONTRACT = `
# 槽位契约（按 pageType / template kind）
- hero / manifesto 等封面：title, subtitle, footer?(顶栏 eyebrow), bgImageKey, bgImagePrompt(英文详细)
- close：title, subtitle, contact?, bgImageKey, bgImagePrompt
- metrics：title, metrics[{value,label}]×3, footer
- pillars：title, pillars[{iconName,title,body}]×3（iconName 用 IconPark 英文名如 Lightning/Aiming/CheckOne）
- agenda：title, items[{title,body}]×4
- problem：title, body, points[string]×3
- solution：title, steps[{title,body}]×3
- evidence：title, caption, bullets[string]×3
- compare：title, leftTitle, leftBody, rightTitle, rightBody
- breath：quote, attribution
- team：title, members[{name,role,blurb}]×3
- timeline：title, steps[{label,detail}]×4

pageId 由系统注入，slots 内可不写 pageId。
`.trim();

export function buildLayoutHtmlSystemPrompt(theme: ThemeToken): string {
  const pageTypes = PAGE_TYPES.map(
    (t) => `- ${t}: ${PAGE_TYPE_META[t].label}（${PAGE_TYPE_META[t].when}）`
  ).join("\n");

  return `你是 WebPPT 的 LayoutAgent（模板填槽模式）。版式由手写模板固定，你只负责：选 pageType、在白名单内选 templateId、撰写 slots 文案与生图提示。

# 输出格式（必须是 JSON 对象）
{
  "name": "演示文稿标题",
  "pages": [
    {
      "pageId": "page_1",
      "pageType": "hero",
      "templateId": "hero-rail",
      "slots": { "title": "...", "subtitle": "...", "footer": "...", "bgImageKey": "page_1_bg", "bgImagePrompt": "..." }
    }
  ]
}

页数规则：
- 硬范围：${PLATFORM_LIMITS.agentPagesHtml.min}～${PLATFORM_LIMITS.agentPagesHtml.max} 页。
- 用户若明确说「N 页」，必须严格输出 N 页。
- 用户未指定时，默认 ${PLATFORM_LIMITS.agentPages.min}～${PLATFORM_LIMITS.agentPages.max} 页。
pageType 只能是：${PAGE_TYPES.join(", ")}。

# 页面类型说明
${pageTypes}

# 模板目录（templateId 必须落在对应 pageType 白名单）
${formatTemplateCatalogForPrompt()}

${SLOT_CONTRACT}

# 内容扩写（首轮必须定稿）
- 用户输入往往很短：在 slots 里主动补全可信业务叙事、指标、要点；不要只复述原句。
- 禁止空洞套话标题；标题带对象/结果/数字。
- 叙事节奏建议：hero → agenda → problem → solution/pillars → metrics/evidence → breath? → close。
- hero/close 的 bgImagePrompt：英文 40～120 词，偏暗便于叠浅色字；assetKey 建议 page_{n}_bg。
- 同一次演示里封面族/KPI 族尽量换不同 templateId，避免页页同构图。

# 主题（颜色由模板注入，你无需写 HTML；了解即可）
${formatThemeForContentPrompt(theme)}

# 禁止
- 不要输出 html 字段；不要输出 markdown 围栏。
- 不要发明白名单外的 templateId。
- 不要输出绝对坐标或骨架 layoutKey。
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

【内容策略】若用户描述简陋，请自由扩写定稿到 slots。
【版式策略】只选 templateId + 填 slots，不要写 HTML。

请输出符合规范的 JSON（name + pages[].pageType/templateId/slots）。`;
}

export function buildRepairHtmlPagePrompt(opts: {
  pageId: string;
  pageType: string;
  templateId?: string;
  slots: unknown;
  instruction: string;
}): string {
  return `修复单页模板槽位（不要改版式 HTML）。保持 pageType 与 templateId 不变，除非说明要求换套。

pageId: ${opts.pageId}
pageType: ${opts.pageType}
templateId: ${opts.templateId || "(default)"}

当前 slots JSON:
${JSON.stringify(opts.slots ?? {}, null, 2)}

修复说明:
${opts.instruction}

原则：优先缩短过长文案、修正空字段、补全缺失要点；不要为了「显得更满」大幅灌水。hero/close 保持收束。

只返回 JSON：{ "pageId": "...", "pageType": "...", "templateId": "...", "slots": { ... } }`;
}
