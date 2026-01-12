import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { memo, type FC } from "react";
import { LegendPanel } from "../../components/legendPanel";
import { XAxisPanel } from "../../components/xAxisPanel";
import { YAxisPanel } from "../../components/yAxisPanel";
import type { IChartProps } from "../../index";
import { Bar2ChartPanel } from "./index2Panel";

export const BarChartPanel: FC = memo(() => {
  // 使用 Zustand hooks 订阅状态变化
  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const getElementInfo = usePPTStore((state) => state.getElementInfo);

  if (!pageId || !elementId) return null;

  const chartInfo = getElementInfo(pageId, elementId) as IChartProps | null;

  if (!chartInfo) return null;

  return (
    <>
      {(chartInfo.chartType === "bar1" || chartInfo.chartType === "bar4") && (
        <>
          <XAxisPanel />
          <YAxisPanel />
        </>
      )}
      {chartInfo.chartType === "bar4" && <LegendPanel />}
      {(chartInfo.chartType === "bar2" || chartInfo.chartType === "bar3") && (
        <>
          <Bar2ChartPanel />
        </>
      )}
    </>
  );
});
