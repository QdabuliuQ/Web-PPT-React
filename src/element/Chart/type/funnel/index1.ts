import { cloneDeep } from "@/utils/tool";
import type { EChartsOption } from "echarts";
import { getLegendDefaultOption, getTitleDefaultOption } from "../../common";

export interface FunnelChartConfig {
  data?: Array<{ name: string; value: number }>;
  backgroundColor?: string;
}

/**
 * 生成漏斗图的 echarts 配置
 */
export function getFunnelChartOption(
  config?: FunnelChartConfig
): EChartsOption {
  // 默认数据
  const defaultData = [
    { name: "Show", value: 100 },
    { name: "Click", value: 80 },
    { name: "Visit", value: 60 },
    { name: "Inquiry", value: 40 },
    { name: "Order", value: 20 },
  ];

  const { data = defaultData, backgroundColor = "rgba(0,0,0,0)" } =
    config || {};

  // 获取默认的 title 和 legend 配置
  const title = getTitleDefaultOption();
  const legend = getLegendDefaultOption();

  return {
    backgroundColor,
    title,
    legend,
    series: [
      {
        name: "Funnel",
        type: "funnel",
        left: "center",
        top: "center",
        width: "80%",
        height: "75%",
        min: 0,
        max: 100,
        sort: "descending",
        gap: 2,
        label: {
          show: true,
          position: "inside",
          color: "#fff",
          fontStyle: "normal",
          fontWeight: "normal",
          fontSize: 12,
          textShadowColor: "transparent",
          textShadowBlur: 0,
          textShadowOffsetX: 0,
          textShadowOffsetY: 0,
        },
        labelLine: {
          show: false,
          length: 10,
          lineStyle: {
            color: "#000",
            width: 1,
            type: "solid",
            opacity: 1,
          },
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
          borderType: "solid",
          shadowBlur: 0,
          shadowColor: "transparent",
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          opacity: 1,
        },
        data: data,
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
    { name: "Show", value: 100 },
    { name: "Click", value: 80 },
    { name: "Visit", value: 60 },
    { name: "Inquiry", value: 40 },
    { name: "Order", value: 20 },
  ];

  // 从 option 中提取数据
  let data = defaultData;

  // 从 series[0].data 中提取数据
  if (
    option?.series &&
    Array.isArray(option.series) &&
    option.series[0]?.data
  ) {
    const seriesData = option.series[0].data;
    if (Array.isArray(seriesData) && seriesData.length > 0) {
      data = seriesData.map((item: any) => ({
        name: item.name || String(item[0] || ""),
        value: Number(item.value || item[1] || 0),
      }));
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
  option?: EChartsOption
): EChartsOption {
  if (!option) {
    return getFunnelChartOption();
  }

  // 深拷贝 option，避免直接修改原对象
  const updatedOption = cloneDeep(option);

  if (excelData.length < 2) {
    return updatedOption;
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

  // 更新 series[0].data
  if (updatedOption.series && Array.isArray(updatedOption.series)) {
    if (updatedOption.series[0]) {
      (updatedOption.series[0] as any).data = data;
    } else {
      updatedOption.series[0] = {
        name: "Funnel",
        type: "funnel",
        data: data,
      } as any;
    }
  } else {
    updatedOption.series = [
      {
        name: "Funnel",
        type: "funnel",
        data: data,
      } as any,
    ];
  }

  return updatedOption;
}
