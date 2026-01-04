import type { EChartsOption } from "echarts";
import { getColorDefaultOption, getTitleDefaultOption } from "../../common";

export interface TangentialPolarBarChartConfig {
  title?: any;
  data?: Array<{ label: string; value: number }>;
  color?: string;
  showLabels?: boolean;
  polarRadius?: [number | string, number | string]; // [30, '80%']
  angleAxisMax?: number; // 4
  angleAxisStartAngle?: number; // 75
  labelPosition?: "start" | "middle" | "end"; // 'middle'
  backgroundColor?: string;
}

/**
 * 生成径向极坐标柱状图的 echarts 配置
 * radiusAxis 为分类轴，angleAxis 为数值轴
 */
export function getBarChartOption3(
  config?: TangentialPolarBarChartConfig
): EChartsOption {
  const defaultData = [
    { label: "a", value: 2 },
    { label: "b", value: 1.2 },
    { label: "c", value: 2.4 },
    { label: "d", value: 3.6 },
  ];

  const {
    title = getTitleDefaultOption(),
    data = defaultData,
    showLabels = true,
    polarRadius = [30, "80%"],
    angleAxisMax = 4,
    angleAxisStartAngle = 75,
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
    polar: {
      radius: polarRadius,
      center: ["50%", "50%"],
    },
    angleAxis: {
      max: angleAxisMax,
      startAngle: angleAxisStartAngle,
    },
    radiusAxis: {
      type: "category",
    },
    dataset: {
      source: datasetSource,
    },
    series: {
      type: "bar",
      coordinateSystem: "polar",
      encode: {
        radius: 0, // label 列
        angle: 1, // value 列
      },
      label: {
        show: showLabels,
        position: "middle",
        formatter: "{b}: {c}",
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
  };
}

/**
 * 将图表数据转换为 Excel 格式（二维数组）
 */
export function getDataToExcel(
  option?: EChartsOption
): Array<Array<string | number>> {
  const defaultData = [
    { label: "a", value: 2 },
    { label: "b", value: 1.2 },
    { label: "c", value: 2.4 },
    { label: "d", value: 3.6 },
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
  config?: TangentialPolarBarChartConfig
): TangentialPolarBarChartConfig {
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
