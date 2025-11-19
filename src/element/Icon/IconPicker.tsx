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

export const IconPicker: FC<IconPickerProps> = ({ onIconSelect, children }) => {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 获取所有图标名称
  const iconNames = useMemo(() => getAllIconNames(), []);

  const handleOpen = useMemoizedFn(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(true);
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

  const content = useMemo(() => {
    const iconParkAny = IconPark as any;

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
        >
          <div className={styles.iconGrid}>
            {iconNames.map((iconName) => {
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
          </div>
        </OverlayScrollbarsComponent>
      </div>
    );
  }, [iconNames, handleOpen, handleClose, handleIconClick]);

  return (
    <Popover open={open} placement="bottom" content={content}>
      <div onMouseEnter={handleOpen} onMouseLeave={handleClose}>
        {children}
      </div>
    </Popover>
  );
};
