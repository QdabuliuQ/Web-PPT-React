"use client";

import type { ITextProps } from "@/element/Text";
import type { Elements, Page } from "@/store/zustand/pptStore";
import { exportElementAsDataUrl } from "./mapAsImage";

/**
 * 浏览器端：为无法原生还原的元素生成 PNG 快照
 * （icon / mindmap / chart / 带 CSS 阴影的文本等）
 */
export async function prepareExportSnapshots(
  pages: Page[]
): Promise<Record<string, string>> {
  const snapshots: Record<string, string> = {};
  const visiblePages = pages.filter((p) => p.visible !== false);

  for (const page of visiblePages) {
    for (const el of page.elements || []) {
      if (!needsClientSnapshot(el)) continue;
      try {
        const dataUrl = await exportElementAsDataUrl(el);
        if (dataUrl) {
          snapshots[el.id] = dataUrl;
        }
      } catch (err) {
        console.warn(`预栅格化失败 (${el.type}/${el.id}):`, err);
      }
    }
  }

  return snapshots;
}

export function needsClientSnapshot(el: Elements): boolean {
  if (el.type === "icon" || el.type === "mindmap" || el.type === "chart") {
    return true;
  }
  if (el.type === "text" && (el as ITextProps).shadow) return true;
  return false;
}
