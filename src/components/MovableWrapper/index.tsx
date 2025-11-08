import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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

  // 位置信息 - 用于响应外部位置变化
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotate?: number;

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

export const MovableWrapper = memo(
  forwardRef<any, MovableWrapperProps>(
    (
      {
        id,
        active = true, // 默认为激活状态
        draggable = true,
        resizable = true,
        rotatable = true,
        dragOnlyButton = false,
        bounds,
        x,
        y,
        width,
        height,
        rotate,
        onDragStart,
        onDrag,
        onDragEnd,
        onResizeStart,
        onResize,
        onResizeEnd,
        onRotateStart,
        onRotate,
        onRotateEnd,
      },
      ref
    ) => {
      // 用于存储拖拽句柄元素引用
      const [dragHandle, setDragHandle] = useState<HTMLElement | null>(null);
      // Moveable 实例引用
      const moveableRef = useRef<any>(null);

      // 暴露 Moveable 实例给父组件
      useImperativeHandle(ref, () => ({
        updateRect: () => moveableRef.current?.updateRect(),
        get moveableRef() {
          return moveableRef.current;
        },
      }));

      // 获取拖拽句柄元素引用
      useEffect(() => {
        if (dragOnlyButton && active) {
          setDragHandle(null);
          // 等待DOM更新后查找拖拽句柄元素
          const timer = setTimeout(() => {
            try {
              const handleElement = document.querySelector(
                ".moveable-drag-handle"
              ) as HTMLElement;
              setDragHandle(handleElement || null);
            } catch (error) {
              console.warn("Failed to find drag handle element:", error);
              setDragHandle(null);
            }
          }, 100); // 给一些时间让moveable渲染完成

          return () => clearTimeout(timer);
        } else {
          setDragHandle(null);
        }
      }, [dragOnlyButton, active, id]);

      // 监听位置变化和激活状态，更新 Moveable
      useEffect(() => {
        if (moveableRef.current && active) {
          // 延迟一帧更新，确保 DOM 已更新
          requestAnimationFrame(() => {
            if (moveableRef.current) {
              moveableRef.current.updateRect();
            }
          });

          // 额外延迟更新，确保位置完全同步
          setTimeout(() => {
            if (moveableRef.current) {
              moveableRef.current.updateRect();
            }
          }, 50);
        }
      }, [x, y, width, height, rotate, active]);

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

        // 在拖拽过程中应用 transform，让 Moveable 正确显示
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
        const targetElement = document.getElementById(id);

        let finalLeft = x || 0;
        let finalTop = y || 0;

        // 先从 transform 中提取 translate 值，计算最终位置
        if (targetElement) {
          const transform = window.getComputedStyle(targetElement).transform;

          if (transform && transform !== "none") {
            const matrix = new DOMMatrix(transform);
            const translateX = matrix.m41;
            const translateY = matrix.m42;

            // 获取当前的 left/top
            const currentLeft = parseFloat(targetElement.style.left) || 0;
            const currentTop = parseFloat(targetElement.style.top) || 0;

            // 计算最终位置
            finalLeft = currentLeft + translateX;
            finalTop = currentTop + translateY;

            console.log("[MovableWrapper] handleDragEnd - 计算位置", {
              id,
              currentLeft,
              currentTop,
              translateX,
              translateY,
              finalLeft,
              finalTop,
              propsX: x,
              propsY: y,
            });

            // 立即应用最终位置
            targetElement.style.left = `${finalLeft}px`;
            targetElement.style.top = `${finalTop}px`;
          }

          // 清除拖拽产生的 transform translate，只保留 rotate
          targetElement.style.transform = `rotate(${rotate || 0}deg)`;
        }

        // 立即更新 Moveable 位置
        if (moveableRef.current) {
          console.log("[MovableWrapper] 立即更新 Moveable");
          moveableRef.current.updateRect();
        }

        // 调用父组件的 onDragEnd 回调
        // 父组件会用这个最终位置更新 store
        onDragEnd?.();

        // 延迟更新 Moveable，等待 props 更新和重新渲染完成
        requestAnimationFrame(() => {
          if (moveableRef.current) {
            console.log("[MovableWrapper] requestAnimationFrame 更新 Moveable");
            moveableRef.current.updateRect();
          }
        });

        setTimeout(() => {
          const el = document.getElementById(id);
          if (moveableRef.current) {
            console.log("[MovableWrapper] 100ms 后更新 Moveable", {
              id,
              moveableExists: !!moveableRef.current,
              domLeft: el?.style.left,
              domTop: el?.style.top,
              propsX: x,
              propsY: y,
            });
            moveableRef.current.updateRect();
          }
        }, 100);

        setTimeout(() => {
          if (moveableRef.current) {
            console.log("[MovableWrapper] 200ms 后更新 Moveable");
            moveableRef.current.updateRect();
          }
        }, 200);

        setTimeout(() => {
          if (moveableRef.current) {
            console.log("[MovableWrapper] 300ms 后更新 Moveable");
            moveableRef.current.updateRect();
          }
        }, 300);

        setTimeout(() => {
          if (moveableRef.current) {
            console.log("[MovableWrapper] 500ms 后更新 Moveable");
            moveableRef.current.updateRect();
          }
        }, 500);
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

      // 如果未激活，不渲染 Moveable
      if (!active) {
        return null;
      }

      // 确保目标元素存在
      const targetElement = document.getElementById(id);
      if (!targetElement) {
        console.warn(`Target element with id "${id}" not found`);
        return null;
      }

      return (
        <Moveable
          ref={moveableRef}
          target={`#${id}`}
          container={document.querySelector("#canvas-container") as HTMLElement}
          className={`${styles.moveableWrapper} ${
            dragOnlyButton ? styles.borderDraggable : ""
          }`}
          // 功能配置
          draggable={draggable}
          resizable={resizable}
          rotatable={rotatable}
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
  )
);

MovableWrapper.displayName = "MovableWrapper";
