import type { ITableProps } from "@/element/Table";
import type { ITextProps } from "@/element/Text";
import { makeAutoObservable } from "mobx";

class CopyElementStore {
  copiedElement: ITextProps | ITableProps | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCopiedElement = (element: ITextProps | ITableProps | null) => {
    // 存储深拷贝，避免外部修改影响暂存副本
    this.copiedElement = element
      ? (JSON.parse(JSON.stringify(element)) as ITextProps | ITableProps)
      : null;
  };

  getCopiedElement = (): (ITextProps | ITableProps) | null => {
    // 取出时也返回副本，避免调用方意外修改内部状态
    return this.copiedElement
      ? (JSON.parse(JSON.stringify(this.copiedElement)) as
          | ITextProps
          | ITableProps)
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
