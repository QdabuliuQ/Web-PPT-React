import type { LayoutKey, LayoutSkeleton } from "../types";
import {
  chartLayout,
  chartWideLayout,
  compareSplitLayout,
  coverCenterLayout,
  coverLeftLayout,
  coverLayout,
  coverRightLayout,
  endingCenterLayout,
  endingLayout,
  imageTextLayout,
  kpiLayout,
  kpiRowLayout,
  pillarsIconsLayout,
  quoteCenterLayout,
  quoteLayout,
  tableLayout,
  teamCardsLayout,
  teamListLayout,
  threePointsLayout,
  timelineLayout,
  tocCardsLayout,
  tocLayout,
  twoColumnLayout,
} from "./skeletons";

export type { PagePlanItem } from "./sequence";

export {
  ALT_LAYOUT_SEQUENCE,
  ALT_PAGE_TYPE_SEQUENCE,
  DEFAULT_LAYOUT_SEQUENCE,
  DEFAULT_PAGE_TYPE_SEQUENCE,
  LAYOUT_INTENT,
  ensurePagePlanItem,
  pickLayoutSequence,
  pickPagePlan,
  planToLayoutSequence,
} from "./sequence";

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

/** 按 pageType 分组的骨架源文件见 ./skeletons/ */
const LAYOUTS: Record<LayoutKey, LayoutSkeleton> = {
  cover: { ...coverLayout, pageTypes: ["hero"] },
  "cover-center": { ...coverCenterLayout, pageTypes: ["hero"] },
  "cover-left": { ...coverLeftLayout, pageTypes: ["hero"] },
  "cover-right": { ...coverRightLayout, pageTypes: ["hero"] },
  toc: { ...tocLayout, pageTypes: ["agenda"] },
  "toc-cards": { ...tocCardsLayout, pageTypes: ["agenda"] },
  "two-column": { ...twoColumnLayout, pageTypes: ["problem", "solution"] },
  "image-text": { ...imageTextLayout, pageTypes: ["problem", "solution"] },
  "three-points": { ...threePointsLayout, pageTypes: ["pillars"] },
  "pillars-icons": { ...pillarsIconsLayout, pageTypes: ["pillars"] },
  kpi: { ...kpiLayout, pageTypes: ["metrics"] },
  "kpi-row": { ...kpiRowLayout, pageTypes: ["metrics"] },
  quote: { ...quoteLayout, pageTypes: ["breath"] },
  "quote-center": { ...quoteCenterLayout, pageTypes: ["breath"] },
  chart: { ...chartLayout, pageTypes: ["evidence"] },
  "chart-wide": { ...chartWideLayout, pageTypes: ["evidence"] },
  table: { ...tableLayout, pageTypes: ["compare"] },
  "compare-split": { ...compareSplitLayout, pageTypes: ["compare"] },
  "team-cards": { ...teamCardsLayout, pageTypes: ["team"] },
  "team-list": { ...teamListLayout, pageTypes: ["team"] },
  timeline: { ...timelineLayout, pageTypes: ["timeline"] },
  ending: { ...endingLayout, pageTypes: ["close"] },
  "ending-center": { ...endingCenterLayout, pageTypes: ["close"] },
};

export function getLayout(key: LayoutKey): LayoutSkeleton {
  const layout = LAYOUTS[key];
  if (!layout) throw new Error(`未知 layoutKey: ${key}`);
  return layout;
}

export function listLayouts(): LayoutSkeleton[] {
  return Object.values(LAYOUTS);
}

export { LAYOUTS };
export * from "./skeletons";
