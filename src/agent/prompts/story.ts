import { PLATFORM_LIMITS } from "../catalog";
import { PAGE_TYPE_META, PAGE_TYPES } from "../layout/pageTypes";
import type { DesignBrief } from "../brief/types";
import {
  formatDesignProfileForPrompt,
  type DesignProfile,
} from "../design/director";
import { pickNarrativeAngle } from "./layoutHtml";
import { parseRequestedPageCount } from "./layoutHtml";

export const STORY_SYSTEM_PROMPT = `你是 WebPPT 的 StoryAgent。只写「故事稿」，不写 HTML、不选模板。

输出 JSON：
{
  "name": "演示文稿标题",
  "angle": "本场叙事角度一句话",
  "pages": [
    {
      "pageType": "hero",
      "claim": "本页一句话主张",
      "title": "...",
      "subtitle": "...",
      "footer": "...",
      "imageIntent": "English photo brief bound to this claim, unique subject+lighting+framing",
      "density": "airy",
      "emphasis": "title",
      "align": "left",
      "composition": "split",
      "preferModules": true
    }
  ]
}

# 硬规则
1. 用户输入很短时，必须扩写成可上台讲的具体叙事：专名、数字口径、场景、动作、结果。
2. 每页必须有 claim（主张）与 imageIntent（英文 40～100 词，绑定 claim；禁止套用同一碗粮/同一金属箔空话）。
3. 禁用词：赋能、闭环、全面提升、抓手、打通、生态协同、价值最大化、深度融合。
4. pageType 只能是：${PAGE_TYPES.join(", ")}。
5. 通常含 hero 与 close；至少 1 页 breath 或 metrics（敢空）。
6. 有 agenda 时：先写 agenda.items，后续页必须按目录条目展开。
7. 字段按 pageType 填满：
   - hero/close: title, subtitle, footer/contact, imageIntent（媒体平面配图，非叠字底板）, composition（split|band|card，推荐 split）
   - metrics: title, metrics[3]{value,label}, footer；label 必须说明统计口径/业务含义，value 避免全是 100%/3x；composition 用 solid
   - pillars: title, pillars[3]{title,body,iconName?}；body 必须包含具体做法+责任/验收口径，composition 用 solid
   - agenda: title, items[3~4]{title,body}；body 要说明本段回答什么问题和后续证据
   - problem: title, body(90~160字), bullets[3]
   - solution: title, steps[3]{title,body}；body 必须写清动作、交付物、验收口径
   - evidence: title, caption, bullets[3], imageIntent（内容配图）；caption 写证据来源/口径
   - compare: title, leftTitle, leftBody, rightTitle, rightBody；左右 body 都要具体到差异和影响
   - breath: quote, attribution；composition 用 card|split|solid
   - team: title, members[3]{name,role,blurb,imageIntent?}
   - timeline: title, timeline[4]{label,detail}
8. preferModules 默认 true（系统会优先积木组装）。
9. 同需求多次生成必须换 angle、换案例数字、换 imageIntent 主体——禁止复读。
10. density 只能是 airy|normal|dense；emphasis 只能是 title|image|number；align 只能是 left|split|center。composition 只能是 split|band|card|solid。不确定就省略，不要自造词。
11. breath 页也必须有 title（可用短标题）；quote 不能代替 title 字段。
12. 禁止依赖「全幅背景图留暗带叠白字」；文字可读性由实色字区保证，图只做媒体平面。
13. 除 breath 外，所有 body/label/detail 建议 24～60 字；宁可少而具体，不要 4～8 字的空泛短句。

只输出 JSON。`;

export function buildStoryUserPrompt(
  userPrompt: string,
  opts?: {
    runSeed?: number;
    runId?: string;
    designProfile?: DesignProfile;
    brief?: DesignBrief;
  }
): string {
  const seed = opts?.runSeed ?? Date.now();
  const angle = pickNarrativeAngle(seed);
  const n = parseRequestedPageCount(userPrompt);
  const pageHint = n
    ? `页数必须正好 ${n} 页。`
    : `未指定时生成 ${PLATFORM_LIMITS.agentPages.min}～${PLATFORM_LIMITS.agentPages.max} 页。`;
  const pageTypes = PAGE_TYPES.map(
    (t) => `- ${t}: ${PAGE_TYPE_META[t].label}`
  ).join("\n");
  const designHint = opts?.designProfile
    ? `\n${formatDesignProfileForPrompt(opts.designProfile)}\n`
    : "";
  const occasion =
    opts?.brief?.label || opts?.designProfile?.label || "通用商务简报";
  const layoutGuidance =
    opts?.brief?.layoutGuidance ||
    opts?.designProfile?.narrativeShape ||
    "按叙事需要选 pageType，含至少一页呼吸页。";

  return `用户需求：
${userPrompt}

【页数】${pageHint}
【场合】${occasion}
${layoutGuidance}
${designHint}
【建议叙事角度】${angle}
【runId】${opts?.runId || "run"}（写入每页 imageIntent 末尾作差异标记，如 variation:${opts?.runId || "run"}）

页面类型：
${pageTypes}

请输出故事稿 JSON（name + angle + pages）。优先采用【设计导演策略】里的 pageSequenceHints / moduleBias / preferredCompositions；每页 claim / imageIntent 必须具体且彼此不同。`;
}
