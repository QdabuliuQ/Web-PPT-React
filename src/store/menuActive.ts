import { makeAutoObservable } from 'mobx';

class MenuActiveStore {
  // 当前激活的菜单项
  activeMenu: string = 'start';

  constructor() {
    makeAutoObservable(this);
  }

  // 设置激活的菜单
  setActiveMenu = (menu: string) => {
    this.activeMenu = menu;
  };

  // 检查菜单是否激活
  isActive = (menu: string) => {
    return this.activeMenu === menu;
  };

  // 重置菜单状态
  resetMenu = () => {
    this.activeMenu = 'start';
  };
}

export const menuActiveStore = new MenuActiveStore();
