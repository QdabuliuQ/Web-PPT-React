/**
 * WebPPT 平台能力目录（Agent 唯一真源）
 * 与 src/element/*、src/store/zustand/pptStore、src/constants/* 对齐
 * LLM / Compile 只能使用此处声明的类型与枚举，禁止自创字段
 */

import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import { MAX_ELEMENTS_PER_PAGE, MAX_PAGES } from "@/constants/limits";

export const PLATFORM_CANVAS = {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  aspect: "16:9",
  unit: "px",
} as const;

export const PLATFORM_LIMITS = {
  maxPages: MAX_PAGES,
  maxElementsPerPage: MAX_ELEMENTS_PER_PAGE,
  recommendedPages: { min: 6, max: 10 },
  /** Agent 生成页数硬限制（与 recommended 一致） */
  agentPages: { min: 6, max: 10 },
  tableMaxGrid: { cols: 10, rows: 10 },
  fontSize: { min: 12, max: 50, step: 2 },
} as const;

/** 公共几何 / 动画（持久化字段；mode/onSelect 运行时勿写入 JSON） */
export const COMMON_ELEMENT_FIELDS = {
  required: ["id", "type", "x", "y", "width", "height", "rotate", "zIndex"] as const,
  optionalPersist: [
    "animationName",
    "animationDuration",
    "animationDelay",
    "animationTrigger",
    "animationIndex",
  ] as const,
  runtimeOnly: ["mode", "onSelect", "onUnSelect"] as const,
  notes: [
    "id 格式：{type}_{random}，如 text_xxx",
    "坐标单位 px，须落在画布 [0,1000]×[0,562.5] 内",
    "禁止 video/group/SmartArt 等未列出类型",
    "animation* 由 Compile/ThemeMapper 按槽位角色注入，LLM 禁止自选动画名",
  ],
} as const;

export const PLACEMENT_KEYS = [
  "left-top",
  "left-center",
  "left-bottom",
  "center-top",
  "center-center",
  "center-bottom",
  "right-top",
  "right-center",
  "right-bottom",
] as const;

export const BORDER_STYLES = ["solid", "dashed", "dotted"] as const;
export const TABLE_BORDER_STYLES = [
  "solid",
  "dashed",
  "dotted",
  "double",
  "none",
] as const;

/** 元素进场动画名（与 Animation 面板 / animate.css 对齐，不含空字符串） */
export const ELEMENT_ANIMATION_NAMES = [
  "backInDown",
  "backInLeft",
  "backInRight",
  "backInUp",
  "bounceInDown",
  "bounceInLeft",
  "bounceInRight",
  "bounceInUp",
  "fadeIn",
  "fadeInDown",
  "fadeInDownBig",
  "fadeInLeft",
  "fadeInLeftBig",
  "fadeInRight",
  "fadeInRightBig",
  "fadeInUp",
  "fadeInUpBig",
  "fadeInTopLeft",
  "fadeInTopRight",
  "fadeInBottomLeft",
  "fadeInBottomRight",
  "flipInX",
  "flipInY",
  "lightSpeedInRight",
  "lightSpeedInLeft",
  "rotateInDownLeft",
  "rotateInDownRight",
  "zoomIn",
  "zoomInDown",
  "zoomInLeft",
  "zoomInRight",
  "zoomInUp",
  "slideInDown",
  "slideInLeft",
  "slideInRight",
  "slideInUp",
] as const;

/** 页面切换进场动画（与 Toggle 面板对齐） */
export const PAGE_TOGGLE_ANIMATION_NAMES = [
  "backInDown",
  "backInLeft",
  "backInRight",
  "backInUp",
  "bounceIn",
  "bounceInDown",
  "bounceInLeft",
  "bounceInRight",
  "bounceInUp",
  "fadeIn",
  "fadeInDown",
  "fadeInDownBig",
  "fadeInLeft",
  "fadeInLeftBig",
  "fadeInRight",
  "fadeInRightBig",
  "fadeInUp",
  "fadeInUpBig",
  "fadeInTopLeft",
  "fadeInTopRight",
  "fadeInBottomLeft",
  "fadeInBottomRight",
  "flipInX",
  "flipInY",
  "lightSpeedInRight",
  "lightSpeedInLeft",
  "rotateInDownLeft",
  "rotateInDownRight",
  "zoomIn",
  "zoomInDown",
  "zoomInLeft",
  "zoomInRight",
  "zoomInUp",
  "slideInDown",
  "slideInLeft",
  "slideInRight",
  "slideInUp",
] as const;

export const ANIMATION_DURATIONS = [
  "faster",
  "fast",
  "default",
  "slow",
  "slower",
] as const;

export const ANIMATION_DELAYS = ["0s", "2s", "3s", "4s", "5s"] as const;

export const ANIMATION_TRIGGERS = ["default", "click"] as const;

export const ICON_THEMES = [
  "outline",
  "filled",
  "two-tone",
  "multi-color",
] as const;

/** Agent 推荐 IconPark PascalCase 名（完整库很大，生成侧限白名单） */
export const ICON_NAME_WHITELIST = [
  "Home",
  "User",
  "Setting",
  "CheckOne",
  "Star",
  "Like",
  "Lightning",
  "Aiming",
  "ChartHistogram",
  "Peoples",
  "Success",
  "FilePdf",
  "Pic",
  "Text",
  "TableFile",
  "DiamondThree",
] as const;

export const CHART_TYPES = [
  "bar1",
  "bar2",
  "bar3",
  "bar4",
  "line1",
  "line2",
  "line3",
  "line4",
  "pie1",
  "pie2",
  "scatter1",
  "radar1",
  "funnel1",
] as const;

/** 与 src/element/Shape/shapes.tsx SHAPE_TYPES 对齐 */
export const SHAPE_TYPES = [
  "rect",
  "roundedRect",
  "oval",
  "triangle",
  "rightTriangle",
  "diamond",
  "pentagon",
  "hexagon",
  "star5",
  "arrowRight",
  "heart",
] as const;

export const ELEMENT_TYPES = [
  "text",
  "table",
  "image",
  "icon",
  "chart",
  "mindmap",
  "shape",
] as const;

export const PAGE_FIELDS = {
  required: [
    "id",
    "elements",
    "visible",
    "toggleInAnimation",
    "toggleInDuration",
    "toggleInDelay",
    "autoToggle",
    "autoToggleTime",
    "backgroundType",
    "background",
    "bgColor",
    "fgColor",
    "bgOpacity",
    "remark",
  ] as const,
  optional: ["selectedTexture", "backgroundImage"] as const,
  backgroundType: ["solidColor", "texture", "image"] as const,
  notes: [
    "backgroundType=solidColor 时 background 为色值",
    "backgroundType=texture 时配合 selectedTexture + bgColor/fgColor/bgOpacity",
    "backgroundType=image 时配合 backgroundImage（data URL / 本地 /agent-assets/…）",
    "Agent：封面/封底全幅图写入 backgroundImage；内页可用 bg_global 氛围底图",
  ],
} as const;

export const DOCUMENT_FIELDS = {
  required: ["name", "pages"] as const,
  optional: [
    "gridSize",
    "gridType",
    "verticalLine",
    "horizontalLine",
    "rule",
    "guideLineShow",
    "keyboardToggle",
  ] as const,
  gridType: ["grid", "line", "none"] as const,
} as const;

/** 各元素专有属性（Compile/LLM 约束） */
export const ELEMENT_SCHEMAS = {
  text: {
    type: "text",
    fields: {
      text: "string",
      fontSize: "number 12~50 建议偶数",
      fontFamily: "string",
      color: "hex string",
      bold: "boolean",
      italic: "boolean",
      underline: "boolean",
      strikethrough: "boolean",
      lineHeight: "number 倍数",
      shadow: "boolean",
      shadowOffsetX: "number",
      shadowOffsetY: "number",
      shadowBlur: "number",
      shadowColor: "hex string",
      border: "boolean",
      borderStyle: BORDER_STYLES.join("|"),
      borderWidth: "number",
      borderColor: "hex string",
      backgroundColor: "hex|transparent",
      placement: PLACEMENT_KEYS.join("|"),
    },
    agentFill: ["text"],
    agentForbidden: ["x", "y", "width", "height", "type", "自定义字号以外样式"],
  },
  image: {
    type: "image",
    fields: {
      src: "url|dataURL",
      opacity: "0~1",
      border: "boolean",
      borderRadius: "number",
      borderWidth: "number",
      borderColor: "hex",
      borderStyle: BORDER_STYLES.join("|"),
      keepRatio: "boolean",
      brightness: "number",
      contrast: "number",
      saturate: "number",
      grayscale: "number",
      hueRotate: "number",
      invert: "number",
      sepia: "number",
      shadow: "boolean",
      shadowOffsetX: "number",
      shadowOffsetY: "number",
      shadowColor: "hex",
      shadowBlur: "number",
      shadowSpread: "number",
    },
    agentFill: ["imagePrompt→assetKey→src"],
    agentForbidden: ["随意改滤镜", "自创字段如 objectFit/crop"],
  },
  table: {
    type: "table",
    fields: {
      dataSource:
        "Cell[][] { value, fontSize, color, backgroundColor, bold, italic, underline, strikethrough, placement }",
      columnWidths: "number[] 百分比和≈100",
      rowHeights: "number[]? 百分比",
      fontSize: "number",
      fontFamily: "string?",
      borderColor: "hex?",
      borderWidth: "number?",
      borderStyle: TABLE_BORDER_STYLES.join("|") + "?",
      borderRadius: "number?",
    },
    agentFill: [
      "tableData:{headers:string[],rows:(string|number)[][]}（样式由 ThemeMapper 注入）",
    ],
    agentForbidden: ["合并单元格", "超过 10×10", "直接输出完整 dataSource 单元格样式"],
  },
  icon: {
    type: "icon",
    fields: {
      iconName: "IconPark PascalCase，优先白名单",
      fill: "string[]",
      theme: ICON_THEMES.join("|"),
      strokeWidth: "number",
    },
    agentFill: ["iconName"],
    agentForbidden: ["非 IconPark 名", "svg path 自创"],
  },
  chart: {
    type: "chart",
    fields: {
      chartType: CHART_TYPES.join("|"),
      option: "EChartsOption（由模板填充，禁止 LLM 自由编写）",
    },
    agentFill: ["chartSeries:[{label,value}]", "可选 chartType 仅限枚举"],
    agentForbidden: ["自创 chartType", "直接输出完整 option"],
  },
  mindmap: {
    type: "mindmap",
    fields: {
      data: "X6 { nodes, edges }",
      readonly: "boolean?",
    },
    agentFill: ["本期模板默认不生成 mindmap"],
    agentForbidden: ["非 X6 结构"],
  },
  shape: {
    type: "shape",
    fields: {
      shapeType: SHAPE_TYPES.join("|"),
      fill: "hex（由 ThemeMapper 注入主题色，LLM 可不填）",
      border: "boolean",
      borderWidth: "number",
      borderColor: "hex",
      borderStyle: BORDER_STYLES.join("|") + "|double",
      opacity: "0~1",
    },
    agentFill: ["shapeType（强调条 decor 优先 rect/roundedRect）"],
    agentForbidden: ["自创 shapeType", "随意改 fill（颜色由主题注入）"],
  },
} as const;

export const UNSUPPORTED = [
  "video",
  "audio",
  "group",
  "SmartArt",
  "richHtml",
  "assetKey(运行时字段，仅中间态 meta 使用)",
  "maxTextLength(运行时无此字段)",
  "画布 1920×1080",
] as const;

/** 生成注入 LLM 的平台约束全文 */
export function buildPlatformConstraintPrompt(): string {
  const elementBlock = ELEMENT_TYPES.map((t) => {
    const s = ELEMENT_SCHEMAS[t];
    const fields = Object.entries(s.fields)
      .map(([k, v]) => `    - ${k}: ${v}`)
      .join("\n");
    return `### ${t}
  字段：
${fields}
  Agent 可填：${s.agentFill.join("；")}
  禁止：${s.agentForbidden.join("；")}`;
  }).join("\n\n");

  return `## WebPPT 平台硬约束（必须遵守）
画布：${PLATFORM_CANVAS.width}×${PLATFORM_CANVAS.height} ${PLATFORM_CANVAS.unit}（${PLATFORM_CANVAS.aspect}）
页数必须 ${PLATFORM_LIMITS.agentPages.min}~${PLATFORM_LIMITS.agentPages.max} 页（硬限制，不可更少或更多）
单页元素 ≤ ${PLATFORM_LIMITS.maxElementsPerPage}
支持元素类型仅：${ELEMENT_TYPES.join(", ")}
placement 仅：${PLACEMENT_KEYS.join(", ")}
chartType 仅：${CHART_TYPES.join(", ")}
shapeType 仅：${SHAPE_TYPES.join(", ")}
icon theme 仅：${ICON_THEMES.join(", ")}
iconName 优先：${ICON_NAME_WHITELIST.join(", ")}
元素动画名仅：${ELEMENT_ANIMATION_NAMES.join(", ")}（或空=无）
页面 toggleInAnimation 仅：${PAGE_TOGGLE_ANIMATION_NAMES.join(", ")}（或空=无）
animationDuration 仅：${ANIMATION_DURATIONS.join(", ")}
animationDelay 仅：${ANIMATION_DELAYS.join(", ")}
animationTrigger 仅：${ANIMATION_TRIGGERS.join(", ")}
字号建议 ${PLATFORM_LIMITS.fontSize.min}~${PLATFORM_LIMITS.fontSize.max} 步长 ${PLATFORM_LIMITS.fontSize.step}
页 backgroundType 仅：${PAGE_FIELDS.backgroundType.join("|")}

公共元素字段：${COMMON_ELEMENT_FIELDS.required.join(", ")}
可选动画：${COMMON_ELEMENT_FIELDS.optionalPersist.join(", ")}
勿持久化：${COMMON_ELEMENT_FIELDS.runtimeOnly.join(", ")}

不支持：${UNSUPPORTED.join(", ")}

你只输出槽位内容（文案/imagePrompt/chartSeries/tableData/iconName/shapeType），禁止输出最终 Document 几何、样式与动画字段（样式与动画由 ThemeMapper/Compile 注入）。

## 元素属性字典
${elementBlock}
`;
}

export function isSupportedElementType(type: string): boolean {
  return (ELEMENT_TYPES as readonly string[]).includes(type);
}

export function isSupportedChartType(type: string): boolean {
  return (CHART_TYPES as readonly string[]).includes(type);
}

export function isSupportedPlacement(p: string): boolean {
  return (PLACEMENT_KEYS as readonly string[]).includes(p);
}

export function isSupportedElementAnimation(name: string): boolean {
  return (
    name === "" ||
    (ELEMENT_ANIMATION_NAMES as readonly string[]).includes(name)
  );
}

export function isSupportedPageToggleAnimation(name: string): boolean {
  return (
    name === "" ||
    (PAGE_TOGGLE_ANIMATION_NAMES as readonly string[]).includes(name)
  );
}

export function normalizeIconName(name: string): string {
  if ((ICON_NAME_WHITELIST as readonly string[]).includes(name)) return name;
  return "CheckOne";
}

export function normalizeChartType(type: string): (typeof CHART_TYPES)[number] {
  if (isSupportedChartType(type)) return type as (typeof CHART_TYPES)[number];
  return "bar1";
}

export function isSupportedShapeType(type: string): boolean {
  return (SHAPE_TYPES as readonly string[]).includes(type);
}

export function normalizeShapeType(
  type: string | undefined,
  fallback: (typeof SHAPE_TYPES)[number] = "rect"
): (typeof SHAPE_TYPES)[number] {
  if (type && isSupportedShapeType(type)) {
    return type as (typeof SHAPE_TYPES)[number];
  }
  return fallback;
}

export function normalizeElementAnimation(
  name: string
): (typeof ELEMENT_ANIMATION_NAMES)[number] | "" {
  if (!name) return "";
  if (isSupportedElementAnimation(name) && name !== "") {
    return name as (typeof ELEMENT_ANIMATION_NAMES)[number];
  }
  return "fadeIn";
}

export function normalizePageToggleAnimation(
  name: string
): (typeof PAGE_TOGGLE_ANIMATION_NAMES)[number] | "" {
  if (!name) return "";
  if (isSupportedPageToggleAnimation(name) && name !== "") {
    return name as (typeof PAGE_TOGGLE_ANIMATION_NAMES)[number];
  }
  return "fadeIn";
}
