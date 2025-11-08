import { usePageContextMenu } from "@/hooks";
import {
  displayStatusStore,
  elementActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import type { Page } from "@/store/ppt";
import { PreviewCloseOne } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { type FC, useEffect, useRef, useState } from "react";
import { Canvas } from "../Canvas";

const GridComponent: FC = () => {
  const pages = pptStore.getPages();
  const pageActive = pageActiveStore.getPageActive();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  // 使用页面右键菜单 hook
  const { ContextMenu, handleContextMenu } = usePageContextMenu();

  // 计算缩放比例
  const calculateScale = () => {
    if (!containerRef.current) return;

    // 获取第一个卡片的宽度作为参考
    const firstCard = containerRef.current.querySelector(
      ".grid-card"
    ) as HTMLElement;

    if (firstCard) {
      const cardWidth = firstCard.offsetWidth;
      const canvasWidth = 1000;
      const newScale = cardWidth / canvasWidth;
      setScale(newScale);
    }
  };

  // 防抖处理的 resize 事件
  const { run: debouncedCalculateScale } = useDebounceFn(calculateScale, {
    wait: 300,
  });

  // 处理双击切换到编辑模式
  const handleDoubleClick = useMemoizedFn((pageId: string) => {
    // 切换到点击的页面
    pageActiveStore.setPageActive(pageId);
    // 清空选中的元素
    elementActiveStore.resetElementActive();
    // 切换到 default 模式
    displayStatusStore.setDisplayStatus("default");
  });

  useEffect(() => {
    // 延迟计算，确保 DOM 已渲染
    const timer = setTimeout(calculateScale, 100);

    // 监听窗口大小变化（使用防抖）
    window.addEventListener("resize", debouncedCalculateScale);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", debouncedCalculateScale);
    };
  }, [pages.length, debouncedCalculateScale]);

  return (
    <div ref={containerRef} className="flex-1 overflow-auto p-[20px]">
      <ContextMenu />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[20px]">
        {pages.map((page: Page, index: number) => (
          <div
            key={page.id}
            className="flex flex-col items-center cursor-pointer"
          >
            <div
              className={`grid-card relative w-full aspect-[10/7] bg-white rounded-[8px] shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
                pageActive === page.id
                  ? "ring-2 ring-primary ring-offset-1"
                  : ""
              }`}
              onDoubleClick={() => handleDoubleClick(page.id)}
              onContextMenu={(e) => handleContextMenu(e, page.id)}
            >
              <div
                className="absolute top-0 left-0 origin-top-left"
                style={{
                  width: "1000px",
                  height: "700px",
                  transform: `scale(${scale})`,
                }}
              >
                <Canvas mode="preview" page={page} />
              </div>
              {page.visible === false && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <PreviewCloseOne theme="outline" size="24" fill="#333" />
                </div>
              )}
            </div>
            <span
              className={`mt-[10px] text-[14px] ${
                pageActive === page.id
                  ? "text-primary font-bold"
                  : "text-[#666]"
              }`}
            >
              幻灯片 {index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Grid: FC = observer(GridComponent);
