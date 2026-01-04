import type { EChartsOption } from "echarts";
import {
  getColorDefaultOption,
  getTitleDefaultOption,
  getXAxisDefaultOption,
  getYAxisDefaultOption,
} from "../../common";

export interface StackedLineChartConfig {
  title?: any;
  data?: Array<{
    category: string;
    series: Array<{ name: string; value: number }>;
  }>;
  showGrid?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
  backgroundColor?: string;
}

/**
 * 生成堆叠折线图的 echarts 配置
 */
export function getLineChartOption2(
  config?: StackedLineChartConfig
): EChartsOption {
  const defaultData = [
    {
      category: "Mon",
      series: [
        { name: "Email", value: 120 },
        { name: "Union Ads", value: 220 },
        { name: "Video Ads", value: 150 },
        { name: "Direct", value: 320 },
        { name: "Search Engine", value: 820 },
      ],
    },
    {
      category: "Tue",
      series: [
        { name: "Email", value: 132 },
        { name: "Union Ads", value: 182 },
        { name: "Video Ads", value: 232 },
        { name: "Direct", value: 332 },
        { name: "Search Engine", value: 932 },
      ],
    },
    {
      category: "Wed",
      series: [
        { name: "Email", value: 101 },
        { name: "Union Ads", value: 191 },
        { name: "Video Ads", value: 201 },
        { name: "Direct", value: 301 },
        { name: "Search Engine", value: 901 },
      ],
    },
    {
      category: "Thu",
      series: [
        { name: "Email", value: 134 },
        { name: "Union Ads", value: 234 },
        { name: "Video Ads", value: 154 },
        { name: "Direct", value: 334 },
        { name: "Search Engine", value: 934 },
      ],
    },
    {
      category: "Fri",
      series: [
        { name: "Email", value: 90 },
        { name: "Union Ads", value: 290 },
        { name: "Video Ads", value: 190 },
        { name: "Direct", value: 390 },
        { name: "Search Engine", value: 1290 },
      ],
    },
    {
      category: "Sat",
      series: [
        { name: "Email", value: 230 },
        { name: "Union Ads", value: 330 },
        { name: "Video Ads", value: 330 },
        { name: "Direct", value: 330 },
        { name: "Search Engine", value: 1330 },
      ],
    },
    {
      category: "Sun",
      series: [
        { name: "Email", value: 210 },
        { name: "Union Ads", value: 310 },
        { name: "Video Ads", value: 410 },
        { name: "Direct", value: 320 },
        { name: "Search Engine", value: 1320 },
      ],
    },
  ];

  const {
    data = defaultData,
    showGrid = true,
    showLabels = true,
    showLegend = true,
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
    type: "line" as const,
    stack: "Total",
    encode: {
      x: 0, // category 列
      y: index + 1, // 对应 dataset 中的列索引（从1开始，因为0是category）
    },
    label: {
      show: showLabels,
      position: "top" as const,
      color: "#333",
      fontSize: 12,
    },
  }));

  return {
    title,
    backgroundColor,
    color: getColorDefaultOption(),
    legend: {
      show: showLegend,
      data: seriesNames,
      icon: "roundRect",
    },
    grid: {
      left: 60,
      right: 60,
      top: 60,
      bottom: 60,
      containLabel: true,
    },
    xAxis: getXAxisDefaultOption({
      type: "category" as const,
      boundaryGap: false,
      "axisLine.lineStyle.color": "#666",
      "axisLabel.color": "#666",
      "axisLabel.fontSize": 12,
    }),
    yAxis: getYAxisDefaultOption({
      type: "value" as const,
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
      category: "Mon",
      series: [
        { name: "Email", value: 120 },
        { name: "Union Ads", value: 220 },
        { name: "Video Ads", value: 150 },
      ],
    },
    {
      category: "Tue",
      series: [
        { name: "Email", value: 132 },
        { name: "Union Ads", value: 182 },
        { name: "Video Ads", value: 232 },
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
  config?: StackedLineChartConfig
): StackedLineChartConfig {
  if (excelData.length < 2) {
    return config || {};
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

  return {
    ...config,
    data,
  };
}
