import type { LayoutKey, PageType } from "../types";

/** 页面类型（叙事角色）— 与骨架 layoutKey 分离 */
export const PAGE_TYPES = [
  "hero",
  "agenda",
  "problem",
  "solution",
  "pillars",
  "metrics",
  "evidence",
  "compare",
  "breath",
  "team",
  "timeline",
  "close",
] as const satisfies readonly PageType[];

export const PAGE_TYPE_META: Record<
  PageType,
  { label: string; when: string }
> = {
  hero: { label: "封面", when: "开场：标题/副标题/场合" },
  agenda: { label: "目录", when: "议程/章节导航" },
  problem: { label: "背景痛点", when: "问题、市场、为什么现在" },
  solution: { label: "方案产品", when: "怎么解、产品是什么" },
  pillars: { label: "三要点", when: "并列卖点/支柱" },
  metrics: { label: "成果指标", when: "大数字/规模/验证" },
  evidence: { label: "数据证据", when: "图表趋势解读" },
  compare: { label: "对比明细", when: "竞品/方案对比" },
  breath: { label: "留白引用", when: "证言、金句、过渡" },
  team: { label: "团队", when: "核心成员介绍" },
  timeline: { label: "里程碑", when: "时间线/路线图" },
  close: { label: "封底", when: "致谢、联系、下一步" },
};

/**
 * 页面类型 → 可选骨架（AI 先选 pageType，再在白名单内选 layoutKey）
 */
export const PAGE_TYPE_LAYOUTS: Record<PageType, readonly LayoutKey[]> = {
  hero: ["cover", "cover-center"],
  agenda: ["toc", "toc-cards"],
  problem: ["two-column", "image-text"],
  solution: ["two-column", "image-text"],
  pillars: ["three-points", "pillars-icons"],
  metrics: ["kpi", "kpi-row"],
  evidence: ["chart", "chart-wide"],
  compare: ["table", "compare-split"],
  breath: ["quote", "quote-center"],
  team: ["team-cards", "team-list"],
  timeline: ["timeline"],
  close: ["ending", "ending-center"],
};

/** layoutKey → 默认 pageType（共享骨架时取主用途） */
const LAYOUT_DEFAULT_PAGE_TYPE: Record<LayoutKey, PageType> = {
  cover: "hero",
  "cover-center": "hero",
  toc: "agenda",
  "toc-cards": "agenda",
  "two-column": "problem",
  "image-text": "solution",
  "three-points": "pillars",
  "pillars-icons": "pillars",
  kpi: "metrics",
  "kpi-row": "metrics",
  chart: "evidence",
  "chart-wide": "evidence",
  table: "compare",
  "compare-split": "compare",
  quote: "breath",
  "quote-center": "breath",
  "team-cards": "team",
  "team-list": "team",
  timeline: "timeline",
  ending: "close",
  "ending-center": "close",
};

export function isPageType(v: string): v is PageType {
  return (PAGE_TYPES as readonly string[]).includes(v);
}

export function layoutsForPageType(pageType: PageType): readonly LayoutKey[] {
  return PAGE_TYPE_LAYOUTS[pageType];
}

export function isLayoutAllowedForPageType(
  pageType: PageType,
  layoutKey: LayoutKey
): boolean {
  return PAGE_TYPE_LAYOUTS[pageType].includes(layoutKey);
}

export function inferPageType(layoutKey: LayoutKey): PageType {
  return LAYOUT_DEFAULT_PAGE_TYPE[layoutKey];
}

/** 在 pageType 白名单内解析骨架；非法或不匹配时回退到该类型默认骨架 */
export function resolveLayoutKey(
  pageType: PageType,
  layoutKey?: LayoutKey | string | null
): LayoutKey {
  const allowed = PAGE_TYPE_LAYOUTS[pageType];
  if (
    layoutKey &&
    (allowed as readonly string[]).includes(layoutKey)
  ) {
    return layoutKey as LayoutKey;
  }
  return allowed[0];
}

/** 从 pageType + 可选 layoutKey 规范化一页的类型与骨架 */
export function resolvePageTypeAndLayout(input: {
  pageType?: string | null;
  layoutKey?: string | null;
}): { pageType: PageType; layoutKey: LayoutKey } {
  let pageType: PageType | undefined = isPageType(input.pageType || "")
    ? (input.pageType as PageType)
    : undefined;

  const layoutRaw = input.layoutKey;
  const layoutKnown =
    layoutRaw && layoutRaw in LAYOUT_DEFAULT_PAGE_TYPE
      ? (layoutRaw as LayoutKey)
      : undefined;

  if (!pageType && layoutKnown) {
    pageType = inferPageType(layoutKnown);
  }
  if (!pageType) {
    pageType = "problem";
  }

  const layoutKey = resolveLayoutKey(pageType, layoutKnown);
  return { pageType, layoutKey };
}

export function buildPageTypeConstraintPrompt(): string {
  return Object.entries(PAGE_TYPE_META)
    .map(([k, v]) => {
      const layouts = PAGE_TYPE_LAYOUTS[k as PageType].join(", ");
      return `- ${k}（${v.label}）：${v.when} → 骨架仅限 [${layouts}]`;
    })
    .join("\n");
}
