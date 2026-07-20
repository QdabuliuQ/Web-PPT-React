import { CANVAS_ASPECT_RATIO_CSS, CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import {
  useDisplayStatusStore,
  useElementActiveStore,
  useMenuActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import type { Page } from "@/store/ppt";
import { showPageContextMenu } from "@/utils/pageContextMenu";
import { PreviewCloseOne } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { type FC, useEffect, useRef, useState } from "react";
import { Canvas } from "../Canvas";

const GridComponent: FC = () => {
  // 使用 Zustand hooks 订阅状态变化，确保组件能够响应状态更新
  const pages = usePPTStore((state) => state.pages);
  const pageActive = usePageActiveStore((state) => state.pageActive);
  const setPageActive = usePageActiveStore((state) => state.setPageActive);
  const resetElementActive = useElementActiveStore(
    (state) => state.resetElementActive
  );
  const setDisplayStatus = useDisplayStatusStore(
    (state) => state.setDisplayStatus
  );
  const setActiveMenu = useMenuActiveStore((state) => state.setActiveMenu);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  // 计算缩放比例
  const calculateScale = () => {
    if (!containerRef.current) return;

    // 获取第一个卡片的宽度作为参考
    const firstCard = containerRef.current.querySelector(
      ".grid-card"
    ) as HTMLElement;

    if (firstCard) {
      const cardWidth = firstCard.offsetWidth;
      const newScale = cardWidth / CANVAS_WIDTH;
      setScale(newScale);
    }
  };

  // 防抖处理的 resize 事件
  const { run: debouncedCalculateScale } = useDebounceFn(calculateScale, {
    wait: 300,
  });

  // 处理右键菜单
  const handleContextMenu = useMemoizedFn(
    (e: React.MouseEvent, pageId: string) => {
      showPageContextMenu({ pageId, event: e });
    }
  );

  // 处理单击切换到编辑模式
  const handleClick = useMemoizedFn((pageId: string) => {
    // 切换到点击的页面
    setPageActive(pageId);
    // 清空选中的元素
    resetElementActive();
    // 切换到 default 模式
    setDisplayStatus("default");
    // 设置 menuActive 为默认值 start
    setActiveMenu("start");
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
    <div ref={containerRef} className="flex-1 min-h-0 overflow-auto p-[20px]">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[20px]">
        {pages.map((page: Page, index: number) => (
          <div
            key={page.id}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div
              className={`grid-card relative w-full bg-chrome-thumb rounded-[6px] overflow-hidden transition-shadow ${
                pageActive === page.id
                  ? "shadow-[0_0_0_2px_var(--primary-color)]"
                  : "shadow-[0_0_0_1px_var(--thumb-border)] group-hover:shadow-[0_0_0_1px_var(--thumb-border-hover)]"
              }`}
              style={{ aspectRatio: CANVAS_ASPECT_RATIO_CSS }}
              onClick={() => handleClick(page.id)}
              onContextMenu={(e) => handleContextMenu(e, page.id)}
            >
              <div
                className="absolute top-0 left-0 origin-top-left"
                style={{
                  width: `${CANVAS_WIDTH}px`,
                  height: `${CANVAS_HEIGHT}px`,
                  transform: `scale(${scale})`,
                }}
              >
                <Canvas mode="preview" page={page} />
              </div>
              {page.visible === false && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <PreviewCloseOne
                    theme="outline"
                    size="24"
                    fill="var(--icon-color)"
                  />
                </div>
              )}
            </div>
            <span
              className={`mt-[8px] text-[13px] ${
                pageActive === page.id
                  ? "text-primary font-semibold"
                  : "text-chrome-muted"
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

export const Grid: FC = GridComponent;
