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

export type AssetMapEntry = {
  /** 文档内使用的地址：优先本地 /agent-assets/xxx.png */
  url: string;
  localPath?: string;
  /** 生图服务原始 CDN，仅调试用 */
  remoteUrl?: string;
  width?: number;
  height?: number;
};

export type AssetMap = Record<string, AssetMapEntry>;

export type DefectKind =
  | "out-of-bounds"
  | "text-overflow"
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

export type PipelineResult = {
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
};
