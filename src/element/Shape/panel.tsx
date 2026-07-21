import { PanelBorderSetting } from "@/components/PanelBorderSetting";
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
import { Redo, Undo } from "@icon-park/react";
import { useDebounceFn } from "ahooks";
import { ColorPicker, Tooltip } from "antd";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import type { IShapeProps } from "./index";
import { SHAPE_TYPES, type ShapeType } from "./shapes";

export const ShapePanelKey = "shape";
export const ShapePanelTitle = "elements.shape.panel";

const ShapePanelComponent: FC = () => {
  const { t } = useTranslation();

  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const pages = usePPTStore((state) => state.pages);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  const shapeInfo = useMemo<IShapeProps | null>(() => {
    if (!pageId || !elementId) return null;
    const page = pages.find((p) => p.id === pageId);
    if (!page) return null;
    const element = page.elements.find((el) => el.id === elementId);
    if (!element || element.type !== "shape") return null;
    return element as IShapeProps;
  }, [pageId, elementId, pages]);

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

  const handleChange = (key: keyof IShapeProps, value: unknown) => {
    if (!pageId || !elementId || !shapeInfo) return;
    setElementInfo(pageId, elementId, {
      ...shapeInfo,
      [key]: value,
    });
  };

  const { run: debouncedFillChange } = useDebounceFn(
    (color: string) => {
      handleChange("fill", color);
    },
    { wait: 100 }
  );

  const { run: debouncedBorderColorChange } = useDebounceFn(
    (color: string) => {
      handleChange("borderColor", color);
    },
    { wait: 100 }
  );

  const handleRotate = (degree: number) => {
    if (!pageId || !elementId || !shapeInfo) return;
    const newRotate = (shapeInfo.rotate + degree) % 360;
    setElementInfo(pageId, elementId, {
      ...shapeInfo,
      rotate: newRotate,
    });
  };

  const shapeOptions = useMemo(
    () =>
      SHAPE_TYPES.map((type) => ({
        label: t(`elements.shape.types.${type}`),
        value: type,
      })),
    [t]
  );

  if (!pageId || !elementId || !shapeInfo) return null;

  return (
    <div className="h-[53px] inline-flex items-center gap-[10px] px-[50px] min-w-fit my-[7px]">
      <div className="flex flex-col h-full gap-[5px]">
        <Tooltip title={t("elements.shape.shapeType")}>
          <PanelSelect
            size="small"
            value={shapeInfo.shapeType}
            style={{ width: 110 }}
            options={shapeOptions}
            onChange={(value) => handleChange("shapeType", value as ShapeType)}
          />
        </Tooltip>
        <div className="h-[24px] flex items-center gap-[6px]">
          <span className="text-[12px] whitespace-nowrap">
            {t("elements.shape.fill")}：
          </span>
          <ColorPicker
            value={shapeInfo.fill || "#5B8FF9"}
            onChange={(value) => debouncedFillChange(value.toHexString())}
            size="small"
            trigger="hover"
          />
        </div>
      </div>
      <PanelSplitLine />
      <PanelBorderSetting
        border={shapeInfo.border || false}
        borderWidth={shapeInfo.borderWidth ?? 2}
        borderStyle={shapeInfo.borderStyle || "solid"}
        borderColor={shapeInfo.borderColor || "#000000"}
        onBorderChange={(value) => handleChange("border", value)}
        onBorderWidthChange={(value) =>
          handleChange("borderWidth", value ?? 2)
        }
        onBorderStyleChange={(value) =>
          handleChange(
            "borderStyle",
            value as IShapeProps["borderStyle"]
          )
        }
        onBorderColorChange={debouncedBorderColorChange}
      />
      <PanelSplitLine />
      <div className="h-full flex gap-[5px]">
        <PanelLargeButton
          title={t("elements.shape.actions.rotateLeft")}
          icon={<Undo theme="outline" size="20" fill="var(--icon-color)" />}
          onClick={() => handleRotate(-90)}
        />
        <PanelLargeButton
          title={t("elements.shape.actions.rotateRight")}
          icon={<Redo theme="outline" size="20" fill="var(--icon-color)" />}
          onClick={() => handleRotate(90)}
        />
      </div>
      <PanelSplitLine />
      <PanelCommonSetting
        onPositionChange={(key) => positionHandle(key as Position)}
        onZIndexChange={onZIndexChange}
      />
    </div>
  );
};

export const ShapePanel = ShapePanelComponent;
