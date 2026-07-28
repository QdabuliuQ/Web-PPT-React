import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import { resolveFontStack } from "@/fonts/stacks";
import type { Elements } from "@/store/zustand/pptStore";
import {
  isSupportedPlacement,
  normalizeChartType,
  normalizeIconName,
  normalizeShapeType,
  PLATFORM_LIMITS,
  PLACEMENT_KEYS,
} from "../catalog";
import { buildThemedChartOption } from "../theme/chartStyle";
import { mapTableStyle } from "../theme/mapper";
import type { AssetMap, ThemeToken } from "../types";
import type { MeasuredChrome, MeasuredNode } from "./measure";
import { resolveDocumentSrc } from "./assets";

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

function hasFlag(ds: Record<string, string>, key: string): boolean {
  return key in ds || ds[key] === "" || ds[key] === "true" || ds[key] === "1";
}

/** rgb(a)/hex → #RRGGBB；透明色返回 null */
function toHexColor(input: string | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  if (!s || s === "transparent" || s === "rgba(0, 0, 0, 0)") return null;
  const hex = s.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3) {
      return (
        "#" +
        h
          .split("")
          .map((c) => c + c)
          .join("")
      ).toUpperCase();
    }
    return ("#" + h).toUpperCase();
  }
  const m = s.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (!m) return null;
  const a = m[4] != null ? Number(m[4]) : 1;
  if (!(a > 0.05)) return null;
  const r = Math.round(Number(m[1]));
  const g = Math.round(Number(m[2]));
  const b = Math.round(Number(m[3]));
  return (
    "#" +
    [r, g, b]
      .map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"))
      .join("")
  ).toUpperCase();
}

function mapBorderStyle(
  raw: string | undefined
): "solid" | "dashed" | "dotted" {
  if (raw === "dashed" || raw === "dotted") return raw;
  return "solid";
}

/**
 * 边框：优先 data-*；否则用测量到的 CSS computed border。
 * 忽略 transparent / none（避免把无意义边框写进 JSON）。
 */
export function resolveElementBorder(
  ds: Record<string, string>,
  chrome?: MeasuredChrome
): {
  border: boolean;
  borderWidth: number;
  borderColor: string;
  borderStyle: "solid" | "dashed" | "dotted";
} {
  const fromData =
    hasFlag(ds, "border") ||
    (Number(ds.borderWidth) > 0 && ds.borderWidth != null);

  if (fromData) {
    const w = Number(ds.borderWidth);
    return {
      border: true,
      borderWidth: Number.isFinite(w) && w > 0 ? w : 1,
      borderColor: toHexColor(ds.borderColor) || "#000000",
      borderStyle: mapBorderStyle(ds.borderStyle),
    };
  }

  if (
    chrome &&
    chrome.borderWidth > 0.5 &&
    chrome.borderStyle &&
    chrome.borderStyle !== "none" &&
    chrome.borderStyle !== "hidden"
  ) {
    const color = toHexColor(chrome.borderColor);
    if (color) {
      return {
        border: true,
        borderWidth: Math.max(1, Math.round(chrome.borderWidth)),
        borderColor: color,
        borderStyle: mapBorderStyle(chrome.borderStyle),
      };
    }
  }

  return {
    border: false,
    borderWidth: 0,
    borderColor: "#000000",
    borderStyle: "solid",
  };
}

/** 圆角：优先 data-border-radius；否则用测量 CSS border-radius（px） */
export function resolveBorderRadius(
  ds: Record<string, string>,
  chrome?: MeasuredChrome
): number {
  if (ds.borderRadius != null && ds.borderRadius !== "") {
    const n = Number(ds.borderRadius);
    if (Number.isFinite(n) && n >= 0) return Math.round(n);
  }
  if (chrome && chrome.borderRadius > 0.5) {
    return Math.round(chrome.borderRadius);
  }
  return 0;
}

function clampBox(n: MeasuredNode): MeasuredNode {
  // 仅钳制完全越界的坐标；宽高保持测量值不变（调用方要求 JSON 几何 = DOM）
  let { x, y, width, height } = n;
  width = Math.max(1, Math.round(width));
  height = Math.max(1, Math.round(height));
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x >= CANVAS_WIDTH) x = CANVAS_WIDTH - 1;
  if (y >= CANVAS_HEIGHT) y = CANVAS_HEIGHT - 1;
  return { ...n, x, y, width, height };
}

function parseSeries(raw?: string): Array<{ label: string; value: number }> {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const o = item as { label?: unknown; value?: unknown };
        return {
          label: String(o.label ?? ""),
          value: Number(o.value) || 0,
        };
      })
      .filter(Boolean) as Array<{ label: string; value: number }>;
  } catch {
    return [];
  }
}

function parseTable(raw?: string): {
  headers: string[];
  rows: Array<Array<string | number>>;
} {
  if (!raw) {
    return { headers: ["A", "B"], rows: [["1", "2"]] };
  }
  try {
    const v = JSON.parse(raw) as {
      headers?: string[];
      rows?: Array<Array<string | number>>;
    };
    return {
      headers: v.headers?.length ? v.headers : ["A", "B"],
      rows: v.rows?.length ? v.rows : [["1", "2"]],
    };
  } catch {
    return { headers: ["A", "B"], rows: [["1", "2"]] };
  }
}

function placementOf(raw?: string) {
  if (raw && isSupportedPlacement(raw)) return raw;
  return PLACEMENT_KEYS[0];
}

/**
 * @deprecated Text 无内边距；几何直接用测量值。保留导出以免外部引用断裂。
 */
export const TEXT_EDITOR_PADDING_PX = 0;
/** @deprecated 见 TEXT_EDITOR_PADDING_PX */
export const TEXT_EDITOR_SAFETY_PX = 0;

/** @deprecated 恒等：x/y/width/height 直接取测量值，不再做 padding 补偿 */
export function applyTextEditorChrome(geo: {
  x: number;
  y: number;
  width: number;
  height: number;
  placement?: string;
}): { x: number; y: number; width: number; height: number } {
  void geo.placement;
  let { x, y, width, height } = geo;
  width = Math.max(1, Math.round(width));
  height = Math.max(1, Math.round(height));
  x = Math.max(0, Math.round(x));
  y = Math.max(0, Math.round(y));
  if (x + width > CANVAS_WIDTH) width = Math.max(1, CANVAS_WIDTH - x);
  if (y + height > CANVAS_HEIGHT) height = Math.max(1, CANVAS_HEIGHT - y);
  return { x, y, width, height };
}

export function mapMeasuredNodeToElement(
  node: MeasuredNode,
  theme: ThemeToken,
  assetMap: AssetMap
): Elements | null {
  const n = clampBox(node);
  const ds = n.dataset;
  const type = (ds.type || n.type || "text").toLowerCase();
  const geo = {
    x: n.x,
    y: n.y,
    width: n.width,
    height: n.height,
    rotate: Number(ds.rotate) || 0,
    zIndex: n.zIndex || 0,
  };

  if (type === "text") {
    const fontSize = Math.min(
      PLATFORM_LIMITS.fontSize.max,
      Math.max(PLATFORM_LIMITS.fontSize.min, Number(ds.fontSize) || 16)
    );
    const lineHeight = Number(ds.lineHeight) || 1.4;
    const text = n.text || ds.content || "";
    const border = resolveElementBorder(ds, n.chrome);
    const placement = placementOf(ds.placement);
    // 几何 = DOM 测量值；Text 组件无 padding，不做 chrome 补偿
    return {
      type: "text",
      id: `text_${rid()}`,
      mode: "edit",
      text,
      fontSize,
      fontFamily: resolveFontStack(
        ds.fontFamily || theme.fontBody || "PingFang SC"
      ),
      color: ds.color || theme.textOnLight || "#111111",
      bold: hasFlag(ds, "bold"),
      italic: hasFlag(ds, "italic"),
      underline: hasFlag(ds, "underline"),
      strikethrough: hasFlag(ds, "strikethrough"),
      lineHeight,
      placement: placement as never,
      backgroundColor: ds.backgroundColor || "transparent",
      ...border,
      shadow: hasFlag(ds, "shadow"),
      shadowColor: ds.shadowColor || "#000000",
      shadowOffsetX: Number(ds.shadowOffsetX) || 0,
      shadowOffsetY: Number(ds.shadowOffsetY) || 0,
      shadowBlur: Number(ds.shadowBlur) || 4,
      ...geo,
    } as Elements;
  }

  if (type === "icon") {
    return {
      type: "icon",
      id: `icon_${rid()}`,
      mode: "edit",
      iconName: normalizeIconName(ds.iconName || "CheckOne"),
      theme: (ds.iconTheme as "outline") || "outline",
      fill: [ds.fill || theme.primary || "#111111"],
      strokeWidth: Number(ds.strokeWidth) || 3,
      ...geo,
    } as Elements;
  }

  if (type === "shape") {
    const border = resolveElementBorder(ds, n.chrome);
    const radius = resolveBorderRadius(ds, n.chrome);
    let shapeType = normalizeShapeType(ds.shapeType || "roundedRect");
    // CSS/data 有圆角时，强制为 roundedRect，保证 document 可调圆角
    if (radius > 0 && shapeType === "rect") {
      shapeType = "roundedRect";
    }
    return {
      type: "shape",
      id: `shape_${rid()}`,
      mode: "edit",
      shapeType,
      fill: ds.fill || theme.secondary || "#FFFFFF",
      opacity: ds.opacity != null ? Number(ds.opacity) : 1,
      borderRadius:
        shapeType === "roundedRect"
          ? radius > 0
            ? radius
            : 14
          : 0,
      ...border,
      ...geo,
    } as Elements;
  }

  if (type === "image") {
    const key = ds.assetKey || "";
    const src = key ? resolveDocumentSrc(key, assetMap) : ds.src || "";
    const border = resolveElementBorder(ds, n.chrome);
    return {
      type: "image",
      id: `image_${rid()}`,
      mode: "edit",
      src: src || "",
      opacity: ds.opacity != null ? Number(ds.opacity) : 1,
      borderRadius: resolveBorderRadius(ds, n.chrome),
      ...border,
      keepRatio: true,
      shadow: hasFlag(ds, "shadow"),
      shadowOffsetX: Number(ds.shadowOffsetX) || 0,
      shadowOffsetY: Number(ds.shadowOffsetY) || 0,
      shadowBlur: Number(ds.shadowBlur) || 0,
      shadowColor: ds.shadowColor || "#000000",
      shadowSpread: 0,
      brightness: 1,
      contrast: 1,
      saturate: 1,
      grayscale: 0,
      hueRotate: 0,
      invert: 0,
      sepia: 0,
      ...geo,
    } as Elements;
  }

  if (type === "chart") {
    const series = parseSeries(ds.series);
    const chartType = normalizeChartType(ds.chartType || "bar1");
    const option = buildThemedChartOption(
      series.length
        ? series
        : [
            { label: "A", value: 30 },
            { label: "B", value: 50 },
            { label: "C", value: 40 },
          ],
      chartType,
      theme
    );
    return {
      type: "chart",
      id: `chart_${rid()}`,
      mode: "edit",
      chartType,
      option,
      ...geo,
    } as Elements;
  }

  if (type === "table") {
    const tableData = parseTable(ds.table);
    const style = mapTableStyle(theme);
    const cols = tableData.headers.length;
    const columnWidths = Array.from({ length: cols }, () =>
      Math.round((100 / cols) * 100) / 100
    );
    const makeCell = (
      value: string | number,
      opts: { header?: boolean; alt?: boolean }
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
        placement: (opts.header ? "center-center" : base.placement) as
          | "left-center"
          | "center-center",
      };
    };
    const headerRow = tableData.headers.map((h) =>
      makeCell(h, { header: true })
    );
    const bodyRows = tableData.rows.map((row, ri) =>
      row.map((cell) => makeCell(cell, { alt: ri % 2 === 1 }))
    );
    return {
      type: "table",
      id: `table_${rid()}`,
      mode: "edit",
      dataSource: [headerRow, ...bodyRows],
      columnWidths,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      borderColor: style.borderColor,
      borderWidth: style.borderWidth,
      borderStyle: style.borderStyle,
      borderRadius: style.borderRadius,
      ...geo,
    } as Elements;
  }

  return null;
}
