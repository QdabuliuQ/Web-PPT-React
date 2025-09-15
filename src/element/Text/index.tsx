import { MovableWrapper } from "@/components";
import { PanelButton } from "@/components/PanelButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { getRandomId } from "@/utils";
import { Text as TextIcon } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { memo, useEffect, useMemo, useRef, useState, type FC } from "react";
import { PlacementMapped } from "./constant";
import styles from "./index.module.less";
export { TextPanel, TextPanelKey, TextPanelTitle } from "./panel";

export interface ITextProps {
  type: "text";
  id: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  lineHeight: number;
  shadow: boolean;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowColor: string;
  border: boolean;
  borderStyle: string;
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
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
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  zIndex: number;
  onSelect?: () => void;
  onUnSelect?: () => void;
}

const Component: FC<ITextProps> = (props) => {
  const {
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
    shadowColor,
    border,
    borderWidth,
    borderStyle,
    borderColor,
    backgroundColor,
    stroke,
    strokeColor,
    strokeWidth,
    placement,
    rotate,
    zIndex,
    onSelect,
    onUnSelect,
  } = props;
  console.log(backgroundColor, "backgroundColor");

  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // 从 MobX store 中获取选中状态
  const isSelected = elementActiveStore.isElementActive(id);

  // 拖拽开始
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // 拖拽结束
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 缩放开始
  const handleResizeStart = () => {
    setIsDragging(true);
  };

  // 缩放结束
  const handleResizeEnd = () => {
    setIsDragging(false);
  };

  // 旋转开始
  const handleRotateStart = () => {
    setIsDragging(true);
  };

  // 旋转结束
  const handleRotateEnd = () => {
    setIsDragging(false);
  };

  // 处理单击事件 - 激活元素
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 如果正在编辑，不处理点击激活
    if (isEditing) {
      return;
    }

    // 调用外部传入的选择回调
    onSelect?.();
  };

  // 进入编辑模式
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 防止在拖拽状态下误触发编辑
    if (isDragging) {
      return;
    }

    // 确保元素被激活
    onSelect?.();
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
    if (textRef.current && !isEditing) {
      textRef.current.textContent = text;
    }
  }, [text, isEditing]);

  // 自动聚焦和选择文本
  useEffect(() => {
    if (isEditing && textRef.current) {
      // 进入编辑模式时，确保不在拖拽状态
      setIsDragging(false);

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
  }, [isEditing, text]);

  // 添加全局鼠标事件监听，防止拖拽状态卡住
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // 鼠标释放时重置拖拽状态
      setIsDragging(false);
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!isSelected) {
      onUnSelect?.();
    }
  }, [isSelected, onUnSelect]);

  const placementConvey = useMemoizedFn((placement) => {
    const mapped = PlacementMapped[placement as keyof typeof PlacementMapped];
    const [align, justify] = mapped.split(" ");
    return {
      display: "flex",
      alignItems: align,
      justifyContent: justify,
    };
  });

  // 动态样式（位置、大小、颜色等）
  const dynamicStyle = useMemo(
    () => ({
      left: x,
      top: y,
      width,
      height,
      transform: `rotate(${rotate}deg)`,
      zIndex,
      fontSize,
      fontWeight: bold ? "bold" : "normal",
      fontStyle: italic ? "italic" : "normal",
      fontFamily: fontFamily,
      textDecoration: `${underline ? "underline" : ""} ${strikethrough ? "line-through" : ""}`,
      lineHeight,
      color,
      textShadow: shadow
        ? `${shadowOffsetY}px ${shadowOffsetX}px 5px ${shadowColor}`
        : "none",
      border: border
        ? `${borderWidth}px ${borderStyle} ${borderColor}`
        : "none",
      "-webkit-text-stroke": stroke ? `${strokeWidth}px ${strokeColor}` : "",
      ...placementConvey(placement),
      cursor: isSelected ? "text" : "pointer",
      backgroundColor,
    }),
    [
      x,
      y,
      width,
      height,
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
      shadowOffsetX,
      shadowOffsetY,
      shadowColor,
      border,
      borderWidth,
      borderStyle,
      borderColor,
      stroke,
      strokeColor,
      strokeWidth,
      placementConvey,
      placement,
      isSelected,
      backgroundColor,
    ]
  );

  // 组合CSS类名
  const className = [
    styles.textElement,
    isEditing ? styles.editing : "",
    isDragging ? styles.dragging : "",
    isSelected && !isEditing ? styles.selected : "",
    !text && !isEditing ? styles.empty : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        ref={textRef}
        id={id}
        className={className}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        style={dynamicStyle}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={isEditing ? handleKeyDown : undefined}
        onBlur={isEditing ? handleBlur : undefined}
      >
        <span>{text || (isEditing ? "" : "")}</span>
      </div>

      {/* 只在非编辑模式下显示拖拽控件 */}
      {!isEditing && (
        <MovableWrapper
          id={id}
          active={isSelected} // 根据选中状态控制激活
          bounds={{ left: 0, top: 0, right: 1000, bottom: 700 }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
          onRotateStart={handleRotateStart}
          onRotateEnd={handleRotateEnd}
        />
      )}
    </>
  );
};

export const Text = memo(observer(Component));

export const CreateText = (props: Partial<ITextProps> = {}) => {
  const defaultProps = {
    text: "Hello, world!",
    fontSize: 16,
    fontWeight: 400,
    fontFamily: "Arial",
    color: "#000000",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotate: 0,
    zIndex: 0,
  };
  return {
    ...defaultProps,
    ...props,
    id: `text_${getRandomId()}`,
    type: "text" as const,
  };
};

export const TextButton = memo(
  observer(function TextButton() {
    const pageId = pageActiveStore.getPageActive() as string;

    const clickHandle = useMemoizedFn(() => {
      const option = CreateText();
      pptStore.addElementInfo(pageId, option);
      if (pageActiveStore.getPageActive()) {
        elementActiveStore.setElementActive(option.id);
      }
    });

    return (
      <PanelButton
        icon={<TextIcon style={{ fontSize: "24px" }} />}
        title="文本"
        onClick={clickHandle}
      />
    );
  })
);
