import {
  ColorPanel,
  PanelBorderSetting,
  PanelLargeButton,
  PanelPreview,
  PanelSelect,
  PanelShadowSetting,
  PanelSplitLine,
} from "@/components";
import { PanelCommonSetting } from "@/components/PanelCommonSetting";
import { PanelDropdownButton } from "@/components/PanelDropdownButton";
import { PanelPlacementButton } from "@/components/PanelPlacementButton";
import { usePositionElement, type Position } from "@/hooks/usePositionElement";
import { useZIndexElement } from "@/hooks/useZIndexElement";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import {
  Add,
  AutoHeightOne,
  BackgroundColor,
  ColorCard,
  Reduce,
  Strikethrough,
  TextBold,
  TextItalic,
  TextStyle,
  TextUnderline,
} from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Button, ColorPicker, Popover, Slider, Tooltip } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useRef, useState, type FC } from "react";
import type { ITextProps } from ".";
import { FontSize } from "./constant";
import styles from "./panel.module.less";
interface ITextPanelProps {
  title?: string;
}

export const TextPanel: FC<ITextPanelProps> = observer(() => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [backgroundColorPickerOpen, setBackgroundColorPickerOpen] =
    useState(false);

  // 直接从store获取当前元素，observer会自动响应变化
  const activeElementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  // 简化实现：直接获取元素，不使用useMemo
  let currentElement: ITextProps | null = null;
  if (activeElementId && pageId) {
    const element = pptStore.getElementInfo(pageId, activeElementId);
    if (element && element.type === "text") {
      currentElement = element as ITextProps;
    }
  }

  const propertyChangeHandle = useMemoizedFn(
    (key: keyof ITextProps, value: any) => {
      if (!currentElement) return;
      if (key === "fontSize" && value <= 1) {
        return;
      }
      if (key === "lineHeight" && value < 1) {
        return;
      }
      // 直接更新store中的元素信息
      const updatedElement = {
        ...currentElement,
        type: "text",
        [key]: value,
      } as ITextProps;
      pptStore.setElementInfo(
        pageActiveStore.getPageActive() as string,
        currentElement.id,
        updatedElement
      );
    }
  );

  // 通用防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 通用防抖颜色变更函数
  const debouncedColorChange = useCallback(
    (property: keyof ITextProps) => (color: string, color2?: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      let currentColor = color;
      if (property === "shadowColor" || property === "borderColor") {
        currentColor = color2 as string;
      }
      debounceTimerRef.current = setTimeout(() => {
        propertyChangeHandle(property, currentColor);
      }, 300);
    },
    [propertyChangeHandle]
  );

  const largeButtons = useMemo(() => {
    return [
      {
        title: "加粗",
        key: "bold",
        icon: <TextBold theme="outline" size="18" fill="#333" />,
      },
      {
        title: "斜体",
        key: "italic",
        icon: <TextItalic theme="outline" size="18" fill="#333" />,
      },
      {
        title: "下划线",
        key: "underline",
        icon: <TextUnderline theme="outline" size="18" fill="#333" />,
      },
      {
        title: "删除线",
        key: "strikethrough",
        icon: <Strikethrough theme="outline" size="18" fill="#333" />,
      },
    ];
  }, []);

  const handlePreviewSelect = useMemoizedFn((item: Partial<ITextProps>) => {
    if (!currentElement) return;
    const updatedElement = { ...currentElement, ...item } as ITextProps;
    pptStore.setElementInfo(
      pageActiveStore.getPageActive() as string,
      currentElement.id,
      updatedElement
    );
  });

  const { toFrontHandle, sendForwardHandle, sendBackwardHandle, toBackHandle } =
    useZIndexElement(
      pageActiveStore.getPageActive() as string,
      activeElementId as string
    );
  const { positionHandle } = usePositionElement(
    pageActiveStore.getPageActive() as string,
    activeElementId as string
  );
  const onZIndexChange = useMemoizedFn((key: string) => {
    if (key === "toFront") {
      toFrontHandle();
    } else if (key === "sendForward") {
      sendForwardHandle();
    } else if (key === "sendBackward") {
      sendBackwardHandle();
    } else if (key === "toBack") {
      toBackHandle();
    }
  });

  return (
    <div className="h-[53px] inline-flex items-center gap-[10px] px-[50px] min-w-fit my-[7px]">
      <div className="h-full flex items-center gap-[5px] flex-shrink-0">
        {largeButtons.map((item) => {
          return (
            <PanelLargeButton
              key={item.key}
              title={item.title}
              active={currentElement?.[item.key as keyof ITextProps] as boolean}
              onClick={() =>
                propertyChangeHandle(
                  item.key as keyof ITextProps,
                  !currentElement?.[item.key as keyof ITextProps] as boolean
                )
              }
              icon={item.icon}
            />
          );
        })}
      </div>
      <PanelSplitLine />
      <div className="h-full flex flex-col justify-center gap-[3px] flex-shrink-0">
        <div className="flex gap-[5px] items-center">
          <Tooltip title="文本字体大小">
            <PanelSelect
              value={currentElement?.fontSize}
              style={{ width: 82 }}
              size="small"
              options={FontSize}
              onChange={(value) => propertyChangeHandle("fontSize", value)}
            />
          </Tooltip>
          <Tooltip title="增大字号">
            <Button
              size="small"
              type="text"
              onClick={() =>
                propertyChangeHandle("fontSize", currentElement!.fontSize + 1)
              }
              icon={<Add theme="outline" size="13" fill="#333" />}
            />
          </Tooltip>
          <Tooltip title="减小字号">
            <Button
              size="small"
              type="text"
              onClick={() =>
                propertyChangeHandle("fontSize", currentElement!.fontSize - 1)
              }
              icon={<Reduce theme="outline" size="13" fill="#333" />}
            />
          </Tooltip>
          <PanelPlacementButton
            value={currentElement?.placement}
            onSelect={(key) => propertyChangeHandle("placement", key)}
          />
        </div>
        <div className="flex gap-[5px] items-center">
          <Popover
            content={
              <ColorPanel
                value={currentElement?.color}
                onChange={debouncedColorChange("color")}
              />
            }
            trigger="hover"
            open={colorPickerOpen}
            onOpenChange={setColorPickerOpen}
            placement="bottomLeft"
          >
            <Button
              type="text"
              size="small"
              icon={
                <ColorCard
                  theme="multi-color"
                  size="12"
                  fill={["#333", "#f25f00", "#FFF", "#43CCF8"]}
                />
              }
            />
          </Popover>
          <Popover
            content={
              <ColorPanel
                value={currentElement?.backgroundColor || "#ffffff"}
                onChange={debouncedColorChange("backgroundColor")}
              />
            }
            trigger="hover"
            open={backgroundColorPickerOpen}
            onOpenChange={setBackgroundColorPickerOpen}
            placement="bottomLeft"
          >
            <Button
              type="text"
              size="small"
              icon={<BackgroundColor theme="outline" size="15" fill="#333" />}
            />
          </Popover>
          <PanelDropdownButton
            title="行高"
            value={currentElement?.lineHeight.toString()}
            icon={<AutoHeightOne theme="outline" size="14" fill="#333" />}
            onSelect={(key) => {
              propertyChangeHandle("lineHeight", parseFloat(key));
            }}
            menu={{
              items: [
                {
                  key: "1",
                  label: "1.0",
                },
                {
                  key: "1.5",
                  label: "1.5",
                },
                {
                  key: "2",
                  label: "2.0",
                },
                {
                  key: "2.5",
                  label: "2.5",
                },
              ],
            }}
          />
          <Tooltip title="增大行高" placement="bottom">
            <Button
              size="small"
              type="text"
              onClick={() =>
                propertyChangeHandle(
                  "lineHeight",
                  currentElement!.lineHeight + 0.5
                )
              }
              icon={<Add theme="outline" size="13" fill="#333" />}
            />
          </Tooltip>
          <Tooltip title="减小行高" placement="bottom">
            <Button
              size="small"
              type="text"
              onClick={() =>
                propertyChangeHandle(
                  "lineHeight",
                  currentElement!.lineHeight - 0.5
                )
              }
              icon={<Reduce theme="outline" size="13" fill="#333" />}
            />
          </Tooltip>
        </div>
      </div>
      <PanelSplitLine />
      <PanelShadowSetting
        shadow={currentElement?.shadow || false}
        shadowOffsetX={currentElement?.shadowOffsetX || 0}
        shadowOffsetY={currentElement?.shadowOffsetY || 0}
        shadowColor={currentElement?.shadowColor || "#000000"}
        shadowType="text-shadow"
        onShadowChange={(value) => propertyChangeHandle("shadow", value)}
        onShadowOffsetXChange={(value) =>
          propertyChangeHandle("shadowOffsetX", value)
        }
        onShadowOffsetYChange={(value) =>
          propertyChangeHandle("shadowOffsetY", value)
        }
        onShadowColorChange={(color) =>
          debouncedColorChange("shadowColor")(color)
        }
      />
      <PanelSplitLine />
      <PanelBorderSetting
        border={currentElement?.border || false}
        borderWidth={currentElement?.borderWidth || 0}
        borderStyle={currentElement?.borderStyle || "solid"}
        borderColor={currentElement?.borderColor || "#000000"}
        onBorderChange={(value) => propertyChangeHandle("border", value)}
        onBorderWidthChange={(value) =>
          propertyChangeHandle("borderWidth", value)
        }
        onBorderStyleChange={(value) =>
          propertyChangeHandle("borderStyle", value)
        }
        onBorderColorChange={(color) =>
          debouncedColorChange("borderColor")(color)
        }
      />
      <PanelSplitLine />
      <div className="h-full flex gap-[10px]">
        <PanelLargeButton
          active={currentElement?.stroke}
          icon={<TextStyle theme="outline" size="18" fill="#333" />}
          title="描边"
          onClick={() => {
            propertyChangeHandle("stroke", !currentElement?.stroke);
          }}
        />
        <div className="flex flex-col gap-[15px]">
          <Slider
            style={{ width: 90, margin: 0 }}
            min={0}
            max={10}
            defaultValue={currentElement?.strokeWidth}
            value={currentElement?.strokeWidth}
            onChange={(value) => {
              propertyChangeHandle("strokeWidth", value);
            }}
            disabled={!currentElement?.stroke}
          />
          <ColorPicker
            value={currentElement?.strokeColor}
            onChange={debouncedColorChange("strokeColor") as any}
            className={`${styles.colorPicker} ${styles.colorPickerRotate}`}
            size="small"
            disabled={!currentElement?.stroke}
          />
        </div>
      </div>
      <PanelSplitLine />
      <PanelPreview onSelect={handlePreviewSelect} />
      <PanelSplitLine />
      <PanelCommonSetting
        onPositionChange={(key) => positionHandle(key as Position)}
        onZIndexChange={onZIndexChange}
      />
    </div>
  );
});

export const TextPanelTitle = "文本工具";
export const TextPanelKey = "text";
