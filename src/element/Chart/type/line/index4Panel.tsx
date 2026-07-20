import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { ChartLine } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { memo, useMemo, type FC } from "react";
import { ChartStylePanel } from "../../components/chartStylePanel";
import type { IChartProps } from "../../index";

export const Line4ChartPanel: FC = memo(() => {
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

  // 获取 series 配置，series 是数组
  const seriesOption = chartInfo?.option?.series;
  const seriesArray = useMemo(
    () => (Array.isArray(seriesOption) ? seriesOption : []),
    [seriesOption]
  );

  // 获取第一个 series 的配置作为模板（所有 line 的属性都一样，除了 step）
  const seriesConfig = useMemo(() => seriesArray[0] || {}, [seriesArray]);

  // 更新 series 配置的函数
  // 对于 step 属性，需要单独处理每个系列
  // 对于其他属性，统一更新所有系列
  const handleSeriesChange = useMemoizedFn((path: string[], value: any) => {
    if (seriesArray.length === 0 || !chartInfo || !pageId || !elementId) return;

    // 更新所有 series 项的相同属性
    const updatedSeriesArray = seriesArray.map((seriesItem: any) => {
      const updatedSeries = { ...seriesItem };
      let current: any = updatedSeries;

      // 遍历路径，创建嵌套对象
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }

      // 设置最终值
      current[path[path.length - 1]] = value;

      return updatedSeries;
    });

    // 更新 option.series
    const updatedOption = {
      ...chartInfo.option,
      series: updatedSeriesArray,
    };

    setElementInfo(pageId, elementId, {
      ...chartInfo,
      option: updatedOption,
    });
  });

  // 统一设置所有系列的 step 属性
  const handleStepChange = useMemoizedFn((value: any) => {
    if (seriesArray.length === 0 || !chartInfo || !pageId || !elementId) return;

    const stepValue = value as "start" | "middle" | "end";
    const updatedSeriesArray = seriesArray.map((seriesItem: any) => ({
      ...seriesItem,
      step: stepValue,
    }));

    const updatedOption = {
      ...chartInfo.option,
      series: updatedSeriesArray,
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
  // ChartStylePanel 已经将颜色对象转换为字符串，所以这里直接使用字符串值
  const handleColorConfigChange = useMemoizedFn(
    (value: any, keys: string[]) => {
      handleSeriesChange(keys, value);
    }
  );

  // 根据配置获取值（从第一个 series 获取，因为所有都一样）
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

  // 获取第一个系列的 step 值（用于显示当前 step 配置）
  const currentStep = useMemo(() => {
    return (seriesArray[0] as any)?.step || "start";
  }, [seriesArray]);

  // 配置数组
  const panelConfigs = useMemo(
    () => [
      {
        key: "basic",
        title: "基础设置",
        configs: [
          {
            type: "select",
            keys: ["step"],
            label: "阶梯类型",
            defaultValue: currentStep,
            options: [
              { label: "起点", value: "start" },
              { label: "中点", value: "middle" },
              { label: "终点", value: "end" },
            ],
            onChange: handleStepChange,
          },
          {
            type: "select",
            keys: ["symbol"],
            label: "标记形状",
            defaultValue: getValue(["symbol"], "circle"),
            options: [
              { label: "圆形", value: "circle" },
              { label: "矩形", value: "rect" },
              { label: "圆角矩形", value: "roundRect" },
              { label: "三角形", value: "triangle" },
              { label: "菱形", value: "diamond" },
              { label: "图钉", value: "pin" },
              { label: "箭头", value: "arrow" },
              { label: "无", value: "none" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["symbolSize"],
            label: "标记大小",
            defaultValue: getValue(["symbolSize"], 6),
            min: 0,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "lineStyle",
        title: "线条样式",
        configs: [
          {
            type: "inputNumber",
            keys: ["lineStyle", "width"],
            label: "宽度",
            defaultValue: getValue(["lineStyle", "width"], 2),
            min: 0,
            max: 20,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["lineStyle", "type"],
            label: "样式",
            defaultValue: getValue(["lineStyle", "type"], "solid"),
            options: [
              { label: "实线", value: "solid" },
              { label: "虚线", value: "dashed" },
              { label: "点线", value: "dotted" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["lineStyle", "shadowColor"],
            label: "阴影颜色",
            defaultValue: getValue(["lineStyle", "shadowColor"], "transparent"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["lineStyle", "shadowBlur"],
            label: "阴影模糊",
            defaultValue: getValue(["lineStyle", "shadowBlur"], 0),
            min: 0,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["lineStyle", "shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: getValue(["lineStyle", "shadowOffsetX"], 0),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["lineStyle", "shadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: getValue(["lineStyle", "shadowOffsetY"], 0),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "slider",
            keys: ["lineStyle", "opacity"],
            label: "透明度",
            defaultValue: getValue(["lineStyle", "opacity"], 1),
            min: 0,
            max: 1,
            step: 0.1,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "label",
        title: "标签",
        configs: [
          {
            type: "switch",
            keys: ["label", "show"],
            label: "显示",
            defaultValue: getValue(["label", "show"], false),
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["label", "position"],
            label: "位置",
            defaultValue: getValue(["label", "position"], "top"),
            options: [
              { label: "顶部", value: "top" },
              { label: "左侧", value: "left" },
              { label: "右侧", value: "right" },
              { label: "底部", value: "bottom" },
              { label: "内部", value: "inside" },
              { label: "内部左侧", value: "insideLeft" },
              { label: "内部右侧", value: "insideRight" },
              { label: "内部顶部", value: "insideTop" },
              { label: "内部底部", value: "insideBottom" },
              { label: "内部左上", value: "insideTopLeft" },
              { label: "内部左下", value: "insideBottomLeft" },
              { label: "内部右上", value: "insideTopRight" },
              { label: "内部右下", value: "insideBottomRight" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["label", "color"],
            label: "颜色",
            defaultValue: getValue(["label", "color"], "#333"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "fontSize"],
            label: "字体大小",
            defaultValue: getValue(["label", "fontSize"], 12),
            min: 8,
            max: 72,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["label", "fontStyle"],
            label: "字体样式",
            defaultValue: getValue(["label", "fontStyle"], "normal"),
            options: [
              { label: "正常", value: "normal" },
              { label: "斜体", value: "italic" },
              { label: "倾斜", value: "oblique" },
            ],
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["label", "fontWeight"],
            label: "字体粗细",
            defaultValue: getValue(["label", "fontWeight"], "normal"),
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
            keys: ["label", "textShadowColor"],
            label: "文字阴影颜色",
            defaultValue: getValue(["label", "textShadowColor"], "transparent"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowBlur"],
            label: "文字阴影模糊",
            defaultValue: getValue(["label", "textShadowBlur"], 0),
            min: 0,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowOffsetX"],
            label: "文字阴影X偏移",
            defaultValue: getValue(["label", "textShadowOffsetX"], 0),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "textShadowOffsetY"],
            label: "文字阴影Y偏移",
            defaultValue: getValue(["label", "textShadowOffsetY"], 0),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["label", "distance"],
            label: "距离",
            defaultValue: getValue(["label", "distance"], 5),
            min: 0,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
        ],
      },
      {
        key: "labelLine",
        title: "标签线",
        configs: [
          {
            type: "switch",
            keys: ["labelLine", "show"],
            label: "显示",
            defaultValue: getValue(["labelLine", "show"], false),
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "length2"],
            label: "第二段长度",
            defaultValue: getValue(["labelLine", "length2"], 0),
            min: 0,
            max: 100,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "switch",
            keys: ["labelLine", "smooth"],
            label: "平滑",
            defaultValue: getValue(["labelLine", "smooth"], false),
            onChange: handleConfigChange,
          },
          {
            type: "colorPicker",
            keys: ["labelLine", "lineStyle", "color"],
            label: "颜色",
            defaultValue: getValue(["labelLine", "lineStyle", "color"], "#000"),
            onChange: handleColorConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "lineStyle", "width"],
            label: "宽度",
            defaultValue: getValue(["labelLine", "lineStyle", "width"], 1),
            min: 0,
            max: 20,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "select",
            keys: ["labelLine", "lineStyle", "type"],
            label: "样式",
            defaultValue: getValue(["labelLine", "lineStyle", "type"], "solid"),
            options: [
              { label: "实线", value: "solid" },
              { label: "虚线", value: "dashed" },
              { label: "点线", value: "dotted" },
            ],
            onChange: handleConfigChange,
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
            keys: ["labelLine", "lineStyle", "shadowBlur"],
            label: "阴影模糊",
            defaultValue: getValue(["labelLine", "lineStyle", "shadowBlur"], 0),
            min: 0,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "lineStyle", "shadowOffsetX"],
            label: "阴影X偏移",
            defaultValue: getValue(
              ["labelLine", "lineStyle", "shadowOffsetX"],
              0
            ),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "inputNumber",
            keys: ["labelLine", "lineStyle", "shadowOffsetY"],
            label: "阴影Y偏移",
            defaultValue: getValue(
              ["labelLine", "lineStyle", "shadowOffsetY"],
              0
            ),
            min: -50,
            max: 50,
            step: 1,
            onChange: handleConfigChange,
          },
          {
            type: "slider",
            keys: ["labelLine", "lineStyle", "opacity"],
            label: "透明度",
            defaultValue: getValue(["labelLine", "lineStyle", "opacity"], 1),
            min: 0,
            max: 1,
            step: 0.1,
            onChange: handleConfigChange,
          },
        ],
      },
    ],
    [
      getValue,
      handleConfigChange,
      handleColorConfigChange,
      currentStep,
      handleStepChange,
    ]
  );

  if (!pageId || !elementId || !chartInfo) return null;

  return (
    <ChartStylePanel
      title="样式"
      icon={<ChartLine theme="outline" size="18" fill="var(--icon-color)" />}
      panelConfigs={panelConfigs}
      getValue={getValue}
      defaultActiveKey={["basic"]}
    />
  );
});
