import type { StoreApi } from 'zustand'

export interface ActiveElementState {
  activeElement: string

  activeElementUpdate: (activeElement: string) => void
}

export const createActiveElementStore = (
  set: StoreApi<ActiveElementState>['setState']
): ActiveElementState => {
  return {
    activeElement: '',

    activeElementUpdate(activeElement: string) {
      return set(() => {
        return {
          activeElement
        }
      })
    }
  }
}
