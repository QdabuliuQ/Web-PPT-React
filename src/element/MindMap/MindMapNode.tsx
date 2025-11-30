import type { Node } from "@antv/x6";
import { Plus } from "@icon-park/react";
import { useEffect, useRef, useState } from "react";

interface MindMapNodeProps {
  node: Node;
}

const padding = { left: 10, right: 10, top: 10, bottom: 10 };
const safetyMargin = 0; // 安全边距，防止数字被截断

export const MindMapNode: React.FC<MindMapNodeProps> = ({ node }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 获取节点数据
  const data = node.getData<{ topic?: string; _editing?: boolean }>();
  const text = data?.topic || "";
  const attrs = node.getAttrs();
  const styleAttrs = attrs.style || {};
  const textAttrs = attrs.text || {};

  // 检查节点是否只读
  const readonly = node.getData()?.readonly || false;

  // 监听 attrs 变化，触发重新渲染
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const handleAttrsChange = () => {
      forceUpdate({});
    };
    node.on("change:attrs", handleAttrsChange);
    return () => {
      node.off("change:attrs", handleAttrsChange);
    };
  }, [node]);

  // 监听节点数据变化，用于响应 X6 事件触发的编辑状态
  useEffect(() => {
    const checkEditing = () => {
      const editingFlag = node.getData()?._editing;
      if (editingFlag && !readonly && !isEditing) {
        setIsEditing(true);
        // 清除标志，避免重复触发
        const currentData = node.getData() || {};
        node.setData({ ...currentData, _editing: false });
      }
    };

    // 立即检查一次
    checkEditing();

    // 监听节点数据变化
    const handleChange = () => {
      checkEditing();
    };

    node.on("change:data", handleChange);

    return () => {
      node.off("change:data", handleChange);
    };
  }, [node, readonly, isEditing]);

  // 根据文本内容自适应调整节点大小
  useEffect(() => {
    if (!textRef.current) return;

    const updateSize = () => {
      if (!textRef.current) return;

      // 使用 getBoundingClientRect 获取更精确的尺寸
      const rect = textRef.current.getBoundingClientRect();
      const textWidth = Math.ceil(rect.width); // 向上取整，确保包含所有内容
      const textHeight = Math.ceil(rect.height);

      // 获取边框宽度
      const borderWidth =
        typeof styleAttrs.borderWidth === "number"
          ? styleAttrs.borderWidth
          : typeof styleAttrs.borderWidth === "string"
            ? parseInt(String(styleAttrs.borderWidth), 10) || 1
            : 1;
      const borderWidthTotal = borderWidth * 2; // 左右或上下各有一条边框

      // 计算新的宽度和高度，加上 padding、安全边距和边框宽度
      const newWidth =
        textWidth +
        padding.left +
        padding.right +
        safetyMargin +
        borderWidthTotal;
      const newHeight =
        textHeight + padding.top + padding.bottom + borderWidthTotal;

      // 更新节点大小
      node.resize(newWidth, newHeight);
    };

    // 延迟执行，确保 DOM 已渲染
    const timer = setTimeout(() => {
      updateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [
    text,
    node,
    styleAttrs.fontSize,
    styleAttrs.borderWidth,
    textAttrs.fontFamily,
    styleAttrs.fontWeight,
  ]);

  // 处理双击开始编辑
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (readonly) return;
    e.stopPropagation();
    e.preventDefault(); // 阻止默认行为
    setIsEditing(true);
  };

  // 保存编辑
  const handleBlur = () => {
    if (!textRef.current) return;
    const newText = textRef.current.textContent || "";

    if (newText.trim() !== text) {
      // 使用 getBoundingClientRect 获取更精确的尺寸
      const rect = textRef.current.getBoundingClientRect();
      const textWidth = Math.ceil(rect.width); // 向上取整，确保包含所有内容
      const textHeight = Math.ceil(rect.height);
      console.log(rect, "rect");

      // 获取边框宽度
      const borderWidth =
        typeof styleAttrs.borderWidth === "number"
          ? styleAttrs.borderWidth
          : typeof styleAttrs.borderWidth === "string"
            ? parseInt(String(styleAttrs.borderWidth), 10) || 1
            : 1;
      const borderWidthTotal = borderWidth * 2; // 左右或上下各有一条边框

      const newWidth =
        textWidth +
        padding.left +
        padding.right +
        safetyMargin +
        borderWidthTotal;
      const newHeight =
        textHeight + padding.top + padding.bottom + borderWidthTotal;

      // 更新节点大小
      node.resize(newWidth, newHeight);

      // 更新节点数据
      node.setData({ ...data, topic: newText.trim() });
      // 更新节点属性中的文本
      node.setAttrs({
        text: {
          text: newText.trim(),
        },
      });
    }
    setIsEditing(false);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Ctrl+Enter 或 Cmd+Enter 保存并退出编辑
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (textRef.current) {
        textRef.current.textContent = text;
      }
      setIsEditing(false);
    }
    // 普通 Enter 键允许换行，不做处理
  };

  // 处理输入事件，实时更新节点大小
  const handleInput = () => {
    if (!textRef.current) return;

    // 使用 getBoundingClientRect 获取更精确的尺寸
    const rect = textRef.current.getBoundingClientRect();
    const textWidth = Math.ceil(rect.width); // 向上取整，确保包含所有内容
    const textHeight = Math.ceil(rect.height);

    // 获取边框宽度
    const borderWidth =
      typeof styleAttrs.borderWidth === "number"
        ? styleAttrs.borderWidth
        : typeof styleAttrs.borderWidth === "string"
          ? parseInt(String(styleAttrs.borderWidth), 10) || 1
          : 1;
    const borderWidthTotal = borderWidth * 2; // 左右或上下各有一条边框

    const newWidth =
      textWidth +
      padding.left +
      padding.right +
      safetyMargin +
      borderWidthTotal;
    const newHeight =
      textHeight + padding.top + padding.bottom + borderWidthTotal;

    node.resize(newWidth, newHeight);
  };

  // 当进入编辑模式时，自动聚焦并选中文本
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.textContent = text;
      textRef.current.focus();
      // 选中所有文本
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing, text]);

  // 处理添加子节点
  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readonly) return;
    // 触发自定义事件，通知父组件添加子节点
    node.notify("add-child", {});
  };

  // 处理鼠标进入
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  // 处理鼠标离开，延迟隐藏
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200); // 200ms 延迟，给用户时间移动到按钮上
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // 从 attrs.style 中获取样式属性
  const backgroundColor = styleAttrs.background || "#EFF4FF";
  const borderColor = styleAttrs.border || "#5F95FF";
  const borderWidth = styleAttrs.borderWidth || 1;
  const borderStyle = styleAttrs.borderStyle || "solid";
  const fontSize = styleAttrs.fontSize || 14;
  const textColor = styleAttrs.color || "#262626";
  const fontWeight = styleAttrs.fontWeight || "normal";

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-start py-[5px] px-[10px] box-border rounded ${
        readonly ? "cursor-default" : "cursor-pointer"
      } relative`}
      style={
        {
          backgroundColor: backgroundColor as string,
          borderColor: borderColor as string,
          borderWidth: `${borderWidth}px`,
          borderStyle,
        } as React.CSSProperties
      }
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!readonly && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`custom-icon absolute right-[-35px] top-0 bottom-0 w-[30px] flex items-center gap-[3px] pl-[5px] transition-opacity duration-200 ${
            isHovered
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={handleAddChild}
            className="w-4 h-4 rounded-full border border-[#5F95FF] bg-white text-[#5F95FF] text-sm leading-none cursor-pointer flex items-center justify-center p-0 m-0 z-10 shadow hover:bg-[#5F95FF] hover:text-white transition-colors"
          >
            <Plus />
          </button>
        </div>
      )}
      <div
        ref={textRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={isEditing ? handleBlur : undefined}
        onKeyDown={isEditing ? handleKeyDown : undefined}
        onInput={isEditing ? handleInput : undefined}
        className={`min-w-[20px] whitespace-pre p-0 m-0 leading-4 inline-block flex-shrink-0 ${
          isEditing ? "border-0 outline-none bg-transparent" : ""
        }`}
        style={{
          fontSize: `${typeof fontSize === "number" ? fontSize : parseInt(String(fontSize), 10)}px`,
          color: textColor as string,
          fontFamily: (typeof textAttrs.fontFamily === "string"
            ? textAttrs.fontFamily
            : "Arial, sans-serif") as string,
          fontWeight: (typeof fontWeight === "string" ||
          typeof fontWeight === "number"
            ? String(fontWeight)
            : "normal") as string,
        }}
      >
        {!isEditing && (text || "")}
      </div>
    </div>
  );
};
