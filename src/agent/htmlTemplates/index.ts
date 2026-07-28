export {
  TEMPLATE_SUITE,
  TEMPLATE_ALIASES,
  resolveTemplateId,
} from "./pages/registry";
export type { TemplateMeta, TemplateKind } from "./pages/registry";
export {
  PAGE_TYPE_TEMPLATE_SUITES,
  STICKY_TEMPLATE_DEFAULTS,
  PREMIUM_SIGNATURES,
  BREATHING_TEMPLATE_IDS,
  defaultTemplateForPageType,
  resolveTemplateForPage,
  formatTemplateCatalogForPrompt,
  diversifyTemplateIds,
  isBreathingPage,
  hashPromptSeed,
  freshRunSeed,
  seededShuffle,
} from "./pageTypeMap";
export {
  materializeTemplatePage,
  materializeTemplatePages,
} from "./materialize";
export type {
  MaterializePageInput,
  MaterializedPage,
} from "./materialize";
export {
  applyLayoutKnobs,
  parseLayoutKnobs,
  splitSlotsAndKnobs,
  DEFAULT_LAYOUT_KNOBS,
} from "./layoutKnobs";
export type {
  LayoutKnobs,
  LayoutDensity,
  LayoutEmphasis,
  LayoutAlign,
} from "./layoutKnobs";
export type {
  HtmlTemplateId,
  HtmlTemplateSuiteId,
  TemplateThemeColors,
  HeroTemplateSlots,
  MetricsTemplateSlots,
  PillarsTemplateSlots,
  CloseTemplateSlots,
  AgendaTemplateSlots,
  DualTemplateSlots,
  BreathTemplateSlots,
  TeamTemplateSlots,
  TimelineTemplateSlots,
  NarrativeTemplateSlots,
  EvidenceTemplateSlots,
  ProblemTemplateSlots,
  SolutionTemplateSlots,
  MetricItem,
  PillarItem,
  ListItem,
  TeamMember,
  TimelineStep,
  AnyTemplateSlots,
  TemplateSlotsById,
} from "./types";
export {
  HTML_TEMPLATE_IDS,
  HTML_TEMPLATE_SUITE_IDS,
} from "./types";
export {
  renderHtmlTemplate,
  renderHeroTemplate,
  renderMetricsTemplate,
  renderPillarsTemplate,
  renderCloseTemplate,
  renderAgendaTemplate,
  renderProblemTemplate,
  renderSolutionTemplate,
  renderEvidenceTemplate,
  renderDualTemplate,
  renderBreathTemplate,
  renderTeamTemplate,
  renderTimelineTemplate,
  renderNarrativeTemplate,
  themeToTemplateColors,
  darkSurfaceColors,
  escapeAttr,
  escapeHtmlText,
} from "./fill";
