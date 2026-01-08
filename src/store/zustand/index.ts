// Export all Zustand stores
import { usePageActiveStore } from "./pageActiveStore";
import { usePPTStore } from "./pptStore";

export { usePPTStore } from "./pptStore";
export type { Elements, Page } from "./pptStore";

export { contextMenuStore, useContextMenuStore } from "./contextMenuStore";
export {
  elementActiveStore,
  useElementActiveStore,
} from "./elementActiveStore";
export { fullscreenStore, useFullscreenStore } from "./fullscreenStore";
export { usePageActiveStore } from "./pageActiveStore";

export {
  copyElementStore,
  displayStatusStore,
  elementHoverActiveStore,
  menuActiveStore,
  remarkEditActiveStore,
  useCopyElementStore,
  useDisplayStatusStore,
  useElementHoverActiveStore,
  useMenuActiveStore,
  useRemarkEditActiveStore,
} from "./allStores";

// Create compatibility layer for existing code
class PageActiveStoreCompat {
  get pageActive() {
    return usePageActiveStore.getState().pageActive;
  }

  setPageActive = (pageActive: string | null) => {
    usePageActiveStore.getState().setPageActive(pageActive);
  };

  getPageActive = () => {
    return usePageActiveStore.getState().getPageActive();
  };

  isPageActive = (pageActive: string) => {
    return usePageActiveStore.getState().isPageActive(pageActive);
  };

  resetPageActive = () => {
    usePageActiveStore.getState().resetPageActive();
  };

  getPageIndex = (pages: any[]) => {
    return usePageActiveStore.getState().getPageIndex(pages);
  };

  goToPrevPage = () => {
    return usePageActiveStore.getState().goToPrevPage();
  };

  goToNextPage = () => {
    return usePageActiveStore.getState().goToNextPage();
  };
}

class PPTStoreCompat {
  get pages() {
    return usePPTStore.getState().pages;
  }

  set pages(value) {
    usePPTStore.getState().setPages(value);
  }

  setKeyboardToggle = (value: boolean) => {
    usePPTStore.getState().setKeyboardToggle(value);
  };

  getKeyboardToggle = () => {
    return usePPTStore.getState().getKeyboardToggle();
  };

  getActivePage = (pageId: string) => {
    return usePPTStore.getState().getActivePage(pageId);
  };

  getPages = () => {
    return usePPTStore.getState().getPages();
  };

  setPages = (pages: any[]) => {
    usePPTStore.getState().setPages(pages);
  };

  addPage = (afterPageId?: string) => {
    return usePPTStore.getState().addPage(afterPageId);
  };

  duplicatePage = (pageId: string) => {
    return usePPTStore.getState().duplicatePage(pageId);
  };

  deletePage = (pageId: string) => {
    return usePPTStore.getState().deletePage(pageId);
  };

  movePage = (pageId: string, direction: "up" | "down") => {
    usePPTStore.getState().movePage(pageId, direction);
  };

  togglePageVisible = (pageId: string) => {
    usePPTStore.getState().togglePageVisible(pageId);
  };

  addElement = (pageId: string, element: any) => {
    usePPTStore.getState().addElement(pageId, element);
  };

  addElementInfo = (pageId: string, element: any) => {
    usePPTStore.getState().addElement(pageId, element);
  };

  deleteElement = (pageId: string, elementId: string) => {
    usePPTStore.getState().deleteElement(pageId, elementId);
  };

  updateElement = (pageId: string, elementId: string, updates: any) => {
    usePPTStore.getState().updateElement(pageId, elementId, updates);
  };

  setElementInfo = (pageId: string, elementId: string, element: any) => {
    usePPTStore.getState().setElementInfo(pageId, elementId, element);
  };

  getElement = (pageId: string, elementId: string) => {
    return usePPTStore.getState().getElement(pageId, elementId);
  };

  getElementInfo = (pageId: string, elementId: string) => {
    return usePPTStore.getState().getElementInfo(pageId, elementId);
  };

  getAllElementInfo = (pageId: string) => {
    return usePPTStore.getState().getAllElementInfo(pageId);
  };

  removeElementInfo = (pageId: string, elementId: string) => {
    usePPTStore.getState().removeElementInfo(pageId, elementId);
  };

  setGridType = (type: "grid" | "line" | "none") => {
    usePPTStore.getState().setGridType(type);
  };

  getGridType = () => {
    return usePPTStore.getState().getGridType();
  };

  setGridSize = (size: number) => {
    usePPTStore.getState().setGridSize(size);
  };

  getGridSize = () => {
    return usePPTStore.getState().getGridSize();
  };

  setGuideLineShow = (show: boolean) => {
    usePPTStore.getState().setGuideLineShow(show);
  };

  getGuideLineShow = () => {
    return usePPTStore.getState().getGuideLineShow();
  };

  setName = (name: string) => {
    usePPTStore.getState().setName(name);
  };

  getName = () => {
    return usePPTStore.getState().getName();
  };

  setRule = (rule: boolean) => {
    usePPTStore.getState().setRule(rule);
  };

  getRule = () => {
    return usePPTStore.getState().getRule();
  };

  setVerticalLine = (lines: number[]) => {
    usePPTStore.getState().setVerticalLine(lines);
  };

  getVerticalLine = () => {
    return usePPTStore.getState().getVerticalLine();
  };

  setHorizontalLine = (lines: number[]) => {
    usePPTStore.getState().setHorizontalLine(lines);
  };

  getHorizontalLine = () => {
    return usePPTStore.getState().getHorizontalLine();
  };
}

// Export compatibility instances
export const pageActiveStore = new PageActiveStoreCompat();
export const pptStore = new PPTStoreCompat();
