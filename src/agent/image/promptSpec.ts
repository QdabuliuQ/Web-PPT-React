import type { LayoutSlot, SlotRole } from "../types";

export type ImageKind =
  | "photo"
  | "illustration"
  | "decoration"
  | "texture"
  | "hero"
  /** 透明底抠图（头像/装饰物） */
  | "cutout";

const ROLE_IMAGE_KIND: Partial<Record<SlotRole, ImageKind>> = {
  image: "illustration",
  decor: "decoration",
};

export function inferImageKind(opts: {
  role: string;
  layoutKey?: string;
  width: number;
  height: number;
  elementId?: string;
  hint?: string;
}): ImageKind {
  const { role, layoutKey, width, height } = opts;
  if (layoutKey === "cover" || layoutKey === "ending") {
    if (width >= 900 && height >= 500) return "hero";
  }
  if (
    (layoutKey === "cover-left" || layoutKey === "cover-right") &&
    width >= 450 &&
    height >= 500
  ) {
    return "photo";
  }
  if (role === "decor") return "decoration";
  if (ROLE_IMAGE_KIND[role as SlotRole]) {
    return ROLE_IMAGE_KIND[role as SlotRole]!;
  }
  return "illustration";
}

/** 按占位宽高比映射到生图服务常用 size（比例优先；任意像素常被忽略导致拉伸） */
const ASPECT_PRESETS: Array<{ label: string; w: number; h: number }> = [
  { label: "16:9", w: 16, h: 9 },
  { label: "3:2", w: 3, h: 2 },
  { label: "4:3", w: 4, h: 3 },
  { label: "1:1", w: 1, h: 1 },
  { label: "3:4", w: 3, h: 4 },
  { label: "2:3", w: 2, h: 3 },
  { label: "9:16", w: 9, h: 16 },
  { label: "21:9", w: 21, h: 9 },
];

export function mapAspectRatio(width: number, height: number): string {
  const w = Math.round(width);
  const h = Math.round(height);
  if (w <= 0 || h <= 0) return "1:1";
  const ratio = w / h;
  let best = ASPECT_PRESETS[0]!;
  let bestDiff = Infinity;
  for (const p of ASPECT_PRESETS) {
    const diff = Math.abs(p.w / p.h - ratio);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = p;
    }
  }
  return best.label;
}

const KIND_PROMPT: Record<ImageKind, string> = {
  photo: "photorealistic photo, natural lighting, high detail",
  illustration: "clean vector-style illustration, flat design, no text overlay",
  decoration:
    "subtle brand accent atmosphere only when explicitly needed, prefer real materials with clear subject, no abstract waves, no empty geometry strips, no text, no logos",
  texture: "seamless abstract texture pattern, soft colors, no text",
  hero: "editorial wide photograph as media panel only, atmospheric subject, natural light, no text overlay, no logos, never used as a text backdrop",
  cutout:
    "isolated subject on fully transparent background, PNG with alpha channel, clean edge cutout, no drop shadow baked into pixels unless requested, no text, no logos, no solid backdrop",
};

/** 解析 HTML data-image-kind → ImageKind */
export function parseHtmlImageKind(raw?: string | null): ImageKind {
  const k = String(raw || "")
    .trim()
    .toLowerCase();
  if (k === "photo") return "photo";
  if (k === "cutout" || k === "transparent" || k === "avatar") return "cutout";
  if (k === "decoration" || k === "decor") return "decoration";
  if (k === "texture") return "texture";
  if (k === "hero") return "hero";
  if (k === "illustration") return "illustration";
  return "illustration";
}

/**
 * 在 LLM 文案 Prompt 后追加尺寸/类型约束
 */
export function enrichImagePrompt(opts: {
  basePrompt: string;
  width: number;
  height: number;
  kind: ImageKind;
  aspectRatio: string;
  /** 主题色约束，写入生图 prompt */
  paletteHint?: string;
}): string {
  const { basePrompt, width, height, kind, aspectRatio, paletteHint } = opts;
  const w = Math.round(width);
  const h = Math.round(height);
  const kindHint = KIND_PROMPT[kind];
  const sizeToken = aspectRatio || mapAspectRatio(w, h);
  return [
    basePrompt.trim().replace(/[.\s]+$/, ""),
    paletteHint?.trim() || "",
    `image type: ${kind} (${kindHint})`,
    kind === "cutout"
      ? "output PNG with transparent background (alpha), subject only"
      : "",
    `slot ${w}x${h}px, generate at aspect ratio ${sizeToken}`,
    "compose subject to fill the frame; keep natural proportions (no stretched anatomy)",
    "no watermark, no readable text, no logos",
  ]
    .filter(Boolean)
    .join(". ");
}

export function buildDrawTaskFromSlot(opts: {
  assetKey: string;
  basePrompt: string;
  slot: LayoutSlot;
  pageId: string;
  layoutKey: string;
  scope?: "global" | "page";
  paletteHint?: string;
}) {
  const {
    assetKey,
    basePrompt,
    slot,
    pageId,
    layoutKey,
    scope = "page",
    paletteHint,
  } = opts;
  const kind = inferImageKind({
    role: slot.role,
    layoutKey,
    width: slot.width,
    height: slot.height,
    elementId: slot.elementId,
    hint: slot.hint,
  });
  const aspectRatio = mapAspectRatio(slot.width, slot.height);
  const prompt = enrichImagePrompt({
    basePrompt,
    width: slot.width,
    height: slot.height,
    kind,
    aspectRatio,
    paletteHint,
  });

  return {
    assetKey,
    prompt,
    scope,
    pageId,
    width: slot.width,
    height: slot.height,
    aspectRatio,
    imageKind: kind,
    elementId: slot.elementId,
  };
}

/** 全局页面氛围底图（写入 page.backgroundImage） */
export const GLOBAL_BG_ASSET_KEY = "bg_global";

export function buildGlobalBgDrawTask(
  basePrompt: string,
  paletteHint?: string
) {
  const width = 1000;
  const height = 562;
  const aspectRatio = mapAspectRatio(width, height);
  const kind: ImageKind = "texture";
  return {
    assetKey: GLOBAL_BG_ASSET_KEY,
    prompt: enrichImagePrompt({
      basePrompt:
        basePrompt ||
        "soft abstract editorial atmosphere, muted paper-like texture, subtle gradient, no objects, no text",
      width,
      height,
      kind,
      aspectRatio,
      paletteHint,
    }),
    scope: "global" as const,
    width,
    height,
    aspectRatio,
    imageKind: kind,
  };
}

/** 封面/封底全幅图 → 页面背景，不再作为 image 元素叠放 */
export function isFullBleedBgSlot(slot: {
  type: string;
  width: number;
  height: number;
}): boolean {
  return slot.type === "image" && slot.width >= 900 && slot.height >= 500;
}
