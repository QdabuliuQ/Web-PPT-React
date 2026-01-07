import { PanelLargeButton, PanelNumberOrAuto, PanelSelect } from "@/components";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import {
  Collapse,
  ColorPicker,
  Input,
  InputNumber,
  Popover,
  Slider,
  Switch,
} from "antd";
import { type FC, type ReactNode } from "react";
import styles from "./panel.module.less";

export interface PanelConfig {
  key: string;
  title: string;
  configs: Array<{
    type: string;
    keys: string[];
    label: string;
    defaultValue?: any;
    customRender?: (config: any) => ReactNode;
    onChange?: (value: any, keys: string[]) => void;
    getValue?: (keys: string[], defaultValue?: any) => any;
    [key: string]: any;
  }>;
}

export interface ChartStylePanelProps {
  title: string;
  icon: ReactNode;
  panelConfigs: PanelConfig[];
  getValue?: (keys: string[], defaultValue?: any) => any;
  defaultActiveKey?: string[];
}

export const ChartStylePanel: FC<ChartStylePanelProps> = ({
  title,
  icon,
  panelConfigs,
  getValue: externalGetValue,
  defaultActiveKey = ["basic"],
}) => {
  // ColorPicker 防抖处理函数
  const handleColorChangeDebounced = useDebounceFn(
    (config: any, color: any) => {
      const colorObj = color.toRgb();
      const colorValue =
        colorObj.a !== 1
          ? `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
          : color.toHexString();

      // 调用配置项的 onChange
      if (config.onChange) {
        config.onChange(colorValue, config.keys);
      }
    },
    { wait: 300 }
  );

  // 渲染配置项组件
  const renderConfigItem = useMemoizedFn((config: any) => {
    const {
      type,
      keys,
      defaultValue,
      onChange,
      getValue: configGetValue,
      ...props
    } = config;

    // 优先使用 config 级别的 getValue，然后是外部传入的 getValue
    const getValueFn = configGetValue || externalGetValue;
    const value = getValueFn ? getValueFn(keys, defaultValue) : defaultValue;

    // 统一的 onChange 处理函数
    const handleChange = (newValue: any) => {
      // 如果配置项有自定义 onChange，调用它
      if (onChange) {
        onChange(newValue, keys);
      }
    };

    // ColorPicker 的特殊处理（需要防抖）
    const handleColorChangeWithCallback = (color: any) => {
      handleColorChangeDebounced.run(config, color);
    };

    switch (type) {
      case "switch":
        return (
          <Switch
            checked={value !== false}
            style={{ width: "40px" }}
            onChange={(checked) => handleChange(checked)}
          />
        );
      case "input":
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={props.placeholder}
            style={{ fontSize: "12px", width: "100%", height: "32px" }}
            className="[&::placeholder]:text-[12px]"
            maxLength={props.maxLength}
          />
        );
      case "inputNumber":
        return (
          <InputNumber
            value={value ?? defaultValue ?? 0}
            onChange={(val) => handleChange(val ?? defaultValue ?? 0)}
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
            onChange={handleColorChangeWithCallback}
            className={styles.colorPicker}
          />
        );
      case "select":
        return (
          <PanelSelect
            value={value ?? defaultValue}
            onChange={(val) => handleChange(val)}
            options={props.options}
            style={{ width: "100%" }}
          />
        );
      case "numberOrAuto":
        return (
          <PanelNumberOrAuto
            value={value ?? defaultValue ?? 0}
            onChange={(val) => handleChange(val)}
            min={props.min}
            max={props.max}
            step={props.step}
            formatter={props.formatter}
            parser={props.parser}
            style={{ width: "100%" }}
          />
        );
      case "slider":
        return (
          <Slider
            value={value ?? defaultValue ?? 0}
            onChange={(val) => handleChange(val)}
            min={props.min ?? 0}
            max={props.max ?? 1}
            step={props.step ?? 0.1}
            tooltip={{ open: false }}
            style={{ width: "90%" }}
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
          label: <span className="text-[12px]">{panel.title}</span>,
          children: (
            <div className="grid grid-cols-3 gap-[10px]">
              {panel.configs.map((config, index) => (
                <div key={index} className="flex flex-col gap-[5px]">
                  <label className="text-[12px] text-gray-600">
                    {config.label}
                  </label>
                  {config.customRender
                    ? config.customRender(config)
                    : renderConfigItem(config)}
                </div>
              ))}
            </div>
          ),
        }))}
        defaultActiveKey={defaultActiveKey}
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
        <PanelLargeButton title={title} aspectRatio icon={icon} />
      </div>
    </Popover>
  );
};
