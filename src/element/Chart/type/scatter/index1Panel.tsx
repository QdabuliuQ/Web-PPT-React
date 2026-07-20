import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { ChartScatter } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { memo, useMemo, type FC } from "react";
import { ChartStylePanel } from "../../components/chartStylePanel";
import type { IChartProps } from "../../index";

export const Scatter1ChartPanel: FC = memo(() => {
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

  // 获取 series 配置，如果没有则使用默认值
  const seriesOption = chartInfo?.option?.series;
  const seriesConfig = Array.isArray(seriesOption)
    ? seriesOption[0] || {}
    : seriesOption || {};

  // 更新 series 配置的函数
  const handleSeriesChange = useMemoizedFn((path: string[], value: any) => {
    if (!chartInfo || !pageId || !elementId) return;

    // 使用浅拷贝
    const updatedSeries = { ...seriesConfig };
    let current: any = updatedSeries;

    // 遍历路径，创建嵌套对象（需要拷贝嵌套对象以确保不修改原对象）
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      } else {
        // 如果嵌套对象已存在，需要拷贝它
        current[path[i]] = { ...current[path[i]] };
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

    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // 通用的 onChange 处理函数
  const handleConfigChange = useMemoizedFn((value: any, keys: string[]) => {
    handleSeriesChange(keys, value);
  });

  // ColorPicker 的 onChange 处理函数
  const handleColorConfigChange = useMemoizedFn(
    (value: any, keys: string[]) => {
      handleSeriesChange(keys, value);
    }
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

  // 配置数组 - 使用 useMemo 确保在依赖变化时重新计算
  const panelConfigs = useMemo(
    () => [
      {
        key: "basic",
        title: "基础设置",
        configs: [
          {
            type: "inputNumber",
            keys: ["symbolSize"],
            label: "符号大小",
            defaultValue: getValue(["symbolSize"], 8),
            onChange: handleConfigChange,
            min: 1,
            max: 100,
            step: 1,
          },
        ],
      },
      {
        key: "label",
        title: "标签设置",
        configs: [
          {
            type: "switch",
            keys: ["label", "show"],
            label: "显示标签",
            defaultValue: getValue(["label", "show"], true),
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["label", "position"],
            label: "标签位置",
            defaultValue: getValue(["label", "position"], "top"),
            onChange: handleConfigChange,
            options: [
              { label: "顶部", value: "top" },
              { label: "左侧", value: "left" },
              { label: "右侧", value: "right" },
              { label: "底部", value: "bottom" },
              { label: "内部", value: "inside" },
              { label: "内左", value: "insideLeft" },
              { label: "内右", value: "insideRight" },
              { label: "内顶", value: "insideTop" },
              { label: "内底", value: "insideBottom" },
              { label: "内左上", value: "insideTopLeft" },
              { label: "内左下", value: "insideBottomLeft" },
              { label: "内右上", value: "insideTopRight" },
              { label: "内右下", value: "insideBottomRight" },
            ],
          },
          {
            type: "colorPicker",
            keys: ["label", "color"],
            label: "标签颜色",
            defaultValue: getValue(["label", "color"], "#333"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "distance"],
            label: "距离",
            defaultValue: getValue(["label", "distance"], 5),
            onChange: handleConfigChange,
            min: 0,
            max: 50,
            step: 1,
          },
          {
            type: "inputNumber",
            keys: ["label", "rotate"],
            label: "旋转角度",
            defaultValue: getValue(["label", "rotate"], 0),
            onChange: handleConfigChange,
            min: -180,
            max: 180,
            step: 1,
          },
          {
            type: "inputNumber",
            keys: ["label", "fontSize"],
            label: "字体大小",
            defaultValue: getValue(["label", "fontSize"], 12),
            onChange: handleConfigChange,
            min: 8,
            max: 72,
            step: 1,
          },
          {
            type: "select",
            keys: ["label", "fontStyle"],
            label: "字体样式",
            defaultValue: getValue(["label", "fontStyle"], "normal"),
            onChange: handleConfigChange,
            options: [
              { label: "正常", value: "normal" },
              { label: "斜体", value: "italic" },
              { label: "倾斜", value: "oblique" },
            ],
          },
          {
            type: "select",
            keys: ["label", "fontWeight"],
            label: "字体粗细",
            defaultValue: getValue(["label", "fontWeight"], "normal"),
            onChange: handleConfigChange,
            options: [
              { label: "正常", value: "normal" },
              { label: "粗体", value: "bold" },
              { label: "更粗", value: "bolder" },
              { label: "更细", value: "lighter" },
            ],
          },
          {
            type: "colorPicker",
            keys: ["label", "textShadowColor"],
            label: "阴影颜色",
            defaultValue: getValue(["label", "textShadowColor"], "transparent"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowBlur"],
            label: "阴影模糊",
            defaultValue: getValue(["label", "textShadowBlur"], 0),
            onChange: handleConfigChange,
            min: 0,
            max: 50,
            step: 1,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: getValue(["label", "textShadowOffsetX"], 0),
            onChange: handleConfigChange,
            min: -50,
            max: 50,
            step: 1,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: getValue(["label", "textShadowOffsetY"], 0),
            onChange: handleConfigChange,
            min: -50,
            max: 50,
            step: 1,
          },
        ],
      },
      {
        key: "labelLine",
        title: "引导线设置",
        configs: [
          {
            type: "switch",
            keys: ["labelLine", "show"],
            label: "显示引导线",
            defaultValue: getValue(["labelLine", "show"], false),
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "length2"],
            label: "第二段长度",
            defaultValue: getValue(["labelLine", "length2"], 0),
            onChange: handleConfigChange,
            min: 0,
            max: 100,
            step: 1,
          },
          {
            type: "switch",
            keys: ["labelLine", "smooth"],
            label: "平滑曲线",
            defaultValue: getValue(["labelLine", "smooth"], false),
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["labelLine", "lineStyle", "color"],
            label: "线条颜色",
            defaultValue: getValue(["labelLine", "lineStyle", "color"], "#000"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "lineStyle", "width"],
            label: "线条宽度",
            defaultValue: getValue(["labelLine", "lineStyle", "width"], 1),
            onChange: handleConfigChange,
            min: 0,
            max: 10,
            step: 0.5,
          },
          {
            type: "select",
            keys: ["labelLine", "lineStyle", "type"],
            label: "线条类型",
            defaultValue: getValue(["labelLine", "lineStyle", "type"], "solid"),
            onChange: handleConfigChange,
            options: [
              { label: "实线", value: "solid" },
              { label: "虚线", value: "dashed" },
              { label: "点线", value: "dotted" },
            ],
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "lineStyle", "shadowBlur"],
            label: "阴影模糊",
            defaultValue: getValue(["labelLine", "lineStyle", "shadowBlur"], 0),
            onChange: handleConfigChange,
            min: 0,
            max: 50,
            step: 1,
          },
          {
            type: "colorPicker",
            keys: ["labelLine", "lineStyle", "shadowColor"],
            label: "阴影颜色",
            defaultValue: getValue(
              ["labelLine", "lineStyle", "shadowColor"],
              "transparent"
            ),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "lineStyle", "shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: getValue(
              ["labelLine", "lineStyle", "shadowOffsetX"],
              0
            ),
            onChange: handleConfigChange,
            min: -50,
            max: 50,
            step: 1,
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "lineStyle", "shadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: getValue(
              ["labelLine", "lineStyle", "shadowOffsetY"],
              0
            ),
            onChange: handleConfigChange,
            min: -50,
            max: 50,
            step: 1,
          },
          {
            type: "slider",
            keys: ["labelLine", "lineStyle", "opacity"],
            label: "不透明度",
            defaultValue: getValue(["labelLine", "lineStyle", "opacity"], 1),
            onChange: handleConfigChange,
            min: 0,
            max: 1,
            step: 0.1,
          },
        ],
      },
      {
        key: "itemStyle",
        title: "图形样式",
        configs: [
          {
            type: "colorPicker",
            keys: ["itemStyle", "borderColor"],
            label: "边框颜色",
            defaultValue: getValue(["itemStyle", "borderColor"], "transparent"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "borderWidth"],
            label: "边框宽度",
            defaultValue: getValue(["itemStyle", "borderWidth"], 1),
            onChange: handleConfigChange,
            min: 0,
            max: 10,
            step: 0.5,
          },
          {
            type: "select",
            keys: ["itemStyle", "borderType"],
            label: "边框类型",
            defaultValue: getValue(["itemStyle", "borderType"], "solid"),
            onChange: handleConfigChange,
            options: [
              { label: "实线", value: "solid" },
              { label: "虚线", value: "dashed" },
              { label: "点线", value: "dotted" },
            ],
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowBlur"],
            label: "阴影模糊",
            defaultValue: getValue(["itemStyle", "shadowBlur"], 0),
            onChange: handleConfigChange,
            min: 0,
            max: 50,
            step: 1,
          },
          {
            type: "colorPicker",
            keys: ["itemStyle", "shadowColor"],
            label: "阴影颜色",
            defaultValue: getValue(["itemStyle", "shadowColor"], "transparent"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: getValue(["itemStyle", "shadowOffsetX"], 0),
            onChange: handleConfigChange,
            min: -50,
            max: 50,
            step: 1,
          },
          {
            type: "inputNumber",
            keys: ["itemStyle", "shadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: getValue(["itemStyle", "shadowOffsetY"], 0),
            onChange: handleConfigChange,
            min: -50,
            max: 50,
            step: 1,
          },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getValue, handleConfigChange, handleColorConfigChange, seriesConfig]
  );

  if (!chartInfo) return null;

  return (
    <ChartStylePanel
      title="样式"
      icon={<ChartScatter theme="filled" size="18" fill="var(--text-muted)" />}
      panelConfigs={panelConfigs}
      getValue={getValue}
      defaultActiveKey={["basic", "label"]}
    />
  );
});
