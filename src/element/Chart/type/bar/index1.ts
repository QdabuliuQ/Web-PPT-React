import type { EChartsOption } from "echarts";
import getTitleOption from "../../common/title";

export interface BarChartConfig {
  title: any;
  data: Array<{ label: string; value: number }>;
  color: string;
  showGrid: boolean;
  showLabels: boolean;
}

/**
 * 生成柱状图的 echarts 配置
 */
export function getBarChartOption(config: BarChartConfig): EChartsOption {
  const { data, color, showGrid, showLabels, title } = config;

  return {
    title: getTitleOption(title),
    grid: {
      left: "10%",
      right: "10%",
      top: "10%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.map((d) => d.label),
      axisLine: {
        lineStyle: {
          color: "#666",
        },
      },
      axisLabel: {
        color: "#666",
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: showGrid,
        lineStyle: {
          color: "#e0e0e0",
          type: "dashed",
        },
      },
      axisLine: {
        lineStyle: {
          color: "#666",
        },
      },
      axisLabel: {
        color: "#666",
        fontSize: 12,
      },
    },
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
