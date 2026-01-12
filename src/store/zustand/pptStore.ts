import type { IChartProps } from "@/element/Chart";
import type { IIconProps } from "@/element/Icon";
import type { IImageProps } from "@/element/Image";
import type { ITableProps } from "@/element/Table";
import type { ITextProps } from "@/element/Text";
import type { IMindMapProps } from "@/types/element";
import { getRandomId } from "@/utils";
import { create } from "zustand";

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
  visible: boolean;
  toggleInAnimation: string;
  toggleInDuration: string;
  toggleInDelay: string;
  autoToggle: boolean;
  autoToggleTime: number;
  backgroundType: string;
  background: string;
  bgColor: string;
  fgColor: string;
  bgOpacity: number;
  remark: string;
};

type IPage = Array<Page>;

interface PPTState {
  name: string;
  gridSize: number;
  gridType: "grid" | "line" | "none";
  verticalLine: Array<number>;
  horizontalLine: Array<number>;
  rule: boolean;
  guideLineShow: boolean;
  keyboardToggle: boolean;
  pages: IPage;

  // Actions
  setKeyboardToggle: (value: boolean) => void;
  getKeyboardToggle: () => boolean;

  setGuideLineShow: (value: boolean) => void;
  getGuideLineShow: () => boolean;

  setGridType: (type: "grid" | "line" | "none") => void;
  getGridType: () => "grid" | "line" | "none";

  setGridSize: (value: number) => void;
  getGridSize: () => number;

  setVerticalLine: (lines: Array<number>) => void;
  getVerticalLine: () => Array<number>;

  setHorizontalLine: (lines: Array<number>) => void;
  getHorizontalLine: () => Array<number>;

  setRule: (value: boolean) => void;
  getRule: () => boolean;

  setName: (value: string) => void;
  getName: () => string;

  setPages: (pages: IPage) => void;
  getActivePage: (pageId: string) => Page | undefined;
  getPages: () => IPage;
  resetPages: () => void;

  addPage: (afterPageId?: string) => string;
  duplicatePage: (pageId: string) => string | null;
  deletePage: (pageId: string) => boolean;
  movePage: (pageId: string, direction: "up" | "down" | "first" | "last") => void;
  togglePageVisible: (pageId: string) => void;

  updatePageProperty: (
    pageId: string,
    property: keyof Page,
    value: any
  ) => void;

  // Element operations
  addElement: (pageId: string, element: Elements) => void;
  deleteElement: (pageId: string, elementId: string) => void;
  updateElement: (
    pageId: string,
    elementId: string,
    updates: Partial<Elements>
  ) => void;
  setElementInfo: (
    pageId: string,
    elementId: string,
    element: Elements
  ) => void;
  getElement: (pageId: string, elementId: string) => Elements | undefined;
  getElementInfo: (pageId: string, elementId: string) => Elements | null;
  getAllElementInfo: (pageId: string) => Elements[];
  removeElementInfo: (pageId: string, elementId: string) => void;
}

export const usePPTStore = create<PPTState>((set, get) => ({
  // Initial state
  name: "",
  gridSize: 20,
  gridType: "grid",
  verticalLine: [],
  horizontalLine: [],
  rule: true,
  guideLineShow: true,
  keyboardToggle: true,
  pages: [],

  // Keyboard toggle
  setKeyboardToggle: (value) => set({ keyboardToggle: value }),
  getKeyboardToggle: () => get().keyboardToggle,

  // Guide line show
  setGuideLineShow: (value) => set({ guideLineShow: value }),
  getGuideLineShow: () => get().guideLineShow,

  // Grid type
  setGridType: (type) => set({ gridType: type }),
  getGridType: () => get().gridType,

  // Grid size
  setGridSize: (value) => set({ gridSize: value }),
  getGridSize: () => get().gridSize,

  // Vertical line
  setVerticalLine: (lines) => set({ verticalLine: lines }),
  getVerticalLine: () => get().verticalLine,

  // Horizontal line
  setHorizontalLine: (lines) => set({ horizontalLine: lines }),
  getHorizontalLine: () => get().horizontalLine,

  // Rule
  setRule: (value) => set({ rule: value }),
  getRule: () => get().rule,

  // Name
  setName: (value) => set({ name: value }),
  getName: () => get().name,

  // Pages
  setPages: (pages) => set({ pages: [...pages] }),

  getActivePage: (pageId) => {
    return get().pages.find((page) => page.id === pageId);
  },

  getPages: () => get().pages,

  resetPages: () => set({ pages: [] }),

  // Add page
  addPage: (afterPageId?) => {
    const newPage: Page = {
      id: `page_${getRandomId()}`,
      elements: [],
      visible: true,
      toggleInAnimation: "backInLeft",
      toggleInDuration: "default",
      toggleInDelay: "0s",
      autoToggle: false,
      autoToggleTime: 5,
      backgroundType: "solidColor",
      background: "#fff",
      bgColor: "#e4e4e4",
      fgColor: "#9C92AC",
      bgOpacity: 0.4,
      remark: "",
    };

    const currentPages = get().pages;
    let newPages: IPage = [];

    if (afterPageId) {
      const index = currentPages.findIndex((page) => page.id === afterPageId);
      if (index !== -1) {
        newPages = [
          ...currentPages.slice(0, index + 1),
          newPage,
          ...currentPages.slice(index + 1),
        ];
      } else {
        newPages = [...currentPages, newPage];
      }
    } else {
      newPages = [...currentPages, newPage];
    }

    set({ pages: newPages });
    return newPage.id;
  },

  // Duplicate page
  duplicatePage: (pageId) => {
    const currentPages = get().pages;
    const pageIndex = currentPages.findIndex((page) => page.id === pageId);

    if (pageIndex === -1) return null;

    const originalPage = currentPages[pageIndex];

    // 深拷贝页面，生成新的 ID
    const duplicatedPage: Page = {
      ...originalPage,
      id: `page_${getRandomId()}`,
      elements: originalPage.elements.map((element) => ({
        ...element,
        id: `${element.type}_${getRandomId()}`,
      })),
    };

    // 在原页面后面插入复制的页面
    const newPages = [
      ...currentPages.slice(0, pageIndex + 1),
      duplicatedPage,
      ...currentPages.slice(pageIndex + 1),
    ];

    set({ pages: newPages });
    return duplicatedPage.id;
  },

  // Delete page
  deletePage: (pageId) => {
    const currentPages = get().pages;
    if (currentPages.length <= 1) return false;

    const newPages = currentPages.filter((page) => page.id !== pageId);
    set({ pages: newPages });
    return true;
  },

  // Move page
  movePage: (pageId, direction) => {
    const currentPages = get().pages;
    const index = currentPages.findIndex((page) => page.id === pageId);
    if (index === -1) return;

    const newPages = [...currentPages];
    const [movedPage] = newPages.splice(index, 1);

    if (direction === "up" && index > 0) {
      newPages.splice(index - 1, 0, movedPage);
    } else if (direction === "down" && index < currentPages.length - 1) {
      newPages.splice(index + 1, 0, movedPage);
    } else if (direction === "first") {
      newPages.unshift(movedPage);
    } else if (direction === "last") {
      newPages.push(movedPage);
    } else {
      // 如果方向不合法或无法移动，恢复原数组
      newPages.splice(index, 0, movedPage);
    }

    set({ pages: newPages });
  },

  // Toggle page visible
  togglePageVisible: (pageId) => {
    const currentPages = get().pages;
    const newPages = currentPages.map((page) =>
      page.id === pageId ? { ...page, visible: !page.visible } : page
    );
    set({ pages: newPages });
  },

  // Update page property
  updatePageProperty: (pageId, property, value) => {
    const currentPages = get().pages;
    const newPages = currentPages.map((page) =>
      page.id === pageId ? { ...page, [property]: value } : page
    );
    set({ pages: newPages });
  },

  // Add element
  addElement: (pageId, element) => {
    const currentPages = get().pages;
    const newPages = currentPages.map((page) =>
      page.id === pageId
        ? { ...page, elements: [...page.elements, element] }
        : page
    );
    set({ pages: newPages });
  },

  // Delete element
  deleteElement: (pageId, elementId) => {
    const currentPages = get().pages;
    const newPages = currentPages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            elements: page.elements.filter((el) => el.id !== elementId),
          }
        : page
    );
    set({ pages: newPages });
  },

  // Update element
  updateElement: (pageId, elementId, updates) => {
    const currentPages = get().pages;
    const newPages = currentPages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            elements: page.elements.map((el) =>
              el.id === elementId ? ({ ...el, ...updates } as Elements) : el
            ),
          }
        : page
    );
    set({ pages: newPages });
  },

  // Set element info
  setElementInfo: (pageId, elementId, element) => {
    const currentPages = get().pages;
    const newPages = currentPages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            elements: page.elements.map((el) =>
              el.id === elementId ? element : el
            ),
          }
        : page
    );
    set({ pages: newPages });
  },

  // Get element
  getElement: (pageId, elementId) => {
    const page = get().pages.find((p) => p.id === pageId);
    return page?.elements.find((el) => el.id === elementId);
  },

  // Get element info (alias for compatibility)
  getElementInfo: (pageId, elementId) => {
    const page = get().pages.find((p) => p.id === pageId);
    return page?.elements.find((el) => el.id === elementId) || null;
  },

  // Get all element info
  getAllElementInfo: (pageId) => {
    const page = get().pages.find((p) => p.id === pageId);
    return page?.elements || [];
  },

  // Remove element info (alias for compatibility)
  removeElementInfo: (pageId, elementId) => {
    get().deleteElement(pageId, elementId);
  },
}));
