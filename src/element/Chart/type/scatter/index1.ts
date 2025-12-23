import type { EChartsOption } from "echarts";
import { getXAxisDefaultOption, getYAxisDefaultOption } from "../../common";

export interface ScatterChartConfig {
  data?: Array<{ x: number; y: number; label?: string }>;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
}

/**
 * 生成散点图的 echarts 配置
 */
export function getScatterChartOption(
  config?: ScatterChartConfig
): EChartsOption {
  // 默认配置
  const defaultData = [
    { x: 30, y: 45, label: "A" },
    { x: 80, y: 120, label: "B" },
    { x: 45, y: 67.5, label: "C" },
    { x: 60, y: 90, label: "D" },
  ];

  const {
    data = defaultData,
    color = "#5F95FF",
    showGrid = true,
    showLabels = true,
  } = config || {};

  // 计算 x 和 y 的范围
  const xValues = data.map((d) => d.x);
  const yValues = data.map((d) => d.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  // 添加一些边距
  const xPadding = (xMax - xMin) * 0.1 || 1;
  const yPadding = (yMax - yMin) * 0.1 || 1;

  return {
    grid: {
      left: "10%",
      right: "10%",
      top: "10%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: getXAxisDefaultOption({
      type: "value",
      min: xMin - xPadding,
      max: xMax + xPadding,
      splitLine: {
        show: showGrid,
        lineStyle: {
          color: "#e0e0e0",
          type: "dashed",
        },
      },
      "axisLine.lineStyle.color": "#666",
      "axisLabel.color": "#666",
      "axisLabel.fontSize": 12,
    }),
    yAxis: getYAxisDefaultOption({
      type: "value",
      min: yMin - yPadding,
      max: yMax + yPadding,
      splitLine: {
        show: showGrid,
        lineStyle: {
          color: "#e0e0e0",
          type: "dashed",
        },
      },
      "axisLine.lineStyle.color": "#666",
      "axisLabel.color": "#666",
      "axisLabel.fontSize": 12,
    }),
    series: [
      {
        type: "scatter",
        data: data.map((d) => [d.x, d.y]),
        symbolSize: 8,
        itemStyle: {
          color: color,
        },
        label: {
          show: showLabels,
          formatter: (params: any) => {
            const index = params.dataIndex;
            return data[index]?.label || `(${data[index].x}, ${data[index].y})`;
          },
          position: "top",
          color: "#333",
          fontSize: 12,
        },
      },
    ],
  };
}
