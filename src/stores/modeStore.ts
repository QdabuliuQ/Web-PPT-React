import type { StoreApi } from 'zustand'

export interface ModeState {
  mode: 'view' | 'list'

  modeUpdate: (mode: 'view' | 'list') => void
}

export const createModeStore = (
  set: StoreApi<ModeState>['setState']
): ModeState => {
  return {
    mode: 'list',

    modeUpdate(mode: 'view' | 'list') {
      return set(() => {
        return {
          mode
        }
      })
    }
  }
}
