import type { MenuItem } from "@/hooks/useContextMenu";
import { makeAutoObservable } from "mobx";

interface ContextMenuPosition {
  x: number;
  y: number;
}

class ContextMenuStore {
  menuItems: MenuItem[] = [];
  position: ContextMenuPosition | null = null;
  visible = false;

  constructor() {
    makeAutoObservable(this);
  }

  // 显示右键菜单
  showMenu = (items: MenuItem[], event: React.MouseEvent) => {
    this.menuItems = items;
    this.position = {
      x: event.clientX,
      y: event.clientY,
    };
    this.visible = true;
  };

  // 隐藏右键菜单
  hideMenu = () => {
    this.visible = false;
    this.menuItems = [];
    this.position = null;
  };

  // 获取菜单项
  getMenuItems = () => {
    return this.menuItems;
  };

  // 获取位置
  getPosition = () => {
    return this.position;
  };

  // 是否可见
  isVisible = () => {
    return this.visible;
  };
}

export const contextMenuStore = new ContextMenuStore();
