import type { ThemeToken } from "../types";

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function palette(primary: string, secondary: string): string[] {
  return [
    primary,
    secondary,
    "#5B8FF9",
    "#61DDAA",
    "#F6BD16",
    "#E8684A",
    "#6DC8EC",
  ];
}

/**
 * 生成偏「咨询报告」气质的 ECharts option（透明底、细轴线、圆角柱、柔和面积）
 */
export function buildThemedChartOption(
  series: Array<{ label: string; value: number }>,
  chartType: string,
  theme: ThemeToken
) {
  const primary = theme.primary;
  const secondary = theme.secondary;
  const labels = series.map((s) => s.label);
  const values = series.map((s) => s.value);
  const colors = palette(primary, secondary);
  const axisLabel = theme.textOnLight || "#4A4A4A";
  const muted = hexToRgba(axisLabel, 0.45);
  const split = hexToRgba(axisLabel, 0.08);

  const base = {
    backgroundColor: "rgba(0,0,0,0)",
    color: colors,
    textStyle: {
      fontFamily: theme.fontBody || "PingFang SC",
      color: axisLabel,
    },
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "rgba(255,255,255,0.96)",
      borderColor: hexToRgba(primary, 0.15),
      borderWidth: 1,
      textStyle: { color: axisLabel, fontSize: 12 },
      extraCssText: "border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.08);",
    },
  };

  if (chartType.startsWith("pie")) {
    const donut = chartType === "pie2" || chartType === "pie3";
    return {
      ...base,
      tooltip: {
        trigger: "item" as const,
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: hexToRgba(primary, 0.15),
        borderWidth: 1,
        textStyle: { color: axisLabel, fontSize: 12 },
      },
      legend: {
        orient: "vertical" as const,
        right: 8,
        top: "middle",
        itemWidth: 10,
        itemHeight: 10,
        icon: "circle",
        textStyle: { color: axisLabel, fontSize: 12, lineHeight: 18 },
      },
      series: [
        {
          type: "pie" as const,
          radius: donut ? (["48%", "72%"] as [string, string]) : "68%",
          center: ["38%", "52%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            color: axisLabel,
            fontSize: 12,
            formatter: "{b}\n{d}%",
          },
          labelLine: {
            length: 12,
            length2: 8,
            lineStyle: { color: muted },
          },
          emphasis: {
            scale: true,
            scaleSize: 6,
            itemStyle: {
              shadowBlur: 16,
              shadowColor: hexToRgba(primary, 0.25),
            },
          },
          data: series.map((s) => ({ name: s.label, value: s.value })),
        },
      ],
    };
  }

  const categoryAxis = {
    type: "category" as const,
    data: labels,
    axisTick: { show: false },
    axisLine: { lineStyle: { color: split } },
    axisLabel: {
      color: muted,
      fontSize: 11,
      interval: 0,
      hideOverlap: true,
    },
  };

  const valueAxis = {
    type: "value" as const,
    axisTick: { show: false },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: split, type: "dashed" as const } },
    axisLabel: { color: muted, fontSize: 11 },
  };

  if (chartType.startsWith("line")) {
    const withArea =
      chartType === "line2" || chartType === "line3" || chartType === "line4";
    return {
      ...base,
      grid: { left: 52, right: 28, top: 40, bottom: 44, containLabel: false },
      legend: { show: false },
      xAxis: categoryAxis,
      yAxis: valueAxis,
      series: [
        {
          type: "line" as const,
          data: values,
          smooth: true,
          symbol: "circle",
          symbolSize: 8,
          showSymbol: values.length <= 8,
          itemStyle: {
            color: primary,
            borderColor: "#fff",
            borderWidth: 2,
          },
          lineStyle: { width: 3, color: primary },
          areaStyle: withArea
            ? {
                color: {
                  type: "linear" as const,
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: hexToRgba(primary, 0.28) },
                    { offset: 1, color: hexToRgba(primary, 0.02) },
                  ],
                },
              }
            : undefined,
          emphasis: {
            focus: "series" as const,
            itemStyle: { shadowBlur: 10, shadowColor: hexToRgba(primary, 0.35) },
          },
        },
      ],
    };
  }

  // 默认柱状 / bar*
  const useGradient = true;
  return {
    ...base,
    grid: { left: 52, right: 28, top: 40, bottom: 44, containLabel: false },
    legend: { show: false },
    xAxis: categoryAxis,
    yAxis: valueAxis,
    series: [
      {
        type: "bar" as const,
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            color: useGradient
              ? {
                  type: "linear" as const,
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: i % 2 === 0 ? primary : secondary,
                    },
                    {
                      offset: 1,
                      color: hexToRgba(i % 2 === 0 ? primary : secondary, 0.55),
                    },
                  ],
                }
              : i % 2 === 0
                ? primary
                : secondary,
            borderRadius: [8, 8, 0, 0],
          },
        })),
        barMaxWidth: 40,
        barCategoryGap: "42%",
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowColor: hexToRgba(primary, 0.28),
          },
        },
      },
    ],
  };
}
