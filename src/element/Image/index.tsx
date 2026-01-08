import { AnimationWrapper, MovableWrapper } from "@/components";
import useCommonContextMenu from "@/hooks/useCommonContextMenu";
import {
  contextMenuStore,
  elementHoverActiveStore,
  pageActiveStore,
  useElementActiveStore,
} from "@/store";
import type { ICommonElementProps } from "@/types/element";
import { getRandomId } from "@/utils";
import { Pic } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Spin } from "antd";
import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useMovableElement } from "../../hooks/useMovableElement";
import styles from "./index.module.less";
import { getImageMenuItems } from "./menu";
import { downloadImageFile } from "./utils";

export { ImageButtonComponent as ImageButton } from "./button";
export { ImagePanel, ImagePanelKey, ImagePanelTitle } from "./panel";

export interface IImageProps extends ICommonElementProps {
  type: "image";
  src: string; // 图片地址
  opacity: number; // 透明度 0-1
  border: boolean; // 是否显示边框
  borderRadius: number; // 圆角
  borderWidth: number; // 边框宽度
  borderColor: string; // 边框颜色
  borderStyle: "solid" | "dashed" | "dotted"; // 边框样式
  keepRatio: boolean; // 是否保持比例
  brightness: number; // 亮度
  contrast: number; // 对比度
  saturate: number; // 饱和度
  grayscale: number; // 灰度
  hueRotate: number; // 色相旋转
  invert: number; // 反色/负片效果
  sepia: number; // 怀旧效果
  shadow: boolean; // 是否显示阴影
  shadowOffsetX: number; // 阴影偏移X
  shadowOffsetY: number; // 阴影偏移Y
  shadowColor: string; // 阴影颜色
  shadowBlur: number; // 阴影模糊半径
  shadowSpread: number; // 阴影扩张半径
}

export interface ImageRef {
  openPreview: () => void;
}

const Component = forwardRef<ImageRef, IImageProps>((props, ref) => {
  const {
    mode = "edit",
      id,
      src,
      opacity,
      border,
      borderRadius,
      borderWidth,
      borderColor,
      borderStyle,
      keepRatio,
      brightness,
      contrast,
      saturate,
      grayscale,
      hueRotate,
      invert,
      sepia,
      shadow,
      shadowOffsetX,
      shadowOffsetY,
      shadowColor,
      shadowBlur,
      shadowSpread,
      x,
      y,
      width,
      height,
      rotate,
      zIndex,
      animationName,
      animationDuration,
      animationDelay,
      animationTrigger,
      onSelect,
      onUnSelect,
    } = props;

    const imageRef = useRef<HTMLDivElement>(null);
    const moveableRef = useRef<any>(null);
    const photoViewRef = useRef<HTMLImageElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // 图片加载完成
    const handleImageLoad = useMemoizedFn(() => {
      setImageLoaded(true);
      setImageError(false);
    });

    // 图片加载失败
    const handleImageError = useMemoizedFn(() => {
      setImageLoaded(false);
      setImageError(true);
    });

    // 当 src 改变时重置加载状态
    useEffect(() => {
      setImageLoaded(false);
      setImageError(false);
    }, [src]);

    const hasDraggedRef = useRef(false);

    const handleDragStart = useMemoizedFn(() => {
      hasDraggedRef.current = false;
      originalHandleDragStart();
    });

    const handleDrag = useMemoizedFn(
      (params: { x: number; y: number; transform: string }) => {
        if (Math.abs(params.x) > 1 || Math.abs(params.y) > 1) {
          hasDraggedRef.current = true;
        }
        originalHandleDrag(params);
      }
    );

    const handleDragEnd = useMemoizedFn(() => {
      originalHandleDragEnd();
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 300);
    });

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
      },
      onMoveableRefresh: () => {
        // 刷新 Moveable 位置
        if (moveableRef.current) {
          moveableRef.current.updateRect();
        }
      },
    });

    // 使用 Zustand hook 订阅状态变化，确保组件能够响应状态更新
    const elementActive = useElementActiveStore((state) => state.elementActive);
    const isSelected = elementActive === id;
    const isHoverActive = elementHoverActiveStore.isElementHoverActive(id);

    // 获取当前页面ID
    const currentPageId = pageActiveStore.getPageActive() || "";

    // 获取通用菜单
    const { commonMenu } = useCommonContextMenu(currentPageId, id);

    const handleMouseDown = useMemoizedFn((_e: React.MouseEvent) => {
      // 不要阻止事件传播，避免影响双击事件
      // 只在确实需要时才激活元素
      if (!isSelected) {
        // 使用 requestAnimationFrame 延迟激活，避免影响双击事件
        requestAnimationFrame(() => {
          if (!hasDraggedRef.current) {
            onSelect?.();
          }
        });
      }
    });

    // 通过函数触发预览
    const openPreview = useMemoizedFn(() => {
      if (imageLoaded && !imageError && photoViewRef.current) {
        // 触发 PhotoView 的预览
        photoViewRef.current.click();
      }
    });

    // 下载图片
    const handleDownload = useMemoizedFn(async () => {
      if (!imageLoaded || imageError || !src) {
        return;
      }

      await downloadImageFile(src, id);
    });

    // 通过 ref 暴露预览函数
    useImperativeHandle(ref, () => ({
      openPreview,
    }));

    // 处理双击事件 - 打开预览
    const handleDoubleClick = useMemoizedFn((e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (hasDraggedRef.current) {
        return;
      }
      openPreview();
    });

    // 处理右键菜单
    const handleContextMenu = useMemoizedFn((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 如果未选中，先选中
      if (!isSelected) {
        onSelect?.();
      }

      // 合并图片菜单和通用菜单
      const imageMenuItems = getImageMenuItems({
        onPreview: openPreview,
        onDownload: handleDownload,
      });
      const menuItems = [...imageMenuItems, ...commonMenu];
      contextMenuStore.showMenu(e.clientX, e.clientY, menuItems);
    });

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
        cursor: isSelected ? "move" : mode === "edit" ? "pointer" : "default",
      }),
      [x, y, width, height, rotate, zIndex, isSelected, mode]
    );

    // 图片样式
    const imageStyle = useMemo(
      () => ({
        width: "100%",
        height: "100%",
        objectFit: "fill" as const,
        opacity,
        borderRadius: `${borderRadius}px`,
        border:
          border && !isHoverActive
            ? `${borderWidth}px ${borderStyle} ${borderColor}`
            : isHoverActive && !isSelected
              ? "1px solid var(--primary-color, #f25f00)"
              : "none",
        boxSizing: "border-box" as const,
        userSelect: "none" as const,
        pointerEvents: "none" as const,
        filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) grayscale(${grayscale}) hue-rotate(${hueRotate}deg) invert(${invert}) sepia(${sepia})`,
        boxShadow: shadow
          ? `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`
          : "none",
      }),
      [
        opacity,
        borderRadius,
        border,
        borderWidth,
        borderStyle,
        borderColor,
        isHoverActive,
        isSelected,
        brightness,
        contrast,
        saturate,
        grayscale,
        hueRotate,
        invert,
        sepia,
        shadow,
        shadowOffsetX,
        shadowOffsetY,
        shadowBlur,
        shadowSpread,
        shadowColor,
      ]
    );

    // 组合CSS类名（外层 div）
    const className = useMemo(
      () =>
        [
          styles.imageElement,
          mode === "edit" ? styles.editMode : "",
          mode === "edit" && isDragging ? styles.dragging : "",
          mode === "edit" && isSelected ? "element-selected" : "",
        ]
          .filter(Boolean)
          .join(" "),
      [isDragging, isSelected, mode]
    );

    // 图片内容组件 - 封装重复的渲染逻辑
    const ImageContent = useMemo(() => {
      // 加载状态和错误状态的通用渲染
      const renderLoadingAndError = () => (
        <>
          {!imageLoaded && !imageError && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
              <Spin />
            </div>
          )}
          {imageError && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-sm select-none text-center">
              图片加载失败
            </div>
          )}
        </>
      );

      // 图片元素
      const imageElement = (
        <img
          ref={photoViewRef}
          src={src}
          alt=""
          className={imageLoaded ? styles.imageVisible : styles.imageHidden}
          style={imageStyle}
          draggable={false}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={
            mode === "edit"
              ? (e) => {
                  // 阻止单击触发预览，只允许双击
                  e.stopPropagation();
                  e.preventDefault();
                }
              : undefined
          }
        />
      );

      // 根据 mode 决定是否使用 PhotoProvider 和 PhotoView
      const imageWithProvider =
        mode === "edit" ? (
          <PhotoProvider>
            <div className={styles.imageWrapper}>
              <PhotoView src={src} overlay={<div />}>
                {imageElement}
              </PhotoView>
            </div>
          </PhotoProvider>
        ) : (
          <div className={styles.imageWrapper}>{imageElement}</div>
        );

      // 根据 mode 决定是否使用 AnimationWrapper
      const needsAnimation = mode === "edit" || mode === "play";
      const content = (
        <>
          {renderLoadingAndError()}
          {imageWithProvider}
        </>
      );

      if (needsAnimation) {
        return (
          <AnimationWrapper
            mode={mode}
            elementId={id}
            animationName={animationName}
            animationDuration={animationDuration}
            animationDelay={animationDelay}
            animationTrigger={animationTrigger}
            className="w-full h-full"
          >
            {content}
          </AnimationWrapper>
        );
      }

      return content;
    }, [
      imageLoaded,
      imageError,
      src,
      imageStyle,
      mode,
      id,
      animationName,
      animationDuration,
      animationDelay,
      animationTrigger,
      handleImageLoad,
      handleImageError,
    ]);

    return mode === "edit" ? (
      <>
        <div
          ref={imageRef}
          id={id}
          className={className}
          style={dynamicStyle}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
        >
          {ImageContent}
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
          keepRatio={keepRatio}
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
        {ImageContent}
      </div>
    );
  }
);

export const Image = memo(Component);

export const CreateImage = (props: Partial<IImageProps> = {}) => {
  const defaultProps: Omit<IImageProps, "type" | "id"> = {
    mode: "edit",
    src: "https://via.placeholder.com/300x200",
    opacity: 1,
    borderRadius: 0,
    border: false,
    borderWidth: 0,
    borderColor: "#000000",
    borderStyle: "solid",
    keepRatio: true,
    x: 100,
    y: 100,
    width: 300,
    height: 200,
    rotate: 0,
    zIndex: 0,
    brightness: 1,
    contrast: 1,
    saturate: 1,
    grayscale: 0,
    hueRotate: 0,
    invert: 0,
    sepia: 0,
    shadow: false,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowColor: "#000000",
    shadowBlur: 0,
    shadowSpread: 0,
  };
  return {
    ...defaultProps,
    ...props,
    id: `image_${getRandomId()}`,
    type: "image" as const,
  };
};

export const Name = "图片";
export const ImagePanelIcon = Pic;
