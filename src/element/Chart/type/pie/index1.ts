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

  return {
    backgroundColor,
    tooltip: {
      trigger: "item",
    },
    series: [
      {
        type: "pie",
        radius: "60%",
        center: ["50%", "50%"],
        data: data.map((d) => ({
          name: d.label,
          value: d.value,
        })),
        itemStyle: {
          color: (params: any) => {
            // 使用颜色数组，如果只有一个颜色则使用它
            const colors = [color, ...getColorDefaultOption().slice(1)];
            return colors[params.dataIndex % colors.length];
          },
        },
        label: {
          show: showLabels,
          formatter: "{b}: {c}",
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
    ],
  };
}

/**
 * 将图表数据转换为 Excel 格式（二维数组）
 */
export function getDataToExcel(
  config?: PieChartConfig
): Array<Array<string | number>> {
  const defaultData = [
    { label: "A", value: 30 },
    { label: "B", value: 80 },
    { label: "C", value: 45 },
    { label: "D", value: 60 },
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
  config?: PieChartConfig
): PieChartConfig {
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
