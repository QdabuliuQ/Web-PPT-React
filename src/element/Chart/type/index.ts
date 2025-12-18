// 柱状图
export { getBarChartOption1, type BarChartConfig } from "./bar/index1";
export { getBarChartOption2, type PolarBarChartConfig } from "./bar/index2";

// 折线图
export { getLineChartOption1, type LineChartConfig } from "./line/index1";
export { getLineChartOption2 } from "./line/index2";
export { getLineChartOption3 } from "./line/index3";

// 饼图
export { getPieChartOption, type PieChartConfig } from "./pie/index1";

// 散点图
export {
  getScatterChartOption,
  type ScatterChartConfig,
} from "./scatter/index1";

// 雷达图
export { getRadarChartOption, type RadarChartConfig } from "./radar/index1";

export type ChartType = "bar" | "line" | "pie" | "scatter" | "radar";
