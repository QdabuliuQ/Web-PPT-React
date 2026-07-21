import { AnimationWrapper, MovableWrapper } from "@/components";
import { PanelButton } from "@/components/PanelButton";
import { getCenteredElementPosition } from "@/constants/canvas";
import useCommonContextMenu from "@/hooks/useCommonContextMenu";
import {
  contextMenuStore,
  elementActiveStore,
  elementHoverActiveStore,
  pageActiveStore,
  pptStore,
  useElementActiveStore,
} from "@/store";
import type { ICommonElementProps } from "@/types/element";
import { getRandomId } from "@/utils";
import { Text as TextIcon } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { memo, useEffect, useMemo, useRef, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useMovableElement } from "../../hooks/useMovableElement";
import { PlacementMapped } from "./constant";
import styles from "./index.module.less";
import { getTextMenuItems } from "./menu";
import { buildTextDropShadow, buildTextGlyphShadow } from "./utils";
export { TextPanel, TextPanelKey, TextPanelTitle } from "./panel";

export interface ITextProps extends ICommonElementProps {
  type: "text";
  text: string;
  /** PPTX: fontFace */
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  /** PPTX: lineSpacingMultiple */
  lineHeight: number;
  /** 画布：filter drop-shadow（容器轮廓）+ text-shadow（文字）；导出仍为 PPTX 外形阴影 */
  shadow: boolean;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowColor: string;
  /** PPTX: line（文本框边框） */
  border: boolean;
  borderStyle: "solid" | "dashed" | "dotted";
  borderWidth: number;
  borderColor: string;
  /** PPTX: fill；transparent 表示无填充 */
  backgroundColor: string;
  /** PPTX: align + valign */
  placement:
    | "left-top"
    | "left-center"
    | "left-bottom"
    | "center-top"
    | "center-center"
    | "center-bottom"
    | "right-top"
    | "right-center"
    | "right-bottom";
}

const Component: FC<ITextProps> = (props) => {
  const {
    mode = "edit",
    id,
    text,
    x,
    y,
    width,
    height,
    fontSize,
    fontFamily,
    color,
    bold,
    italic,
    underline,
    strikethrough,
    lineHeight,
    shadow,
    shadowOffsetX,
    shadowOffsetY,
    shadowBlur = 4,
    shadowColor,
    border,
    borderWidth,
    borderStyle,
    borderColor,
    backgroundColor,
    placement,
    rotate,
    zIndex,
    animationName,
    animationDuration,
    animationDelay,
    animationTrigger,
    onSelect,
    onUnSelect,
  } = props;

  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<any>(null);

  // 跟踪文本是否真正被拖拽移动过（用于防止误触发双击编辑）
  const hasDraggedRef = useRef(false);

  // 使用通用的可移动元素hook
  const {
    isDragging,
    handleDragStart: originalHandleDragStart,
    handleDrag: originalHandleDrag,
    handleDragEnd: originalHandleDragEnd,
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

  // 包装 handleDragStart，重置拖拽标记
  const handleDragStart = useMemoizedFn(() => {
    hasDraggedRef.current = false;
    originalHandleDragStart();
  });

  // 包装 handleDrag，检测是否真正发生了移动
  const handleDrag = useMemoizedFn(
    (params: { x: number; y: number; transform: string }) => {
      // 只要有移动超过阈值，就标记为真正的拖拽
      if (Math.abs(params.x) > 1 || Math.abs(params.y) > 1) {
        hasDraggedRef.current = true;
      }
      originalHandleDrag(params);
    }
  );

  // 包装 handleDragEnd，延迟重置拖拽标记
  const handleDragEnd = useMemoizedFn(() => {
    originalHandleDragEnd();
    // 延迟重置，确保 doubleClick 事件可以检查到拖拽状态
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 300);
  });

  // 使用 Zustand hook 订阅状态变化，确保组件能够响应状态更新
  const elementActive = useElementActiveStore((state) => state.elementActive);
  const isSelected = elementActive === id;
  const isHoverActive = elementHoverActiveStore.isElementHoverActive(id);

  // 获取当前页面ID
  const pageId = pageActiveStore.getPageActive() || "";

  // 使用通用右键菜单hook
  const { commonMenu } = useCommonContextMenu(pageId, id);

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 如果正在编辑，不显示右键菜单
    if (isEditing) {
      return;
    }

    // 如果未选中，先选中
    if (!isSelected) {
      onSelect?.();
    }

    // 显示右键菜单，合并文本菜单和通用菜单
    const menuItems = [...getTextMenuItems(), ...commonMenu];
    contextMenuStore.showMenu(e.clientX, e.clientY, menuItems);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 如果正在编辑，不处理鼠标按下激活
    if (isEditing) {
      return;
    }

    // 立即激活元素
    if (!isSelected) {
      onSelect?.();
    }
  };

  // 处理单击事件 - 只激活元素
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 如果正在编辑，不处理点击激活（避免编辑时误触）
    if (isEditing) {
      return;
    }

    // 单击只负责激活元素，不进入编辑模式
    onSelect?.();
  };

  // 进入编辑模式 - 只有双击
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 防止在拖拽状态下误触发编辑
    if (isDragging) {
      return;
    }

    // 如果刚刚进行过拖拽，则不进入编辑模式
    if (hasDraggedRef.current) {
      return;
    }

    // 确保元素被激活
    onSelect?.();
    // 进入编辑模式
    setIsEditing(true);
  };

  // 保存编辑
  const handleSave = () => {
    if (textRef.current) {
      const newText = textRef.current.textContent || "";
      if (newText !== text) {
        pptStore.setElementInfo(pageActiveStore.getPageActive() as string, id, {
          ...props,
          text: newText,
        });
      }
    }
    setIsEditing(false);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发拖拽

    if (e.key === "Enter" && e.ctrlKey) {
      // Ctrl + Enter 保存
      handleSave();
    } else if (e.key === "Escape") {
      // Esc 取消编辑，恢复原文本
      if (textRef.current) {
        textRef.current.textContent = text;
      }
      setIsEditing(false);
    }
  };

  // 点击外部保存
  const handleBlur = () => {
    handleSave();
  };

  // 同步文本内容到 contentEditable 元素
  useEffect(() => {
    if (mode === "edit" && textRef.current && !isEditing) {
      textRef.current.textContent = text;
    }
  }, [text, isEditing, mode]);

  // 自动聚焦和选择文本
  useEffect(() => {
    if (mode === "edit" && isEditing && textRef.current) {
      // 编辑模式时会自动停止拖拽

      // 设置内容
      textRef.current.textContent = text;

      // 聚焦
      textRef.current.focus();

      // 选择所有文本
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing, mode, text]);

  useEffect(() => {
    if (mode === "edit" && !isSelected) {
      onUnSelect?.();
    }
  }, [isSelected, mode, onUnSelect]);

  const placementConvey = useMemoizedFn((placement) => {
    const key = (
      placement && placement in PlacementMapped ? placement : "left-top"
    ) as keyof typeof PlacementMapped;
    const [h = "left", v = "top"] = key.split("-");
    const textAlign =
      h === "center" ? "center" : h === "right" ? "right" : "left";
    const justifyContent =
      v === "center" ? "center" : v === "bottom" ? "flex-end" : "flex-start";
    return {
      display: "flex",
      flexDirection: "column" as const,
      justifyContent,
      alignItems: "stretch" as const,
      textAlign: textAlign as "left" | "center" | "right",
    };
  });

  // 动态样式：阴影 = 容器 drop-shadow（边框+文字轮廓）+ 文字 text-shadow
  const dynamicStyle = useMemo(
    () => ({
      width,
      height,
      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
      zIndex,
      fontSize,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      fontFamily: fontFamily,
      textDecoration: `${underline ? "underline" : ""} ${strikethrough ? "line-through" : ""}`,
      lineHeight,
      color,
      filter: buildTextDropShadow(
        shadow,
        shadowOffsetX,
        shadowOffsetY,
        shadowBlur,
        shadowColor
      ),
      textShadow: buildTextGlyphShadow(
        shadow,
        shadowOffsetX,
        shadowOffsetY,
        shadowBlur,
        shadowColor
      ),
      border:
        border && !isHoverActive
          ? `${borderWidth}px ${borderStyle} ${borderColor}`
          : isHoverActive && !isSelected
            ? "1px solid var(--primary-color, #1890ff)"
            : "none",
      ...placementConvey(placement),
      cursor: mode === "edit" ? (isSelected ? "text" : "pointer") : "default",
      backgroundColor:
        backgroundColor === "transparent" ? "transparent" : backgroundColor,
    }),
    [
      width,
      height,
      x,
      y,
      rotate,
      zIndex,
      fontSize,
      bold,
      italic,
      fontFamily,
      underline,
      strikethrough,
      lineHeight,
      color,
      shadow,
      shadowOffsetY,
      shadowOffsetX,
      shadowBlur,
      shadowColor,
      border,
      isHoverActive,
      borderWidth,
      borderStyle,
      borderColor,
      isSelected,
      placementConvey,
      placement,
      mode,
      backgroundColor,
    ]
  );

  // 组合CSS类名
  const className = [
    styles.textElement,
    isEditing ? styles.editing : "",
    mode === "edit" && isDragging ? styles.dragging : "",
    mode === "edit" && isSelected && !isEditing ? "element-selected" : "",
    mode === "edit" && !text && !isEditing ? styles.empty : "",
  ]
    .filter(Boolean)
    .join(" ");

  return mode === "edit" ? (
    <>
      <div
        ref={textRef}
        id={id}
        className={className}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        style={dynamicStyle}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onKeyDown={isEditing ? handleKeyDown : undefined}
        onBlur={isEditing ? handleBlur : undefined}
      >
        <AnimationWrapper
          mode={mode}
          elementId={id}
          animationName={animationName}
          animationDuration={animationDuration}
          animationDelay={animationDelay}
          animationTrigger={animationTrigger}
          className="w-full h-full"
        >
          <span>{text || (isEditing ? "" : "")}</span>
        </AnimationWrapper>
      </div>
      {!isEditing && (
        <MovableWrapper
          ref={moveableRef}
          id={id}
          active={isSelected} // 选中时激活拖拽
          x={x}
          y={y}
          width={width}
          height={height}
          rotate={rotate}
          onSelect={onSelect}
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
      )}
    </>
  ) : (
    <div id={`preview_${id}`} className={className} style={dynamicStyle}>
      <AnimationWrapper
        mode={mode}
        elementId={id}
        animationName={animationName}
        animationDuration={animationDuration}
        animationDelay={animationDelay}
        animationTrigger={animationTrigger}
        className="w-full h-full"
      >
        <span>{text || (isEditing ? "" : "")}</span>
      </AnimationWrapper>
    </div>
  );
};

export const Text = memo(Component);

export const CreateText = (props: Partial<ITextProps> = {}) => {
  const width = props.width ?? 100;
  const height = props.height ?? 100;
  const defaultProps: Omit<ITextProps, "type" | "id"> = {
    mode: "edit",
    text: "Hello, world!",
    fontSize: 16,
    fontFamily: "Arial",
    color: "#000000",
    ...getCenteredElementPosition(width, height),
    width,
    height,
    rotate: 0,
    zIndex: 0,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    lineHeight: 1,
    shadow: false,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 4,
    shadowColor: "#000000",
    border: false,
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: "#000000",
    // PPT 文本框默认无填充
    backgroundColor: "transparent",
    placement: "center-center",
  };
  return {
    ...defaultProps,
    ...props,
    id: `text_${getRandomId()}`,
    type: "text" as const,
  };
};

function TextButtonComponent() {
  const { t } = useTranslation();
  const pageId = pageActiveStore.getPageActive() as string;

  const clickHandle = useMemoizedFn(() => {
    const option = CreateText();
    const ok = pptStore.addElementInfo(pageId, option);
    if (ok && pageActiveStore.getPageActive()) {
      elementActiveStore.setElementActive(option.id);
    }
  });

  return (
    <PanelButton
      icon={<TextIcon fill="currentColor" style={{ fontSize: "24px" }} />}
      title={t("elements.text.button")}
      onClick={clickHandle}
    />
  );
}

export const TextButton = memo(TextButtonComponent);

export const TextPanelIcon = TextIcon;
export const Name = "elements.text.title";
