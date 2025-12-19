import type { EChartsOption } from "echarts";

export interface TangentialPolarBarChartConfig {
  title?: any;
  data?: Array<{ label: string; value: number }>;
  color?: string;
  showLabels?: boolean;
  polarRadius?: [number | string, number | string]; // [30, '80%']
  angleAxisMax?: number; // 4
  angleAxisStartAngle?: number; // 75
  labelPosition?: "start" | "middle" | "end"; // 'middle'
}

/**
 * 生成径向极坐标柱状图的 echarts 配置
 * radiusAxis 为分类轴，angleAxis 为数值轴
 */
export function getBarChartOption3(
  config?: TangentialPolarBarChartConfig
): EChartsOption {
  const defaultTitle = {
    text: "标题",
    show: true,
    textStyle: {
      color: "#333",
      fontStyle: "normal" as const,
      fontWeight: "bold" as const,
      fontSize: 18,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    subtext: "",
    subtextStyle: {
      color: "#aaa",
      fontStyle: "normal" as const,
      fontWeight: "bold" as const,
      fontSize: 12,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    left: 0,
    top: 0,
  };

  const defaultData = [
    { label: "a", value: 2 },
    { label: "b", value: 1.2 },
    { label: "c", value: 2.4 },
    { label: "d", value: 3.6 },
  ];

  const {
    title = defaultTitle,
    data = defaultData,
    polarRadius = [30, "80%"],
    angleAxisMax = 4,
    angleAxisStartAngle = 75,
  } = config || {};

  return {
    title,
    color: [
      "#5F95FF",
      "#91CC75",
      "#FAC858",
      "#EE6666",
      "#73C0DE",
      "#3BA272",
      "#FC8452",
      "#9A60B4",
      "#EA7CCC",
    ],
    polar: {
      radius: polarRadius,
      center: ["50%", "50%"],
    },
    angleAxis: {
      max: angleAxisMax,
      startAngle: angleAxisStartAngle,
    },
    radiusAxis: {
      type: "category",
      data: data.map((d) => d.label),
    },
    dataset: {
      source: data,
    },
    series: {
      type: "bar",
      coordinateSystem: "polar",
      data: data.map((d) => d.value),
      label: {
        show: true,
        position: "middle",
        formatter: "{b}: {c}",
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
      },
    },
  };
}
