"use client";

import type { IChartProps } from "@/element/Chart";
import * as echarts from "echarts";

/** 取 option.backgroundColor；全透明则用 transparent */
function resolveExportBackground(
  option?: echarts.EChartsOption
): string {
  const bg = option?.backgroundColor;
  if (typeof bg !== "string" || !bg.trim()) return "transparent";
  const value = bg.trim();
  if (value === "transparent") return "transparent";
  const rgba = value.match(
    /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*([\d.]+))?\s*\)/i
  );
  if (rgba && rgba[1] !== undefined && Number(rgba[1]) === 0) {
    return "transparent";
  }
  return value;
}

/**
 * ECharts → PNG，供 PPT 以图片插入（背景跟随 option.backgroundColor）
 */
export async function exportChartAsDataUrl(
  el: IChartProps
): Promise<string | null> {
  if (!el.option) {
    console.warn(`图表 ${el.id} 缺少 option`);
    return null;
  }

  const width = Math.max(1, Math.round(el.width || 300));
  const height = Math.max(1, Math.round(el.height || 200));
  const backgroundColor = resolveExportBackground(
    el.option as echarts.EChartsOption
  );

  const container = document.createElement("div");
  container.style.cssText = `position:fixed;left:-9999px;top:0;width:${width}px;height:${height}px;`;
  document.body.appendChild(container);

  let chart: echarts.ECharts | null = null;
  try {
    chart = echarts.init(container, undefined, {
      renderer: "canvas",
      width,
      height,
    });

    const option = {
      ...(el.option as echarts.EChartsOption),
      animation: false,
    };
    chart.setOption(option, true);

    await new Promise<void>((resolve) => {
      const done = () => resolve();
      chart!.on("finished", done);
      setTimeout(done, 400);
    });

    const dataUrl = chart.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor,
    });

    if (!dataUrl || dataUrl.length < 100) {
      console.warn(`图表 ${el.id} getDataURL 为空`);
      return null;
    }
    return dataUrl;
  } catch (err) {
    console.warn(`图表 ${el.id} 栅格化失败:`, err);
    return null;
  } finally {
    chart?.dispose();
    container.remove();
  }
}
