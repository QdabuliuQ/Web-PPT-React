// 柱状图
export {
  getDataToExcel as getBarChart1DataToExcel,
  getBarChartOption1,
  setDataFromExcel as setBarChart1DataFromExcel,
  type BarChartConfig,
} from "./bar/index1";
export {
  getDataToExcel as getBarChart2DataToExcel,
  getBarChartOption2,
  setDataFromExcel as setBarChart2DataFromExcel,
  type PolarBarChartConfig,
} from "./bar/index2";
export {
  getDataToExcel as getBarChart3DataToExcel,
  getBarChartOption3,
  setDataFromExcel as setBarChart3DataFromExcel,
  type TangentialPolarBarChartConfig,
} from "./bar/index3";
export {
  getDataToExcel as getBarChart4DataToExcel,
  getBarChartOption4,
  setDataFromExcel as setBarChart4DataFromExcel,
  type HorizontalBarChartConfig,
} from "./bar/index4";

// 折线图
export {
  getDataToExcel as getLineChart1DataToExcel,
  getLineChartOption1,
  setDataFromExcel as setLineChart1DataFromExcel,
  type LineChartConfig,
} from "./line/index1";
export {
  getDataToExcel as getLineChart2DataToExcel,
  getLineChartOption2,
  setDataFromExcel as setLineChart2DataFromExcel,
  type StackedLineChartConfig,
} from "./line/index2";
export {
  getDataToExcel as getLineChart3DataToExcel,
  getLineChartOption3,
  setDataFromExcel as setLineChart3DataFromExcel,
} from "./line/index3";

// 饼图
export {
  getDataToExcel as getPieChartDataToExcel,
  getPieChartOption,
  setDataFromExcel as setPieChartDataFromExcel,
  type PieChartConfig,
} from "./pie/index1";

// 散点图
export {
  getDataToExcel as getScatterChartDataToExcel,
  getScatterChartOption,
  setDataFromExcel as setScatterChartDataFromExcel,
  type ScatterChartConfig,
} from "./scatter/index1";

// 雷达图
export {
  getDataToExcel as getRadarChartDataToExcel,
  getRadarChartOption,
  setDataFromExcel as setRadarChartDataFromExcel,
  type RadarChartConfig,
} from "./radar/index1";

export type ChartType = "bar" | "line" | "pie" | "scatter" | "radar";
