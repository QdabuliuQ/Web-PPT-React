import type { EChartsOption } from "echarts";

export interface RadarChartConfig {
  data?: Array<{
    name: string;
    value: number;
  }>;
  color?: string;
  showLabels?: boolean;
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
  } = config || {};

  // 计算最大值，用于设置雷达图的刻度
  const maxValue = Math.max(...data.map((d) => d.value), 100);

  return {
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
    series: [
      {
        type: "radar",
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
    ],
  };
}
