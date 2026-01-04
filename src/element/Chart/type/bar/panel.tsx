import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { observer } from "mobx-react-lite";
import { type FC } from "react";
import { LegendPanel } from "../../components/legendPanel";
import { XAxisPanel } from "../../components/xAxisPanel";
import { YAxisPanel } from "../../components/yAxisPanel";
import type { IChartProps } from "../../index";
import { Bar2ChartPanel } from "./index2Panel";

export const BarChartPanel: FC = observer(() => {
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
      {(chartInfo.chartType === "bar1" || chartInfo.chartType === "bar4") && (
        <>
          <XAxisPanel />
          <YAxisPanel />
          <LegendPanel />
        </>
      )}
      {(chartInfo.chartType === "bar2" || chartInfo.chartType === "bar3") && (
        <>
          <Bar2ChartPanel />
        </>
      )}
    </>
  );
});
