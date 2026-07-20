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
import { useTranslation } from "react-i18next";
import type { IImageProps } from "./index";
import { downloadImageFile } from "./utils";

export const ImagePanelKey = "image";
export const ImagePanelTitle = "elements.image.title";

const getFilterProperty = (t: (key: string) => string) => [
  {
    type: "brightness" as keyof IImageProps,
    name: t("elements.image.panel.filters.brightness"),
    tip: t("elements.image.panel.filters.brightnessTip"),
    min: 0,
    max: 2,
    step: 0.1,
  },
  {
    type: "contrast" as keyof IImageProps,
    name: t("elements.image.panel.filters.contrast"),
    tip: t("elements.image.panel.filters.contrastTip"),
    min: 0,
    max: 2,
    step: 0.1,
  },
  {
    type: "saturate" as keyof IImageProps,
    name: t("elements.image.panel.filters.saturate"),
    tip: t("elements.image.panel.filters.saturateTip"),
    min: 0,
    max: 2,
    step: 0.1,
  },
  {
    type: "grayscale" as keyof IImageProps,
    name: t("elements.image.panel.filters.grayscale"),
    tip: t("elements.image.panel.filters.grayscaleTip"),
    min: 0,
    max: 1,
    step: 0.1,
  },
  {
    type: "hueRotate" as keyof IImageProps,
    name: t("elements.image.panel.filters.hueRotate"),
    tip: t("elements.image.panel.filters.hueRotateTip"),
    min: 0,
    max: 360,
    step: 1,
  },
  {
    type: "invert" as keyof IImageProps,
    name: t("elements.image.panel.filters.invert"),
    tip: t("elements.image.panel.filters.invertTip"),
    min: 0,
    max: 1,
    step: 0.1,
  },
  {
    type: "sepia" as keyof IImageProps,
    name: t("elements.image.panel.filters.sepia"),
    tip: t("elements.image.panel.filters.sepiaTip"),
    min: 0,
    max: 1,
    step: 0.1,
  },
];

const ImagePanelComponent: FC = () => {
  const { t } = useTranslation();
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

  const filterProperty = useMemo(
    () => getFilterProperty((k) => (t as (key: string) => string)(k)),
    [t]
  );

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
    [handleChange, imageInfo, localState, filterProperty]
  );

  if (!pageId || !elementId || !imageInfo) return null;

  return (
    <div className="h-[53px] inline-flex items-center gap-[10px] px-[50px] min-w-fit my-[7px]">
      <div className="h-full flex flex-col justify-around mr-[6px]">
        <div className="flex items-center gap-[5px]">
          <span className="text-[12px] text-gray-500 w-[40px]">{t("elements.image.panel.opacity")}</span>
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
          <span className="text-[12px] text-gray-500 w-[40px]">{t("elements.image.panel.borderRadius")}</span>
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
        title={t("elements.image.panel.keepRatio")}
        icon={<Scale theme="outline" size="18" fill="var(--icon-color)" />}
        onClick={() => handleChange("keepRatio", !imageInfo.keepRatio)}
        active={imageInfo.keepRatio}
      />
      <Popover placement="bottom" trigger="hover" content={content}>
        <div className="h-full aspect-auto">
          <PanelLargeButton
            title={t("elements.image.panel.colorFilter")}
            icon={<ColorFilter theme="outline" size="18" fill="var(--icon-color)" />}
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
        title={loading ? t("elements.image.panel.downloading") : t("elements.image.panel.downloadImage")}
        icon={
          loading ? (
            <LoadingOutlined spin />
          ) : (
            <Download theme="outline" size="18" fill="var(--icon-color)" />
          )
        }
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
