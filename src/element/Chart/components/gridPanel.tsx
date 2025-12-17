import { PanelLargeButton } from "@/components";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { GridFour } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { Collapse, ColorPicker, InputNumber, Popover, Switch } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import type { IChartProps } from "../index";
import styles from "./panel.module.less";

export const GridPanel: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  if (!pageId || !elementId) return null;

  const chartInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IChartProps | null;

  if (!chartInfo) return null;

  // 获取 grid 配置，如果没有则使用默认值
  const gridConfig = chartInfo.option?.grid || {
    show: true,
    left: 20,
    right: 20,
    top: 40,
    bottom: 20,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowBlur: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    backgroundColor: "#fff",
  };

  // 更新 grid 配置的通用函数
  const handleGridChange = useMemoizedFn((path: string[], value: any) => {
    const updatedGrid = { ...gridConfig };
    let current: any = updatedGrid;

    // 遍历路径，创建嵌套对象
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // 设置最终值
    current[path[path.length - 1]] = value;

    // 更新 option.grid
    const updatedOption = {
      ...chartInfo.option,
      grid: updatedGrid,
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
        handleGridChange(
          keys,
          `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`
        );
      } else {
        handleGridChange(keys, color.toHexString());
      }
    },
    { wait: 300 }
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
          },
          {
            type: "inputNumber",
            keys: ["left"],
            label: "左边距",
            defaultValue: 20,
            min: 0,
            max: 500,
          },
          {
            type: "inputNumber",
            keys: ["right"],
            label: "右边距",
            defaultValue: 20,
            min: 0,
            max: 500,
          },
          {
            type: "inputNumber",
            keys: ["top"],
            label: "上边距",
            defaultValue: 40,
            min: 0,
            max: 500,
          },
          {
            type: "inputNumber",
            keys: ["bottom"],
            label: "下边距",
            defaultValue: 20,
            min: 0,
            max: 500,
          },
          {
            type: "colorPicker",
            keys: ["backgroundColor"],
            label: "背景颜色",
            defaultValue: "#fff",
          },
        ],
      },
      {
        key: "shadow",
        title: "阴影设置",
        configs: [
          {
            type: "colorPicker",
            keys: ["shadowColor"],
            label: "阴影颜色",
            defaultValue: "rgba(0, 0, 0, 0.5)",
          },
          {
            type: "inputNumber",
            keys: ["shadowBlur"],
            label: "阴影模糊",
            defaultValue: 10,
            min: 0,
            max: 100,
          },
          {
            type: "inputNumber",
            keys: ["shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: 0,
            min: -100,
            max: 100,
          },
          {
            type: "inputNumber",
            keys: ["shadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: 0,
            min: -100,
            max: 100,
          },
        ],
      },
    ],
    []
  );

  // 根据配置获取值
  const getValue = useMemoizedFn((keys: string[], defaultValue?: any) => {
    let current: any = gridConfig;
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
            onChange={(checked) => handleGridChange(keys, checked)}
          />
        );
      case "inputNumber":
        return (
          <InputNumber
            value={value ?? defaultValue ?? 0}
            onChange={(val) => handleGridChange(keys, val ?? defaultValue ?? 0)}
            min={props.min}
            max={props.max}
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
      trigger="click"
      placement="bottom"
      overlayInnerStyle={{ padding: 0 }}
    >
      <div className="h-full">
        <PanelLargeButton
          title="网格"
          icon={<GridFour theme="outline" size="18" fill="#333" />}
        />
      </div>
    </Popover>
  );
});
