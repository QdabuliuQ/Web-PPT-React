import { menuActiveStore } from "@/store";
import { useDebounceFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import { useEffect, useRef, useState, type FC } from "react";
import Panel from "./components";
import "./overlay-scrollbar.css";

export const Menu: FC = observer(() => {
  const activePanelKey = menuActiveStore.menuActive as keyof typeof Panel;
  const ActivePanelComponent = Panel[activePanelKey];

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  // 检查是否需要滚动
  const checkSizes = () => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = contentRef.current.scrollWidth;
      setNeedsScroll(contentWidth > containerWidth);
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

    return () => {
      window.removeEventListener("resize", debouncedCheckSizes);
      observer.disconnect();
    };
  }, [ActivePanelComponent, debouncedCheckSizes]);

  return (
    <div
      ref={containerRef}
      style={{ boxShadow: "0 0 5px 0 rgba(0,0,0,.1)" }}
      className="overflow-hidden w-[calc(100%-40px)] bg-[#fff] rounded-[10px] h-[70px] mx-[20px] max-h-[70px] min-h-[70px] z-[3] relative"
    >
      <OverlayScrollbarsComponent
        className="custom-scrollbar"
        options={{
          scrollbars: {
            autoHide: "scroll",
            autoHideDelay: 1000,
          },
          overflow: {
            x: "scroll",
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
          <span className="inline-block h-full w-[20px] min-w-[20px]"></span>
          <div
            ref={contentRef}
            style={{ flexShrink: 0 }}
            className="flex items-center"
          >
            {ActivePanelComponent ? <ActivePanelComponent /> : null}
          </div>
          <span className="inline-block h-full w-[20px] min-w-[20px]"></span>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
});
