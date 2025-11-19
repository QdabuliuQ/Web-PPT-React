import { MovableWrapper } from "@/components";
import { elementActiveStore } from "@/store";
import type { ICommonElementProps } from "@/types/element";
import { getRandomId } from "@/utils";
import { observer } from "mobx-react-lite";
import { memo, useEffect, useMemo, useRef, type FC } from "react";
import { useMovableElement } from "../../hooks/useMovableElement";
import styles from "./index.module.less";

export { ImageButtonComponent as ImageButton } from "./button";
export { ImagePanel, ImagePanelKey, ImagePanelTitle } from "./panel";

export interface IImageProps extends ICommonElementProps {
  type: "image";
  src: string; // 图片地址
  opacity: number; // 透明度 0-1
  borderRadius: number; // 圆角
  borderWidth: number; // 边框宽度
  borderColor: string; // 边框颜色
  borderStyle: "solid" | "dashed" | "dotted"; // 边框样式
}

const Component: FC<IImageProps> = observer((props) => {
  const {
    mode = "edit",
    id,
    src,
    opacity,
    borderRadius,
    borderWidth,
    borderColor,
    borderStyle,
    x,
    y,
    width,
    height,
    rotate,
    zIndex,
    onSelect,
    onUnSelect,
  } = props;

  const imageRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<any>(null);

  // 使用通用的可移动元素hook
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
    onStateChange: (_dragging) => {
      // 拖拽结束时不需要手动设置 transform，由 dynamicStyle 控制
    },
    onMoveableRefresh: () => {
      // 刷新 Moveable 位置
      if (moveableRef.current) {
        moveableRef.current.updateRect();
      }
    },
  });

  const isSelected = elementActiveStore.isElementActive(id);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 立即激活元素
    if (!isSelected) {
      onSelect?.();
    }
  };

  // 处理单击事件 - 激活元素
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  useEffect(() => {
    if (mode === "edit" && !isSelected) {
      onUnSelect?.();
    }
  }, [isSelected, mode, onUnSelect]);

  // 动态样式（位置、大小等）
  const dynamicStyle = useMemo(
    () => ({
      width,
      height,
      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
      zIndex,
      cursor: isSelected ? "move" : "pointer",
    }),
    [x, y, width, height, rotate, zIndex, isSelected]
  );

  // 图片样式
  const imageStyle = useMemo(
    () => ({
      width: "100%",
      height: "100%",
      objectFit: "fill" as const,
      opacity,
      borderRadius: `${borderRadius}px`,
      border: `${borderWidth}px ${borderStyle} ${borderColor}`,
      boxSizing: "border-box" as const,
      userSelect: "none" as const,
      pointerEvents: "none" as const,
    }),
    [opacity, borderRadius, borderWidth, borderStyle, borderColor]
  );

  // 组合CSS类名
  const className = [
    styles.imageElement,
    isDragging ? styles.dragging : "",
    isSelected ? styles.selected : "",
  ]
    .filter(Boolean)
    .join(" ");

  return mode === "edit" ? (
    <>
      <div
        ref={imageRef}
        id={id}
        className={className}
        style={dynamicStyle}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <img src={src} alt="" style={imageStyle} draggable={false} />
      </div>
      <MovableWrapper
        ref={moveableRef}
        id={id}
        active={isSelected}
        bounds={{ left: 0, top: 0, right: 1000, bottom: 700 }}
        x={x}
        y={y}
        width={width}
        height={height}
        rotate={rotate}
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
      <img src={src} alt="" style={imageStyle} draggable={false} />
    </div>
  );
});

export const Image = memo(Component);

export const CreateImage = (props: Partial<IImageProps> = {}) => {
  const defaultProps: Omit<IImageProps, "type" | "id"> = {
    mode: "edit",
    src: "https://via.placeholder.com/300x200",
    opacity: 1,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "#000000",
    borderStyle: "solid",
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    rotate: 0,
    zIndex: 0,
  };
  return {
    ...defaultProps,
    ...props,
    id: `image_${getRandomId()}`,
    type: "image" as const,
  };
};
