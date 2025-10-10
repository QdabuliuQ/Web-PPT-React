import type { ITableProps } from "@/element/Table";
import type { ITextProps } from "@/element/Text";
import { makeAutoObservable } from "mobx";

type IPage = Array<{
  id: string;
  elements: Array<ITextProps | ITableProps>;
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

  setElementInfo(
    pageId: string,
    elementId: string,
    elementInfo: ITextProps | ITableProps
  ) {
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

  getAllElementInfo(pageId: string) {
    return (
      this.pptInfo.pages.find((page) => page.id === pageId)?.elements || []
    );
  }

  updateTableCells = (
    pageId: string,
    elementId: string,
    selectedCells: Set<string>,
    operation: string,
    value?: any
  ) => {
    const element = this.getElementInfo(pageId, elementId) as ITableProps;
    if (!element || !element.dataSource) return;

    // 深拷贝 dataSource
    const newDataSource = element.dataSource.map((row) =>
      row.map((cell) => ({ ...cell }))
    );

    // 获取选中的单元格范围
    const cellIndexs = Array.from(selectedCells).sort(
      (a: string, b: string) => {
        const [rowIndex1, colIndex1] = a.split("-").map(Number);
        const [rowIndex2, colIndex2] = b.split("-").map(Number);
        return rowIndex1 - rowIndex2 || colIndex1 - colIndex2;
      }
    );

    if (cellIndexs.length === 0) return;

    const [rowStartIndex, colStartIndex] = cellIndexs[0].split("-").map(Number);
    const [rowEndIndex, colEndIndex] = cellIndexs[cellIndexs.length - 1]
      .split("-")
      .map(Number);

    // 更新选中的单元格
    for (let i = rowStartIndex; i <= rowEndIndex; i++) {
      for (let j = colStartIndex; j <= colEndIndex; j++) {
        const cell = newDataSource[i][j] as any;
        if (
          operation === "bold" ||
          operation === "italic" ||
          operation === "underline" ||
          operation === "strikethrough"
        ) {
          cell[operation] = !cell[operation];
        } else if (value === "add" || value === "decrease") {
          const currentValue = cell[operation] || 14;
          const newValue = currentValue + (value === "add" ? 1 : -1);
          cell[operation] = Math.max(12, Math.min(50, newValue));
        } else {
          cell[operation] = value;
        }
      }
    }

    // 使用现有的 setElementInfo 方法更新整个元素
    this.setElementInfo(pageId, elementId, {
      ...element,
      dataSource: newDataSource,
    });
  };
}

export const pptStore = new PPTStore();
