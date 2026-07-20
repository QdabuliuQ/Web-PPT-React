import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { GridFour } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { memo, useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import type { IChartProps } from "../index";
import { ChartStylePanel } from "./chartStylePanel";

export const GridPanel: FC = memo(() => {
  const { t } = useTranslation();
  
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

  // 获取 grid 配置，如果没有则使用默认值
  const gridConfig = chartInfo?.option?.grid || {
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
    if (!chartInfo || !pageId || !elementId) return;
    const updatedOption = {
      ...chartInfo.option,
      grid: updatedGrid,
    };

    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // 通用的 onChange 处理函数
  const handleConfigChange = useMemoizedFn((value: any, keys: string[]) => {
    handleGridChange(keys, value);
  });

  // ColorPicker 的 onChange 处理函数
  // ChartStylePanel 已经将颜色对象转换为字符串，所以这里直接使用字符串值
  const handleColorConfigChange = useMemoizedFn(
    (value: any, keys: string[]) => {
      handleGridChange(keys, value);
    }
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

  // 配置数组
  const panelConfigs = useMemo(
    () => [
      {
        key: "basic",
        title: t('chartConfig.sections.basicSettings'),
        configs: [
          {
            type: "switch",
            keys: ["show"],
            label: t('chartConfig.common.show'),
            defaultValue: getValue(["show"], true),
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["left"],
            label: t('chartConfig.position.left'),
            defaultValue: getValue(["left"], 20),
            min: 0,
            max: 500,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["right"],
            label: t('chartConfig.position.right'),
            defaultValue: getValue(["right"], 20),
            min: 0,
            max: 500,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["top"],
            label: t('chartConfig.position.top'),
            defaultValue: getValue(["top"], 40),
            min: 0,
            max: 500,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["bottom"],
            label: t('chartConfig.position.bottom'),
            defaultValue: getValue(["bottom"], 20),
            min: 0,
            max: 500,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["backgroundColor"],
            label: t('chartConfig.common.backgroundColor'),
            defaultValue: getValue(["backgroundColor"], "#fff"),
            onChange: handleColorConfigChange,
          },
        ],
      },
      {
        key: "shadow",
        title: t('chartConfig.sections.shadowSettings'),
        configs: [
          {
            type: "colorPicker",
            keys: ["shadowColor"],
            label: t('chartConfig.shadow.color'),
            defaultValue: getValue(["shadowColor"], "rgba(0, 0, 0, 0.5)"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["shadowBlur"],
            label: t('chartConfig.shadow.blur'),
            defaultValue: getValue(["shadowBlur"], 10),
            min: 0,
            max: 100,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["shadowOffsetX"],
            label: t('chartConfig.shadow.offsetX'),
            defaultValue: getValue(["shadowOffsetX"], 0),
            min: -100,
            max: 100,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["shadowOffsetY"],
            label: t('chartConfig.shadow.offsetY'),
            defaultValue: getValue(["shadowOffsetY"], 0),
            min: -100,
            max: 100,
            onChange: handleConfigChange,
          },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, handleConfigChange, handleColorConfigChange, getValue, gridConfig]
  );

  if (!pageId || !elementId || !chartInfo) return null;

  return (
    <ChartStylePanel
      title={t('chartConfig.sections.grid')}
      icon={<GridFour theme="outline" size="18" fill="var(--icon-color)" />}
      panelConfigs={panelConfigs}
      getValue={getValue}
      defaultActiveKey={["basic"]}
    />
  );
});
