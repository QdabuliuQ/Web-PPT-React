import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { ChartHistogramOne } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { memo, useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import type { IChartProps } from "../index";
import { ChartStylePanel } from "./chartStylePanel";

export const YAxisPanel: FC = memo(() => {
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

  // 获取 yAxis 配置，如果没有则使用默认值
  const yAxisConfig = chartInfo?.option?.yAxis || {
    show: true,
    name: "",
    nameLocation: "end",
    nameTextStyle: {
      color: "#666",
      fontSize: 12,
      fontStyle: "normal",
      fontWeight: "normal",
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    type: "value",
    axisLine: {
      show: true,
      lineStyle: {
        color: "#666",
        width: 1,
        type: "solid",
        shadowBlur: 0,
        shadowColor: "transparent",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        opacity: 1,
      },
    },
    axisLabel: {
      show: true,
      color: "#666",
      rotate: 0,
      fontSize: 12,
      fontStyle: "normal",
      fontWeight: "normal",
      shadowColor: "transparent",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    axisTick: {
      show: true,
      length: 5,
      lineStyle: {
        color: "#ccc",
        width: 1,
        type: "solid",
        opacity: 1,
      },
    },
  };

  // 更新 yAxis 配置的通用函数
  const handleYAxisChange = useMemoizedFn((path: string[], value: any) => {
    const updatedYAxis = { ...yAxisConfig };
    let current: any = updatedYAxis;

    // 遍历路径，创建嵌套对象
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // 设置最终值
    current[path[path.length - 1]] = value;

    // 更新 option.yAxis
    if (!chartInfo || !pageId || !elementId) return;
    const updatedOption = {
      ...chartInfo.option,
      yAxis: updatedYAxis,
    };

    setElementInfo(pageId, elementId, {
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
        handleYAxisChange(
          keys,
          `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
        );
      } else {
        handleYAxisChange(keys, color.toHexString());
      }
    },
    { wait: 300 }
  );

  // 通用的 onChange 处理函数
  const handleConfigChange = useMemoizedFn((value: any, keys: string[]) => {
    handleYAxisChange(keys, value);
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
        title: t('chartConfig.sections.basicSettings'),
        configs: [
          {
            type: "switch",
            keys: ["show"],
            label: t('chartConfig.common.show'),
            onChange: handleConfigChange,
          },
          {
            type: "input",
            keys: ["name"],
            label: t('chartConfig.common.name'),
            placeholder: t('chartConfig.common.placeholder.enterAxisName'),
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["nameLocation"],
            label: t('chartConfig.position.namePosition'),
            defaultValue: "end",
            options: [
              { label: t('chartConfig.position.start'), value: "start" },
              { label: t('chartConfig.position.center'), value: "center" },
              { label: t('chartConfig.position.end'), value: "end" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["nameTextStyle", "color"],
            label: t('chartConfig.font.nameColor'),
            defaultValue: "#666",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["nameTextStyle", "fontSize"],
            label: t('chartConfig.font.nameSize'),
            defaultValue: 12,
            min: 1,
            max: 100,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["nameTextStyle", "fontStyle"],
            label: t('chartConfig.font.nameStyle'),
            defaultValue: "normal",
            options: [
              { label: t('chartConfig.font.styles.normal'), value: "normal" },
              { label: t('chartConfig.font.styles.italic'), value: "italic" },
              { label: t('chartConfig.font.styles.oblique'), value: "oblique" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["nameTextStyle", "fontWeight"],
            label: t('chartConfig.font.nameWeight'),
            defaultValue: "normal",
            options: [
              { label: t('chartConfig.font.weights.normal'), value: "normal" },
              { label: t('chartConfig.font.weights.bold'), value: "bold" },
              { label: t('chartConfig.font.weights.bolder'), value: "bolder" },
              { label: t('chartConfig.font.weights.lighter'), value: "lighter" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["nameTextStyle", "textShadowColor"],
            label: t('chartConfig.textShadow.color'),
            defaultValue: "transparent",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["nameTextStyle", "textShadowBlur"],
            label: t('chartConfig.textShadow.blur'),
            defaultValue: 0,
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["nameTextStyle", "textShadowOffsetX"],
            label: t('chartConfig.textShadow.offsetX'),
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["nameTextStyle", "textShadowOffsetY"],
            label: t('chartConfig.textShadow.offsetY'),
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "axisLine",
        title: t('chartConfig.sections.axisLine'),
        configs: [
          {
            type: "switch",
            keys: ["axisLine", "show"],
            label: t('chartConfig.common.show'),
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisLine", "lineStyle", "color"],
            label: t('chartConfig.common.color'),
            defaultValue: "#666",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "width"],
            label: t('chartConfig.common.width'),
            defaultValue: 1,
            min: 0,
            max: 10,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["axisLine", "lineStyle", "type"],
            label: t('chartConfig.line.style'),
            defaultValue: "solid",
            options: [
              { label: t('chartConfig.line.solid'), value: "solid" },
              { label: t('chartConfig.line.dashed'), value: "dashed" },
              { label: t('chartConfig.line.dotted'), value: "dotted" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "slider",
            keys: ["axisLine", "lineStyle", "opacity"],
            label: t('chartConfig.common.opacity'),
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.1,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisLine", "lineStyle", "shadowColor"],
            label: t('chartConfig.shadow.color'),
            defaultValue: "transparent",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowBlur"],
            label: t('chartConfig.shadow.blur'),
            defaultValue: 0,
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowOffsetX"],
            label: t('chartConfig.shadow.offsetX'),
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowOffsetY"],
            label: t('chartConfig.shadow.offsetY'),
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "axisLabel",
        title: t('chartConfig.sections.axisLabel'),
        configs: [
          {
            type: "switch",
            keys: ["axisLabel", "show"],
            label: t('chartConfig.common.show'),
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisLabel", "color"],
            label: t('chartConfig.common.color'),
            defaultValue: "#666",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "rotate"],
            label: t('chartConfig.axis.rotate'),
            defaultValue: 0,
            min: -180,
            max: 180,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "fontSize"],
            label: t('chartConfig.font.fontSize'),
            defaultValue: 12,
            min: 1,
            max: 100,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["axisLabel", "fontStyle"],
            label: t('chartConfig.font.fontStyle'),
            defaultValue: "normal",
            options: [
              { label: t('chartConfig.font.styles.normal'), value: "normal" },
              { label: t('chartConfig.font.styles.italic'), value: "italic" },
              { label: t('chartConfig.font.styles.oblique'), value: "oblique" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["axisLabel", "fontWeight"],
            label: t('chartConfig.font.fontWeight'),
            defaultValue: "normal",
            options: [
              { label: t('chartConfig.font.weights.normal'), value: "normal" },
              { label: t('chartConfig.font.weights.bold'), value: "bold" },
              { label: t('chartConfig.font.weights.bolder'), value: "bolder" },
              { label: t('chartConfig.font.weights.lighter'), value: "lighter" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisLabel", "shadowColor"],
            label: t('chartConfig.shadow.color'),
            defaultValue: "transparent",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "shadowBlur"],
            label: t('chartConfig.shadow.blur'),
            defaultValue: 0,
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "shadowOffsetX"],
            label: t('chartConfig.shadow.offsetX'),
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "shadowOffsetY"],
            label: t('chartConfig.shadow.offsetY'),
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisLabel", "textShadowColor"],
            label: t('chartConfig.textShadow.color'),
            defaultValue: "transparent",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "textShadowBlur"],
            label: t('chartConfig.textShadow.blur'),
            defaultValue: 0,
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "textShadowOffsetX"],
            label: t('chartConfig.textShadow.offsetX'),
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "textShadowOffsetY"],
            label: t('chartConfig.textShadow.offsetY'),
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "axisTick",
        title: t('chartConfig.sections.axisTick'),
        configs: [
          {
            type: "switch",
            keys: ["axisTick", "show"],
            label: t('chartConfig.common.show'),
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisTick", "length"],
            label: t('chartConfig.axis.length'),
            defaultValue: 5,
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisTick", "lineStyle", "color"],
            label: t('chartConfig.common.color'),
            defaultValue: "#ccc",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisTick", "lineStyle", "width"],
            label: t('chartConfig.common.width'),
            defaultValue: 1,
            min: 0,
            max: 10,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["axisTick", "lineStyle", "type"],
            label: t('chartConfig.line.style'),
            defaultValue: "solid",
            options: [
              { label: t('chartConfig.line.solid'), value: "solid" },
              { label: t('chartConfig.line.dashed'), value: "dashed" },
              { label: t('chartConfig.line.dotted'), value: "dotted" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "slider",
            keys: ["axisTick", "lineStyle", "opacity"],
            label: t('chartConfig.common.opacity'),
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.1,
            onChange: handleConfigChange,
          },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, handleColorConfigChange, handleConfigChange, yAxisConfig]
  );

  // 根据配置获取值
  const getValue = useMemoizedFn((keys: string[], defaultValue?: any) => {
    let current: any = yAxisConfig;
    for (const key of keys) {
      if (current?.[key] === undefined) {
        return defaultValue;
      }
      current = current[key];
    }
    return current ?? defaultValue;
  });

  if (!pageId || !elementId || !chartInfo) return null;

  return (
    <ChartStylePanel
      title={t('chartConfig.sections.yAxis')}
      icon={<ChartHistogramOne theme="outline" size="18" fill="var(--icon-color)" />}
      panelConfigs={panelConfigs}
      getValue={getValue}
      defaultActiveKey={["basic"]}
    />
  );
});
