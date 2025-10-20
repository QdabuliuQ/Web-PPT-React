import type { ITableProps } from "@/element/Table";
import type { ITextProps } from "@/element/Text";
import type { PlacementMapped } from "@/element/Text/constant";
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

  addElementInfo(pageId: string, elementInfo: ITextProps | ITableProps) {
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

  removeElementInfo = (pageId: string, elementId: string) => {
    const pageIndex = this.pptInfo.pages.findIndex(
      (page) => page.id === pageId
    );
    if (pageIndex === -1) return;

    const oldPage = this.pptInfo.pages[pageIndex];
    const newElements = oldPage.elements.filter((el) => el.id !== elementId);

    const newPages = [...this.pptInfo.pages];
    newPages[pageIndex] = { ...oldPage, elements: newElements };

    this.pptInfo = {
      ...this.pptInfo,
      pages: newPages,
    };
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
      backgroundColor: "transparent",
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
