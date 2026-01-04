import type { EChartsOption } from "echarts";

export interface RadarChartConfig {
  data?: Array<{
    name: string;
    value: number;
  }>;
  color?: string;
  showLabels?: boolean;
  backgroundColor?: string;
}

/**
 * 生成雷达图的 echarts 配置
 */
export function getRadarChartOption(config?: RadarChartConfig): EChartsOption {
  // 默认配置
  const defaultData = [
    { name: "A", value: 30 },
    { name: "B", value: 80 },
    { name: "C", value: 45 },
    { name: "D", value: 60 },
  ];

  const {
    data = defaultData,
    color = "#5F95FF",
    showLabels = true,
    backgroundColor = "rgba(0,0,0,0)",
  } = config || {};

  // 计算最大值，用于设置雷达图的刻度
  const maxValue = Math.max(...data.map((d) => d.value), 100);

  // 构建 dataset source
  // 第一行是维度名称
  const datasetSource: any[] = [["name", "value"]];
  // 后续行是数据
  data.forEach((item) => {
    datasetSource.push([item.name, item.value]);
  });

  return {
    backgroundColor,
    dataset: {
      source: datasetSource,
    },
    radar: {
      indicator: data.map((d) => ({
        name: d.name,
        max: Math.ceil(maxValue * 1.2), // 添加 20% 的边距
      })),
      center: ["50%", "55%"],
      radius: "70%",
      axisName: {
        color: "#666",
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: "#e0e0e0",
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ["rgba(250, 250, 250, 0.3)", "rgba(200, 200, 200, 0.1)"],
        },
      },
      axisLine: {
        lineStyle: {
          color: "#666",
        },
      },
    },
    series: {
      type: "radar",
      encode: {
        value: 1, // value 列
      },
      data: [
        {
          value: data.map((d) => d.value),
          name: "数据",
          itemStyle: {
            color: color,
          },
          areaStyle: {
            color: color,
            opacity: 0.3,
          },
          label: {
            show: showLabels,
            color: "#333",
            fontSize: 12,
          },
        },
      ],
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
    { name: "A", value: 30 },
    { name: "B", value: 80 },
    { name: "C", value: 45 },
    { name: "D", value: 60 },
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
        name: String(row[0] || ""),
        value: Number(row[1]) || 0,
      }));
    }
  }
  // 如果没有 dataset，尝试从 radar.indicator 和 series.data[0].value 中提取（向后兼容）
  else if (option) {
    const radar = Array.isArray(option.radar) ? option.radar[0] : option.radar;
    const series = Array.isArray(option.series)
      ? option.series[0]
      : option.series;
    if (
      radar &&
      (radar as any).indicator &&
      Array.isArray((radar as any).indicator) &&
      series?.data?.[0]?.value &&
      Array.isArray(series.data[0].value)
    ) {
      const indicators = (radar as any).indicator;
      const values = series.data[0].value;

      if (indicators.length === values.length) {
        data = indicators.map((indicator: any, index: number) => ({
          name: indicator.name || String(indicator || ""),
          value: Number(values[index]) || 0,
        }));
      }
    }
  }

  // 第一行是表头
  const result: Array<Array<string | number>> = [["名称", "数值"]];
  // 后续行是数据
  data.forEach((item) => {
    result.push([item.name, item.value]);
  });
  return result;
}

/**
 * 从 Excel 格式（二维数组）转换为图表数据
 */
export function setDataFromExcel(
  excelData: Array<Array<string | number>>,
  config?: RadarChartConfig
): RadarChartConfig {
  if (excelData.length < 2) {
    return config || {};
  }
  // 跳过表头，从第二行开始读取数据
  const data: Array<{ name: string; value: number }> = [];

  for (let i = 1; i < excelData.length; i++) {
    const row = excelData[i];
    const name = row[0];
    const value = row[1];

    // 如果 name 或 value 为空，停止处理后续行
    if (
      name === undefined ||
      name === null ||
      name === "" ||
      value === undefined ||
      value === null ||
      value === "" ||
      isNaN(Number(value))
    ) {
      break;
    }

    data.push({
      name: String(name),
      value: Number(value) || 0,
    });
  }

  return {
    ...config,
    data,
  };
}
