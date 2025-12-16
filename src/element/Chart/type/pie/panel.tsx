import { PanelLargeButton } from "@/components";
import { PanelSplitLine } from "@/components/PanelSplitLine";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { Label } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { type FC } from "react";
import type { IChartProps } from "../../index";

export const PieChartPanel: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  if (!pageId || !elementId) return null;

  const chartInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IChartProps | null;

  if (!chartInfo) return null;

  const handleChange = useMemoizedFn((key: keyof IChartProps, value: any) => {
    pptStore.setElementInfo(pageId, elementId, {
      ...chartInfo,
      [key]: value,
    });
  });

  return (
    <>
      <PanelLargeButton
        active={chartInfo.showLabels}
        icon={<Label theme="outline" size="16" fill="#333" />}
        title="标签"
        onClick={() => handleChange("showLabels", !chartInfo.showLabels)}
      />
      <PanelSplitLine />
    </>
  );
});

