import type { LayoutSlot, SlotRole } from "../types";

export type ImageKind =
  | "photo"
  | "illustration"
  | "decoration"
  | "texture"
  | "hero";

const ROLE_IMAGE_KIND: Partial<Record<SlotRole, ImageKind>> = {
  image: "illustration",
  decor: "decoration",
};

/** 常见生图服务支持的尺寸枚举（优先匹配） */
const ASPECT_PRESETS: Array<{ label: string; w: number; h: number }> = [
  { label: "1792x1024", w: 1792, h: 1024 }, // 16:9 横
  { label: "1024x1792", w: 1024, h: 1792 }, // 9:16 竖
  { label: "1024x1024", w: 1024, h: 1024 },
  { label: "1536x1024", w: 1536, h: 1024 },
  { label: "1024x1536", w: 1024, h: 1536 },
];

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
    // 全幅背景倾向 hero
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

export function mapAspectRatio(width: number, height: number): string {
  if (width <= 0 || height <= 0) return "1024x1024";
  const ratio = width / height;
  let best = ASPECT_PRESETS[0];
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
  hero: "cinematic wide hero background, 16:9, darker midtones, soft vignette, clear darker band for text overlay, atmospheric, never pale or white wash, no text overlay",
};

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
  const kindHint = KIND_PROMPT[kind];
  return [
    basePrompt.trim().replace(/[.\s]+$/, ""),
    paletteHint?.trim() || "",
    `image type: ${kind} (${kindHint})`,
    `target canvas slot: ${Math.round(width)}x${Math.round(height)}px`,
    `generate at aspectRatio ${aspectRatio}`,
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
