import { useMenuActiveStore } from "@/store";
import { useDebounceFn } from "ahooks";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import { useEffect, useRef, useState, type FC } from "react";
import Panel from "./components";
import styles from "./index.module.less";
import "./overlay-scrollbar.css";

const SIDE_PADDING = 16;

export const Menu: FC = () => {
  // 使用 Zustand hook 订阅状态变化，确保组件能够响应状态更新
  const menuActive = useMenuActiveStore((state) => state.menuActive);
  const activePanelKey = menuActive as keyof typeof Panel;
  const ActivePanelComponent = Panel[activePanelKey];

  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [barWidth, setBarWidth] = useState<number | "100%">("100%");

  // 内容未超出可用宽度时按实际宽度展示，超出则占满并滚动
  const checkSizes = () => {
    if (wrapperRef.current && contentRef.current) {
      const availableWidth = wrapperRef.current.clientWidth;
      const contentWidth =
        contentRef.current.scrollWidth + SIDE_PADDING * 2;
      const overflow = contentWidth > availableWidth;
      setNeedsScroll(overflow);
      setBarWidth(overflow ? "100%" : contentWidth);
    }
  };

  // 防抖处理的 resize 事件
  const { run: debouncedCheckSizes } = useDebounceFn(checkSizes, {
    wait: 300,
  });

  useEffect(() => {
    checkSizes();

    // 监听窗口大小变化（使用防抖）
    window.addEventListener("resize", debouncedCheckSizes);

    // 使用 MutationObserver 监听内容变化
    const observer = new MutationObserver(checkSizes);
    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(checkSizes)
        : null;
    if (resizeObserver && wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => {
      window.removeEventListener("resize", debouncedCheckSizes);
      observer.disconnect();
      resizeObserver?.disconnect();
    };
  }, [ActivePanelComponent, debouncedCheckSizes]);

  return (
    <div ref={wrapperRef} className="w-full shrink-0">
      <div
        className={`${styles.menuBar} overflow-hidden rounded-[10px] h-[70px] max-h-[70px] min-h-[70px] z-[3] relative max-w-full`}
        style={{ width: barWidth }}
      >
        <OverlayScrollbarsComponent
          className="custom-scrollbar"
          options={{
            scrollbars: {
              autoHide: "scroll",
              autoHideDelay: 1000,
            },
            overflow: {
              x: needsScroll ? "scroll" : "hidden",
              y: "hidden",
            },
          }}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <div
            className={`h-full flex items-center ${needsScroll ? "justify-start" : "justify-center"}`}
          >
            <span
              className="inline-block h-full min-w-[16px]"
              style={{ width: SIDE_PADDING }}
            ></span>
            <div
              ref={contentRef}
              style={{ flexShrink: 0 }}
              className="flex items-center gap-[2px]"
            >
              {ActivePanelComponent ? <ActivePanelComponent /> : null}
            </div>
            <span
              className="inline-block h-full min-w-[16px]"
              style={{ width: SIDE_PADDING }}
            ></span>
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </div>
  );
};
