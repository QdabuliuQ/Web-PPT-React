import type { IChartProps } from "@/element/Chart";
import type { IIconProps } from "@/element/Icon";
import type { IImageProps } from "@/element/Image";
import type { ITableProps } from "@/element/Table";
import type { ITextProps } from "@/element/Text";
import type { PlacementMapped } from "@/element/Text/constant";
import type { IMindMapProps } from "@/types/element";
import { getRandomId } from "@/utils";
import { makeAutoObservable } from "mobx";

export type Elements =
  | ITextProps
  | ITableProps
  | IIconProps
  | IImageProps
  | IMindMapProps
  | IChartProps;
export type Page = {
  id: string;
  elements: Array<Elements>;
  visible?: boolean;
};

type IPage = Array<Page>;

class PPTStore {
  name: string = "";
  gridSize: number = 20;
  gridType: "grid" | "line" | "none" = "grid";
  verticalLine: Array<number> = [];
  horizontalLine: Array<number> = [];
  rule: boolean = true;
  guideLineShow: boolean = true;
  keyboardToggle: boolean = true;
  pages: IPage = [];

  constructor() {
    // 使用 deep: true 确保嵌套对象也是 observable
    makeAutoObservable(this, {}, { deep: true });
  }

  // keyboardToggle
  setKeyboardToggle = (value: boolean) => {
    this.keyboardToggle = value;
  };
  getKeyboardToggle = () => {
    return this.keyboardToggle;
  };

  // guideLineShow
  setGuideLineShow = (value: boolean) => {
    this.guideLineShow = value;
  };
  getGuideLineShow = () => {
    return this.guideLineShow;
  };

  // gridType（互斥控制网格/参考线）
  setGridType = (type: "grid" | "line" | "none") => {
    this.gridType = type;
  };
  getGridType = () => {
    return this.gridType;
  };

  // gridSize
  setGridSize = (value: number) => {
    this.gridSize = value;
  };
  getGridSize = () => {
    return this.gridSize;
  };

  // verticalLine
  setVerticalLine = (lines: Array<number>) => {
    this.verticalLine = lines;
  };
  getVerticalLine = () => {
    return this.verticalLine;
  };

  // horizontalLine
  setHorizontalLine = (lines: Array<number>) => {
    this.horizontalLine = lines;
  };
  getHorizontalLine = () => {
    return this.horizontalLine;
  };

  // rule
  setRule = (value: boolean) => {
    this.rule = value;
  };
  getRule = () => {
    return this.rule;
  };

  // name
  setName = (value: string) => {
    this.name = value;
  };
  getName = () => {
    return this.name;
  };

  setPages = (pages: IPage) => {
    // 确保创建新数组引用，触发 MobX 响应式更新
    this.pages = [...pages];
  };

  getActivePage = (pageId: string): Page | undefined => {
    return this.pages.find((page) => page.id === pageId);
  };

  getPages = () => {
    return this.pages;
  };

  resetPages = () => {
    this.pages = [];
  };

  // 添加新页面（插入到指定页面之后）
  addPage = (afterPageId?: string) => {
    const newPage: Page = {
      id: `page_${getRandomId()}`,
      elements: [],
    };

    let newPages: IPage;
    if (afterPageId) {
      // 找到指定页面的索引
      const index = this.pages.findIndex((page) => page.id === afterPageId);
      if (index !== -1) {
        // 插入到指定页面之后
        newPages = [
          ...this.pages.slice(0, index + 1),
          newPage,
          ...this.pages.slice(index + 1),
        ];
      } else {
        // 如果没找到，添加到末尾
        newPages = [...this.pages, newPage];
      }
    } else {
      // 没有指定位置，添加到末尾
      newPages = [...this.pages, newPage];
    }

    this.pages = newPages;
    return newPage.id;
  };

  // 删除页面
  deletePage = (pageId: string) => {
    // 至少保留一个页面
    if (this.pages.length <= 1) {
      return false;
    }

    const index = this.pages.findIndex((page) => page.id === pageId);
    if (index !== -1) {
      // 创建新数组，触发 MobX 响应式更新
      this.pages = [
        ...this.pages.slice(0, index),
        ...this.pages.slice(index + 1),
      ];
      return true;
    }

    return false;
  };

  // 复制页面（插入到指定页面之后）
  duplicatePage = (pageId: string) => {
    const pageIndex = this.pages.findIndex((page) => page.id === pageId);
    if (pageIndex === -1) return null;

    const originalPage = this.pages[pageIndex];

    // 深拷贝页面和元素
    const newPage: Page = {
      id: `page_${getRandomId()}`,
      elements: originalPage.elements.map((element) => ({
        ...element,
        id: `${element.id.split("_")[0]}_${getRandomId()}`,
      })),
    };

    // 创建新数组，触发 MobX 响应式更新
    this.pages = [
      ...this.pages.slice(0, pageIndex + 1),
      newPage,
      ...this.pages.slice(pageIndex + 1),
    ];

    return newPage.id;
  };

  // 移动页面
  movePage = (pageId: string, direction: "up" | "down" | "first" | "last") => {
    const pageIndex = this.pages.findIndex((page) => page.id === pageId);
    if (pageIndex === -1) return false;

    const page = this.pages[pageIndex];

    let newIndex = pageIndex;
    switch (direction) {
      case "up":
        newIndex = Math.max(0, pageIndex - 1);
        break;
      case "down":
        newIndex = Math.min(this.pages.length - 1, pageIndex + 1);
        break;
      case "first":
        newIndex = 0;
        break;
      case "last":
        newIndex = this.pages.length - 1;
        break;
    }

    // 如果位置没有变化，直接返回
    if (newIndex === pageIndex) return true;

    // 创建新数组，完全避免使用 splice，触发 MobX 响应式更新
    const pagesWithoutMoved = [
      ...this.pages.slice(0, pageIndex),
      ...this.pages.slice(pageIndex + 1),
    ];
    
    const newPages = [
      ...pagesWithoutMoved.slice(0, newIndex),
      page,
      ...pagesWithoutMoved.slice(newIndex),
    ];
    
    this.pages = newPages;

    return true;
  };

  // 切换页面可见性
  togglePageVisible = (pageId: string) => {
    const pageIndex = this.pages.findIndex((page) => page.id === pageId);
    if (pageIndex === -1) return false;

    // 创建新的 pages 数组和页面对象，触发 MobX 响应式更新
    const newPages = [...this.pages];
    const currentPage = newPages[pageIndex];
    const currentVisible = currentPage.visible;

    newPages[pageIndex] = {
      ...currentPage,
      visible: currentVisible === false ? true : false,
    };

    this.pages = newPages;

    return true;
  };

  setElementInfo(
    pageId: string,
    elementId: string,
    elementInfo:
      | ITextProps
      | ITableProps
      | IIconProps
      | IImageProps
      | IMindMapProps
      | IChartProps
  ) {
    // 找到页面
    const pageIndex = this.pages.findIndex((page) => page.id === pageId);
    if (pageIndex === -1) return;

    // 找到元素
    const elementIndex = this.pages[pageIndex].elements.findIndex(
      (element) => element.id === elementId
    );
    if (elementIndex === -1) return;

    // 创建新的 pages 数组，触发响应式更新
    const newPages = [...this.pages];
    newPages[pageIndex] = {
      ...newPages[pageIndex],
      elements: [...newPages[pageIndex].elements],
    };
    newPages[pageIndex].elements[elementIndex] = { ...elementInfo };

    this.pages = newPages;
  }

  addElementInfo(
    pageId: string,
    elementInfo:
      | ITextProps
      | ITableProps
      | IIconProps
      | IImageProps
      | IMindMapProps
      | IChartProps
  ) {
    const pageIndex = this.pages.findIndex((page) => page.id === pageId);
    if (pageIndex === -1) return;

    // 创建新的 pages 数组，触发响应式更新
    const newPages = [...this.pages];
    newPages[pageIndex] = {
      ...newPages[pageIndex],
      elements: [...newPages[pageIndex].elements, elementInfo],
    };

    this.pages = newPages;
  }

  getElementInfo(pageId: string, elementId: string) {
    for (let i = 0; i < this.pages.length; i++) {
      if (this.pages[i].id === pageId) {
        return this.pages[i].elements.find(
          (element) => element.id === elementId
        );
      }
    }
    return null;
  }

  getAllElementInfo(pageId: string) {
    return this.pages.find((page) => page.id === pageId)?.elements || [];
  }

  removeElementInfo = (pageId: string, elementId: string) => {
    const pageIndex = this.pages.findIndex((page) => page.id === pageId);
    if (pageIndex === -1) return;

    const oldPage = this.pages[pageIndex];
    const newElements = oldPage.elements.filter((el) => el.id !== elementId);

    const newPages = [...this.pages];
    newPages[pageIndex] = { ...oldPage, elements: newElements };

    this.pages = newPages;
  };

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

  // 插入表格行
  insertTableRow = (
    pageId: string,
    elementId: string,
    selectedCells: Set<string>,
    position: "above" | "below"
  ) => {
    const element = this.getElementInfo(pageId, elementId) as ITableProps;
    if (!element || !element.dataSource || selectedCells.size === 0) return;

    // 由于选中是连续的，直接找到边界单元格
    const cellKeys = Array.from(selectedCells).sort((a, b) => {
      const [rowA] = a.split("-").map(Number);
      const [rowB] = b.split("-").map(Number);
      return rowA - rowB;
    });

    // 获取选中范围的第一行和最后一行
    const [minRowIndex] = cellKeys[0].split("-").map(Number);
    const [maxRowIndex] = cellKeys[cellKeys.length - 1].split("-").map(Number);

    // 计算插入位置
    const insertIndex = position === "above" ? minRowIndex : maxRowIndex + 1;

    // 创建新行数据（基于第一行的结构，使用默认值）
    const firstRow = element.dataSource[0];
    const newRow = firstRow.map(() => ({
      fontSize: 14,
      color: "#333333",
      backgroundColor: "#fff",
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      value: "",
      placement: "left-top" as keyof typeof PlacementMapped,
    }));

    // 深拷贝 dataSource 并插入新行
    const newDataSource = [...element.dataSource];
    newDataSource.splice(insertIndex, 0, newRow);

    // 更新行高数组
    let newRowHeights = element.rowHeights
      ? [...element.rowHeights]
      : undefined;
    if (newRowHeights) {
      const avgHeight = 100 / newDataSource.length;
      newRowHeights.splice(insertIndex, 0, avgHeight);
      // 重新计算所有行高比例，保持总和为100
      const totalRows = newDataSource.length;
      newRowHeights = newRowHeights.map(() => 100 / totalRows);
    }

    // 更新表格元素
    this.setElementInfo(pageId, elementId, {
      ...element,
      dataSource: newDataSource,
      rowHeights: newRowHeights,
    });
  };

  // 插入表格列
  insertTableColumn = (
    pageId: string,
    elementId: string,
    selectedCells: Set<string>,
    position: "left" | "right"
  ) => {
    const element = this.getElementInfo(pageId, elementId) as ITableProps;
    if (!element || !element.dataSource || selectedCells.size === 0) return;

    // 由于选中是连续的，直接找到边界单元格
    const cellKeys = Array.from(selectedCells).sort((a, b) => {
      const [rowA, colA] = a.split("-").map(Number);
      const [rowB, colB] = b.split("-").map(Number);
      return rowA - rowB || colA - colB;
    });

    // 获取选中范围的第一列和最后一列
    const [, minColIndex] = cellKeys[0].split("-").map(Number);
    const [, maxColIndex] = cellKeys[cellKeys.length - 1]
      .split("-")
      .map(Number);

    // 计算插入位置
    const insertIndex = position === "left" ? minColIndex : maxColIndex + 1;

    // 创建新列数据（使用默认值）
    const newCellData = {
      fontSize: 14,
      color: "#333333",
      backgroundColor: "transparent",
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      value: "",
      placement: "left-top" as keyof typeof PlacementMapped,
    };

    // 深拷贝 dataSource 并在每一行中插入新列
    const newDataSource = element.dataSource.map((row) => {
      const newRow = [...row];
      newRow.splice(insertIndex, 0, newCellData);
      return newRow;
    });

    // 更新列宽数组
    let newColumnWidths = element.columnWidths ? [...element.columnWidths] : [];
    if (newColumnWidths.length > 0) {
      const avgWidth = 100 / (newColumnWidths.length + 1);
      newColumnWidths.splice(insertIndex, 0, avgWidth);
      // 重新计算所有列宽比例，保持总和为100
      const totalCols = newColumnWidths.length;
      newColumnWidths = newColumnWidths.map(() => 100 / totalCols);
    }

    // 更新表格元素
    this.setElementInfo(pageId, elementId, {
      ...element,
      dataSource: newDataSource,
      columnWidths: newColumnWidths,
    });
  };
}

export const pptStore = new PPTStore();
