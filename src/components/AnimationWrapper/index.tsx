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
        // 移除所有动画类
        element.classList.remove("animate__animated");
        element.classList.forEach((cls) => {
          if (cls.startsWith("animate__")) {
            element.classList.remove(cls);
          }
        });

        // 使用 requestAnimationFrame 确保 DOM 更新后再重新添加动画类
        requestAnimationFrame(() => {
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

    // play 模式下，如果有动画名称，默认透明度为 0
    if (mode === "play" && animationName && animationName !== "") {
      return {
        ...baseStyle,
        opacity: 0,
      };
    }

    return baseStyle;
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

  // 监听动画结束事件，发送事件总线事件
  useEffect(() => {
    if (!elementId || !animationName || !wrapperRef.current) return;

    const element = wrapperRef.current;

    const handleAnimationEnd = () => {
      // 发送动画结束事件
      globalEventBus.emit(`animation-end-${elementId}`);
    };

    element.addEventListener("animationend", handleAnimationEnd);

    return () => {
      element.removeEventListener("animationend", handleAnimationEnd);
    };
  }, [elementId, animationName]);

  // 如果没有动画名称，直接返回 children，避免不必要的 DOM 节点
  if (!animationName || animationName === "") {
    return <>{children}</>;
  }

  return (
    <div
      ref={wrapperRef}
      className={combinedClassName || undefined}
      style={wrapperStyle}
    >
      {children}
    </div>
  );
};
