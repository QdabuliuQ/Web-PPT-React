import type { EChartsOption } from "echarts";
import {
  getColorDefaultOption,
  getTitleDefaultOption,
  getXAxisDefaultOption,
  getYAxisDefaultOption,
} from "../../common";

export interface BarChartConfig {
  title?: any;
  data?: Array<{ label: string; value: number }>;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
}

/**
 * 生成柱状图的 echarts 配置
 */
export function getBarChartOption1(config?: BarChartConfig): EChartsOption {
  // 默认配置
  const defaultData = [
    { label: "A", value: 30 },
    { label: "B", value: 80 },
    { label: "C", value: 45 },
    { label: "D", value: 60 },
  ];

  const {
    data = defaultData,
    color = "#5F95FF",
    showGrid = true,
    showLabels = true,
    title = getTitleDefaultOption(),
  } = config || {};

  return {
    title,
    color: getColorDefaultOption(),
    grid: {
      left: "10%",
      right: "10%",
      top: "10%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: getXAxisDefaultOption({
      type: "category",
      data: data.map((d) => d.label),
      "axisLine.lineStyle.color": "#666",
      "axisLabel.color": "#666",
      "axisLabel.fontSize": 12,
    }),
    yAxis: getYAxisDefaultOption({
      type: "value",
      "splitLine.show": showGrid,
      "splitLine.lineStyle.color": "#e0e0e0",
      "splitLine.lineStyle.type": "dashed",
      "axisLine.lineStyle.color": "#666",
      "axisLabel.color": "#666",
      "axisLabel.fontSize": 12,
    }),
    series: [
      {
        type: "bar",
        data: data.map((d) => d.value),
        itemStyle: {
          color: color,
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: showLabels,
          position: "top",
          color: "#333",
          fontSize: 12,
        },
      },
    ],
  };
}
