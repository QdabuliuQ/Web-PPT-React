import { PanelNumberOrAuto } from "@/components";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { Filter } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { InputNumber } from "antd";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import {
  ChartStylePanel,
  type PanelConfig,
} from "../../components/chartStylePanel";
import type { IChartProps } from "../../index";

export const Funnel1ChartPanel: FC = () => {
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

  // 获取 series 配置，如果没有则使用默认值
  const seriesOption = chartInfo?.option?.series;
  const seriesConfig = Array.isArray(seriesOption)
    ? seriesOption[0] || {}
    : seriesOption || {};

  // 解析 width 值，默认 "80%"
  const widthValue = (seriesConfig as any)?.width || "80%";
  const heightValue = (seriesConfig as any)?.height || "90%";
  const width =
    parseFloat(
      typeof widthValue === "string"
        ? widthValue.replace("%", "")
        : String(widthValue)
    ) || 80;
  const height =
    parseFloat(
      typeof heightValue === "string"
        ? heightValue.replace("%", "")
        : String(heightValue)
    ) || 80;

  // 更新 series 配置的函数
  const handleSeriesChange = useMemoizedFn((path: string[], value: any) => {
    if (!chartInfo || !pageId || !elementId) return;
    const updatedSeries = { ...seriesConfig };
    let current: any = updatedSeries;

    // 遍历路径，创建嵌套对象
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // 设置最终值
    current[path[path.length - 1]] = value;

    // 更新 option.series（保持原有结构，如果是数组则保持数组）
    const updatedOption = {
      ...chartInfo.option,
      series: Array.isArray(seriesOption) ? [updatedSeries] : updatedSeries,
    };

    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // 更新 width
  const handleWidthChange = useMemoizedFn((value: number | null) => {
    handleSeriesChange(["width"], `${value ?? 80}%`);
  });

  // 更新 height
  const handleHeightChange = useMemoizedFn((value: number | null) => {
    handleSeriesChange(["height"], `${value ?? 90}%`);
  });

  // ColorPicker 防抖处理函数
  const handleColorChange = useDebounceFn(
    (keys: string[], color: any) => {
      const colorObj = color.toRgb();
      if (colorObj.a !== 1) {
        handleSeriesChange(
          keys,
          `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
        );
      } else {
        handleSeriesChange(keys, color.toHexString());
      }
    },
    { wait: 300 }
  );

  // 根据配置获取值
  const getValue = useMemoizedFn((keys: string[], defaultValue?: any) => {
    let current: any = seriesConfig;
    for (const key of keys) {
      if (current?.[key] === undefined) {
        return defaultValue;
      }
      current = current[key];
    }
    return current ?? defaultValue;
  });

  // 解析/格式化 left/top 值，转换为 PanelNumberOrAuto 支持的格式（只支持 center 或数字）
  const parsePositionValue = useMemoizedFn((value: any) => {
    if (value === "center") return "center";
    if (typeof value === "number") return value;
    // 其他值都返回 center
    return "center";
  });

  // 统一的 onChange 处理函数（用于 customRender）
  const handleChangeWithCallback = useMemoizedFn(
    (config: any, newValue: any) => {
      // 如果配置项有自定义 onChange，先调用它
      if (config.onChange) {
        config.onChange(newValue, config.keys);
      }
      // 然后调用默认的 handleSeriesChange
      handleSeriesChange(config.keys, newValue);
    }
  );

  // 通用的 onChange 处理函数（用于非 customRender 的配置项）
  const handleConfigChange = useMemoizedFn((value: any, keys: string[]) => {
    handleSeriesChange(keys, value);
  });

  // ColorPicker 的 onChange 处理函数（需要防抖）
  const handleColorConfigChange = useMemoizedFn(
    (value: any, keys: string[]) => {
      // handleColorChange 已经处理了防抖和颜色转换
      handleColorChange.run(keys, value);
    }
  );

  const panelConfigs = useMemo(
    () => [
      {
        key: "basic",
        title: t("chartConfig.sections.basicSettings"),
        configs: [
          {
            type: "numberOrAuto",
            keys: ["left"],
            label: t("chartConfig.funnelExt.horizontalPosition"),
            defaultValue: parsePositionValue(getValue(["left"], "center")),
            min: 0,
            max: 100,
            step: 1,
            customRender: (config) => {
              const leftValue = parsePositionValue(
                getValue(["left"], "center")
              );
              return (
                <PanelNumberOrAuto
                  value={leftValue}
                  onChange={(val) =>
                    handleChangeWithCallback(config, parsePositionValue(val))
                  }
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                />
              );
            },
          },
          {
            type: "numberOrAuto",
            keys: ["top"],
            label: t("chartConfig.funnelExt.verticalPosition"),
            defaultValue: parsePositionValue(getValue(["top"], "center")),
            min: 0,
            max: 100,
            step: 1,
            customRender: (config) => {
              const topValue = parsePositionValue(getValue(["top"], "center"));
              return (
                <PanelNumberOrAuto
                  value={topValue}
                  onChange={(val) =>
                    handleChangeWithCallback(config, parsePositionValue(val))
                  }
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                />
              );
            },
          },
          {
            type: "inputNumber",
            keys: ["width"],
            label: t("chartConfig.common.width"),
            defaultValue: width,
            min: 0,
            max: 100,
            step: 1,
            customRender: (config) => (
              <InputNumber
                value={width}
                onChange={(val) => {
                  const formattedValue = `${val ?? 80}%`;
                  if (config.onChange) {
                    config.onChange(formattedValue, config.keys);
                  }
                  handleWidthChange(val);
                }}
                min={0}
                max={100}
                step={1}
                style={{ width: "100%" }}
                formatter={(value) => `${value}%`}
                parser={(value) => parseFloat(value?.replace("%", "") || "0")}
              />
            ),
          },
          {
            type: "inputNumber",
            keys: ["height"],
            label: t("chartConfig.common.height"),
            defaultValue: height,
            min: 0,
            max: 100,
            step: 1,
            customRender: (config) => (
              <InputNumber
                value={height}
                onChange={(val) => {
                  const formattedValue = `${val ?? 90}%`;
                  if (config.onChange) {
                    config.onChange(formattedValue, config.keys);
                  }
                  handleHeightChange(val);
                }}
                min={0}
                max={100}
                step={1}
                style={{ width: "100%" }}
                formatter={(value) => `${value}%`}
                parser={(value) => parseFloat(value?.replace("%", "") || "0")}
              />
            ),
          },
          {
            type: "inputNumber",
            keys: ["min"],
            label: t("chartConfig.chartTypes.funnel.min"),
            defaultValue: getValue(["min"], 0),
            min: 0,
            max: 1000,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["max"],
            label: t("chartConfig.chartTypes.funnel.max"),
            defaultValue: getValue(["max"], 100),
            min: 0,
            max: 1000,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["gap"],
            label: t("chartConfig.chartTypes.funnel.gap"),
            defaultValue: getValue(["gap"], 2),
            min: 0,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["sort"],
            label: t("chartConfig.chartTypes.funnel.sort"),
            defaultValue: getValue(["sort"], "descending"),
            options: [
              { label: t("chartConfig.chartTypes.funnel.sortDescending"), value: "descending" },
              { label: t("chartConfig.chartTypes.funnel.sortAscending"), value: "ascending" },
              { label: t("chartConfig.chartTypes.funnel.sortNone"), value: "none" },
            ],
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "label",
        title: t("chartConfig.sections.label"),
        configs: [
          {
            type: "switch",
            keys: ["label", "show"],
            label: t("chartConfig.common.show"),
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["label", "position"],
            label: t("chartConfig.label.position"),
            defaultValue: getValue(["label", "position"], "inside"),
            options: [
              { label: t("chartConfig.funnelExt.inside"), value: "inside" },
              { label: t("chartConfig.funnelExt.outside"), value: "outside" },
              { label: t("chartConfig.funnelExt.left"), value: "left" },
              { label: t("chartConfig.funnelExt.right"), value: "right" },
              { label: t("chartConfig.funnelExt.top"), value: "top" },
              { label: t("chartConfig.funnelExt.bottom"), value: "bottom" },
              { label: t("chartConfig.funnelExt.insideRight"), value: "insideRight" },
              { label: t("chartConfig.funnelExt.insideLeft"), value: "insideLeft" },
              { label: t("chartConfig.funnelExt.leftTop"), value: "leftTop" },
              { label: t("chartConfig.funnelExt.leftBottom"), value: "leftBottom" },
              { label: t("chartConfig.funnelExt.rightTop"), value: "rightTop" },
              { label: t("chartConfig.funnelExt.rightBottom"), value: "rightBottom" },
              { label: t("chartConfig.funnelExt.inner"), value: "inner" },
              { label: t("chartConfig.funnelExt.center"), value: "center" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["label", "color"],
            label: t("chartConfig.common.color"),
            defaultValue: getValue(["label", "color"], "#fff"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "fontSize"],
            label: t("chartConfig.font.fontSize"),
            defaultValue: getValue(["label", "fontSize"], 12),
            min: 8,
            max: 72,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["label", "fontStyle"],
            label: t("chartConfig.font.fontStyle"),
            defaultValue: getValue(["label", "fontStyle"], "normal"),
            options: [
              { label: t("chartConfig.font.styles.normal"), value: "normal" },
              { label: t("chartConfig.font.styles.italic"), value: "italic" },
              { label: t("chartConfig.font.styles.oblique"), value: "oblique" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["label", "fontWeight"],
            label: t("chartConfig.font.fontWeight"),
            defaultValue: getValue(["label", "fontWeight"], "normal"),
            options: [
              { label: t("chartConfig.font.weights.normal"), value: "normal" },
              { label: t("chartConfig.font.weights.bold"), value: "bold" },
              { label: t("chartConfig.font.weights.bolder"), value: "bolder" },
              { label: t("chartConfig.font.weights.lighter"), value: "lighter" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["label", "textShadowColor"],
            label: t("chartConfig.textShadow.color"),
            defaultValue: getValue(["label", "textShadowColor"], "transparent"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowBlur"],
            label: t("chartConfig.textShadow.blur"),
            defaultValue: getValue(["label", "textShadowBlur"], 0),
            min: 0,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowOffsetX"],
            label: t("chartConfig.textShadow.offsetX"),
            defaultValue: getValue(["label", "textShadowOffsetX"], 0),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowOffsetY"],
            label: t("chartConfig.textShadow.offsetY"),
            defaultValue: getValue(["label", "textShadowOffsetY"], 0),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "labelLine",
        title: t("chartConfig.sections.labelLine"),
        configs: [
          {
            type: "switch",
            keys: ["labelLine", "show"],
            label: t("chartConfig.common.show"),
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "length"],
            label: t("chartConfig.funnelExt.length"),
            defaultValue: getValue(["labelLine", "length"], 10),
            min: 0,
            max: 100,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["labelLine", "lineStyle", "color"],
            label: t("chartConfig.common.color"),
            defaultValue: getValue(["labelLine", "lineStyle", "color"], "#000"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "lineStyle", "width"],
            label: t("chartConfig.common.width"),
            defaultValue: getValue(["labelLine", "lineStyle", "width"], 1),
            min: 0,
            max: 10,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["labelLine", "lineStyle", "type"],
            label: t("chartConfig.line.style"),
            defaultValue: getValue(["labelLine", "lineStyle", "type"], "solid"),
            options: [
              { label: t("chartConfig.line.solid"), value: "solid" },
              { label: t("chartConfig.line.dashed"), value: "dashed" },
              { label: t("chartConfig.line.dotted"), value: "dotted" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "slider",
            keys: ["labelLine", "lineStyle", "opacity"],
            label: t("chartConfig.common.opacity"),
            defaultValue: getValue(["labelLine", "lineStyle", "opacity"], 1),
            min: 0,
            max: 1,
            step: 0.1,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "itemStyle",
        title: t("chartConfig.sections.textStyle"),
        configs: [
          {
            type: "colorPicker",
            keys: ["itemStyle", "borderColor"],
            label: t("chartConfig.legend.borderColor"),
            defaultValue: getValue(["itemStyle", "borderColor"], "#fff"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "borderWidth"],
            label: t("chartConfig.legend.borderWidth"),
            defaultValue: getValue(["itemStyle", "borderWidth"], 1),
            min: 0,
            max: 20,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["itemStyle", "borderType"],
            label: t("chartConfig.legend.borderStyle"),
            defaultValue: getValue(["itemStyle", "borderType"], "solid"),
            options: [
              { label: t("chartConfig.line.solid"), value: "solid" },
              { label: t("chartConfig.line.dashed"), value: "dashed" },
              { label: t("chartConfig.line.dotted"), value: "dotted" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "slider",
            keys: ["itemStyle", "opacity"],
            label: t("chartConfig.common.opacity"),
            defaultValue: getValue(["itemStyle", "opacity"], 1),
            min: 0,
            max: 1,
            step: 0.1,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["itemStyle", "shadowColor"],
            label: t("chartConfig.shadow.color"),
            defaultValue: getValue(["itemStyle", "shadowColor"], "transparent"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowBlur"],
            label: t("chartConfig.shadow.blur"),
            defaultValue: getValue(["itemStyle", "shadowBlur"], 0),
            min: 0,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowOffsetX"],
            label: t("chartConfig.shadow.offsetX"),
            defaultValue: getValue(["itemStyle", "shadowOffsetX"], 0),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowOffsetY"],
            label: t("chartConfig.shadow.offsetY"),
            defaultValue: getValue(["itemStyle", "shadowOffsetY"], 0),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
        ],
      },
    ],
    [
      width,
      handleWidthChange,
      height,
      handleHeightChange,
      getValue,
      parsePositionValue,
      handleChangeWithCallback,
      handleConfigChange,
      handleColorConfigChange,
      t,
    ]
  );

  if (!pageId || !elementId || !chartInfo) return null;

  return (
    <ChartStylePanel
      title={t("chartConfig.sections.textStyle")}
      icon={<Filter theme="outline" size="18" fill="var(--icon-color)" />}
      panelConfigs={panelConfigs as PanelConfig[]}
      getValue={getValue}
      defaultActiveKey={["basic"]}
    />
  );
};
