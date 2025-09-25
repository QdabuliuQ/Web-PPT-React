import { pageActiveStore, pptStore } from "@/store";
import type { ICommonElementProps } from "@/types/element";
import { useRef, useState } from "react";

interface UseMovableElementProps<
  T extends ICommonElementProps = ICommonElementProps,
> {
  id: string;
  props: T;
  onStateChange?: (isDragging: boolean) => void;
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
}: UseMovableElementProps<T>): UseMovableElementReturn => {
  const [isDragging, setIsDragging] = useState(false);

  // 状态记录器
  const finalPosition = useRef<{ x: number; y: number } | null>(null);
  const initialPosition = useRef<{ x: number; y: number } | null>(null);
  const finalSize = useRef<{ width: number; height: number } | null>(null);
  const finalRotate = useRef<number | null>(null);

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
    // 拖拽结束时才更新store
    if (finalPosition.current && initialPosition.current) {
      const finalPos = { ...finalPosition.current };

      // 先清除transform，然后立即更新store和拖拽状态
      pptStore.setElementInfo(pageActiveStore.getPageActive() as string, id, {
        ...props,
        x: finalPos.x,
        y: finalPos.y,
      } as any);

      updateDraggingState(false);
      finalPosition.current = null;
      initialPosition.current = null;
    } else {
      updateDraggingState(false);
    }
  };

  // 缩放相关处理
  const handleResizeStart = () => {
    updateDraggingState(true);
  };

  const handleResize = (params: {
    width: number;
    height: number;
    transform: string;
  }) => {
    const { width, height } = params;
    // 只记录最终尺寸，不立即更新store
    finalSize.current = { width, height };
  };

  const handleResizeEnd = () => {
    updateDraggingState(false);
    // 缩放结束时才更新store
    if (finalSize.current) {
      pptStore.setElementInfo(pageActiveStore.getPageActive() as string, id, {
        ...props,
        width: finalSize.current.width,
        height: finalSize.current.height,
      } as any);
      finalSize.current = null;
    }
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
