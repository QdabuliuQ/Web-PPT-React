import { PanelNumberOrAuto } from "@/components";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { Filter } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { InputNumber } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import { ChartStylePanel } from "../../components/chartStylePanel";
import type { IChartProps } from "../../index";

export const Funnel1ChartPanel: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  if (!pageId || !elementId) return null;

  const chartInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IChartProps | null;

  if (!chartInfo) return null;

  // 获取 series 配置，如果没有则使用默认值
  const seriesOption = chartInfo.option?.series;
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

    pptStore.setElementInfo(pageId, elementId, {
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
        title: "基础设置",
        configs: [
          {
            type: "numberOrAuto",
            keys: ["left"],
            label: "水平位置",
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
            label: "垂直位置",
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
            label: "宽度",
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
            label: "高度",
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
            label: "最小值",
            defaultValue: getValue(["min"], 0),
            min: 0,
            max: 1000,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["max"],
            label: "最大值",
            defaultValue: getValue(["max"], 100),
            min: 0,
            max: 1000,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["gap"],
            label: "间距",
            defaultValue: getValue(["gap"], 2),
            min: 0,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["sort"],
            label: "排序",
            defaultValue: getValue(["sort"], "descending"),
            options: [
              { label: "降序", value: "descending" },
              { label: "升序", value: "ascending" },
              { label: "无", value: "none" },
            ],
            onChange: handleConfigChange,
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
            type: "select",
            keys: ["label", "position"],
            label: "位置",
            defaultValue: getValue(["label", "position"], "inside"),
            options: [
              { label: "内部", value: "inside" },
              { label: "外部", value: "outside" },
              { label: "左侧", value: "left" },
              { label: "右侧", value: "right" },
              { label: "上侧", value: "top" },
              { label: "下侧", value: "bottom" },
              { label: "内部右侧", value: "insideRight" },
              { label: "内部左侧", value: "insideLeft" },
              { label: "左侧上部", value: "leftTop" },
              { label: "左侧下部", value: "leftBottom" },
              { label: "右侧上部", value: "rightTop" },
              { label: "右侧下部", value: "rightBottom" },
              { label: "内部(同inside)", value: "inner" },
              { label: "居中(同inside)", value: "center" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["label", "color"],
            label: "颜色",
            defaultValue: getValue(["label", "color"], "#fff"),
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
            type: "inputNumber",
            keys: ["labelLine", "length"],
            label: "长度",
            defaultValue: getValue(["labelLine", "length"], 10),
            min: 0,
            max: 100,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["labelLine", "lineStyle", "color"],
            label: "颜色",
            defaultValue: getValue(["labelLine", "lineStyle", "color"], "#000"),
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
        title: "样式",
        configs: [
          {
            type: "colorPicker",
            keys: ["itemStyle", "borderColor"],
            label: "边框颜色",
            defaultValue: getValue(["itemStyle", "borderColor"], "#fff"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "borderWidth"],
            label: "边框宽度",
            defaultValue: getValue(["itemStyle", "borderWidth"], 1),
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
      width,
      handleWidthChange,
      height,
      handleHeightChange,
      getValue,
      parsePositionValue,
      handleChangeWithCallback,
      handleConfigChange,
      handleColorConfigChange,
    ]
  );

  return (
    <ChartStylePanel
      title="样式"
      icon={<Filter theme="outline" size="18" fill="#333" />}
      panelConfigs={panelConfigs}
      getValue={getValue}
      defaultActiveKey={["basic"]}
    />
  );
});
