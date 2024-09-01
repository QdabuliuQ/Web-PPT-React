import { StoreApi, create } from "zustand"
import { devtools } from "zustand/middleware"
import { createActivePanelStore, type ActivePanelState } from "./activePanelStore"
import { type CanvasState, createCanvasStore } from "./canvasStore"
import { type ActiveCanvasState, createActiveCanvasStore } from "./activeCanvasStore"

type Store = ActivePanelState & CanvasState & ActiveCanvasState

const useStore = create(
  devtools((set: StoreApi<Store>["setState"]) => ({
    ...createActivePanelStore(set),
    ...createCanvasStore(set),
    ...createActiveCanvasStore(set)
  })),
)

export default useStore
