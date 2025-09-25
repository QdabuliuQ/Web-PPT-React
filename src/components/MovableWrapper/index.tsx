import { memo, useEffect, useState, type FC } from "react";
import type { MoveableManagerInterface, Renderer } from "react-moveable";
import Moveable from "react-moveable";
import styles from "./index.module.less";

// 自定义拖拽句柄 able
const DragHandleViewable = {
  name: "dragHandleViewable",
  props: [],
  events: [],
  render(moveable: MoveableManagerInterface<any, any>, _React: Renderer) {
    const rect = moveable.getRect();

    // 渲染拖拽句柄区域在底部中间
    return (
      <div
        key={"drag-handle"}
        className={"moveable-drag-handle"}
        style={{
          position: "absolute",
          left: `${rect.width / 2}px`,
          top: `${rect.height + 10}px`,
          background: "var(--primary-color)",
          borderRadius: "4px",
          padding: "4px 12px",
          color: "white",
          fontSize: "12px",
          whiteSpace: "nowrap",
          fontWeight: "bold",
          willChange: "transform",
          transform: `translate(-50%, 0px)`,
          cursor: "move",
          userSelect: "none",
          zIndex: 1000,
        }}
      >
        ⋮⋮ 拖拽
      </div>
    );
  },
} as const;

export interface MovableWrapperProps {
  // 基础属性
  id: string;

  // 激活状态控制
  active?: boolean; // 是否激活（显示控制点）

  // 功能开关
  draggable?: boolean;
  resizable?: boolean;
  rotatable?: boolean;
  dragOnlyButton?: boolean; // 只允许通过拖拽按钮拖拽

  // 容器和边界
  containerSelector?: string;
  bounds?: { left: number; top: number; right: number; bottom: number };

  // 事件回调
  onDragStart?: () => void;
  onDrag?: (params: { x: number; y: number; transform: string }) => void;
  onDragEnd?: () => void;
  onResizeStart?: () => void;
  onResize?: (params: {
    width: number;
    height: number;
    transform: string;
  }) => void;
  onResizeEnd?: () => void;
  onRotateStart?: () => void;
  onRotate?: (params: { rotate: number; transform: string }) => void;
  onRotateEnd?: () => void;
}

export const MovableWrapper: FC<MovableWrapperProps> = memo(
  ({
    id,
    active = true, // 默认为激活状态
    draggable = true,
    resizable = true,
    rotatable = true,
    dragOnlyButton = false,
    bounds,
    onDragStart,
    onDrag,
    onDragEnd,
    onResizeStart,
    onResize,
    onResizeEnd,
    onRotateStart,
    onRotate,
    onRotateEnd,
  }) => {
    // 用于存储拖拽句柄元素引用
    const [dragHandle, setDragHandle] = useState<HTMLElement | null>(null);

    // 获取拖拽句柄元素引用
    useEffect(() => {
      if (dragOnlyButton && active) {
        setDragHandle(null);
        // 等待DOM更新后查找拖拽句柄元素
        const timer = setTimeout(() => {
          const handleElement = document.querySelector(
            ".moveable-drag-handle"
          ) as HTMLElement;
          console.log(handleElement, "dragHandle");
          setDragHandle(handleElement || null);
        }, 100); // 给一些时间让moveable渲染完成

        return () => clearTimeout(timer);
      } else {
        setDragHandle(null);
      }
    }, [dragOnlyButton, active, id]);

    // 拖拽事件处理
    const handleDragStart = () => {
      onDragStart?.();
    };

    const handleDrag = (e: {
      target: EventTarget;
      transform: string;
      translate: number[];
    }) => {
      const { target, transform, translate } = e;

      // 让moveable控制框跟随元素位置，应用transform
      (target as HTMLElement).style.transform = transform;

      if (onDrag) {
        // 使用translate数组计算相对偏移
        const [deltaX, deltaY] = translate;

        onDrag({
          x: deltaX,
          y: deltaY,
          transform,
        });
      }
    };

    const handleDragEnd = () => {
      // 确保在拖拽结束时元素位置稳定
      requestAnimationFrame(() => {
        onDragEnd?.();
      });
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

    const handleRotate = (e: { target: EventTarget; transform: string }) => {
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
        container={document.querySelector("#canvas-container") as HTMLElement}
        className={`${styles.moveableWrapper} ${
          dragOnlyButton ? styles.borderDraggable : ""
        }`}
        // 功能配置 - 只有在激活状态下才启用功能
        draggable={active && draggable}
        resizable={active && resizable}
        rotatable={active && rotatable}
        // 自定义 ables - 当需要拖拽按钮时添加拖拽句柄
        ables={dragOnlyButton ? [DragHandleViewable] : []}
        // 拖拽区域配置：false表示不在moveable area添加拖拽事件
        // dragArea={false}
        // dragTarget：指定哪个元素作为拖拽目标
        dragTarget={dragOnlyButton && dragHandle ? dragHandle : `#${id}`}
        // 当设置了dragTarget时，是否允许目标元素本身也可拖拽
        dragTargetSelf={!dragOnlyButton}
        // 自定义属性，启用拖拽句柄视图
        props={{
          dragHandleViewable: dragOnlyButton,
        }}
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
        edge={true} // 启用边框线，但用CSS隐藏并重新绘制
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
        // 自定义渲染方向，只显示控制点
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
      />
    );
  }
);

MovableWrapper.displayName = "MovableWrapper";
