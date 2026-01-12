import { create } from "zustand";

// Display Status Store
interface DisplayStatusState {
  displayStatus: "default" | "grid";
  setDisplayStatus: (status: "default" | "grid") => void;
  getDisplayStatus: () => "default" | "grid";
}

export const useDisplayStatusStore = create<DisplayStatusState>((set, get) => ({
  displayStatus: "default",
  setDisplayStatus: (status) => set({ displayStatus: status }),
  getDisplayStatus: () => get().displayStatus,
}));

class DisplayStatusStoreCompat {
  setDisplayStatus = (status: "default" | "grid") => {
    useDisplayStatusStore.getState().setDisplayStatus(status);
  };
  getDisplayStatus = () => {
    return useDisplayStatusStore.getState().getDisplayStatus();
  };
}

export const displayStatusStore = new DisplayStatusStoreCompat();

// Element Hover Active Store
interface ElementHoverActiveState {
  elementHoverActive: string | null;
  setElementHoverActive: (elementHoverActive: string | null) => void;
  getElementHoverActive: () => string | null;
  resetElementHoverActive: () => void;
  isElementHoverActive: (elementHoverActive: string) => boolean;
}

export const useElementHoverActiveStore = create<ElementHoverActiveState>(
  (set, get) => ({
    elementHoverActive: null,
    setElementHoverActive: (elementHoverActive) => set({ elementHoverActive }),
    getElementHoverActive: () => get().elementHoverActive,
    resetElementHoverActive: () => set({ elementHoverActive: null }),
    isElementHoverActive: (elementHoverActive) =>
      get().elementHoverActive === elementHoverActive,
  })
);

class ElementHoverActiveStoreCompat {
  setElementHoverActive = (elementHoverActive: string | null) => {
    useElementHoverActiveStore
      .getState()
      .setElementHoverActive(elementHoverActive);
  };
  getElementHoverActive = () => {
    return useElementHoverActiveStore.getState().getElementHoverActive();
  };
  resetElementHoverActive = () => {
    useElementHoverActiveStore.getState().resetElementHoverActive();
  };
  isElementHoverActive = (elementHoverActive: string) => {
    return useElementHoverActiveStore
      .getState()
      .isElementHoverActive(elementHoverActive);
  };
}

export const elementHoverActiveStore = new ElementHoverActiveStoreCompat();

// Menu Active Store
interface MenuActiveState {
  menuActive: string | null;
  setMenuActive: (menuActive: string | null) => void;
  getMenuActive: () => string | null;
  resetMenu: () => void;
  setActiveMenu: (menuActive: string | null) => void;
  isActive: (menuActive: string) => boolean;
}

export const useMenuActiveStore = create<MenuActiveState>((set, get) => ({
  menuActive: "start",
  setMenuActive: (menuActive) => set({ menuActive }),
  getMenuActive: () => get().menuActive,
  resetMenu: () => set({ menuActive: "start" }),
  setActiveMenu: (menuActive) => set({ menuActive }),
  isActive: (menuActive) => get().menuActive === menuActive,
}));

class MenuActiveStoreCompat {
  get menuActive() {
    return useMenuActiveStore.getState().menuActive;
  }

  setMenuActive = (menuActive: string | null) => {
    useMenuActiveStore.getState().setMenuActive(menuActive);
  };
  getMenuActive = () => {
    return useMenuActiveStore.getState().getMenuActive();
  };
  resetMenu = () => {
    console.log("resetMenu");
    useMenuActiveStore.getState().resetMenu();
  };
  setActiveMenu = (menuActive: string | null) => {
    useMenuActiveStore.getState().setActiveMenu(menuActive);
  };
  isActive = (menuActive: string) => {
    return useMenuActiveStore.getState().isActive(menuActive);
  };
}

export const menuActiveStore = new MenuActiveStoreCompat();

// Remark Edit Active Store
interface RemarkEditActiveState {
  remarkEditActive: boolean;
  setRemarkEditActive: (remarkEditActive: boolean) => void;
  getRemarkEditActive: () => boolean;
  toggleRemarkEditActive: () => void;
}

export const useRemarkEditActiveStore = create<RemarkEditActiveState>(
  (set, get) => ({
    remarkEditActive: false,
    setRemarkEditActive: (remarkEditActive) => set({ remarkEditActive }),
    getRemarkEditActive: () => get().remarkEditActive,
    toggleRemarkEditActive: () =>
      set({ remarkEditActive: !get().remarkEditActive }),
  })
);

class RemarkEditActiveStoreCompat {
  setRemarkEditActive = (remarkEditActive: boolean) => {
    useRemarkEditActiveStore.getState().setRemarkEditActive(remarkEditActive);
  };
  getRemarkEditActive = () => {
    return useRemarkEditActiveStore.getState().getRemarkEditActive();
  };
  toggleRemarkEditActive = () => {
    useRemarkEditActiveStore.getState().toggleRemarkEditActive();
  };
}

export const remarkEditActiveStore = new RemarkEditActiveStoreCompat();

// Copy Element Store
interface CopyElementState {
  copiedElement: any | null;
  setCopiedElement: (element: any | null) => void;
  getCopiedElement: () => any | null;
  clearCopiedElement: () => void;
  hasCopiedElement: () => boolean;
}

export const useCopyElementStore = create<CopyElementState>((set, get) => ({
  copiedElement: null,

  setCopiedElement: (element) => {
    // 使用简单的深拷贝
    const copied = element ? JSON.parse(JSON.stringify(element)) : null;
    set({ copiedElement: copied });
  },

  getCopiedElement: () => {
    const element = get().copiedElement;
    return element ? JSON.parse(JSON.stringify(element)) : null;
  },

  clearCopiedElement: () => set({ copiedElement: null }),

  hasCopiedElement: () => get().copiedElement !== null,
}));

class CopyElementStoreCompat {
  setCopiedElement = (element: any | null) => {
    useCopyElementStore.getState().setCopiedElement(element);
  };
  getCopiedElement = () => {
    return useCopyElementStore.getState().getCopiedElement();
  };
  clearCopiedElement = () => {
    useCopyElementStore.getState().clearCopiedElement();
  };
  hasCopiedElement = () => {
    return useCopyElementStore.getState().hasCopiedElement();
  };
}

export const copyElementStore = new CopyElementStoreCompat();
