import type { EChartsOption } from "echarts";
import { getColorDefaultOption, getTitleDefaultOption } from "../../common";

export interface PolarBarChartConfig {
  title?: any;
  data?: Array<{ label: string; value: number }>;
  color?: string;
  showLabels?: boolean;
  polarRadius?: [string, string]; // ['10%', '80%']
  radiusAxisMax?: number; // 4
  angleAxisStartAngle?: number; // 75
  labelPosition?: "start" | "middle" | "end"; // 'middle'
  backgroundColor?: string;
}

/**
 * 生成极坐标柱状图的 echarts 配置
 */
export function getBarChartOption2(
  config?: PolarBarChartConfig
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
    polarRadius = ["10%", "80%"],
    radiusAxisMax = 4,
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
    radiusAxis: {
      max: radiusAxisMax,
    },
    angleAxis: {
      type: "category",
      startAngle: angleAxisStartAngle,
      axisLine: {
        show: true,
        lineStyle: {
          color: "#666",
          width: 1,
          type: "solid",
          shadowBlur: 0,
          shadowColor: "transparent",
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          opacity: 1,
        },
      },
      axisLabel: {
        show: true,
        color: "#666",
        rotate: 0,
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "normal",
        shadowColor: "transparent",
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        textShadowColor: "transparent",
        textShadowBlur: 0,
        textShadowOffsetX: 0,
        textShadowOffsetY: 0,
      },
    },
    dataset: {
      source: datasetSource,
    },
    series: [
      {
        type: "bar",
        coordinateSystem: "polar",
        encode: {
          angle: 0, // label 列
          radius: 1, // value 列
        },
        label: {
          show: showLabels,
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
    ],
    animation: false,
  };
}

/**
 * 将图表数据转换为 Excel 格式（二维数组）
 */
export function getDataToExcel(
  config?: PolarBarChartConfig
): Array<Array<string | number>> {
  const defaultData = [
    { label: "a", value: 2 },
    { label: "b", value: 1.2 },
    { label: "c", value: 2.4 },
    { label: "d", value: 3.6 },
  ];
  const data = config?.data || defaultData;
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
  config?: PolarBarChartConfig
): PolarBarChartConfig {
  if (excelData.length < 2) {
    return config || {};
  }
  // 跳过表头，从第二行开始读取数据
  const data = excelData.slice(1).map((row) => ({
    label: String(row[0] || ""),
    value: Number(row[1]) || 0,
  }));
  return {
    ...config,
    data,
  };
}
