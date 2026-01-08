import {
  PanelBorderSetting,
  PanelLargeButton,
  PanelShadowSetting,
} from "@/components";
import { PanelCommonSetting } from "@/components/PanelCommonSetting";
import { PanelSplitLine } from "@/components/PanelSplitLine";
import { usePositionElement, type Position } from "@/hooks/usePositionElement";
import { useZIndexElement } from "@/hooks/useZIndexElement";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { LoadingOutlined } from "@ant-design/icons";
import { ColorFilter, Download, Help, Scale } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { Popover, Slider, Tooltip } from "antd";
import { useEffect, useMemo, useState, type FC } from "react";
import type { IImageProps } from "./index";
import { downloadImageFile } from "./utils";

export const ImagePanelKey = "image";
export const ImagePanelTitle = "图片";

const filterProperty = [
  {
    type: "brightness" as keyof IImageProps,
    name: "亮度",
    tip: "调整图片的整体亮度",
    min: 0,
    max: 2,
    step: 0.1,
  },
  {
    type: "contrast" as keyof IImageProps,
    name: "对比度",
    tip: "调整图片的明暗对比",
    min: 0,
    max: 2,
    step: 0.1,
  },
  {
    type: "saturate" as keyof IImageProps,
    name: "饱和度",
    tip: "调整颜色的鲜艳程度",
    min: 0,
    max: 2,
    step: 0.1,
  },
  {
    type: "grayscale" as keyof IImageProps,
    name: "灰度",
    tip: "将图片转换为灰度（黑白）",
    min: 0,
    max: 1,
    step: 0.1,
  },
  {
    type: "hueRotate" as keyof IImageProps,
    name: "色相",
    tip: "旋转色相环，改变整体色调",
    min: 0,
    max: 360,
    step: 1,
  },
  {
    type: "invert" as keyof IImageProps,
    name: "反色",
    tip: "反转所有颜色",
    min: 0,
    max: 1,
    step: 0.1,
  },
  {
    type: "sepia" as keyof IImageProps,
    name: "怀旧",
    tip: "应用棕褐色调，营造老照片效果",
    min: 0,
    max: 1,
    step: 0.1,
  },
];

const ImagePanelComponent: FC = () => {
  // 使用本地状态存储需要即时响应的属性
  const [localState, setLocalState] = useState<Partial<IImageProps>>({});

  // 使用 Zustand hooks 订阅状态变化
  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const pages = usePPTStore((state) => state.pages);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  // 使用 useMemo 依赖 pages 来响应元素更新
  const imageInfo = useMemo<IImageProps | null>(() => {
    if (!pageId || !elementId) return null;
    const page = pages.find((p) => p.id === pageId);
    if (!page) return null;
    const element = page.elements.find((el) => el.id === elementId);
    return (element as IImageProps) || null;
  }, [pageId, elementId, pages]);

  // 位置调整
  const { positionHandle } = usePositionElement(pageId || "", elementId || "");
  // z-index调整
  const { toFrontHandle, sendForwardHandle, sendBackwardHandle, toBackHandle } =
    useZIndexElement(pageId || "", elementId || "");

  const onZIndexChange = useMemoizedFn((key: string) => {
    switch (key) {
      case "toFront":
        toFrontHandle();
        break;
      case "sendForward":
        sendForwardHandle();
        break;
      case "sendBackward":
        sendBackwardHandle();
        break;
      case "toBack":
        toBackHandle();
        break;
    }
  });

  // 防抖更新 Zustand store
  const debouncedUpdateStore = useDebounceFn(
    (key: keyof IImageProps, value: any) => {
      if (!pageId || !elementId || !imageInfo) return;
      setElementInfo(pageId, elementId, {
        ...imageInfo,
        [key]: value,
      });
    },
    { wait: 300 }
  );

  const handleChange = useMemoizedFn((key: keyof IImageProps, value: any) => {
    // 立即更新本地状态
    setLocalState((prev) => ({ ...prev, [key]: value }));
    // 防抖更新 store
    debouncedUpdateStore.run(key, value);
  });

  const [loading, setLoading] = useState(false);
  const handleDownloadImage = useMemoizedFn(async () => {
    if (!imageInfo?.src || !elementId) return;
    setLoading(true);
    await downloadImageFile(imageInfo.src, elementId);
    setLoading(false);
  });

  // 当 imageInfo 变化时，同步更新本地状态
  useEffect(() => {
    if (imageInfo) {
      setLocalState({
        opacity: imageInfo.opacity,
        borderRadius: imageInfo.borderRadius,
        brightness: imageInfo.brightness,
        contrast: imageInfo.contrast,
        saturate: imageInfo.saturate,
        grayscale: imageInfo.grayscale,
        hueRotate: imageInfo.hueRotate,
        invert: imageInfo.invert,
        sepia: imageInfo.sepia,
        borderWidth: imageInfo.borderWidth,
        shadowOffsetX: imageInfo.shadowOffsetX,
        shadowOffsetY: imageInfo.shadowOffsetY,
        shadowBlur: imageInfo.shadowBlur,
        shadowSpread: imageInfo.shadowSpread,
      });
    } else {
      setLocalState({});
    }
  }, [imageInfo]);

  const content = useMemo(
    () => (
      <div className="w-[200px]">
        <div className="flex flex-col gap-[5px]">
          {filterProperty.map((item) => (
            <div key={item.type} className="flex items-center gap-[5px]">
              <div className="flex items-center gap-[2px] w-[55px] flex-shrink-0">
                <span className="text-[12px] text-gray-500 mr-[3px]">
                  {item.name}
                </span>
                <Tooltip title={item.tip} placement="top">
                  <Help
                    theme="outline"
                    size="12"
                    fill="#999"
                    className="cursor-help"
                  />
                </Tooltip>
              </div>
              <Slider
                value={
                  (localState[item.type] ??
                    imageInfo?.[item.type] ??
                    0) as number
                }
                style={{ flex: 1 }}
                onChange={(value) => handleChange(item.type, value)}
                min={item.min}
                max={item.max}
                step={item.step}
                tooltip={{ open: false }}
              />
            </div>
          ))}
        </div>
      </div>
    ),
    [handleChange, imageInfo, localState]
  );

  if (!pageId || !elementId || !imageInfo) return null;

  return (
    <div className="h-[53px] inline-flex items-center gap-[10px] px-[50px] min-w-fit my-[7px]">
      <div className="h-full flex flex-col justify-around mr-[6px]">
        <div className="flex items-center gap-[5px]">
          <span className="text-[12px] text-gray-500 w-[40px]">透明度</span>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={localState.opacity ?? imageInfo.opacity}
            onChange={(value) => handleChange("opacity", value)}
            style={{ width: 90, margin: 0 }}
          />
        </div>
        <div className="flex items-center gap-[5px]">
          <span className="text-[12px] text-gray-500 w-[40px]">圆角</span>
          <Slider
            min={0}
            max={200}
            step={1}
            value={localState.borderRadius ?? imageInfo.borderRadius}
            onChange={(value) => handleChange("borderRadius", value)}
            style={{ width: 90, margin: 0 }}
          />
        </div>
      </div>
      <PanelLargeButton
        title="等比例"
        icon={<Scale theme="outline" size="18" fill="#333" />}
        onClick={() => handleChange("keepRatio", !imageInfo.keepRatio)}
        active={imageInfo.keepRatio}
      />
      <Popover placement="bottom" trigger="hover" content={content}>
        <div className="h-full aspect-auto">
          <PanelLargeButton
            title="色彩"
            icon={<ColorFilter theme="outline" size="18" fill="#333" />}
          />
        </div>
      </Popover>
      <PanelSplitLine />
      <PanelBorderSetting
        border={imageInfo.border}
        borderWidth={localState.borderWidth ?? imageInfo.borderWidth}
        borderStyle={imageInfo.borderStyle}
        borderColor={imageInfo.borderColor}
        onBorderChange={(value) => handleChange("border", value)}
        onBorderWidthChange={(value) => handleChange("borderWidth", value)}
        onBorderStyleChange={(value) => handleChange("borderStyle", value)}
        onBorderColorChange={(value) => handleChange("borderColor", value)}
      />
      <PanelSplitLine />
      <PanelShadowSetting
        shadow={imageInfo.shadow}
        shadowOffsetX={localState.shadowOffsetX ?? imageInfo.shadowOffsetX}
        shadowOffsetY={localState.shadowOffsetY ?? imageInfo.shadowOffsetY}
        shadowColor={imageInfo.shadowColor}
        shadowBlur={localState.shadowBlur ?? imageInfo.shadowBlur}
        shadowSpread={localState.shadowSpread ?? imageInfo.shadowSpread}
        onShadowChange={(value) => handleChange("shadow", value)}
        onShadowOffsetXChange={(value) => handleChange("shadowOffsetX", value)}
        onShadowOffsetYChange={(value) => handleChange("shadowOffsetY", value)}
        onShadowColorChange={(value) => handleChange("shadowColor", value)}
        onShadowBlurChange={(value) => handleChange("shadowBlur", value)}
        onShadowSpreadChange={(value) => handleChange("shadowSpread", value)}
      />
      <PanelLargeButton
        title={loading ? "下载中" : "下载图片"}
        icon={
          loading ? (
            <LoadingOutlined spin />
          ) : (
            <Download theme="outline" size="18" fill="#333" />
          )
        }
        aspectRatio={false}
        onClick={() => handleDownloadImage()}
        disabled={loading}
      />
      <PanelSplitLine />
      <PanelCommonSetting
        onPositionChange={(key) => positionHandle(key as Position)}
        onZIndexChange={onZIndexChange}
      />
    </div>
  );
};

export const ImagePanel = ImagePanelComponent;
