import { PanelLargeButton, PanelNumberOrAuto, PanelSelect } from "@/components";
import { useChartInspectorStore } from "@/store/zustand/chartInspectorStore";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import {
  Collapse,
  ColorPicker,
  Input,
  InputNumber,
  Slider,
  Switch,
} from "antd";
import { memo, type FC, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  /** 右侧面板分区 key，默认使用 title */
  sectionKey?: string;
}

const FULL_WIDTH_TYPES = new Set(["input", "slider", "numberOrAuto"]);

export const ChartStyleForm: FC<{
  panelConfigs: PanelConfig[];
  getValue?: (keys: string[], defaultValue?: any) => any;
  defaultActiveKey?: string[];
}> = memo(
  ({
    panelConfigs,
    getValue: externalGetValue,
    defaultActiveKey = ["basic"],
  }) => {
    const handleColorChangeDebounced = useDebounceFn(
      (config: any, color: any) => {
        const colorObj = color.toRgb();
        const colorValue =
          colorObj.a !== 1
            ? `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
            : color.toHexString();

        if (config.onChange) {
          config.onChange(colorValue, config.keys);
        }
      },
      { wait: 300 }
    );

    const renderConfigItem = useMemoizedFn((config: any) => {
      const {
        type,
        keys,
        defaultValue,
        onChange,
        getValue: configGetValue,
        ...props
      } = config;

      const getValueFn = configGetValue || externalGetValue;
      const value = getValueFn ? getValueFn(keys, defaultValue) : defaultValue;

      const handleChange = (newValue: any) => {
        if (onChange) {
          onChange(newValue, keys);
        }
      };

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
              style={{ width: "100%" }}
            />
          );
        default:
          return null;
      }
    });

    return (
      <div className={styles.inspectorForm}>
        <Collapse
          items={panelConfigs.map((panel) => ({
            key: panel.key,
            label: <span className="text-[12px]">{panel.title}</span>,
            children: (
              <div className={styles.inspectorFormGrid}>
                {panel.configs.map((config, index) => (
                  <div
                    key={index}
                    className={`${styles.inspectorFormItem} ${
                      FULL_WIDTH_TYPES.has(config.type) || config.customRender
                        ? styles.inspectorFormItemFull
                        : ""
                    }`}
                  >
                    <label className={styles.inspectorFormLabel}>
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
  }
);

export const ChartStylePanel: FC<ChartStylePanelProps> = memo(
  ({
    title,
    icon,
    panelConfigs,
    getValue: externalGetValue,
    defaultActiveKey = ["basic"],
    sectionKey: sectionKeyProp,
  }) => {
    const sectionKey = sectionKeyProp || title;
    const activeSection = useChartInspectorStore((state) => state.sectionKey);
    const contentEl = useChartInspectorStore((state) => state.contentEl);
    const toggleSection = useChartInspectorStore(
      (state) => state.toggleSection
    );
    const isActive = activeSection === sectionKey;

    const form = (
      <ChartStyleForm
        panelConfigs={panelConfigs}
        getValue={externalGetValue}
        defaultActiveKey={defaultActiveKey}
      />
    );

    return (
      <>
        <div className="h-full">
          <PanelLargeButton
            title={title}
            icon={icon}
            active={isActive}
            onClick={() => toggleSection(sectionKey, title)}
          />
        </div>
        {isActive && contentEl ? createPortal(form, contentEl) : null}
      </>
    );
  }
);
