import { PanelLargeButton } from "@/components";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { BackgroundColor } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { ColorPicker } from "antd";
import { useEffect, useState, type FC } from "react";
import type { IChartProps } from "../index";

export const BackgroundColorPanel: FC = () => {
  // 使用 Zustand hooks 订阅状态变化
  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const getElementInfo = usePPTStore((state) => state.getElementInfo);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  const chartInfo =
    pageId && elementId
      ? (getElementInfo(pageId, elementId) as IChartProps | null)
      : null;

  // 获取 backgroundColor 配置，如果没有则使用默认值 "rgba(0,0,0,0)"
  const backgroundColor = chartInfo?.option?.backgroundColor || "rgba(0,0,0,0)";

  // 使用本地状态来立即更新 UI，避免闪烁
  const [localColor, setLocalColor] = useState<string>(
    typeof backgroundColor === "string" ? backgroundColor : "rgba(0,0,0,0)"
  );

  // 当 store 中的值变化时，同步到本地状态
  useEffect(() => {
    const storeColor =
      typeof backgroundColor === "string" ? backgroundColor : "rgba(0,0,0,0)";
    setLocalColor(storeColor);
  }, [backgroundColor]);

  // 更新 backgroundColor 配置
  const handleBackgroundColorChange = useMemoizedFn((color: string) => {
    if (!chartInfo || !pageId || !elementId) return;
    const updatedOption = {
      ...chartInfo.option,
      backgroundColor: color,
    };

    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // ColorPicker 防抖处理函数
  const handleColorPickerChangeDebounced = useDebounceFn(
    (color: any) => {
      const colorObj = color.toRgb();
      const colorValue =
        colorObj.a !== 1
          ? `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
          : color.toHexString();

      handleBackgroundColorChange(colorValue);
    },
    { wait: 300 }
  );

  // 立即更新本地状态，防抖更新 store
  const handleColorPickerChange = useMemoizedFn((color: any) => {
    const colorObj = color.toRgb();
    const colorValue =
      colorObj.a !== 1
        ? `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
        : color.toHexString();

    // 立即更新本地状态，避免闪烁
    setLocalColor(colorValue);
    // 防抖更新到 store
    handleColorPickerChangeDebounced.run(color);
  });

  if (!pageId || !elementId || !chartInfo) return null;

  return (
    <ColorPicker
      value={localColor}
      trigger="hover"
      onChange={handleColorPickerChange}
      showText={(color) => (
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-600 flex-1 truncate">
            {color.toHexString()}
          </span>
        </div>
      )}
    >
      <div className="h-full">
        <PanelLargeButton
          title="背景"
          icon={<BackgroundColor theme="outline" size="18" fill="#333" />}
        />
      </div>
    </ColorPicker>
  );
};
