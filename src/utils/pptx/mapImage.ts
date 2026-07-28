import type { IImageProps } from "@/element/Image";
import type PptxGenJS from "pptxgenjs";
import { arrayBufferToBase64 } from "./arrayBufferToBase64";
import { positionFromElement, shadowFromOffsets } from "./helpers";

async function resolveImageData(src: string): Promise<string | null> {
  if (src.startsWith("data:")) return src;

  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const mime = res.headers.get("content-type") || "image/png";
    const base64 = arrayBufferToBase64(await res.arrayBuffer());
    return `data:${mime};base64,${base64}`;
  } catch (err) {
    console.warn("图片拉取失败:", src, err);
    return null;
  }
}

export async function addImageElement(
  slide: PptxGenJS.Slide,
  el: IImageProps
): Promise<void> {
  if (!el.src) return;

  const data = await resolveImageData(el.src);
  if (!data) return;

  const pos = positionFromElement(el);
  const options: PptxGenJS.ImageProps = {
    ...pos,
    data,
    transparency: Math.round((1 - (el.opacity ?? 1)) * 100),
    rotate: el.rotate || 0,
  };

  // 保持比例：cover 裁切铺满，避免 PPTX 把图拉伸变形
  if (el.keepRatio !== false && pos.w && pos.h) {
    options.sizing = {
      type: "cover",
      w: pos.w,
      h: pos.h,
    };
  }

  const shadow = shadowFromOffsets({
    enabled: el.shadow,
    offsetX: el.shadowOffsetX,
    offsetY: el.shadowOffsetY,
    color: el.shadowColor,
    blur: el.shadowBlur,
  });
  if (shadow) options.shadow = shadow;

  // 边框 / 圆角 / CSS 滤镜无法完整映射到 ImageProps，导出时忽略
  slide.addImage(options);
}
