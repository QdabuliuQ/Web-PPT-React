import { ColorPanel, PanelLargeButton, PanelSplitLine } from "@/components";
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
  TextUnderline,
} from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import {
  Button,
  ColorPicker,
  InputNumber,
  Popover,
  Select,
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
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentBackgroundColor, setCurrentBackgroundColor] =
    useState("transparent");
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(0);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [fontSizeSelectOpen, setFontSizeSelectOpen] = useState(false);
  const [borderStyleSelectOpen, setBorderStyleSelectOpen] = useState(false);

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    // 这里可以添加实际的颜色应用逻辑
    console.log("选择的颜色:", color);
  };

  const handleBackgroundColorChange = (color: string) => {
    setCurrentBackgroundColor(color);
    // 这里可以添加实际的背景颜色应用逻辑
    console.log("选择的背景颜色:", color);
  };

  const clearBackgroundColor = () => {
    setCurrentBackgroundColor("transparent");
    setBackgroundColorPickerOpen(false);
    // 这里可以添加清除背景颜色的逻辑
    console.log("清除背景颜色");
  };

  const toggleShadow = () => {
    setShadowEnabled(!shadowEnabled);
  };

  const handleShadowXChange = (value: number) => {
    setShadowX(value);
    // 这里可以添加实际的阴影应用逻辑
    console.log("阴影X偏移:", value);
  };

  const handleShadowYChange = (value: number) => {
    setShadowY(value);
    // 这里可以添加实际的阴影应用逻辑
    console.log("阴影Y偏移:", value);
  };

  const handleShadowColorChange = (_color: any, colorString: string) => {
    setShadowColor(colorString);
    // 这里可以添加实际的阴影颜色应用逻辑
    console.log("阴影颜色:", colorString);
  };

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
      console.log(value, "value");

      if (!currentElement) return;
      if (key === "fontSize" && value <= 1) {
        return;
      }
      console.log(key, value);

      setCurrentElement({ ...currentElement, type: "text", [key]: value });
    }
  );

  // 通用防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 通用防抖颜色变更函数
  const debouncedColorChange = useCallback(
    (property: keyof ITextProps) => (color: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        propertyChangeHandle(property, color);
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
  }, [currentElement]);

  return (
    <div className="h-[50px] inline-flex items-center gap-[10px] px-[50px] min-w-fit my-[7px]">
      <div className="h-full flex items-center gap-[5px] flex-shrink-0">
        {largeButtons.map((item) => {
          return (
            <PanelLargeButton
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
        <div className="flex gap-[5px]">
          <Tooltip title="文本字体大小">
            <div
              onMouseEnter={() => setFontSizeSelectOpen(true)}
              onMouseLeave={() => setFontSizeSelectOpen(false)}
            >
              <Select
                value={currentElement?.fontSize}
                style={{ width: 82 }}
                size="small"
                options={fontSize}
                open={fontSizeSelectOpen}
                onOpenChange={setFontSizeSelectOpen}
                onChange={(value) => propertyChangeHandle("fontSize", value)}
              />
            </div>
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
        <div className="flex gap-[5px]">
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
                value={
                  currentBackgroundColor === "transparent"
                    ? "#ffffff"
                    : currentBackgroundColor
                }
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
              console.log("选中行高:", key);
              // 这里添加更新元素行高的逻辑
              // 例如: updateElementLineHeight(parseFloat(key))
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
          <Tooltip title="增大行高">
            <Button
              size="small"
              type="text"
              icon={<Add theme="outline" size="13" fill="#333" />}
            />
          </Tooltip>
          <Tooltip title="减小行高">
            <Button
              size="small"
              type="text"
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
          onClick={toggleShadow}
        />
        <div className="flex flex-col justify-center gap-[4px]">
          <div className="flex items-center gap-[6px]">
            <span className="text-[12px] text-gray-500 min-w-[8px]">X</span>
            <Slider
              style={{ width: 90, margin: 0 }}
              min={-100}
              max={100}
              defaultValue={currentElement?.shadowOffsetX}
              value={currentElement?.shadowOffsetX}
              onChange={handleShadowXChange}
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
              onChange={handleShadowYChange}
              disabled={!currentElement?.shadow}
            />
          </div>
        </div>
        <ColorPicker
          className={styles.colorPicker}
          value={currentElement?.shadowColor}
          onChange={handleShadowColorChange}
          disabled={!currentElement?.shadow}
        />
      </div>
      <PanelSplitLine />
      <div className="h-full flex flex-col justify-center gap-[3px] flex-shrink-0">
        <div className="flex gap-[10px]">
          <Tooltip title="边框样式" placement="top">
            <div
              onMouseEnter={() => setBorderStyleSelectOpen(true)}
              onMouseLeave={() => setBorderStyleSelectOpen(false)}
            >
              <Select
                value={currentElement?.borderStyle}
                style={{ width: "85px" }}
                size="small"
                options={Border}
                open={borderStyleSelectOpen}
                onOpenChange={setBorderStyleSelectOpen}
              />
            </div>
          </Tooltip>
          <Tooltip title="边框宽度" placement="top">
            <InputNumber
              value={currentElement?.borderWidth}
              style={{ width: "85px" }}
              size="small"
            />
          </Tooltip>
        </div>
        <div className="flex gap-[5px]">
          <Popover
            content={
              <ColorPanel
                value={currentElement?.borderColor}
                onChange={debouncedColorChange("borderColor")}
              />
            }
            trigger="hover"
            placement="bottomLeft"
          >
            <Button
              type="text"
              size="small"
              icon={<Square theme="outline" size="14" fill="#333" />}
            >
              边框颜色
            </Button>
          </Popover>
          <Popover
            content={
              <ColorPanel
                value={
                  currentBackgroundColor === "transparent"
                    ? "#ffffff"
                    : currentBackgroundColor
                }
                onChange={debouncedColorChange("backgroundColor")}
              />
            }
            trigger="hover"
            placement="bottomLeft"
          >
            <Button
              type="text"
              size="small"
              icon={<BackgroundColor theme="outline" size="15" fill="#333" />}
            >
              填充颜色
            </Button>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export const TextPanelTitle = "文本工具";
export const TextPanelKey = "text";
