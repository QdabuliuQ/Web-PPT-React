import SearchSvg from "@/assets/images/search.svg";
import { GlobalContextMenu } from "@/components";
import type { MenuItem } from "@/hooks/useContextMenu";
import { textureItems } from "@/views/Menu/components/Start/texture";
import { ElementRenderer } from "@/utils/elementRenderer";
import {
  contextMenuStore,
  copyElementStore,
  elementActiveStore,
  fullscreenStore,
  menuActiveStore,
  pageActiveStore,
  pptStore,
  useCanvasZoomStore,
  useFullscreenStore,
  usePageActiveStore,
  usePPTStore,
  useRemarkEditActiveStore,
} from "@/store";
import type { Elements, Page } from "@/store/ppt";
import { getRandomId } from "@/utils";
import { globalEventBus } from "@/utils/eventBus";
import { initPPTStore } from "@/utils/initStore";
import { downloadImage, exportPageAsImage } from "@/utils/tool";
import {
  Clear,
  Clipboard,
  CloseOne,
  DividingLineOne,
  Export,
  GoEnd,
  GoStart,
  GridTwo,
  Left,
  Play,
  PreviewCloseOne,
  PreviewOpen,
  Right,
  Ruler,
} from "@icon-park/react";
import Guides from "@scena/react-guides";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";
import { PreviewCanvas } from "./PreviewCanvas";
import { RemarkEdit } from "./RemarkEdit";

interface CanvasProps {
  mode?: "preview" | "play" | "edit";
  page?: {
    id: string;
    elements: Array<Elements>;
  } & Partial<Page>;
  previewZoom?: number; // preview 模式下的缩放比例
}

const Component: FC<CanvasProps> = ({ mode = "edit", page, previewZoom }) => {
  // 使用 Zustand hooks 订阅状态变化
  const pages = usePPTStore((state) => state.pages);
  const pageActive = usePageActiveStore((state) => state.pageActive);
  const horizontalLineFromStore = usePPTStore((state) => state.horizontalLine);
  const verticalLineFromStore = usePPTStore((state) => state.verticalLine);

  const containerRef = useRef<HTMLDivElement>(null);
  const fitScale = useCanvasZoomStore((state) => state.fitScale);
  const zoomPercent = useCanvasZoomStore((state) => state.zoomPercent);
  const setFitScale = useCanvasZoomStore((state) => state.setFitScale);
  // edit 模式：适配缩放 × 用户百分比；其他模式本地占位
  const scale =
    mode === "edit"
      ? Math.max(fitScale * (zoomPercent / 100), 0.1)
      : 1;
  const [, forceUpdate] = useState(0); // 用于 play 模式强制重新渲染
  const lastContainerSizeRef = useRef({ width: 0, height: 0 });
  const [showEndMessage, setShowEndMessage] = useState(false); // 是否显示结束提示

  // Canvas 固定尺寸 - 使用常量避免重复声明
  const CANVAS_WIDTH = useMemo(() => 1000, []);
  const CANVAS_HEIGHT = useMemo(() => 700, []);

  // 计算容器适配缩放：由外部容器决定最大等比例尺寸，四周至少保留 20px
  const calculateScale = useMemoizedFn(() => {
    if (!containerRef.current || mode !== "edit") return;

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

    // 上下左右各至少 20px
    const PADDING = 20;
    const availableWidth = Math.max(currentSize.width - PADDING * 2, 1);
    const availableHeight = Math.max(currentSize.height - PADDING * 2, 1);

    // 宽高分别计算，取较小值以保持 1000:700 等比例，并默认放到最大
    const scaleX = availableWidth / CANVAS_WIDTH;
    const scaleY = availableHeight / CANVAS_HEIGHT;
    const newFitScale = Math.max(Math.min(scaleX, scaleY), 0.1);

    setFitScale(newFitScale);
  });

  // 初始化数据 - 只执行一次（作为备用，主要初始化在 App.tsx 中）
  useEffect(() => {
    initPPTStore();
  }, []);

  // 初始化缩放
  useEffect(() => {
    setTimeout(calculateScale, 0);
  }, [calculateScale]);

  // 监听全局点击事件，关闭右键菜单
  // 注意：react-contexify 已经内置了点击外部关闭菜单的功能
  // 这里只需要同步 contextMenuStore 的状态
  useEffect(() => {
    if (mode === "preview") {
      return;
    }

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;

      // 检查点击是否在菜单内部
      const menuElement = document.querySelector(
        '[data-contexify-root="true"]'
      );
      if (menuElement && menuElement.contains(target)) {
        // 如果点击在菜单内部，不处理
        // react-contexify 会自己处理菜单项的点击和关闭
        return;
      }

      // 如果菜单显示且点击在菜单外部，同步关闭 contextMenuStore
      // react-contexify 的 hideAll 会关闭菜单，但不会更新我们的 store
      if (contextMenuStore.isVisible()) {
        // 延迟执行，确保菜单项的 onClick 先执行
        setTimeout(() => {
          if (contextMenuStore.isVisible()) {
            contextMenuStore.hideMenu();
          }
        }, 100);
      }
    };

    // 使用较长的延迟，确保菜单项的 onClick 先执行
    document.addEventListener("click", handleDocumentClick, false);

    return () => {
      document.removeEventListener("click", handleDocumentClick, false);
    };
  }, [mode]);

  // 用于跟踪点击触发的动画状态
  const clickAnimationIndexRef = useRef<number>(0);
  const clickAnimationElementsRef = useRef<Array<Elements>>([]);
  const completedClickAnimationsRef = useRef<Set<string>>(new Set());
  const currentPageIdForClickAnimationRef = useRef<string>("");

  // 自动切换定时器
  const autoToggleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 切换到下一页的函数（供自动切换和点击切换共用）
  const goToNextPage = useMemoizedFn(() => {
    const pages = pptStore.getPages();
    const currentPageId = page?.id || pageActiveStore.getPageActive();
    const currentPage = page || pptStore.getActivePage(currentPageId as string);

    if (!currentPage) return;

    const currentPageIndex = pages.findIndex((p) => p.id === currentPageId);
    const isLastPage = currentPageIndex === pages.length - 1;

    // 先同步 pageActiveStore 到当前页面
    if (currentPageId) {
      pageActiveStore.setPageActive(currentPageId);
    }
    const lastPageId = pageActiveStore.getPageActive();
    const newPageId = pageActiveStore.goToNextPage();

    // 如果无法切换到下一页（已经是最后一页），显示结束提示
    if (isLastPage && lastPageId === newPageId) {
      setShowEndMessage(true);
      return;
    }

    // 如果可以切换，切换到下一页
    if (lastPageId !== newPageId && newPageId) {
      fullscreenStore.enterFullscreen(newPageId);
      setShowEndMessage(false);
    }
  });

  // 监听页面变化，重置结束提示状态和动画结束标志，设置自动切换定时器
  useEffect(() => {
    if (mode === "play") {
      setShowEndMessage(false);
      animationEndHandledRef.current = false;
      // 重置点击动画相关状态
      clickAnimationIndexRef.current = 0;
      clickAnimationElementsRef.current = [];
      completedClickAnimationsRef.current = new Set();
      currentPageIdForClickAnimationRef.current = "";

      // 清除之前的自动切换定时器
      if (autoToggleTimerRef.current) {
        clearTimeout(autoToggleTimerRef.current);
        autoToggleTimerRef.current = null;
      }

      // 检查是否开启自动切换
      const currentPageId = page?.id || pageActiveStore.getPageActive();
      const currentPage =
        page || (currentPageId ? pptStore.getActivePage(currentPageId) : null);

      if (currentPage) {
        const { autoToggle = false, autoToggleTime = 5 } = currentPage as any;

        if (autoToggle && autoToggleTime > 0) {
          // 设置自动切换定时器（时间单位：秒）
          autoToggleTimerRef.current = setTimeout(() => {
            goToNextPage();
          }, autoToggleTime * 1000);
        }
      }
    }

    // 清理函数：组件卸载或页面切换时清除定时器
    return () => {
      if (autoToggleTimerRef.current) {
        clearTimeout(autoToggleTimerRef.current);
        autoToggleTimerRef.current = null;
      }
    };
  }, [page, mode, goToNextPage]);

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
    if (mode === "preview" || mode === "play") {
      return;
    }

    // 检查点击的是否是画布本身（而不是其中的元素）
    if (e.target === e.currentTarget) {
      elementActiveStore.resetElementActive();
      // 取消选择时切换回开始页面
      menuActiveStore.setActiveMenu("start");
      // 关闭右键菜单（如果菜单显示的话）
      contextMenuStore.hideMenu();
    }
  });

  // 处理元素选中 - 优化版本
  const handleElementSelect = useMemoizedFn((elementId: string) => {
    // 预览和播放模式下不允许选择元素
    if (mode === "preview" || mode === "play") {
      return;
    }

    const currentActiveElement = elementActiveStore.getElementActive();

    if (currentActiveElement !== elementId) {
      elementActiveStore.setElementActive(elementId);
      contextMenuStore.hideMenu();
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

  // 根据 pageActive 获取当前页面，使用 hook 订阅状态变化确保响应式更新
  const currentPage = useMemo(() => {
    if (mode === "edit") {
      // edit 模式：使用 pageActive 从 pages 中查找
      return pageActive ? pages.find((p) => p.id === pageActive) : undefined;
    } else if (mode === "preview" && page) {
      // preview 模式：优先使用传入的 page prop，如果没有则从 pages 中查找
      return pages.find((p) => p.id === page.id) || page;
    } else {
      // play 模式或其他：使用传入的 page prop
      return page;
    }
  }, [mode, pageActive, pages, page]);

  // 获取页面背景属性
  const backgroundType = (currentPage as any)?.backgroundType || "solidColor";
  const background = (currentPage as any)?.background || "#fff";
  const bgColor = (currentPage as any)?.bgColor || "#9C92AC";
  const fgColor = (currentPage as any)?.fgColor || "#9C92AC";
  const bgOpacity = (currentPage as any)?.bgOpacity ?? 0.4;
  const selectedTexture = (currentPage as any)?.selectedTexture || "";

  // 生成背景样式
  const getBackgroundStyle = useMemoizedFn(() => {
    if (backgroundType === "solidColor") {
      return {
        backgroundColor: background,
        backgroundImage: "none",
      };
    } else if (backgroundType === "texture" && selectedTexture) {
      // 从 textureItems 中查找对应的纹理项
      const textureItem = textureItems.find(
        (item) => item.type === selectedTexture
      );
      let textureBackgroundImage = textureItem?.style.backgroundImage || "";

      // 替换 SVG 中的 fill 和 fill-opacity
      if (textureBackgroundImage) {
        // 将 fgColor 转换为 URL 编码格式（去掉 #，添加 %23）
        const encodedFgColor = fgColor.replace("#", "%23");

        // 替换 fill='%23------' 为 fill='%23' + fgColor（去掉#）
        textureBackgroundImage = textureBackgroundImage.replace(
          /fill='%23[0-9A-Fa-f]{6}'/g,
          `fill='${encodedFgColor}'`
        );

        // 替换 fill-opacity='----' 为 fill-opacity='' + bgOpacity
        textureBackgroundImage = textureBackgroundImage.replace(
          /fill-opacity='[^']*'/g,
          `fill-opacity='${bgOpacity}'`
        );
      }

      // 对于纹理背景，使用 bgColor 作为背景色，backgroundImage 从 textureItems 获取并替换颜色
      return {
        backgroundColor: bgColor,
        backgroundImage: textureBackgroundImage,
      };
    }
    return {
      backgroundColor: "#fff",
      backgroundImage: "none",
    };
  });

  const backgroundStyle = getBackgroundStyle();

  // 使用 Zustand hooks 订阅状态变化，确保组件能够响应状态更新
  const isFullscreen = useFullscreenStore((state) => state.isFullscreen);
  const gridType = usePPTStore((state) => state.gridType);
  const gridSize = usePPTStore((state) => state.gridSize);
  const guideLineShow = usePPTStore((state) => state.guideLineShow);

  const showLine = mode === "edit" && gridType === "line" && guideLineShow;
  // 标尺缩放跟随画布缩放（编辑模式使用 scale，播放/预览为 1）
  const rulerZoom = mode === "edit" ? scale : 1;
  const guideSnapStep = gridSize;
  const guideSnapThreshold = Math.max(1, Math.floor(guideSnapStep / 2));

  // Canvas 样式对象
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

    const baseStyle = {
      width: `${CANVAS_WIDTH}px`,
      height: `${CANVAS_HEIGHT}px`,
      left: "50%",
      top: "50%",
      marginLeft: `-${CANVAS_WIDTH / 2}px`,
      marginTop: `-${CANVAS_HEIGHT / 2}px`,
    };

    if (mode === "play") {
      // play 模式使用 zoom 进行缩放
      return {
        ...baseStyle,
        zoom: computedScale,
      };
    } else {
      // 其他模式使用 transform 进行缩放
      return {
        ...baseStyle,
        transform: `scale(${computedScale})`,
        transformOrigin: "center center",
      };
    }
  };

  const canvasStyle = getCanvasStyle();

  // 渲染元素列表（使用 json-render 简化渲染逻辑）
  const renderElements = useMemoizedFn((isEditMode: boolean) => {
    if (!currentPage) return null;

    return (
      <ElementRenderer
        elements={currentPage.elements}
        mode={mode}
        onElementSelect={isEditMode ? handleElementSelect : undefined}
      />
    );
  });

  // 播放模式右键菜单处理
  const handlePlayContextMenu = useMemoizedFn((e: React.MouseEvent) => {
    if (mode !== "play") return;

    e.preventDefault();
    e.stopPropagation();

    const pages = pptStore.getPages();
    // 在 play 模式下，优先使用 page?.id，如果没有则使用 fullscreenStore 的 currentSlidePageId
    const currentPageId =
      page?.id ||
      fullscreenStore.getCurrentSlidePageId() ||
      pageActiveStore.getPageActive();
    const currentPageIndex = pages.findIndex((p) => p.id === currentPageId);

    // 使用 MenuItem 类型定义菜单项
    const menuItems: MenuItem[] = [
      {
        type: "item",
        label: "上一页",
        onClick: () => {
          if (currentPageIndex > 0) {
            const prevPageId =
              pages[showEndMessage ? currentPageIndex : currentPageIndex - 1]
                .id;
            pageActiveStore.setPageActive(prevPageId);
            fullscreenStore.enterFullscreen(prevPageId);
            setShowEndMessage(false);
          }
        },
        icon: <Left theme="outline" size="13" fill="#333" />,
        disabled: currentPageIndex === 0,
      },
      {
        type: "item",
        label: "下一页",
        onClick: () => {
          if (currentPageIndex < pages.length - 1) {
            // 直接计算下一页的ID，不依赖 pageActiveStore
            const nextPageId = pages[currentPageIndex + 1].id;
            pageActiveStore.setPageActive(nextPageId);
            fullscreenStore.enterFullscreen(nextPageId);
            setShowEndMessage(false);
          } else {
            // 如果无法切换，显示结束提示
            setShowEndMessage(true);
          }
        },
        icon: <Right theme="outline" size="13" fill="#333" />,
        disabled: currentPageIndex === pages.length - 1,
      },
      {
        type: "item",
        label: "第一页",
        onClick: () => {
          if (pages.length > 0) {
            const firstPageId = pages[0].id;
            pageActiveStore.setPageActive(firstPageId);
            fullscreenStore.enterFullscreen(firstPageId);
            setShowEndMessage(false);
          }
        },
        icon: <GoStart theme="outline" size="13" fill="#333" />,
        disabled: currentPageIndex === 0,
      },
      {
        type: "item",
        label: "最后一页",
        onClick: () => {
          if (pages.length > 0) {
            const lastPageId = pages[pages.length - 1].id;
            pageActiveStore.setPageActive(lastPageId);
            fullscreenStore.enterFullscreen(lastPageId);
            setShowEndMessage(false);
          }
        },
        icon: <GoEnd theme="outline" size="13" fill="#333" />,
        disabled: currentPageIndex === pages.length - 1,
      },
      {
        type: "separator",
      },
      {
        type: "item",
        label: "结束放映",
        onClick: () => {
          // 关闭菜单
          contextMenuStore.hideMenu();

          // 退出全屏模式
          fullscreenStore.exitFullscreen();
          // 同步更新编辑模式的当前页
          if (currentPageId) {
            pageActiveStore.setPageActive(currentPageId);
          }
          setShowEndMessage(false);
        },
        icon: (
          <CloseOne
            theme="multi-color"
            size="13"
            fill={["#ff8501", "#ff8501", "#FFF", "#43CCF8"]}
          />
        ),
      },
    ];

    contextMenuStore.showMenu(e.clientX, e.clientY, menuItems);
  });

  // 处理前进（下一页）的逻辑，包含动画处理
  const handlePlayNext = useMemoizedFn(() => {
    if (mode !== "play") return;

    // 如果菜单显示，不触发切换
    if (contextMenuStore.isVisible()) {
      return;
    }

    // 如果已经显示了结束提示，点击退出全屏
    if (showEndMessage) {
      fullscreenStore.exitFullscreen();
      setShowEndMessage(false);
      return;
    }

    const pages = pptStore.getPages();
    // 使用传入的 page prop 或从 pageActiveStore 获取当前页面
    const currentPageId = page?.id || pageActiveStore.getPageActive();
    const currentPage = page || pptStore.getActivePage(currentPageId as string);

    if (!currentPage) return;

    // 获取当前页面的所有元素
    const allElements = pptStore.getAllElementInfo(currentPage.id);

    // 筛选出有 animationName 且 animationTrigger 为 "click" 的元素
    const clickAnimationElements = allElements.filter(
      (element) =>
        element.animationName &&
        element.animationName !== "" &&
        element.animationTrigger === "click"
    );

    // 如果当前页面没有点击动画元素，直接允许切换
    if (clickAnimationElements.length === 0) {
      const currentPageIndex = pages.findIndex((p) => p.id === currentPageId);
      const isLastPage = currentPageIndex === pages.length - 1;

      const { clickToNext = true } = currentPage as any;
      if (!clickToNext) {
        return;
      }

      // 先同步 pageActiveStore 到当前页面
      if (currentPageId) {
        pageActiveStore.setPageActive(currentPageId);
      }
      const lastPageId = pageActiveStore.getPageActive();
      const newPageId = pageActiveStore.goToNextPage();

      // 如果无法切换到下一页（已经是最后一页），显示结束提示
      if (isLastPage && lastPageId === newPageId) {
        setShowEndMessage(true);
        return;
      }

      // 如果可以切换，切换到下一页
      if (lastPageId !== newPageId && newPageId) {
        fullscreenStore.enterFullscreen(newPageId);
        setShowEndMessage(false);
      }
      return;
    }

    // 按照 animationIndex 进行排序
    const sortedClickElements = [...clickAnimationElements].sort((a, b) => {
      const indexA = a.animationIndex ?? 0;
      const indexB = b.animationIndex ?? 0;
      return indexA - indexB;
    });

    // 检查是否需要重新初始化（页面切换或首次点击）
    const needsReinit =
      clickAnimationElementsRef.current.length === 0 ||
      currentPageIdForClickAnimationRef.current !== currentPageId;

    if (needsReinit) {
      clickAnimationElementsRef.current = sortedClickElements;
      clickAnimationIndexRef.current = 0;
      completedClickAnimationsRef.current = new Set();
      currentPageIdForClickAnimationRef.current = currentPageId || "";
    }

    // 如果还有未触发的动画，触发下一个动画
    if (
      clickAnimationIndexRef.current < clickAnimationElementsRef.current.length
    ) {
      const currentElement =
        clickAnimationElementsRef.current[clickAnimationIndexRef.current];
      console.log(currentElement, "currentElement");

      if (currentElement) {
        // 触发当前元素的动画
        globalEventBus.emit(`animation-play-${currentElement.id}`);
        // 移动到下一个索引
        clickAnimationIndexRef.current += 1;
      }
    } else {
      // 所有动画都已触发，检查是否都已完成
      const allCompleted =
        completedClickAnimationsRef.current.size ===
        clickAnimationElementsRef.current.length;

      if (allCompleted) {
        // 所有动画都已完成，切换到下一页
        const { clickToNext = true } = currentPage as any;
        if (!clickToNext) {
          return;
        }

        // 清除自动切换定时器（因为手动点击切换）
        if (autoToggleTimerRef.current) {
          clearTimeout(autoToggleTimerRef.current);
          autoToggleTimerRef.current = null;
        }

        goToNextPage();
      }
      // 如果还有动画未完成，等待动画完成事件
    }
  });

  // 点击事件处理（复用前进逻辑）
  const playCanvasClickHandle = useMemoizedFn(() => {
    handlePlayNext();
  });

  // 监听点击动画的结束事件，更新完成状态
  useEffect(() => {
    if (mode !== "play") return;

    const currentPageId = page?.id || pageActiveStore.getPageActive() || "";
    if (!currentPageId) return;

    const allElements = pptStore.getAllElementInfo(currentPageId);
    const clickAnimationElements = allElements.filter(
      (element) =>
        element.animationName &&
        element.animationName !== "" &&
        element.animationTrigger === "click"
    );

    // 为每个点击动画元素注册动画结束监听
    const handlers: Array<() => void> = [];

    clickAnimationElements.forEach((element) => {
      const eventName = `animation-end-${element.id}`;
      const handler = () => {
        // 标记该动画已完成
        completedClickAnimationsRef.current.add(element.id);
      };
      globalEventBus.on(eventName, handler);
      handlers.push(() => {
        globalEventBus.off(eventName, handler);
      });
    });

    return () => {
      handlers.forEach((cleanup) => cleanup());
    };
  }, [mode, page?.id]);

  // 用于防止重复执行的标志
  const animationEndHandledRef = useRef(false);

  // 处理页面切换动画结束事件
  const handleAnimationEnd = useMemoizedFn(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (mode !== "play") return;

      // 只处理页面容器本身的动画结束事件，忽略子元素的动画事件
      const target = e.target as HTMLElement;
      const containerId =
        mode === "play"
          ? "play-canvas-container"
          : "preview-canvas-container-" + page?.id;

      if (target.id !== containerId) return;

      // 防止重复执行
      if (animationEndHandledRef.current) return;
      animationEndHandledRef.current = true;

      // 获取当前页面
      const currentPage =
        page ||
        pptStore.getActivePage(pageActiveStore.getPageActive() as string);

      if (!currentPage) {
        animationEndHandledRef.current = false;
        return;
      }

      const allElements = pptStore.getAllElementInfo(currentPage.id);
      allElements.forEach((element) => {
        if (element.animationName && element.animationName !== "") {
          if (element.animationTrigger === "default") {
            globalEventBus.emit(`animation-play-${element.id}`);
          }
        }
      });

      // 延迟重置标志，确保只执行一次
      setTimeout(() => {
        animationEndHandledRef.current = false;
      }, 100);
    }
  );

  const CanvasContainer = useMemoizedFn(() => {
    // 编辑模式：支持交互、右键菜单等
    if (mode === "edit") {
      return (
        <div
          id="canvas-container"
          className="absolute overflow-hidden transition-transform duration-200 ease-in-out rounded-[10px]"
          style={{
            ...canvasStyle,
            ...backgroundStyle,
            boxShadow:
              "0 1px 3px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)",
          }}
          onTransitionEnd={updateCanvasOffset}
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

              // 获取当前页面信息
              const currentPageId = pageActiveStore.getPageActive();
              const currentPage = currentPageId
                ? pptStore.getActivePage(currentPageId)
                : undefined;
              const isPageVisible = currentPage?.visible !== false;

              // 构建右键菜单项
              menuItems.push(
                // 粘贴
                {
                  type: "item",
                  label: "粘贴",
                  onClick: () => {
                    handleCanvasPaste(canvasX, canvasY);
                    closeMenu();
                  },
                  icon: <Clipboard theme="outline" size="13" fill="#333" />,
                  disabled: !copyElementStore.hasCopiedElement(),
                },
                // 分隔线
                {
                  type: "separator",
                },
                // 网格线设置
                {
                  type: "submenu",
                  label: "网格线",
                  icon: <GridTwo theme="outline" size="13" fill="#333" />,
                  children: [
                    {
                      type: "item",
                      label: "10×10",
                      onClick: () => {
                        pptStore.setGridType("grid");
                        pptStore.setGridSize(10);
                        closeMenu();
                      },
                      disabled: gridType === "grid" && gridSize === 10,
                    },
                    {
                      type: "item",
                      label: "20×20",
                      onClick: () => {
                        pptStore.setGridType("grid");
                        pptStore.setGridSize(20);
                        closeMenu();
                      },
                      disabled: gridType === "grid" && gridSize === 20,
                    },
                    {
                      type: "item",
                      label: "30×30",
                      onClick: () => {
                        pptStore.setGridType("grid");
                        pptStore.setGridSize(30);
                        closeMenu();
                      },
                      disabled: gridType === "grid" && gridSize === 30,
                    },
                    {
                      type: "item",
                      label: "40×40",
                      onClick: () => {
                        pptStore.setGridType("grid");
                        pptStore.setGridSize(40);
                        closeMenu();
                      },
                      disabled: gridType === "grid" && gridSize === 40,
                    },
                  ],
                },
                // 标尺
                {
                  type: "item",
                  label: gridType === "line" ? "隐藏标尺" : "显示标尺",
                  onClick: () => {
                    if (gridType === "line") {
                      pptStore.setGridType("none");
                    } else {
                      pptStore.setGridType("line");
                    }
                    closeMenu();
                  },
                  icon: <Ruler theme="outline" size="13" fill="#333" />,
                },
                // 参考线
                {
                  type: "item",
                  label: guideLineShow ? "隐藏参考线" : "显示参考线",
                  onClick: () => {
                    pptStore.setGuideLineShow(!guideLineShow);
                    closeMenu();
                  },
                  icon: (
                    <DividingLineOne theme="outline" size="13" fill="#333" />
                  ),
                  disabled: gridType !== "line",
                },
                // 清除参考线
                {
                  type: "item",
                  label: "清除参考线",
                  onClick: () => {
                    pptStore.setHorizontalLine([]);
                    pptStore.setVerticalLine([]);
                    closeMenu();
                  },
                  icon: <Clear theme="outline" size="13" fill="#333" />,
                  disabled: gridType !== "line",
                },
                // 分隔线
                {
                  type: "separator",
                },
                // 重置幻灯片
                {
                  type: "item",
                  label: "重置幻灯片",
                  onClick: () => {
                    if (currentPageId) {
                      const pages = [...pptStore.getPages()];
                      const pageIndex = pages.findIndex(
                        (p) => p.id === currentPageId
                      );
                      if (pageIndex !== -1) {
                        pages[pageIndex] = {
                          ...pages[pageIndex],
                          elements: [],
                        };
                        pptStore.setPages(pages);
                        elementActiveStore.resetElementActive();
                        menuActiveStore.resetMenu();
                      }
                    }
                    closeMenu();
                  },
                  icon: <Clear theme="outline" size="13" fill="#333" />,
                },
                // 隐藏/显示幻灯片
                {
                  type: "item",
                  label: isPageVisible ? "隐藏幻灯片" : "显示幻灯片",
                  onClick: () => {
                    if (currentPageId) {
                      pptStore.togglePageVisible(currentPageId);
                    }
                    closeMenu();
                  },
                  icon: isPageVisible ? (
                    <PreviewCloseOne theme="outline" size="13" fill="#333" />
                  ) : (
                    <PreviewOpen theme="outline" size="13" fill="#333" />
                  ),
                },
                // 播放幻灯片
                {
                  type: "item",
                  label: "播放幻灯片",
                  onClick: () => {
                    if (currentPageId) {
                      fullscreenStore.enterFullscreen(currentPageId);
                    }
                    closeMenu();
                  },
                  icon: <Play theme="outline" size="13" fill="#333" />,
                  disabled: !isPageVisible,
                },
                // 导出图片
                {
                  type: "item",
                  label: "导出图片",
                  onClick: async () => {
                    if (currentPageId) {
                      const dataUrl = await exportPageAsImage(currentPageId);
                      if (dataUrl) {
                        const name = pptStore.getName();
                        downloadImage(
                          dataUrl,
                          `${name || "未命名"}_${currentPageId}.png`
                        );
                      }
                    }
                    closeMenu();
                  },
                  icon: <Export theme="outline" size="13" fill="#333" />,
                }
              );

              elementActiveStore.resetElementActive();
              menuActiveStore.resetMenu();

              // 显示全局右键菜单
              contextMenuStore.showMenu(e.clientX, e.clientY, menuItems);
              return;
            }

            // 显示全局右键菜单
            contextMenuStore.showMenu(e.clientX, e.clientY, menuItems);
          }}
        >
          {gridType === "grid" && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${gridSize - 1}px, #e5e5e5 ${gridSize}px), repeating-linear-gradient(90deg, transparent, transparent ${gridSize - 1}px, #e5e5e5 ${gridSize}px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
            />
          )}
          {renderElements(true)}
        </div>
      );
    }

    // 在 play 模式下优先使用传入的 page prop，否则从 pages 中查找
    // preview 模式下也从 pages 中查找，确保能响应页面内容变化
    const currentPage =
      mode === "play" && page
        ? page
        : mode === "preview" && page
          ? pages.find((p) => p.id === page.id) || page
          : pageActive
            ? pages.find((p) => p.id === pageActive)
            : undefined;
    const {
      toggleInAnimation = "",
      toggleInDelay = "0",
      toggleInDuration = "default",
    } = (currentPage as any) || {};

    let animationClassName = "";

    if (mode === "play" && toggleInAnimation !== "") {
      animationClassName = `animate__animated animate__${toggleInAnimation}`;
      if (toggleInDelay) {
        animationClassName +=
          toggleInDelay == "0s" ? "" : ` animate__delay-${toggleInDelay}`;
      }
      if (toggleInDuration) {
        animationClassName +=
          toggleInDuration == "default" ? "" : ` animate__${toggleInDuration}`;
      }
    }

    // 预览模式或播放模式：只读，不支持交互
    return (
      <div
        id={
          mode === "play"
            ? "play-canvas-container"
            : "preview-canvas-container-" + page?.id
        }
        className={`${animationClassName} absolute overflow-hidden transition-transform duration-200 ease-in-out`}
        style={{
          ...canvasStyle,
          ...(showEndMessage ? { backgroundColor: "#000" } : backgroundStyle),
        }}
        onClick={mode === "play" ? playCanvasClickHandle : undefined}
        onContextMenu={mode === "play" ? handlePlayContextMenu : undefined}
        onAnimationEnd={mode === "play" ? handleAnimationEnd : undefined}
      >
        {renderElements(false)}
        {mode === "play" && showEndMessage && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer text-[15px] bg-[#000] text-[#fff] z-[9999]">
            放映结束，单击鼠标退出
          </div>
        )}
      </div>
    );
  });

  // 获取页面ID用于生成唯一的容器ID
  const pageId =
    mode === "edit" ? pageActive || "default" : page?.id || "default";

  const remarkEditActive = useRemarkEditActiveStore(
    (state) => state.remarkEditActive
  );

  // 获取当前页面的 remark 属性，使用 hook 订阅状态变化
  const currentPageRemark = useMemo(() => {
    if (mode === "edit") {
      if (!pageActive) return "";
      const activePage = pages.find((p) => p.id === pageActive);
      return (activePage as any)?.remark || "";
    }
    return (page as any)?.remark || "";
  }, [mode, pageActive, pages, page]);

  // 本地 state 存储 remark 值，用于即时更新 UI
  const [localRemark, setLocalRemark] = useState(currentPageRemark);

  // 当页面切换或 store 中的 remark 变化时，同步更新本地 state
  useEffect(() => {
    setLocalRemark(currentPageRemark);
  }, [currentPageRemark]);

  // 更新页面 remark 属性的函数
  const updatePageRemark = useMemoizedFn((remark: string) => {
    if (mode !== "edit") return;

    const pageActive = pageActiveStore.getPageActive();
    if (!pageActive) return;

    const page = pptStore.getActivePage(pageActive);
    if (!page) return;

    const pageIndex = pptStore.getPages().findIndex((p) => p.id === pageActive);
    if (pageIndex === -1) return;

    const newPages = [...pptStore.getPages()];
    newPages[pageIndex] = {
      ...newPages[pageIndex],
      remark,
    } as any;
    pptStore.setPages(newPages);
  });

  // 防抖定时器引用
  const remarkDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 防抖处理备注变更：先更新本地 state，再通过防抖更新 Zustand store
  const handleRemarkChange = useCallback(
    (value: string) => {
      // 先更新本地 state，立即反映到 UI
      setLocalRemark(value);

      // 清除之前的定时器
      if (remarkDebounceTimerRef.current) {
        clearTimeout(remarkDebounceTimerRef.current);
      }

      // 防抖更新 Zustand store
      remarkDebounceTimerRef.current = setTimeout(() => {
        updatePageRemark(value);
      }, 300);
    },
    [updatePageRemark]
  );

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (remarkDebounceTimerRef.current) {
        clearTimeout(remarkDebounceTimerRef.current);
      }
    };
  }, []);

  // 动态生成 className（全屏优先）
  const getContainerClassName = () => {
    // 如果全屏，优先使用全屏样式
    if (isFullscreen) {
      return "flex items-center justify-center w-full h-full relative";
    }

    // 非全屏时根据 mode 使用不同样式
    if (mode === "edit") {
      if (gridType === "line") {
        return `relative overflow-hidden bg-transparent ${remarkEditActive ? "h-[calc(100%-32px)]" : "h-full"}`;
      }
      return (
        "w-full relative overflow-hidden bg-transparent" +
        (remarkEditActive ? " h-[calc(100%-32px)]" : " h-full")
      );
    }

    // preview 和 play 模式
    return "w-full h-full relative";
  };

  const containerClassName = getContainerClassName();

  // 动态生成 style（用于 preview/play 模式的 zoom）
  // 获取容器样式
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

    if (mode === "edit" && gridType === "line") {
      return {
        width: `calc(100% - 23px)`,
        height: `calc(100% - 23px - ${remarkEditActive ? 32 : 0}px)`,
        marginLeft: "23px",
        marginTop: "23px",
      };
    }

    return undefined;
  };

  const containerStyle = getContainerStyle();

  // 标尺容器尺寸，需扣除 23px
  const [rulerSize, setRulerSize] = useState({ width: 0, height: 0 });
  // canvas-container 相对于 parent-canvas-container 的偏移
  const [canvasOffset, setCanvasOffset] = useState({ left: 0, top: 0 });
  // 是否正在调整大小（用于显示蒙层）
  const [showResizeOverlay, setShowResizeOverlay] = useState(false);
  // Guides 组件的 ref
  const horizontalGuidesRef = useRef<any>(null);
  const verticalGuidesRef = useRef<any>(null);

  const updateRulerSize = useMemoizedFn(() => {
    const container = document.getElementById(
      `parent-canvas-container-${pageId}`
    );
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const width = Math.max(0, rect.width - 23);
    const height = Math.max(0, rect.height - 23);

    setRulerSize((prev) => {
      if (prev.width !== width || prev.height !== height) {
        return { width, height };
      }
      return prev;
    });
    // updateCanvasOffset();
  });

  // 计算 canvas-container 的偏移
  const updateCanvasOffset = useMemoizedFn((e?: React.TransitionEvent) => {
    // 如果是 transitionend 事件，只处理 transform 属性的过渡
    if (e && e.propertyName !== "transform") {
      return;
    }

    const parentContainer = document.getElementById(
      `parent-canvas-container-${pageId}`
    );
    if (!parentContainer) return;

    const parentRect = parentContainer.getBoundingClientRect();

    // 画布固定尺寸
    const CANVAS_WIDTH = 1000;
    const CANVAS_HEIGHT = 700;

    // 使用当前的缩放比例
    const canvasScale = scale;

    // 计算画布在父容器中的逻辑位置（未缩放前的坐标）
    // 画布使用 left: 50%, marginLeft: -500px 来居中
    // 实际位置 = 父容器宽度 / 2 - 500
    // 逻辑位置（缩放前）= 实际位置 / 缩放比例 = (父容器宽度 / 2 - 500) / scale
    const parentWidth = parentRect.width;
    const parentHeight = parentRect.height;

    // 画布逻辑位置（相对于父容器的左上角）
    const logicalLeft = parentWidth / 2 / canvasScale - CANVAS_WIDTH / 2;
    const logicalTop = parentHeight / 2 / canvasScale - CANVAS_HEIGHT / 2;

    setCanvasOffset((prev) => {
      if (prev.left !== logicalLeft || prev.top !== logicalTop) {
        return { left: logicalLeft, top: logicalTop };
      }
      return prev;
    });
  });

  const { run: debouncedHandleResizeEnd } = useDebounceFn(
    () => {
      updateRulerSize();
      // 等待画布过渡动画结束后再计算偏移
      setTimeout(() => {
        updateCanvasOffset();
      }, 250); // 等待 200ms 动画 + 50ms 缓冲
      setTimeout(() => {
        setShowResizeOverlay(false);
      }, 300);
    },
    {
      wait: 150,
    }
  );

  useEffect(() => {
    // 只在 edit 模式下监听 resize
    if (mode !== "edit" || gridType !== "line") {
      return;
    }

    updateRulerSize();

    // 等待画布过渡动画结束后再计算偏移
    // 画布有 transition-transform duration-200 的过渡动画
    const timer = setTimeout(() => {
      updateCanvasOffset();
    }, 250); // 等待 200ms 动画 + 50ms 缓冲

    const resizeHandle = () => {
      setShowResizeOverlay(true);
      debouncedHandleResizeEnd();
    };

    window.addEventListener("resize", resizeHandle);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resizeHandle);
    };
  }, [
    pageId,
    mode,
    gridType,
    scale,
    updateRulerSize,
    debouncedHandleResizeEnd,
    updateCanvasOffset,
    remarkEditActive,
  ]);

  // 当 rulerZoom 或 canvasOffset 变化时，更新 Guides 的 scrollPos
  // 如果组件不支持 scrollPos 属性的响应式更新，通过 ref 调用 scrollGuides
  useEffect(() => {
    if (
      gridType === "line" &&
      (horizontalGuidesRef.current || verticalGuidesRef.current)
    ) {
      if (horizontalGuidesRef.current) {
        horizontalGuidesRef.current.scrollGuides(-canvasOffset.top, rulerZoom);
      }
      if (verticalGuidesRef.current) {
        verticalGuidesRef.current.scrollGuides(-canvasOffset.left, rulerZoom);
      }
    }
  }, [rulerZoom, canvasOffset.top, canvasOffset.left, gridType]);

  // 使用从 store 订阅的参考线数据并转换为数字数组
  const horizontalLine = useMemo(
    () => horizontalLineFromStore.map(Number),
    [horizontalLineFromStore]
  );
  const verticalLine = useMemo(
    () => verticalLineFromStore.map(Number),
    [verticalLineFromStore]
  );

  // 监听参考线变化，通过 ref 调用 loadGuides 或 setState 更新 Guides 组件
  useEffect(() => {
    if (gridType !== "line" || mode !== "edit") {
      return;
    }

    // 更新水平参考线
    if (horizontalGuidesRef.current) {
      // 尝试调用 loadGuides 方法
      if (typeof horizontalGuidesRef.current.loadGuides === "function") {
        horizontalGuidesRef.current.loadGuides(horizontalLine);
      }
      // 如果 loadGuides 不存在，尝试使用 setState
      else if (typeof horizontalGuidesRef.current.setState === "function") {
        horizontalGuidesRef.current.setState({ guides: horizontalLine });
      }
    }

    // 更新垂直参考线
    if (verticalGuidesRef.current) {
      // 尝试调用 loadGuides 方法
      if (typeof verticalGuidesRef.current.loadGuides === "function") {
        verticalGuidesRef.current.loadGuides(verticalLine);
      }
      // 如果 loadGuides 不存在，尝试使用 setState
      else if (typeof verticalGuidesRef.current.setState === "function") {
        verticalGuidesRef.current.setState({ guides: verticalLine });
      }
    }
  }, [horizontalLine, verticalLine, gridType, mode]);

  const computedUnit = useMemo(() => {
    if (scale > 1.5) return 25;
    else if (scale > 0.75 && scale <= 1.5) return 50;
    else if (scale > 0.4 && scale <= 0.75) return 100;
    else if (scale > 0.2 && scale <= 0.4) return 200;
    else return 400;
  }, [scale]);

  return (
    <div
      className={`h-full flex-1 relative ${mode === "edit" ? "bg-transparent" : "bg-[#f0f1f3]"}`}
      id={mode === "edit" ? "ruler-container" : undefined}
    >
      {/* resize 时的蒙层 */}
      {mode === "edit" && (
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          style={{
            pointerEvents: "none",
            opacity: showResizeOverlay ? 1 : 0,
            background: showResizeOverlay
              ? "rgba(255, 255, 255, 0.5)"
              : "transparent",
            zIndex: showResizeOverlay ? 9999 : -1,
            backdropFilter: showResizeOverlay ? "blur(20px)" : "none",
            WebkitBackdropFilter: showResizeOverlay ? "blur(20px)" : "none",
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          <img src={SearchSvg} alt="search" className="w-[100px] h-[100px]" />
        </div>
      )}
      {gridType === "line" && mode === "edit" && (
        <>
          <Guides
            ref={horizontalGuidesRef}
            showGuides={showLine}
            useResizeObserver={true}
            type="horizontal"
            width={rulerSize.width}
            height={23}
            unit={computedUnit}
            zoom={rulerZoom}
            displayDragPos={false}
            backgroundColor="#fafafa"
            lineColor="#d9d9d9"
            textColor="#999"
            font="12px"
            textOffset={[0, 9]}
            snapThreshold={guideSnapThreshold}
            scrollPos={-canvasOffset.left}
            style={{
              position: "absolute",
              top: 0,
              left: 23,
              zIndex: 2,
              height: 23,
              width: "calc(100% - 23px)",
              pointerEvents: "auto",
            }}
            guides={horizontalLine}
            onChangeGuides={(v) => {
              pptStore.setHorizontalLine([...v.guides]);
            }}
          />
          <Guides
            ref={verticalGuidesRef}
            showGuides={showLine}
            useResizeObserver={true}
            type="vertical"
            width={23}
            height={rulerSize.height}
            unit={computedUnit}
            zoom={rulerZoom}
            displayDragPos={false}
            backgroundColor="#fafafa"
            lineColor="#d9d9d9"
            textColor="#999"
            font="12px"
            textOffset={[9, 0]}
            snapThreshold={guideSnapThreshold}
            scrollPos={-canvasOffset.top}
            style={{
              position: "absolute",
              top: "23px",
              left: 0,
              zIndex: 2,
              width: "23px",
              height: `calc(100% - 23px - ${remarkEditActive ? 32 : 0}px)`,
              pointerEvents: "auto",
            }}
            guides={verticalLine}
            onChangeGuides={(v) => pptStore.setVerticalLine(v.guides)}
          />
          <div className="w-[23px] text-[11px] text-[#ccc] h-[23px] bg-[#fafafa] absolute top-0 left-0 flex items-center justify-center">
            px
          </div>
        </>
      )}
      <div
        ref={containerRef}
        id={
          mode !== "preview" ? `parent-canvas-container-${pageId}` : undefined
        }
        className={containerClassName}
        style={containerStyle}
      >
        {mode === "play" && (
          <GlobalContextMenu
            parentSelector={`#parent-canvas-container-${pageId}`}
          />
        )}
        <CanvasContainer />
      </div>
      {mode === "edit" && remarkEditActive && (
        <RemarkEdit value={localRemark} onChange={handleRemarkChange} />
      )}
    </div>
  );
};

/** preview 走轻量 PreviewCanvas，避免挂载完整编辑/播放态逻辑 */
export const Canvas: FC<CanvasProps> = (props) => {
  if (props.mode === "preview") {
    if (!props.page) return null;
    return (
      <PreviewCanvas
        page={props.page as Page}
        previewZoom={props.previewZoom}
      />
    );
  }
  return <Component {...props} />;
};
