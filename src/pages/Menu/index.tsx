import { menuActiveStore } from "@/store";
import { observer } from "mobx-react-lite";
import ScrollBars from "rc-scrollbars";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import Panel from "./components";

export const Menu: FC = observer(() => {
  const activePanelKey = menuActiveStore.menuActive as keyof typeof Panel;
  const ActivePanelComponent = useMemo(
    () => Panel[activePanelKey] || null,
    [activePanelKey]
  ) as unknown as React.ComponentType;

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
      className="w-[calc(100%-40px)] bg-[#fff] rounded-[10px] h-[65px] mx-[20px]"
    >
      <ScrollBars
        style={{ width: "100%", height: "100%" }}
        autoHide
        autoHideTimeout={1000}
        renderThumbHorizontal={({ style, ...props }) => (
          <div
            {...props}
            style={{
              ...style,
              backgroundColor: "#d1d5db",
              borderRadius: "4px",
              height: "4px",
            }}
          />
        )}
        renderTrackHorizontal={({ style, ...props }) => (
          <div
            {...props}
            style={{
              ...style,
              backgroundColor: "#f3f4f6",
              borderRadius: "4px",
              height: "4px",
              bottom: "2px",
            }}
          />
        )}
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
            {ActivePanelComponent &&
            typeof ActivePanelComponent === "function" ? (
              <ActivePanelComponent />
            ) : null}
          </div>
        </div>
      </ScrollBars>
    </div>
  );
});
