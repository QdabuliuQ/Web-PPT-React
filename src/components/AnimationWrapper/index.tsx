import { globalEventBus } from "@/utils/eventBus";
import { useEffect, useRef, type FC, type ReactNode } from "react";

export interface AnimationWrapperProps {
  children: ReactNode;
  mode?: "preview" | "play" | "edit";
  elementId?: string;
  animationName?: string;
  animationDuration?: string;
  animationDelay?: string;
  animationTrigger?: "click" | "default";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AnimationWrapper 组件
 * 负责添加和移除动画，将元素包裹在 wrapper 中
 */
export const AnimationWrapper: FC<AnimationWrapperProps> = ({
  children,
  mode = "edit",
  elementId,
  animationName,
  animationDuration = "default",
  animationDelay = "0s",
  animationTrigger: _animationTrigger = "default",
  className = "",
  style,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 监听动画播放事件（编辑模式和播放模式都需要）
  useEffect(() => {
    if (!elementId || !animationName) return;

    const eventName = `animation-play-${elementId}`;

    const handleAnimationPlay = () => {
      // 触发动画：先移除动画类，然后重新添加以重新触发动画
      const element = wrapperRef.current;
      if (element) {
        // 清除之前可能残留的 transform
        element.style.transform = "";

        // 强制设置 transform-origin 为 center center，确保缩放从中心开始
        element.style.transformOrigin = "center center";

        // 移除所有动画类
        element.classList.remove("animate__animated");
        element.classList.forEach((cls) => {
          if (cls.startsWith("animate__")) {
            element.classList.remove(cls);
          }
        });

        // 使用 requestAnimationFrame 确保 DOM 更新后再重新添加动画类
        requestAnimationFrame(() => {
          // 再次确保 transform-origin 设置为 center center
          // 这样可以覆盖 animate.css 可能设置的 transform-origin
          element.style.transformOrigin = "center center";

          // 重新添加动画类以触发动画
          element.classList.add(
            "animate__animated",
            `animate__${animationName}`
          );
          if (animationDelay && animationDelay !== "0s") {
            element.classList.add(`animate__delay-${animationDelay}`);
          }
          if (animationDuration && animationDuration !== "default") {
            element.classList.add(`animate__${animationDuration}`);
          }
        });
      }
    };

    globalEventBus.on(eventName, handleAnimationPlay);

    return () => {
      globalEventBus.off(eventName, handleAnimationPlay);
    };
  }, [elementId, animationName, animationDelay, animationDuration]);

  // 获取样式，play 模式下默认透明度为 0
  const getWrapperStyle = (): React.CSSProperties => {
    const baseStyle = style || {};

    // 始终设置 transform-origin 为 center center，确保动画从中心开始
    const styleWithTransformOrigin = {
      ...baseStyle,
      transformOrigin: "center center",
    };

    // play 模式下，如果有动画名称，默认透明度为 0
    if (mode === "play" && animationName && animationName !== "") {
      return {
        ...styleWithTransformOrigin,
        opacity: 0,
      };
    }

    // edit 模式下，设置 pointer-events: none 让点击事件穿透到 canvas
    // 子元素会处理自己的点击事件，所以不影响元素本身的交互
    if (mode === "edit") {
      return {
        ...styleWithTransformOrigin,
        pointerEvents: "none" as const,
      };
    }

    return styleWithTransformOrigin;
  };

  const combinedClassName = className.trim() || undefined;
  const wrapperStyle = getWrapperStyle();

  // 监听动画开始事件，在 play 模式下将透明度设置为 1
  useEffect(() => {
    if (mode !== "play" || !animationName || !wrapperRef.current) return;

    const element = wrapperRef.current;

    const handleAnimationStart = () => {
      element.style.opacity = "1";
    };

    element.addEventListener("animationstart", handleAnimationStart);

    return () => {
      element.removeEventListener("animationstart", handleAnimationStart);
    };
  }, [mode, animationName]);

  // 监听动画结束事件，发送事件总线事件并清理 transform
  useEffect(() => {
    if (!elementId || !animationName || !wrapperRef.current) return;

    const element = wrapperRef.current;

    const handleAnimationEnd = () => {
      // 清除动画结束后残留的 transform
      // 让元素回到原始位置，避免停留在动画结束位置（如左下角）
      element.style.transform = "";

      // 保持 transform-origin 为 center center，确保后续动画也从中心开始
      element.style.transformOrigin = "center center";

      // 发送动画结束事件
      globalEventBus.emit(`animation-end-${elementId}`);
    };

    element.addEventListener("animationend", handleAnimationEnd);

    return () => {
      element.removeEventListener("animationend", handleAnimationEnd);
    };
  }, [elementId, animationName]);

  // 如果没有动画名称，直接返回 children，避免不必要的 DOM 节点
  if (mode === "preview" || !animationName || animationName === "") {
    return <>{children}</>;
  }

  return (
    <div
      ref={wrapperRef}
      className={combinedClassName || undefined}
      style={wrapperStyle}
    >
      {/* 在 edit 模式下，子元素需要恢复 pointer-events 以接收点击事件 */}
      {/* 使用 display: contents 避免额外的布局影响 */}
      <div
        style={
          mode === "edit"
            ? { pointerEvents: "auto" as const, display: "contents" }
            : undefined
        }
        className="w-full h-full"
      >
        {children}
      </div>
    </div>
  );
};
