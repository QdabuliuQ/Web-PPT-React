import {
  contextMenuStore,
  elementActiveStore,
  fullscreenStore,
  menuActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import type { Page } from "@/store/ppt";
import { initPPTStore } from "@/utils/initStore";
import {
  addPageAndActivate,
  copyActiveElement,
  cutActiveElement,
  deleteActiveElement,
  deletePageAndFallback,
  duplicatePageAndActivate,
  resetPageElements,
} from "@/utils/operate";
import { showPageContextMenu } from "@/utils/pageContextMenu";
import {
  Add,
  Down,
  PlayOne,
  Plus,
  PreviewCloseOne,
  Up,
} from "@icon-park/react";
import { useKeyPress, useMemoizedFn, useMount } from "ahooks";
import { Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useRef, useState, type FC } from "react";
import { Canvas } from "../Canvas";
import styles from "./index.module.less";

const PageItem: FC<{
  page: Page;
  index: number;
  scale: number;
  totalPages: number;
  onPageClick: (pageId: string) => void;
  onContextMenu: (e: React.MouseEvent, pageId: string) => void;
  onPlayPage: (pageId: string, e: React.MouseEvent) => void;
  onMovePageUp: (pageId: string, e: React.MouseEvent) => void;
  onMovePageDown: (pageId: string, e: React.MouseEvent) => void;
  onAddPageAfter: (pageId: string, e: React.MouseEvent) => void;
  pageItemRef: React.RefObject<HTMLDivElement> | null;
}> = observer(
  ({
    page,
    index,
    scale,
    totalPages,
    onPageClick,
    onContextMenu,
    onPlayPage,
    onMovePageUp,
    onMovePageDown,
    onAddPageAfter,
    pageItemRef,
  }) => {
    const isActive = pageActiveStore.pageActive === page.id;

    return (
      <div
        className={`${styles.pageItem} relative mr-[15px] cursor-pointer flex gap-[8px]`}
      >
        <span
          className={`text-[13px] mt-[5px] font-bold ${
            isActive ? "text-primary" : "text-[#9b9b9b]"
          }`}
        >
          {index + 1}
        </span>
        <div
          className={`flex-1 relative rounded-lg ${
            isActive ? "shadow-[0_0_0_2px_#f25f00]" : ""
          }`}
          onClick={() => onPageClick(page.id)}
          onContextMenu={(e) => onContextMenu(e, page.id)}
        >
          <div
            ref={index === 0 ? pageItemRef : null}
            className="previewCanvas relative w-full rounded-lg overflow-hidden aspect-[10/7] pointer-events-none"
          >
            {page.visible === false && (
              <div
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/10 rounded-lg z-10 pointer-events-auto"
                onClick={() => onPageClick(page.id)}
                onContextMenu={(e) => onContextMenu(e, page.id)}
              >
                <PreviewCloseOne theme="outline" size="24" fill="#333" />
              </div>
            )}
            <Canvas mode="preview" page={page} previewZoom={scale} />
          </div>
        </div>
        <div className="floatButton absolute bottom-[-12px] right-[13px] z-10 w-[80%] flex items-center justify-between opacity-0 transition-opacity">
          <div
            className="flex items-center justify-center w-[26px] h-[26px] bg-[#fff] rounded-[50%] opacity-[0.7] hover:opacity-[1] transition-opacity shadow-[0_0_8px_rgba(0,0,0,0.15)] cursor-pointer"
            onClick={(e) => onPlayPage(page.id, e)}
          >
            <PlayOne theme="filled" size="18" fill="#f25f00" />
          </div>
          <div className="flex items-center gap-[10px]">
            {index > 0 && (
              <div
                className="flex items-center justify-center w-[26px] h-[26px] bg-[#f25f00] rounded-[50%] opacity-[0.7] hover:opacity-[1] transition-opacity shadow-[0_0_8px_rgba(0,0,0,0.15)] cursor-pointer"
                onClick={(e) => onMovePageUp(page.id, e)}
              >
                <Up theme="outline" size="18" fill="#fff" />
              </div>
            )}
            {index < totalPages - 1 && (
              <div
                className="flex items-center justify-center w-[26px] h-[26px] bg-[#f25f00] rounded-[50%] opacity-[0.7] hover:opacity-[1] transition-opacity shadow-[0_0_8px_rgba(0,0,0,0.15)] cursor-pointer"
                onClick={(e) => onMovePageDown(page.id, e)}
              >
                <Down theme="outline" size="18" fill="#fff" />
              </div>
            )}
            <div
              className="flex items-center justify-center w-[26px] h-[26px] bg-[#f25f00] rounded-[50%] opacity-[0.7] hover:opacity-[1] transition-opacity shadow-[0_0_8px_rgba(0,0,0,0.15)] cursor-pointer"
              onClick={(e) => onAddPageAfter(page.id, e)}
            >
              <Plus theme="outline" size="18" fill="#fff" />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const PreviewComponent: FC = () => {
  // 在组件顶层直接访问 observable，确保 MobX 能追踪到
  // 这很重要：必须在组件函数体的顶层访问，而不是在嵌套函数中
  const pages = pptStore.pages;

  // 添加调试日志，确认组件是否重新渲染
  console.log("PreviewComponent render, pages count:", pages.length);

  useMount(() => {
    if (pptStore.pages.length === 0) {
      initPPTStore();
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<any>(null);
  const pageItemRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scrollHeight, setScrollHeight] = useState(0);

  // 滚动到底部
  const scrollToBottom = useMemoizedFn(() => {
    // 增加延迟，确保 DOM 已更新
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const osInstance = scrollContainerRef.current.osInstance();
        if (osInstance) {
          const { viewport } = osInstance.elements();
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    }, 300);
  });

  // 处理右键菜单
  const handleContextMenu = useMemoizedFn(
    (e: React.MouseEvent, pageId: string) => {
      showPageContextMenu({
        pageId,
        event: e,
        onScrollToBottom: scrollToBottom,
      });
    }
  );

  const handlePageClick = useMemoizedFn((pageId: string) => {
    menuActiveStore.resetMenu();
    elementActiveStore.resetElementActive();
    pageActiveStore.setPageActive(pageId);
    contextMenuStore.hideMenu();
  });

  const handleAddPage = useMemoizedFn(() => {
    // 直接使用 pptStore.pages 获取最新的页面列表
    const currentPages = pptStore.pages;
    const lastPage = currentPages[currentPages.length - 1];
    addPageAndActivate(lastPage?.id, () => {
      scrollToBottom();
    });
  });

  const handlePlayPage = useMemoizedFn(
    (pageId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      fullscreenStore.enterFullscreen(pageId);
    }
  );

  const handleAddPageAfter = useMemoizedFn(
    (pageId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      addPageAndActivate(pageId, () => {
        scrollToBottom();
      });
    }
  );

  const handleMovePageUp = useMemoizedFn(
    (pageId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      pptStore.movePage(pageId, "up");
    }
  );

  const handleMovePageDown = useMemoizedFn(
    (pageId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      pptStore.movePage(pageId, "down");
    }
  );

  const handleDuplicatePage = useMemoizedFn(() => {
    duplicatePageAndActivate(pageActiveStore.pageActive, () => {
      scrollToBottom();
    });
  });

  const handleDeletePage = useMemoizedFn(() => {
    deletePageAndFallback(pageActiveStore.pageActive);
  });

  const handleTogglePageVisible = useMemoizedFn(() => {
    const pageActive = pageActiveStore.pageActive;
    if (!pageActive) return;
    pptStore.togglePageVisible(pageActive);
  });

  const handlePlayActivePage = useMemoizedFn(() => {
    const pageActive = pageActiveStore.pageActive;
    if (!pageActive) return;
    fullscreenStore.enterFullscreen(pageActive);
  });

  const handleResetPage = useMemoizedFn(() => {
    resetPageElements(pageActiveStore.pageActive);
  });

  const isInputElement = (target: HTMLElement) => {
    return (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    );
  };

  useKeyPress(["ctrl.c"], (e) => {
    const target = e.target as HTMLElement;
    if (!isInputElement(target)) {
      e.preventDefault();
      handleDuplicatePage();
    }
  });

  useKeyPress(["ctrl.d"], (e) => {
    const target = e.target as HTMLElement;
    if (!isInputElement(target)) {
      e.preventDefault();
      handleDeletePage();
    }
  });

  useKeyPress(["shift.c"], (e) => {
    const target = e.target as HTMLElement;
    if (isInputElement(target)) return;
    e.preventDefault();
    copyActiveElement();
  });

  useKeyPress(["shift.x"], (e) => {
    const target = e.target as HTMLElement;
    if (isInputElement(target)) return;
    e.preventDefault();
    cutActiveElement();
  });

  useKeyPress(["shift.d"], (e) => {
    const target = e.target as HTMLElement;
    if (isInputElement(target)) return;
    e.preventDefault();
    deleteActiveElement();
  });

  useKeyPress(["ctrl.h"], (e) => {
    const target = e.target as HTMLElement;
    if (!isInputElement(target)) {
      e.preventDefault();
      handleTogglePageVisible();
    }
  });

  useKeyPress(["ctrl.p"], (e) => {
    const target = e.target as HTMLElement;
    if (!isInputElement(target)) {
      e.preventDefault();
      handlePlayActivePage();
    }
  });

  useKeyPress(["ctrl.r"], (e) => {
    const target = e.target as HTMLElement;
    if (!isInputElement(target)) {
      e.preventDefault();
      handleResetPage();
    }
  });

  useEffect(() => {
    const calculateHeight = () => {
      if (!containerRef.current || !addButtonRef.current) return;

      const containerHeight = containerRef.current.offsetHeight;
      const buttonHeight = addButtonRef.current.offsetHeight;
      const availableHeight = containerHeight - buttonHeight;

      setScrollHeight(availableHeight);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  useEffect(() => {
    const calculateScale = () => {
      if (!pageItemRef.current) return;
      const itemWidth = pageItemRef.current.offsetWidth;
      const canvasWidth = 1000;
      const newScale = itemWidth / canvasWidth;
      const finalScale = Math.max(newScale, 0.1);
      setScale(finalScale);
    };

    setTimeout(calculateScale, 0);
    const resizeObserver = new ResizeObserver(calculateScale);
    if (pageItemRef.current) {
      resizeObserver.observe(pageItemRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-[230px] min-w-[230px] box-border border-r border-[#e0e0e0] flex flex-col pb-[15px] pt-[15px]"
    >
      <OverlayScrollbarsComponent
        ref={scrollContainerRef}
        className="flex-1"
        style={{
          height: scrollHeight > 0 ? `${scrollHeight}px` : "100%",
          maxHeight: scrollHeight > 0 ? `${scrollHeight}px` : "100%",
        }}
        options={{
          scrollbars: {
            theme: "os-theme-light",
            autoHide: "leave",
            autoHideDelay: 300,
          },
          overflow: {
            x: "hidden",
            y: "scroll",
          },
        }}
      >
        {(() => {
          if (pages && pages.length > 0) {
            const pagesArray = [...pages];
            if (pagesArray.length !== pages.length) {
              console.warn("Spread operator failed, using index access");
              const pagesByIndex: Page[] = [];
              for (let i = 0; i < pages.length; i++) {
                pagesByIndex.push(pages[i]);
              }
              console.log("JSX: Pages by index length:", pagesByIndex.length);
              const mapped = pagesByIndex.map((page: Page, index: number) => {
                console.log(`JSX: Mapping page ${index}:`, page.id);
                return (
                  <PageItem
                    key={page.id}
                    page={page}
                    index={index}
                    scale={scale}
                    totalPages={pages.length}
                    onPageClick={handlePageClick}
                    onContextMenu={handleContextMenu}
                    onPlayPage={handlePlayPage}
                    onMovePageUp={handleMovePageUp}
                    onMovePageDown={handleMovePageDown}
                    onAddPageAfter={handleAddPageAfter}
                    pageItemRef={index === 0 ? pageItemRef : null}
                  />
                );
              });
              console.log("JSX: Map result length:", mapped.length);
              return mapped;
            }
            const mapped = pagesArray.map((page: Page, index: number) => {
              return (
                <PageItem
                  key={page.id}
                  page={page}
                  index={index}
                  scale={scale}
                  totalPages={pages.length}
                  onPageClick={handlePageClick}
                  onContextMenu={handleContextMenu}
                  onPlayPage={handlePlayPage}
                  onMovePageUp={handleMovePageUp}
                  onMovePageDown={handleMovePageDown}
                  onAddPageAfter={handleAddPageAfter}
                  pageItemRef={index === 0 ? pageItemRef : null}
                />
              );
            });
            return mapped;
          } else {
            return (
              <div className="flex items-center justify-center h-full text-[#9b9b9b] text-sm px-[15px]">
                暂无页面数据
              </div>
            );
          }
        })()}
      </OverlayScrollbarsComponent>
      <div ref={addButtonRef} className="pr-[15px]">
        <Tooltip placement="top" title="添加页面">
          <div
            className="flex items-center justify-center cursor-pointer py-[8px] bg-[#e4e4e4] opacity-[0.7] hover:opacity-[1] rounded-[3px] transition-colors duration-200"
            onClick={handleAddPage}
          >
            <Add />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export const Preview: FC = observer(PreviewComponent);
