import {
  elementActiveStore,
  menuActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import type { Page } from "@/store/ppt";
import { cloneDeep } from "@/utils";

export type PPTDocumentJSON = {
  name?: string;
  pages: Page[];
  gridSize?: number;
  gridType?: "grid" | "line" | "none";
  verticalLine?: number[];
  horizontalLine?: number[];
  rule?: boolean;
  guideLineShow?: boolean;
  keyboardToggle?: boolean;
};

/**
 * 用 JSON 文档覆盖当前 PPT（支持导出的 { name, pages } 与完整 document）
 */
export function loadDocument(doc: PPTDocumentJSON) {
  if (!Array.isArray(doc.pages) || doc.pages.length === 0) {
    throw new Error("INVALID_PAGES");
  }

  pptStore.setPages(cloneDeep(doc.pages));

  if (doc.name != null) pptStore.setName(doc.name);
  if (doc.gridSize != null) pptStore.setGridSize(doc.gridSize);
  if (doc.gridType) pptStore.setGridType(doc.gridType);
  if (doc.verticalLine) pptStore.setVerticalLine(doc.verticalLine);
  if (doc.horizontalLine) pptStore.setHorizontalLine(doc.horizontalLine);
  if (doc.rule != null) pptStore.setRule(doc.rule);
  if (doc.guideLineShow != null) pptStore.setGuideLineShow(doc.guideLineShow);
  if (doc.keyboardToggle != null) {
    pptStore.setKeyboardToggle(doc.keyboardToggle);
  }

  elementActiveStore.resetElementActive();
  menuActiveStore.resetMenu();

  const pages = pptStore.getPages();
  pageActiveStore.setPageActive(pages[0]?.id ?? null);
}

export function parsePPTDocumentJSON(text: string): PPTDocumentJSON {
  const data = JSON.parse(text) as PPTDocumentJSON;
  if (!data || typeof data !== "object" || !Array.isArray(data.pages)) {
    throw new Error("INVALID_FORMAT");
  }
  if (data.pages.length === 0) {
    throw new Error("INVALID_PAGES");
  }
  return data;
}
