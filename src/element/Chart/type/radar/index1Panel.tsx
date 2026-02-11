import { PanelLargeButton, PanelSelect } from "@/components";
import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { RadarChart } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { Collapse, ColorPicker, InputNumber, Popover, Switch } from "antd";
import { memo, useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../components/panel.module.less";
import type { IChartProps } from "../../index";

export const Radar1ChartPanel: FC = memo(() => {
  const { t } = useTranslation();
  // 使用 Zustand hooks 订阅状态变化
  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const getElementInfo = usePPTStore((state) => state.getElementInfo);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  const chartInfo =
    pageId && elementId
      ? (getElementInfo(pageId, elementId) as IChartProps | null)
      : null;

  // 获取 radar 配置，如果没有则使用默认值
  const radarOption = chartInfo?.option?.radar;
  const radarConfig = useMemo(() => {
    return Array.isArray(radarOption)
      ? radarOption[0] || {}
      : radarOption || {};
  }, [radarOption]);

  // 解析 center 值，默认 ["50%", "55%"]
  const centerValue = useMemo(
    () => (radarConfig as any)?.center || ["50%", "55%"],
    [radarConfig]
  );
  const centerX = useMemo(
    () => parseFloat(centerValue[0]?.toString().replace("%", "") || "50"),
    [centerValue]
  );
  const centerY = useMemo(
    () => parseFloat(centerValue[1]?.toString().replace("%", "") || "55"),
    [centerValue]
  );

  // 解析 radius 值，默认 "70%"
  const radiusValue = useMemo(
    () => (radarConfig as any)?.radius || "70%",
    [radarConfig]
  );
  const radius = useMemo(
    () =>
      parseFloat(
        typeof radiusValue === "string"
          ? radiusValue.replace("%", "")
          : String(radiusValue)
      ) || 70,
    [radiusValue]
  );

  // 更新 radar 配置的函数
  const handleRadarChange = useMemoizedFn((path: string[], value: any) => {
    if (!chartInfo || !pageId || !elementId) return;
    const updatedRadar = { ...radarConfig };
    let current: any = updatedRadar;

    // 遍历路径，创建嵌套对象
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // 设置最终值
    current[path[path.length - 1]] = value;

    // 更新 option.radar（保持原有结构，如果是数组则保持数组）
    const updatedOption = {
      ...chartInfo.option,
      radar: Array.isArray(radarOption) ? [updatedRadar] : updatedRadar,
    };

    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // 更新 radius
  const handleRadiusChange = useMemoizedFn((value: number | null) => {
    handleRadarChange(["radius"], `${value ?? 70}%`);
  });

  // 更新 center 的 X 值
  const handleCenterXChange = useMemoizedFn((value: number | null) => {
    const newCenter = [`${value ?? 50}%`, centerValue[1] || "55%"];
    handleRadarChange(["center"], newCenter);
  });

  // 更新 center 的 Y 值
  const handleCenterYChange = useMemoizedFn((value: number | null) => {
    const newCenter = [centerValue[0] || "50%", `${value ?? 55}%`];
    handleRadarChange(["center"], newCenter);
  });

  // ColorPicker 防抖处理函数
  const handleColorChange = useDebounceFn(
    (keys: string[], color: any) => {
      const colorObj = color.toRgb();
      if (colorObj.a !== 1) {
        handleRadarChange(
          keys,
          `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
        );
      } else {
        handleRadarChange(keys, color.toHexString());
      }
    },
    { wait: 300 }
  );

  // 处理分割区域颜色数组
  const handleSplitAreaColorChange = useDebounceFn(
    (index: number, color: any) => {
      const areaStyle = (radarConfig as any)?.splitArea?.areaStyle || {};
      const currentColors = areaStyle.color || [
        "rgba(250, 250, 250, 1)",
        "rgba(200, 200, 200, 0.1)",
      ];
      const newColors = [...currentColors];
      const colorObj = color.toRgb();
      if (colorObj.a !== 1) {
        newColors[index] =
          `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`;
      } else {
        newColors[index] = color.toHexString();
      }
      handleRadarChange(["splitArea", "areaStyle", "color"], newColors);
    },
    { wait: 300 }
  );

  // 根据配置获取值
  const getValue = useMemoizedFn((keys: string[], defaultValue?: any) => {
    let current: any = radarConfig;
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
            onChange={(checked) => handleRadarChange(keys, checked)}
          />
        );
      case "inputNumber":
        return (
          <InputNumber
            value={value ?? defaultValue ?? 0}
            onChange={(val) =>
              handleRadarChange(keys, val ?? defaultValue ?? 0)
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
            onChange={(val) => handleRadarChange(keys, val)}
            options={props.options}
            trigger="hover"
            style={{ width: "100%" }}
          />
        );
      default:
        return null;
    }
  });

  const panelConfigs = useMemo(() => {
    // 默认 radar 配置（与 index1.ts 中的默认值保持一致）
    const defaultRadarConfig = {
      center: ["50%", "55%"],
      radius: "70%",
      axisName: {
        show: true,
        color: "#666",
        fontStyle: "normal",
        fontWeight: "normal",
        fontSize: 12,
        textShadowColor: "transparent",
        textShadowBlur: 0,
        textShadowOffsetX: 0,
        textShadowOffsetY: 0,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#e0e0e0",
          width: 1,
          type: "solid",
          shadowBlur: 0,
          shadowColor: "transparent",
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          opacity: 1,
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ["rgba(250, 250, 250, 1)", "rgba(200, 200, 200, 0.1)"],
        },
      },
      axisLine: {
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
    };

    // 从默认配置获取值的辅助函数
    const getDefaultValue = (keys: string[]) => {
      let current: any = defaultRadarConfig;
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
        title: t("chartConfig.sections.basicSettings"),
        configs: [
          {
            type: "inputNumber",
            keys: ["radius"],
            label: t("chartConfig.chartTypes.radar.radius"),
            defaultValue: (() => {
              const val = getDefaultValue(["radius"]);
              return typeof val === "string"
                ? parseFloat(val.replace("%", ""))
                : (val ?? 70);
            })(),
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
            label: t("chartConfig.chartTypes.radar.centerX"),
            defaultValue: (() => {
              const center = getDefaultValue(["center"]);
              const val = Array.isArray(center) ? center[0] : center;
              return typeof val === "string"
                ? parseFloat(val.replace("%", ""))
                : (val ?? 50);
            })(),
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
            label: t("chartConfig.chartTypes.radar.centerY"),
            defaultValue: (() => {
              const center = getDefaultValue(["center"]);
              const val = Array.isArray(center) ? center[1] : center;
              return typeof val === "string"
                ? parseFloat(val.replace("%", ""))
                : (val ?? 55);
            })(),
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
        key: "axisName",
        title: t("chartConfig.chartTypes.radarExt.axisName"),
        configs: [
          {
            type: "switch",
            keys: ["axisName", "show"],
            label: t("chartConfig.common.show"),
            defaultValue: getDefaultValue(["axisName", "show"]),
          },
          {
            type: "colorPicker",
            keys: ["axisName", "color"],
            label: t("chartConfig.common.color"),
            defaultValue: getDefaultValue(["axisName", "color"]),
          },
          {
            type: "inputNumber",
            keys: ["axisName", "fontSize"],
            label: t("chartConfig.font.fontSize"),
            defaultValue: getDefaultValue(["axisName", "fontSize"]),
            min: 8,
            max: 72,
            step: 1,
          },
          {
            type: "select",
            keys: ["axisName", "fontStyle"],
            label: t("chartConfig.font.fontStyle"),
            defaultValue: getDefaultValue(["axisName", "fontStyle"]),
            options: [
              { label: t("chartConfig.font.styles.normal"), value: "normal" },
              { label: t("chartConfig.font.styles.italic"), value: "italic" },
              { label: t("chartConfig.font.styles.oblique"), value: "oblique" },
            ],
          },
          {
            type: "select",
            keys: ["axisName", "fontWeight"],
            label: t("chartConfig.font.fontWeight"),
            defaultValue: getDefaultValue(["axisName", "fontWeight"]),
            options: [
              { label: t("chartConfig.font.weights.normal"), value: "normal" },
              { label: t("chartConfig.font.weights.bold"), value: "bold" },
              { label: t("chartConfig.font.weights.bolder"), value: "bolder" },
              { label: t("chartConfig.font.weights.lighter"), value: "lighter" },
            ],
          },
          {
            type: "colorPicker",
            keys: ["axisName", "textShadowColor"],
            label: t("chartConfig.textShadow.color"),
            defaultValue: getDefaultValue(["axisName", "textShadowColor"]),
          },
          {
            type: "inputNumber",
            keys: ["axisName", "textShadowBlur"],
            label: t("chartConfig.textShadow.blur"),
            defaultValue: getDefaultValue(["axisName", "textShadowBlur"]),
            min: 0,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["axisName", "textShadowOffsetX"],
            label: t("chartConfig.textShadow.offsetX"),
            defaultValue: getDefaultValue(["axisName", "textShadowOffsetX"]),
            min: -50,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["axisName", "textShadowOffsetY"],
            label: t("chartConfig.textShadow.offsetY"),
            defaultValue: getDefaultValue(["axisName", "textShadowOffsetY"]),
            min: -50,
            max: 50,
          },
        ],
      },
      {
        key: "splitLine",
        title: t("chartConfig.chartTypes.radarExt.splitLine"),
        configs: [
          {
            type: "switch",
            keys: ["splitLine", "show"],
            label: t("chartConfig.common.show"),
            defaultValue: getDefaultValue(["splitLine", "show"]),
          },
          {
            type: "colorPicker",
            keys: ["splitLine", "lineStyle", "color"],
            label: t("chartConfig.common.color"),
            defaultValue: getDefaultValue(["splitLine", "lineStyle", "color"]),
          },
          {
            type: "inputNumber",
            keys: ["splitLine", "lineStyle", "width"],
            label: t("chartConfig.common.width"),
            defaultValue: getDefaultValue(["splitLine", "lineStyle", "width"]),
            min: 0,
            max: 20,
            step: 1,
          },
          {
            type: "select",
            keys: ["splitLine", "lineStyle", "type"],
            label: t("chartConfig.line.style"),
            defaultValue: getDefaultValue(["splitLine", "lineStyle", "type"]),
            options: [
              { label: t("chartConfig.line.solid"), value: "solid" },
              { label: t("chartConfig.line.dashed"), value: "dashed" },
              { label: t("chartConfig.line.dotted"), value: "dotted" },
            ],
          },
          {
            type: "inputNumber",
            keys: ["splitLine", "lineStyle", "opacity"],
            label: t("chartConfig.common.opacity"),
            defaultValue: getDefaultValue([
              "splitLine",
              "lineStyle",
              "opacity",
            ]),
            min: 0,
            max: 1,
            step: 0.1,
          },
        ],
      },
      {
        key: "splitArea",
        title: t("chartConfig.chartTypes.radarExt.splitArea"),
        configs: [
          {
            type: "switch",
            keys: ["splitArea", "show"],
            label: t("chartConfig.common.show"),
            defaultValue: getDefaultValue(["splitArea", "show"]),
          },
          {
            type: "colorPicker",
            keys: ["splitArea", "areaStyle", "color", "0"],
            label: t("chartConfig.chartTypes.radarExt.color1"),
            defaultValue: getDefaultValue([
              "splitArea",
              "areaStyle",
              "color",
            ])?.[0],
            customRender: () => {
              const areaStyle =
                (radarConfig as any)?.splitArea?.areaStyle || {};
              const defaultColors = getDefaultValue([
                "splitArea",
                "areaStyle",
                "color",
              ]) || ["rgba(250, 250, 250, 1)", "rgba(200, 200, 200, 0.1)"];
              const colors = areaStyle.color || defaultColors;
              return (
                <ColorPicker
                  value={colors[0] || defaultColors[0]}
                  onChange={(color) => handleSplitAreaColorChange.run(0, color)}
                  className={styles.colorPicker}
                />
              );
            },
          },
          {
            type: "colorPicker",
            keys: ["splitArea", "areaStyle", "color", "1"],
            label: t("chartConfig.chartTypes.radarExt.color2"),
            defaultValue: getDefaultValue([
              "splitArea",
              "areaStyle",
              "color",
            ])?.[1],
            customRender: () => {
              const areaStyle =
                (radarConfig as any)?.splitArea?.areaStyle || {};
              const defaultColors = getDefaultValue([
                "splitArea",
                "areaStyle",
                "color",
              ]) || ["rgba(250, 250, 250, 1)", "rgba(200, 200, 200, 0.1)"];
              const colors = areaStyle.color || defaultColors;
              return (
                <ColorPicker
                  value={colors[1] || defaultColors[1]}
                  onChange={(color) => handleSplitAreaColorChange.run(1, color)}
                  className={styles.colorPicker}
                />
              );
            },
          },
        ],
      },
      {
        key: "axisLine",
        title: t("chartConfig.chartTypes.radarExt.axisLine"),
        configs: [
          {
            type: "colorPicker",
            keys: ["axisLine", "lineStyle", "color"],
            label: t("chartConfig.common.color"),
            defaultValue: getDefaultValue(["axisLine", "lineStyle", "color"]),
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "width"],
            label: t("chartConfig.common.width"),
            defaultValue: getDefaultValue(["axisLine", "lineStyle", "width"]),
            min: 0,
            max: 20,
            step: 1,
          },
          {
            type: "select",
            keys: ["axisLine", "lineStyle", "type"],
            label: t("chartConfig.line.style"),
            defaultValue: getDefaultValue(["axisLine", "lineStyle", "type"]),
            options: [
              { label: t("chartConfig.line.solid"), value: "solid" },
              { label: t("chartConfig.line.dashed"), value: "dashed" },
              { label: t("chartConfig.line.dotted"), value: "dotted" },
            ],
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "opacity"],
            label: t("chartConfig.common.opacity"),
            defaultValue: getDefaultValue(["axisLine", "lineStyle", "opacity"]),
            min: 0,
            max: 1,
            step: 0.1,
          },
          {
            type: "colorPicker",
            keys: ["axisLine", "lineStyle", "shadowColor"],
            label: t("chartConfig.shadow.color"),
            defaultValue: getDefaultValue([
              "axisLine",
              "lineStyle",
              "shadowColor",
            ]),
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowBlur"],
            label: t("chartConfig.shadow.blur"),
            defaultValue: getDefaultValue([
              "axisLine",
              "lineStyle",
              "shadowBlur",
            ]),
            min: 0,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowOffsetX"],
            label: t("chartConfig.shadow.offsetX"),
            defaultValue: getDefaultValue([
              "axisLine",
              "lineStyle",
              "shadowOffsetX",
            ]),
            min: -50,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["axisLine", "lineStyle", "shadowOffsetY"],
            label: t("chartConfig.shadow.offsetY"),
            defaultValue: getDefaultValue([
              "axisLine",
              "lineStyle",
              "shadowOffsetY",
            ]),
            min: -50,
            max: 50,
          },
        ],
      },
    ];
  }, [
    t,
    radius,
    handleRadiusChange,
    centerX,
    handleCenterXChange,
    centerY,
    handleCenterYChange,
    radarConfig,
    handleSplitAreaColorChange,
  ]);

  const content = (
    <div className="w-[400px] max-h-[600px] overflow-y-auto box-border p-[15px]">
      <Collapse
        items={panelConfigs.map((panel) => ({
          key: panel.key,
          label: panel.title,
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
        defaultActiveKey={["basic"]}
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
          title={t("chartConfig.line.style")}
          aspectRatio
          icon={<RadarChart theme="outline" size="18" fill="#333" />}
        />
      </div>
    </Popover>
  );
});
