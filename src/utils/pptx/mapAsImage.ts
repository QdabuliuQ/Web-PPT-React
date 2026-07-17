import type { Elements } from "@/store/zustand/pptStore";
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
import { positionFromElement } from "./helpers";

const ComponentMap = {
  text: Text,
  table: Table,
  icon: Icon,
  image: Image,
  mindmap: MindMap,
  chart: Chart,
} as const;

/**
 * 将单个元素离屏渲染为 PNG data URL（用于 icon / mindmap 等无原生映射的类型）
 */
export async function exportElementAsDataUrl(
  element: Elements
): Promise<string | null> {
  const Comp = ComponentMap[element.type as keyof typeof ComponentMap];
  if (!Comp) return null;

  const width = Math.max(1, element.width || 100);
  const height = Math.max(1, element.height || 100);

  const tempContainer = document.createElement("div");
  tempContainer.style.position = "fixed";
  tempContainer.style.left = "-9999px";
  tempContainer.style.top = "0";
  tempContainer.style.width = `${width}px`;
  tempContainer.style.height = `${height}px`;
  tempContainer.style.overflow = "hidden";
  tempContainer.style.backgroundColor = "transparent";
  document.body.appendChild(tempContainer);

  const wrapper = document.createElement("div");
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.position = "relative";
  tempContainer.appendChild(wrapper);

  const root = createRoot(wrapper);

  try {
    // 放到 (0,0)，避免画布坐标系偏移
    const props = {
      ...element,
      x: 0,
      y: 0,
      mode: "preview" as const,
      readonly: true,
    };

    root.render(createElement(Comp as any, props));

    await new Promise((r) => setTimeout(r, 600));

    // mindmap / chart 需要更长时间初始化
    if (element.type === "mindmap" || element.type === "chart") {
      await new Promise((r) => setTimeout(r, 800));
    }

    const canvas = await snapdom.toCanvas(wrapper, {
      scale: 2,
      backgroundColor: "#ffffff",
      width,
      height,
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
  const pos = positionFromElement(element);
  slide.addImage({ ...pos, data: dataUrl });
}
