import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { ChartHistogram } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import type { IChartProps } from "../index";
import { ChartStylePanel } from "./chartStylePanel";

export const XAxisPanel: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  if (!pageId || !elementId) return null;

  const chartInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IChartProps | null;

  if (!chartInfo) return null;

  // 获取 xAxis 配置，如果没有则使用默认值
  const xAxisConfig = chartInfo.option?.xAxis || {
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

  // 更新 xAxis 配置的通用函数
  const handleXAxisChange = useMemoizedFn((path: string[], value: any) => {
    const updatedXAxis = { ...xAxisConfig };
    let current: any = updatedXAxis;

    // 遍历路径，创建嵌套对象
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // 设置最终值
    current[path[path.length - 1]] = value;

    // 更新 option.xAxis
    const updatedOption = {
      ...chartInfo.option,
      xAxis: updatedXAxis,
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
        handleXAxisChange(
          keys,
          `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
        );
      } else {
        handleXAxisChange(keys, color.toHexString());
      }
    },
    { wait: 300 }
  );

  // 通用的 onChange 处理函数
  const handleConfigChange = useMemoizedFn((value: any, keys: string[]) => {
    handleXAxisChange(keys, value);
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
            type: "input",
            keys: ["name"],
            label: "名称",
            placeholder: "请输入坐标轴名称",
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["nameLocation"],
            label: "名称位置",
            defaultValue: "end",
            options: [
              { label: "起始", value: "start" },
              { label: "居中", value: "center" },
              { label: "结束", value: "end" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["nameTextStyle", "color"],
            label: "名称颜色",
            defaultValue: "#666",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["nameTextStyle", "fontSize"],
            label: "名称字体大小",
            defaultValue: 12,
            min: 1,
            max: 100,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["nameTextStyle", "fontStyle"],
            label: "名称字体样式",
            defaultValue: "normal",
            options: [
              { label: "正常", value: "normal" },
              { label: "斜体", value: "italic" },
              { label: "倾斜", value: "oblique" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["nameTextStyle", "fontWeight"],
            label: "名称字体粗细",
            defaultValue: "normal",
            options: [
              { label: "正常", value: "normal" },
              { label: "粗体", value: "bold" },
              { label: "更粗", value: "bolder" },
              { label: "更细", value: "lighter" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["nameTextStyle", "textShadowColor"],
            label: "名称文字阴影颜色",
            defaultValue: "transparent",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["nameTextStyle", "textShadowBlur"],
            label: "名称文字阴影模糊",
            defaultValue: 0,
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["nameTextStyle", "textShadowOffsetX"],
            label: "名称文字阴影X偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["nameTextStyle", "textShadowOffsetY"],
            label: "名称文字阴影Y偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "axisLine",
        title: "坐标轴线",
        configs: [
          {
            type: "switch",
            keys: ["axisLine", "show"],
            label: "显示",
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisLine", "lineStyle", "color"],
            label: "颜色",
            defaultValue: "#666",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "width"],
            label: "宽度",
            defaultValue: 1,
            min: 0,
            max: 10,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["axisLine", "lineStyle", "type"],
            label: "样式",
            defaultValue: "solid",
            options: [
              { label: "实线", value: "solid" },
              { label: "虚线", value: "dashed" },
              { label: "点线", value: "dotted" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "slider",
            keys: ["axisLine", "lineStyle", "opacity"],
            label: "透明度",
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.1,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisLine", "lineStyle", "shadowColor"],
            label: "阴影颜色",
            defaultValue: "transparent",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowBlur"],
            label: "阴影模糊",
            defaultValue: 0,
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "axisLabel",
        title: "坐标轴标签",
        configs: [
          {
            type: "switch",
            keys: ["axisLabel", "show"],
            label: "显示",
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisLabel", "color"],
            label: "颜色",
            defaultValue: "#666",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "rotate"],
            label: "旋转角度",
            defaultValue: 0,
            min: -180,
            max: 180,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "fontSize"],
            label: "字体大小",
            defaultValue: 12,
            min: 1,
            max: 100,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["axisLabel", "fontStyle"],
            label: "字体样式",
            defaultValue: "normal",
            options: [
              { label: "正常", value: "normal" },
              { label: "斜体", value: "italic" },
              { label: "倾斜", value: "oblique" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["axisLabel", "fontWeight"],
            label: "字体粗细",
            defaultValue: "normal",
            options: [
              { label: "正常", value: "normal" },
              { label: "粗体", value: "bold" },
              { label: "更粗", value: "bolder" },
              { label: "更细", value: "lighter" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisLabel", "shadowColor"],
            label: "阴影颜色",
            defaultValue: "transparent",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "shadowBlur"],
            label: "阴影模糊",
            defaultValue: 0,
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "shadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisLabel", "textShadowColor"],
            label: "文字阴影颜色",
            defaultValue: "transparent",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "textShadowBlur"],
            label: "文字阴影模糊",
            defaultValue: 0,
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "textShadowOffsetX"],
            label: "文字阴影X偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "textShadowOffsetY"],
            label: "文字阴影Y偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "axisTick",
        title: "坐标轴刻度",
        configs: [
          {
            type: "switch",
            keys: ["axisTick", "show"],
            label: "显示",
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisTick", "length"],
            label: "长度",
            defaultValue: 5,
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["axisTick", "lineStyle", "color"],
            label: "颜色",
            defaultValue: "#ccc",
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["axisTick", "lineStyle", "width"],
            label: "宽度",
            defaultValue: 1,
            min: 0,
            max: 10,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["axisTick", "lineStyle", "type"],
            label: "样式",
            defaultValue: "solid",
            options: [
              { label: "实线", value: "solid" },
              { label: "虚线", value: "dashed" },
              { label: "点线", value: "dotted" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "slider",
            keys: ["axisTick", "lineStyle", "opacity"],
            label: "透明度",
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.1,
            onChange: handleConfigChange,
          },
        ],
      },
    ],
    [handleColorConfigChange, handleConfigChange]
  );

  // 根据配置获取值
  const getValue = useMemoizedFn((keys: string[], defaultValue?: any) => {
    let current: any = xAxisConfig;
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
      title="X轴"
      icon={<ChartHistogram theme="outline" size="18" fill="#333" />}
      panelConfigs={panelConfigs}
      getValue={getValue}
      defaultActiveKey={["basic"]}
    />
  );
});
