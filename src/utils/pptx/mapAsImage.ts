"use client";

import type { Elements } from "@/store/zustand/pptStore";
import type { IIconProps } from "@/element/Icon";
import type { IChartProps } from "@/element/Chart";
import { snapdom } from "@zumer/snapdom";
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { Chart } from "@/element/Chart";
import { Icon } from "@/element/Icon";
import { Image } from "@/element/Image";
import { MindMap } from "@/element/MindMap";
import { Table } from "@/element/Table";
import { Text } from "@/element/Text";
import type PptxGenJS from "pptxgenjs";
import { addSnapshotImage, getExportBleedPad } from "./snapshotImage";
import { exportIconAsDataUrl } from "./exportIcon";
import { exportChartAsDataUrl } from "./exportChart";

export { addSnapshotImage, getExportBleedPad } from "./snapshotImage";

const ComponentMap = {
  text: Text,
  table: Table,
  icon: Icon,
  image: Image,
  mindmap: MindMap,
  chart: Chart,
} as const;

/**
 * 将单个元素离屏渲染为 PNG data URL（用于 icon / mindmap / chart / 带阴影文本等）
 * 仅浏览器端调用
 */
export async function exportElementAsDataUrl(
  element: Elements
): Promise<string | null> {
  if (element.type === "icon") {
    return exportIconAsDataUrl(element as IIconProps);
  }
  if (element.type === "chart") {
    return exportChartAsDataUrl(element as IChartProps);
  }

  const Comp = ComponentMap[element.type as keyof typeof ComponentMap];
  if (!Comp) return null;

  const width = Math.max(1, element.width || 100);
  const height = Math.max(1, element.height || 100);
  const pad = getExportBleedPad(element);
  const captureW = width + pad * 2;
  const captureH = height + pad * 2;

  const tempContainer = document.createElement("div");
  tempContainer.style.cssText = `position:fixed;left:-9999px;top:0;width:${captureW}px;height:${captureH}px;overflow:visible;background:transparent;`;
  document.body.appendChild(tempContainer);

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `width:${captureW}px;height:${captureH}px;position:relative;overflow:visible;background:transparent;`;
  tempContainer.appendChild(wrapper);

  const root = createRoot(wrapper);

  try {
    const props = {
      ...element,
      x: pad,
      y: pad,
      mode: "preview" as const,
      readonly: true,
    };

    root.render(createElement(Comp as any, props));

    await new Promise((r) => setTimeout(r, 600));

    if (element.type === "mindmap") {
      await new Promise((r) => setTimeout(r, 800));
    }

    const canvas = await snapdom.toCanvas(wrapper, {
      scale: 2,
      backgroundColor: "transparent",
      width: captureW,
      height: captureH,
      cache: "disabled",
    });

    return canvas.toDataURL("image/png", 1.0);
  } catch (err) {
    console.warn(`元素 ${element.type} 栅格化失败:`, err);
    return null;
  } finally {
    root.unmount();
    document.body.removeChild(tempContainer);
  }
}

export async function addElementAsImage(
  slide: PptxGenJS.Slide,
  element: Elements
): Promise<void> {
  const dataUrl = await exportElementAsDataUrl(element);
  if (!dataUrl) return;
  addSnapshotImage(slide, element, dataUrl);
}
