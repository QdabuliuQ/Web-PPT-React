export interface ICommonElementProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  zIndex: number;
  mode: "preview" | "play" | "edit";
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
