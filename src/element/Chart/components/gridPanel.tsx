import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { GridFour } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import { ChartStylePanel } from "./chartStylePanel";
import type { IChartProps } from "../index";

export const GridPanel: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  if (!pageId || !elementId) return null;

  const chartInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IChartProps | null;

  if (!chartInfo) return null;

  // 获取 grid 配置，如果没有则使用默认值
  const gridConfig = chartInfo.option?.grid || {
    show: true,
    left: 20,
    right: 20,
    top: 40,
    bottom: 20,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowBlur: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    backgroundColor: "#fff",
  };

  // 更新 grid 配置的通用函数
  const handleGridChange = useMemoizedFn((path: string[], value: any) => {
    const updatedGrid = { ...gridConfig };
    let current: any = updatedGrid;

    // 遍历路径，创建嵌套对象
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // 设置最终值
    current[path[path.length - 1]] = value;

    // 更新 option.grid
    const updatedOption = {
      ...chartInfo.option,
      grid: updatedGrid,
    };

    pptStore.setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // ColorPicker 防抖处理函数
  const handleColorChange = useDebounceFn(
    (keys: string[], color: any) => {
      // 处理 rgba 颜色
      const colorObj = color.toRgb();
      if (colorObj.a !== 1) {
        handleGridChange(
          keys,
          `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
        );
      } else {
        handleGridChange(keys, color.toHexString());
      }
    },
    { wait: 300 }
  );

  // 通用的 onChange 处理函数
  const handleConfigChange = useMemoizedFn((value: any, keys: string[]) => {
    handleGridChange(keys, value);
  });

  // ColorPicker 的 onChange 处理函数（需要防抖）
  const handleColorConfigChange = useMemoizedFn(
    (value: any, keys: string[]) => {
      handleColorChange.run(keys, value);
    }
  );

  // 配置数组
  const panelConfigs = useMemo(
    () => [
      {
        key: "basic",
        title: "基础设置",
        configs: [
          {
            type: "switch",
            keys: ["show"],
            label: "显示",
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["left"],
            label: "左边距",
            defaultValue: 20,
            min: 0,
            max: 500,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["right"],
            label: "右边距",
            defaultValue: 20,
            min: 0,
            max: 500,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["top"],
            label: "上边距",
            defaultValue: 40,
            min: 0,
            max: 500,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["bottom"],
            label: "下边距",
            defaultValue: 20,
            min: 0,
            max: 500,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["backgroundColor"],
            label: "背景颜色",
            defaultValue: "#fff",
            onChange: handleColorConfigChange,
          },
        ],
      },
      {
        key: "shadow",
        title: "阴影设置",
        configs: [
          {
            type: "colorPicker",
            keys: ["shadowColor"],
            label: "阴影颜色",
            defaultValue: "rgba(0, 0, 0, 0.5)",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["shadowBlur"],
            label: "阴影模糊",
            defaultValue: 10,
            min: 0,
            max: 100,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: 0,
            min: -100,
            max: 100,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["shadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: 0,
            min: -100,
            max: 100,
            onChange: handleConfigChange,
          },
        ],
      },
    ],
    [handleConfigChange, handleColorConfigChange]
  );

  // 根据配置获取值
  const getValue = useMemoizedFn((keys: string[], defaultValue?: any) => {
    let current: any = gridConfig;
    for (const key of keys) {
      if (current?.[key] === undefined) {
        return defaultValue;
      }
      current = current[key];
    }
    return current ?? defaultValue;
  });

  return (
    <ChartStylePanel
      title="网格"
      icon={<GridFour theme="outline" size="18" fill="#333" />}
      panelConfigs={panelConfigs}
      getValue={getValue}
      defaultActiveKey={["basic"]}
    />
  );
});
