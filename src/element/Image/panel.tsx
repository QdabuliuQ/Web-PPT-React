import { PanelCommonSetting } from "@/components/PanelCommonSetting";
import { PanelSelect } from "@/components/PanelSelect";
import { PanelSplitLine } from "@/components/PanelSplitLine";
import { usePositionElement, type Position } from "@/hooks/usePositionElement";
import { useZIndexElement } from "@/hooks/useZIndexElement";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { ColorPicker, InputNumber, Slider, Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { type FC } from "react";
import type { IImageProps } from "./index";

export const ImagePanelKey = "image";
export const ImagePanelTitle = "图片";

const ImagePanelComponent: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

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

  const onZIndexChange = (key: string) => {
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
  };

  const handleChange = (key: keyof IImageProps, value: any) => {
    if (!pageId || !elementId) return;
    pptStore.setElementInfo(pageId, elementId, {
      ...imageInfo,
      [key]: value,
    });
  };

  return (
    <div className="h-[53px] inline-flex items-center gap-[10px] px-[50px] min-w-fit my-[7px]">
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[12px] whitespace-nowrap">透明度:</span>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={imageInfo.opacity}
            onChange={(value) => handleChange("opacity", value)}
            style={{ width: 100 }}
          />
          <InputNumber
            min={0}
            max={1}
            step={0.01}
            value={imageInfo.opacity}
            onChange={(value) => {
              if (value !== null) {
                handleChange("opacity", value);
              }
            }}
            size="small"
            style={{ width: 60 }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] whitespace-nowrap">圆角:</span>
          <Tooltip title="圆角大小" placement="bottom">
            <InputNumber
              value={imageInfo.borderRadius}
              onChange={(value) => {
                if (value !== null) {
                  handleChange("borderRadius", value);
                }
              }}
              min={0}
              max={50}
              size="small"
              style={{ width: 80 }}
            />
          </Tooltip>
        </div>
      </div>

      <PanelSplitLine />

      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[12px] whitespace-nowrap">边框宽度:</span>
          <Tooltip title="边框宽度" placement="bottom">
            <InputNumber
              value={imageInfo.borderWidth}
              onChange={(value) => {
                if (value !== null) {
                  handleChange("borderWidth", value);
                }
              }}
              min={0}
              max={20}
              size="small"
              style={{ width: 80 }}
            />
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] whitespace-nowrap">边框样式:</span>
          <PanelSelect
            size="small"
            value={imageInfo.borderStyle}
            style={{ width: 80 }}
            options={[
              { label: "实线", value: "solid" },
              { label: "虚线", value: "dashed" },
              { label: "点线", value: "dotted" },
            ]}
            onChange={(value) => handleChange("borderStyle", value)}
          />
        </div>
      </div>

      <PanelSplitLine />

      <div className="flex items-center gap-2">
        <span className="text-[12px] whitespace-nowrap">边框颜色:</span>
        <ColorPicker
          value={imageInfo.borderColor}
          onChange={(value) => handleChange("borderColor", value.toHexString())}
          size="small"
          trigger="hover"
        />
      </div>

      <PanelSplitLine />

      <PanelCommonSetting
        onPositionChange={(key) => positionHandle(key as Position)}
        onZIndexChange={onZIndexChange}
      />
    </div>
  );
});

export const ImagePanel = ImagePanelComponent;
