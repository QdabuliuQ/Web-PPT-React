import { PanelLargeButton, PanelNumberOrAuto, PanelSelect } from "@/components";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { Text } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { Collapse, ColorPicker, InputNumber, Popover, Switch } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import { getLegendDefaultOption } from "../common";
import type { IChartProps } from "../index";
import styles from "./panel.module.less";

export const LegendPanel: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  if (!pageId || !elementId) return null;

  const chartInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IChartProps | null;

  if (!chartInfo) return null;

  // 获取 legend 配置，如果没有则使用默认值
  const legendConfig = chartInfo.option?.legend || getLegendDefaultOption();

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
    const updatedOption = {
      ...chartInfo.option,
      legend: updatedLegend,
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
        title: "基础设置",
        configs: [
          {
            type: "switch",
            keys: ["show"],
            label: "显示",
            defaultValue: getConfigValue(["show"]),
          },
          {
            type: "select",
            keys: ["icon"],
            label: "形状",
            defaultValue: getConfigValue(["icon"]),
            options: [
              { label: "圆角矩形", value: "roundRect" },
              { label: "矩形", value: "rect" },
              { label: "圆形", value: "circle" },
              { label: "三角形", value: "triangle" },
              { label: "菱形", value: "diamond" },
              { label: "大头针", value: "pin" },
              { label: "箭头", value: "arrow" },
              { label: "无", value: "none" },
            ],
          },
          {
            type: "numberOrAuto",
            keys: ["left"],
            label: "左边距",
            defaultValue: getConfigValue(["left"]),
            min: 0,
            max: 2000,
          },
          {
            type: "numberOrAuto",
            keys: ["top"],
            label: "上边距",
            defaultValue: getConfigValue(["top"]),
            min: 0,
            max: 2000,
          },
          {
            type: "inputNumber",
            keys: ["itemWidth"],
            label: "图例项宽度",
            defaultValue: getConfigValue(["itemWidth"]),
            min: 0,
            max: 200,
          },
          {
            type: "inputNumber",
            keys: ["itemHeight"],
            label: "图例项高度",
            defaultValue: getConfigValue(["itemHeight"]),
            min: 0,
            max: 200,
          },
        ],
      },
      {
        key: "textStyle",
        title: "文字样式",
        configs: [
          {
            type: "colorPicker",
            keys: ["textStyle", "color"],
            label: "颜色",
            defaultValue: getConfigValue(["textStyle", "color"]),
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "fontSize"],
            label: "字体大小",
            defaultValue: getConfigValue(["textStyle", "fontSize"]),
            min: 1,
            max: 100,
          },
          {
            type: "select",
            keys: ["textStyle", "fontStyle"],
            label: "字体样式",
            defaultValue: getConfigValue(["textStyle", "fontStyle"]),
            options: [
              { label: "正常", value: "normal" },
              { label: "斜体", value: "italic" },
              { label: "倾斜", value: "oblique" },
            ],
          },
          {
            type: "select",
            keys: ["textStyle", "fontWeight"],
            label: "字体粗细",
            defaultValue: getConfigValue(["textStyle", "fontWeight"]),
            options: [
              { label: "正常", value: "normal" },
              { label: "粗体", value: "bold" },
              { label: "更粗", value: "bolder" },
              { label: "更细", value: "lighter" },
            ],
          },
          {
            type: "colorPicker",
            keys: ["textStyle", "textShadowColor"],
            label: "文字阴影颜色",
            defaultValue: getConfigValue(["textStyle", "textShadowColor"]),
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowBlur"],
            label: "文字阴影模糊",
            defaultValue: getConfigValue(["textStyle", "textShadowBlur"]),
            min: 0,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowOffsetX"],
            label: "文字阴影X偏移",
            defaultValue: getConfigValue(["textStyle", "textShadowOffsetX"]),
            min: -50,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowOffsetY"],
            label: "文字阴影Y偏移",
            defaultValue: getConfigValue(["textStyle", "textShadowOffsetY"]),
            min: -50,
            max: 50,
          },
        ],
      },
      {
        key: "itemStyle",
        title: "图例项样式",
        configs: [
          {
            type: "colorPicker",
            keys: ["itemStyle", "borderColor"],
            label: "边框颜色",
            defaultValue: getConfigValue(["itemStyle", "borderColor"]),
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "borderWidth"],
            label: "边框宽度",
            defaultValue: getConfigValue(["itemStyle", "borderWidth"]),
            min: 0,
            max: 20,
          },
          {
            type: "select",
            keys: ["itemStyle", "borderType"],
            label: "边框样式",
            defaultValue: getConfigValue(["itemStyle", "borderType"]),
            options: [
              { label: "实线", value: "solid" },
              { label: "虚线", value: "dashed" },
              { label: "点线", value: "dotted" },
            ],
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "opacity"],
            label: "透明度",
            defaultValue: getConfigValue(["itemStyle", "opacity"]),
            min: 0,
            max: 1,
            step: 0.1,
          },
          {
            type: "colorPicker",
            keys: ["itemStyle", "shadowColor"],
            label: "阴影颜色",
            defaultValue: getConfigValue(["itemStyle", "shadowColor"]),
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowBlur"],
            label: "阴影模糊",
            defaultValue: getConfigValue(["itemStyle", "shadowBlur"]),
            min: 0,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: getConfigValue(["itemStyle", "shadowOffsetX"]),
            min: -50,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: getConfigValue(["itemStyle", "shadowOffsetY"]),
            min: -50,
            max: 50,
          },
        ],
      },
    ];
  }, [legendConfig]);

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
            onChange={(checked) => handleLegendChange(keys, checked)}
          />
        );
      case "inputNumber":
        return (
          <InputNumber
            value={value ?? defaultValue ?? 0}
            onChange={(val) =>
              handleLegendChange(keys, val ?? defaultValue ?? 0)
            }
            min={props.min}
            max={props.max}
            step={props.step}
            style={{ width: "100%" }}
          />
        );
      case "numberOrAuto":
        return (
          <PanelNumberOrAuto
            value={value ?? defaultValue ?? 0}
            onChange={(val) => handleLegendChange(keys, val)}
          />
        );
      case "select":
        return (
          <PanelSelect
            value={value ?? defaultValue}
            onChange={(val) => handleLegendChange(keys, val)}
            options={props.options}
            trigger="hover"
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
      default:
        return null;
    }
  });

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
                  {renderConfigItem(config)}
                </div>
              ))}
            </div>
          ),
        }))}
        defaultActiveKey={["basic"]}
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
          title="图例"
          icon={<Text theme="outline" size="18" fill="#333" />}
        />
      </div>
    </Popover>
  );
});
