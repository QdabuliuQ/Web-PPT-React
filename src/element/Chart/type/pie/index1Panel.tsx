import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { ChartPie } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { InputNumber } from "antd";
import { useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import {
  ChartStylePanel,
  type PanelConfig,
} from "../../components/chartStylePanel";
import type { IChartProps } from "../../index";

export const Pie1ChartPanel: FC = () => {
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
  const seriesConfig = useMemo(
    () =>
      Array.isArray(seriesOption) ? seriesOption[0] || {} : seriesOption || {},
    [seriesOption]
  );

  // 解析 radius 值，默认 "60%"
  const radiusValue = (seriesConfig as any)?.radius || "60%";
  // 判断 radius 是否为数组（环形图）
  const isDonutChart = Array.isArray(radiusValue);

  // 如果是数组，解析内半径和外半径
  const innerRadius = isDonutChart
    ? parseFloat(
        typeof radiusValue[0] === "string"
          ? radiusValue[0].replace("%", "")
          : String(radiusValue[0] || "40")
      ) || 40
    : null;
  const outerRadius = isDonutChart
    ? parseFloat(
        typeof radiusValue[1] === "string"
          ? radiusValue[1].replace("%", "")
          : String(radiusValue[1] || "70")
      ) || 70
    : parseFloat(
        typeof radiusValue === "string"
          ? radiusValue.replace("%", "")
          : String(radiusValue)
      ) || 60;

  // 解析 center 值，默认 ["50%", "50%"]
  const centerValue = useMemo(
    () => (seriesConfig as any)?.center || ["50%", "50%"],
    [seriesConfig]
  );
  const centerX = parseFloat(
    centerValue[0]?.toString().replace("%", "") || "50"
  );
  const centerY = parseFloat(
    centerValue[1]?.toString().replace("%", "") || "50"
  );

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

  // 更新 radius（饼图）
  const handleRadiusChange = useMemoizedFn((value: number | null) => {
    handleSeriesChange(["radius"], `${value ?? 60}%`);
  });

  // 更新内半径（环形图）
  const handleInnerRadiusChange = useMemoizedFn((value: number | null) => {
    const currentRadius = (seriesConfig as any)?.radius || ["40%", "70%"];
    const outerRadiusValue = Array.isArray(currentRadius)
      ? currentRadius[1] || "70%"
      : "70%";
    handleSeriesChange(["radius"], [`${value ?? 40}%`, outerRadiusValue]);
  });

  // 更新外半径（环形图）
  const handleOuterRadiusChange = useMemoizedFn((value: number | null) => {
    const currentRadius = (seriesConfig as any)?.radius || ["40%", "70%"];
    const innerRadiusValue = Array.isArray(currentRadius)
      ? currentRadius[0] || "40%"
      : "40%";
    handleSeriesChange(["radius"], [innerRadiusValue, `${value ?? 70}%`]);
  });

  // 更新 center 的 X 值
  const handleCenterXChange = useMemoizedFn((value: number | null) => {
    const newCenter = [`${value ?? 50}%`, centerValue[1] || "50%"];
    handleSeriesChange(["center"], newCenter);
  });

  // 更新 center 的 Y 值
  const handleCenterYChange = useMemoizedFn((value: number | null) => {
    const newCenter = [centerValue[0] || "50%", `${value ?? 50}%`];
    handleSeriesChange(["center"], newCenter);
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
          // 根据是否为环形图显示不同的输入框
          ...(isDonutChart
            ? [
                {
                  type: "inputNumber",
                  keys: ["radius", "0"],
                  label: t("chartConfig.chartTypes.pie.innerRadius"),
                  defaultValue: getValue(["radius", "0"], 40),
                  min: 0,
                  max: 100,
                  step: 1,
                  customRender: (config) => (
                    <InputNumber
                      value={innerRadius}
                      onChange={(val) => {
                        const currentRadius = (seriesConfig as any)?.radius || [
                          "40%",
                          "70%",
                        ];
                        const outerRadiusValue = Array.isArray(currentRadius)
                          ? currentRadius[1] || "70%"
                          : "70%";
                        const formattedValue = [
                          `${val ?? 40}%`,
                          outerRadiusValue,
                        ];
                        if (config.onChange) {
                          config.onChange(formattedValue, ["radius"]);
                        }
                        handleInnerRadiusChange(val);
                      }}
                      min={0}
                      max={100}
                      step={1}
                      style={{ width: "100%" }}
                      formatter={(value) => `${value}%`}
                      parser={(value) =>
                        parseFloat(value?.replace("%", "") || "0")
                      }
                    />
                  ),
                },
                {
                  type: "inputNumber",
                  keys: ["radius", "1"],
                  label: t("chartConfig.chartTypes.pie.outerRadius"),
                  defaultValue: getValue(["radius", "1"], 70),
                  min: 0,
                  max: 100,
                  step: 1,
                  customRender: (config) => (
                    <InputNumber
                      value={outerRadius}
                      onChange={(val) => {
                        const currentRadius = (seriesConfig as any)?.radius || [
                          "40%",
                          "70%",
                        ];
                        const innerRadiusValue = Array.isArray(currentRadius)
                          ? currentRadius[0] || "40%"
                          : "40%";
                        const formattedValue = [
                          innerRadiusValue,
                          `${val ?? 70}%`,
                        ];
                        if (config.onChange) {
                          config.onChange(formattedValue, ["radius"]);
                        }
                        handleOuterRadiusChange(val);
                      }}
                      min={0}
                      max={100}
                      step={1}
                      style={{ width: "100%" }}
                      formatter={(value) => `${value}%`}
                      parser={(value) =>
                        parseFloat(value?.replace("%", "") || "0")
                      }
                    />
                  ),
                },
              ]
            : [
                {
                  type: "inputNumber",
                  keys: ["radius"],
                  label: t("chartConfig.chartTypes.pie.radius"),
                  defaultValue: getValue(["radius"], 60),
                  min: 0,
                  max: 100,
                  step: 1,
                  customRender: (config) => (
                    <InputNumber
                      value={outerRadius}
                      onChange={(val) => {
                        const formattedValue = `${val ?? 60}%`;
                        if (config.onChange) {
                          config.onChange(formattedValue, config.keys);
                        }
                        handleRadiusChange(val);
                      }}
                      min={0}
                      max={100}
                      step={1}
                      style={{ width: "100%" }}
                      formatter={(value) => `${value}%`}
                      parser={(value) =>
                        parseFloat(value?.replace("%", "") || "0")
                      }
                    />
                  ),
                },
              ]),
          {
            type: "inputNumber",
            keys: ["center", "0"],
            label: t("chartConfig.chartTypes.pie.centerX"),
            defaultValue: getValue(["center", "0"], 50),
            min: 0,
            max: 100,
            step: 1,
            customRender: (config) => (
              <InputNumber
                value={centerX}
                onChange={(val) => {
                  const formattedValue = [
                    `${val ?? 50}%`,
                    centerValue[1] || "50%",
                  ];
                  if (config.onChange) {
                    config.onChange(formattedValue, config.keys);
                  }
                  handleCenterXChange(val);
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
            keys: ["center", "1"],
            label: t("chartConfig.chartTypes.pie.centerY"),
            defaultValue: getValue(["center", "1"], 50),
            min: 0,
            max: 100,
            step: 1,
            customRender: (config) => (
              <InputNumber
                value={centerY}
                onChange={(val) => {
                  const formattedValue = [
                    centerValue[0] || "50%",
                    `${val ?? 50}%`,
                  ];
                  if (config.onChange) {
                    config.onChange(formattedValue, config.keys);
                  }
                  handleCenterYChange(val);
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
            type: "colorPicker",
            keys: ["label", "color"],
            label: t("chartConfig.common.color"),
            defaultValue: getValue(["label", "color"], "#333"),
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
            keys: ["label", "position"],
            label: t("chartConfig.label.position"),
            defaultValue: getValue(["label", "position"], "outside"),
            options: [
              {
                label: t("chartConfig.label.positionOutside"),
                value: "outside",
              },
              { label: t("chartConfig.label.positionInside"), value: "inside" },
              { label: t("chartConfig.label.positionInner"), value: "inner" },
              { label: t("chartConfig.label.positionCenter"), value: "center" },
            ],
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
            type: "colorPicker",
            keys: ["labelLine", "lineStyle", "color"],
            label: t("chartConfig.common.color"),
            defaultValue: getValue(["labelLine", "lineStyle", "color"], "#666"),
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
        title: t("chartConfig.sections.itemStyle"),
        configs: [
          {
            type: "inputNumber",
            keys: ["padAngle"],
            label: t("chartConfig.pieExt.itemGap"),
            defaultValue: getValue(["padAngle"], 0),
            min: 0,
            max: 500,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "borderRadius"],
            label: t("chartConfig.pieExt.borderRadius"),
            defaultValue: getValue(["itemStyle", "borderRadius"], 0),
            min: 0,
            max: 1000,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["itemStyle", "borderColor"],
            label: t("chartConfig.legend.borderColor"),
            defaultValue: getValue(["itemStyle", "borderColor"], "#000"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "borderWidth"],
            label: t("chartConfig.legend.borderWidth"),
            defaultValue: getValue(["itemStyle", "borderWidth"], 0),
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
      t,
      isDonutChart,
      getValue,
      handleConfigChange,
      handleColorConfigChange,
      innerRadius,
      seriesConfig,
      handleInnerRadiusChange,
      outerRadius,
      handleOuterRadiusChange,
      handleRadiusChange,
      centerX,
      centerValue,
      handleCenterXChange,
      centerY,
      handleCenterYChange,
    ]
  );

  if (!pageId || !elementId || !chartInfo) return null;

  return (
    <ChartStylePanel
      title={t("chartConfig.chartTypes.pie.title")}
      icon={<ChartPie theme="outline" size="18" fill="var(--icon-color)" />}
      panelConfigs={panelConfigs as PanelConfig[]}
      getValue={getValue}
      defaultActiveKey={["basic", "label", "labelLine", "itemStyle"]}
    />
  );
};
