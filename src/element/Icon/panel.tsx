import { PanelCommonSetting } from "@/components/PanelCommonSetting";
import { PanelLargeButton } from "@/components/PanelLargeButton";
import { PanelSelect } from "@/components/PanelSelect";
import { PanelSplitLine } from "@/components/PanelSplitLine";
import { usePositionElement, type Position } from "@/hooks/usePositionElement";
import { useZIndexElement } from "@/hooks/useZIndexElement";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { Redo, Switch, Undo } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { ColorPicker, InputNumber, Tooltip } from "antd";
import { useEffect, useMemo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { IconPicker } from "./IconPicker";
import type { IIconProps } from "./index";

export const IconPanelKey = "icon";
export const IconPanelTitle = "elements.icon.panel";

const IconPanelComponent: FC = () => {
  const { t } = useTranslation();

  // 使用本地状态存储需要即时响应的属性
  const [strokeWidth, setStrokeWidth] = useState<number | null>(null);

  // 使用 Zustand hooks 订阅状态变化
  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const pages = usePPTStore((state) => state.pages);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  // 使用 useMemo 依赖 pages 来响应元素更新
  const iconInfo = useMemo<IIconProps | null>(() => {
    if (!pageId || !elementId) return null;
    const page = pages.find((p) => p.id === pageId);
    if (!page) return null;
    const element = page.elements.find((el) => el.id === elementId);
    return (element as IIconProps) || null;
  }, [pageId, elementId, pages]);

  // 确保 hooks 总是被调用，避免 hooks 数量不一致的错误
  const { positionHandle } = usePositionElement(pageId || "", elementId || "");
  const { toFrontHandle, sendForwardHandle, sendBackwardHandle, toBackHandle } =
    useZIndexElement(pageId || "", elementId || "");

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

  // 防抖更新 Zustand store
  const debouncedUpdateStore = useDebounceFn(
    (key: keyof IIconProps, value: any) => {
      if (!pageId || !elementId || !iconInfo) return;
      setElementInfo(pageId, elementId, {
        ...iconInfo,
        [key]: value,
      });
    },
    { wait: 300 }
  );

  const handleChange = (key: keyof IIconProps, value: any) => {
    if (!pageId || !elementId || !iconInfo) return;
    setElementInfo(pageId, elementId, {
      ...iconInfo,
      [key]: value,
    });
  };

  // 处理 strokeWidth 变化：立即更新本地状态，防抖更新 store
  const handleStrokeWidthChange = useMemoizedFn((value: number | null) => {
    setStrokeWidth(value);
    if (value !== null) {
      debouncedUpdateStore.run("strokeWidth", value);
    }
  });

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
    if (!pageId || !elementId || !iconInfo) return;
    const newRotate = (iconInfo.rotate + degree) % 360;
    setElementInfo(pageId, elementId, {
      ...iconInfo,
      rotate: newRotate,
    });
  };

  // 图标选择处理
  const handleIconSelect = useMemoizedFn((iconName: string) => {
    if (!pageId || !elementId) return;
    handleChange("iconName", iconName);
  });

  // 当 iconInfo 变化时，同步更新本地状态
  useEffect(() => {
    if (iconInfo) {
      setStrokeWidth(iconInfo.strokeWidth ?? null);
    } else {
      setStrokeWidth(null);
    }
  }, [iconInfo]);

  if (!pageId || !elementId || !iconInfo) return null;

  return (
    <div className="h-[53px] inline-flex items-center gap-[10px] px-[50px] min-w-fit my-[7px]">
      <div className="flex flex-col h-full gap-[5px]">
        <Tooltip title={t("elements.icon.style")}>
          <PanelSelect
            size="small"
            value={iconInfo.theme}
            style={{ width: 80 }}
            options={[
              { label: t("elements.icon.themes.outline"), value: "outline" },
              { label: t("elements.icon.themes.filled"), value: "filled" },
              { label: t("elements.icon.themes.twoTone"), value: "two-tone" },
              {
                label: t("elements.icon.themes.multiColor"),
                value: "multi-color",
              },
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
              setElementInfo(pageId, elementId, {
                ...iconInfo,
                theme: value,
                fill: newFill,
              });
            }}
          />
        </Tooltip>

        <Tooltip title={t("elements.icon.strokeWidth")} placement="bottom">
          <InputNumber
            value={strokeWidth}
            onChange={handleStrokeWidthChange}
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
          <span className="text-[12px]">
            {t("elements.icon.colors.outerStroke")}：
          </span>
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
          <span className="text-[12px]">
            {t("elements.icon.colors.outerFill")}：
          </span>
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
          <span className="text-[12px]">
            {t("elements.icon.colors.innerStroke")}：
          </span>
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
          <span className="text-[12px]">
            {t("elements.icon.colors.innerFill")}：
          </span>
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
          title={t("elements.icon.actions.rotateLeft")}
          icon={<Undo theme="outline" size="20" fill="#333" />}
          onClick={() => handleRotate(-90)}
        />
        <PanelLargeButton
          title={t("elements.icon.actions.rotateRight")}
          icon={<Redo theme="outline" size="20" fill="#333" />}
          onClick={() => handleRotate(90)}
        />
        <IconPicker onIconSelect={handleIconSelect}>
          <PanelLargeButton
            title={t("elements.icon.actions.switch")}
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
};

export const IconPanel = IconPanelComponent;
