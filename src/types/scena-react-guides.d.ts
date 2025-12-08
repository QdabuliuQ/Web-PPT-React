declare module "@scena/react-guides" {
  import * as React from "react";

  export interface GuidesProps {
    type?: "horizontal" | "vertical";
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
    unit?: number;
    zoom?: number;
    displayDragPos?: boolean;
    backgroundColor?: string;
    lineColor?: string;
    textOffset?: [number, number] | number;
    textColor?: string;
    font?: string;
    rulerStyle?: React.CSSProperties;
    guides?: number[];
    snaps?: number[];
    snapThreshold?: number;
    useResizeObserver?: boolean;
    showGuides?: boolean;
    onChangeGuides?: ({ guides }: { guides: number[] }) => void;
  }

  const Guides: React.FC<GuidesProps>;
  export default Guides;
}
