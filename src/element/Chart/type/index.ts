// 柱状图
export {
  getBarChartOption1,
  getDataToExcel as getBarChart1DataToExcel,
  setDataFromExcel as setBarChart1DataFromExcel,
  type BarChartConfig,
} from "./bar/index1";
export {
  getBarChartOption2,
  getDataToExcel as getBarChart2DataToExcel,
  setDataFromExcel as setBarChart2DataFromExcel,
  type PolarBarChartConfig,
} from "./bar/index2";
export {
  getBarChartOption3,
  getDataToExcel as getBarChart3DataToExcel,
  setDataFromExcel as setBarChart3DataFromExcel,
  type TangentialPolarBarChartConfig,
} from "./bar/index3";
export {
  getBarChartOption4,
  getDataToExcel as getBarChart4DataToExcel,
  setDataFromExcel as setBarChart4DataFromExcel,
  type HorizontalBarChartConfig,
} from "./bar/index4";

// 折线图
export {
  getLineChartOption1,
  getDataToExcel as getLineChart1DataToExcel,
  setDataFromExcel as setLineChart1DataFromExcel,
  type LineChartConfig,
} from "./line/index1";
export {
  getLineChartOption2,
  getDataToExcel as getLineChart2DataToExcel,
  setDataFromExcel as setLineChart2DataFromExcel,
} from "./line/index2";
export {
  getLineChartOption3,
  getDataToExcel as getLineChart3DataToExcel,
  setDataFromExcel as setLineChart3DataFromExcel,
} from "./line/index3";

// 饼图
export {
  getPieChartOption,
  getDataToExcel as getPieChartDataToExcel,
  setDataFromExcel as setPieChartDataFromExcel,
  type PieChartConfig,
} from "./pie/index1";

// 散点图
export {
  getScatterChartOption,
  getDataToExcel as getScatterChartDataToExcel,
  setDataFromExcel as setScatterChartDataFromExcel,
  type ScatterChartConfig,
} from "./scatter/index1";

// 雷达图
export {
  getRadarChartOption,
  getDataToExcel as getRadarChartDataToExcel,
  setDataFromExcel as setRadarChartDataFromExcel,
  type RadarChartConfig,
} from "./radar/index1";

export type ChartType = "bar" | "line" | "pie" | "scatter" | "radar";
