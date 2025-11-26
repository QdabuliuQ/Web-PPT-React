export interface ICommonElementProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  zIndex: number;
  mode: "preview" | "play" | "edit";
  animationName?: string;
  animationDuration?: string;
  animationDelay?: string;
  animationTrigger?: "click" | "default";
  animationIndex?: number;
  onSelect?: () => void;
  onUnSelect?: () => void;
}

export interface IIconProps extends ICommonElementProps {
  type: "icon";
  iconName: string;
  fill: Array<string>;
  theme: "outline" | "filled" | "two-tone" | "multi-color";
  strokeWidth: number;
}

export interface IImageProps extends ICommonElementProps {
  type: "image";
  src: string;
  opacity: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  borderStyle: "solid" | "dashed" | "dotted";
}

export interface IMindMapProps extends ICommonElementProps {
  type: "mindmap";
  data?: any; // X6 数据格式 { nodes: [], edges: [] }
  readonly?: boolean; // 是否只读
}
