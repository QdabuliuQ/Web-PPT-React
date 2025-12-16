import type { EChartsOption } from "echarts";

export interface LineChartConfig {
  data: Array<{ label: string; value: number }>;
  color: string;
  showGrid: boolean;
  showLabels: boolean;
}

/**
 * 生成基础折线图的 echarts 配置
 */
export function getLineChartOption(config: LineChartConfig): EChartsOption {
  const { data, color, showGrid, showLabels } = config;

  return {
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
        type: "line",
        data: data.map((d) => d.value),
        smooth: true,
        lineStyle: {
          color: color,
          width: 2,
        },
        itemStyle: {
          color: color,
        },
        symbol: "circle",
        symbolSize: 6,
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

