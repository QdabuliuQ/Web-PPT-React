import type { Elements, Page } from "@/store/zustand/pptStore";
import type { IChartProps } from "@/element/Chart";
import type { IImageProps } from "@/element/Image";
import type { IShapeProps } from "@/element/Shape";
import type { ITableProps } from "@/element/Table";
import type { ITextProps } from "@/element/Text";
import PptxGenJS from "pptxgenjs";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PPTX_HEIGHT_IN,
  PPTX_LAYOUT_NAME,
  PPTX_WIDTH_IN,
} from "./constants";
import { toHexColor } from "./helpers";
import { addChartElement } from "./mapChart";
import { addImageElement } from "./mapImage";
import { addShapeElement } from "./mapShape";
import { addTableElement } from "./mapTable";
import { addTextElement } from "./mapText";
import { addSnapshotImage } from "./snapshotImage";

export interface ExportPptxOptions {
  name?: string;
  pages: Page[];
  /** 元素 id → PNG data URL（icon / mindmap / funnel 等由前端预栅格化） */
  snapshots?: Record<string, string>;
  /** 页面 id → 纹理背景 PNG data URL（由前端 prepareExportBackgrounds 生成） */
  backgrounds?: Record<string, string>;
}

function sortByZIndex(elements: Elements[]): Elements[] {
  return [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
}

function toPptxImageData(dataUrl: string): string {
  // pptxgenjs 接受 `image/png;base64,...` 或完整 data URL
  if (dataUrl.startsWith("data:")) {
    return dataUrl.slice("data:".length);
  }
  return dataUrl;
}

function applySlideBackground(
  slide: PptxGenJS.Slide,
  page: Page,
  backgrounds?: Record<string, string>
): void {
  const preparedBg = backgrounds?.[page.id];
  if (preparedBg) {
    slide.background = { data: toPptxImageData(preparedBg) };
    return;
  }

  if (page.backgroundType === "image" && page.backgroundImage) {
    slide.background = { data: toPptxImageData(page.backgroundImage) };
    return;
  }

  if (page.backgroundType === "solidColor" || !page.backgroundType) {
    const color = toHexColor(page.background || "#FFFFFF", "FFFFFF");
    slide.background = { color };
    return;
  }

  // 纹理未预渲染时退回底色
  slide.background = {
    color: toHexColor(page.bgColor || page.background || "#FFFFFF", "FFFFFF"),
  };
}

async function addElementToSlide(
  slide: PptxGenJS.Slide,
  element: Elements,
  pptx: PptxGenJS,
  snapshots?: Record<string, string>
): Promise<void> {
  const snapshot = snapshots?.[element.id];
  if (snapshot) {
    addSnapshotImage(slide, element, snapshot);
    return;
  }

  switch (element.type) {
    case "text":
      addTextElement(slide, element as ITextProps);
      break;
    case "table":
      addTableElement(slide, element as ITableProps);
      break;
    case "image":
      await addImageElement(slide, element as IImageProps);
      break;
    case "chart":
      await addChartElement(slide, element as IChartProps, pptx, snapshots);
      break;
    case "shape":
      addShapeElement(slide, element as IShapeProps, pptx);
      break;
    case "icon":
    case "mindmap":
      // 无预览快照时跳过（需前端 prepareExportSnapshots）
      console.warn(`元素 ${element.type}/${element.id} 缺少导出快照，已跳过`);
      break;
    default:
      console.warn("未知元素类型，跳过:", (element as Elements).type);
  }
}

/**
 * 在服务端（或任意 Node/浏览器环境）生成 PPTX 二进制
 */
export async function buildPptxBuffer(
  options: ExportPptxOptions
): Promise<ArrayBuffer> {
  const pages = options.pages.filter((p) => p.visible !== false);
  if (pages.length === 0) {
    throw new Error("没有可导出的页面");
  }

  const pptx = new PptxGenJS();
  pptx.defineLayout({
    name: PPTX_LAYOUT_NAME,
    width: PPTX_WIDTH_IN,
    height: PPTX_HEIGHT_IN,
  });
  pptx.layout = PPTX_LAYOUT_NAME;
  pptx.author = "WebPPT";
  pptx.title = options.name || "未命名";

  for (const page of pages) {
    const slide = pptx.addSlide();
    applySlideBackground(slide, page, options.backgrounds);

    if (page.remark) {
      slide.addNotes(page.remark);
    }

    const elements = sortByZIndex(page.elements || []);
    for (const el of elements) {
      try {
        await addElementToSlide(slide, el, pptx, options.snapshots);
      } catch (err) {
        console.warn(`导出元素失败 (${el.type}/${el.id}):`, err);
      }
    }
  }

  const output = await pptx.write({ outputType: "arraybuffer" });
  return output as ArrayBuffer;
}

export { CANVAS_WIDTH, CANVAS_HEIGHT };
