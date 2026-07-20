import type { Elements } from "@/store/zustand/pptStore";
import type PptxGenJS from "pptxgenjs";
import { positionFromElement, pxToIn } from "./helpers";

/** 阴影/滤镜向外溢出，捕获时四周留白（px） */
export function getExportBleedPad(element: Elements): number {
  const el = element as Elements & {
    shadow?: boolean;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
  if (!el.shadow) return 0;
  const blur = el.shadowBlur ?? 4;
  const ox = Math.abs(el.shadowOffsetX ?? 0);
  const oy = Math.abs(el.shadowOffsetY ?? 0);
  return Math.ceil(blur + Math.max(ox, oy) + 4);
}

/** 将快照图片放到幻灯片（含阴影 bleed 时外扩定位） */
export function addSnapshotImage(
  slide: PptxGenJS.Slide,
  element: Elements,
  dataUrl: string
): void {
  const pad = getExportBleedPad(element);
  if (pad <= 0) {
    slide.addImage({ ...positionFromElement(element), data: dataUrl });
    return;
  }
  slide.addImage({
    x: pxToIn(element.x - pad),
    y: pxToIn(element.y - pad),
    w: pxToIn(element.width + pad * 2),
    h: pxToIn(element.height + pad * 2),
    data: dataUrl,
    ...(element.rotate ? { rotate: element.rotate } : {}),
  });
}
