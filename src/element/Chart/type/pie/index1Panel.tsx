import { PanelLargeButton, PanelSelect } from "@/components";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { ChartPie } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { Collapse, ColorPicker, InputNumber, Popover, Switch } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import styles from "../../components/panel.module.less";
import type { IChartProps } from "../../index";

export const Pie1ChartPanel: FC = observer(() => {
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

  // 解析 radius 值，默认 "60%"
  const radiusValue = (seriesConfig as any)?.radius || "60%";
  const radius =
    parseFloat(
      typeof radiusValue === "string"
        ? radiusValue.replace("%", "")
        : String(radiusValue)
    ) || 60;

  // 解析 center 值，默认 ["50%", "50%"]
  const centerValue = (seriesConfig as any)?.center || ["50%", "50%"];
  const centerX = parseFloat(
    centerValue[0]?.toString().replace("%", "") || "50"
  );
  const centerY = parseFloat(
    centerValue[1]?.toString().replace("%", "") || "50"
  );

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

  // 更新 radius
  const handleRadiusChange = useMemoizedFn((value: number | null) => {
    handleSeriesChange(["radius"], `${value ?? 60}%`);
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

  // 渲染配置项组件
  const renderConfigItem = useMemoizedFn((config: any) => {
    const { type, keys, defaultValue, ...props } = config;
    const value = getValue(keys, defaultValue);

    switch (type) {
      case "switch":
        return (
          <Switch
            checked={value !== false}
            style={{ width: "40px" }}
            onChange={(checked) => handleSeriesChange(keys, checked)}
          />
        );
      case "inputNumber":
        return (
          <InputNumber
            value={value ?? defaultValue ?? 0}
            onChange={(val) =>
              handleSeriesChange(keys, val ?? defaultValue ?? 0)
            }
            min={props.min}
            max={props.max}
            step={props.step}
            style={{ width: "100%" }}
          />
        );
      case "colorPicker":
        return (
          <ColorPicker
            value={value ?? defaultValue}
            onChange={(color) => handleColorChange.run(keys, color)}
            className={styles.colorPicker}
          />
        );
      case "select":
        return (
          <PanelSelect
            value={value ?? defaultValue}
            onChange={(val) => handleSeriesChange(keys, val)}
            options={props.options}
            style={{ width: "100%" }}
          />
        );
      default:
        return null;
    }
  });

  const panelConfigs = useMemo(
    () => [
      {
        key: "basic",
        title: "基础设置",
        configs: [
          {
            type: "inputNumber",
            keys: ["radius"],
            label: "半径",
            defaultValue: 60,
            min: 0,
            max: 100,
            step: 1,
            customRender: () => (
              <InputNumber
                value={radius}
                onChange={handleRadiusChange}
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
            keys: ["center", "0"],
            label: "中心X",
            defaultValue: 50,
            min: 0,
            max: 100,
            step: 1,
            customRender: () => (
              <InputNumber
                value={centerX}
                onChange={handleCenterXChange}
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
            defaultValue: 50,
            min: 0,
            max: 100,
            step: 1,
            customRender: () => (
              <InputNumber
                value={centerY}
                onChange={handleCenterYChange}
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
          },
          {
            type: "colorPicker",
            keys: ["label", "color"],
            label: "颜色",
            defaultValue: "#333",
          },
          {
            type: "inputNumber",
            keys: ["label", "fontSize"],
            label: "字体大小",
            defaultValue: 12,
            min: 8,
            max: 72,
            step: 1,
          },
          {
            type: "select",
            keys: ["label", "position"],
            label: "位置",
            defaultValue: "outside",
            options: [
              { label: "外侧", value: "outside" },
              { label: "内侧", value: "inside" },
              { label: "内部", value: "inner" },
              { label: "中心", value: "center" },
            ],
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
          },
          {
            type: "colorPicker",
            keys: ["labelLine", "lineStyle", "color"],
            label: "颜色",
            defaultValue: "#666",
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "lineStyle", "width"],
            label: "宽度",
            defaultValue: 1,
            min: 0,
            max: 10,
            step: 1,
          },
        ],
      },
    ],
    [
      radius,
      handleRadiusChange,
      centerX,
      handleCenterXChange,
      centerY,
      handleCenterYChange,
    ]
  );

  const content = (
    <div className="w-[400px] max-h-[600px] overflow-y-auto box-border p-[15px]">
      <Collapse
        items={panelConfigs.map((panel) => ({
          key: panel.key,
          label: <span style={{ fontSize: "12px" }}>{panel.title}</span>,
          children: (
            <div className="grid grid-cols-3 gap-[10px]">
              {panel.configs.map((config, index) => (
                <div key={index} className="flex flex-col gap-[5px]">
                  <label className="text-[12px] text-gray-600">
                    {config.label}
                  </label>
                  {config.customRender
                    ? config.customRender()
                    : renderConfigItem(config)}
                </div>
              ))}
            </div>
          ),
        }))}
        defaultActiveKey={["basic", "label", "labelLine"]}
        size="small"
      />
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="hover"
      placement="bottom"
      overlayInnerStyle={{ padding: 0 }}
    >
      <div className="h-full">
        <PanelLargeButton
          title="样式"
          aspectRatio
          icon={<ChartPie theme="outline" size="18" fill="#333" />}
        />
      </div>
    </Popover>
  );
});
