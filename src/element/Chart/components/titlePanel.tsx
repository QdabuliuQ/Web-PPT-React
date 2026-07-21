import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { H } from "@icon-park/react";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { memo, useMemo, type FC } from "react";
import { useTranslation } from "react-i18next";
import { getTitleDefaultOption } from "../common";
import type { IChartProps } from "../index";
import { ChartStylePanel } from "./chartStylePanel";

export const TitlePanel: FC = memo(() => {
  const { t } = useTranslation();

  // 使用 Zustand hooks 订阅状态变化
  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const setElementInfo = usePPTStore((state) => state.setElementInfo);

  // 直接订阅 chartInfo，这样当 pages 变化时组件会重新渲染
  const chartInfo = usePPTStore((state) => {
    if (!pageId || !elementId) return null;
    const page = state.pages.find((p) => p.id === pageId);
    const element = page?.elements.find((el) => el.id === elementId);
    return (element as IChartProps) || null;
  });

  // 获取 title 配置，如果没有则使用默认值
  // 使用 useMemo 确保引用稳定性
  const titleConfig = useMemo(() => {
    return chartInfo?.option?.title || getTitleDefaultOption();
  }, [chartInfo]);

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

    // 更新 option.title
    if (!chartInfo || !pageId || !elementId) return;
    const updatedOption = {
      ...chartInfo.option,
      title: updatedTitle,
    };

    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // ColorPicker 防抖处理函数
  const handleColorChange = useDebounceFn(
    (keys: string[], color: any) => {
      handleTitleChange(keys, color.toHexString());
    },
    { wait: 300 }
  );

  // 通用的 onChange 处理函数
  const handleConfigChange = useMemoizedFn((value: any, keys: string[]) => {
    handleTitleChange(keys, value);
  });

  // ColorPicker 的 onChange 处理函数（需要防抖）
  const handleColorConfigChange = useMemoizedFn(
    (value: any, keys: string[]) => {
      handleColorChange.run(keys, value);
    }
  );

  // 配置数组
  const panelConfigs = useMemo(() => {
    // 获取默认配置
    const defaultTitleConfig = getTitleDefaultOption();

    // 从默认配置获取值的辅助函数
    const getDefaultValue = (keys: string[]) => {
      let current: any = defaultTitleConfig;
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
            type: "input",
            keys: ["text"],
            label: "主标题",
            placeholder: "请输入主标题",
            defaultValue: getDefaultValue(["text"]),
            onChange: handleConfigChange,
          },
          {
            type: "input",
            keys: ["subtext"],
            label: "副标题",
            placeholder: "请输入副标题",
            defaultValue: getDefaultValue(["subtext"]),
            onChange: handleConfigChange,
          },
          {
            type: "switch",
            keys: ["show"],
            label: "显示",
            defaultValue: getDefaultValue(["show"]),
            onChange: handleConfigChange,
          },
          {
            type: "numberOrAuto",
            keys: ["left"],
            label: "左边距",
            min: 0,
            max: 2000,
            defaultValue: getDefaultValue(["left"]),
            onChange: handleConfigChange,
          },
          {
            type: "numberOrAuto",
            keys: ["top"],
            label: "上边距",
            min: 0,
            max: 2000,
            defaultValue: getDefaultValue(["top"]),
            onChange: handleConfigChange,
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
            defaultValue: getDefaultValue(["textStyle", "color"]),
            onChange: handleColorConfigChange,
          },
          {
            type: "select",
            keys: ["textStyle", "fontStyle"],
            label: "字体样式",
            defaultValue: getDefaultValue(["textStyle", "fontStyle"]),
            options: [
              { label: "正常", value: "normal" },
              { label: "斜体", value: "italic" },
              { label: "倾斜", value: "oblique" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["textStyle", "fontWeight"],
            label: "字体粗细",
            defaultValue: getDefaultValue(["textStyle", "fontWeight"]),
            options: [
              { label: "正常", value: "normal" },
              { label: "粗体", value: "bold" },
              { label: "加粗", value: "bolder" },
              { label: "细体", value: "lighter" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "fontSize"],
            label: "字体大小",
            defaultValue: getDefaultValue(["textStyle", "fontSize"]),
            min: 1,
            max: 100,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["textStyle", "textShadowColor"],
            label: "阴影颜色",
            defaultValue: getDefaultValue(["textStyle", "textShadowColor"]),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowBlur"],
            label: "阴影模糊",
            defaultValue: getDefaultValue(["textStyle", "textShadowBlur"]),
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: getDefaultValue(["textStyle", "textShadowOffsetX"]),
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["textStyle", "textShadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: getDefaultValue(["textStyle", "textShadowOffsetY"]),
            min: -50,
            max: 50,
            onChange: handleConfigChange,
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
            defaultValue: getDefaultValue(["subtextStyle", "color"]),
            onChange: handleColorConfigChange,
          },
          {
            type: "select",
            keys: ["subtextStyle", "fontStyle"],
            label: "字体样式",
            defaultValue: getDefaultValue(["subtextStyle", "fontStyle"]),
            options: [
              { label: "正常", value: "normal" },
              { label: "斜体", value: "italic" },
              { label: "倾斜", value: "oblique" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["subtextStyle", "fontWeight"],
            label: "字体粗细",
            defaultValue: getDefaultValue(["subtextStyle", "fontWeight"]),
            options: [
              { label: "正常", value: "normal" },
              { label: "粗体", value: "bold" },
              { label: "更粗", value: "bolder" },
              { label: "更细", value: "lighter" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["subtextStyle", "fontSize"],
            label: "字体大小",
            defaultValue: getDefaultValue(["subtextStyle", "fontSize"]),
            min: 1,
            max: 100,
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["subtextStyle", "textShadowColor"],
            label: "阴影颜色",
            defaultValue: getDefaultValue(["subtextStyle", "textShadowColor"]),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["subtextStyle", "textShadowBlur"],
            label: "阴影模糊",
            defaultValue: getDefaultValue(["subtextStyle", "textShadowBlur"]),
            min: 0,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["subtextStyle", "textShadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: getDefaultValue([
              "subtextStyle",
              "textShadowOffsetX",
            ]),
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["subtextStyle", "textShadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: getDefaultValue([
              "subtextStyle",
              "textShadowOffsetY",
            ]),
            min: -50,
            max: 50,
            onChange: handleConfigChange,
          },
        ],
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleColorConfigChange, handleConfigChange, chartInfo]);

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

  if (!pageId || !elementId || !chartInfo) return null;

  return (
    <ChartStylePanel
      sectionKey="title"
      title={t("chartConfig.sections.title")}
      icon={<H theme="outline" size="18" fill="var(--icon-color)" />}
      panelConfigs={panelConfigs}
      getValue={getValue}
      defaultActiveKey={["basic"]}
    />
  );
});
