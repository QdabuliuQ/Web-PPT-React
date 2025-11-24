import { makeAutoObservable } from "mobx";
import { pptStore } from "./ppt";

class PageActiveStore {
  pageActive: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setPageActive = (pageActive: string | null) => {
    this.pageActive = pageActive;
  };

  getPageActive = () => {
    return this.pageActive;
  };

  isPageActive = (pageActive: string) => {
    return this.pageActive === pageActive;
  };

  resetPageActive = () => {
    this.pageActive = null;
  };

  getPageIndex = (pages: any[]) => {
    return pages.findIndex((page: any) => page.id === this.pageActive);
  };

  // 切换到上一页
  goToPrevPage = (): string | null => {
    const pages = pptStore.getPages();
    if (pages.length === 0) return null;

    const currentIndex = this.getPageIndex(pages);
    if (currentIndex === -1) {
      // 如果当前没有激活的页面，激活第一页
      const firstPageId = pages[0].id;
      this.setPageActive(firstPageId);
      return firstPageId;
    }

    if (currentIndex > 0) {
      // 切换到上一页
      const prevPageId = pages[currentIndex - 1].id;
      this.setPageActive(prevPageId);
      return prevPageId;
    }

    // 如果已经是第一页，返回当前页面 id
    return this.pageActive;
  };

  // 切换到下一页
  goToNextPage = (): string | null => {
    const pages = pptStore.getPages();
    if (pages.length === 0) return null;

    const currentIndex = this.getPageIndex(pages);
    if (currentIndex === -1) {
      // 如果当前没有激活的页面，激活第一页
      const firstPageId = pages[0].id;
      this.setPageActive(firstPageId);
      return firstPageId;
    }

    if (currentIndex < pages.length - 1) {
      // 切换到下一页
      const nextPageId = pages[currentIndex + 1].id;
      this.setPageActive(nextPageId);
      return nextPageId;
    }

    // 如果已经是最后一页，返回当前页面 id
    return this.pageActive;
  };
}

export const pageActiveStore = new PageActiveStore();
