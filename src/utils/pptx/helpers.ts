import { PX_PER_INCH } from "./constants";

/** 画布 px → PPT 英寸（位置/尺寸） */
export function pxToIn(px: number): number {
  return Number((px / PX_PER_INCH).toFixed(4));
}

/** 画布 px → PPT 磅（字号 / 阴影 blur·offset / 边框线宽） */
export function pxToPt(px: number): number {
  return Number(((px * 72) / PX_PER_INCH).toFixed(2));
}

export function positionFromElement(el: {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
}) {
  return {
    x: pxToIn(el.x),
    y: pxToIn(el.y),
    w: pxToIn(el.width),
    h: pxToIn(el.height),
    ...(el.rotate ? { rotate: el.rotate } : {}),
  };
}

/** 去掉 #，PptxGenJS 需要纯 hex；可选解析透明度 */
export function toHexColor(color?: string, fallback = "000000"): string {
  return parseColor(color, fallback).hex;
}

export function parseColor(
  color?: string,
  fallback = "000000"
): { hex: string; opacity: number } {
  if (!color) return { hex: fallback, opacity: 1 };
  const trimmed = color.trim();

  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return {
        hex: hex
          .split("")
          .map((c) => c + c)
          .join("")
          .toUpperCase(),
        opacity: 1,
      };
    }
    if (hex.length === 6) {
      return { hex: hex.toUpperCase(), opacity: 1 };
    }
    if (hex.length === 8) {
      return {
        hex: hex.slice(0, 6).toUpperCase(),
        opacity: Number((parseInt(hex.slice(6, 8), 16) / 255).toFixed(2)),
      };
    }
  }

  const rgba = trimmed.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (rgba) {
    return {
      hex: [rgba[1], rgba[2], rgba[3]]
        .map((n) => Number(n).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase(),
      opacity: rgba[4] !== undefined ? Number(rgba[4]) : 1,
    };
  }

  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return { hex: trimmed.toUpperCase(), opacity: 1 };
  }
  return { hex: fallback, opacity: 1 };
}

/**
 * 与 PlacementMapped / placementConvey 同源：
 * key 为 `水平-垂直`（如 left-center）
 */
export function parsePlacement(placement?: string): {
  align: "left" | "center" | "right";
  valign: "top" | "middle" | "bottom";
} {
  const key = placement || "left-top";
  const [h = "left", v = "top"] = key.split("-");
  const align =
    h === "center" ? "center" : h === "right" ? "right" : "left";
  const valign =
    v === "center" ? "middle" : v === "bottom" ? "bottom" : "top";
  return { align, valign };
}

export function mapBorderDash(
  style?: string
): "solid" | "dash" | "sysDash" | "lgDash" | undefined {
  switch (style) {
    case "dashed":
      return "dash";
    case "dotted":
      return "sysDash";
    case "double":
      return "lgDash";
    case "none":
      return undefined;
    default:
      return "solid";
  }
}

/**
 * CSS 阴影 → pptxgenjs ShadowProps
 * - blur/offset：画布 px → pt
 * - angle：CSS Y 向下 → OOXML（0=右，逆时针，270=下）
 * - opacity：取自颜色 alpha，默认 1（与 CSS 不透明色一致）
 */
export function shadowFromOffsets(opts: {
  enabled?: boolean;
  offsetX?: number;
  offsetY?: number;
  color?: string;
  blur?: number;
}) {
  if (!opts.enabled) return undefined;

  const ox = opts.offsetX ?? 0;
  const oy = opts.offsetY ?? 0;
  const blurPx = opts.blur ?? 4;
  const { hex, opacity } = parseColor(opts.color, "000000");

  const distPx = Math.sqrt(ox * ox + oy * oy);
  // CSS Y 向下；OOXML dir：0=右、90=上、180=左、270=下（逆时针）
  let angle = 270;
  if (distPx > 0.01) {
    const cssDeg = (Math.atan2(oy, ox) * 180) / Math.PI;
    angle = (360 - ((cssDeg % 360) + 360) % 360) % 360;
  }

  return {
    type: "outer" as const,
    color: hex,
    blur: Math.max(0, pxToPt(blurPx)),
    offset: Math.max(0, pxToPt(distPx)),
    angle: Math.round(angle),
    opacity: opacity > 0 ? opacity : 1,
  };
}
