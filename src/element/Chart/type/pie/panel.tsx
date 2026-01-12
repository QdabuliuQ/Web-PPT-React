import {
  useElementActiveStore,
  usePageActiveStore,
  usePPTStore,
} from "@/store";
import { memo, type FC } from "react";
import { LegendPanel } from "../../components/legendPanel";
import type { IChartProps } from "../../index";
import { Pie1ChartPanel } from "./index1Panel";

export const PieChartPanel: FC = memo(() => {
  // 使用 Zustand hooks 订阅状态变化
  const elementId = useElementActiveStore((state) => state.elementActive);
  const pageId = usePageActiveStore((state) => state.pageActive);
  const getElementInfo = usePPTStore((state) => state.getElementInfo);

  if (!pageId || !elementId) return null;

  const chartInfo = getElementInfo(pageId, elementId) as IChartProps | null;

  if (!chartInfo) return null;

  return (
    <>
      {(chartInfo.chartType === "pie1" || chartInfo.chartType === "pie2") && (
        <>
          <LegendPanel />
          <Pie1ChartPanel />
        </>
      )}
    </>
  );
});
