import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { Text } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { memo, useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import { getLegendDefaultOption } from "../common";
import type { IChartProps } from "../index";
import { ChartStylePanel } from "./chartStylePanel";

export const LegendPanel: FC = memo(() => {
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

  // 获取 legend 配置，如果没有则使用默认值
  const legendConfig = chartInfo?.option?.legend || getLegendDefaultOption();

  // 更新 legend 配置的通用函数
  const handleLegendChange = useMemoizedFn((path: string[], value: any) => {
    const updatedLegend = { ...legendConfig };
    let current: any = updatedLegend;

    // 遍历路径，创建嵌套对象
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // 设置最终值
    current[path[path.length - 1]] = value;

    // 更新 option.legend
    if (!chartInfo || !pageId || !elementId) return;
    const updatedOption = {
      ...chartInfo.option,
      legend: updatedLegend,
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
        handleLegendChange(
          keys,
          `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
        );
      } else {
        handleLegendChange(keys, color.toHexString());
      }
    },
    { wait: 300 }
  );

  // 通用的 onChange 处理函数
  const handleConfigChange = useMemoizedFn((value: any, keys: string[]) => {
    handleLegendChange(keys, value);
  });

  // ColorPicker 的 onChange 处理函数（需要防抖）
  const handleColorConfigChange = useMemoizedFn(
    (value: any, keys: string[]) => {
      handleColorChange.run(keys, value);
    }
  );

  // 配置数组
  const panelConfigs = useMemo(() => {
    // 从 legendConfig 获取值的辅助函数
    const getConfigValue = (keys: string[]) => {
      let current: any = legendConfig;
      for (const key of keys) {
        if (current?.[key] === undefined) {
          return undefined;
        }
        current = current[key];
      }
      return current;
    };

    return [
      {
        key: "basic",
        title: t('chartConfig.sections.basicSettings'),
        configs: [
          {
            type: "switch",
            keys: ["show"],
            label: t('chartConfig.common.show'),
            defaultValue: getConfigValue(["show"]),
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["icon"],
            label: t('chartConfig.legend.shape'),
            defaultValue: getConfigValue(["icon"]),
            options: [
              { label: t('chartConfig.legend.shapes.roundRect'), value: "roundRect" },
              { label: t('chartConfig.legend.shapes.rect'), value: "rect" },
              { label: t('chartConfig.legend.shapes.circle'), value: "circle" },
              { label: t('chartConfig.legend.shapes.triangle'), value: "triangle" },
              { label: t('chartConfig.legend.shapes.diamond'), value: "diamond" },
              { label: t('chartConfig.legend.shapes.pin'), value: "pin" },
              { label: t('chartConfig.legend.shapes.arrow'), value: "arrow" },
              { label: t('chartConfig.legend.shapes.none'), value: "none" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "numberOrAuto",
            keys: ["left"],
            label: t('chartConfig.position.left'),
            defaultValue: getConfigValue(["left"]),
            min: 0,
            max: 2000,
            onChange: handleConfigChange,
          },
          {
            type: "numberOrAuto",
            keys: ["top"],
            label: t('chartConfig.position.top'),
            defaultValue: getConfigValue(["top"]),
            min: 0,
            max: 2000,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemWidth"],
            label: t('chartConfig.legend.itemWidth'),
            defaultValue: getConfigValue(["itemWidth"]),
            min: 0,
            max: 200,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemHeight"],
            label: t('chartConfig.legend.itemHeight'),
            defaultValue: getConfigValue(["itemHeight"]),
            min: 0,
            max: 200,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "textStyle",
        title: t('chartConfig.sections.textStyle'),
        configs: [
          {
            type: "colorPicker",
            keys: ["textStyle", "color"],
            label: t('chartConfig.common.color'),
            defaultValue: getConfigValue(["textStyle", "color"]),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "fontSize"],
            label: t('chartConfig.font.fontSize'),
            defaultValue: getConfigValue(["textStyle", "fontSize"]),
            min: 1,
            max: 100,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["textStyle", "fontStyle"],
            label: t('chartConfig.font.fontStyle'),
            defaultValue: getConfigValue(["textStyle", "fontStyle"]),
            options: [
              { label: t('chartConfig.font.styles.normal'), value: "normal" },
              { label: t('chartConfig.font.styles.italic'), value: "italic" },
              { label: t('chartConfig.font.styles.oblique'), value: "oblique" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["textStyle", "fontWeight"],
            label: t('chartConfig.font.fontWeight'),
            defaultValue: getConfigValue(["textStyle", "fontWeight"]),
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
            keys: ["textStyle", "textShadowColor"],
            label: t('chartConfig.textShadow.color'),
            defaultValue: getConfigValue(["textStyle", "textShadowColor"]),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowBlur"],
            label: t('chartConfig.textShadow.blur'),
            defaultValue: getConfigValue(["textStyle", "textShadowBlur"]),
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowOffsetX"],
            label: t('chartConfig.textShadow.offsetX'),
            defaultValue: getConfigValue(["textStyle", "textShadowOffsetX"]),
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowOffsetY"],
            label: t('chartConfig.textShadow.offsetY'),
            defaultValue: getConfigValue(["textStyle", "textShadowOffsetY"]),
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "itemStyle",
        title: t('chartConfig.sections.legendItemStyle'),
        configs: [
          {
            type: "colorPicker",
            keys: ["itemStyle", "borderColor"],
            label: t('chartConfig.legend.borderColor'),
            defaultValue: getConfigValue(["itemStyle", "borderColor"]),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "borderWidth"],
            label: t('chartConfig.legend.borderWidth'),
            defaultValue: getConfigValue(["itemStyle", "borderWidth"]),
            min: 0,
            max: 20,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["itemStyle", "borderType"],
            label: t('chartConfig.legend.borderStyle'),
            defaultValue: getConfigValue(["itemStyle", "borderType"]),
            options: [
              { label: t('chartConfig.line.solid'), value: "solid" },
              { label: t('chartConfig.line.dashed'), value: "dashed" },
              { label: t('chartConfig.line.dotted'), value: "dotted" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "slider",
            keys: ["itemStyle", "opacity"],
            label: t('chartConfig.common.opacity'),
            defaultValue: getConfigValue(["itemStyle", "opacity"]),
            min: 0,
            max: 1,
            step: 0.1,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["itemStyle", "shadowColor"],
            label: t('chartConfig.shadow.color'),
            defaultValue: getConfigValue(["itemStyle", "shadowColor"]),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowBlur"],
            label: t('chartConfig.shadow.blur'),
            defaultValue: getConfigValue(["itemStyle", "shadowBlur"]),
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowOffsetX"],
            label: t('chartConfig.shadow.offsetX'),
            defaultValue: getConfigValue(["itemStyle", "shadowOffsetX"]),
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowOffsetY"],
            label: t('chartConfig.shadow.offsetY'),
            defaultValue: getConfigValue(["itemStyle", "shadowOffsetY"]),
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
        ],
      },
    ];
  }, [t, legendConfig, handleConfigChange, handleColorConfigChange]);

  // 根据配置获取值
  const getValue = useMemoizedFn((keys: string[], defaultValue?: any) => {
    let current: any = legendConfig;
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
      sectionKey="legend"
      title={t('chartConfig.sections.legend')}
      icon={<Text theme="outline" size="18" fill="var(--icon-color)" />}
      panelConfigs={panelConfigs}
      getValue={getValue}
      defaultActiveKey={["basic"]}
    />
  );
});
