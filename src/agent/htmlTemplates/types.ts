/**
 * HTML 页模板槽位类型。
 * 模板共用若干槽位族；LLM 只填槽，不改版式。
 */

export type TemplateThemeColors = {
  primary: string;
  secondary: string;
  /** 可读强调字色：由 secondary 派生，但会按当前背景校正到 WCAG 4.5+ */
  accentText: string;
  /** primary 色块上的正文/小字墨水色 */
  primaryInk: string;
  /** 浅色背景上的主色文字；由 primary 派生并校正到 WCAG 4.5+ */
  primaryText: string;
  /** secondary 色块上的正文/小字墨水色 */
  secondaryInk: string;
  /** primary 色块上的强调字色，保留 secondary 气质但保证可读 */
  accentOnPrimary: string;
  background: string;
  textOnLight: string;
  textOnDark: string;
  /** 叠在封面/封底色块或底图上的 eyebrow / 角标字色（自动选高对比） */
  eyebrow: string;
  /** 左上叠字薄色带（无 opacity，深色实底托住 eyebrow） */
  scrim: string;
  muted: string;
  /** 细分隔线（无 CSS opacity，可进 data-fill） */
  divider: string;
  /** 更淡的分隔线 */
  hairline: string;
  fontTitle: string;
  fontBody: string;
  /** KPI / 序号大数字 */
  fontNumeric: string;
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

export type ListItem = {
  title: string;
  body: string;
  /** IconPark 白名单名；agenda/solution 等模板可选 */
  iconName?: string;
};

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

export type TeamMember = {
  name: string;
  role: string;
  blurb: string;
  /** 头像 assetKey，建议 page_{n}_avatar_{i} */
  imageKey?: string;
  /** 英文生图提示；透明底头像写 isolated subject on transparent background */
  imagePrompt?: string;
};

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
  /** 证据区配图 assetKey，建议 page_{n}_evidence */
  imageKey?: string;
  /** 英文详细生图提示（产品/仪表盘/场景照；可要求透明底装饰） */
  imagePrompt?: string;
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

/** 模板 id（含短别名） */
export const HTML_TEMPLATE_IDS = [
  "hero",
  "hero-rail",
  "hero-split",
  "hero-type",
  "hero-frame",
  "hero-floor",
  "hero-bleed",
  "hero-slab",
  "hero-product-showcase",
  "hero-data-monument",
  "hero-report-spine",
  "hero-stage-marquee",
  "metrics",
  "metrics-ledger",
  "metrics-band",
  "metrics-focus",
  "metrics-stack",
  "metrics-inline",
  "metrics-corner",
  "metrics-hero",
  "metrics-monument",
  "pillars",
  "pillars-open",
  "pillars-ladder",
  "pillars-numbers",
  "pillars-stack",
  "pillars-band",
  "pillars-mast",
  "pillars-spine",
  "pillars-loose",
  "close",
  "close-rail",
  "close-quiet",
  "close-split",
  "close-type",
  "close-band",
  "close-floor",
  "agenda-steps",
  "agenda-grid",
  "agenda-rail",
  "agenda-strip",
  "agenda-stack",
  "agenda-columns",
  "agenda-folio",
  "problem-slash",
  "problem-stack",
  "problem-focus",
  "problem-ledger",
  "problem-band",
  "problem-rail",
  "problem-tight",
  "solution-flow",
  "solution-ladder",
  "solution-split",
  "solution-band",
  "solution-open",
  "solution-cascade",
  "evidence-split",
  "evidence-stack",
  "evidence-rows",
  "evidence-aside",
  "evidence-focus",
  "evidence-quote",
  "evidence-stage",
  "evidence-plaza",
  "compare-duel",
  "compare-stack",
  "compare-band",
  "compare-quiet",
  "compare-flags",
  "compare-panels",
  "breath-mark",
  "breath-center",
  "breath-band",
  "breath-type",
  "breath-split",
  "breath-floor",
  "breath-billboard",
  "team-strip",
  "team-ladder",
  "team-focus",
  "team-rail",
  "team-band",
  "team-mast",
  "timeline-pulse",
  "timeline-vertical",
  "timeline-stack",
  "timeline-split",
  "timeline-band",
  "timeline-mast",
  "narrative-column",
  "manifesto-cover",
] as const;

export type HtmlTemplateId = (typeof HTML_TEMPLATE_IDS)[number];

/** 实体模板 id（不含短别名） */
export const HTML_TEMPLATE_SUITE_IDS = [
  "hero-rail",
  "hero-split",
  "hero-type",
  "hero-frame",
  "manifesto-cover",
  "hero-floor",
  "hero-bleed",
  "hero-slab",
  "hero-product-showcase",
  "hero-data-monument",
  "hero-report-spine",
  "hero-stage-marquee",
  "metrics-ledger",
  "metrics-band",
  "metrics-focus",
  "metrics-stack",
  "metrics-inline",
  "metrics-corner",
  "metrics-hero",
  "metrics-monument",
  "pillars-open",
  "pillars-ladder",
  "pillars-numbers",
  "pillars-stack",
  "pillars-band",
  "pillars-mast",
  "pillars-spine",
  "pillars-loose",
  "close-rail",
  "close-quiet",
  "close-split",
  "close-type",
  "close-band",
  "close-floor",
  "agenda-steps",
  "agenda-grid",
  "agenda-rail",
  "agenda-strip",
  "agenda-stack",
  "agenda-columns",
  "agenda-folio",
  "problem-slash",
  "problem-stack",
  "problem-focus",
  "problem-ledger",
  "problem-band",
  "problem-rail",
  "problem-tight",
  "solution-flow",
  "solution-ladder",
  "solution-split",
  "solution-band",
  "solution-open",
  "solution-cascade",
  "evidence-split",
  "evidence-stack",
  "evidence-rows",
  "evidence-aside",
  "evidence-focus",
  "evidence-quote",
  "evidence-stage",
  "evidence-plaza",
  "compare-duel",
  "compare-stack",
  "compare-band",
  "compare-quiet",
  "compare-flags",
  "compare-panels",
  "breath-mark",
  "breath-center",
  "breath-band",
  "breath-type",
  "breath-split",
  "breath-floor",
  "breath-billboard",
  "team-strip",
  "team-ladder",
  "team-focus",
  "team-rail",
  "team-band",
  "team-mast",
  "timeline-pulse",
  "timeline-vertical",
  "timeline-stack",
  "timeline-split",
  "timeline-band",
  "timeline-mast",
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
  "hero-floor": HeroTemplateSlots;
  "hero-bleed": HeroTemplateSlots;
  "hero-slab": HeroTemplateSlots;
  "hero-product-showcase": HeroTemplateSlots;
  "hero-data-monument": HeroTemplateSlots;
  "hero-report-spine": HeroTemplateSlots;
  "hero-stage-marquee": HeroTemplateSlots;
  metrics: MetricsTemplateSlots;
  "metrics-ledger": MetricsTemplateSlots;
  "metrics-band": MetricsTemplateSlots;
  "metrics-focus": MetricsTemplateSlots;
  "metrics-stack": MetricsTemplateSlots;
  "metrics-inline": MetricsTemplateSlots;
  "metrics-corner": MetricsTemplateSlots;
  "metrics-hero": MetricsTemplateSlots;
  "metrics-monument": MetricsTemplateSlots;
  pillars: PillarsTemplateSlots;
  "pillars-open": PillarsTemplateSlots;
  "pillars-ladder": PillarsTemplateSlots;
  "pillars-numbers": PillarsTemplateSlots;
  "pillars-stack": PillarsTemplateSlots;
  "pillars-band": PillarsTemplateSlots;
  "pillars-mast": PillarsTemplateSlots;
  "pillars-spine": PillarsTemplateSlots;
  "pillars-loose": PillarsTemplateSlots;
  close: CloseTemplateSlots;
  "close-rail": CloseTemplateSlots;
  "close-quiet": CloseTemplateSlots;
  "close-split": CloseTemplateSlots;
  "close-type": CloseTemplateSlots;
  "close-band": CloseTemplateSlots;
  "close-floor": CloseTemplateSlots;
  "agenda-steps": AgendaTemplateSlots;
  "agenda-grid": AgendaTemplateSlots;
  "agenda-rail": AgendaTemplateSlots;
  "agenda-strip": AgendaTemplateSlots;
  "agenda-stack": AgendaTemplateSlots;
  "agenda-columns": AgendaTemplateSlots;
  "agenda-folio": AgendaTemplateSlots;
  "problem-slash": ProblemTemplateSlots;
  "problem-stack": ProblemTemplateSlots;
  "problem-focus": ProblemTemplateSlots;
  "problem-ledger": ProblemTemplateSlots;
  "problem-band": ProblemTemplateSlots;
  "problem-rail": ProblemTemplateSlots;
  "problem-tight": ProblemTemplateSlots;
  "solution-flow": SolutionTemplateSlots;
  "solution-ladder": SolutionTemplateSlots;
  "solution-split": SolutionTemplateSlots;
  "solution-band": SolutionTemplateSlots;
  "solution-open": SolutionTemplateSlots;
  "solution-cascade": SolutionTemplateSlots;
  "evidence-split": EvidenceTemplateSlots;
  "evidence-stack": EvidenceTemplateSlots;
  "evidence-rows": EvidenceTemplateSlots;
  "evidence-aside": EvidenceTemplateSlots;
  "evidence-focus": EvidenceTemplateSlots;
  "evidence-quote": EvidenceTemplateSlots;
  "evidence-stage": EvidenceTemplateSlots;
  "evidence-plaza": EvidenceTemplateSlots;
  "compare-duel": DualTemplateSlots;
  "compare-stack": DualTemplateSlots;
  "compare-band": DualTemplateSlots;
  "compare-quiet": DualTemplateSlots;
  "compare-flags": DualTemplateSlots;
  "compare-panels": DualTemplateSlots;
  "breath-mark": BreathTemplateSlots;
  "breath-center": BreathTemplateSlots;
  "breath-band": BreathTemplateSlots;
  "breath-type": BreathTemplateSlots;
  "breath-split": BreathTemplateSlots;
  "breath-floor": BreathTemplateSlots;
  "breath-billboard": BreathTemplateSlots;
  "team-strip": TeamTemplateSlots;
  "team-ladder": TeamTemplateSlots;
  "team-focus": TeamTemplateSlots;
  "team-rail": TeamTemplateSlots;
  "team-band": TeamTemplateSlots;
  "team-mast": TeamTemplateSlots;
  "timeline-pulse": TimelineTemplateSlots;
  "timeline-vertical": TimelineTemplateSlots;
  "timeline-stack": TimelineTemplateSlots;
  "timeline-split": TimelineTemplateSlots;
  "timeline-band": TimelineTemplateSlots;
  "timeline-mast": TimelineTemplateSlots;
  "narrative-column": NarrativeTemplateSlots;
};
