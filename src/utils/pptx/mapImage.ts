import type { IImageProps } from "@/element/Image";
import type PptxGenJS from "pptxgenjs";
import { positionFromElement, shadowFromOffsets } from "./helpers";

async function resolveImageData(src: string): Promise<string | null> {
  if (src.startsWith("data:")) return src;

  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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