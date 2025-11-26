import {
  contextMenuStore,
  elementActiveStore,
  fullscreenStore,
  menuActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import type { Page } from "@/store/ppt";
import { showPageContextMenu } from "@/utils/pageContextMenu";
import { Add, PlayOne, Plus, PreviewCloseOne } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useRef, useState, type FC } from "react";
import { Canvas } from "../Canvas";
import styles from "./index.module.less";

const PreviewComponent: FC = () => {
  const pages = pptStore.getPages();

  const pageActive = pageActiveStore.getPageActive();

  const containerRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<any>(null);
  const pageItemRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scrollHeight, setScrollHeight] = useState(0);

  // 滚动到底部
  const scrollToBottom = useMemoizedFn(() => {
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
    }, 100);
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

  // 处理点击页面切换
  const handlePageClick = useMemoizedFn((pageId: string) => {
    menuActiveStore.resetMenu();
    elementActiveStore.resetElementActive();
    pageActiveStore.setPageActive(pageId);
    contextMenuStore.hideMenu();
  });

  // 处理添加页面
  const handleAddPage = useMemoizedFn(() => {
    // 在最后一个页面后面添加新页面
    const lastPage = pages[pages.length - 1];
    const newPageId = pptStore.addPage(lastPage?.id);
    // 清空选中的元素
    elementActiveStore.resetElementActive();
    // 切换到新建的页面
    pageActiveStore.setPageActive(newPageId);
    // 滚动到底部
    scrollToBottom();
  });

  // 处理播放按钮点击 - 全屏放映当前页面
  const handlePlayPage = useMemoizedFn(
    (pageId: string, e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡，避免触发页面点击
      fullscreenStore.enterFullscreen(pageId);
    }
  );

  // 处理添加页面按钮点击 - 在当前页面下面新建页面
  const handleAddPageAfter = useMemoizedFn(
    (pageId: string, e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡，避免触发页面点击
      // 在当前页面后面添加新页面
      const newPageId = pptStore.addPage(pageId);
      // 清空选中的元素
      elementActiveStore.resetElementActive();
      // 切换到新建的页面
      pageActiveStore.setPageActive(newPageId);
      // 滚动到底部
      scrollToBottom();
    }
  );

  // 计算滚动区域高度
  useEffect(() => {
    const calculateHeight = () => {
      if (!containerRef.current || !addButtonRef.current) return;

      const containerHeight = containerRef.current.offsetHeight;
      const buttonHeight = addButtonRef.current.offsetHeight;
      const availableHeight = containerHeight - buttonHeight;

      setScrollHeight(availableHeight);
    };

    calculateHeight();

    // 监听窗口大小变化
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  // 计算缩放比例
  useEffect(() => {
    const calculateScale = () => {
      if (!pageItemRef.current) return;
      // 获取页面项容器的实际宽度
      const itemWidth = pageItemRef.current.offsetWidth;
      const canvasWidth = 1000; // Canvas 的原始宽度
      // 计算 scale：实际宽度 / 原始宽度
      const newScale = itemWidth / canvasWidth;
      const finalScale = Math.max(newScale, 0.1);
      setScale(finalScale);
    };

    // 延迟计算，确保 DOM 已渲染
    setTimeout(calculateScale, 0);

    // 使用 ResizeObserver 监听容器大小变化
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
      className="w-[230px] min-w-[230px] box-border border-r border-[#d5d5d5] flex flex-col"
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
        {pages.map((page: Page, index: number) => (
          <div
            className={`${styles.pageItem} relative mr-[15px] cursor-pointer flex gap-[8px]`}
            key={page.id}
          >
            <span
              className={`text-[13px] mt-[5px] font-bold ${
                pageActive === page.id ? "text-primary" : "text-[#9b9b9b]"
              }`}
            >
              {index + 1}
            </span>
            <div
              ref={index === 0 ? pageItemRef : null}
              className="previewCanvas relative flex-1 rounded-[8px] overflow-hidden"
              style={{
                aspectRatio: "10 / 7", // 1000:700 的宽高比
                boxShadow:
                  pageActive === page.id ? "0 0 0 2px #f25f00" : "none",
              }}
              onClick={() => handlePageClick(page.id)}
              onContextMenu={(e) => handleContextMenu(e, page.id)}
            >
              {page.visible === false && (
                <div
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/10 rounded-[8px] z-10"
                  onClick={() => handlePageClick(page.id)}
                  onContextMenu={(e) => handleContextMenu(e, page.id)}
                >
                  <PreviewCloseOne theme="outline" size="24" fill="#333" />
                </div>
              )}
              <Canvas mode="preview" page={page} previewZoom={scale} />
            </div>
            <div className="floatButton absolute bottom-[-12px] right-[13px] z-10 w-[80%] flex items-center justify-between opacity-0 transition-opacity">
              <div
                className="flex items-center justify-center w-[26px] h-[26px] bg-[#fff] rounded-[50%] opacity-[0.7] hover:opacity-[1] transition-opacity shadow-[0_0_8px_rgba(0,0,0,0.15)] cursor-pointer"
                onClick={(e) => handlePlayPage(page.id, e)}
              >
                <PlayOne theme="filled" size="18" fill="#f25f00" />
              </div>
              <div
                className="flex items-center justify-center w-[26px] h-[26px] bg-[#f25f00] rounded-[50%] opacity-[0.7] hover:opacity-[1] transition-opacity shadow-[0_0_8px_rgba(0,0,0,0.15)] cursor-pointer"
                onClick={(e) => handleAddPageAfter(page.id, e)}
              >
                <Plus theme="outline" size="18" fill="#fff" />
              </div>
            </div>
          </div>
        ))}
      </OverlayScrollbarsComponent>

      {/* 添加页面按钮 */}
      <div ref={addButtonRef} className="pr-[15px]">
        <Tooltip placement="top" title="添加页面">
          <div
            className="flex items-center justify-center cursor-pointer py-[8px] hover:bg-[#e4e4e4] rounded-[3px] transition-colors duration-200"
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
