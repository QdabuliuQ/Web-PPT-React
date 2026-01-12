import * as IconPark from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Popover } from "antd";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useMemo, useRef, useState, type FC, type ReactNode } from "react";
import styles from "./button.module.less";

// 获取所有图标名称（排除非组件导出）
const getAllIconNames = (): string[] => {
  const iconNames: string[] = [];
  const iconParkAny = IconPark as any;

  // 遍历 IconPark 的所有导出，找出图标组件
  Object.keys(iconParkAny).forEach((key) => {
    // 图标组件通常是函数或类，且名称首字母大写
    if (
      typeof iconParkAny[key] === "function" &&
      /^[A-Z]/.test(key) &&
      key !== "default"
    ) {
      iconNames.push(key);
    }
  });

  return iconNames.sort();
};

interface IconPickerProps {
  onIconSelect: (iconName: string) => void;
  children: ReactNode;
}

// 每批渲染的图标数量
const BATCH_SIZE = 200;

export const IconPicker: FC<IconPickerProps> = ({ onIconSelect, children }) => {
  const [open, setOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef(false);

  // 获取所有图标名称
  const iconNames = useMemo(() => getAllIconNames(), []);

  const handleOpen = useMemoizedFn(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(true);
    // 重置显示数量
    setDisplayCount(BATCH_SIZE);
  });

  const handleClose = useMemoizedFn(() => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 100);
  });

  const handleIconClick = useMemoizedFn((iconName: string) => {
    onIconSelect(iconName);
    setOpen(false);
  });

  // 加载更多图标
  const loadMore = useMemoizedFn(() => {
    if (loadingRef.current || displayCount >= iconNames.length) {
      return;
    }

    loadingRef.current = true;

    // 使用 requestIdleCallback 在浏览器空闲时加载
    requestIdleCallback(() => {
      setDisplayCount((prev) => Math.min(prev + BATCH_SIZE, iconNames.length));
      loadingRef.current = false;
    });
  });

  // 处理滚动事件
  const handleScroll = useMemoizedFn((instance: any) => {
    const viewport = instance.elements().viewport;

    if (!viewport) return;

    const scrollTop = viewport.scrollTop;
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;

    // 当滚动到距离底部 200px 时加载更多
    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadMore();
    }
  });

  const content = useMemo(() => {
    const iconParkAny = IconPark as any;
    const displayedIcons = iconNames.slice(0, displayCount);
    const hasMore = displayCount < iconNames.length;

    return (
      <div
        className={styles.iconContainerWrapper}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <OverlayScrollbarsComponent
          className={styles.iconContainer}
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
          defer
          events={{
            scroll: handleScroll,
          }}
        >
          <div className={styles.iconGrid}>
            {displayedIcons.map((iconName) => {
              const IconComponent = iconParkAny[iconName];
              if (!IconComponent) return null;

              return (
                <div
                  key={iconName}
                  className={styles.iconItem}
                  onClick={() => handleIconClick(iconName)}
                  title={iconName}
                >
                  <IconComponent theme="outline" size="20" fill="#333" />
                </div>
              );
            })}
            {hasMore && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "10px",
                  color: "#999",
                  fontSize: "12px",
                }}
              >
                加载中... ({displayCount} / {iconNames.length})
              </div>
            )}
          </div>
        </OverlayScrollbarsComponent>
      </div>
    );
  }, [
    iconNames,
    displayCount,
    handleOpen,
    handleClose,
    handleIconClick,
    handleScroll,
  ]);

  return (
    <Popover open={open} placement="bottom" content={content}>
      <div onMouseEnter={handleOpen} onMouseLeave={handleClose}>
        {children}
      </div>
    </Popover>
  );
};
