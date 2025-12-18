import type { EChartsOption } from "echarts";
import type { LineChartConfig } from "./index1";

/**
 * 生成面积折线图的 echarts 配置
 */
export function getLineChartOption2(config?: LineChartConfig): EChartsOption {
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
  } = config || {};

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
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: color,
              },
              {
                offset: 1,
                color: `${color}00`, // 透明
              },
            ],
          },
        },
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
