import { PLATFORM_LIMITS } from "../catalog";
import { contrastRatio, pickReadableText, relativeLuminance } from "../contrast";
import type { LayoutKey, SlotRole, ThemeToken } from "../types";
import {
  DESIGN_RADIUS,
  deriveSurfaceTokens,
  fontSizeForRole,
  isHeroOverlayLayout as isHeroLayout,
} from "./design";

export { isHeroOverlayLayout } from "./design";
export {
  DESIGN_RADIUS,
  DESIGN_SHADOW,
  DESIGN_SPACE,
  FONT_SCALE,
  deriveSurfaceTokens,
  isCardShapeSlot,
} from "./design";

export type TextStyleTokens = {
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  lineHeight: number;
  backgroundColor: string;
  border: boolean;
  borderWidth: number;
  borderColor: string;
  shadow: boolean;
  shadowBlur: number;
  shadowColor: string;
  placement:
    | "left-top"
    | "left-center"
    | "left-bottom"
    | "center-top"
    | "center-center"
    | "center-bottom"
    | "right-top"
    | "right-center"
    | "right-bottom";
};

export type PageBackgroundTokens = {
  backgroundType: "solidColor" | "texture" | "image";
  background: string;
  bgColor: string;
  fgColor: string;
  bgOpacity: number;
  selectedTexture?: string;
  backgroundImage?: string;
};

function pickTexture(theme: ThemeToken): string {
  const n =
    [...(theme.templateName || theme.primary)].reduce(
      (a, c) => a + c.charCodeAt(0),
      0
    ) % 12;
  return `texture-${n + 1}`;
}

function clampFontSize(n: number): number {
  const { min, max, step } = PLATFORM_LIMITS.fontSize;
  const clamped = Math.min(max, Math.max(min, n));
  return Math.round(clamped / step) * step;
}

export function ensureLightTextColor(preferred: string): string {
  if (relativeLuminance(preferred) >= 0.6) return preferred;
  return "#FFFFFF";
}

export function ensureDarkTextColor(preferred: string): string {
  if (relativeLuminance(preferred) <= 0.35) return preferred;
  return "#1A1A1A";
}

export function mapTextStyle(
  theme: ThemeToken,
  role: SlotRole,
  bgForContrast?: string,
  opts?: {
    overImage?: boolean;
    layoutKey?: LayoutKey;
    accentBar?: boolean;
    darkSurface?: boolean;
  }
): TextStyleTokens {
  const overImage = opts?.overImage === true;
  const darkSurface = opts?.darkSurface === true || overImage;
  const accentBar = opts?.accentBar === true;
  const layoutKey = opts?.layoutKey;
  const centered =
    layoutKey === "cover-center" ||
    layoutKey === "ending-center" ||
    layoutKey === "quote-center" ||
    (layoutKey === "quote" && (role === "body" || role === "subtitle"));

  if (accentBar) {
    return {
      fontSize: 12,
      fontFamily: theme.fontBody,
      color: theme.primary,
      bold: false,
      lineHeight: 1,
      backgroundColor: theme.primary,
      border: false,
      borderWidth: 0,
      borderColor: theme.primary,
      shadow: false,
      shadowBlur: 0,
      shadowColor: "transparent",
      placement: "left-top",
    };
  }

  const pageBg = bgForContrast || theme.background;
  const contrastBg = darkSurface ? "#1A1A1A" : pageBg;
  let color = pickReadableText(
    contrastBg,
    theme.textOnLight,
    theme.textOnDark
  );

  if (darkSurface) {
    color = ensureLightTextColor(theme.textOnDark || "#FFFFFF");
  } else {
    if (
      (role === "title" || role === "metric") &&
      contrastRatio(theme.primary, pageBg) >= 3
    ) {
      color = theme.primary;
    }
    color = ensureDarkTextColor(color);
    if (contrastRatio(color, pageBg) < 4.5) {
      color = ensureDarkTextColor(
        pickReadableText(pageBg, theme.textOnLight, theme.textOnDark)
      );
    }
  }

  const isTitle = role === "title" || role === "metric";
  const isHero = overImage;
  const fontSize = clampFontSize(fontSizeForRole(role, layoutKey));
  let placement: TextStyleTokens["placement"] = "left-top";
  if (centered) {
    placement =
      role === "subtitle" || role === "body"
        ? "center-center"
        : "center-top";
  } else if (role === "metric") {
    placement = "center-center";
  }

  return {
    fontSize,
    fontFamily: isTitle ? theme.fontTitle : theme.fontBody,
    color,
    bold: isTitle || role === "subtitle",
    lineHeight: role === "metric" ? 1.05 : isTitle ? 1.2 : 1.5,
    backgroundColor: "transparent",
    border: false,
    borderWidth: 0,
    borderColor: "transparent",
    shadow: isHero,
    shadowBlur: isHero ? 16 : 0,
    shadowColor: isHero ? "rgba(0,0,0,0.65)" : "transparent",
    placement,
  };
}

export function fitTextBox(opts: {
  text: string;
  width: number;
  height: number;
  fontSize: number;
  lineHeight: number;
  maxHeight?: number;
}): { fontSize: number; height: number; lineHeight: number } {
  const { text, width, maxHeight } = opts;
  let fontSize = opts.fontSize;
  let lineHeight = opts.lineHeight;
  const content = text || " ";

  const estimate = (fs: number, lh: number) => {
    const avgChar = fs * 0.95;
    const perLine = Math.max(1, Math.floor(width / avgChar));
    const lines = Math.max(1, Math.ceil(content.length / perLine));
    return lines * fs * lh;
  };

  let needed = estimate(fontSize, lineHeight);
  const cap = maxHeight ?? Math.max(opts.height, needed);

  while (needed > opts.height + 2 && fontSize > PLATFORM_LIMITS.fontSize.min) {
    fontSize = Math.max(
      PLATFORM_LIMITS.fontSize.min,
      fontSize - PLATFORM_LIMITS.fontSize.step
    );
    needed = estimate(fontSize, lineHeight);
  }

  let height = opts.height;
  if (needed > height + 2) {
    height = Math.min(cap, Math.ceil(needed + 8));
  }

  return { fontSize, height, lineHeight };
}

export function mapPageBackground(
  theme: ThemeToken,
  layoutKey?: LayoutKey,
  backgroundImage?: string
): PageBackgroundTokens {
  if (backgroundImage && layoutKey && isHeroLayout(layoutKey)) {
    return {
      backgroundType: "image",
      background: "#0F1115",
      bgColor: "#0F1115",
      fgColor: theme.secondary,
      bgOpacity: 0.3,
      backgroundImage,
    };
  }

  if (layoutKey && isHeroLayout(layoutKey)) {
    return {
      backgroundType: "solidColor",
      background: "#0F1115",
      bgColor: "#0F1115",
      fgColor: theme.secondary,
      bgOpacity: 0.2,
    };
  }

  return {
    backgroundType: "texture",
    background: theme.background,
    bgColor: theme.background,
    fgColor: theme.secondary,
    bgOpacity: 0.14,
    selectedTexture: pickTexture(theme),
  };
}

export function mapIconFill(theme: ThemeToken): string[] {
  return [theme.primary, theme.secondary];
}

export type ShapeStyleTokens = {
  fill: string;
  border: boolean;
  borderWidth: number;
  borderColor: string;
  borderStyle: "solid" | "dashed" | "dotted";
  opacity: number;
};

export function mapShapeStyle(
  theme: ThemeToken,
  opts: { card?: boolean }
): ShapeStyleTokens {
  const surfaces = deriveSurfaceTokens(theme);
  if (opts.card) {
    return {
      fill: surfaces.cardFill,
      border: true,
      borderWidth: 1,
      borderColor: surfaces.border,
      borderStyle: "solid",
      opacity: 1,
    };
  }
  return {
    fill: theme.primary,
    border: false,
    borderWidth: 0,
    borderColor: theme.secondary,
    borderStyle: "solid",
    opacity: 1,
  };
}

export type TableCellStyle = {
  fontSize: number;
  color: string;
  backgroundColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  placement:
    | "left-top"
    | "left-center"
    | "left-bottom"
    | "center-top"
    | "center-center"
    | "center-bottom"
    | "right-top"
    | "right-center"
    | "right-bottom";
};

export type TableStyleTokens = {
  fontSize: number;
  fontFamily: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: "solid" | "dashed" | "dotted" | "double" | "none";
  borderRadius: number;
  header: Omit<TableCellStyle, "fontSize"> & { fontSize: number };
  body: Omit<TableCellStyle, "fontSize"> & { fontSize: number };
  bodyAltBackground: string;
};

export function mapTableStyle(theme: ThemeToken): TableStyleTokens {
  const surfaces = deriveSurfaceTokens(theme);
  const headerBg = theme.primary;
  const headerColor =
    relativeLuminance(headerBg) >= 0.45
      ? ensureDarkTextColor(theme.textOnLight)
      : ensureLightTextColor(theme.textOnDark || "#FFFFFF");
  const bodyBg = surfaces.cardFill;
  const bodyAlt = surfaces.surfaceAlt;
  const bodyColor = ensureDarkTextColor(
    pickReadableText(bodyBg, theme.textOnLight, theme.textOnDark)
  );

  return {
    fontSize: clampFontSize(14),
    fontFamily: theme.fontBody,
    borderColor: surfaces.border,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: DESIGN_RADIUS.card,
    header: {
      fontSize: clampFontSize(14),
      color: headerColor,
      backgroundColor: headerBg,
      bold: true,
      italic: false,
      underline: false,
      strikethrough: false,
      placement: "center-center",
    },
    body: {
      fontSize: clampFontSize(14),
      color: bodyColor,
      backgroundColor: bodyBg,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      placement: "left-center",
    },
    bodyAltBackground: bodyAlt,
  };
}
