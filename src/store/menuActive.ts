import { makeAutoObservable } from "mobx";

class MenuActiveStore {
  // 当前激活的菜单项
  menuActive: string = "start";

  constructor() {
    makeAutoObservable(this);
  }

  // 设置激活的菜单
  setActiveMenu = (menu: string) => {
    this.menuActive = menu;
  };

  // 检查菜单是否激活
  isActive = (menu: string) => {
    return this.menuActive === menu;
  };

  // 重置菜单状态
  resetMenu = () => {
    this.menuActive = "start";
  };

  getMenuActive = () => {
    return this.menuActive;
  };
}

export const menuActiveStore = new MenuActiveStore();
