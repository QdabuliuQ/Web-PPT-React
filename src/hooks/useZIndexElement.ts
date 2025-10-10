import { pptStore } from "@/store";
import { useMemoizedFn } from "ahooks";

export const useZIndexElement = (pageId: string, elementId: string) => {
  // 置顶 - 移到最前面
  const toFrontHandle = useMemoizedFn(() => {
    const element = pptStore.getElementInfo(pageId, elementId);
    if (!element) return;
    const allElements = pptStore.getAllElementInfo(pageId);
    const maxZIndex = Math.max(...allElements.map((e) => e.zIndex));
    element.zIndex = maxZIndex + 1;
    pptStore.setElementInfo(pageId, elementId, element);
  });

  // 上移一层
  const sendForwardHandle = useMemoizedFn(() => {
    const element = pptStore.getElementInfo(pageId, elementId);
    if (!element) return;

    const allElements = pptStore.getAllElementInfo(pageId);
    const currentZIndex = element.zIndex;

    // 找到所有比当前元素层级高的元素
    const higherElements = allElements.filter((e) => e.zIndex > currentZIndex);

    if (higherElements.length === 0) {
      // 已经是最顶层，无需操作
      return;
    }

    // 找到最接近当前层级的上一层元素
    const nextElement = higherElements.reduce((min, curr) =>
      curr.zIndex < min.zIndex ? curr : min
    );

    // 交换 zIndex
    const tempZIndex = element.zIndex;
    element.zIndex = nextElement.zIndex;
    nextElement.zIndex = tempZIndex;

    // 更新两个元素
    pptStore.setElementInfo(pageId, elementId, element);
    pptStore.setElementInfo(pageId, nextElement.id, nextElement);
  });

  // 下移一层
  const sendBackwardHandle = useMemoizedFn(() => {
    const element = pptStore.getElementInfo(pageId, elementId);
    if (!element) return;

    const allElements = pptStore.getAllElementInfo(pageId);
    const currentZIndex = element.zIndex;

    // 找到所有比当前元素层级低的元素
    const lowerElements = allElements.filter((e) => e.zIndex < currentZIndex);

    if (lowerElements.length === 0) {
      // 已经是最底层，无需操作
      return;
    }

    // 找到最接近当前层级的下一层元素
    const prevElement = lowerElements.reduce((max, curr) =>
      curr.zIndex > max.zIndex ? curr : max
    );

    // 交换 zIndex
    const tempZIndex = element.zIndex;
    element.zIndex = prevElement.zIndex;
    prevElement.zIndex = tempZIndex;

    // 更新两个元素
    pptStore.setElementInfo(pageId, elementId, element);
    pptStore.setElementInfo(pageId, prevElement.id, prevElement);
  });

  // 置底 - 移到最后面
  const toBackHandle = useMemoizedFn(() => {
    const element = pptStore.getElementInfo(pageId, elementId);
    if (!element) return;

    const allElements = pptStore.getAllElementInfo(pageId);
    const currentZIndex = element.zIndex;

    // 找到所有比当前元素层级低的元素
    const lowerElements = allElements.filter((e) => e.zIndex < currentZIndex);

    if (lowerElements.length === 0) {
      // 已经是最底层，无需操作
      return;
    }

    const minZIndex = Math.min(...allElements.map((e) => e.zIndex));

    // 防止产生负数：设置最小值为 0
    const newZIndex = Math.max(0, minZIndex - 1);

    // 如果最小 zIndex 已经是 0，需要重新整理所有元素的层级
    if (minZIndex <= 0) {
      // 重新分配所有元素的 zIndex，确保在合理范围内
      const sortedElements = allElements
        .filter((e) => e.id !== elementId) // 排除当前元素
        .sort((a, b) => a.zIndex - b.zIndex);

      // 当前元素放到最底层（zIndex = 0）
      element.zIndex = 0;

      // 其他元素依次递增
      sortedElements.forEach((el, index) => {
        el.zIndex = index + 1;
        pptStore.setElementInfo(pageId, el.id, el);
      });

      pptStore.setElementInfo(pageId, elementId, element);
    } else {
      // 正常情况：设置为 minZIndex - 1，但不小于 0
      element.zIndex = newZIndex;
      pptStore.setElementInfo(pageId, elementId, element);
    }
  });

  return {
    toFrontHandle,
    sendForwardHandle,
    sendBackwardHandle,
    toBackHandle,
  };
};
