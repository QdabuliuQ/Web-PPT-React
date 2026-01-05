import { PanelLargeButton, PanelSplitLine } from "@/components";
import { PanelCommonSetting } from "@/components/PanelCommonSetting";
import { usePositionElement, type Position } from "@/hooks/usePositionElement";
import { useZIndexElement } from "@/hooks/useZIndexElement";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { globalEventBus } from "@/utils/eventBus";
import { Download, EditOne } from "@icon-park/react";
import { observer } from "mobx-react-lite";
import { useMemo, type FC } from "react";
import { ChartDataModal } from "./chartDataModal";
import { BackgroundColorPanel } from "./components/backgroundColorPanel";
import { ColorPanel } from "./components/colorPanel";
import { GridPanel } from "./components/gridPanel";
import { TitlePanel } from "./components/titlePanel";
import { BASE_CHART_EVENTS, getChartEventName } from "./events";
import type { IChartProps } from "./index";
import { BarChartPanel } from "./type/bar/panel";
import { LineChartPanel } from "./type/line/panel";
import { PieChartPanel } from "./type/pie/panel";
import { RadarChartPanel } from "./type/radar/panel";
import { ScatterChartPanel } from "./type/scatter/panel";
import { useChartDataModal } from "./useChartDataModal";
import { exportChartAsImage } from "./utils";

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

  // 使用图表数据编辑弹窗 hook（用于 ChartDataModal 的状态管理）
  const { isDataModalOpen, handleCloseDataModal, handleSaveChartData } =
    useChartDataModal({
      pageId,
      elementId,
    });

  // 通过事件总线发送打开弹窗事件
  const handleOpenDataModalFromPanel = () => {
    const eventName = getChartEventName(
      BASE_CHART_EVENTS.OPEN_DATA_MODAL,
      elementId
    );
    globalEventBus.emit(eventName);
  };

  // 导出图表图片
  const handleExportChartImage = async () => {
    await exportChartAsImage(elementId, "chart", "png");
  };

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
    if (!chartInfo.chartType) return null;
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
        <BackgroundColorPanel />
        <ColorPanel />
        {TypePanel}
        <PanelLargeButton
          title="数据"
          icon={<EditOne theme="outline" size="18" fill="#333" />}
          onClick={handleOpenDataModalFromPanel}
        />
        <PanelLargeButton
          title="下载图片"
          icon={<Download theme="outline" size="18" fill="#333" />}
          onClick={handleExportChartImage}
          aspectRatio={false}
        />
        <PanelSplitLine />
        <PanelCommonSetting
          onPositionChange={(key) => positionHandle(key as Position)}
          onZIndexChange={onZIndexChange}
        />
      </div>
      <ChartDataModal
        open={isDataModalOpen}
        onClose={handleCloseDataModal}
        chartInfo={chartInfo}
        onSave={handleSaveChartData}
      />
    </>
  );
});

export const ChartPanel = ChartPanelComponent;
