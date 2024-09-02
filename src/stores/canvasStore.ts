import { Fabric } from '@/types/fabirc';
import type { StoreApi } from 'zustand';

export namespace CanvasStore {
  export interface Canvas {
    id: string;
    fabricOption: Fabric.JSON;
  }
}

export interface CanvasState {
  canvas: Array<CanvasStore.Canvas>;

  canvasPush: (canvas: CanvasStore.Canvas) => void;

  canvasInsert: (canvas: CanvasStore.Canvas, index: number) => void;

  canvasInit: (canvas: Array<CanvasStore.Canvas>) => void;

  canvasUpdate: (fabricOption: Fabric.JSON, id: string) => void;
}

export const createCanvasStore = (set: StoreApi<CanvasState>['setState']): CanvasState => {
  return {
    canvas: [],

    canvasPush(canvas: CanvasStore.Canvas) {
      return set((state) => {
        return {
          canvas: [...state.canvas, canvas],
        };
      });
    },

    canvasInsert(canvas: CanvasStore.Canvas, index: number) {
      return set((state) => {
        if (index > state.canvas.length) {
          return state;
        }
        state.canvas.splice(index, 0, canvas);
        return {
          canvas: [...state.canvas],
        };
      });
    },

    canvasInit(canvas: Array<CanvasStore.Canvas>) {
      return set(() => {
        return {
          canvas,
        };
      });
    },

    canvasUpdate(fabricOption: Fabric.JSON, id: string) {
      return set((state) => {
        for (let i = 0; i < state.canvas.length; i++) {
          if (state.canvas[i].id === id) {
            console.log(fabricOption, id, '===');

            state.canvas[i].fabricOption = fabricOption;
            return {
              canvas: [...state.canvas],
            };
          }
        }
        return state;
      });
    },
  };
};
