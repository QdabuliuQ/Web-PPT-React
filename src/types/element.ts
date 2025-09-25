export interface ICommonElementProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  zIndex: number;
  onSelect?: () => void;
  onUnSelect?: () => void;
}
