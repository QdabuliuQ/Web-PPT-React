import {
  ColorPanel,
  PanelLargeButton,
  PanelPreview,
  PanelSelect,
  PanelSplitLine,
} from "@/components";
import { PanelDropdownButton } from "@/components/PanelDropdownButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import {
  Add,
  AlignmentHorizontalBottom,
  AlignmentHorizontalCenter,
  AlignmentHorizontalTop,
  AlignmentLeftBottom,
  AlignmentLeftCenter,
  AlignmentLeftTop,
  AlignmentRightBottom,
  AlignmentRightCenter,
  AlignmentRightTop,
  AlignTextLeft,
  AutoHeightOne,
  BackgroundColor,
  ColorCard,
  DropShadowDown,
  Reduce,
  Square,
  Strikethrough,
  TextBold,
  TextItalic,
  TextStyle,
  TextUnderline,
} from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import {
  Button,
  ColorPicker,
  InputNumber,
  Popover,
  Slider,
  Tooltip,
} from "antd";
import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ITextProps } from ".";
import { Border } from "./constant";
import styles from "./panel.module.less";
interface ITextPanelProps {
  title: string;
}

const fontSize = Array.from({ length: (50 - 12) / 2 + 1 }, (_, i) => {
  const size = 12 + i * 2;
  return { label: size, value: size };
});
export const TextPanel: FC<ITextPanelProps> = () => {
  const [currentElement, setCurrentElement] = useState(
    pptStore.getElementInfo(
      pageActiveStore.getPageActive() as string,
      elementActiveStore.getElementActive() as string
    )
  );

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [backgroundColorPickerOpen, setBackgroundColorPickerOpen] =
    useState(false);

  useEffect(() => {
    pptStore.setElementInfo(
      pageActiveStore.getPageActive() as string,
      currentElement?.id as string,
      currentElement as ITextProps
    );
  }, [currentElement]);

  const propertyChangeHandle = useMemoizedFn(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (key: keyof ITextProps, value: any) => {
      if (!currentElement) return;
      if (key === "fontSize" && value <= 1) {
        return;
      }
      if (key === "lineHeight" && value < 1) {
        return;
      }
      setCurrentElement({ ...currentElement, type: "text", [key]: value });
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
    setCurrentElement((prev) => ({ ...prev, ...item }) as ITextProps);
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
              options={fontSize}
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
          <PanelDropdownButton
            title="对齐"
            value={currentElement?.placement}
            icon={<AlignTextLeft theme="outline" size="14" fill="#333" />}
            onSelect={(key) => {
              propertyChangeHandle("placement", key);
            }}
            menu={{
              items: [
                {
                  key: "left-top",
                  label: "左上对齐",
                  icon: (
                    <AlignmentLeftTop theme="outline" size="15" fill="#333" />
                  ),
                },
                {
                  key: "left-center",
                  label: "左中对齐",
                  icon: (
                    <AlignmentLeftCenter
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  ),
                },
                {
                  key: "left-bottom",
                  label: "左下对齐",
                  icon: (
                    <AlignmentLeftBottom
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  ),
                },
                {
                  key: "center-top",
                  label: "中上对齐",
                  icon: (
                    <AlignmentHorizontalTop
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  ),
                },
                {
                  key: "center-center",
                  label: "水平垂直居中",
                  icon: (
                    <AlignmentHorizontalCenter
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  ),
                },
                {
                  key: "center-bottom",
                  label: "中下对齐",
                  icon: (
                    <AlignmentHorizontalBottom
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  ),
                },
                {
                  key: "right-top",
                  label: "右上对齐",
                  icon: (
                    <AlignmentRightTop theme="outline" size="15" fill="#333" />
                  ),
                },
                {
                  key: "right-center",
                  label: "右中对齐",
                  icon: (
                    <AlignmentRightCenter
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  ),
                },
                {
                  key: "right-bottom",
                  label: "右下对齐",
                  icon: (
                    <AlignmentRightBottom
                      theme="outline"
                      size="15"
                      fill="#333"
                    />
                  ),
                },
              ],
            }}
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
      <div className="h-full flex items-center gap-[8px] flex-shrink-0">
        <PanelLargeButton
          title="阴影"
          active={currentElement?.shadow}
          icon={<DropShadowDown theme="outline" size="18" fill="#333" />}
          onClick={() => {
            propertyChangeHandle("shadow", !currentElement?.shadow);
          }}
        />
        <div className="flex flex-col justify-center gap-[10px]">
          <div className="flex items-center gap-[6px]">
            <span className="text-[12px] text-gray-500 min-w-[8px]">X</span>
            <Slider
              style={{ width: 90, margin: 0 }}
              min={-100}
              max={100}
              defaultValue={currentElement?.shadowOffsetX}
              value={currentElement?.shadowOffsetX}
              onChange={(value) => {
                propertyChangeHandle("shadowOffsetX", value);
              }}
              disabled={!currentElement?.shadow}
            />
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="text-[12px] text-gray-500 min-w-[8px]">Y</span>
            <Slider
              style={{ width: 90, margin: 0 }}
              min={-100}
              max={100}
              defaultValue={currentElement?.shadowOffsetY}
              value={currentElement?.shadowOffsetY}
              onChange={(value) => {
                propertyChangeHandle("shadowOffsetY", value);
              }}
              disabled={!currentElement?.shadow}
            />
          </div>
        </div>
        <ColorPicker
          className={styles.colorPicker}
          value={currentElement?.shadowColor}
          onChange={debouncedColorChange("shadowColor") as any}
          disabled={!currentElement?.shadow}
        />
      </div>
      <PanelSplitLine />
      <div className="h-full flex justify-center gap-[5px] flex-shrink-0">
        <PanelLargeButton
          title="边框"
          active={currentElement?.border}
          icon={<Square theme="outline" size="18" fill="#333" />}
          onClick={() => {
            propertyChangeHandle("border", !currentElement?.border);
          }}
        />
        <div className="flex gap-[6px]">
          <div className="flex h-full flex-col justify-between">
            <Tooltip title="边框宽度" placement="top">
              <InputNumber
                value={currentElement?.borderWidth}
                style={{ width: "85px" }}
                size="small"
                onChange={(value) => {
                  propertyChangeHandle("borderWidth", value);
                }}
                disabled={!currentElement?.border}
              />
            </Tooltip>
            <Tooltip title="边框样式" placement="top">
              <PanelSelect
                value={currentElement?.borderStyle}
                style={{ width: "85px" }}
                size="small"
                options={Border}
                onChange={(value) => {
                  propertyChangeHandle("borderStyle", value);
                }}
                disabled={!currentElement?.border}
              />
            </Tooltip>
          </div>
          <Popover>
            <ColorPicker
              size="small"
              className={styles.colorPicker}
              value={currentElement?.borderColor}
              disabled={!currentElement?.border}
              onChange={debouncedColorChange("borderColor") as any}
            />
          </Popover>
        </div>
      </div>
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
    </div>
  );
};

export const TextPanelTitle = "文本工具";
export const TextPanelKey = "text";
