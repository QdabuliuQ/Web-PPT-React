import type { StoreApi } from 'zustand'

import { Fabric } from '@/types/fabirc'

interface Int extends fabric.Canvas {
  _objects: Array<Fabric.Object>
}

export interface InstanceState {
  instance: Int | null

  instanceUpdate: (instance: Int) => void
}

export const createInstanceStore = (
  set: StoreApi<InstanceState>['setState']
): InstanceState => {
  return {
    instance: null,

    instanceUpdate(instance: Int | null) {
      return set(() => {
        return {
          instance
        }
      })
    }
  }
}
