import { menuActiveStore } from "@/store";
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

  useEffect(() => {
    const checkSizes = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setNeedsScroll(contentWidth > containerWidth);
      }
    };

    checkSizes();

    // 监听窗口大小变化
    window.addEventListener("resize", checkSizes);

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
      window.removeEventListener("resize", checkSizes);
      observer.disconnect();
    };
  }, [ActivePanelComponent]);

  return (
    <div
      ref={containerRef}
      className="w-[calc(100%-40px)] bg-[#fff] rounded-[10px] h-[70px] mx-[20px]"
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
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: needsScroll ? "flex-start" : "center",
            height: "100%",
            minWidth: "100%",
          }}
        >
          <div ref={contentRef} style={{ flexShrink: 0 }}>
            {ActivePanelComponent ? <ActivePanelComponent /> : null}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
});
