import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { observer } from "mobx-react-lite";
import { type FC } from "react";
import { LegendPanel } from "../../components/legendPanel";
import type { IChartProps } from "../../index";
import { Pie1ChartPanel } from "./index1Panel";

export const PieChartPanel: FC = observer(() => {
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
      {chartInfo.chartType === "pie1" && (
        <>
          <LegendPanel />
          <Pie1ChartPanel />
        </>
      )}
    </>
  );
});
