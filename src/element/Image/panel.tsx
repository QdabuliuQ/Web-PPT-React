import {
  PanelBorderSetting,
  PanelLargeButton,
  PanelShadowSetting,
} from "@/components";
import { PanelCommonSetting } from "@/components/PanelCommonSetting";
import { PanelSplitLine } from "@/components/PanelSplitLine";
import { usePositionElement, type Position } from "@/hooks/usePositionElement";
import { useZIndexElement } from "@/hooks/useZIndexElement";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { ColorFilter, Help, Scale } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Popover, Slider, Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import type { IImageProps } from "./index";

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

const ImagePanelComponent: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive() as string;
  const pageId = pageActiveStore.getPageActive() as string;

  if (!pageId || !elementId) return null;

  const imageInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IImageProps | null;

  if (!imageInfo) return null;

  // 位置调整
  const { positionHandle } = usePositionElement(pageId, elementId);
  // z-index调整
  const { toFrontHandle, sendForwardHandle, sendBackwardHandle, toBackHandle } =
    useZIndexElement(pageId, elementId);

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

  const handleChange = useMemoizedFn((key: keyof IImageProps, value: any) => {
    if (!pageId || !elementId) return;
    pptStore.setElementInfo(pageId, elementId, {
      ...imageInfo,
      [key]: value,
    });
  });

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
                value={imageInfo[item.type] as number}
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
    [handleChange, imageInfo]
  );

  return (
    <div className="h-[53px] inline-flex items-center gap-[10px] px-[50px] min-w-fit my-[7px]">
      <div className="h-full flex flex-col justify-around mr-[6px]">
        <div className="flex items-center gap-[5px]">
          <span className="text-[12px] text-gray-500 w-[40px]">透明度</span>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={imageInfo.opacity}
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
            value={imageInfo.borderRadius}
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
        borderWidth={imageInfo.borderWidth}
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
        shadowOffsetX={imageInfo.shadowOffsetX}
        shadowOffsetY={imageInfo.shadowOffsetY}
        shadowColor={imageInfo.shadowColor}
        shadowBlur={imageInfo.shadowBlur}
        shadowSpread={imageInfo.shadowSpread}
        onShadowChange={(value) => handleChange("shadow", value)}
        onShadowOffsetXChange={(value) => handleChange("shadowOffsetX", value)}
        onShadowOffsetYChange={(value) => handleChange("shadowOffsetY", value)}
        onShadowColorChange={(value) => handleChange("shadowColor", value)}
        onShadowBlurChange={(value) => handleChange("shadowBlur", value)}
        onShadowSpreadChange={(value) => handleChange("shadowSpread", value)}
      />
      <PanelSplitLine />
      <PanelCommonSetting
        onPositionChange={(key) => positionHandle(key as Position)}
        onZIndexChange={onZIndexChange}
      />
    </div>
  );
});

export const ImagePanel = ImagePanelComponent;
