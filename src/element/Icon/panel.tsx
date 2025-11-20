import { PanelCommonSetting } from "@/components/PanelCommonSetting";
import { PanelLargeButton } from "@/components/PanelLargeButton";
import { PanelSelect } from "@/components/PanelSelect";
import { PanelSplitLine } from "@/components/PanelSplitLine";
import { usePositionElement, type Position } from "@/hooks/usePositionElement";
import { useZIndexElement } from "@/hooks/useZIndexElement";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { Redo, Switch, Undo } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { ColorPicker, InputNumber, Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { type FC } from "react";
import { IconPicker } from "./IconPicker";
import type { IIconProps } from "./index";

export const IconPanelKey = "icon";
export const IconPanelTitle = "图标";

const IconPanelComponent: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  // 确保 hooks 总是被调用，避免 hooks 数量不一致的错误
  const { positionHandle } = usePositionElement(pageId || "", elementId || "");
  const { toFrontHandle, sendForwardHandle, sendBackwardHandle, toBackHandle } =
    useZIndexElement(pageId || "", elementId || "");

  // 提前返回必须在所有 hooks 调用之后
  if (!pageId || !elementId) return null;

  const iconInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IIconProps | null;

  if (!iconInfo) return null;

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

  const handleChange = (key: keyof IIconProps, value: any) => {
    if (!pageId || !elementId) return;
    pptStore.setElementInfo(pageId, elementId, {
      ...iconInfo,
      [key]: value,
    });
  };

  // 防抖的颜色变更处理
  const { run: debouncedColorChange } = useDebounceFn(
    (index: number, color: string) => {
      if (!pageId || !elementId || !iconInfo) return;
      const newFill = [...(iconInfo.fill || [])];
      newFill[index] = color;
      handleChange("fill", newFill);
    },
    { wait: 100 }
  );

  // 旋转处理函数
  const handleRotate = (degree: number) => {
    if (!pageId || !elementId) return;
    const newRotate = (iconInfo.rotate + degree) % 360;
    pptStore.setElementInfo(pageId, elementId, {
      ...iconInfo,
      rotate: newRotate,
    });
  };

  // 图标选择处理
  const handleIconSelect = useMemoizedFn((iconName: string) => {
    if (!pageId || !elementId) return;
    handleChange("iconName", iconName);
  });

  return (
    <div className="h-[53px] inline-flex items-center gap-[10px] px-[50px] min-w-fit my-[7px]">
      <div className="flex flex-col h-full gap-[5px]">
        <Tooltip title="图标风格">
          <PanelSelect
            size="small"
            value={iconInfo.theme}
            style={{ width: 80 }}
            options={[
              { label: "线性", value: "outline" },
              { label: "填充", value: "filled" },
              { label: "双色", value: "two-tone" },
              { label: "多色", value: "multi-color" },
            ]}
            onChange={(value) => {
              let newFill: string[];
              switch (value) {
                case "outline":
                case "filled":
                  newFill = ["#333333"];
                  break;
                case "two-tone":
                  newFill = ["#333333", "#2F88FF"];
                  break;
                case "multi-color":
                  newFill = ["#333333", "#2F88FF", "#ffffff", "#43CCF8"];
                  break;
                default:
                  newFill = ["#333333"];
              }
              pptStore.setElementInfo(pageId, elementId, {
                ...iconInfo,
                theme: value,
                fill: newFill,
              });
            }}
          />
        </Tooltip>

        <Tooltip title="线段粗细" placement="bottom">
          <InputNumber
            value={iconInfo.strokeWidth}
            onChange={(value) => {
              if (value !== null) {
                handleChange("strokeWidth", value);
              }
            }}
            min={1}
            max={4}
            size="small"
            style={{ width: 80 }}
          />
        </Tooltip>
      </div>
      <PanelSplitLine />
      <div className="h-full flex flex-col justify-between">
        <div className="h-[24px] flex items-center">
          <span className="text-[12px]">外部描边颜色：</span>
          <ColorPicker
            value={iconInfo.fill?.[0] || "#333333"}
            onChange={(value) => {
              debouncedColorChange(0, value.toHexString());
            }}
            size="small"
            trigger="hover"
          />
        </div>
        <div className="h-[24px] flex items-center">
          <span className="text-[12px]">外部填充颜色：</span>
          <ColorPicker
            value={iconInfo.fill?.[1] || "#2F88FF"}
            onChange={(value) => {
              debouncedColorChange(1, value.toHexString());
            }}
            size="small"
            trigger="hover"
          />
        </div>
      </div>
      <PanelSplitLine />
      <div className="h-full flex flex-col justify-between">
        <div className="h-[24px] flex items-center">
          <span className="text-[12px]">内部描边颜色：</span>
          <ColorPicker
            value={iconInfo.fill?.[2] || "#ffffff"}
            onChange={(value) => {
              debouncedColorChange(2, value.toHexString());
            }}
            size="small"
            trigger="hover"
          />
        </div>
        <div className="h-[24px] flex items-center">
          <span className="text-[12px]">内部填充颜色：</span>
          <ColorPicker
            value={iconInfo.fill?.[3] || "#43CCF8"}
            onChange={(value) => {
              debouncedColorChange(3, value.toHexString());
            }}
            size="small"
            trigger="hover"
          />
        </div>
      </div>
      <PanelSplitLine />
      <div className="h-full flex gap-[5px]">
        <PanelLargeButton
          title="左旋转"
          icon={<Undo theme="outline" size="20" fill="#333" />}
          onClick={() => handleRotate(-90)}
        />
        <PanelLargeButton
          title="右旋转"
          icon={<Redo theme="outline" size="20" fill="#333" />}
          onClick={() => handleRotate(90)}
        />
        <IconPicker onIconSelect={handleIconSelect}>
          <PanelLargeButton
            title="切换"
            icon={<Switch theme="outline" size="20" fill="#333" />}
          />
        </IconPicker>
      </div>
      <PanelSplitLine />
      <PanelCommonSetting
        onPositionChange={(key) => positionHandle(key as Position)}
        onZIndexChange={onZIndexChange}
      />
    </div>
  );
});

export const IconPanel = IconPanelComponent;
