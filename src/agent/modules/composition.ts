import type { PageType } from "../types";
import type { StoryPageDraft } from "../story/types";

/**
 * 双平面构图语法：文字只落在实色面上，媒体不承担可读性。
 * 禁止 fullBleedOverlay（全幅底图裸叠字）。
 */
export type SlideComposition = "split" | "band" | "card" | "solid";

export const SLIDE_COMPOSITIONS: readonly SlideComposition[] = [
  "split",
  "band",
  "card",
  "solid",
] as const;

export function isSlideComposition(v: unknown): v is SlideComposition {
  return (
    v === "split" || v === "band" || v === "card" || v === "solid"
  );
}

/** pageType → 默认可选语法（不含危险的全幅叠字） */
const DEFAULTS: Record<PageType, readonly SlideComposition[]> = {
  hero: ["split", "band", "card"],
  close: ["split", "band", "card"],
  breath: ["card", "split", "solid"],
  metrics: ["solid"],
  pillars: ["solid"],
  agenda: ["solid"],
  problem: ["solid"],
  solution: ["solid"],
  evidence: ["solid", "card"],
  compare: ["solid"],
  team: ["solid"],
  timeline: ["solid"],
};

function hashPick(seed: string, n: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return n <= 0 ? 0 : (h >>> 0) % n;
}

/** 解析 Story 声明或按 pageType + run 种子挑选 */
export function resolveComposition(
  page: StoryPageDraft,
  runId = ""
): SlideComposition {
  if (isSlideComposition(page.composition)) return page.composition;
  const pool = DEFAULTS[page.pageType] || (["solid"] as const);
  const i = hashPick(`${runId}:${page.pageId}:${page.pageType}`, pool.length);
  return pool[i] || "solid";
}

/** 媒体页是否应有配图槽（solid 无图） */
export function compositionNeedsMedia(c: SlideComposition): boolean {
  return c === "split" || c === "band" || c === "card";
}
