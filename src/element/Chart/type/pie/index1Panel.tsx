import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { ChartPie } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { InputNumber } from "antd";
import { useMemo, type FC } from "react";
import { ChartStylePanel } from "../../components/chartStylePanel";
import type { IChartProps } from "../../index";

export const Pie1ChartPanel: FC = () => {
  // 使用 Zustand hooks 订阅状态变化
  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const getElementInfo = usePPTStore((state) => state.getElementInfo);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  const chartInfo =
    pageId && elementId
      ? (getElementInfo(pageId, elementId) as IChartProps | null)
      : null;

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
    console.log(keys, value);

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
        title: "基础设置",
        configs: [
          // 根据是否为环形图显示不同的输入框
          ...(isDonutChart
            ? [
                {
                  type: "inputNumber",
                  keys: ["radius", "0"],
                  label: "内半径",
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
                  label: "外半径",
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
                  label: "半径",
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
            label: "中心X",
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
            label: "中心Y",
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
        title: "标签",
        configs: [
          {
            type: "switch",
            keys: ["label", "show"],
            label: "显示",
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["label", "color"],
            label: "颜色",
            defaultValue: getValue(["label", "color"], "#333"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "fontSize"],
            label: "字体大小",
            defaultValue: getValue(["label", "fontSize"], 12),
            min: 8,
            max: 72,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["label", "position"],
            label: "位置",
            defaultValue: getValue(["label", "position"], "outside"),
            options: [
              { label: "外侧", value: "outside" },
              { label: "内侧", value: "inside" },
              { label: "内部", value: "inner" },
              { label: "中心", value: "center" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["label", "fontStyle"],
            label: "字体样式",
            defaultValue: getValue(["label", "fontStyle"], "normal"),
            options: [
              { label: "正常", value: "normal" },
              { label: "斜体", value: "italic" },
              { label: "倾斜", value: "oblique" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["label", "fontWeight"],
            label: "字体粗细",
            defaultValue: getValue(["label", "fontWeight"], "normal"),
            options: [
              { label: "正常", value: "normal" },
              { label: "粗体", value: "bold" },
              { label: "加粗", value: "bolder" },
              { label: "细体", value: "lighter" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["label", "textShadowColor"],
            label: "文字阴影颜色",
            defaultValue: getValue(["label", "textShadowColor"], "transparent"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowBlur"],
            label: "文字阴影模糊",
            defaultValue: getValue(["label", "textShadowBlur"], 0),
            min: 0,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowOffsetX"],
            label: "文字阴影X偏移",
            defaultValue: getValue(["label", "textShadowOffsetX"], 0),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowOffsetY"],
            label: "文字阴影Y偏移",
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
        title: "标签线",
        configs: [
          {
            type: "switch",
            keys: ["labelLine", "show"],
            label: "显示",
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["labelLine", "lineStyle", "color"],
            label: "颜色",
            defaultValue: getValue(["labelLine", "lineStyle", "color"], "#666"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "lineStyle", "width"],
            label: "宽度",
            defaultValue: getValue(["labelLine", "lineStyle", "width"], 1),
            min: 0,
            max: 10,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["labelLine", "lineStyle", "type"],
            label: "线条样式",
            defaultValue: getValue(["labelLine", "lineStyle", "type"], "solid"),
            options: [
              { label: "实线", value: "solid" },
              { label: "虚线", value: "dashed" },
              { label: "点线", value: "dotted" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "slider",
            keys: ["labelLine", "lineStyle", "opacity"],
            label: "透明度",
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
        title: "图形样式",
        configs: [
          {
            type: "inputNumber",
            keys: ["padAngle"],
            label: "图形间距",
            defaultValue: getValue(["padAngle"], 0),
            min: 0,
            max: 500,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "borderRadius"],
            label: "边框圆角",
            defaultValue: getValue(["itemStyle", "borderRadius"], 0),
            min: 0,
            max: 1000,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["itemStyle", "borderColor"],
            label: "边框颜色",
            defaultValue: getValue(["itemStyle", "borderColor"], "#000"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "borderWidth"],
            label: "边框宽度",
            defaultValue: getValue(["itemStyle", "borderWidth"], 0),
            min: 0,
            max: 20,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["itemStyle", "borderType"],
            label: "边框样式",
            defaultValue: getValue(["itemStyle", "borderType"], "solid"),
            options: [
              { label: "实线", value: "solid" },
              { label: "虚线", value: "dashed" },
              { label: "点线", value: "dotted" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "slider",
            keys: ["itemStyle", "opacity"],
            label: "透明度",
            defaultValue: getValue(["itemStyle", "opacity"], 1),
            min: 0,
            max: 1,
            step: 0.1,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["itemStyle", "shadowColor"],
            label: "阴影颜色",
            defaultValue: getValue(["itemStyle", "shadowColor"], "transparent"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowBlur"],
            label: "阴影模糊",
            defaultValue: getValue(["itemStyle", "shadowBlur"], 0),
            min: 0,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: getValue(["itemStyle", "shadowOffsetX"], 0),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowOffsetY"],
            label: "阴影Y偏移",
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
      isDonutChart,
      innerRadius,
      outerRadius,
      handleRadiusChange,
      handleInnerRadiusChange,
      handleOuterRadiusChange,
      centerX,
      handleCenterXChange,
      centerY,
      handleCenterYChange,
      getValue,
      centerValue,
      seriesConfig,
      handleConfigChange,
      handleColorConfigChange,
    ]
  );

  if (!pageId || !elementId || !chartInfo) return null;

  return (
    <ChartStylePanel
      title="样式"
      icon={<ChartPie theme="outline" size="18" fill="#333" />}
      panelConfigs={panelConfigs}
      getValue={getValue}
      defaultActiveKey={["basic", "label", "labelLine", "itemStyle"]}
    />
  );
};
