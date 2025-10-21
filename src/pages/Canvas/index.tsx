import { Table, type ITableProps } from "@/element/Table";
import { Text, type ITextProps } from "@/element/Text";
import type { MenuItem } from "@/hooks/useContextMenu";
import { useContextMenu } from "@/hooks/useContextMenu";
import MockData from "@/mock";
import {
  copyElementStore,
  elementActiveStore,
  menuActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import { getRandomId } from "@/utils";
import { Clipboard } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { memo, useEffect, useMemo, useRef, useState, type FC } from "react";
import type { JSX } from "react/jsx-runtime";

const Component: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const lastContainerSizeRef = useRef({ width: 0, height: 0 });

  // Canvas 固定尺寸 - 使用常量避免重复声明
  const CANVAS_WIDTH = useMemo(() => 1000, []);
  const CANVAS_HEIGHT = useMemo(() => 700, []);

  // 计算缩放比例 - 性能优化版本
  const calculateScale = useMemoizedFn(() => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const currentSize = {
      width: Math.round(containerRect.width),
      height: Math.round(containerRect.height),
    };

    // 检查容器尺寸是否真正变化，避免不必要的计算
    const lastSize = lastContainerSizeRef.current;
    if (
      currentSize.width === lastSize.width &&
      currentSize.height === lastSize.height
    ) {
      return;
    }

    lastContainerSizeRef.current = currentSize;

    const margin = 40; // 边距
    const availableWidth = currentSize.width - margin;

    // 宽度撑满，基于宽度计算缩放比例
    let newScale = availableWidth / CANVAS_WIDTH;

    // 限制最大缩放不超过1
    newScale = Math.min(Math.max(newScale, 0.1), 1); // 添加最小值限制

    // 只在值真正变化时更新（提高精度）
    if (Math.abs(newScale - scale) > 0.005) {
      setScale(newScale);
    }
  });

  useEffect(() => {
    pptStore.setPages(JSON.parse(JSON.stringify(MockData)).pages);

    const pages = pptStore.getPages();

    if (pages.length > 0) {
      pageActiveStore.setPageActive(pages[0].id);
    }
    // 初始化缩放，延迟确保DOM完全渲染
    setTimeout(calculateScale, 0);
  }, [calculateScale]);

  // 监听窗口大小变化 - 性能优化版本
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let rafId: number;

    const handleResize = () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);

      // 使用 requestAnimationFrame + setTimeout 组合，优化性能
      rafId = requestAnimationFrame(() => {
        timeoutId = setTimeout(calculateScale, 150); // 增加防抖时间到150ms
      });
    };

    // 节流优化：只在需要时添加事件监听
    const options = { passive: true };
    window.addEventListener("resize", handleResize, options);

    // ResizeObserver 性能更好，优先使用
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [calculateScale]);

  // 处理画布点击事件 - 优化版本
  const handleCanvasClick = useMemoizedFn((e: React.MouseEvent) => {
    // 检查点击的是否是画布本身（而不是其中的元素）
    if (e.target === e.currentTarget) {
      elementActiveStore.resetElementActive();
      // 取消选择时切换回开始页面
      menuActiveStore.setActiveMenu("start");
    }
  });

  // 手动关闭菜单的函数
  const closeMenu = useMemoizedFn(() => {
    setMenuItems([]);
  });

  // 添加全局点击事件监听器来关闭菜单
  useEffect(() => {
    const handleGlobalClick = () => {
      closeMenu();
    };

    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [closeMenu]);

  // 处理元素选中 - 优化版本
  const handleElementSelect = useMemoizedFn((elementId: string) => {
    const currentActiveElement = elementActiveStore.getElementActive();

    // 如果选中的是不同的元素，或者没有选中任何元素，则进行切换
    if (currentActiveElement !== elementId) {
      elementActiveStore.setElementActive(elementId);
      // Header组件会自动处理菜单激活，这里不需要重复设置
    }
  });

  const handleCanvasPaste = useMemoizedFn((x?: number, y?: number) => {
    const pageActive = pageActiveStore.getPageActive();
    if (!pageActive) return;

    const copied = copyElementStore.getCopiedElement();
    if (!copied) return;

    const newElement = JSON.parse(JSON.stringify(copied));
    newElement.id = newElement.id.split("_")[0] + "_" + getRandomId();

    // 如果提供了坐标，设置元素位置
    if (x !== undefined && y !== undefined) {
      newElement.x = x;
      newElement.y = y;
    }
    pptStore.addElementInfo(pageActive, newElement as any);
    elementActiveStore.setElementActive(newElement.id);
  });

  // 创建画布右键菜单
  const { ContextMenu, show } = useContextMenu(
    menuItems,
    "canvas-context-menu"
  );

  // 直接获取页面数据，observer 会自动响应 store 变化
  const pages = pptStore.getPages();

  // Canvas 样式对象 - 使用 useMemo 缓存，避免每次渲染创建新对象
  const canvasStyle = useMemo(
    () => ({
      width: `${CANVAS_WIDTH}px`,
      height: `${CANVAS_HEIGHT}px`,
      transform: `scale(${scale})`,
      transformOrigin: "center center",
      left: "50%",
      top: "50%",
      marginLeft: `-${CANVAS_WIDTH / 2}px`,
      marginTop: `-${CANVAS_HEIGHT / 2}px`,
      // 开启硬件加速
      willChange: "transform",
      backfaceVisibility: "hidden" as const,
    }),
    [CANVAS_WIDTH, CANVAS_HEIGHT, scale]
  );

  return (
    <div
      ref={containerRef}
      className="w-[calc(100%-230px)] h-[100%] relative overflow-hidden"
    >
      <ContextMenu />
      <div
        id="canvas-container"
        className="absolute bg-[#fff] overflow-hidden transition-transform duration-200 ease-in-out"
        style={canvasStyle}
        onClick={handleCanvasClick}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();

          const menuItems: MenuItem[] = [];
          if ((e as any).customData) {
            const { menuItems: customMenuItems } = (e as any).customData;
            // 为每个自定义菜单项包装 onClick 处理函数
            const wrappedCustomMenuItems = customMenuItems.map((item: any) => ({
              ...item,
              onClick: item.onClick
                ? () => {
                    item.onClick();
                    closeMenu();
                  }
                : undefined,
            }));
            menuItems.push(...wrappedCustomMenuItems);
          } else {
            // 获取画布容器的位置信息
            const canvasContainer = e.currentTarget as HTMLElement;
            const canvasRect = canvasContainer.getBoundingClientRect();

            // 计算鼠标在画布内部的相对坐标
            const canvasX = (e.clientX - canvasRect.left) / scale;
            const canvasY = (e.clientY - canvasRect.top) / scale;
            menuItems.push({
              type: "item" as const,
              label: "粘贴",
              icon: <Clipboard theme="outline" size="13" fill="#333" />,
              onClick: () => {
                handleCanvasPaste(canvasX, canvasY);
                closeMenu();
              },
              disabled: !copyElementStore.hasCopiedElement(),
            });
            elementActiveStore.resetElementActive();
          }

          // 更新菜单项状态
          setMenuItems(menuItems);
          // 显示菜单
          show({ event: e });
        }}
      >
        {pages.length > 0 &&
          pages[0].elements
            .map(
              (
                element: JSX.IntrinsicAttributes & (ITextProps | ITableProps)
              ) => {
                if (element.type === "text") {
                  return (
                    <Text
                      key={element.id}
                      {...element}
                      type="text"
                      onSelect={() => handleElementSelect(element.id)}
                    />
                  );
                } else if (element.type === "table") {
                  return (
                    <Table
                      key={element.id}
                      {...element}
                      type="table"
                      onSelect={() => handleElementSelect(element.id)}
                    />
                  );
                }
                return null;
              }
            )
            .filter(Boolean)}
      </div>
    </div>
  );
};

export const Canvas: FC = memo(observer(Component));
