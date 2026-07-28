import type { LayoutKey, PageType } from "../types";
import { resolveLayoutKey } from "./pageTypes";
import type { DesignProfile } from "../design/director";

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

/** 默认：封面 → 目录 → 痛点 → 方案 → 要点 → 指标 → 呼吸 → 封底 */
export const DEFAULT_PAGE_TYPE_SEQUENCE: PageType[] = [
  "hero",
  "agenda",
  "problem",
  "solution",
  "pillars",
  "metrics",
  "breath",
  "close",
];

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

function uniquePageTypes(pageTypes: readonly PageType[]): PageType[] {
  const seen = new Set<PageType>();
  const out: PageType[] = [];
  for (const pageType of pageTypes) {
    if (seen.has(pageType)) continue;
    seen.add(pageType);
    out.push(pageType);
  }
  return out;
}

function insertBeforeClose(
  pageTypes: readonly PageType[],
  pageType: PageType
): PageType[] {
  if (pageTypes.includes(pageType)) return [...pageTypes];
  const out = [...pageTypes];
  const closeIdx = out.lastIndexOf("close");
  out.splice(closeIdx >= 0 ? closeIdx : out.length, 0, pageType);
  return out;
}

function applyPromptNeedsToSequence(
  pageTypes: readonly PageType[],
  needs: {
    data: boolean;
    compare: boolean;
    team: boolean;
    timeline: boolean;
  }
): PageType[] {
  let seq = uniquePageTypes(pageTypes);
  if (needs.data) seq = insertBeforeClose(seq, "metrics");
  if (needs.compare) seq = insertBeforeClose(seq, "compare");
  if (needs.team) seq = insertBeforeClose(seq, "team");
  if (needs.timeline) seq = insertBeforeClose(seq, "timeline");
  return seq;
}

/** 按用户指定页数裁剪，但尽量保留收束页，避免 N 页请求裁掉 close。 */
export function pageTypesFromPlan(
  plan: readonly PagePlanItem[],
  requested?: number
): PageType[] {
  const planned = plan.map((p) => p.pageType);
  if (requested == null) return planned;

  let out = planned.slice(0, requested);
  const fallback = DEFAULT_PAGE_TYPE_SEQUENCE.filter((pt) => !out.includes(pt));
  let fallbackIndex = 0;
  while (out.length < requested) {
    out.push(fallback[fallbackIndex++] || "breath");
  }

  const plannedClose = planned.includes("close");
  const closeIdx = out.indexOf("close");
  if (requested >= 3 && plannedClose && closeIdx < 0) {
    out[out.length - 1] = "close";
  } else if (closeIdx >= 0 && closeIdx !== out.length - 1) {
    out.splice(closeIdx, 1);
    out.push("close");
  }
  return out;
}

/** 页序优先用 DesignProfile（来自 BriefAgent）；无 profile 时用轻量需求启发兜底 */
export function pickPagePlan(
  userPrompt: string,
  designProfile?: DesignProfile
): PagePlanItem[] {
  const p = userPrompt.toLowerCase();
  const wantsData =
    /数据|指标|增长|营收|报表|chart|kpi|融资|路演/.test(p);
  const wantsCompare = /对比|竞品|方案对比|表格|明细/.test(p);
  const wantsTeam = /团队|创始人|成员|顾问/.test(p);
  const wantsTimeline = /里程碑|时间线|路线图|发展历程|roadmap/.test(p);
  const needs = {
    data: wantsData,
    compare: wantsCompare,
    team: wantsTeam,
    timeline: wantsTimeline,
  };

  if (designProfile?.pageSequenceHints?.length) {
    return planFromPageTypes(
      applyPromptNeedsToSequence(designProfile.pageSequenceHints, needs),
      {
        hero:
          designProfile.archetype === "editorialStory"
            ? "cover-center"
            : undefined,
        evidence:
          designProfile.archetype === "productLaunch" ||
          designProfile.archetype === "dataMonument"
            ? "chart-wide"
            : undefined,
      }
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
      "breath",
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
      "breath",
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
        "breath",
        "close",
      ],
      { evidence: "chart-wide" }
    );
  }
  return planFromPageTypes(DEFAULT_PAGE_TYPE_SEQUENCE);
}
