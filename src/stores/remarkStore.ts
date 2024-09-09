import type { StoreApi } from 'zustand';

export interface RemarkState {
  remark: boolean;

  remarkUpdate: (remark: boolean) => void;
}

export const createRemarkStore = (set: StoreApi<RemarkState>['setState']): RemarkState => {
  return {
    remark: false,

    remarkUpdate(remark: boolean) {
      return set(() => {
        return {
          remark,
        };
      });
    },
  };
};
