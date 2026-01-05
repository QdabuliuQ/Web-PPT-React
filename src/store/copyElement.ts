import type { IChartProps } from "@/element/Chart";
import type { IIconProps } from "@/element/Icon";
import type { IImageProps } from "@/element/Image";
import type { IMindMapProps } from "@/element/MindMap";
import type { ITableProps } from "@/element/Table";
import type { ITextProps } from "@/element/Text";
import { cloneDeep } from "@/utils";
import { makeAutoObservable } from "mobx";

type CopiedElement =
  | ITextProps
  | ITableProps
  | IIconProps
  | IImageProps
  | IMindMapProps
  | IChartProps
  | null;

class CopyElementStore {
  copiedElement: CopiedElement = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCopiedElement = (element: CopiedElement) => {
    // 存储深拷贝，避免外部修改影响暂存副本
    this.copiedElement = element
      ? (cloneDeep(element) as Exclude<CopiedElement, null>)
      : null;
  };

  getCopiedElement = (): Exclude<CopiedElement, null> | null => {
    // 取出时也返回副本，避免调用方意外修改内部状态
    return this.copiedElement
      ? (cloneDeep(this.copiedElement) as Exclude<CopiedElement, null>)
      : null;
  };

  clearCopiedElement = () => {
    this.copiedElement = null;
  };

  hasCopiedElement = () => {
    return this.copiedElement !== null;
  };
}

export const copyElementStore = new CopyElementStore();
