import type { StoreApi } from "zustand"

export namespace CanvasStore {
  export interface Canvas {
    id: string
    fabricOption: any
  }
}

export interface CanvasState {
  canvas: Array<CanvasStore.Canvas>

  canvasPush: (canvas: CanvasStore.Canvas) => void

  canvasInsert: (canvas: CanvasStore.Canvas, index: number) => void
}

export const createCanvasStore = (set: StoreApi<CanvasState>["setState"]): CanvasState => {
  return {
    canvas: [],

    canvasPush(canvas: CanvasStore.Canvas) {
      return set((state) => {
        return {
          canvas: [
            ...state.canvas,
            canvas
          ]
        }
      })
    },

    canvasInsert(canvas: CanvasStore.Canvas, index: number) {
      return set((state) => {
        if (index > state.canvas.length) {
          return state
        }
        state.canvas.splice(index, 0, canvas)
        return {
          canvas: [
            ...state.canvas,
          ]
        }
      })
    }
  }
}
