import { memo, type FC } from "react";
import Moveable from "react-moveable";
import styles from "./index.module.less";

export interface MovableWrapperProps {
  // 基础属性
  id: string;
  
  // 激活状态控制
  active?: boolean; // 是否激活（显示控制点）
  
  // 功能开关
  draggable?: boolean;
  resizable?: boolean;
  rotatable?: boolean;
  
  // 容器和边界
  containerSelector?: string;
  bounds?: { left: number; top: number; right: number; bottom: number };
  
  // 事件回调
  onDragStart?: () => void;
  onDrag?: (params: { x: number; y: number; transform: string }) => void;
  onDragEnd?: () => void;
  onResizeStart?: () => void;
  onResize?: (params: { width: number; height: number; transform: string }) => void;
  onResizeEnd?: () => void;
  onRotateStart?: () => void;
  onRotate?: (params: { rotate: number; transform: string }) => void;
  onRotateEnd?: () => void;
}

export const MovableWrapper: FC<MovableWrapperProps> = memo(({
  id,
  active = true, // 默认为激活状态
  draggable = true,
  resizable = true,
  rotatable = true,
  containerSelector = '#canvas-container',
  bounds,
  onDragStart,
  onDrag,
  onDragEnd,
  onResizeStart,
  onResize,
  onResizeEnd,
  onRotateStart,
  onRotate,
  onRotateEnd
}) => {

    // 拖拽事件处理
  const handleDragStart = () => {
    onDragStart?.();
  };

  const handleDrag = (e: {
    target: EventTarget;
    transform: string;
  }) => {
    const { target, transform } = e;
    (target as HTMLElement).style.transform = transform;
    
    if (onDrag) {
      // 提取位置信息
      const matrix = new DOMMatrix(transform);
      onDrag({
        x: matrix.m41,
        y: matrix.m42,
        transform
      });
    }
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  // 缩放事件处理
  const handleResizeStart = () => {
    onResizeStart?.();
  };

  const handleResize = (e: {
    target: EventTarget;
    width: number;
    height: number;
    transform: string;
  }) => {
    const { target, width, height, transform } = e;
    (target as HTMLElement).style.width = `${width}px`;
    (target as HTMLElement).style.height = `${height}px`;
    (target as HTMLElement).style.transform = transform;
    
    if (onResize) {
      onResize({ width, height, transform });
    }
  };

  const handleResizeEnd = () => {
    onResizeEnd?.();
  };

  // 旋转事件处理
  const handleRotateStart = () => {
    onRotateStart?.();
  };

  const handleRotate = (e: {
    target: EventTarget;
    transform: string;
  }) => {
    const { target, transform } = e;
    (target as HTMLElement).style.transform = transform;
    
    if (onRotate) {
      // 提取旋转角度信息
      const matrix = new DOMMatrix(transform);
      const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
      onRotate({ rotate: angle, transform });
    }
  };

  const handleRotateEnd = () => {
    onRotateEnd?.();
  };

  return (
    <Moveable
        target={active ? `#${id}` : null} // 根据激活状态控制target
        container={document.querySelector(containerSelector) as HTMLElement}
        className={styles.moveableWrapper}
        
        // 功能配置 - 只有在激活状态下才启用功能
        draggable={active && draggable}
        resizable={active && resizable}
        rotatable={active && rotatable}
        
        // 边界限制
        bounds={bounds}
        
        // 事件处理
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        onRotateStart={handleRotateStart}
        onRotate={handleRotate}
        onRotateEnd={handleRotateEnd}
        
        // 其他配置
        throttleDrag={0}
        throttleResize={0}
        throttleRotate={0}
        keepRatio={false}
        edge={true}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
  );
});

MovableWrapper.displayName = 'MovableWrapper';
