// 柱状图
export {
  getBarChartOption,
  type BarChartConfig,
} from "./bar/index1";

// 折线图
export {
  getLineChartOption,
  type LineChartConfig,
} from "./line/index1";
export { getSmoothLineChartOption } from "./line/index3";
export { getAreaLineChartOption } from "./line/index2";

// 饼图
export {
  getPieChartOption,
  type PieChartConfig,
} from "./pie/index1";

// 散点图
export {
  getScatterChartOption,
  type ScatterChartConfig,
} from "./scatter/index1";

// 雷达图
export {
  getRadarChartOption,
  type RadarChartConfig,
} from "./radar/index1";

export type ChartType = "bar" | "line" | "pie" | "scatter" | "radar";
