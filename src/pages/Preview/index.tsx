import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import type { Page } from "@/store/ppt";
import { showPageContextMenu } from "@/utils/pageContextMenu";
import { Add, PreviewCloseOne } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useRef, useState, type FC } from "react";
import { Canvas } from "../Canvas";
import styles from "./index.module.less";

const PreviewComponent: FC = () => {
  const pages = pptStore.getPages();
  console.log(pages, "pagespages");

  const pageActive = pageActiveStore.getPageActive();

  const containerRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<any>(null);
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
    // 清空选中的元素
    elementActiveStore.resetElementActive();
    // 切换到点击的页面
    pageActiveStore.setPageActive(pageId);
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
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const canvasWidth = 1000; // Canvas 的固定宽度
      const padding = 16; // p-2 = 8px * 2 = 16px
      const availableWidth = containerWidth - padding;
      const newScale = Math.min(availableWidth / canvasWidth, 1);
      const finalScale = Math.max(newScale, 0.1);
      setScale(finalScale);
    };

    calculateScale();
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
            className={`${styles.pageItem} relative mr-[15px] cursor-pointer text-center`}
            key={page.id}
          >
            <div
              className={`relative w-[1000px] h-[700px] ${pageActive === page.id ? "border-8 border-solid border-primary box-border" : ""} rounded-[40px] overflow-hidden`}
              style={{
                zoom: scale,
              }}
              onClick={() => handlePageClick(page.id)}
              onContextMenu={(e) => handleContextMenu(e, page.id)}
            >
              <Canvas mode="preview" page={page} />
            </div>
            {page.visible === false && (
              <div
                className="absolute top-0 left-0 flex items-center justify-center bg-black/10 rounded-[8px]"
                style={{
                  width: `${1000 * scale}px`,
                  height: `${700 * scale}px`,
                }}
                onClick={() => handlePageClick(page.id)}
                onContextMenu={(e) => handleContextMenu(e, page.id)}
              >
                <PreviewCloseOne theme="outline" size="24" fill="#333" />
              </div>
            )}
            <span
              className={`${pageActive === page.id ? "text-primary font-bold" : ""}`}
            >
              {index}
            </span>
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
