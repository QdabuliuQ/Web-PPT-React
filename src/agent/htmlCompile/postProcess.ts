import type { Elements } from "@/store/zustand/pptStore";

type Box = { x: number; y: number; width: number; height: number; zIndex?: number };

function overlapArea(a: Box, b: Box): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  if (x2 <= x1 || y2 <= y1) return 0;
  return (x2 - x1) * (y2 - y1);
}

/**
 * 丢掉严重压住文字/卡片的装饰图（LLM 常在 KPI 旁塞一张插图盖住第三卡）。
 */
export function pruneOverlappingImages(elements: Elements[]): Elements[] {
  const content = elements.filter(
    (e) => e.type === "text" || e.type === "shape" || e.type === "icon"
  );
  const out: Elements[] = [];
  for (const el of elements) {
    if (el.type !== "image") {
      out.push(el);
      continue;
    }
    const imgArea = Math.max(1, el.width * el.height);
    let hit = false;
    for (const c of content) {
      const area = overlapArea(el, c);
      // 盖住任意内容块 ≥25%，或盖住文字中心区域
      if (area / imgArea >= 0.25 || area / Math.max(1, c.width * c.height) >= 0.35) {
        hit = true;
        break;
      }
    }
    if (hit) {
      console.warn(
        `[htmlCompile] 丢弃遮挡内容的图片 ${el.id} @(${el.x},${el.y}) ${el.width}x${el.height}`
      );
      continue;
    }
    out.push(el);
  }
  return out;
}
