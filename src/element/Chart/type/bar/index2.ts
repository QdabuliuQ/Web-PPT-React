import type { EChartsOption } from "echarts";
import { getColorDefaultOption, getTitleDefaultOption } from "../../common";

export interface PolarBarChartConfig {
  title?: any;
  data?: Array<{ label: string; value: number }>;
  color?: string;
  showLabels?: boolean;
  polarRadius?: [string, string]; // ['10%', '80%']
  radiusAxisMax?: number; // 4
  angleAxisStartAngle?: number; // 75
  labelPosition?: "start" | "middle" | "end"; // 'middle'
}

/**
 * 生成极坐标柱状图的 echarts 配置
 */
export function getBarChartOption2(
  config?: PolarBarChartConfig
): EChartsOption {
  const {
    title = getTitleDefaultOption(),
    polarRadius = ["10%", "80%"],
    radiusAxisMax = 4,
    angleAxisStartAngle = 75,
  } = config || {};

  return {
    title,
    color: getColorDefaultOption(),
    polar: {
      radius: polarRadius,
      center: ["50%", "50%"],
    },
    radiusAxis: {
      max: radiusAxisMax,
    },
    angleAxis: {
      type: "category",
      data: ["a", "b", "c", "d"],
      startAngle: angleAxisStartAngle,
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
    },
    series: [
      {
        type: "bar",
        data: [2, 1.2, 2.4, 3.6],
        coordinateSystem: "polar",
        encode: {
          value: "value",
        },
        label: {
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
        },
      },
    ],
    animation: false,
  };
}
