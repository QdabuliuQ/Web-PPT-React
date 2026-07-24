import type { PageType } from "../types";
import type { HtmlTemplateSuiteId } from "./types";
import { TEMPLATE_SUITE } from "./pages/registry";

/** 每个 pageType 可选的模板套（LLM 在白名单内选） */
export const PAGE_TYPE_TEMPLATE_SUITES: Record<
  PageType,
  readonly HtmlTemplateSuiteId[]
> = {
  hero: [
    "hero-rail",
    "hero-split",
    "hero-type",
    "manifesto-cover",
    "hero-frame",
  ],
  agenda: [
    "agenda-steps",
    "agenda-grid",
    "agenda-rail",
    "agenda-strip",
    "agenda-stack",
  ],
  problem: [
    "problem-slash",
    "problem-stack",
    "problem-focus",
    "problem-ledger",
    "problem-band",
  ],
  solution: [
    "solution-flow",
    "solution-ladder",
    "solution-split",
    "solution-band",
    "solution-open",
  ],
  pillars: [
    "pillars-open",
    "pillars-ladder",
    "pillars-numbers",
    "pillars-stack",
    "pillars-band",
  ],
  metrics: [
    "metrics-ledger",
    "metrics-band",
    "metrics-focus",
    "metrics-stack",
    "metrics-inline",
  ],
  evidence: [
    "evidence-split",
    "evidence-stack",
    "evidence-rows",
    "evidence-aside",
    "evidence-focus",
  ],
  compare: [
    "compare-duel",
    "compare-stack",
    "compare-band",
    "compare-quiet",
    "compare-flags",
  ],
  breath: [
    "breath-mark",
    "breath-center",
    "breath-band",
    "breath-type",
    "breath-split",
  ],
  team: [
    "team-strip",
    "team-ladder",
    "team-focus",
    "team-rail",
    "team-band",
  ],
  timeline: [
    "timeline-pulse",
    "timeline-vertical",
    "timeline-stack",
    "timeline-split",
    "timeline-band",
  ],
  close: [
    "close-rail",
    "close-quiet",
    "close-split",
    "close-type",
    "close-band",
  ],
};

export function defaultTemplateForPageType(
  pageType: PageType
): HtmlTemplateSuiteId {
  return PAGE_TYPE_TEMPLATE_SUITES[pageType][0];
}

/** 解析 templateId；非法或不匹配 pageType 时回退默认 */
export function resolveTemplateForPage(
  pageType: PageType,
  templateId?: string | null
): HtmlTemplateSuiteId {
  const allowed = PAGE_TYPE_TEMPLATE_SUITES[pageType];
  if (templateId && (allowed as readonly string[]).includes(templateId)) {
    return templateId as HtmlTemplateSuiteId;
  }
  if (templateId && templateId in TEMPLATE_SUITE) {
    const suite = templateId as HtmlTemplateSuiteId;
    const meta = TEMPLATE_SUITE[suite];
    // 宽松：若套存在且 kind 大致匹配则允许（兼容别名已在 resolve 外处理）
    if (meta.kind === pageType || (pageType === "compare" && meta.kind === "dual")) {
      return suite;
    }
  }
  return allowed[0];
}

export function formatTemplateCatalogForPrompt(): string {
  return (Object.keys(PAGE_TYPE_TEMPLATE_SUITES) as PageType[])
    .map((pt) => {
      const ids = PAGE_TYPE_TEMPLATE_SUITES[pt];
      const lines = ids
        .map((id) => `    - ${id}: ${TEMPLATE_SUITE[id].signature}`)
        .join("\n");
      return `  ${pt}:\n${lines}`;
    })
    .join("\n");
}
