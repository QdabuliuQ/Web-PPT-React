import type { StoreApi } from 'zustand'

export interface ActivePanelState {
  activePanel: string

  activePanelUpdate: (activePanel: string) => void
}

export const createActivePanelStore = (
  set: StoreApi<ActivePanelState>['setState']
): ActivePanelState => {
  return {
    activePanel: 'start',

    activePanelUpdate(activePanel: string) {
      return set(() => {
        return {
          activePanel
        }
      })
    }
  }
}
