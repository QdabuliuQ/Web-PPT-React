import { PanelCommonSetting } from "@/components/PanelCommonSetting";
import { PanelLargeButton } from "@/components/PanelLargeButton";
import { PanelSplitLine } from "@/components/PanelSplitLine";
import { usePositionElement, type Position } from "@/hooks/usePositionElement";
import { useZIndexElement } from "@/hooks/useZIndexElement";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { Download, PreviewOpen } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import html2canvas from "html2canvas";
import { observer } from "mobx-react-lite";
import { type FC } from "react";
import type { IMindMapProps } from "./index";

export const MindMapPanelKey = "mindmap";
export const MindMapPanelTitle = "思维导图";

const MindMapPanelComponent: FC = observer(() => {
  const elementId = elementActiveStore.getElementActive();
  const pageId = pageActiveStore.getPageActive();

  const { positionHandle } = usePositionElement(pageId || "", elementId || "");
  const { toFrontHandle, sendForwardHandle, sendBackwardHandle, toBackHandle } =
    useZIndexElement(pageId || "", elementId || "");

  if (!pageId || !elementId) return null;

  const mindMapInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IMindMapProps | null;

  if (!mindMapInfo) return null;

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

  // 导出为 PNG
  const handleExportPNG = useMemoizedFn(async () => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#fff",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `mindmap_${elementId}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error("导出失败:", error);
    }
  });

  // 预览（在新窗口打开）
  const handlePreview = useMemoizedFn(() => {
    const data = mindMapInfo.data;
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  });

  return (
    <div>
      <PanelCommonSetting
        onPositionChange={(key) => positionHandle(key as Position)}
        onZIndexChange={onZIndexChange}
      />
      <PanelSplitLine />
      <PanelLargeButton
        icon={<Download theme="outline" size="16" fill="#333" />}
        title="导出图片"
        onClick={handleExportPNG}
      />
      <PanelLargeButton
        icon={<PreviewOpen theme="outline" size="16" fill="#333" />}
        title="预览数据"
        onClick={handlePreview}
      />
    </div>
  );
});

export const MindMapPanel = MindMapPanelComponent;
