import { pageActiveStore, pptStore } from "@/store";
import type { ICommonElementProps } from "@/types/element";
import { useRef, useState } from "react";

interface UseMovableElementProps<
  T extends ICommonElementProps = ICommonElementProps,
> {
  id: string;
  props: T;
  onStateChange?: (isDragging: boolean) => void;
  onMoveableRefresh?: () => void;
}

interface UseMovableElementReturn {
  isDragging: boolean;
  // 拖拽回调
  handleDragStart: () => void;
  handleDrag: (params: { x: number; y: number; transform: string }) => void;
  handleDragEnd: () => void;
  // 缩放回调
  handleResizeStart: () => void;
  handleResize: (params: {
    width: number;
    height: number;
    transform: string;
    deltaX?: number;
    deltaY?: number;
  }) => void;
  handleResizeEnd: () => void;
  // 旋转回调
  handleRotateStart: () => void;
  handleRotate: (params: { rotate: number; transform: string }) => void;
  handleRotateEnd: () => void;
}

export const useMovableElement = <
  T extends ICommonElementProps = ICommonElementProps,
>({
  id,
  props,
  onStateChange,
  onMoveableRefresh,
}: UseMovableElementProps<T>): UseMovableElementReturn => {
  const [isDragging, setIsDragging] = useState(false);

  // 状态记录器
  const finalPosition = useRef<{ x: number; y: number } | null>(null);
  const initialPosition = useRef<{ x: number; y: number } | null>(null);
  const resizeData = useRef<{
    width: number;
    height: number;
  } | null>(null);
  const finalRotate = useRef<number | null>(null);
  // 防抖定时器
  const resizeDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 从 transform 中提取 translate 值的辅助函数
  const extractTranslateFromTransform = (
    transform: string
  ): { x: number; y: number } => {
    if (!transform || transform === "none") {
      return { x: 0, y: 0 };
    }
    try {
      const matrix = new DOMMatrix(transform);
      return {
        x: matrix.m41, // translateX
        y: matrix.m42, // translateY
      };
    } catch {
      return { x: 0, y: 0 };
    }
  };

  // 更新拖拽状态并通知外部
  const updateDraggingState = (dragging: boolean) => {
    setIsDragging(dragging);
    onStateChange?.(dragging);
  };

  // 拖拽相关处理
  const handleDragStart = () => {
    updateDraggingState(true);
    // 记录初始位置
    initialPosition.current = { x: props.x, y: props.y };
  };

  const handleDrag = (params: { x: number; y: number; transform: string }) => {
    if (!initialPosition.current) return;

    const { x: deltaX, y: deltaY } = params;

    // 基于初始位置计算新位置
    const newX = initialPosition.current.x + deltaX;
    const newY = initialPosition.current.y + deltaY;

    // 记录最终位置
    finalPosition.current = { x: newX, y: newY };
  };

  const handleDragEnd = () => {
    updateDraggingState(false);

    // 等待 DOM 更新后，从 transform 中提取 translate 值
    requestAnimationFrame(() => {
      const element = document.getElementById(id);

      if (element) {
        // 从 transform 中提取 translate 值
        const computedTransform = window.getComputedStyle(element).transform;
        const translate = extractTranslateFromTransform(computedTransform);

        // translate 值就是最终的 x/y 位置
        const finalX = translate.x || props.x;
        const finalY = translate.y || props.y;

        // 更新store
        pptStore.setElementInfo(pageActiveStore.getPageActive() as string, id, {
          ...props,
          x: finalX,
          y: finalY,
        } as any);

        // 通知外部刷新 Moveable 位置
        setTimeout(() => {
          onMoveableRefresh?.();
        }, 200);
      } else if (finalPosition.current) {
        // 如果找不到元素，使用计算的位置作为后备
        const finalPos = { ...finalPosition.current };
        pptStore.setElementInfo(pageActiveStore.getPageActive() as string, id, {
          ...props,
          x: finalPos.x,
          y: finalPos.y,
        } as any);
      }

      // 清空临时记录
      finalPosition.current = null;
      initialPosition.current = null;
    });
  };

  // 缩放相关处理
  const handleResizeStart = () => {
    updateDraggingState(true);
    // 初始化 resize 数据
    resizeData.current = {
      width: props.width,
      height: props.height,
    };
  };

  const handleResize = (_params: {
    width: number;
    height: number;
    transform: string;
    deltaX?: number;
    deltaY?: number;
  }) => {
    // const { width, height } = params;
    // // 记录尺寸
    // if (resizeData.current) {
    //   resizeData.current.width = width;
    //   resizeData.current.height = height;
    // }
    // // 清除之前的防抖定时器
    // if (resizeDebounceTimer.current) {
    //   clearTimeout(resizeDebounceTimer.current);
    // }
    // // 使用防抖从 DOM 读取元素的位置和尺寸并更新 store
    // resizeDebounceTimer.current = setTimeout(() => {
    //   const element = document.getElementById(id);
    //   if (element && resizeData.current) {
    //     // 从 transform 中提取 translate 值
    //     const computedTransform = window.getComputedStyle(element).transform;
    //     const translate = extractTranslateFromTransform(computedTransform);
    //     // translate 值就是最终的 x/y 位置
    //     const finalX = translate.x || props.x;
    //     const finalY = translate.y || props.y;
    //     // 从 style.width 和 style.height 读取尺寸
    //     const styleWidth = parseFloat(element.style.width);
    //     const styleHeight = parseFloat(element.style.height);
    //     // 构建更新数据
    //     const updateData: any = {
    //       ...props,
    //       x: finalX,
    //       y: finalY,
    //     };
    //     // 更新尺寸：优先使用 style 中的值，否则使用 resizeData 中记录的值
    //     updateData.width =
    //       !isNaN(styleWidth) && styleWidth > 0
    //         ? styleWidth
    //         : resizeData.current.width;
    //     updateData.height =
    //       !isNaN(styleHeight) && styleHeight > 0
    //         ? styleHeight
    //         : resizeData.current.height;
    //     // 更新 store
    //     pptStore.setElementInfo(
    //       pageActiveStore.getPageActive() as string,
    //       id,
    //       updateData
    //     );
    //   }
    // }, 100); // 防抖延迟 100ms
  };

  const handleResizeEnd = () => {
    updateDraggingState(false);

    // 清除防抖定时器
    if (resizeDebounceTimer.current) {
      clearTimeout(resizeDebounceTimer.current);
      resizeDebounceTimer.current = null;
    }

    // 等待 DOM 渲染后，从元素读取实际位置和尺寸并最终更新 store
    requestAnimationFrame(() => {
      const element = document.getElementById(id);

      if (element) {
        // 1. 从 DOM 获取实际的 width 和 height
        const domWidth = element.offsetWidth || element.clientWidth;
        const domHeight = element.offsetHeight || element.clientHeight;

        // 2. 从 transform 中提取 translate 值
        const computedTransform = window.getComputedStyle(element).transform;
        const translate = extractTranslateFromTransform(computedTransform);

        // translate 值就是最终的 x/y 位置
        const finalX = translate.x || props.x;
        const finalY = translate.y || props.y;

        // 3. 构建更新数据，使用 DOM 的实际尺寸和 translate 位置
        const updateData: any = {
          ...props,
          x: finalX,
          y: finalY,
          width: domWidth || props.width,
          height: domHeight || props.height,
        };

        // 4. 更新 mobx store
        pptStore.setElementInfo(
          pageActiveStore.getPageActive() as string,
          id,
          updateData
        );

        // 通知外部刷新 Moveable 位置
        setTimeout(() => {
          onMoveableRefresh?.();
        }, 200);
      }

      // 清空临时记录
      resizeData.current = null;
    });
  };

  // 旋转相关处理
  const handleRotateStart = () => {
    updateDraggingState(true);
  };

  const handleRotate = (params: { rotate: number; transform: string }) => {
    const { rotate } = params;
    // 只记录最终角度，不立即更新store
    finalRotate.current = rotate;
  };

  const handleRotateEnd = () => {
    updateDraggingState(false);
    // 旋转结束时才更新store
    if (finalRotate.current !== null) {
      pptStore.setElementInfo(pageActiveStore.getPageActive() as string, id, {
        ...props,
        rotate: finalRotate.current,
      } as any);
      finalRotate.current = null;
    }
  };

  return {
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
  };
};
