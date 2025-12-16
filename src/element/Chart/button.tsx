import { PanelButton } from "@/components/PanelButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { ChartLine } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { memo } from "react";
import { CreateChart } from ".";

export default function ChartButton() {
  const pageId = pageActiveStore.getPageActive() as string;

  const handleCreateChart = useMemoizedFn(() => {
    const option = CreateChart();
    pptStore.addElementInfo(pageId, option);
    if (pageActiveStore.getPageActive()) {
      elementActiveStore.setElementActive(option.id);
    }
  });

  return (
    <PanelButton
      icon={<ChartLine theme="outline" size="24" fill="#333" />}
      title="图表"
      onClick={handleCreateChart}
    />
  );
}

export const ChartButtonComponent = memo(observer(ChartButton));
