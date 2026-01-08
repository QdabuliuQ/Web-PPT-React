import { cloneDeep } from "@/utils/tool";
import type { EChartsOption } from "echarts";
import {
  getTitleDefaultOption,
  getXAxisDefaultOption,
  getYAxisDefaultOption,
} from "../../common";

export interface ScatterChartConfig {
  data?:
    | Array<[number, number]>
    | Array<{ x: number; y: number; label?: string }>;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  backgroundColor?: string;
}

/**
 * 生成散点图的 echarts 配置
 */
export function getScatterChartOption(
  config?: ScatterChartConfig
): EChartsOption {
  // 默认配置
  const defaultData = [
    [10.0, 8.04],
    [8.07, 6.95],
    [13.0, 7.58],
    [9.05, 8.81],
    [11.0, 8.33],
    [14.0, 7.66],
    [13.4, 6.81],
    [10.0, 6.33],
    [14.0, 8.96],
    [12.5, 6.82],
    [9.15, 7.2],
    [11.5, 7.2],
    [3.03, 4.23],
    [12.2, 7.83],
    [2.02, 4.47],
    [1.05, 3.33],
    [4.05, 4.96],
    [6.03, 7.24],
    [12.0, 6.26],
    [12.0, 8.84],
    [7.08, 5.82],
    [5.02, 5.68],
  ];

  const {
    data = defaultData,
    color = "#5F95FF",
    showGrid = true,
    showLabels = true,
    backgroundColor = "rgba(0,0,0,0)",
  } = config || {};

  // 将数据统一转换为二维数组格式 [[x, y], ...]
  const scatterData: Array<[number, number]> = data.map(
    (item): [number, number] => {
      // 如果已经是数组格式 [x, y]
      if (Array.isArray(item) && item.length >= 2) {
        return [Number(item[0]) || 0, Number(item[1]) || 0] as [number, number];
      }
      // 如果是对象格式 {x, y}
      if (item && typeof item === "object" && "x" in item && "y" in item) {
        return [Number((item as any).x) || 0, Number((item as any).y) || 0] as [
          number,
          number,
        ];
      }
      // 默认值
      return [0, 0] as [number, number];
    }
  );

  // 检查是否有有效数据
  const hasValidData = scatterData.some(
    (d) => d[0] != null && !isNaN(d[0]) && d[1] != null && !isNaN(d[1])
  );

  // 如果没有有效数据，返回空图表配置
  if (!hasValidData || scatterData.length === 0) {
    return {
      title: getTitleDefaultOption(),
      backgroundColor,
      grid: {
        left: 10,
        right: 10,
        top: 30,
        bottom: 10,
        containLabel: true,
      },
      xAxis: getXAxisDefaultOption({
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
          type: "scatter",
          data: [],
          symbolSize: 8,
          itemStyle: {
            color: color,
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

  return {
    title: getTitleDefaultOption(),
    backgroundColor,
    grid: {
      left: 10,
      right: 10,
      top: 30,
      bottom: 10,
      containLabel: true,
    },
    xAxis: getXAxisDefaultOption({
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
    series: {
      type: "scatter",
      data: scatterData,
      symbolSize: 8,
      itemStyle: {
        color: color,
      },
      label: {
        show: showLabels,
        position: "top",
        color: "#333",
        fontSize: 12,
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
  const defaultData: Array<[number, number]> = [
    [10.0, 8.04],
    [8.07, 6.95],
    [13.0, 7.58],
    [9.05, 8.81],
  ];

  // 从 option 中提取数据
  let data: Array<[number, number]> = defaultData;

  if (option?.series) {
    const series = option.series as any;
    if (Array.isArray(series.data)) {
      data = series.data as Array<[number, number]>;
    }
  }

  // 第一行是表头
  const result: Array<Array<string | number>> = [["X", "Y"]];
  // 后续行是数据
  data.forEach((item) => {
    result.push([item[0], item[1]]);
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
    return getScatterChartOption();
  }

  // 深拷贝 option，避免直接修改原对象
  const updatedOption = cloneDeep(option);

  if (excelData.length < 2) {
    return updatedOption;
  }

  // 跳过表头，从第二行开始读取数据
  const data: Array<[number, number]> = [];

  for (let i = 1; i < excelData.length; i++) {
    const row = excelData[i];
    // 检查 x, y 是否为空（空字符串、null、undefined、NaN）
    const x = row[0];
    const y = row[1];

    // 如果 x 或 y 为空，停止处理后续行
    if (
      x === undefined ||
      x === null ||
      x === "" ||
      isNaN(Number(x)) ||
      y === undefined ||
      y === null ||
      y === "" ||
      isNaN(Number(y))
    ) {
      break;
    }

    data.push([Number(x) || 0, Number(y) || 0]);
  }

  // 更新 series[0].data
  const series = Array.isArray(updatedOption.series)
    ? updatedOption.series[0]
    : updatedOption.series;
  if (series) {
    (series as any).data = data;
  }

  return updatedOption;
}
