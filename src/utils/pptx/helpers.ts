import { PX_PER_INCH } from "./constants";

export function pxToIn(px: number): number {
  return Number((px / PX_PER_INCH).toFixed(4));
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

/** 去掉 #，PptxGenJS 需要纯 hex */
export function toHexColor(color?: string, fallback = "000000"): string {
  if (!color) return fallback;
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return hex
        .split("")
        .map((c) => c + c)
        .join("")
        .toUpperCase();
    }
    if (hex.length === 6 || hex.length === 8) {
      return hex.slice(0, 6).toUpperCase();
    }
  }
  // rgba(...) 取不到时回退
  const rgb = trimmed.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i
  );
  if (rgb) {
    return [rgb[1], rgb[2], rgb[3]]
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  return fallback;
}

export function parsePlacement(placement?: string): {
  align: "left" | "center" | "right";
  valign: "top" | "middle" | "bottom";
} {
  const [h = "left", v = "top"] = (placement || "left-top").split("-");
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

export function shadowFromOffsets(opts: {
  enabled?: boolean;
  offsetX?: number;
  offsetY?: number;
  color?: string;
  blur?: number;
}) {
  if (!opts.enabled) return undefined;
  const ox = opts.offsetX ?? 2;
  const oy = opts.offsetY ?? 2;
  const offset = Math.sqrt(ox * ox + oy * oy) || 2;
  let angle = (Math.atan2(oy, ox) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  return {
    type: "outer" as const,
    color: toHexColor(opts.color, "696969"),
    blur: opts.blur ?? 3,
    offset: Math.max(1, Math.round(offset)),
    angle: Math.round(angle),
  };
}
