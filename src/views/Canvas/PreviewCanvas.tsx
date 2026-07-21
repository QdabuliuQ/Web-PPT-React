import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/constants/canvas";
import { textureItems } from "@/views/Menu/components/Start/texture";
import type { Page } from "@/store/ppt";
import { ElementRenderer } from "@/utils/elementRenderer";
import { type CSSProperties, type FC, useMemo } from "react";

function getBackgroundStyle(page: Page): CSSProperties {
  const backgroundType = page.backgroundType || "solidColor";
  const background = page.background || "#fff";
  const bgColor = page.bgColor || "#9C92AC";
  const fgColor = page.fgColor || "#9C92AC";
  const bgOpacity = page.bgOpacity ?? 0.4;
  const selectedTexture = (page as Page & { selectedTexture?: string })
    .selectedTexture;
  const backgroundImage = (page as Page & { backgroundImage?: string })
    .backgroundImage;

  if (backgroundType === "solidColor") {
    return {
      backgroundColor: background,
      backgroundImage: "none",
    };
  }

  if (backgroundType === "image" && backgroundImage) {
    return {
      backgroundColor: "#ffffff",
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }

  if (backgroundType === "texture" && selectedTexture) {
    const textureItem = textureItems.find(
      (item) => item.type === selectedTexture
    );
    let textureBackgroundImage = textureItem?.style.backgroundImage || "";

    if (textureBackgroundImage) {
      const encodedFgColor = fgColor.replace("#", "%23");
      textureBackgroundImage = textureBackgroundImage.replace(
        /fill='%23[0-9A-Fa-f]{6}'/g,
        `fill='${encodedFgColor}'`
      );
      textureBackgroundImage = textureBackgroundImage.replace(
        /fill-opacity='[^']*'/g,
        `fill-opacity='${bgOpacity}'`
      );
    }

    return {
      backgroundColor: bgColor,
      backgroundImage: textureBackgroundImage,
    };
  }

  return {
    backgroundColor: "#fff",
    backgroundImage: "none",
  };
}

export interface PreviewCanvasProps {
  page: Page;
  previewZoom?: number;
}

/**
 * 轻量预览画布：无标尺/选中/备注/全屏等编辑态逻辑，仅渲染背景与元素。
 * 供侧栏缩略图生成、Grid 预览、exportPageAsImage 等场景使用。
 */
export const PreviewCanvas: FC<PreviewCanvasProps> = ({
  page,
  previewZoom,
}) => {
  const backgroundStyle = useMemo(() => getBackgroundStyle(page), [page]);

  return (
    <div
      className="w-full h-full relative pointer-events-none"
      style={previewZoom !== undefined ? { zoom: previewZoom } : undefined}
    >
      <div
        id={`preview-canvas-container-${page.id}`}
        className="absolute overflow-hidden"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          left: "50%",
          top: "50%",
          marginLeft: -CANVAS_WIDTH / 2,
          marginTop: -CANVAS_HEIGHT / 2,
          transform: "scale(1)",
          transformOrigin: "center center",
          ...backgroundStyle,
        }}
      >
        <ElementRenderer elements={page.elements} mode="preview" />
      </div>
    </div>
  );
};
