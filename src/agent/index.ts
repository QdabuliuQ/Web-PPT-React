export { loadAgentConfig } from "./config";
export type { AgentRuntimeConfig } from "./config";
export { compileDocument } from "./compile/engine";
export type { CompiledDocument } from "./compile/engine";
export { runThemeAgent, finalizeTheme, resolveProvidedTheme } from "./agents/themeAgent";
export { runContentAgent, repairPageContent } from "./agents/contentAgent";
export { runImageAgent } from "./agents/imageAgent";
export {
  runPageScoreAgent,
  scoreToRepairInstruction,
} from "./agents/scoreAgent";
export { runVisualGate, inspectPage } from "./gate/visualGate";
export { screenshotPagesWithPuppeteer } from "./gate/screenshotPages";
export {
  runPipeline,
  runTemplatePipeline,
} from "./pipeline/run";
export { runHtmlPipeline } from "./pipeline/runHtml";
export type { RunPipelineOptions } from "./pipeline/run";
export {
  runLayoutHtmlAgent,
  repairHtmlPage,
  htmlDeckToCompatMeta,
  extractDrawTasksFromDeck,
  renderPageFromSlots,
} from "./agents/layoutHtmlAgent";
export { compileHtmlDocument } from "./htmlCompile";
export {
  renderHtmlTemplate,
  renderHeroTemplate,
  renderMetricsTemplate,
  renderPillarsTemplate,
  renderCloseTemplate,
  templateIdForPageType,
  TEMPLATE_SUITE,
  HTML_TEMPLATE_SUITE_IDS,
} from "./htmlTemplates";
export type {
  HtmlTemplateId,
  HtmlTemplateSuiteId,
  HeroTemplateSlots,
  MetricsTemplateSlots,
  PillarsTemplateSlots,
  CloseTemplateSlots,
} from "./htmlTemplates";
export type { HtmlCompiledDocument } from "./htmlCompile";
export { SCORE_PASS_THRESHOLD, PAGE_SCORE_SYSTEM_PROMPT } from "./prompts/score";
export {
  listLayouts,
  getLayout,
  DEFAULT_LAYOUT_SEQUENCE,
  DEFAULT_PAGE_TYPE_SEQUENCE,
  ALT_LAYOUT_SEQUENCE,
  ALT_PAGE_TYPE_SEQUENCE,
  LAYOUT_INTENT,
  PAGE_TYPES,
  PAGE_TYPE_META,
  PAGE_TYPE_LAYOUTS,
  pickLayoutSequence,
  pickPagePlan,
  resolvePageTypeAndLayout,
  buildPageTypeConstraintPrompt,
} from "./layout";
export type { PagePlanItem } from "./layout/sequence";
export {
  MetaJsonSchema,
  HtmlDeckSchema,
  HtmlDeckLlmSchema,
  HtmlTemplateDeckLlmSchema,
  HtmlTemplateRepairLlmSchema,
  ThemeTokenSchema,
  AssetMapSchema,
  PageTypeSchema,
  LayoutKeySchema,
} from "./schema";
export {
  buildPlatformConstraintPrompt,
  ELEMENT_TYPES,
  CHART_TYPES,
  SHAPE_TYPES,
  ELEMENT_ANIMATION_NAMES,
  PAGE_TOGGLE_ANIMATION_NAMES,
  ANIMATION_DURATIONS,
  ANIMATION_DELAYS,
  ANIMATION_TRIGGERS,
  PLACEMENT_KEYS,
  ELEMENT_SCHEMAS,
  ICON_NAME_WHITELIST,
} from "./catalog";
export {
  getPlatformCatalogJson,
  writePlatformCatalog,
} from "./catalog/exportCatalog";
export type {
  MetaJson,
  HtmlDeck,
  HtmlSlidePage,
  ThemeToken,
  AssetMap,
  LayoutKey,
  PageType,
  PipelineResult,
  GateReport,
  PageScore,
  ScoreReport,
} from "./types";
export type { AgentPipelineMode } from "./config";
