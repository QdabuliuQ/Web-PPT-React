import { cloneDeep } from "@/utils/tool";
import type { EChartsOption } from "echarts";

export interface PieChartConfig {
  data?: Array<{ label: string; value: number }>;
  color?: string;
  showLabels?: boolean;
  backgroundColor?: string;
}

/**
 * 生成环形饼图的 echarts 配置
 */
export function getPieChartOption2(config?: PieChartConfig): EChartsOption {
  // 默认配置
  const defaultData = [
    { label: "A", value: 30 },
    { label: "B", value: 80 },
    { label: "C", value: 45 },
    { label: "D", value: 60 },
  ];

  const {
    data = defaultData,
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
      radius: ["40%", "70%"],
      center: ["50%", "50%"],
      encode: {
        itemName: 0, // label 列
        value: 1, // value 列
      },
      padAngle: 0,
      itemStyle: {
        borderRadius: 0,
        borderColor: "#000",
        borderWidth: 0,
        borderType: "solid",
        shadowBlur: 0,
        shadowColor: "transparent",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        opacity: 1,
      },
      label: {
        show: showLabels,
        color: "#333",
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "normal",
        textShadowColor: "transparent",
        textShadowBlur: 0,
        textShadowOffsetX: 0,
        textShadowOffsetY: 0,
      },
      labelLine: {
        show: showLabels,
        lineStyle: {
          color: "#666",
          type: "solid",
          width: 1,
          opacity: 1,
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
  option?: EChartsOption
): EChartsOption {
  if (!option) {
    return getPieChartOption2();
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
