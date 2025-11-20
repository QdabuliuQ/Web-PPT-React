import { MovableWrapper } from "@/components";
import useCommonContextMenu from "@/hooks/useCommonContextMenu";
import { contextMenuStore, elementActiveStore, pageActiveStore } from "@/store";
import type { ICommonElementProps } from "@/types/element";
import { getRandomId } from "@/utils";
import * as IconPark from "@icon-park/react";
import { observer } from "mobx-react-lite";
import { memo, useEffect, useMemo, useRef, type FC } from "react";
import { useMovableElement } from "../../hooks/useMovableElement";
import styles from "./index.module.less";
import { getIconMenuItems } from "./menu";

export { IconButtonComponent as IconButton } from "./button";
export { IconPicker } from "./IconPicker";
export { getIconMenuItems } from "./menu";
export { IconPanel, IconPanelKey, IconPanelTitle } from "./panel.tsx";

export interface IIconProps extends ICommonElementProps {
  type: "icon";
  iconName: string; // 图标名称，例如 "Home", "User", "Setting"
  fill: Array<string>; // 图标颜色
  theme: "outline" | "filled" | "two-tone" | "multi-color"; // 图标主题
  strokeWidth: number; // 描边宽度
}

const Component: FC<IIconProps> = observer((props) => {
  const {
    mode = "edit",
    id,
    iconName,
    fill,
    theme,
    strokeWidth,
    x,
    y,
    width,
    height,
    rotate,
    zIndex,
    onSelect,
    onUnSelect,
  } = props;

  const iconRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<any>(null);

  // 使用通用的可移动元素hook
  const {
    isDragging,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleResizeStart,
    handleResize,
    handleResizeEnd,
    handleRotateStart,
    handleRotate,
    handleRotateEnd,
  } = useMovableElement({
    id,
    props,
    onStateChange: (_dragging) => {
      // 拖拽结束时不需要手动设置 transform，由 dynamicStyle 控制
      // transform 由 translate 和 rotate 组成，通过 dynamicStyle 统一管理
    },
    onMoveableRefresh: () => {
      // 刷新 Moveable 位置
      if (moveableRef.current) {
        moveableRef.current.updateRect();
      }
    },
  });

  const isSelected = elementActiveStore.isElementActive(id);

  // 获取当前页面ID，确保不为空
  const currentPageId = pageActiveStore.getPageActive() || "";

  // 获取通用菜单
  const { commonMenu } = useCommonContextMenu(currentPageId, id);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 立即激活元素
    if (!isSelected) {
      onSelect?.();
    }
  };

  // 处理单击事件 - 激活元素
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 如果未选中，先选中
    if (!isSelected) {
      onSelect?.();
    }

    // 显示右键菜单，合并图标菜单和通用菜单
    const menuItems = [...getIconMenuItems(), ...commonMenu];
    contextMenuStore.showMenu(menuItems, e);
  };

  useEffect(() => {
    if (mode === "edit" && !isSelected) {
      onUnSelect?.();
    }
  }, [isSelected, mode, onUnSelect]);

  // 动态样式（位置、大小等）
  const dynamicStyle = useMemo(
    () => ({
      width,
      height,
      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
      zIndex,
      cursor: isSelected ? "move" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    [x, y, width, height, rotate, zIndex, isSelected]
  );

  // 动态获取图标组件
  const IconComponent = useMemo(() => {
    const IconParkAny = IconPark as any;
    const Icon = IconParkAny[iconName] || IconPark.Home;
    return Icon;
  }, [iconName]);

  // 组合CSS类名
  const className = [
    styles.iconElement,
    isDragging ? styles.dragging : "",
    isSelected ? "element-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return mode === "edit" ? (
    <>
      <div
        ref={iconRef}
        id={id}
        className={className}
        style={dynamicStyle}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <IconComponent
          theme={theme}
          size={Math.min(width, height)}
          fill={fill}
          strokeWidth={strokeWidth}
        />
      </div>
      <MovableWrapper
        ref={moveableRef}
        id={id}
        active={isSelected}
        bounds={{ left: 0, top: 0, right: 1000, bottom: 700 }}
        x={x}
        y={y}
        width={width}
        height={height}
        rotate={rotate}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        onRotateStart={handleRotateStart}
        onRotate={handleRotate}
        onRotateEnd={handleRotateEnd}
      />
    </>
  ) : (
    <div id={`preview_${id}`} className={className} style={dynamicStyle}>
      <IconComponent
        theme={theme}
        size={Math.min(width, height)}
        fill={fill}
        strokeWidth={strokeWidth}
      />
    </div>
  );
});

export const Icon = memo(Component);

export const CreateIcon = (props: Partial<IIconProps> = {}) => {
  const defaultProps: Omit<IIconProps, "type" | "id"> = {
    mode: "edit",
    iconName: "Home",
    fill: ["#000000"],
    theme: "outline",
    strokeWidth: 3,
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    rotate: 0,
    zIndex: 0,
  };
  return {
    ...defaultProps,
    ...props,
    id: `icon_${getRandomId()}`,
    type: "icon" as const,
  };
};
