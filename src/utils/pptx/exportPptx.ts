import type { Elements, Page } from "@/store/zustand/pptStore";
import type { IChartProps } from "@/element/Chart";
import type { IImageProps } from "@/element/Image";
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
import { addElementAsImage } from "./mapAsImage";
import { addChartElement } from "./mapChart";
import { addImageElement } from "./mapImage";
import { addTableElement } from "./mapTable";
import { addTextElement } from "./mapText";

export interface ExportPptxOptions {
  name?: string;
  pages: Page[];
}

function sortByZIndex(elements: Elements[]): Elements[] {
  return [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
}

function applySlideBackground(slide: PptxGenJS.Slide, page: Page): void {
  if (page.backgroundType === "solidColor" || !page.backgroundType) {
    const color = toHexColor(page.background || "#FFFFFF", "FFFFFF");
    slide.background = { color };
    return;
  }
  // 纹理等复杂背景：用纯色兜底（纹理导出可后续增强）
  slide.background = {
    color: toHexColor(page.bgColor || page.background || "#FFFFFF", "FFFFFF"),
  };
}

async function addElementToSlide(
  slide: PptxGenJS.Slide,
  element: Elements,
  pptx: PptxGenJS
): Promise<void> {
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
      await addChartElement(slide, element as IChartProps, pptx);
      break;
    case "icon":
    case "mindmap":
      await addElementAsImage(slide, element);
      break;
    default:
      console.warn("未知元素类型，跳过:", (element as Elements).type);
  }
}

/**
 * 将当前 PPT 页面导出为 .pptx 文件并触发下载
 */
export async function exportToPptx(options: ExportPptxOptions): Promise<void> {
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
    applySlideBackground(slide, page);

    if (page.remark) {
      slide.addNotes(page.remark);
    }

    const elements = sortByZIndex(page.elements || []);
    for (const el of elements) {
      try {
        await addElementToSlide(slide, el, pptx);
      } catch (err) {
        console.warn(`导出元素失败 (${el.type}/${el.id}):`, err);
      }
    }
  }

  const fileName = `${options.name || "未命名"}.pptx`;
  await pptx.writeFile({ fileName });
}

export { CANVAS_WIDTH, CANVAS_HEIGHT };
