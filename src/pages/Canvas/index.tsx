import { Icon } from "@/element/Icon";
import { Image } from "@/element/Image";
import { Table } from "@/element/Table";
import { Text } from "@/element/Text";
import type { MenuItem } from "@/hooks/useContextMenu";
import MockData from "@/mock";
import {
  contextMenuStore,
  copyElementStore,
  elementActiveStore,
  fullscreenStore,
  menuActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import type { Elements } from "@/store/ppt";
import { getRandomId } from "@/utils";
import { Clipboard } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState, type FC } from "react";

interface CanvasProps {
  mode?: "preview" | "play" | "edit";
  page?: {
    id: string;
    elements: Array<Elements>;
  };
  previewZoom?: number; // preview 模式下的缩放比例
}

const Component: FC<CanvasProps> = ({ mode = "edit", page, previewZoom }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [, forceUpdate] = useState(0); // 用于 play 模式强制重新渲染
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

  // 初始化数据 - 只执行一次
  useEffect(() => {
    // 只在没有数据时初始化
    if (pptStore.getPages().length === 0) {
      pptStore.setPages(JSON.parse(JSON.stringify(MockData)).pages);

      const pages = pptStore.getPages();

      if (pages.length > 0) {
        pageActiveStore.setPageActive(pages[0].id);
      }
    }
  }, []);

  // 初始化缩放
  useEffect(() => {
    setTimeout(calculateScale, 0);
  }, [calculateScale]);

  // 监听窗口大小变化 - 性能优化版本
  useEffect(() => {
    // preview 模式下不需要监听（已经有固定的 zoom）
    if (mode === "preview") return;

    let timeoutId: NodeJS.Timeout;
    let rafId: number;

    const handleResize = () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);

      // 使用 requestAnimationFrame + setTimeout 组合，优化性能
      rafId = requestAnimationFrame(() => {
        timeoutId = setTimeout(() => {
          if (mode === "play") {
            // play 模式下强制重新渲染以更新缩放
            forceUpdate((prev) => prev + 1);
          } else {
            // edit 模式使用原来的计算逻辑
            calculateScale();
          }
        }, 100); // play 模式响应更快
      });
    };

    // 节流优化：只在需要时添加事件监听
    const options = { passive: true };
    window.addEventListener("resize", handleResize, options);

    // play 模式下，ResizeObserver 监听容器变化
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && "ResizeObserver" in window && mode !== "play") {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [calculateScale, mode]);

  // 处理画布点击事件 - 优化版本
  const handleCanvasClick = useMemoizedFn((e: React.MouseEvent) => {
    // 预览和播放模式下不处理点击事件
    if (mode === "preview" || mode === "play") {
      return;
    }

    // 检查点击的是否是画布本身（而不是其中的元素）
    if (e.target === e.currentTarget) {
      elementActiveStore.resetElementActive();
      // 取消选择时切换回开始页面
      menuActiveStore.setActiveMenu("start");
    }
  });

  // 处理元素选中 - 优化版本
  const handleElementSelect = useMemoizedFn((elementId: string) => {
    // 预览和播放模式下不允许选择元素
    if (mode === "preview" || mode === "play") {
      return;
    }

    const currentActiveElement = elementActiveStore.getElementActive();

    // 如果选中的是不同的元素，或者没有选中任何元素，则进行切换
    if (currentActiveElement !== elementId) {
      elementActiveStore.setElementActive(elementId);
      // Header组件会自动处理菜单激活，这里不需要重复设置
    }
  });

  const handleCanvasPaste = useMemoizedFn((x?: number, y?: number) => {
    // 预览和播放模式下不允许粘贴
    if (mode === "preview" || mode === "play") {
      return;
    }

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

  // 关闭右键菜单
  const closeMenu = useMemoizedFn(() => {
    contextMenuStore.hideMenu();
  });

  // 直接获取页面数据，observer 会自动响应 store 变化
  const currentPage =
    mode === "edit"
      ? pptStore.getActivePage(pageActiveStore.getPageActive() as string)
      : page;

  // 获取全屏状态（直接访问属性，确保 MobX 能追踪依赖）
  const isFullscreen = fullscreenStore.isFullscreen;

  // Canvas 样式对象 - 不使用 useMemo，让 MobX observer 自动追踪 isFullscreen 的变化
  const getCanvasStyle = () => {
    let computedScale = 1;

    // play 模式下的全屏缩放（确保宽度或高度撑满）
    if (mode === "play") {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // 计算缩放比例（保持宽高比）
      const scaleX = screenWidth / CANVAS_WIDTH;
      const scaleY = screenHeight / CANVAS_HEIGHT;

      // 使用 Math.min 确保整个 Canvas 都在屏幕内，同时至少一边撑满
      computedScale = Math.min(scaleX, scaleY);
    } else if (isFullscreen) {
      // 其他模式的全屏（如果有的话）
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const scaleX = screenWidth / CANVAS_WIDTH;
      const scaleY = screenHeight / CANVAS_HEIGHT;
      computedScale = Math.min(scaleX, scaleY) * 0.95; // 留5%边距
    } else if (mode === "preview") {
      // preview 模式使用固定缩放
      computedScale = 1;
    } else {
      // edit 模式使用动态缩放
      computedScale = scale;
    }

    return {
      width: `${CANVAS_WIDTH}px`,
      height: `${CANVAS_HEIGHT}px`,
      transform: `scale(${computedScale})`,
      transformOrigin: "center center",
      left: "50%",
      top: "50%",
      marginLeft: `-${CANVAS_WIDTH / 2}px`,
      marginTop: `-${CANVAS_HEIGHT / 2}px`,
      // 开启硬件加速
      willChange: "transform",
      backfaceVisibility: "hidden" as const,
    };
  };

  const canvasStyle = getCanvasStyle();

  // 渲染元素列表（复用函数）
  const renderElements = useMemoizedFn((isEditMode: boolean) => {
    if (!currentPage) return null;

    return currentPage.elements
      .map((element) => {
        if (element.type === "text") {
          return (
            <Text
              key={element.id}
              {...element}
              type="text"
              mode={mode}
              {...(isEditMode && {
                onSelect: () => handleElementSelect(element.id),
              })}
            />
          );
        } else if (element.type === "table") {
          return (
            <Table
              key={element.id}
              {...element}
              type="table"
              mode={mode}
              {...(isEditMode && {
                onSelect: () => handleElementSelect(element.id),
              })}
            />
          );
        } else if (element.type === "icon") {
          return (
            <Icon
              key={element.id}
              {...element}
              type="icon"
              mode={mode}
              {...(isEditMode && {
                onSelect: () => handleElementSelect(element.id),
              })}
            />
          );
        } else if (element.type === "image") {
          return (
            <Image
              key={element.id}
              {...element}
              type="image"
              mode={mode}
              {...(isEditMode && {
                onSelect: () => handleElementSelect(element.id),
              })}
            />
          );
        }
        return null;
      })
      .filter(Boolean);
  });

  const CanvasContainer = useMemoizedFn(() => {
    // 编辑模式：支持交互、右键菜单等
    if (mode === "edit") {
      return (
        <div
          id="canvas-container"
          className="absolute bg-[#fff] overflow-hidden transition-transform duration-200 ease-in-out"
          style={{
            ...canvasStyle,
          }}
          onClick={handleCanvasClick}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const menuItems: MenuItem[] = [];
            if ((e as any).customData) {
              const { menuItems: customMenuItems } = (e as any).customData;
              // 为每个自定义菜单项包装 onClick 处理函数
              const wrappedCustomMenuItems = customMenuItems.map(
                (item: any) => ({
                  ...item,
                  onClick: item.onClick
                    ? () => {
                        item.onClick();
                        closeMenu();
                      }
                    : undefined,
                })
              );
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

            // 显示全局右键菜单
            contextMenuStore.showMenu(menuItems, e);
          }}
        >
          {renderElements(true)}
        </div>
      );
    }

    // 预览模式或播放模式：只读，不支持交互
    return (
      <div
        id={
          mode === "play" ? "play-canvas-container" : "preview-canvas-container"
        }
        className="absolute bg-[#fff] overflow-hidden transition-transform duration-200 ease-in-out"
        style={{
          ...canvasStyle,
        }}
      >
        {renderElements(false)}
      </div>
    );
  });

  // 获取页面ID用于生成唯一的容器ID
  const pageId =
    mode === "edit"
      ? pageActiveStore.getPageActive() || "default"
      : page?.id || "default";

  // 动态生成 className（全屏优先）- 不使用 useMemo，让 MobX observer 自动追踪
  const getContainerClassName = () => {
    // 如果全屏，优先使用全屏样式
    if (isFullscreen) {
      return "flex items-center justify-center w-full h-full relative";
    }

    // 非全屏时根据 mode 使用不同样式
    if (mode === "edit") {
      return "w-[calc(100%-230px)] h-[100%] relative overflow-hidden";
    }

    // preview 和 play 模式
    return "w-full h-full relative";
  };

  const containerClassName = getContainerClassName();

  // 动态生成 style（用于 preview/play 模式的 zoom）
  // 注意：不使用 useMemo，让 MobX observer 自动追踪 isFullscreen 的变化
  const getContainerStyle = () => {
    // 优先判断全屏状态（play 模式全屏）
    if (isFullscreen && mode === "play") {
      // play 模式全屏时，不使用 zoom，而是通过 Canvas 内部的 scale 来控制
      // 这里返回 undefined，让 Canvas 使用默认样式
      return undefined;
    }

    // 非全屏时，如果是 preview 模式且有 previewZoom，使用 previewZoom
    if (mode === "preview" && previewZoom !== undefined) {
      return { zoom: previewZoom };
    }

    return undefined;
  };

  const containerStyle = getContainerStyle();

  return (
    <div
      ref={containerRef}
      id={`parent-canvas-container-${pageId}`}
      className={containerClassName}
      style={containerStyle}
    >
      <CanvasContainer />
    </div>
  );
};

export const Canvas: FC<CanvasProps> = observer(Component);
