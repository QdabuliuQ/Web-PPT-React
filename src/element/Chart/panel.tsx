import { PanelSplitLine } from "@/components";
import { PanelCommonSetting } from "@/components/PanelCommonSetting";
import { usePositionElement, type Position } from "@/hooks/usePositionElement";
import { useZIndexElement } from "@/hooks/useZIndexElement";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import { GridPanel } from "./components/gridPanel";
import { LegendPanel } from "./components/legendPanel";
import { TitlePanel } from "./components/titlePanel";
import { XAxisPanel } from "./components/xAxisPanel";
import { YAxisPanel } from "./components/yAxisPanel";
import type { IChartProps } from "./index";
import { BarChartPanel } from "./type/bar/panel";
import { LineChartPanel } from "./type/line/panel";
import { PieChartPanel } from "./type/pie/panel";
import { RadarChartPanel } from "./type/radar/panel";
import { ScatterChartPanel } from "./type/scatter/panel";

export const ChartPanelKey = "chart";
export const ChartPanelTitle = "图表";

const ChartPanelComponent: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  const { positionHandle } = usePositionElement(pageId || "", elementId || "");
  const { toFrontHandle, sendForwardHandle, sendBackwardHandle, toBackHandle } =
    useZIndexElement(pageId || "", elementId || "");

  if (!pageId || !elementId) return null;

  const chartInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IChartProps | null;

  if (!chartInfo) return null;

  const onZIndexChange = (key: string) => {
    switch (key) {
      case "toFront":
        toFrontHandle();
        break;
      case "sendForward":
        sendForwardHandle();
        break;
      case "sendBackward":
        sendBackwardHandle();
        break;
      case "toBack":
        toBackHandle();
        break;
    }
  };

  // 根据 chartType 渲染对应的 panel 组件
  const TypePanel = useMemo(() => {
    // 解析 chartType，例如 "bar1" -> { type: "bar", index: 1 }
    const match = chartInfo.chartType.match(/^([a-z]+)(\d+)$/);
    if (!match) return null;

    const [, type] = match;

    // 根据类型返回对应的 panel 组件
    switch (type) {
      case "bar":
        return <BarChartPanel />;
      case "line":
        return <LineChartPanel />;
      case "pie":
        return <PieChartPanel />;
      case "scatter":
        return <ScatterChartPanel />;
      case "radar":
        return <RadarChartPanel />;
      default:
        return null;
    }
  }, [chartInfo.chartType]);

  return (
    <>
      <div className="h-[53px] flex gap-[10px] items-center">
        <TitlePanel />
        <GridPanel />
        <XAxisPanel />
        <YAxisPanel />
        <LegendPanel />
        <PanelSplitLine />
        {TypePanel}
        <PanelCommonSetting
          onPositionChange={(key) => positionHandle(key as Position)}
          onZIndexChange={onZIndexChange}
        />
      </div>
    </>
  );
});

export const ChartPanel = ChartPanelComponent;
