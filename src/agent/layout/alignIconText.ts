import type { LayoutSkeleton, LayoutSlot } from "../types";

export type IconTextPair = {
  icon: LayoutSlot;
  text: LayoutSlot;
};

/**
 * 识别「图标在左、文本在右」的同行配对（非上下堆叠）。
 */
export function findInlineIconTextPairs(slots: LayoutSlot[]): IconTextPair[] {
  const icons = slots.filter((s) => s.type === "icon");
  const texts = slots.filter((s) => s.type === "text");
  const usedText = new Set<string>();
  const pairs: IconTextPair[] = [];

  for (const icon of icons) {
    const iconCy = icon.y + icon.height / 2;
    let best: LayoutSlot | null = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const text of texts) {
      if (usedText.has(text.elementId)) continue;
      // 文本在图标右侧，间距不宜过大
      const gapX = text.x - (icon.x + icon.width);
      if (gapX < -4 || gapX > 96) continue;
      // 排除上下堆叠（文本在图标正下方）
      if (text.y >= icon.y + icon.height - 8) continue;
      if (icon.y >= text.y + text.height - 8) continue;

      const textCy = text.y + text.height / 2;
      const centerDiff = Math.abs(iconCy - textCy);
      const overlap =
        Math.min(icon.y + icon.height, text.y + text.height) -
        Math.max(icon.y, text.y);
      const sameRow =
        overlap > Math.min(icon.height, text.height) * 0.25 ||
        centerDiff <= Math.max(icon.height, Math.min(text.height, 64)) * 0.75;
      if (!sameRow) continue;

      // 优先近邻、矮文本（标题/metric），避免误绑到大段正文
      const tallPenalty = text.height > 72 ? text.height * 0.35 : 0;
      const score = gapX * 1.2 + centerDiff * 2 + tallPenalty;
      if (score < bestScore) {
        bestScore = score;
        best = text;
      }
    }

    if (best) {
      usedText.add(best.elementId);
      pairs.push({ icon, text: best });
    }
  }

  return pairs;
}

/** 将 icon 垂直居中对齐到同行 text 框（同一水平中线） */
export function alignIconToTextY(
  icon: { y: number; height: number },
  text: { y: number; height: number }
): number {
  return Math.round(text.y + (text.height - icon.height) / 2);
}

/** 骨架级：修正同行 icon / text 的 y */
export function alignLayoutIconText(layout: LayoutSkeleton): LayoutSkeleton {
  const slots = layout.slots.map((s) => ({ ...s }));
  const byId = new Map(slots.map((s) => [s.elementId, s]));
  for (const { icon, text } of findInlineIconTextPairs(slots)) {
    const i = byId.get(icon.elementId);
    const t = byId.get(text.elementId);
    if (!i || !t) continue;
    i.y = alignIconToTextY(i, t);
  }
  return { ...layout, slots };
}
