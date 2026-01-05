import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { observer } from "mobx-react-lite";
import { type FC } from "react";
import type { IChartProps } from "../../index";
import { Radar1ChartPanel } from "./index1Panel";

export const RadarChartPanel: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  if (!pageId || !elementId) return null;

  const chartInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IChartProps | null;

  if (!chartInfo) return null;

  return <>{chartInfo.chartType === "radar1" && <Radar1ChartPanel />}</>;
});
