import { AnimationWrapper, MovableWrapper } from "@/components";
import { getCenteredElementPosition } from "@/constants/canvas";
import useCommonContextMenu from "@/hooks/useCommonContextMenu";
import {
  contextMenuStore,
  elementHoverActiveStore,
  pageActiveStore,
  useElementActiveStore,
} from "@/store";
import type { ICommonElementProps } from "@/types/element";
import { getRandomId } from "@/utils";
import { GraphicDesign } from "@icon-park/react";
import { memo, useEffect, useMemo, useRef, type FC } from "react";
import { useMovableElement } from "../../hooks/useMovableElement";
import styles from "./index.module.less";
import { getShapeMenuItems } from "./menu";
import {
  ShapeSvg,
  borderDashArray,
  type ShapeType,
} from "./shapes";

export { ShapeButtonComponent as ShapeButton } from "./button";
export { getShapeMenuItems } from "./menu";
export { ShapePanel, ShapePanelKey, ShapePanelTitle } from "./panel";
export { SHAPE_TYPES, type ShapeType } from "./shapes";

export interface IShapeProps extends ICommonElementProps {
  type: "shape";
  shapeType: ShapeType;
  fill: string;
  border: boolean;
  borderWidth: number;
  borderColor: string;
  borderStyle: "solid" | "dashed" | "dotted" | "double";
  /** 圆角矩形圆角半径（px）；仅 shapeType=roundedRect 生效 */
  borderRadius: number;
  opacity: number;
}

const Component: FC<IShapeProps> = (props) => {
  const {
    mode = "edit",
    id,
    shapeType,
    fill,
    border,
    borderWidth,
    borderColor,
    borderStyle,
    borderRadius = 0,
    opacity,
    x,
    y,
    width,
    height,
    rotate,
    zIndex,
    animationName,
    animationDuration,
    animationDelay,
    animationTrigger,
    onSelect,
    onUnSelect,
  } = props;

  const effectiveBorderRadius =
    shapeType === "roundedRect"
      ? borderRadius > 0
        ? borderRadius
        : 14
      : 0;

  const shapeRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<any>(null);

  const {
    isDragging,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleResizeStart,
    handleResize,
    handleResizeEnd,
    handleRotateStart,
    handleRotate,
    handleRotateEnd,
  } = useMovableElement({
    id,
    props,
    onStateChange: () => {},
    onMoveableRefresh: () => {
      if (moveableRef.current) {
        moveableRef.current.updateRect();
      }
    },
  });

  const elementActive = useElementActiveStore((state) => state.elementActive);
  const isSelected = elementActive === id;
  const isHoverActive = elementHoverActiveStore.isElementHoverActive(id);
  const currentPageId = pageActiveStore.getPageActive() || "";
  const { commonMenu } = useCommonContextMenu(currentPageId, id);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSelected) {
      onSelect?.();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSelected) {
      onSelect?.();
    }
    const shapeMenuItems = getShapeMenuItems();
    contextMenuStore.showMenu(e.clientX, e.clientY, [
      ...shapeMenuItems,
      ...commonMenu,
    ]);
  };

  useEffect(() => {
    if (mode === "edit" && !isSelected) {
      onUnSelect?.();
    }
  }, [isSelected, mode, onUnSelect]);

  const dynamicStyle = useMemo(
    () => ({
      width,
      height,
      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
      zIndex,
      opacity,
      cursor: mode === "edit" ? (isSelected ? "move" : "pointer") : "default",
      border:
        mode === "edit" && isHoverActive && !isSelected
          ? "1px solid var(--primary-color, #f25f00)"
          : "none",
    }),
    [
      x,
      y,
      width,
      height,
      rotate,
      zIndex,
      opacity,
      isSelected,
      mode,
      isHoverActive,
    ]
  );

  const strokeWidth = border ? borderWidth : 0;
  const dash = border ? borderDashArray(borderStyle, borderWidth) : undefined;

  const className = [
    styles.shapeElement,
    mode === "edit" && isDragging ? styles.dragging : "",
    mode === "edit" && isSelected ? "element-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const shapeContent = (
    <ShapeSvg
      shapeType={shapeType}
      borderRadius={effectiveBorderRadius}
      width={width}
      height={height}
      fill={fill}
      stroke={borderColor}
      strokeWidth={strokeWidth}
      strokeDasharray={dash}
    />
  );

  return mode === "edit" ? (
    <>
      <div
        ref={shapeRef}
        id={id}
        className={className}
        style={dynamicStyle}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {shapeContent}
      </div>
      <MovableWrapper
        ref={moveableRef}
        id={id}
        active={isSelected}
        x={x}
        y={y}
        width={width}
        height={height}
        rotate={rotate}
        onSelect={onSelect}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        onRotateStart={handleRotateStart}
        onRotate={handleRotate}
        onRotateEnd={handleRotateEnd}
      />
    </>
  ) : (
    <div id={`preview_${id}`} className={className} style={dynamicStyle}>
      <AnimationWrapper
        mode={mode}
        elementId={id}
        animationName={animationName}
        animationDuration={animationDuration}
        animationDelay={animationDelay}
        animationTrigger={animationTrigger}
        className="w-full h-full"
      >
        {shapeContent}
      </AnimationWrapper>
    </div>
  );
};

export const Shape = memo(Component);
export const Name = "elements.shape.title";
export const ShapePanelIcon = GraphicDesign;

export const CreateShape = (props: Partial<IShapeProps> = {}) => {
  const width = props.width ?? 160;
  const height = props.height ?? 160;
  const defaultProps: Omit<IShapeProps, "type" | "id"> = {
    mode: "edit",
    shapeType: "rect",
    fill: "#5B8FF9",
    border: false,
    borderWidth: 2,
    borderColor: "#000000",
    borderStyle: "solid",
    borderRadius: 0,
    opacity: 1,
    ...getCenteredElementPosition(width, height),
    width,
    height,
    rotate: 0,
    zIndex: 0,
  };
  return {
    ...defaultProps,
    ...props,
    id: `shape_${getRandomId()}`,
    type: "shape" as const,
  };
};
