import { PanelLargeButton } from "@/components";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { AddOne, ColorFilter, Delete } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { Button, ColorPicker, Popover } from "antd";
import { memo, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import type { IChartProps } from "../index";

export const ColorPanel: FC = memo(() => {
  const { t } = useTranslation();
  
  // Popover 打开状态
  const [open, setOpen] = useState(false);

  // 使用 Zustand hooks 订阅状态变化
  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);
  
  // 直接订阅 chartInfo，这样当 pages 变化时组件会重新渲染
  const chartInfo = usePPTStore((state) => {
    if (!pageId || !elementId) return null;
    const page = state.pages.find((p) => p.id === pageId);
    const element = page?.elements.find((el) => el.id === elementId);
    return (element as IChartProps) || null;
  });

  // 获取 color 配置，如果没有则使用默认值
  const defaultColors = [
    "#5F95FF",
    "#91CC75",
    "#FAC858",
    "#EE6666",
    "#73C0DE",
    "#3BA272",
    "#FC8452",
    "#9A60B4",
    "#EA7CCC",
  ];

  // 处理 color 类型，确保是 string[]
  const optionColor = chartInfo?.option?.color;
  const colorArray: string[] = Array.isArray(optionColor)
    ? optionColor.map((c) => (typeof c === "string" ? c : String(c)))
    : defaultColors;

  // 更新 color 配置
  const handleColorChange = useMemoizedFn((colors: string[]) => {
    if (!chartInfo || !pageId || !elementId) return;
    const updatedOption = {
      ...chartInfo.option,
      color: colors,
    };
    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // ColorPicker 防抖处理函数
  const handleColorPickerChange = useDebounceFn(
    (index: number, color: any) => {
      const colorObj = color.toRgb();
      const colorValue =
        colorObj.a !== 1
          ? `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
          : color.toHexString();

      const newColors = [...colorArray];
      newColors[index] = colorValue;
      handleColorChange(newColors);
    },
    { wait: 300 }
  );

  // 添加颜色
  const handleAddColor = useMemoizedFn(() => {
    const newColors = [...colorArray, "#5F95FF"];
    handleColorChange(newColors);
  });

  // 删除颜色
  const handleDeleteColor = useMemoizedFn((index: number) => {
    if (colorArray.length <= 1) {
      return; // 至少保留一个颜色
    }
    const newColors = colorArray.filter((_, i) => i !== index);
    handleColorChange(newColors);
  });

  if (!pageId || !elementId || !chartInfo) return null;

  const content = (
    <div className="w-[420px] max-h-[600px] overflow-y-auto box-border p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-800">
            {t('chartConfig.color.config')}
            <label className="text-xs text-chrome-secondary ml-[5px]">
              {t('chartConfig.color.cycleTip')}
            </label>
          </span>
          <Button
            type="primary"
            size="small"
            onClick={handleAddColor}
            icon={<AddOne theme="outline" size="14" />}
            className="text-xs h-7 flex items-center gap-1"
          >
            {t('chartConfig.color.add')}
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {colorArray.map((color, index) => {
            const colorStr = typeof color === "string" ? color : String(color);
            return (
              <ColorPicker
                key={index}
                value={colorStr}
                trigger="hover"
                onChange={(c) => handleColorPickerChange.run(index, c)}
                showText={(color) => (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs text-chrome-text flex-1 truncate">
                      {color.toHexString()}
                    </span>
                    <Delete
                      theme="outline"
                      size="14"
                      className={`cursor-pointer text-gray-400 hover:text-primary flex-shrink-0 ${
                        colorArray.length <= 1
                          ? "opacity-30 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (colorArray.length > 1) {
                          handleDeleteColor(index);
                        }
                      }}
                    />
                  </div>
                )}
              />
            );
          })}
        </div>
        {colorArray.length === 0 && (
          <div className="text-center py-10 px-5 text-gray-400 text-xs">
            {t('chartConfig.color.noColor')}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="hover"
      placement="bottom"
      overlayInnerStyle={{ padding: 0 }}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="h-full">
        <PanelLargeButton
          title={t('chartConfig.color.title')}
          icon={<ColorFilter theme="outline" size="18" fill="var(--icon-color)" />}
          active={open}
        />
      </div>
    </Popover>
  );
});
