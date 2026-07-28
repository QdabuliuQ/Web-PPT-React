import type { PageType, ThemeToken } from "../types";
import type { StoryPageDraft } from "../story/types";
import type { SlideComposition } from "./composition";

export type ModuleId =
  | "hero-claim"
  | "page-title"
  | "metric-row"
  | "pillar-row"
  | "bullet-stack"
  | "quote-billboard"
  | "body-narrative"
  | "agenda-list";

export type AssembledSlide = {
  pageId: string;
  pageType: PageType;
  templateId: `modules:${string}`;
  slots: Record<string, unknown>;
  html: string;
  via: "modules";
};

export type AssembleContext = {
  theme: ThemeToken;
  page: StoryPageDraft;
  runId: string;
  composition?: SlideComposition;
};

/** 支持积木组装的 pageType（其余回落整页模板） */
export const MODULE_PAGE_TYPES = new Set<PageType>([
  "hero",
  "close",
  "metrics",
  "pillars",
  "breath",
  "problem",
  "agenda",
]);
