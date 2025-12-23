import type { EChartsOption } from "echarts";
import {
  getColorDefaultOption,
  getTitleDefaultOption,
  getXAxisDefaultOption,
  getYAxisDefaultOption,
} from "../../common";

export interface HorizontalBarChartConfig {
  title?: any;
  data?: Array<{
    category: string;
    series: Array<{ name: string; value: number }>;
  }>;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
  boundaryGap?: [number, number]; // [0, 0.01]
}

/**
 * 生成横向柱状图的 echarts 配置
 * xAxis 为数值轴，yAxis 为分类轴
 */
export function getBarChartOption4(
  config?: HorizontalBarChartConfig
): EChartsOption {
  const defaultData = [
    {
      category: "Brazil",
      series: [
        { name: "2011", value: 18203 },
        { name: "2012", value: 19325 },
      ],
    },
    {
      category: "Indonesia",
      series: [
        { name: "2011", value: 23489 },
        { name: "2012", value: 23438 },
      ],
    },
    {
      category: "USA",
      series: [
        { name: "2011", value: 29034 },
        { name: "2012", value: 31000 },
      ],
    },
    {
      category: "India",
      series: [
        { name: "2011", value: 104970 },
        { name: "2012", value: 121594 },
      ],
    },
    {
      category: "China",
      series: [
        { name: "2011", value: 131744 },
        { name: "2012", value: 134141 },
      ],
    },
    {
      category: "World",
      series: [
        { name: "2011", value: 630230 },
        { name: "2012", value: 681807 },
      ],
    },
  ];

  const {
    data = defaultData,
    showGrid = true,
    showLabels = true,
    boundaryGap = [0, 0.01],
    title = getTitleDefaultOption(),
  } = config || {};

  // 提取所有系列名称（从第一个数据项的 series 中获取）
  const seriesNames =
    data.length > 0 && data[0].series.length > 0
      ? data[0].series.map((s) => s.name)
      : [];

  // 构建 dataset source
  const datasetSource: any[] = [];
  // 第一行是维度名称
  datasetSource.push(["category", ...seriesNames]);
  // 后续行是数据
  data.forEach((item) => {
    const row: any[] = [item.category];
    seriesNames.forEach((seriesName) => {
      const seriesItem = item.series.find((s) => s.name === seriesName);
      row.push(seriesItem?.value ?? 0);
    });
    datasetSource.push(row);
  });

  // 构建 series 配置
  const series = seriesNames.map((name, index) => ({
    name,
    type: "bar" as const,
    encode: {
      x: index + 1, // 对应 dataset 中的列索引（从1开始，因为0是category）
      y: 0, // category 列
    },
    label: {
      show: showLabels,
      position: "right" as const,
      color: "#333",
      fontSize: 12,
    },
  }));

  return {
    title,
    color: getColorDefaultOption(),
    legend: {
      show: false,
    },
    grid: {
      top: 20,
      bottom: 50,
    },
    xAxis: getXAxisDefaultOption({
      type: "value" as const,
      boundaryGap,
      splitLine: {
        show: showGrid,
        lineStyle: {
          color: "#e0e0e0",
          type: "dashed" as const,
        },
      },
      "axisLine.lineStyle.color": "#666",
      "axisLabel.color": "#666",
      "axisLabel.fontSize": 12,
    }),
    yAxis: getYAxisDefaultOption({
      type: "category" as const,
      data: data.map((d) => d.category),
      "axisLine.lineStyle.color": "#666",
      "axisLabel.color": "#666",
      "axisLabel.fontSize": 12,
    }),
    dataset: {
      source: datasetSource,
    },
    series,
  };
}
