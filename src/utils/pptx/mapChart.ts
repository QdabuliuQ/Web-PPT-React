import type { IChartProps } from "@/element/Chart";
import * as echarts from "echarts";
import type PptxGenJS from "pptxgenjs";
import { positionFromElement } from "./helpers";

type ChartKind = "bar" | "line" | "pie" | "scatter" | "radar" | "doughnut";

function getDatasetSource(option?: echarts.EChartsOption): any[][] | null {
  if (!option) return null;
  const dataset = Array.isArray(option.dataset)
    ? option.dataset[0]
    : option.dataset;
  const source = (dataset as any)?.source;
  if (Array.isArray(source) && source.length > 1) {
    return source as any[][];
  }
  return null;
}

function mapChartKind(chartType: string): ChartKind | null {
  const match = chartType.match(/^([a-z]+)\d+$/);
  const type = match?.[1] || chartType;
  switch (type) {
    case "bar":
      return "bar";
    case "line":
      return "line";
    case "pie":
      return "pie";
    case "scatter":
      return "scatter";
    case "radar":
      return "radar";
    case "doughnut":
      return "doughnut";
    case "funnel":
      return null; // 无原生支持，走图片
    default:
      return null;
  }
}

/**
 * 从 ECharts option 提取 PptxGenJS 图表数据
 * 支持常见 dataset: [["label","value"], ...] 或 [["cat","s1","s2"], ...]
 */
export function extractChartData(
  option: echarts.EChartsOption | undefined,
  kind: ChartKind
): { labels: string[]; series: Array<{ name: string; values: number[] }> } | null {
  const source = getDatasetSource(option);
  if (!source || source.length < 2) return null;

  const header = source[0];
  const rows = source.slice(1);
  if (!Array.isArray(header) || header.length < 2) return null;

  // scatter: 常为 [x, y] 数值对
  if (kind === "scatter") {
    const xs: number[] = [];
    const ys: number[] = [];
    for (const row of rows) {
      const x = Number(row[0]);
      const y = Number(row[1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      xs.push(x);
      ys.push(y);
    }
    if (xs.length === 0) return null;
    return {
      labels: xs.map(String),
      series: [{ name: String(header[1] ?? "value"), values: ys }],
    };
  }

  // 单系列或多系列：第 0 列为类目
  const labels = rows.map((r) => String(r[0] ?? ""));
  const series: Array<{ name: string; values: number[] }> = [];

  for (let col = 1; col < header.length; col++) {
    series.push({
      name: String(header[col] ?? `系列${col}`),
      values: rows.map((r) => {
        const n = Number(r[col]);
        return Number.isFinite(n) ? n : 0;
      }),
    });
  }

  if (series.length === 0) return null;
  return { labels, series };
}

async function renderChartAsDataUrl(
  el: IChartProps
): Promise<string | null> {
  if (!el.option) return null;

  const container = document.createElement("div");
  container.style.width = `${el.width}px`;
  container.style.height = `${el.height}px`;
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  try {
    const chart = echarts.init(container, undefined, {
      renderer: "canvas",
      width: el.width,
      height: el.height,
    });
    chart.setOption(el.option as echarts.EChartsOption);
    await new Promise((r) => setTimeout(r, 100));
    const dataUrl = chart.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
    chart.dispose();
    return dataUrl || null;
  } catch (err) {
    console.warn("图表离屏渲染失败:", err);
    return null;
  } finally {
    document.body.removeChild(container);
  }
}

export async function addChartElement(
  slide: PptxGenJS.Slide,
  el: IChartProps,
  pptx: PptxGenJS
): Promise<void> {
  const pos = positionFromElement(el);
  const kind = mapChartKind(el.chartType || "");

  if (kind) {
    const extracted = extractChartData(el.option, kind);
    if (extracted) {
      try {
        const chartType =
          kind === "bar"
            ? pptx.ChartType.bar
            : kind === "line"
              ? pptx.ChartType.line
              : kind === "pie"
                ? pptx.ChartType.pie
                : kind === "scatter"
                  ? pptx.ChartType.scatter
                  : kind === "radar"
                    ? pptx.ChartType.radar
                    : pptx.ChartType.doughnut;

        const data = extracted.series.map((s) => ({
          name: s.name,
          labels: extracted.labels,
          values: s.values,
        }));

        slide.addChart(chartType, data, {
          ...pos,
          showTitle: false,
          showLegend: extracted.series.length > 1,
        });
        return;
      } catch (err) {
        console.warn("原生图表导出失败，回退为图片:", err);
      }
    }
  }

  const dataUrl = await renderChartAsDataUrl(el);
  if (dataUrl) {
    slide.addImage({ ...pos, data: dataUrl });
  }
}
