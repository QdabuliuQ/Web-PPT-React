import MockData from "@/mock";
import { pageActiveStore, pptStore } from "@/store";

/**
 * 初始化 PPT Store 数据
 * 只在没有数据时初始化，避免重复初始化
 */
export function initPPTStore() {
  // 只在没有数据时初始化
  if (pptStore.getPages().length === 0) {
    try {
      pptStore.setPages(JSON.parse(JSON.stringify(MockData)).pages);
      pptStore.setGridSize(MockData.gridSize);
      pptStore.setKeyboardToggle(MockData.keyboardToggle);
      pptStore.setName(MockData.name);
      if ((MockData as any).gridType) {
        pptStore.setGridType((MockData as any).gridType);
      }
      pptStore.setVerticalLine(MockData.verticalLine);
      pptStore.setHorizontalLine(MockData.horizontalLine);
      pptStore.setRule(MockData.rule);
      pptStore.setGuideLineShow(MockData.guideLineShow);

      const pages = pptStore.getPages();

      if (pages.length > 0) {
        pageActiveStore.setPageActive(pages[0].id);
      }

      if (process.env.NODE_ENV === "development") {
        console.log("PPT Store initialized with", pages.length, "pages");
      }
    } catch (error) {
      console.error("Failed to initialize PPT Store:", error);
    }
  }
}
