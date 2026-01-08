import { PanelLargeButton, PanelSelect } from "@/components";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { RadarChart } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import {
  Collapse,
  ColorPicker,
  Input,
  InputNumber,
  Popover,
  Switch,
} from "antd";
import { useMemo, type FC } from "react";
import styles from "../../components/panel.module.less";
import type { IChartProps } from "../../index";

export const Bar2ChartPanel: FC = () => {
  // 使用 Zustand hooks 订阅状态变化
  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const getElementInfo = usePPTStore((state) => state.getElementInfo);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  const chartInfo =
    pageId && elementId
      ? (getElementInfo(pageId, elementId) as IChartProps | null)
      : null;

  // 获取 polar 配置，如果没有则使用默认值
  const polarOption = chartInfo?.option?.polar;
  const polarConfig = Array.isArray(polarOption)
    ? polarOption[0] || {}
    : polarOption || {};

  // 解析 center 值，默认 ["50%", "50%"]
  const centerValue = (polarConfig as any)?.center || ["50%", "50%"];
  const centerX = parseFloat(
    centerValue[0]?.toString().replace("%", "") || "50"
  );
  const centerY = parseFloat(
    centerValue[1]?.toString().replace("%", "") || "50"
  );

  // 解析 radius 值，默认 ["10%", "80%"]
  const radiusValue = (polarConfig as any)?.radius || ["10%", "80%"];
  const radiusInner = parseFloat(
    radiusValue[0]?.toString().replace("%", "") || "10"
  );
  const radiusOuter = parseFloat(
    radiusValue[1]?.toString().replace("%", "") || "80"
  );

  // 更新 polar 配置的函数
  const handlePolarChange = useMemoizedFn((path: string[], value: any) => {
    if (!chartInfo || !pageId || !elementId) return;
    const updatedPolar = { ...polarConfig };
    let current: any = updatedPolar;

    // 遍历路径，创建嵌套对象
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // 设置最终值
    current[path[path.length - 1]] = value;

    // 更新 option.polar（保持原有结构，如果是数组则保持数组）
    const updatedOption = {
      ...chartInfo.option,
      polar: Array.isArray(polarOption) ? [updatedPolar] : updatedPolar,
    };

    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // 更新 center 的 X 值
  const handleCenterXChange = useMemoizedFn((value: number | null) => {
    const newCenter = [`${value ?? 50}%`, centerValue[1] || "50%"];
    handlePolarChange(["center"], newCenter);
  });

  // 更新 center 的 Y 值
  const handleCenterYChange = useMemoizedFn((value: number | null) => {
    const newCenter = [centerValue[0] || "50%", `${value ?? 50}%`];
    handlePolarChange(["center"], newCenter);
  });

  // 更新 radius 的内圈值
  const handleRadiusInnerChange = useMemoizedFn((value: number | null) => {
    const newRadius = [`${value ?? 10}%`, radiusValue[1] || "80%"];
    handlePolarChange(["radius"], newRadius);
  });

  // 更新 radius 的外圈值
  const handleRadiusOuterChange = useMemoizedFn((value: number | null) => {
    const newRadius = [radiusValue[0] || "10%", `${value ?? 80}%`];
    handlePolarChange(["radius"], newRadius);
  });

  // 获取 angleAxis 配置
  const angleAxisConfig = chartInfo?.option?.angleAxis || {
    type: "category",
    data: ["a", "b", "c", "d"],
    startAngle: 75,
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
  };

  // 更新 angleAxis 配置的函数
  const handleAngleAxisChange = useMemoizedFn((path: string[], value: any) => {
    if (!chartInfo || !pageId || !elementId) return;
    const updatedAngleAxis = { ...angleAxisConfig };
    let current: any = updatedAngleAxis;

    // 遍历路径，创建嵌套对象
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // 设置最终值
    current[path[path.length - 1]] = value;

    // 更新 option.angleAxis
    const updatedOption = {
      ...chartInfo.option,
      angleAxis: updatedAngleAxis,
    };

    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // ColorPicker 防抖处理函数（用于 angleAxis）
  const handleAngleAxisColorChange = useDebounceFn(
    (keys: string[], color: any) => {
      const colorObj = color.toRgb();
      if (colorObj.a !== 1) {
        handleAngleAxisChange(
          keys,
          `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
        );
      } else {
        handleAngleAxisChange(keys, color.toHexString());
      }
    },
    { wait: 300 }
  );

  // 根据配置获取值（用于 angleAxis）
  const getAngleAxisValue = useMemoizedFn(
    (keys: string[], defaultValue?: any) => {
      let current: any = angleAxisConfig;
      for (const key of keys) {
        if (current?.[key] === undefined) {
          return defaultValue;
        }
        current = current[key];
      }
      return current ?? defaultValue;
    }
  );

  // 渲染 angleAxis 配置项组件
  const renderAngleAxisConfigItem = useMemoizedFn((config: any) => {
    const { type, keys, defaultValue, ...props } = config;
    const value = getAngleAxisValue(keys, defaultValue);

    switch (type) {
      case "switch":
        return (
          <Switch
            checked={value !== false}
            style={{ width: "40px" }}
            onChange={(checked) => handleAngleAxisChange(keys, checked)}
          />
        );
      case "inputNumber":
        return (
          <InputNumber
            value={value ?? defaultValue ?? 0}
            onChange={(val) =>
              handleAngleAxisChange(keys, val ?? defaultValue ?? 0)
            }
            min={props.min}
            max={props.max}
            step={props.step}
            style={{ width: "100%" }}
          />
        );
      case "input":
        return (
          <Input
            value={value ?? defaultValue ?? ""}
            onChange={(e) => handleAngleAxisChange(keys, e.target.value)}
            placeholder={props.placeholder}
            style={{ width: "100%" }}
          />
        );
      case "colorPicker":
        return (
          <ColorPicker
            value={value ?? defaultValue}
            onChange={(color) => handleAngleAxisColorChange.run(keys, color)}
            className={styles.colorPicker}
          />
        );
      case "select":
        return (
          <PanelSelect
            value={value ?? defaultValue}
            onChange={(val) => handleAngleAxisChange(keys, val)}
            options={props.options}
            style={{ width: "100%" }}
          />
        );
      default:
        return null;
    }
  });

  // angleAxis 配置数组
  const angleAxisConfigs = useMemo(
    () => [
      {
        key: "angleAxisBasic",
        title: "角度轴基础设置",
        configs: [
          {
            type: "inputNumber",
            keys: ["startAngle"],
            label: "起始角度",
            defaultValue: 75,
            min: -360,
            max: 360,
          },
        ],
      },
      {
        key: "angleAxisLine",
        title: "角度轴线",
        configs: [
          {
            type: "switch",
            keys: ["axisLine", "show"],
            label: "显示",
          },
          {
            type: "colorPicker",
            keys: ["axisLine", "lineStyle", "color"],
            label: "颜色",
            defaultValue: "#666",
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "width"],
            label: "宽度",
            defaultValue: 1,
            min: 0,
            max: 10,
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
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "opacity"],
            label: "透明度",
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.1,
          },
          {
            type: "colorPicker",
            keys: ["axisLine", "lineStyle", "shadowColor"],
            label: "阴影颜色",
            defaultValue: "transparent",
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowBlur"],
            label: "阴影模糊",
            defaultValue: 0,
            min: 0,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
          },
        ],
      },
      {
        key: "angleAxisLabel",
        title: "角度轴标签",
        configs: [
          {
            type: "switch",
            keys: ["axisLabel", "show"],
            label: "显示",
          },
          {
            type: "colorPicker",
            keys: ["axisLabel", "color"],
            label: "颜色",
            defaultValue: "#666",
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "rotate"],
            label: "旋转角度",
            defaultValue: 0,
            min: -180,
            max: 180,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "fontSize"],
            label: "字体大小",
            defaultValue: 12,
            min: 1,
            max: 100,
          },
          {
            type: "select",
            keys: ["axisLabel", "fontStyle"],
            label: "字体样式",
            defaultValue: "normal",
            options: [
              { label: "正常", value: "normal" },
              { label: "斜体", value: "italic" },
            ],
          },
          {
            type: "select",
            keys: ["axisLabel", "fontWeight"],
            label: "字体粗细",
            defaultValue: "normal",
            options: [
              { label: "正常", value: "normal" },
              { label: "粗体", value: "bold" },
            ],
          },
          {
            type: "colorPicker",
            keys: ["axisLabel", "shadowColor"],
            label: "阴影颜色",
            defaultValue: "transparent",
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "shadowBlur"],
            label: "阴影模糊",
            defaultValue: 0,
            min: 0,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "shadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
          },
          {
            type: "colorPicker",
            keys: ["axisLabel", "textShadowColor"],
            label: "文字阴影颜色",
            defaultValue: "transparent",
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "textShadowBlur"],
            label: "文字阴影模糊",
            defaultValue: 0,
            min: 0,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "textShadowOffsetX"],
            label: "文字阴影X偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["axisLabel", "textShadowOffsetY"],
            label: "文字阴影Y偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
          },
        ],
      },
    ],
    []
  );

  // 获取 series[0].label 配置
  const series = chartInfo?.option?.series;
  const series0 = Array.isArray(series) ? series[0] : series;
  const labelConfig = (series0 as any)?.label || {
    show: true,
    color: "#fff",
    fontStyle: "normal",
    fontWeight: "normal",
    fontFamily: "sans-serif",
    fontSize: 12,
    rotate: 0,
    textShadowColor: "transparent",
    textShadowBlur: 0,
    textShadowOffsetX: 0,
    textShadowOffsetY: 0,
  };

  // 更新 series[0].label 配置的函数
  const handleLabelChange = useMemoizedFn((path: string[], value: any) => {
    if (!chartInfo || !pageId || !elementId) return;
    const updatedLabel = { ...labelConfig };
    let current: any = updatedLabel;

    // 遍历路径，创建嵌套对象
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // 设置最终值
    current[path[path.length - 1]] = value;

    // 更新 option.series[0].label
    const updatedSeries0 = {
      ...series0,
      label: updatedLabel,
    };

    const updatedSeries = Array.isArray(series)
      ? [updatedSeries0, ...series.slice(1)]
      : updatedSeries0;

    const updatedOption = {
      ...chartInfo.option,
      series: updatedSeries,
    };

    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // ColorPicker 防抖处理函数
  const handleLabelColorChange = useDebounceFn(
    (keys: string[], color: any) => {
      const colorObj = color.toRgb();
      if (colorObj.a !== 1) {
        handleLabelChange(
          keys,
          `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
        );
      } else {
        handleLabelChange(keys, color.toHexString());
      }
    },
    { wait: 300 }
  );

  // 根据配置获取值
  const getLabelValue = useMemoizedFn((keys: string[], defaultValue?: any) => {
    let current: any = labelConfig;
    for (const key of keys) {
      if (current?.[key] === undefined) {
        return defaultValue;
      }
      current = current[key];
    }
    return current ?? defaultValue;
  });

  // 渲染配置项组件
  const renderLabelConfigItem = useMemoizedFn((config: any) => {
    const { type, keys, defaultValue, ...props } = config;
    const value = getLabelValue(keys, defaultValue);

    switch (type) {
      case "switch":
        return (
          <Switch
            checked={value !== false}
            style={{ width: "40px" }}
            onChange={(checked) => handleLabelChange(keys, checked)}
          />
        );
      case "inputNumber":
        return (
          <InputNumber
            value={value ?? defaultValue ?? 0}
            onChange={(val) =>
              handleLabelChange(keys, val ?? defaultValue ?? 0)
            }
            min={props.min}
            max={props.max}
            style={{ width: "100%" }}
          />
        );
      case "input":
        return (
          <Input
            value={value ?? defaultValue ?? ""}
            onChange={(e) => handleLabelChange(keys, e.target.value)}
            placeholder={props.placeholder}
            style={{ width: "100%" }}
          />
        );
      case "colorPicker":
        return (
          <ColorPicker
            value={value ?? defaultValue}
            onChange={(color) => handleLabelColorChange.run(keys, color)}
            className={styles.colorPicker}
          />
        );
      case "select":
        return (
          <PanelSelect
            value={value ?? defaultValue}
            onChange={(val) => handleLabelChange(keys, val)}
            options={props.options}
            style={{ width: "100%" }}
          />
        );
      default:
        return null;
    }
  });

  // label 配置数组
  const labelConfigs = useMemo(
    () => [
      {
        key: "basic",
        title: "字体设置",
        configs: [
          {
            type: "switch",
            keys: ["show"],
            label: "显示",
          },
          {
            type: "colorPicker",
            keys: ["color"],
            label: "颜色",
            defaultValue: "#fff",
          },
          {
            type: "inputNumber",
            keys: ["fontSize"],
            label: "字体大小",
            defaultValue: 12,
            min: 8,
            max: 72,
          },
          {
            type: "inputNumber",
            keys: ["rotate"],
            label: "旋转角度",
            defaultValue: 0,
            min: -180,
            max: 180,
          },
          {
            type: "input",
            keys: ["fontFamily"],
            label: "字体",
            defaultValue: "sans-serif",
            placeholder: "请输入字体",
          },
          {
            type: "select",
            keys: ["fontStyle"],
            label: "字体样式",
            defaultValue: "normal",
            options: [
              { label: "正常", value: "normal" },
              { label: "斜体", value: "italic" },
            ],
          },
          {
            type: "select",
            keys: ["fontWeight"],
            label: "字体粗细",
            defaultValue: "normal",
            options: [
              { label: "正常", value: "normal" },
              { label: "粗体", value: "bold" },
              { label: "100", value: "100" },
              { label: "200", value: "200" },
              { label: "300", value: "300" },
              { label: "400", value: "400" },
              { label: "500", value: "500" },
              { label: "600", value: "600" },
              { label: "700", value: "700" },
              { label: "800", value: "800" },
              { label: "900", value: "900" },
            ],
          },
          {
            type: "colorPicker",
            keys: ["textShadowColor"],
            label: "阴影颜色",
            defaultValue: "transparent",
          },
          {
            type: "inputNumber",
            keys: ["textShadowBlur"],
            label: "模糊度",
            defaultValue: 0,
            min: 0,
            max: 100,
          },
          {
            type: "inputNumber",
            keys: ["textShadowOffsetX"],
            label: "X偏移",
            defaultValue: 0,
            min: -100,
            max: 100,
          },
          {
            type: "inputNumber",
            keys: ["textShadowOffsetY"],
            label: "Y偏移",
            defaultValue: 0,
            min: -100,
            max: 100,
          },
        ],
      },
    ],
    []
  );

  const content = (
    <div className="w-[400px] max-h-[600px] overflow-y-auto box-border p-[15px]">
      <Collapse
        items={[
          {
            key: "polar",
            label: <span style={{ fontSize: "12px" }}>极坐标设置</span>,
            children: (
              <div className="grid grid-cols-3 gap-[10px]">
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[12px] text-gray-600">中心X (%)</label>
                  <InputNumber
                    value={centerX}
                    onChange={handleCenterXChange}
                    min={0}
                    max={100}
                    style={{ width: "100%" }}
                    formatter={(value) => `${value}%`}
                    parser={(value) =>
                      parseFloat(value?.replace("%", "") || "0")
                    }
                  />
                </div>
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[12px] text-gray-600">中心Y (%)</label>
                  <InputNumber
                    value={centerY}
                    onChange={handleCenterYChange}
                    min={0}
                    max={100}
                    style={{ width: "100%" }}
                    formatter={(value) => `${value}%`}
                    parser={(value) =>
                      parseFloat(value?.replace("%", "") || "0")
                    }
                  />
                </div>
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[12px] text-gray-600">内圈 (%)</label>
                  <InputNumber
                    value={radiusInner}
                    onChange={handleRadiusInnerChange}
                    min={0}
                    max={100}
                    style={{ width: "100%" }}
                    formatter={(value) => `${value}%`}
                    parser={(value) =>
                      parseFloat(value?.replace("%", "") || "0")
                    }
                  />
                </div>
                <div className="flex flex-col gap-[5px]">
                  <label className="text-[12px] text-gray-600">外圈 (%)</label>
                  <InputNumber
                    value={radiusOuter}
                    onChange={handleRadiusOuterChange}
                    min={0}
                    max={100}
                    style={{ width: "100%" }}
                    formatter={(value) => `${value}%`}
                    parser={(value) =>
                      parseFloat(value?.replace("%", "") || "0")
                    }
                  />
                </div>
              </div>
            ),
          },
          ...angleAxisConfigs.map((panel) => ({
            key: panel.key,
            label: <span style={{ fontSize: "12px" }}>{panel.title}</span>,
            children: (
              <div className="grid grid-cols-3 gap-[10px]">
                {panel.configs.map((config, index) => (
                  <div key={index} className="flex flex-col gap-[5px]">
                    <label className="text-[12px] text-gray-600">
                      {config.label}
                    </label>
                    {renderAngleAxisConfigItem(config)}
                  </div>
                ))}
              </div>
            ),
          })),
          ...labelConfigs.map((panel) => ({
            key: panel.key,
            label: <span style={{ fontSize: "12px" }}>{panel.title}</span>,
            children: (
              <div className="grid grid-cols-3 gap-[10px]">
                {panel.configs.map((config, index) => (
                  <div key={index} className="flex flex-col gap-[5px]">
                    <label className="text-[12px] text-gray-600">
                      {config.label}
                    </label>
                    {renderLabelConfigItem(config)}
                  </div>
                ))}
              </div>
            ),
          })),
        ]}
        defaultActiveKey={["polar"]}
        size="small"
      />
    </div>
  );

  if (!pageId || !elementId || !chartInfo) return null;

  return (
    <Popover
      content={content}
      trigger="hover"
      placement="bottom"
      overlayInnerStyle={{ padding: 0 }}
    >
      <div className="h-full">
        <PanelLargeButton
          title="极坐标"
          icon={<RadarChart theme="outline" size="18" fill="#333" />}
        />
      </div>
    </Popover>
  );
};
