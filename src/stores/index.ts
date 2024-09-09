import { StoreApi, create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createActivePanelStore, type ActivePanelState } from './activePanelStore';
import { type CanvasState, createCanvasStore } from './canvasStore';
import { type ActiveCanvasState, createActiveCanvasStore } from './activeCanvasStore';
import { type ActiveElementState, createActiveElementStore } from './activeElementStore';
import { createInstanceStore, type InstanceState } from './instanceStore';
import { createRemarkStore, type RemarkState } from './remarkStore';
import { createModeStore, type ModeState } from './modeStore';

type Store = ActivePanelState &
  CanvasState &
  ActiveCanvasState &
  ActiveElementState &
  InstanceState &
  RemarkState &
  ModeState;

const useStore = create(
  devtools((set: StoreApi<Store>['setState']) => ({
    ...createActivePanelStore(set),
    ...createCanvasStore(set),
    ...createActiveCanvasStore(set),
    ...createActiveElementStore(set),
    ...createInstanceStore(set),
    ...createRemarkStore(set),
    ...createModeStore(set),
  }))
);

export default useStore;
