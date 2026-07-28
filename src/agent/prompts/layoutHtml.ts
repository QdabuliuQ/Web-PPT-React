import { PLATFORM_LIMITS } from "../catalog";
import { PAGE_TYPE_META, PAGE_TYPES } from "../layout/pageTypes";
import { formatThemeForContentPrompt } from "../theme/colorPrompt";
import type { DesignBrief } from "../brief/types";
import {
  formatFamilyCatalogHint,
  getMaterialPack,
  resolveVisualFamily,
} from "../theme/visualFamily";
import type { ThemeToken } from "../types";
import {
  formatDesignProfileForPrompt,
  type DesignProfile,
} from "../design/director";
import {
  formatTemplateCatalogForPrompt,
  freshRunSeed,
} from "../htmlTemplates/pageTypeMap";

const NARRATIVE_ANGLES = [
  "成果复盘：用 before→after 数字讲清变化，忌空口号",
  "问题攻坚：卡点是什么、怎么拆、结果落到谁身上",
  "方法沉淀：可复制的原则 / 步骤 / 检查清单",
  "业务价值：谁受益、省了多少时间或成本、风险降在哪",
  "下一阶段：里程碑 + 责任边界 + 可验收结果",
  "对比叙事：旧路径 vs 新路径，用对照表讲清取舍",
  "案例深挖：挑 1 个代表性场景写透，再抽可迁移点",
] as const;

export function pickNarrativeAngle(seed: number): string {
  return NARRATIVE_ANGLES[seed % NARRATIVE_ANGLES.length]!;
}

const SLOT_CONTRACT = `
# 槽位契约（按 pageType / template kind）
- hero / manifesto 等封面：title, subtitle, footer?(顶栏 eyebrow), bgImageKey, bgImagePrompt（媒体平面配图；禁止指望暗带叠字）
- close：title, subtitle, contact?, bgImageKey, bgImagePrompt（同上）
- metrics：title, metrics[{value,label}]×3, footer
- pillars：title, pillars[{iconName,title,body}]×3（iconName 用白名单：Lightning/Aiming/CheckOne/Star/…）
- agenda：title, items[{title,body,iconName?}]×4
- problem：title, body, points[string]×3
- solution：title, steps[{title,body,iconName?}]×3
- evidence：title, caption, bullets[string]×3, imageKey, imagePrompt（配图；英文详细；默认产品/场景照）
- compare：title, leftTitle, leftBody, rightTitle, rightBody
- breath：quote, attribution
- team：title, members[{name,role,blurb,imageKey?,imagePrompt?}]×3（头像须写 transparent / isolated cutout）
- timeline：title, steps[{label,detail}]×4

# 双平面（硬约束）
- 文字只落在实色 shape 上；媒体用独立 image 槽。禁止全幅底图裸叠标题。
- 合法构图：split（字区|图区）/ band（上下字带+中图）/ card（图可满幅但字在实色卡片内）/ solid（无图）。

# 微旋钮（每页 slots 可选，提升自由度但不改版式结构）
- density: airy | normal | dense（airy=更疏，dense=更紧）
- emphasis: title | image | number（本页视觉重心）
- align: left | split | center（构图倾向，配合选套）
- 呼吸页 / monument 页优先 density=airy；metrics-monument 优先 emphasis=number；evidence-plaza 优先 emphasis=image。

# 视觉素材策略（填槽时主动写）
- 封面/封底：必填 bgImagePrompt（媒体平面，非叠字底板）；必须贴合主题材质包。
- evidence：必填 imagePrompt（内容配图）；模板自带圆角+细边框。
- team：每位成员写 imagePrompt，强调 isolated subject on fully transparent background（PNG alpha）。
- pillars/agenda/solution：按语义选白名单 iconName，不要空着。
- imagePrompt 英文 40～120 词：subject + framing + lighting + theme hex + bans(no text/logos/watermark)。

pageId 由系统注入，slots 内可不写 pageId。
`.trim();

export function buildLayoutHtmlSystemPrompt(
  theme: ThemeToken,
  opts?: { catalogSeed?: number; designProfile?: DesignProfile }
): string {
  const pageTypes = PAGE_TYPES.map(
    (t) => `- ${t}: ${PAGE_TYPE_META[t].label}（${PAGE_TYPE_META[t].when}）`
  ).join("\n");
  const catalogSeed = opts?.catalogSeed ?? 0;
  const family = resolveVisualFamily(theme.visualFamily);
  const pack = getMaterialPack(family);
  const designProfile = opts?.designProfile;
  const designHint = designProfile
    ? `\n${formatDesignProfileForPrompt(designProfile)}\n`
    : "";

  return `你是 WebPPT 的 LayoutAgent（模板填槽模式）。版式由手写模板固定，你只负责：选 pageType、在白名单内选 templateId、撰写 slots 文案与生图提示、填写微旋钮。

# 输出格式（必须是 JSON 对象）
{
  "name": "演示文稿标题",
  "pages": [
    {
      "pageId": "page_1",
      "pageType": "hero",
      "templateId": "hero-type",
      "slots": {
        "title": "...",
        "subtitle": "...",
        "footer": "...",
        "bgImageKey": "page_1_bg",
        "bgImagePrompt": "...",
        "density": "airy",
        "emphasis": "title",
        "align": "left"
      }
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

# 视觉家族（整场统一，优先选 ★家族 标记模板）
${formatFamilyCatalogHint(family)}
封面生图材质：${pack.coverImageHint}
${designHint}

# 模板目录（templateId 必须落在对应 pageType 白名单；★家族 优先；下列顺序每次请求已打乱）
${formatTemplateCatalogForPrompt(catalogSeed, family, designProfile)}

${SLOT_CONTRACT}

# 内容充实与克制（硬约束）
- 用户输入往往很短：必须主动扩写成「可上台讲」的业务叙事，禁止只复述原句或空壳标题。
- 禁止空洞套话标题；标题带对象/结果/数字/专名。
- **禁用词**：赋能、闭环、全面提升、抓手、打通、生态协同、价值最大化、深度融合（及同类空转词）。
- **充实硬规则**（宁可写满可信细节，不要干瘪）：
  - 封面 subtitle：1 句说清场合+结果，中文约 24～48 字。
  - pillars 每条 body：含动作+对象+结果，约 28～56 字（可 2 行）。
  - agenda item body：约 16～36 字，写清「要讲什么」。
  - evidence bullets：各约 18～42 字，带事实/数字/场景。
  - problem body：约 90～160 字，写清背景→症状→代价。
  - metrics：value 必须像真实指标（避免全是「100%」「3x」「10+」这种模板感）；label 说明口径。
  - solution steps：每步写「做什么 + 为何有效」。
  - 合理虚构可信专名/产品线/团队名（与主题一致），增加具体感。
- 开场收束：通常有 hero 与 close；中间页按题材与目录展开，禁止所有 PPT 都用同一套 pageType 流水线。

# 呼吸页（硬约束）
- 每场至少 1 页「敢空」页：pageType=breath，或 templateId 为 metrics-monument / metrics-hero / evidence-plaza / evidence-stage / breath-billboard。
- 禁止密页连密页：pillars/problem/solution/agenda 连续超过 2 页时，中间必须插入 breath 或超大 KPI / 全宽 evidence。
- 贵价签名可优先，但**不要每场都选同一组**。

# 模板多样性与运行差异（硬约束）
1. **按视觉家族选套**：优先 ★家族；禁止 sticky 默认同质栈。
2. **同需求多次生成必须明显不同**：换 templateId 组合、换叙事角度、换指标与案例细节；禁止「换汤不换药」的同结构复读。
3. **一页一套、整场分散**：同一演示内尽量每个 templateId 只用一次；同 pageType 若出现两次必须换不同 templateId。
4. **场合必须可辨**：集团年会（stage）与个人述职（editorial）应明显不同。
5. **封面/封底成对但勿雷同**：可用同族呼应，也可用对比签名。
6. **微旋钮也要换**：不要整场全是 density=airy + emphasis=title。

# 目录一致性（硬约束，有 agenda 时必须遵守）
1. **先定大纲再写正文**：有 agenda 页时，先写定 agenda.items（通常 3～4 条），再写后续内容页。
2. **目录条目 = 后续内容页的主线**：agenda 之后、close 之前的每一页，必须能对应到某一条 agenda item。
3. **禁止两套叙事**。
4. **页类型服务目录**：按条目选题型。
5. **数量匹配**：agenda 有 N 条时，其后内容页优先 N 页（或 N±1）。
6. **标题呼应**：内容页 title 应复用或改写对应 agenda item 关键词。

# 生图质量门槛（硬约束）
- hero/close 的 bgImagePrompt：英文 40～120 词；**材质 + 真实光影**（媒体平面，不靠暗带叠字），并贴合材质包。
- **左上角与标题区必须留暗部/低亮度带**，禁止整幅高光奶油橙/白雾把 eyebrow 洗掉。
- **封面禁止**：tech grid / HUD / circuit board / neon cyberpunk / paw-print stickers / cheap flat illustration / clipart / glossy stock smile。
- evidence 的 imagePrompt：浅色内容页友好的产品/场景照。
- team 头像 imagePrompt：必须含 transparent background / isolated cutout。

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

export function buildLayoutHtmlUserPrompt(
  userPrompt: string,
  theme?: ThemeToken,
  opts?: {
    runSeed?: number;
    designProfile?: DesignProfile;
    brief?: DesignBrief;
  }
): string {
  const n = parseRequestedPageCount(userPrompt);
  const pageHint = n
    ? `\n\n【页数硬约束】用户要求 ${n} 页，pages 数组长度必须正好是 ${n}。`
    : `\n\n【页数】未指定时请生成 ${PLATFORM_LIMITS.agentPages.min}～${PLATFORM_LIMITS.agentPages.max} 页。`;
  const family = resolveVisualFamily(
    opts?.designProfile?.visualFamily ||
      opts?.brief?.visualFamily ||
      theme?.visualFamily
  );
  const pack = getMaterialPack(family);
  const seed = opts?.runSeed ?? freshRunSeed(userPrompt);
  const angle = pickNarrativeAngle(seed);
  const designHint = opts?.designProfile
    ? `\n${formatDesignProfileForPrompt(opts.designProfile)}\n`
    : "";
  const occasion =
    opts?.brief?.label || opts?.designProfile?.label || "通用";
  const layoutGuidance =
    opts?.brief?.layoutGuidance ||
    opts?.designProfile?.narrativeShape ||
    "";
  const themeHints =
    opts?.brief?.themeHints || opts?.designProfile?.themeGuidance || "";
  return `用户需求：
${userPrompt}${pageHint}

【场合】${occasion}
${layoutGuidance}

【主题气质】${themeHints}

【视觉家族】${formatFamilyCatalogHint(family)}
封面材质：${pack.coverImageHint}
${designHint}

【本场叙事角度】${angle}
（同需求再次生成会换角度；请围绕该角度写 slots，不要套万能大纲。）

【内容策略】用户描述简陋时，扩写成可上台讲的具体叙事：专名、数字口径、场景、动作、结果。忌空转套话。封面副标题 24～48 字；pillars body 28～56 字；problem 90～160 字；metrics 避免假大空百分比。
【版式策略】只选 templateId + 填 slots + 微旋钮。优先 ★家族与 ★导演，但整场分散；禁止 sticky 默认同质栈；runSeed=${seed}（目录已按此打乱）。
【差异化】即使需求与上次相同，也必须换 template 组合、指标细节与案例；禁止复读同一套结构。
【微旋钮】按页变化 density / emphasis / align；呼吸页 airy；KPI 页 emphasis=number；大图页 emphasis=image。
【呼吸硬约束】整场至少 1 页 breath 或 metrics-monument / evidence-plaza。
【目录策略】若包含 agenda：先定 agenda.items，后续内容页必须按目录条目展开。

请输出符合规范的 JSON（name + pages[].pageType/templateId/slots）。`;
}

export function buildRepairHtmlPagePrompt(opts: {
  pageId: string;
  pageType: string;
  templateId?: string;
  slots: unknown;
  instruction: string;
}): string {
  return `修复单页模板槽位（不要改版式 HTML）。保持 pageType 与 templateId 不变，除非说明要求换套。可保留或修正 density/emphasis/align。

pageId: ${opts.pageId}
pageType: ${opts.pageType}
templateId: ${opts.templateId || "(default)"}

当前 slots JSON:
${JSON.stringify(opts.slots ?? {}, null, 2)}

修复说明:
${opts.instruction}

原则：优先修正空字段、补全可信细节（数字/场景/动作）；过长再收；不要灌空话。hero subtitle 24～48 字；pillars body 28～56 字；problem 可写到 90～160 字；禁赋能/闭环。保留合理的 density/emphasis/align。hero/close 保持收束。

只返回 JSON：{ "pageId": "...", "pageType": "...", "templateId": "...", "slots": { ... } }`;
}
