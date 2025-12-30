// 生成特定图表组件实例的事件名称
export function getChartEventName(
  baseEventName: string,
  chartId: string
): string {
  return `chart_${chartId}_${baseEventName}`;
}

// 基础事件名称常量
export const BASE_CHART_EVENTS = {
  OPEN_DATA_MODAL: "open_data_modal",
} as const;
