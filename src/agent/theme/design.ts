import { contrastRatio, relativeLuminance } from "../contrast";
import type { LayoutKey, SlotRole, ThemeToken } from "../types";

/** 画布间距与圆角（与布局骨架对齐） */
export const DESIGN_SPACE = {
  pageX: 56,
  pageY: 42,
  gap: 24,
  colGap: 24,
  cardPad: 20,
} as const;

export const DESIGN_RADIUS = {
  image: 16,
  card: 14,
  accent: 2,
} as const;

export const DESIGN_SHADOW = {
  image: {
    blur: 28,
    offsetY: 10,
    color: "rgba(15,17,21,0.16)",
  },
  card: {
    blur: 18,
    offsetY: 6,
    color: "rgba(15,17,21,0.10)",
  },
} as const;

/** 字号阶梯（偶数，落在 platform fontSize 范围内） */
export const FONT_SCALE = {
  coverTitle: 48,
  coverSubtitle: 20,
  title: 32,
  subtitle: 18,
  body: 16,
  bullet: 15,
  metric: 44,
  caption: 14,
} as const;

export type SurfaceTokens = {
  surface: string;
  surfaceAlt: string;
  muted: string;
  border: string;
  cardFill: string;
};

/** 从主题派生表面色，避免 LLM 多填字段 */
export function deriveSurfaceTokens(theme: ThemeToken): SurfaceTokens {
  const surface = theme.background || "#F7F8FA";
  const surfaceAlt = mixToward(theme.secondary, "#FFFFFF", 0.9) || "#FFFFFF";
  const muted = mixToward(theme.textOnLight, surface, 0.55) || "#6B7280";
  const border =
    contrastRatio(theme.secondary, surface) >= 1.4
      ? mixToward(theme.secondary, surface, 0.35)
      : "#D0D7DE";
  const cardFill = "#FFFFFF";
  return { surface, surfaceAlt, muted, border, cardFill };
}

export function fontSizeForRole(
  role: SlotRole,
  layoutKey?: LayoutKey
): number {
  const hero =
    layoutKey === "cover" ||
    layoutKey === "cover-center" ||
    layoutKey === "cover-left" ||
    layoutKey === "cover-right" ||
    layoutKey === "ending";
  if (role === "metric") return FONT_SCALE.metric;
  if (hero && role === "title") return FONT_SCALE.coverTitle;
  if (hero && role === "subtitle") return FONT_SCALE.coverSubtitle;
  if (layoutKey === "quote" || layoutKey === "quote-center") {
    if (role === "body") return 28;
  }
  if (role === "title") return FONT_SCALE.title;
  if (role === "subtitle") return FONT_SCALE.subtitle;
  if (role === "body") return FONT_SCALE.body;
  if (role === "bullet") return FONT_SCALE.bullet;
  return FONT_SCALE.caption;
}

export function isHeroOverlayLayout(layoutKey: string): boolean {
  return (
    layoutKey === "cover" ||
    layoutKey === "cover-center" ||
    layoutKey === "ending" ||
    layoutKey === "ending-center"
  );
}

/** shape 是卡片底板（大块 decor）还是强调条 */
export function isCardShapeSlot(opts: {
  role: string;
  width: number;
  height: number;
}): boolean {
  return (
    opts.role === "decor" && opts.width >= 120 && opts.height >= 80
  );
}

function mixToward(
  hex: string,
  toward: string,
  amount: number
): string {
  const a = parseHex(hex);
  const b = parseHex(toward);
  if (!a || !b) return toward;
  const t = Math.min(1, Math.max(0, amount));
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `#${to2(r)}${to2(g)}${to2(bl)}`;
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function to2(n: number): string {
  return n.toString(16).padStart(2, "0");
}

/** 分类气质：微调阴影强度等（颜色仍以 theme token 为准） */
export function categoryMood(category: string): {
  imageBrightness: number;
  preferWarmTexture: boolean;
} {
  const c = (category || "").toLowerCase();
  if (/科技|saas|ai|软件|数字/.test(c)) {
    return { imageBrightness: 1, preferWarmTexture: false };
  }
  if (/教育|人文|生活|消费/.test(c)) {
    return { imageBrightness: 1.02, preferWarmTexture: true };
  }
  if (/金融|路演|融资|商务/.test(c)) {
    return { imageBrightness: 0.98, preferWarmTexture: false };
  }
  return { imageBrightness: 1, preferWarmTexture: false };
}

export function pickReadableMuted(
  theme: ThemeToken,
  surfaces: SurfaceTokens
): string {
  if (contrastRatio(surfaces.muted, surfaces.surface) >= 4.5) {
    return surfaces.muted;
  }
  return relativeLuminance(surfaces.surface) > 0.5
    ? theme.textOnLight
    : theme.textOnDark;
}
