import { cloneDeep } from "@/utils/tool";
import type { EChartsOption } from "echarts";
import {
  getColorDefaultOption,
  getLegendDefaultOption,
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
  backgroundColor?: string;
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
    backgroundColor = "rgba(0,0,0,0)",
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
    backgroundColor,
    color: getColorDefaultOption(),
    legend: getLegendDefaultOption({
      left: "center",
    }),
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

/**
 * 将图表数据转换为 Excel 格式（二维数组）
 */
export function getDataToExcel(
  option?: EChartsOption
): Array<Array<string | number>> {
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

    if (Array.isArray(headers) && headers.length > 1) {
      const seriesNames = headers.slice(1) as string[];
      data = dataRows.map((row: any[]) => ({
        category: String(row[0] || ""),
        series: seriesNames.map((name: string, idx: number) => ({
          name: String(name),
          value: Number(row[idx + 1]) || 0,
        })),
      }));
    }
  }

  // 提取所有系列名称
  const seriesNames =
    data.length > 0 && data[0].series.length > 0
      ? data[0].series.map((s) => s.name)
      : [];
  // 第一行是表头：category + 系列名称
  const result: Array<Array<string | number>> = [["", ...seriesNames]];
  // 后续行是数据
  data.forEach((item) => {
    const row: Array<string | number> = [item.category];
    seriesNames.forEach((seriesName) => {
      const seriesItem = item.series.find((s) => s.name === seriesName);
      row.push(seriesItem?.value ?? 0);
    });
    result.push(row);
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
    return getBarChartOption4();
  }

  // 深拷贝 option，避免直接修改原对象
  const updatedOption = cloneDeep(option);

  if (excelData.length < 2) {
    return updatedOption;
  }

  // 第一行是表头：category + 系列名称
  const header = excelData[0];
  const seriesNames = header.slice(1).map((name) => String(name));
  // 后续行是数据
  const data: Array<{
    category: string;
    series: Array<{ name: string; value: number }>;
  }> = [];

  for (let i = 1; i < excelData.length; i++) {
    const row = excelData[i];
    const category = row[0];

    // 如果 category 为空，停止处理后续行
    if (category === undefined || category === null || category === "") {
      break;
    }

    // 检查所有系列值是否为空
    let hasEmptyValue = false;
    for (let j = 0; j < seriesNames.length; j++) {
      const value = row[j + 1];
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        isNaN(Number(value))
      ) {
        hasEmptyValue = true;
        break;
      }
    }

    // 如果任何一个系列值为空，停止处理后续行
    if (hasEmptyValue) {
      break;
    }

    data.push({
      category: String(category),
      series: seriesNames.map((name, index) => ({
        name,
        value: Number(row[index + 1]) || 0,
      })),
    });
  }

  // 更新 dataset.source
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
