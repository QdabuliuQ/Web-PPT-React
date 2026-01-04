import type { EChartsOption } from "echarts";
import { getXAxisDefaultOption, getYAxisDefaultOption } from "../../common";

export interface LineChartConfig {
  data?: Array<{ label: string; value: number }>;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  backgroundColor?: string;
}

/**
 * 生成基础折线图的 echarts 配置
 */
export function getLineChartOption1(config?: LineChartConfig): EChartsOption {
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
    backgroundColor = "rgba(0,0,0,0)",
  } = config || {};

  return {
    backgroundColor,
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

/**
 * 将图表数据转换为 Excel 格式（二维数组）
 */
export function getDataToExcel(
  option?: EChartsOption
): Array<Array<string | number>> {
  const defaultData = [
    { label: "A", value: 30 },
    { label: "B", value: 80 },
    { label: "C", value: 45 },
    { label: "D", value: 60 },
  ];

  // 从 option 中提取数据
  let data = defaultData;

  // 折线图数据在 xAxis.data 和 series[0].data 中
  if (option) {
    const xAxis = Array.isArray(option.xAxis) ? option.xAxis[0] : option.xAxis;
    if (xAxis && (xAxis as any).data && Array.isArray((xAxis as any).data)) {
      const xAxisData = (xAxis as any).data;
      const seriesData = option.series?.[0]?.data;

      if (
        Array.isArray(xAxisData) &&
        Array.isArray(seriesData) &&
        xAxisData.length === seriesData.length
      ) {
        data = xAxisData.map((label: string, index: number) => ({
          label: String(label || ""),
          value: Number(seriesData[index]) || 0,
        }));
      }
    }
  }

  // 第一行是表头
  const result: Array<Array<string | number>> = [["标签", "数值"]];
  // 后续行是数据
  data.forEach((item) => {
    result.push([item.label, item.value]);
  });
  return result;
}

/**
 * 从 Excel 格式（二维数组）转换为图表数据
 */
export function setDataFromExcel(
  excelData: Array<Array<string | number>>,
  config?: LineChartConfig
): LineChartConfig {
  if (excelData.length < 2) {
    return config || {};
  }
  // 跳过表头，从第二行开始读取数据
  const data: Array<{ label: string; value: number }> = [];

  for (let i = 1; i < excelData.length; i++) {
    const row = excelData[i];
    const label = row[0];
    const value = row[1];

    // 如果 label 或 value 为空，停止处理后续行
    if (
      label === undefined ||
      label === null ||
      label === "" ||
      value === undefined ||
      value === null ||
      value === "" ||
      isNaN(Number(value))
    ) {
      break;
    }

    data.push({
      label: String(label),
      value: Number(value) || 0,
    });
  }

  return {
    ...config,
    data,
  };
}
