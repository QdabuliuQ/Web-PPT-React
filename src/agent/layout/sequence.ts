import type { LayoutKey, PageType } from "../types";
import {
  resolveLayoutKey,
  resolvePageTypeAndLayout,
  PAGE_TYPE_LAYOUTS,
} from "./pageTypes";

export {
  PAGE_TYPES,
  PAGE_TYPE_META,
  PAGE_TYPE_LAYOUTS,
  buildPageTypeConstraintPrompt,
  inferPageType,
  isLayoutAllowedForPageType,
  isPageType,
  layoutsForPageType,
  resolveLayoutKey,
  resolvePageTypeAndLayout,
} from "./pageTypes";

export type PagePlanItem = {
  pageType: PageType;
  layoutKey: LayoutKey;
};

/** 默认：封面 → 目录 → 痛点 → 方案 → 要点 → 指标 → 团队 → 封底 */
export const DEFAULT_PAGE_TYPE_SEQUENCE: PageType[] = [
  "hero",
  "agenda",
  "problem",
  "solution",
  "pillars",
  "metrics",
  "team",
  "close",
];

export const DEFAULT_LAYOUT_SEQUENCE: LayoutKey[] =
  DEFAULT_PAGE_TYPE_SEQUENCE.map((pt) => PAGE_TYPE_LAYOUTS[pt][0]);

/** 备选：居中封面 + 数据证据 + 对比 + 时间线 */
export const ALT_PAGE_TYPE_SEQUENCE: PageType[] = [
  "hero",
  "agenda",
  "problem",
  "pillars",
  "evidence",
  "compare",
  "timeline",
  "close",
];

export const ALT_LAYOUT_SEQUENCE: LayoutKey[] = ALT_PAGE_TYPE_SEQUENCE.map(
  (pt) =>
    pt === "hero"
      ? "cover-center"
      : pt === "evidence"
        ? "chart-wide"
        : PAGE_TYPE_LAYOUTS[pt][0]
);

/** @deprecated 使用 LAYOUT 描述见 pageTypes；保留兼容 */
export const LAYOUT_INTENT: Record<
  LayoutKey,
  { intent: string; when: string }
> = {
  cover: { intent: "hero", when: "默认封面：左下标题叠全幅图" },
  "cover-center": { intent: "hero", when: "居中封面" },
  toc: { intent: "agenda", when: "目录/议程" },
  "toc-cards": { intent: "agenda", when: "四宫格目录卡" },
  "two-column": { intent: "problem|solution", when: "左文右图论证" },
  "image-text": { intent: "problem|solution", when: "左图右文" },
  "three-points": { intent: "pillars", when: "三支柱含插图" },
  "pillars-icons": { intent: "pillars", when: "三支柱图标卡" },
  kpi: { intent: "metrics", when: "三大数字" },
  "kpi-row": { intent: "metrics", when: "四横排指标" },
  quote: { intent: "breath", when: "引用+侧图" },
  "quote-center": { intent: "breath", when: "居中引用留白" },
  chart: { intent: "evidence", when: "图表+侧图" },
  "chart-wide": { intent: "evidence", when: "通栏图表" },
  table: { intent: "compare", when: "对比表" },
  "compare-split": { intent: "compare", when: "左右对照文" },
  "team-cards": { intent: "team", when: "团队卡片" },
  "team-list": { intent: "team", when: "团队列表" },
  timeline: { intent: "timeline", when: "里程碑" },
  ending: { intent: "close", when: "封底" },
  "ending-center": { intent: "close", when: "居中封底" },
};

function planFromPageTypes(
  pageTypes: PageType[],
  layoutOverrides?: Partial<Record<PageType, LayoutKey>>
): PagePlanItem[] {
  return pageTypes.map((pageType) => {
    const override = layoutOverrides?.[pageType];
    return {
      pageType,
      layoutKey: resolveLayoutKey(pageType, override),
    };
  });
}

/** 根据用户需求粗选 pageType 序列，并解析为骨架 */
export function pickPagePlan(userPrompt: string): PagePlanItem[] {
  const p = userPrompt.toLowerCase();
  const wantsData =
    /数据|指标|增长|营收|报表|chart|kpi|融资|路演/.test(p);
  const wantsBrand = /品牌|slogan|发布会|发布|愿景|理念/.test(p);
  const wantsCompare = /对比|竞品|方案对比|表格|明细/.test(p);
  const wantsTeam = /团队|创始人|成员|顾问/.test(p);
  const wantsTimeline = /里程碑|时间线|路线图|发展历程|roadmap/.test(p);

  if (wantsBrand && !wantsData) {
    return planFromPageTypes(
      [
        "hero",
        "agenda",
        "breath",
        "pillars",
        "solution",
        "problem",
        "metrics",
        "close",
      ],
      { hero: "cover-center" }
    );
  }
  if (wantsCompare) {
    return planFromPageTypes([
      "hero",
      "agenda",
      "problem",
      "compare",
      "evidence",
      "pillars",
      "breath",
      "close",
    ]);
  }
  if (wantsTimeline) {
    return planFromPageTypes([
      "hero",
      "agenda",
      "problem",
      "timeline",
      "solution",
      "metrics",
      "team",
      "close",
    ]);
  }
  if (wantsTeam && wantsData) {
    return planFromPageTypes([
      "hero",
      "agenda",
      "problem",
      "solution",
      "metrics",
      "evidence",
      "team",
      "close",
    ]);
  }
  if (wantsData) {
    return planFromPageTypes(
      [
        "hero",
        "agenda",
        "metrics",
        "evidence",
        "problem",
        "pillars",
        "compare",
        "close",
      ],
      { evidence: "chart-wide" }
    );
  }
  return planFromPageTypes(DEFAULT_PAGE_TYPE_SEQUENCE);
}

/** 兼容旧接口：只返回 layoutKey 序列 */
export function pickLayoutSequence(userPrompt: string): LayoutKey[] {
  return pickPagePlan(userPrompt).map((p) => p.layoutKey);
}

export function planToLayoutSequence(plan: PagePlanItem[]): LayoutKey[] {
  return plan.map((p) => p.layoutKey);
}

export function ensurePagePlanItem(input: {
  pageType?: string | null;
  layoutKey?: string | null;
}): PagePlanItem {
  return resolvePageTypeAndLayout(input);
}
