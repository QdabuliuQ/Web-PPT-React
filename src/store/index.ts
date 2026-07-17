// Export all Zustand stores (new)
export {
  usePPTStore,
  usePageActiveStore,
  useElementActiveStore,
  useContextMenuStore,
  useFullscreenStore,
  useDisplayStatusStore,
  useElementHoverActiveStore,
  useMenuActiveStore,
  useRemarkEditActiveStore,
  useCopyElementStore,
  useCanvasZoomStore,
} from "./zustand";

export type { Page, Elements } from "./zustand";

// Export compatibility layers (for gradual migration)
export {
  pageActiveStore,
  pptStore,
  elementActiveStore,
  contextMenuStore,
  fullscreenStore,
  displayStatusStore,
  elementHoverActiveStore,
  menuActiveStore,
  remarkEditActiveStore,
  copyElementStore,
} from "./zustand";
