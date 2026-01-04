import type { EChartsOption } from "echarts";
import { getColorDefaultOption } from "../../common";

export interface PieChartConfig {
  data?: Array<{ label: string; value: number }>;
  color?: string;
  showLabels?: boolean;
  backgroundColor?: string;
}

/**
 * 生成饼图的 echarts 配置
 */
export function getPieChartOption(config?: PieChartConfig): EChartsOption {
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
    showLabels = true,
    backgroundColor = "rgba(0,0,0,0)",
  } = config || {};

  // 构建 dataset source
  // 第一行是维度名称
  const datasetSource: any[] = [["label", "value"]];
  // 后续行是数据
  data.forEach((item) => {
    datasetSource.push([item.label, item.value]);
  });

  return {
    backgroundColor,
    tooltip: {
      trigger: "item",
    },
    dataset: {
      source: datasetSource,
    },
    series: {
      type: "pie",
      radius: "60%",
      center: ["50%", "50%"],
      encode: {
        itemName: 0, // label 列
        value: 1, // value 列
      },
      itemStyle: {
        color: (params: any) => {
          // 使用颜色数组，如果只有一个颜色则使用它
          const colors = [color, ...getColorDefaultOption().slice(1)];
          return colors[params.dataIndex % colors.length];
        },
      },
      label: {
        show: showLabels,
        color: "#333",
        fontSize: 12,
      },
      labelLine: {
        show: showLabels,
        lineStyle: {
          color: "#666",
        },
      },
    },
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

  // 优先从 dataset.source 中提取数据
  const dataset = Array.isArray(option?.dataset)
    ? option.dataset[0]
    : option?.dataset;
  if (
    dataset?.source &&
    Array.isArray(dataset.source) &&
    dataset.source.length > 1
  ) {
    const source = dataset.source as any[][];
    const headers = source[0];
    const dataRows = source.slice(1);

    if (Array.isArray(headers) && headers.length === 2) {
      data = dataRows.map((row: any[]) => ({
        label: String(row[0] || ""),
        value: Number(row[1]) || 0,
      }));
    }
  }
  // 如果没有 dataset，尝试从 series[0].data 中提取（向后兼容）
  else if (
    option?.series &&
    Array.isArray(option.series) &&
    option.series[0]?.data
  ) {
    const seriesData = option.series[0].data;
    if (Array.isArray(seriesData) && seriesData.length > 0) {
      data = seriesData.map((item: any) => ({
        label: item.name || String(item[0] || ""),
        value: Number(item.value || item[1] || 0),
      }));
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
  config?: PieChartConfig
): PieChartConfig {
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
