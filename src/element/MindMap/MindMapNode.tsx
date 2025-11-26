import type { Node } from "@antv/x6";
import { Plus } from "@icon-park/react";
import { useEffect, useRef, useState } from "react";

interface MindMapNodeProps {
  node: Node;
}

export const MindMapNode: React.FC<MindMapNodeProps> = ({ node }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 获取节点数据
  const data = node.getData<{ topic?: string }>();
  const text = data?.topic || "";
  const attrs = node.getAttrs();
  const textAttrs = attrs.text || {};

  // 检查节点是否只读
  const readonly = node.getData()?.readonly || false;

  // 根据文本内容自适应调整节点大小
  useEffect(() => {
    if (!textRef.current) return;

    const updateSize = () => {
      if (!textRef.current) return;

      const padding = { left: 8, right: 8, top: 6, bottom: 6 };
      const fontSize =
        typeof textAttrs.fontSize === "number"
          ? textAttrs.fontSize
          : parseInt(String(textAttrs.fontSize || "14"), 10);

      // 测量文本的实际宽度和高度（支持多行）
      // 创建一个临时元素来测量文本尺寸
      const measureElement = document.createElement("div");
      measureElement.style.position = "absolute";
      measureElement.style.visibility = "hidden";
      measureElement.style.whiteSpace = "pre";
      // 不设置固定宽度，让文本自然换行来计算最大宽度
      measureElement.style.fontSize = `${fontSize}px`;
      measureElement.style.fontFamily = (
        typeof textAttrs.fontFamily === "string"
          ? textAttrs.fontFamily
          : "Arial, sans-serif"
      ) as string;
      measureElement.style.fontWeight = (
        typeof textAttrs.fontWeight === "string" ||
        typeof textAttrs.fontWeight === "number"
          ? String(textAttrs.fontWeight)
          : "normal"
      ) as string;
      measureElement.textContent = text || "";
      document.body.appendChild(measureElement);

      const textWidth = measureElement.scrollWidth;
      const textHeight = Math.max(measureElement.scrollHeight, fontSize * 1.2);
      document.body.removeChild(measureElement);

      // 计算新的宽度和高度，加上 padding
      const newWidth = Math.max(60, textWidth + padding.left + padding.right);
      const newHeight = Math.max(30, textHeight + padding.top + padding.bottom);

      // 更新节点大小
      node.resize(newWidth, newHeight);
    };

    // 延迟执行，确保 DOM 已渲染
    const timer = setTimeout(() => {
      updateSize();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [
    text,
    node,
    textAttrs.fontSize,
    textAttrs.fontFamily,
    textAttrs.fontWeight,
  ]);

  // 处理双击开始编辑
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (readonly) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  // 保存编辑
  const handleBlur = () => {
    if (!textRef.current) return;
    const newText = textRef.current.textContent || "";

    if (newText.trim() !== text) {
      // 根据 textRef 的 DOM 尺寸更新节点大小
      const padding = { left: 8, right: 8, top: 6, bottom: 6 };
      const textWidth = textRef.current.scrollWidth;
      const textHeight = textRef.current.scrollHeight;

      const newWidth = Math.max(60, textWidth + padding.left + padding.right);
      const newHeight = Math.max(30, textHeight + padding.top + padding.bottom);

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
    const padding = { left: 8, right: 8, top: 6, bottom: 6 };
    const fontSize =
      typeof textAttrs.fontSize === "number"
        ? textAttrs.fontSize
        : parseInt(String(textAttrs.fontSize || "14"), 10);

    // 测量多行文本的宽度和高度
    const textWidth = textRef.current.scrollWidth;
    const textHeight = Math.max(textRef.current.scrollHeight, fontSize * 1.2);

    const newWidth = Math.max(60, textWidth + padding.left + padding.right);
    const newHeight = Math.max(30, textHeight + padding.top + padding.bottom);

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

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-start py-1.5 px-2 box-border rounded border border-[#5F95FF] bg-[#EFF4FF] ${
        readonly ? "cursor-default" : "cursor-pointer"
      } relative`}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!readonly && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`absolute right-[-35px] top-0 bottom-0 w-[30px] flex items-center justify-start pl-[5px] transition-opacity duration-200 ${
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
        className={`w-full min-w-[20px] whitespace-pre p-0 m-0 ${
          isEditing ? "border-0 outline-none bg-transparent" : ""
        }`}
        style={{
          fontSize: `${typeof textAttrs.fontSize === "number" ? textAttrs.fontSize : parseInt(String(textAttrs.fontSize || "14"), 10)}px`,
          color: (typeof textAttrs.fill === "string"
            ? textAttrs.fill
            : "#262626") as string,
          fontFamily: (typeof textAttrs.fontFamily === "string"
            ? textAttrs.fontFamily
            : "Arial, sans-serif") as string,
          fontWeight: (typeof textAttrs.fontWeight === "string" ||
          typeof textAttrs.fontWeight === "number"
            ? String(textAttrs.fontWeight)
            : "normal") as string,
        }}
      >
        {!isEditing && (text || "")}
      </div>
    </div>
  );
};
