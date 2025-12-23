import type { EChartsOption } from "echarts";
import { getColorDefaultOption } from "../../common";

export interface PieChartConfig {
  data?: Array<{ label: string; value: number }>;
  color?: string;
  showLabels?: boolean;
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
  } = config || {};

  return {
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
