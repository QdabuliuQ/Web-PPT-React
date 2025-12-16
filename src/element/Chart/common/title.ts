import type { EChartsOption } from "echarts";

export default function getTitleOption(
  option: EChartsOption["title"] = {}
): EChartsOption["title"] {
  return {
    text: "标题",
    show: true,
    textStyle: {
      color: "#333",
      fontStyle: "normal",
      fontWeight: "bold",
      fontSize: 18,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    subtext: "",
    subtextStyle: {
      color: "#aaa",
      fontStyle: "normal",
      fontWeight: "bold",
      fontSize: 12,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    left: 0,
    top: 0,
    ...option,
  };
}
