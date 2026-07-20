"use client";

import type { IIconProps } from "@/element/Icon";
import * as IconPark from "@icon-park/react";
import { createElement, type ComponentType } from "react";
import { createRoot } from "react-dom/client";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * IconPark SVG → PNG（不依赖完整 Icon 编辑组件 / snapdom）
 */
export async function exportIconAsDataUrl(
  el: IIconProps
): Promise<string | null> {
  const width = Math.max(1, el.width || 100);
  const height = Math.max(1, el.height || 100);
  const iconSize = Math.max(1, Math.min(width, height));
  const IconComp = ((IconPark as Record<string, unknown>)[el.iconName] ||
    IconPark.Home) as ComponentType<Record<string, unknown>>;

  const container = document.createElement("div");
  container.style.cssText = `position:fixed;left:-9999px;top:0;width:${iconSize}px;height:${iconSize}px;overflow:hidden;background:transparent;`;
  document.body.appendChild(container);

  const root = createRoot(container);
  try {
    root.render(
      createElement(IconComp, {
        theme: el.theme || "outline",
        size: iconSize,
        fill: el.fill?.length ? el.fill : ["#333"],
        strokeWidth: el.strokeWidth ?? 3,
      })
    );

    await new Promise((r) => setTimeout(r, 80));

    const svg = container.querySelector("svg");
    if (!svg) {
      console.warn(`图标 ${el.iconName} 未渲染出 SVG`);
      return null;
    }

    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    if (!svg.getAttribute("width")) svg.setAttribute("width", String(iconSize));
    if (!svg.getAttribute("height"))
      svg.setAttribute("height", String(iconSize));

    const svgStr = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgStr], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    try {
      const img = await loadImage(url);
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const drawSize = iconSize * scale;
      const dx = (canvas.width - drawSize) / 2;
      const dy = (canvas.height - drawSize) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, dx, dy, drawSize, drawSize);

      return canvas.toDataURL("image/png", 1.0);
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.warn(`图标 ${el.id}/${el.iconName} 栅格化失败:`, err);
    return null;
  } finally {
    root.unmount();
    container.remove();
  }
}
