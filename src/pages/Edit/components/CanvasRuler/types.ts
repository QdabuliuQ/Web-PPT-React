export interface Props {
  canvasWidth: number;
  canvasHeight: number;
  children: JSX.Element;
}

export interface CanvasRulerRef {
  updateScale: (scale?: number) => void;
  initPosition: () => void;
  scaleUp: () => void;
  scaleDown: () => void;
  setGuideLines: (direction: 'vertical' | 'horizontal', lines: Array<number>) => void;
}
