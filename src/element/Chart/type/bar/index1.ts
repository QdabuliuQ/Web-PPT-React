import { cloneDeep } from "@/utils/tool";
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
  backgroundColor?: string;
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
    title,
    backgroundColor,
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
    dataset: {
      source: datasetSource,
    },
    series: [
      {
        type: "bar",
        encode: {
          x: 0, // label 列
          y: 1, // value 列
        },
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
  option?: EChartsOption
): EChartsOption {
  if (!option) {
    return getBarChartOption1();
  }

  // 深拷贝 option，避免直接修改原对象
  const updatedOption = cloneDeep(option);

  if (excelData.length < 2) {
    return updatedOption;
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

  // 更新 dataset.source
  const datasetSource: any[] = [["label", "value"]];
  data.forEach((item) => {
    datasetSource.push([item.label, item.value]);
  });

  if (updatedOption.dataset) {
    if (Array.isArray(updatedOption.dataset)) {
      updatedOption.dataset[0] = {
        ...updatedOption.dataset[0],
        source: datasetSource,
      };
    } else {
      updatedOption.dataset = {
        ...updatedOption.dataset,
        source: datasetSource,
      };
    }
  } else {
    updatedOption.dataset = {
      source: datasetSource,
    };
  }

  return updatedOption;
}
