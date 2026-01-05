import { cloneDeep } from "@/utils";

/**
 * 应用覆盖值到默认配置的辅助函数
 * @param defaultOption - 默认配置对象
 * @param overrides - 可选的覆盖对象，支持嵌套路径如 {'textStyle.fontSize': 20}
 * @returns 返回应用了覆盖值的配置对象
 */
function applyOverrides<T extends Record<string, any>>(
  defaultOption: T,
  overrides?: Record<string, any>
): T {
  if (!overrides) {
    return defaultOption;
  }

  // 深拷贝默认配置
  const result = cloneDeep(defaultOption);

  // 处理覆盖值，支持嵌套路径
  for (const [key, value] of Object.entries(overrides)) {
    const keys = key.split(".");
    let current: any = result;

    // 遍历路径，创建嵌套对象（如果不存在）
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k] || typeof current[k] !== "object") {
        current[k] = {};
      }
      current = current[k];
    }

    // 设置最终值
    const finalKey = keys[keys.length - 1];
    current[finalKey] = value;
  }

  return result;
}

/**
 * 获取图表标题的默认配置选项
 * @param overrides - 可选的覆盖对象，支持嵌套路径如 {'textStyle.fontSize': 20}
 * @returns 返回默认的标题配置对象，已应用覆盖值
 */
export function getTitleDefaultOption(overrides?: Record<string, any>): {
  text: string;
  show: boolean;
  textStyle: {
    color: string;
    fontStyle: "normal";
    fontWeight: "bold";
    fontSize: number;
    textShadowColor: string;
    textShadowBlur: number;
    textShadowOffsetX: number;
    textShadowOffsetY: number;
  };
  subtext: string;
  subtextStyle: {
    color: string;
    fontStyle: "normal";
    fontWeight: "bold";
    fontSize: number;
    textShadowColor: string;
    textShadowBlur: number;
    textShadowOffsetX: number;
    textShadowOffsetY: number;
  };
  left: number;
  top: number;
} {
  const defaultOption = {
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

  return applyOverrides(defaultOption, overrides);
}

/**
 * 获取 X 轴的默认配置选项
 * @param overrides - 可选的覆盖对象，支持嵌套路径如 {'axisLabel.fontSize': 14}
 * @returns 返回默认的 X 轴配置对象，已应用覆盖值
 */
export function getXAxisDefaultOption(overrides?: Record<string, any>) {
  const defaultOption = {
    show: true,
    name: "",
    nameLocation: "end" as const,
    nameTextStyle: {
      color: "#666",
      fontSize: 12,
      fontStyle: "normal" as const,
      fontWeight: "normal" as const,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: "#666",
        width: 1,
        type: "solid" as const,
        shadowBlur: 0,
        shadowColor: "transparent",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        opacity: 1,
      },
    },
    axisLabel: {
      show: true,
      color: "#666",
      rotate: 0,
      fontSize: 12,
      fontStyle: "normal" as const,
      fontWeight: "normal" as const,
      shadowColor: "transparent",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    axisTick: {
      show: true,
      length: 5,
      lineStyle: {
        color: "#ccc",
        width: 1,
        type: "solid" as const,
        opacity: 1,
      },
    },
  };

  return applyOverrides(defaultOption, overrides);
}

/**
 * 获取 Y 轴的默认配置选项
 * @param overrides - 可选的覆盖对象，支持嵌套路径如 {'axisLabel.fontSize': 14}
 * @returns 返回默认的 Y 轴配置对象，已应用覆盖值
 */
export function getYAxisDefaultOption(overrides?: Record<string, any>) {
  const defaultOption = {
    show: true,
    name: "",
    nameLocation: "end" as const,
    nameTextStyle: {
      color: "#666",
      fontSize: 12,
      fontStyle: "normal" as const,
      fontWeight: "normal" as const,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    type: "value" as const,
    axisLine: {
      show: true,
      lineStyle: {
        color: "#666",
        width: 1,
        type: "solid" as const,
        shadowBlur: 0,
        shadowColor: "transparent",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        opacity: 1,
      },
    },
    axisLabel: {
      show: true,
      color: "#666",
      rotate: 0,
      fontSize: 12,
      fontStyle: "normal" as const,
      fontWeight: "normal" as const,
      shadowColor: "transparent",
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    axisTick: {
      show: true,
      length: 5,
      lineStyle: {
        color: "#ccc",
        width: 1,
        type: "solid" as const,
        opacity: 1,
      },
    },
  };

  return applyOverrides(defaultOption, overrides);
}

/**
 * 获取图表颜色的默认配置选项
 * @returns 返回默认的颜色数组
 */
export function getColorDefaultOption(): string[] {
  return [
    "#5F95FF",
    "#91CC75",
    "#FAC858",
    "#EE6666",
    "#73C0DE",
    "#3BA272",
    "#FC8452",
    "#9A60B4",
    "#EA7CCC",
  ];
}

/**
 * 获取图例的默认配置选项
 * @param overrides - 可选的覆盖对象，支持嵌套路径如 {'textStyle.fontSize': 20}
 * @returns 返回默认的图例配置对象，已应用覆盖值
 */
export function getLegendDefaultOption(overrides?: Record<string, any>) {
  const defaultOption = {
    show: false,
    icon: "roundRect" as const,
    left: 0,
    top: 0,
    itemWidth: 25,
    itemHeight: 14,
    textStyle: {
      color: "#333",
      fontSize: 12,
      fontStyle: "normal" as const,
      fontWeight: "normal" as const,
      textShadowColor: "transparent",
      textShadowBlur: 0,
      textShadowOffsetX: 0,
      textShadowOffsetY: 0,
    },
    itemStyle: {
      borderColor: "transparent",
      borderWidth: 0,
      borderType: "solid" as const,
      opacity: 1,
      shadowBlur: 0,
      shadowColor: "transparent",
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    },
  };
  return applyOverrides(defaultOption, overrides);
}
