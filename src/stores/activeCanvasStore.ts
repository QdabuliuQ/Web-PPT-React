import type { StoreApi } from 'zustand';

export interface ActiveCanvasState {
  activeCanvas: string;

  activeCanvasUpdate: (activeCanvas: string) => void;
}

export const createActiveCanvasStore = (
  set: StoreApi<ActiveCanvasState>['setState']
): ActiveCanvasState => {
  return {
    activeCanvas: '',

    activeCanvasUpdate(activeCanvas: string) {
      return set(() => {
        return {
          activeCanvas,
        };
      });
    },
  };
};
