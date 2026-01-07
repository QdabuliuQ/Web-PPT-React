import { cloneDeep } from "@/utils/tool";
import type { EChartsOption } from "echarts";
import {
  getTitleDefaultOption,
  getXAxisDefaultOption,
  getYAxisDefaultOption,
} from "../../common";
import type { LineChartConfig } from "./index1";

/**
 * 生成平滑折线图的 echarts 配置
 */
export function getLineChartOption3(config?: LineChartConfig): EChartsOption {
  // 默认配置
  const defaultData = [
    { label: "A", value: 30 },
    { label: "B", value: 80 },
    { label: "C", value: 45 },
    { label: "D", value: 60 },
  ];

  const {
    data = defaultData,
    showGrid = true,
    backgroundColor = "rgba(0,0,0,0)",
  } = config || {};

  // 构建 dataset source
  const datasetSource: any[] = [["label", "value"]];
  data.forEach((item) => {
    datasetSource.push([item.label, item.value]);
  });

  return {
    title: getTitleDefaultOption(),
    backgroundColor,
    grid: {
      left: 20,
      right: 20,
      top: 30,
      bottom: 10,
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
    dataset: {
      source: datasetSource,
    },
    series: [
      {
        type: "line",
        encode: {
          x: "label",
          y: "value",
        },
        smooth: true,
        lineStyle: {
          width: 2,
          type: "solid",
          shadowBlur: 0,
          shadowColor: "transparent",
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          opacity: 1,
        },
        symbol: "circle", // 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
        symbolSize: 6,
        label: {
          show: false,
          position: "top", // top / left / right / bottom / inside / insideLeft / insideRight / insideTop / insideBottom / insideTopLeft / insideBottomLeft / insideTopRight / insideBottomRight
          color: "#333",
          fontSize: 12,
          fontStyle: "normal",
          fontWeight: "normal",
          textShadowColor: "transparent",
          textShadowBlur: 0,
          textShadowOffsetX: 0,
          textShadowOffsetY: 0,
          distance: 5,
        },
        labelLine: {
          show: false,
          length2: 0,
          smooth: false,
          lineStyle: {
            color: "#000",
            width: 1,
            type: "solid",
            shadowBlur: 0,
            shadowColor: "transparent",
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            opacity: 1,
          },
        },
        areaStyle: {},
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
  // 如果没有 dataset，尝试从 xAxis.data 和 series[0].data 中提取（向后兼容）
  else if (option) {
    const xAxis = Array.isArray(option.xAxis) ? option.xAxis[0] : option.xAxis;
    const seriesData = Array.isArray(option.series)
      ? option.series[0]
      : option.series;

    if (
      xAxis &&
      (xAxis as any).data &&
      Array.isArray((xAxis as any).data) &&
      seriesData?.data &&
      Array.isArray(seriesData.data)
    ) {
      const labels = (xAxis as any).data;
      const values = seriesData.data;

      if (labels.length === values.length) {
        data = labels.map((label: any, index: number) => ({
          label: String(label || ""),
          value: Number(values[index]) || 0,
        }));
      }
    }
  }

  // 第一行是表头
  const result: Array<Array<string | number>> = [["名称", "数值"]];
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
    return getLineChartOption3();
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
