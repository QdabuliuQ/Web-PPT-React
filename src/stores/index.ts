import { create, StoreApi } from 'zustand'
import { devtools } from 'zustand/middleware'

import {
  type ActiveCanvasState,
  createActiveCanvasStore
} from './activeCanvasStore'
import {
  type ActiveElementState,
  createActiveElementStore
} from './activeElementStore'
import {
  type ActivePanelState,
  createActivePanelStore
} from './activePanelStore'
import { type CanvasState, createCanvasStore } from './canvasStore'
import { createInstanceStore, type InstanceState } from './instanceStore'
import { createModeStore, type ModeState } from './modeStore'
import { createRemarkStore, type RemarkState } from './remarkStore'

type Store = ActivePanelState &
  CanvasState &
  ActiveCanvasState &
  ActiveElementState &
  InstanceState &
  RemarkState &
  ModeState

const useStore = create(
  devtools((set: StoreApi<Store>['setState']) => ({
    ...createActivePanelStore(set),
    ...createCanvasStore(set),
    ...createActiveCanvasStore(set),
    ...createActiveElementStore(set),
    ...createInstanceStore(set),
    ...createRemarkStore(set),
    ...createModeStore(set)
  }))
)

export default useStore
