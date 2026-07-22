import type { Elements, Page } from "@/store/zustand/pptStore";
import { CANVAS_HEIGHT } from "@/constants/canvas";
import path from "path";
import {
  normalizeChartType,
  normalizeIconName,
  normalizeShapeType,
  isSupportedPlacement,
  PLACEMENT_KEYS,
  PLATFORM_LIMITS,
} from "../catalog";
import { getLayout } from "../layout";
import { resolvePageTypeAndLayout } from "../layout/pageTypes";
import {
  GLOBAL_BG_ASSET_KEY,
  isFullBleedBgSlot,
} from "../image/promptSpec";
import { MetaJsonSchema } from "../schema";
import {
  mapElementAnimation,
  mapPageToggleAnimation,
  type ElementAnimationTokens,
} from "../theme/animation";
import {
  isHeroOverlayLayout,
  isCardShapeSlot,
  mapIconFill,
  mapPageBackground,
  mapShapeStyle,
  mapTableStyle,
  mapTextStyle,
  fitTextBox,
  DESIGN_RADIUS,
  DESIGN_SHADOW,
} from "../theme/mapper";
import { buildThemedChartOption } from "../theme/chartStyle";
import type {
  AssetMap,
  LayoutKey,
  LayoutSlot,
  MetaSlotFill,
  SlotRole,
  TableDataFill,
  ThemeToken,
} from "../types";

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

function truncate(text: string, maxChars?: number): string {
  if (!maxChars || text.length <= maxChars) return text;
  return text.slice(0, Math.max(0, maxChars - 1)) + "…";
}

function findFill(
  fills: MetaSlotFill[],
  slot: LayoutSlot
): MetaSlotFill | undefined {
  return (
    fills.find((f) => f.elementId === slot.elementId) ||
    fills.find((f) => f.role === slot.role)
  );
}

/** 无动画名时不写入字段，保持与 Create* 工厂一致 */
function spreadAnim(
  anim: ElementAnimationTokens
): Partial<ElementAnimationTokens> {
  if (!anim.animationName) return {};
  return {
    animationName: anim.animationName,
    animationDuration: anim.animationDuration,
    animationDelay: anim.animationDelay,
    animationTrigger: anim.animationTrigger,
    animationIndex: anim.animationIndex,
  };
}

function buildTextElement(
  slot: LayoutSlot,
  fill: MetaSlotFill | undefined,
  theme: ThemeToken,
  layoutKey: LayoutKey,
  anim: ElementAnimationTokens
): Elements {
  const role = slot.role as SlotRole;
  const overImage = isHeroOverlayLayout(layoutKey);
  const accentBar = role === "decor";
  const style = mapTextStyle(theme, accentBar ? "title" : role, theme.background, {
    overImage: overImage && !accentBar,
    darkSurface: overImage && !accentBar,
    layoutKey,
    accentBar,
  });
  const text = accentBar
    ? " "
    : truncate(fill?.content?.trim() || slot.hint || role, slot.maxChars);
  const placement = isSupportedPlacement(style.placement)
    ? style.placement
    : PLACEMENT_KEYS[0];

  let fontSize = style.fontSize;
  let height = slot.height;
  let lineHeight = style.lineHeight;
  if (!accentBar) {
    const fitted = fitTextBox({
      text,
      width: slot.width,
      height: slot.height,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      // 封面/封底标题区最多吃到接近副标题上方
      maxHeight: overImage
        ? Math.min(200, CANVAS_HEIGHT - slot.y - 24)
        : Math.min(slot.height * 1.35, CANVAS_HEIGHT - slot.y - 8),
    });
    fontSize = fitted.fontSize;
    height = fitted.height;
    lineHeight = fitted.lineHeight;
  }

  return {
    type: "text",
    id: `text_${slot.elementId}_${rid()}`,
    mode: "edit",
    text,
    fontSize,
    fontFamily: style.fontFamily,
    color: style.color,
    bold: style.bold,
    italic: false,
    underline: false,
    strikethrough: false,
    lineHeight,
    shadow: style.shadow,
    shadowOffsetX: 0,
    shadowOffsetY: style.shadow ? 2 : 0,
    shadowBlur: style.shadowBlur,
    shadowColor: style.shadowColor,
    border: style.border,
    borderWidth: style.borderWidth,
    borderStyle: "solid",
    borderColor: style.borderColor,
    backgroundColor: style.backgroundColor,
    placement,
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height,
    rotate: 0,
    zIndex: slot.zIndex,
    ...spreadAnim(anim),
  };
}

function resolveAssetSrc(
  entry: AssetMap[string] | undefined
): string {
  // 优先本地同源 /agent-assets（需 public/agent-assets 有文件）
  if (entry?.url?.startsWith("/")) return entry.url;
  if (entry?.localPath) {
    return `/agent-assets/${path.basename(entry.localPath)}`;
  }
  if (entry?.url) return entry.url;
  if (entry?.remoteUrl?.startsWith("http")) return entry.remoteUrl;
  return "https://placehold.co/800x600/png?text=image";
}

function buildImageElement(
  slot: LayoutSlot,
  fill: MetaSlotFill | undefined,
  assetMap: AssetMap,
  layoutKey: LayoutKey,
  _theme: ThemeToken,
  anim: ElementAnimationTokens
): Elements {
  const key = fill?.assetKey;
  const entry = key ? assetMap[key] : undefined;
  const src = resolveAssetSrc(entry);
  const hero =
    isHeroOverlayLayout(layoutKey) &&
    slot.width >= 900 &&
    slot.height >= 500;
  const splitCover =
    (layoutKey === "cover-left" || layoutKey === "cover-right") &&
    slot.role === "image";
  const flush = hero || splitCover;
  const isDecorStrip = !flush && slot.height <= 140;
  const radius = flush ? 0 : DESIGN_RADIUS.image;
  return {
    type: "image",
    id: `image_${slot.elementId}_${rid()}`,
    mode: "edit",
    src,
    opacity: 1,
    borderRadius: radius,
    border: !flush,
    borderWidth: flush ? 0 : 1,
    borderColor: "rgba(0,0,0,0.06)",
    borderStyle: "solid",
    keepRatio: true,
    brightness: hero ? 0.68 : 1,
    contrast: hero ? 1.08 : 1,
    saturate: hero ? 1.05 : 1,
    grayscale: 0,
    hueRotate: 0,
    invert: 0,
    sepia: 0,
    shadow: !flush,
    shadowOffsetX: 0,
    shadowOffsetY: flush
      ? 0
      : isDecorStrip
        ? DESIGN_SHADOW.card.offsetY
        : DESIGN_SHADOW.image.offsetY,
    shadowColor: DESIGN_SHADOW.image.color,
    shadowBlur: flush
      ? 0
      : isDecorStrip
        ? DESIGN_SHADOW.card.blur
        : DESIGN_SHADOW.image.blur,
    shadowSpread: 0,
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height: slot.height,
    rotate: 0,
    zIndex: slot.zIndex,
    ...spreadAnim(anim),
  };
}

function buildChartElement(
  slot: LayoutSlot,
  fill: MetaSlotFill | undefined,
  theme: ThemeToken,
  anim: ElementAnimationTokens
): Elements {
  const series = fill?.chartSeries?.length
    ? fill.chartSeries
    : [
        { label: "Q1", value: 32 },
        { label: "Q2", value: 48 },
        { label: "Q3", value: 55 },
        { label: "Q4", value: 70 },
      ];
  const chartType = normalizeChartType(fill?.chartType || "bar1");
  const option = buildThemedChartOption(series, chartType, theme);
  return {
    type: "chart",
    id: `chart_${slot.elementId}_${rid()}`,
    mode: "edit",
    chartType,
    option,
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height: slot.height,
    rotate: 0,
    zIndex: slot.zIndex,
    ...spreadAnim(anim),
  };
}

function normalizeTableData(raw: TableDataFill | undefined): TableDataFill {
  const maxCols = PLATFORM_LIMITS.tableMaxGrid.cols;
  const maxRows = PLATFORM_LIMITS.tableMaxGrid.rows;
  const fallback: TableDataFill = {
    headers: ["指标", "数值", "备注"],
    rows: [
      ["项目 A", "42%", "核心"],
      ["项目 B", "31%", "增长"],
      ["项目 C", "27%", "稳健"],
    ],
  };
  if (!raw?.headers?.length || !raw?.rows?.length) return fallback;

  const headers = raw.headers
    .slice(0, maxCols)
    .map((h) => String(h ?? "").trim() || "—");
  const cols = headers.length;
  const rows = raw.rows.slice(0, maxRows - 1).map((row) => {
    const cells = row.slice(0, cols).map((c) =>
      typeof c === "number" ? c : String(c ?? "").trim() || "—"
    );
    while (cells.length < cols) cells.push("—");
    return cells;
  });
  if (!rows.length) return fallback;
  return { headers, rows };
}

function buildTableElement(
  slot: LayoutSlot,
  fill: MetaSlotFill | undefined,
  theme: ThemeToken,
  anim: ElementAnimationTokens
): Elements {
  const data = normalizeTableData(fill?.tableData);
  const style = mapTableStyle(theme);
  const cols = data.headers.length;
  const columnWidths = Array.from({ length: cols }, () =>
    Math.round((100 / cols) * 100) / 100
  );
  // 修正百分比总和为 100
  const widthSum = columnWidths.reduce((a, b) => a + b, 0);
  if (widthSum !== 100 && cols > 0) {
    columnWidths[cols - 1] = Math.round((columnWidths[cols - 1] + (100 - widthSum)) * 100) / 100;
  }

  const makeCell = (
    value: string | number,
    opts: {
      header?: boolean;
      alt?: boolean;
      numeric?: boolean;
    }
  ) => {
    const base = opts.header ? style.header : style.body;
    return {
      fontSize: base.fontSize,
      color: base.color,
      backgroundColor: opts.header
        ? base.backgroundColor
        : opts.alt
          ? style.bodyAltBackground
          : base.backgroundColor,
      bold: base.bold,
      italic: base.italic,
      underline: base.underline,
      strikethrough: base.strikethrough,
      value,
      placement: (opts.header || opts.numeric
        ? "center-center"
        : base.placement) as typeof base.placement,
    };
  };

  const isNumeric = (v: string | number) =>
    typeof v === "number" || /^-?\d+(\.\d+)?%?$/.test(String(v).trim());

  const headerRow = data.headers.map((h) => makeCell(h, { header: true }));
  const bodyRows = data.rows.map((row, ri) =>
    row.map((cell) =>
      makeCell(cell, {
        alt: ri % 2 === 1,
        numeric: isNumeric(cell),
      })
    )
  );

  return {
    type: "table",
    id: `table_${slot.elementId}_${rid()}`,
    mode: "edit",
    dataSource: [headerRow, ...bodyRows],
    columnWidths,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth,
    borderStyle: style.borderStyle,
    borderRadius: style.borderRadius,
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height: slot.height,
    rotate: 0,
    zIndex: slot.zIndex,
    ...spreadAnim(anim),
  };
}

function buildIconElement(
  slot: LayoutSlot,
  fill: MetaSlotFill | undefined,
  theme: ThemeToken,
  anim: ElementAnimationTokens
): Elements {
  const iconName = normalizeIconName(fill?.iconName || "CheckOne");
  return {
    type: "icon",
    id: `icon_${slot.elementId}_${rid()}`,
    mode: "edit",
    iconName,
    fill: mapIconFill(theme),
    theme: "filled",
    strokeWidth: 3,
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height: slot.height,
    rotate: 0,
    zIndex: slot.zIndex,
    ...spreadAnim(anim),
  };
}

function buildShapeElement(
  slot: LayoutSlot,
  fill: MetaSlotFill | undefined,
  theme: ThemeToken,
  anim: ElementAnimationTokens
): Elements {
  const isAccent = slot.role === "decor" || slot.height <= 12;
  const isCard = isCardShapeSlot({
    role: slot.role,
    width: slot.width,
    height: slot.height,
  });
  const shapeType = normalizeShapeType(
    fill?.shapeType,
    isAccent && !isCard ? "rect" : "roundedRect"
  );
  const style = mapShapeStyle(theme, { card: isCard });
  return {
    type: "shape",
    id: `shape_${slot.elementId}_${rid()}`,
    mode: "edit",
    shapeType,
    fill: style.fill,
    border: style.border,
    borderWidth: style.borderWidth,
    borderColor: style.borderColor,
    borderStyle: style.borderStyle,
    opacity: style.opacity,
    x: slot.x,
    y: slot.y,
    width: slot.width,
    height: slot.height,
    rotate: 0,
    zIndex: slot.zIndex,
    ...spreadAnim(anim),
  };
}

function resolveBackgroundImageUrl(
  layoutKey: LayoutKey,
  fills: MetaSlotFill[],
  skeleton: ReturnType<typeof getLayout>,
  assetMap: AssetMap
): string | undefined {
  // 封面/封底：全幅主图作背景
  if (isHeroOverlayLayout(layoutKey)) {
    const heroSlot = skeleton.slots.find((s) => isFullBleedBgSlot(s));
    if (heroSlot) {
      const fill = findFill(fills, heroSlot);
      const entry = fill?.assetKey ? assetMap[fill.assetKey] : undefined;
      if (entry) {
        const url = resolveAssetSrc(entry);
        if (url && !url.includes("placehold.co")) return url;
      }
    }
  }

  // 内容页（及封面缺图时）：用全局氛围底图
  const global = assetMap[GLOBAL_BG_ASSET_KEY];
  if (!global) return undefined;
  const url = resolveAssetSrc(global);
  return url.includes("placehold.co") ? undefined : url;
}

function compilePage(
  pageId: string,
  layoutKey: LayoutKey,
  fills: MetaSlotFill[],
  theme: ThemeToken,
  assetMap: AssetMap
): Page {
  const skeleton = getLayout(layoutKey);
  const backgroundImage = resolveBackgroundImageUrl(
    layoutKey,
    fills,
    skeleton,
    assetMap
  );
  const bg = mapPageBackground(theme, layoutKey, backgroundImage);
  const pageToggle = mapPageToggleAnimation(layoutKey);
  const elements: Elements[] = [];
  let animSeq = 0;

  for (const slot of skeleton.slots) {
    // 全幅主图写入 page.backgroundImage，不再叠一层 image 元素
    if (
      isHeroOverlayLayout(layoutKey) &&
      isFullBleedBgSlot(slot)
    ) {
      continue;
    }
    const fill = findFill(fills, slot);
    const anim = mapElementAnimation({
      role: slot.role as SlotRole,
      type: slot.type,
      layoutKey,
      index: animSeq,
    });
    if (anim.animationName) animSeq += 1;

    switch (slot.type) {
      case "text":
        elements.push(buildTextElement(slot, fill, theme, layoutKey, anim));
        break;
      case "image":
        elements.push(
          buildImageElement(slot, fill, assetMap, layoutKey, theme, anim)
        );
        break;
      case "chart":
        elements.push(buildChartElement(slot, fill, theme, anim));
        break;
      case "table":
        elements.push(buildTableElement(slot, fill, theme, anim));
        break;
      case "icon":
        elements.push(buildIconElement(slot, fill, theme, anim));
        break;
      case "shape":
        elements.push(buildShapeElement(slot, fill, theme, anim));
        break;
      default:
        break;
    }
  }

  return {
    id: pageId,
    elements,
    visible: true,
    toggleInAnimation: pageToggle.toggleInAnimation,
    toggleInDuration: pageToggle.toggleInDuration,
    toggleInDelay: pageToggle.toggleInDelay,
    autoToggle: false,
    autoToggleTime: 5,
    backgroundType: bg.backgroundType,
    background: bg.background,
    bgColor: bg.bgColor,
    fgColor: bg.fgColor,
    bgOpacity: bg.bgOpacity,
    remark: "",
    ...(bg.selectedTexture ? { selectedTexture: bg.selectedTexture } : {}),
    ...(bg.backgroundImage ? { backgroundImage: bg.backgroundImage } : {}),
  } as Page;
}

export type CompiledDocument = {
  name: string;
  gridSize: number;
  gridType: "grid" | "line" | "none";
  verticalLine: number[];
  horizontalLine: number[];
  rule: boolean;
  guideLineShow: boolean;
  keyboardToggle: boolean;
  pages: Page[];
};

export function compileDocument(
  metaInput: unknown,
  assetMap: AssetMap
): CompiledDocument {
  // 先宽松读入，再按骨架补齐 role，最后严格校验
  const loose = metaInput as {
    version?: string;
    theme?: unknown;
    pages?: Array<{
      pageId: string;
      pageType?: string;
      layoutKey?: string;
      slots?: unknown[];
    }>;
    drawTasks?: unknown;
  };

  if (loose?.pages && Array.isArray(loose.pages)) {
    for (const p of loose.pages) {
      if (!Array.isArray(p.slots)) continue;
      try {
        const resolved = resolvePageTypeAndLayout({
          pageType: p.pageType,
          layoutKey: p.layoutKey,
        });
        p.pageType = resolved.pageType;
        p.layoutKey = resolved.layoutKey;
        const skeleton = getLayout(resolved.layoutKey);
        const byId = new Map(
          p.slots
            .filter(
              (s): s is { elementId: string; role?: string } =>
                !!s &&
                typeof s === "object" &&
                typeof (s as { elementId?: unknown }).elementId === "string"
            )
            .map((s) => [s.elementId, s])
        );
        p.slots = skeleton.slots.map((sk) => {
          const prev = byId.get(sk.elementId) || {};
          const role =
            typeof (prev as { role?: unknown }).role === "string" &&
            (prev as { role: string }).role
              ? (prev as { role: string }).role.includes("/")
                ? (prev as { role: string }).role.split("/").pop() || sk.role
                : (prev as { role: string }).role
              : sk.role;
          return { ...(prev as object), role, elementId: sk.elementId };
        });
      } catch {
        // layoutKey 非法时交给 Zod 报错
      }
    }
  }

  const meta = MetaJsonSchema.parse(metaInput);
  const pages = meta.pages.map((p) =>
    compilePage(p.pageId, p.layoutKey, p.slots, meta.theme, assetMap)
  );

  return {
    name: meta.theme.templateName,
    gridSize: 20,
    gridType: "none",
    verticalLine: [],
    horizontalLine: [],
    rule: false,
    guideLineShow: true,
    keyboardToggle: true,
    pages,
  };
}
