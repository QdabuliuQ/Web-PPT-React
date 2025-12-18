import type { EChartsOption } from "echarts";

export interface BarChartConfig {
  title?: any;
  data?: Array<{ label: string; value: number }>;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
}

/**
 * 生成柱状图的 echarts 配置
 */
export function getBarChartOption1(config?: BarChartConfig): EChartsOption {
  // 默认配置
  const defaultData = [
    { label: "A", value: 30 },
    { label: "B", value: 80 },
    { label: "C", value: 45 },
    { label: "D", value: 60 },
  ];

  const defaultTitle = {
    text: "标题",
    show: true,
    textStyle: {
      color: "#333",
      fontStyle: "normal" as const,
      fontWeight: "bold" as const,
      fontSize: 18,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    subtext: "",
    subtextStyle: {
      color: "#aaa",
      fontStyle: "normal" as const,
      fontWeight: "bold" as const,
      fontSize: 12,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    left: 0,
    top: 0,
  };

  const {
    data = defaultData,
    color = "#5F95FF",
    showGrid = true,
    showLabels = true,
    title = defaultTitle,
  } = config || {};

  return {
    title,
    color: [
      "#5F95FF",
      "#91CC75",
      "#FAC858",
      "#EE6666",
      "#73C0DE",
      "#3BA272",
      "#FC8452",
      "#9A60B4",
      "#EA7CCC",
    ],
    grid: {
      left: "10%",
      right: "10%",
      top: "10%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.map((d) => d.label),
      axisLine: {
        lineStyle: {
          color: "#666",
        },
      },
      axisLabel: {
        color: "#666",
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: showGrid,
        lineStyle: {
          color: "#e0e0e0",
          type: "dashed",
        },
      },
      axisLine: {
        lineStyle: {
          color: "#666",
        },
      },
      axisLabel: {
        color: "#666",
        fontSize: 12,
      },
    },
    series: [
      {
        type: "bar",
        data: data.map((d) => d.value),
        itemStyle: {
          color: color,
          borderRadius: [4, 4, 0, 0],
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
