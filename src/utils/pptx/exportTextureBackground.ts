"use client";

import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import type { Page } from "@/store/zustand/pptStore";
import { textureItems } from "@/views/Menu/components/Start/texture";

type PageWithTexture = Page & { selectedTexture?: string };

function getSelectedTexture(page: PageWithTexture): string {
  if (page.selectedTexture) return page.selectedTexture;
  if (typeof page.background === "string" && page.background.startsWith("texture-")) {
    return page.background;
  }
  return "";
}

/** 与画布一致：替换纹理 SVG 的前景色与透明度，解析出 data URL */
function resolveTextureTileUrl(page: PageWithTexture): {
  bgColor: string;
  tileUrl: string;
} | null {
  const selectedTexture = getSelectedTexture(page);
  if (!selectedTexture) return null;

  const textureItem = textureItems.find((item) => item.type === selectedTexture);
  let cssUrl = textureItem?.style.backgroundImage || "";
  if (!cssUrl) return null;

  const fgColor = page.fgColor || "#9C92AC";
  const bgOpacity = page.bgOpacity ?? 0.4;
  const encodedFg = fgColor.replace("#", "%23");

  cssUrl = cssUrl
    .replace(/fill='%23[0-9A-Fa-f]{6}'/g, `fill='${encodedFg}'`)
    .replace(/fill-opacity='[^']*'/g, `fill-opacity='${bgOpacity}'`);

  const match =
    cssUrl.match(/^url\("(.+)"\)$/) ||
    cssUrl.match(/^url\('(.+)'\)$/) ||
    cssUrl.match(/^url\((.+)\)$/);
  if (!match?.[1]) return null;

  return {
    bgColor: page.bgColor || "#e4e4e4",
    tileUrl: match[1],
  };
}

/** 将平铺纹理栅格化为整页 PNG（供 PPTX slide.background） */
export async function renderTextureBackgroundDataUrl(
  page: Page
): Promise<string | null> {
  if (page.backgroundType !== "texture") return null;

  const resolved = resolveTextureTileUrl(page as PageWithTexture);
  if (!resolved) return null;

  const width = Math.round(CANVAS_WIDTH);
  const height = Math.round(CANVAS_HEIGHT);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = resolved.bgColor;
  ctx.fillRect(0, 0, width, height);

  const img = new Image();
  img.decoding = "async";
  img.src = resolved.tileUrl;
  try {
    await img.decode();
  } catch {
    console.warn("纹理瓦片解码失败:", page.id);
    return null;
  }

  const pattern = ctx.createPattern(img, "repeat");
  if (!pattern) return null;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL("image/png");
}

/** 浏览器端：为纹理背景页生成 PNG */
export async function prepareExportBackgrounds(
  pages: Page[]
): Promise<Record<string, string>> {
  const backgrounds: Record<string, string> = {};

  for (const page of pages.filter((p) => p.visible !== false)) {
    if (page.backgroundType === "image" && page.backgroundImage) {
      backgrounds[page.id] = page.backgroundImage;
      continue;
    }
    if (page.backgroundType !== "texture") continue;
    try {
      const dataUrl = await renderTextureBackgroundDataUrl(page);
      if (dataUrl) backgrounds[page.id] = dataUrl;
    } catch (err) {
      console.warn(`纹理背景导出失败 (${page.id}):`, err);
    }
  }

  return backgrounds;
}
