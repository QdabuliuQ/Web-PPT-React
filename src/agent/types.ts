import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";

export { CANVAS_WIDTH, CANVAS_HEIGHT };

export type SlotRole =
  | "title"
  | "subtitle"
  | "body"
  | "bullet"
  | "metric"
  | "image"
  | "chart"
  | "table"
  | "icon"
  | "decor";

export type LayoutKey =
  | "cover"
  | "cover-center"
  | "cover-left"
  | "cover-right"
  | "toc"
  | "toc-cards"
  | "two-column"
  | "image-text"
  | "three-points"
  | "pillars-icons"
  | "kpi"
  | "kpi-row"
  | "quote"
  | "quote-center"
  | "chart"
  | "chart-wide"
  | "table"
  | "compare-split"
  | "team-cards"
  | "team-list"
  | "timeline"
  | "ending"
  | "ending-center";

/** 页面叙事类型（与 layoutKey 骨架分离） */
export type PageType =
  | "hero"
  | "agenda"
  | "problem"
  | "solution"
  | "pillars"
  | "metrics"
  | "evidence"
  | "compare"
  | "breath"
  | "team"
  | "timeline"
  | "close";

/** LLM 填充的表格中间态（样式由 ThemeMapper / Compile 注入） */
export type TableDataFill = {
  headers: string[];
  rows: Array<Array<string | number>>;
};

export type ElementType =
  | "text"
  | "table"
  | "image"
  | "icon"
  | "chart"
  | "mindmap"
  | "shape";

export type LayoutSlot = {
  role: SlotRole;
  elementId: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  maxChars?: number;
  hint?: string;
};

export type LayoutSkeleton = {
  layoutKey: LayoutKey;
  name: string;
  /** 该骨架所属的主页面类型（共享骨架可被多种 pageType 选用） */
  pageTypes?: PageType[];
  slots: LayoutSlot[];
};

export type ThemeToken = {
  templateName: string;
  category: string;
  tags: string[];
  primary: string;
  secondary: string;
  background: string;
  textOnLight: string;
  textOnDark: string;
  fontTitle: string;
  fontBody: string;
  globalBgPrompt?: string;
  globalDecorPrompt?: string;
};

export type MetaSlotFill = {
  role: string;
  elementId: string;
  content?: string;
  tableData?: TableDataFill;
  chartSeries?: Array<{ label: string; value: number }>;
  chartType?: string;
  assetKey?: string;
  imagePrompt?: string;
  iconName?: string;
  /** shape 槽：形状类型，见 SHAPE_TYPES */
  shapeType?: string;
};

export type MetaPage = {
  pageId: string;
  /** 叙事页面类型 */
  pageType: PageType;
  /** 几何骨架 */
  layoutKey: LayoutKey;
  slots: MetaSlotFill[];
};

export type DrawTask = {
  assetKey: string;
  prompt: string;
  scope: "global" | "page";
  pageId?: string;
  /** 槽位尺寸（画布 px） */
  width?: number;
  height?: number;
  /** 传给生图 API 的 aspectRatio */
  aspectRatio?: string;
  /** 图片类型：photo/illustration/decoration/texture/hero */
  imageKind?: string;
  elementId?: string;
};

export type MetaJson = {
  version: "1.0";
  theme: ThemeToken;
  pages: MetaPage[];
  drawTasks: DrawTask[];
};

/** HTML 流水线：一页幻灯片（模板填槽 → html） */
export type HtmlSlidePage = {
  pageId: string;
  pageType: PageType;
  /** 含 #slide 的 HTML 片段（由模板渲染） */
  html: string;
  /** 使用的模板套 id */
  templateId?: string;
  /** 槽位内容（回炉/调试保留） */
  slots?: Record<string, unknown>;
};

/** HTML 流水线中间态 */
export type HtmlDeck = {
  version: "html-1.0";
  name: string;
  theme: ThemeToken;
  pages: HtmlSlidePage[];
  drawTasks: DrawTask[];
};

export type AssetMapEntry = {
  /** 文档内优先使用的本地同源地址：/agent-assets/xxx.png */
  url: string;
  localPath?: string;
  /** 生图 CDN，仅作下载/调试回退 */
  remoteUrl?: string;
  width?: number;
  height?: number;
};

export type AssetMap = Record<string, AssetMapEntry>;

export type DefectKind =
  | "out-of-bounds"
  | "contrast"
  | "empty-image"
  | "too-many-elements"
  | "vague-title"
  | "sparse-content"
  | "dense-content";

export type PageDefect = {
  pageId: string;
  elementId?: string;
  kind: DefectKind;
  message: string;
};

export type GateReport = {
  ok: boolean;
  defects: PageDefect[];
  iterations: number;
};

export type PageScore = {
  pageId: string;
  score: number;
  dimensions?: Partial<{
    layout: number;
    typography: number;
    contrast: number;
    hierarchy: number;
    content: number;
    polish: number;
  }>;
  summary: string;
  issues: string[];
  suggestions: string[];
  needOptimize: boolean;
};

export type ScoreReport = {
  ok: boolean;
  passThreshold: number;
  iterations: number;
  pages: PageScore[];
  error?: string;
};

export type PipelineResult = {
  /** skeleton 路径为真实 meta；html 路径为兼容桩（供 Gate/Score） */
  meta: MetaJson;
  assetMap: AssetMap;
  document: {
    name: string;
    pages: unknown[];
    gridSize: number;
    gridType: "grid" | "line" | "none";
    verticalLine: number[];
    horizontalLine: number[];
    rule: boolean;
    guideLineShow: boolean;
    keyboardToggle: boolean;
  };
  report: GateReport;
  scoreReport?: ScoreReport;
  /** 仅 html 流水线 */
  htmlDeck?: HtmlDeck;
  pipelineMode?: "skeleton" | "html";
};
