import { PanelLargeButton } from "@/components";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { H } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import {
  Collapse,
  ColorPicker,
  Input,
  InputNumber,
  Popover,
  Select,
  Switch,
} from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import type { IChartProps } from "../index";

export const TitlePanel: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  if (!pageId || !elementId) return null;

  const chartInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IChartProps | null;

  if (!chartInfo) return null;

  // 获取 title 配置，如果没有则使用默认值
  const titleConfig = chartInfo.title || {
    text: "标题",
    subtext: "",
    show: true,
    textStyle: {
      color: "#333",
      fontStyle: "normal",
      fontWeight: "bold",
      fontSize: 18,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    subtextStyle: {
      color: "#aaa",
      fontStyle: "normal",
      fontWeight: "bold",
      fontSize: 12,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };

  // 更新 title 配置的通用函数
  const handleTitleChange = useMemoizedFn((path: string[], value: any) => {
    const updatedTitle = { ...titleConfig };
    let current: any = updatedTitle;

    // 遍历路径，创建嵌套对象
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // 设置最终值
    current[path[path.length - 1]] = value;

    pptStore.setElementInfo(pageId, elementId, {
      ...chartInfo,
      title: updatedTitle,
    });
  });

  // 配置数组
  const panelConfigs = useMemo(
    () => [
      {
        key: "basic",
        title: "基础设置",
        configs: [
          {
            type: "input",
            keys: ["text"],
            label: "主标题",
            placeholder: "请输入主标题",
          },
          {
            type: "input",
            keys: ["subtext"],
            label: "副标题",
            placeholder: "请输入副标题",
          },
          {
            type: "switch",
            keys: ["show"],
            label: "显示",
          },
          {
            type: "inputNumber",
            keys: ["left"],
            label: "左边距",
            min: -2000,
            max: 2000,
          },
          {
            type: "inputNumber",
            keys: ["top"],
            label: "上边距",
            min: -2000,
            max: 2000,
          },
        ],
      },
      {
        key: "textStyle",
        title: "主标题样式",
        configs: [
          {
            type: "colorPicker",
            keys: ["textStyle", "color"],
            label: "颜色",
            defaultValue: "#333",
          },
          {
            type: "select",
            keys: ["textStyle", "fontStyle"],
            label: "字体样式",
            defaultValue: "normal",
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
            defaultValue: "bold",
            options: [
              { label: "正常", value: "normal" },
              { label: "粗体", value: "bold" },
              { label: "加粗", value: "bolder" },
              { label: "细体", value: "lighter" },
            ],
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "fontSize"],
            label: "字体大小",
            defaultValue: 18,
            min: 1,
            max: 100,
          },
          {
            type: "colorPicker",
            keys: ["textStyle", "textShadowColor"],
            label: "阴影颜色",
            defaultValue: "transparent",
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowBlur"],
            label: "阴影模糊",
            defaultValue: 0,
            min: 0,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
          },
        ],
      },
      {
        key: "subtextStyle",
        title: "副标题样式",
        configs: [
          {
            type: "colorPicker",
            keys: ["subtextStyle", "color"],
            label: "颜色",
            defaultValue: "#aaa",
          },
          {
            type: "select",
            keys: ["subtextStyle", "fontStyle"],
            label: "字体样式",
            defaultValue: "normal",
            options: [
              { label: "正常", value: "normal" },
              { label: "斜体", value: "italic" },
              { label: "倾斜", value: "oblique" },
            ],
          },
          {
            type: "select",
            keys: ["subtextStyle", "fontWeight"],
            label: "字体粗细",
            defaultValue: "bold",
            options: [
              { label: "正常", value: "normal" },
              { label: "粗体", value: "bold" },
              { label: "更粗", value: "bolder" },
              { label: "更细", value: "lighter" },
            ],
          },
          {
            type: "inputNumber",
            keys: ["subtextStyle", "fontSize"],
            label: "字体大小",
            defaultValue: 12,
            min: 1,
            max: 100,
          },
          {
            type: "colorPicker",
            keys: ["subtextStyle", "textShadowColor"],
            label: "阴影颜色",
            defaultValue: "transparent",
          },
          {
            type: "inputNumber",
            keys: ["subtextStyle", "textShadowBlur"],
            label: "阴影模糊",
            defaultValue: 0,
            min: 0,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["subtextStyle", "textShadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
          },
          {
            type: "inputNumber",
            keys: ["subtextStyle", "textShadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: 0,
            min: -50,
            max: 50,
          },
        ],
      },
    ],
    []
  );

  // 根据配置获取值
  const getValue = useMemoizedFn((keys: string[], defaultValue?: any) => {
    let current: any = titleConfig;
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
      case "input":
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleTitleChange(keys, e.target.value)}
            placeholder={props.placeholder}
            style={{ fontSize: "12px" }}
            className="[&::placeholder]:text-[12px]"
            maxLength={30}
          />
        );
      case "switch":
        return (
          <Switch
            checked={value !== false}
            style={{ width: "40px" }}
            onChange={(checked) => handleTitleChange(keys, checked)}
          />
        );
      case "inputNumber":
        return (
          <InputNumber
            value={value ?? defaultValue ?? 0}
            onChange={(val) =>
              handleTitleChange(keys, val ?? defaultValue ?? 0)
            }
            min={props.min}
            max={props.max}
            style={{ width: "100%" }}
          />
        );
      case "select":
        return (
          <Select
            value={value ?? defaultValue}
            onChange={(val) => handleTitleChange(keys, val)}
            options={props.options}
            trigger="hover"
          />
        );
      case "colorPicker":
        return (
          <ColorPicker
            value={value ?? defaultValue}
            onChange={(color) => handleTitleChange(keys, color.toHexString())}
            showText
            style={{ fontSize: "12px" }}
            className="[&_.ant-color-picker-trigger-text]:text-[12px]"
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
            <div
              className={
                panel.key === "basic"
                  ? "flex flex-col gap-[10px]"
                  : "grid grid-cols-3 gap-[10px]"
              }
            >
              {panel.key === "basic" ? (
                <>
                  <div className="grid grid-cols-3 gap-[10px]">
                    {panel.configs.slice(0, 3).map((config, index) => (
                      <div key={index} className="flex flex-col gap-[5px]">
                        <label className="text-[12px] text-gray-600">
                          {config.label}
                        </label>
                        {renderConfigItem(config)}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-[10px]">
                    {panel.configs.slice(3).map((config, index) => (
                      <div key={index} className="flex flex-col gap-[5px]">
                        <label className="text-[12px] text-gray-600">
                          {config.label}
                        </label>
                        {renderConfigItem(config)}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                panel.configs.map((config, index) => (
                  <div key={index} className="flex flex-col gap-[5px]">
                    <label className="text-[12px] text-gray-600">
                      {config.label}
                    </label>
                    {renderConfigItem(config)}
                  </div>
                ))
              )}
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
          title="标题"
          icon={<H theme="outline" size="18" fill="#333" />}
        />
      </div>
    </Popover>
  );
});
