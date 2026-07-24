export {
  TEMPLATE_SUITE,
  TEMPLATE_ALIASES,
  resolveTemplateId,
} from "./pages/registry";
export type { TemplateMeta, TemplateKind } from "./pages/registry";
export {
  PAGE_TYPE_TEMPLATE_SUITES,
  defaultTemplateForPageType,
  resolveTemplateForPage,
  formatTemplateCatalogForPrompt,
} from "./pageTypeMap";
export {
  materializeTemplatePage,
  materializeTemplatePages,
} from "./materialize";
export type {
  MaterializePageInput,
  MaterializedPage,
} from "./materialize";
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
  templateIdForPageType,
  escapeAttr,
  escapeHtmlText,
} from "./fill";
export { HERO_TEMPLATE } from "./hero";
export { METRICS_TEMPLATE } from "./metrics";
export { PILLARS_TEMPLATE } from "./pillars";
export { CLOSE_TEMPLATE } from "./close";
