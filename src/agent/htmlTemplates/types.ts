/**
 * HTML 页模板槽位类型。
 * 61 套模板共用若干槽位族；LLM 只填槽，不改版式。
 */

export type TemplateThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  textOnLight: string;
  textOnDark: string;
  muted: string;
  /** 细分隔线（无 CSS opacity，可进 data-fill） */
  divider: string;
  /** 更淡的分隔线 */
  hairline: string;
  fontTitle: string;
  fontBody: string;
  cardFill: string;
};

export type HeroTemplateSlots = {
  pageId: string;
  title: string;
  subtitle: string;
  footer?: string;
  bgImageKey: string;
  bgImagePrompt: string;
};

export type MetricItem = { value: string; label: string };

export type MetricsTemplateSlots = {
  pageId: string;
  title: string;
  metrics: MetricItem[];
  footer: string;
};

export type PillarItem = { iconName: string; title: string; body: string };

export type PillarsTemplateSlots = {
  pageId: string;
  title: string;
  pillars: PillarItem[];
};

export type CloseTemplateSlots = {
  pageId: string;
  title: string;
  subtitle: string;
  contact?: string;
  bgImageKey: string;
  bgImagePrompt: string;
};

export type ListItem = { title: string; body: string };

export type AgendaTemplateSlots = {
  pageId: string;
  title: string;
  items: ListItem[];
};

export type DualTemplateSlots = {
  pageId: string;
  title: string;
  leftTitle: string;
  leftBody: string;
  rightTitle: string;
  rightBody: string;
};

export type BreathTemplateSlots = {
  pageId: string;
  quote: string;
  attribution: string;
};

export type TeamMember = { name: string; role: string; blurb: string };

export type TeamTemplateSlots = {
  pageId: string;
  title: string;
  members: TeamMember[];
};

export type TimelineStep = { label: string; detail: string };

export type TimelineTemplateSlots = {
  pageId: string;
  title: string;
  steps: TimelineStep[];
};

export type NarrativeTemplateSlots = {
  pageId: string;
  title: string;
  body: string;
  aside?: string;
};

export type EvidenceTemplateSlots = {
  pageId: string;
  title: string;
  caption: string;
  bullets: string[];
};

export type ProblemTemplateSlots = {
  pageId: string;
  title: string;
  body: string;
  points: string[];
};

export type SolutionTemplateSlots = {
  pageId: string;
  title: string;
  steps: ListItem[];
};

/** 65 个模板 id（含 4 个短别名） */
export const HTML_TEMPLATE_IDS = [
  "hero",
  "hero-rail",
  "hero-split",
  "hero-type",
  "hero-frame",
  "metrics",
  "metrics-ledger",
  "metrics-band",
  "metrics-focus",
  "metrics-stack",
  "metrics-inline",
  "pillars",
  "pillars-open",
  "pillars-ladder",
  "pillars-numbers",
  "pillars-stack",
  "pillars-band",
  "close",
  "close-rail",
  "close-quiet",
  "close-split",
  "close-type",
  "close-band",
  "agenda-steps",
  "agenda-grid",
  "agenda-rail",
  "agenda-strip",
  "agenda-stack",
  "problem-slash",
  "problem-stack",
  "problem-focus",
  "problem-ledger",
  "problem-band",
  "solution-flow",
  "solution-ladder",
  "solution-split",
  "solution-band",
  "solution-open",
  "evidence-split",
  "evidence-stack",
  "evidence-rows",
  "evidence-aside",
  "evidence-focus",
  "compare-duel",
  "compare-stack",
  "compare-band",
  "compare-quiet",
  "compare-flags",
  "breath-mark",
  "breath-center",
  "breath-band",
  "breath-type",
  "breath-split",
  "team-strip",
  "team-ladder",
  "team-focus",
  "team-rail",
  "team-band",
  "timeline-pulse",
  "timeline-vertical",
  "timeline-stack",
  "timeline-split",
  "timeline-band",
  "narrative-column",
  "manifesto-cover",
] as const;

export type HtmlTemplateId = (typeof HTML_TEMPLATE_IDS)[number];

/** 61 套实体模板（不含短别名） */
export const HTML_TEMPLATE_SUITE_IDS = [
  "hero-rail",
  "hero-split",
  "hero-type",
  "hero-frame",
  "manifesto-cover",
  "metrics-ledger",
  "metrics-band",
  "metrics-focus",
  "metrics-stack",
  "metrics-inline",
  "pillars-open",
  "pillars-ladder",
  "pillars-numbers",
  "pillars-stack",
  "pillars-band",
  "close-rail",
  "close-quiet",
  "close-split",
  "close-type",
  "close-band",
  "agenda-steps",
  "agenda-grid",
  "agenda-rail",
  "agenda-strip",
  "agenda-stack",
  "problem-slash",
  "problem-stack",
  "problem-focus",
  "problem-ledger",
  "problem-band",
  "solution-flow",
  "solution-ladder",
  "solution-split",
  "solution-band",
  "solution-open",
  "evidence-split",
  "evidence-stack",
  "evidence-rows",
  "evidence-aside",
  "evidence-focus",
  "compare-duel",
  "compare-stack",
  "compare-band",
  "compare-quiet",
  "compare-flags",
  "breath-mark",
  "breath-center",
  "breath-band",
  "breath-type",
  "breath-split",
  "team-strip",
  "team-ladder",
  "team-focus",
  "team-rail",
  "team-band",
  "timeline-pulse",
  "timeline-vertical",
  "timeline-stack",
  "timeline-split",
  "timeline-band",
  "narrative-column",
] as const;

export type HtmlTemplateSuiteId = (typeof HTML_TEMPLATE_SUITE_IDS)[number];

export type AnyTemplateSlots =
  | HeroTemplateSlots
  | MetricsTemplateSlots
  | PillarsTemplateSlots
  | CloseTemplateSlots
  | AgendaTemplateSlots
  | DualTemplateSlots
  | BreathTemplateSlots
  | TeamTemplateSlots
  | TimelineTemplateSlots
  | NarrativeTemplateSlots
  | EvidenceTemplateSlots
  | ProblemTemplateSlots
  | SolutionTemplateSlots;

/** 按模板 id 推断槽位类型（短别名与实体套共用槽位族） */
export type TemplateSlotsById = {
  hero: HeroTemplateSlots;
  "hero-rail": HeroTemplateSlots;
  "hero-split": HeroTemplateSlots;
  "hero-type": HeroTemplateSlots;
  "hero-frame": HeroTemplateSlots;
  "manifesto-cover": HeroTemplateSlots;
  metrics: MetricsTemplateSlots;
  "metrics-ledger": MetricsTemplateSlots;
  "metrics-band": MetricsTemplateSlots;
  "metrics-focus": MetricsTemplateSlots;
  "metrics-stack": MetricsTemplateSlots;
  "metrics-inline": MetricsTemplateSlots;
  pillars: PillarsTemplateSlots;
  "pillars-open": PillarsTemplateSlots;
  "pillars-ladder": PillarsTemplateSlots;
  "pillars-numbers": PillarsTemplateSlots;
  "pillars-stack": PillarsTemplateSlots;
  "pillars-band": PillarsTemplateSlots;
  close: CloseTemplateSlots;
  "close-rail": CloseTemplateSlots;
  "close-quiet": CloseTemplateSlots;
  "close-split": CloseTemplateSlots;
  "close-type": CloseTemplateSlots;
  "close-band": CloseTemplateSlots;
  "agenda-steps": AgendaTemplateSlots;
  "agenda-grid": AgendaTemplateSlots;
  "agenda-rail": AgendaTemplateSlots;
  "agenda-strip": AgendaTemplateSlots;
  "agenda-stack": AgendaTemplateSlots;
  "problem-slash": ProblemTemplateSlots;
  "problem-stack": ProblemTemplateSlots;
  "problem-focus": ProblemTemplateSlots;
  "problem-ledger": ProblemTemplateSlots;
  "problem-band": ProblemTemplateSlots;
  "solution-flow": SolutionTemplateSlots;
  "solution-ladder": SolutionTemplateSlots;
  "solution-split": SolutionTemplateSlots;
  "solution-band": SolutionTemplateSlots;
  "solution-open": SolutionTemplateSlots;
  "evidence-split": EvidenceTemplateSlots;
  "evidence-stack": EvidenceTemplateSlots;
  "evidence-rows": EvidenceTemplateSlots;
  "evidence-aside": EvidenceTemplateSlots;
  "evidence-focus": EvidenceTemplateSlots;
  "compare-duel": DualTemplateSlots;
  "compare-stack": DualTemplateSlots;
  "compare-band": DualTemplateSlots;
  "compare-quiet": DualTemplateSlots;
  "compare-flags": DualTemplateSlots;
  "breath-mark": BreathTemplateSlots;
  "breath-center": BreathTemplateSlots;
  "breath-band": BreathTemplateSlots;
  "breath-type": BreathTemplateSlots;
  "breath-split": BreathTemplateSlots;
  "team-strip": TeamTemplateSlots;
  "team-ladder": TeamTemplateSlots;
  "team-focus": TeamTemplateSlots;
  "team-rail": TeamTemplateSlots;
  "team-band": TeamTemplateSlots;
  "timeline-pulse": TimelineTemplateSlots;
  "timeline-vertical": TimelineTemplateSlots;
  "timeline-stack": TimelineTemplateSlots;
  "timeline-split": TimelineTemplateSlots;
  "timeline-band": TimelineTemplateSlots;
  "narrative-column": NarrativeTemplateSlots;
};
