import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { observer } from "mobx-react-lite";
import { type FC } from "react";
import { LegendPanel } from "../../components/legendPanel";
import { XAxisPanel } from "../../components/xAxisPanel";
import { YAxisPanel } from "../../components/yAxisPanel";
import type { IChartProps } from "../../index";
import { Line1ChartPanel } from "./index1Panel";
import { Line2ChartPanel } from "./index2Panel";
import { Line4ChartPanel } from "./index4Panel";

export const LineChartPanel: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  if (!pageId || !elementId) return null;

  const chartInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IChartProps | null;

  if (!chartInfo) return null;

  return (
    <>
      {(chartInfo.chartType === "line1" ||
        chartInfo.chartType === "line2" ||
        chartInfo.chartType === "line3" ||
        chartInfo.chartType === "line4") && (
        <>
          <XAxisPanel />
          <YAxisPanel />
        </>
      )}
      {chartInfo.chartType === "line1" && <Line1ChartPanel />}
      {(chartInfo.chartType === "line2" || chartInfo.chartType === "line3") && (
        <>
          <Line2ChartPanel />
          {chartInfo.chartType === "line2" && <LegendPanel />}
        </>
      )}
      {chartInfo.chartType === "line4" && (
        <>
          <Line4ChartPanel />
          <LegendPanel />
        </>
      )}
    </>
  );
});
