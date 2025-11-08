import { makeAutoObservable } from "mobx";

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
}

export const pageActiveStore = new PageActiveStore();
