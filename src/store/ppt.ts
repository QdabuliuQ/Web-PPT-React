import type { ITextProps } from "@/element/Text";
import { makeAutoObservable } from "mobx";

type IPage = Array<{
  id: string;
  elements: Array<ITextProps>;
}>;

interface IPPT {
  pages: IPage;
}

class PPTStore {
  pptInfo: IPPT = {
    pages: [],
  };

  constructor() {
    makeAutoObservable(this);
  }

  setPages = (pages: IPage) => {
    this.pptInfo.pages = pages;
    this.pptInfo = { ...this.pptInfo };
  };

  getPages = () => {
    return this.pptInfo.pages;
  };

  resetPages = () => {
    this.pptInfo.pages = [];
    this.pptInfo = { ...this.pptInfo };
  };

  setElementInfo(pageId: string, elementId: string, elementInfo: ITextProps) {
    // 找到页面
    const pageIndex = this.pptInfo.pages.findIndex(
      (page) => page.id === pageId
    );
    if (pageIndex === -1) return;

    // 找到元素
    const elementIndex = this.pptInfo.pages[pageIndex].elements.findIndex(
      (element) => element.id === elementId
    );
    if (elementIndex === -1) return;

    // 创建新的 pages 数组，触发响应式更新
    const newPages = [...this.pptInfo.pages];
    newPages[pageIndex] = {
      ...newPages[pageIndex],
      elements: [...newPages[pageIndex].elements],
    };
    newPages[pageIndex].elements[elementIndex] = { ...elementInfo };

    this.pptInfo = {
      ...this.pptInfo,
      pages: newPages,
    };
  }

  addElementInfo(pageId: string, elementInfo: ITextProps) {
    const pageIndex = this.pptInfo.pages.findIndex(
      (page) => page.id === pageId
    );
    if (pageIndex === -1) return;

    // 创建新的 pages 数组，触发响应式更新
    const newPages = [...this.pptInfo.pages];
    newPages[pageIndex] = {
      ...newPages[pageIndex],
      elements: [...newPages[pageIndex].elements, elementInfo],
    };

    this.pptInfo = {
      ...this.pptInfo,
      pages: newPages,
    };
  }

  getElementInfo(pageId: string, elementId: string) {
    for (let i = 0; i < this.pptInfo.pages.length; i++) {
      if (this.pptInfo.pages[i].id === pageId) {
        return this.pptInfo.pages[i].elements.find(
          (element) => element.id === elementId
        );
      }
    }
    return null;
  }
}

export const pptStore = new PPTStore();
