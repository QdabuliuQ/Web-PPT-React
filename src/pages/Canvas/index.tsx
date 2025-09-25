import { Table, type ITableProps } from "@/element/Table";
import { Text, type ITextProps } from "@/element/Text";
import MockData from "@/mock";
import {
  elementActiveStore,
  menuActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import { observer } from "mobx-react-lite";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";
import type { JSX } from "react/jsx-runtime";

const Component: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const lastContainerSizeRef = useRef({ width: 0, height: 0 });

  // Canvas 固定尺寸 - 使用常量避免重复声明
  const CANVAS_WIDTH = useMemo(() => 1000, []);
  const CANVAS_HEIGHT = useMemo(() => 700, []);

  // 计算缩放比例 - 性能优化版本
  const calculateScale = useCallback(() => {
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
  }, [CANVAS_WIDTH, scale]);

  useEffect(() => {
    pptStore.setPages(JSON.parse(JSON.stringify(MockData)).pages);

    const pages = pptStore.getPages();

    if (pages.length > 0) {
      pageActiveStore.setPageActive(pages[0].id);
    }

    console.log("page", pages);

    // 检查是否有已选中的元素，如果有则设置对应的panel
    // Header组件会自动检查已选中的元素并设置菜单，这里不需要重复设置

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
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // 检查点击的是否是画布本身（而不是其中的元素）
    if (e.target === e.currentTarget) {
      elementActiveStore.resetElementActive();
      // 取消选择时切换回开始页面
      menuActiveStore.setActiveMenu("start");
    }
  }, []);

  // 处理元素选中 - 优化版本
  const handleElementSelect = useCallback((elementId: string) => {
    const currentActiveElement = elementActiveStore.getElementActive();

    // 如果选中的是不同的元素，或者没有选中任何元素，则进行切换
    if (currentActiveElement !== elementId) {
      elementActiveStore.setElementActive(elementId);
      // Header组件会自动处理菜单激活，这里不需要重复设置
    }
  }, []);

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
      <div
        id="canvas-container"
        className="absolute bg-[#fff] overflow-hidden transition-transform duration-200 ease-in-out"
        style={canvasStyle}
        onClick={handleCanvasClick}
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
