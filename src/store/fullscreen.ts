import { makeAutoObservable } from "mobx";

class FullscreenStore {
  isFullscreen = false;
  // 全屏幻灯片当前播放的页面ID（与编辑模式的 pageActive 分离）
  currentSlidePageId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // 设置全屏状态
  setFullscreen(status: boolean) {
    this.isFullscreen = status;
  }

  // 进入全屏（从指定页面开始）
  enterFullscreen(startPageId?: string) {
    this.isFullscreen = true;
    if (startPageId) {
      this.currentSlidePageId = startPageId;
    }
  }

  // 退出全屏
  exitFullscreen() {
    this.isFullscreen = false;
    // 退出时不清空 currentSlidePageId，保留用户上次播放的位置
  }

  // 切换全屏状态
  toggleFullscreen(startPageId?: string) {
    if (this.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen(startPageId);
    }
  }

  // 获取全屏状态
  getFullscreen() {
    return this.isFullscreen;
  }

  // 设置当前幻灯片页面ID
  setCurrentSlidePageId(pageId: string) {
    this.currentSlidePageId = pageId;
  }

  // 获取当前幻灯片页面ID
  getCurrentSlidePageId() {
    return this.currentSlidePageId;
  }
}

export const fullscreenStore = new FullscreenStore();
