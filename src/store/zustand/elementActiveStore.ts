import { create } from "zustand";

interface ElementActiveState {
  elementActive: string | null;
  
  setElementActive: (elementActive: string | null) => void;
  getElementActive: () => string | null;
  isElementActive: (elementActive: string) => boolean;
  resetElementActive: () => void;
}

export const useElementActiveStore = create<ElementActiveState>((set, get) => ({
  elementActive: null,

  setElementActive: (elementActive) => set({ elementActive }),
  
  getElementActive: () => get().elementActive,
  
  isElementActive: (elementActive) => get().elementActive === elementActive,
  
  resetElementActive: () => set({ elementActive: null }),
}));

// Compatibility class
class ElementActiveStoreCompat {
  setElementActive = (elementActive: string | null) => {
    useElementActiveStore.getState().setElementActive(elementActive);
  };
  
  getElementActive = () => {
    return useElementActiveStore.getState().getElementActive();
  };
  
  isElementActive = (elementActive: string) => {
    return useElementActiveStore.getState().isElementActive(elementActive);
  };
  
  resetElementActive = () => {
    useElementActiveStore.getState().resetElementActive();
  };
}

export const elementActiveStore = new ElementActiveStoreCompat();
