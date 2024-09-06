import type { StoreApi } from 'zustand';

export interface InstanceState {
  instance: fabric.Canvas | null;

  instanceUpdate: (instance: fabric.Canvas) => void;
}

export const createInstanceStore = (set: StoreApi<InstanceState>['setState']): InstanceState => {
  return {
    instance: null,

    instanceUpdate(instance: fabric.Canvas | null) {
      return set(() => {
        return {
          instance,
        };
      });
    },
  };
};
