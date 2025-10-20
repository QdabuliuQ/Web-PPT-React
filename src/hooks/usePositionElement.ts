import { pptStore } from "@/store";
import { useMemoizedFn } from "ahooks";

export type Position = "top" | "bottom" | "left" | "right" | "center";

// 画布尺寸常量（与Canvas组件保持一致）
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;

export const usePositionElement = (pageId: string, elementId: string) => {
  const positionHandle = useMemoizedFn((position: Position) => {
    console.log("position", position);

    const element = pptStore.getElementInfo(pageId, elementId);
    if (!element) return;

    switch (position) {
      case "top":
        element.y = 0;
        break;
      case "bottom":
        // 元素底部贴紧画布底部
        element.y = CANVAS_HEIGHT - element.height;
        break;
      case "left":
        element.x = 0;
        break;
      case "right":
        // 元素右侧贴紧画布右侧
        element.x = CANVAS_WIDTH - element.width;
        break;
      case "center":
        // 真正的居中：考虑元素尺寸
        element.x = Math.max(0, (CANVAS_WIDTH - element.width) / 2);
        element.y = Math.max(0, (CANVAS_HEIGHT - element.height) / 2);
        break;
    }

    // 边界检查：确保元素不会超出画布
    element.x = Math.max(0, Math.min(element.x, CANVAS_WIDTH - element.width));
    element.y = Math.max(
      0,
      Math.min(element.y, CANVAS_HEIGHT - element.height)
    );

    pptStore.setElementInfo(pageId, elementId, element);
  });

  return {
    positionHandle,
  };
};
