import { PanelCommonSetting } from "@/components/PanelCommonSetting";
import { PanelLargeButton } from "@/components/PanelLargeButton";
import { PanelSplitLine } from "@/components/PanelSplitLine";
import { usePositionElement, type Position } from "@/hooks/usePositionElement";
import { useZIndexElement } from "@/hooks/useZIndexElement";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { Download, Editor } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { type FC } from "react";
import type { IMindMapProps } from "./index";
import { MindMapModal } from "./MindMapModal";
import { useMindMapModal } from "./useMindMapModal";
import { downloadMindMapImage } from "./utils";

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

  // 使用 MindMapModal hook
  const { handleModalOpen, modalProps } = useMindMapModal({
    pageId,
    elementId,
    readonly: false,
  });

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

  // 打开编辑弹窗
  const handleEdit = useMemoizedFn(() => {
    handleModalOpen();
  });

  // 下载图片
  const handleDownloadImage = useMemoizedFn(async () => {
    const previewImage = (mindMapInfo as any)?.previewImage;
    if (!previewImage) {
      console.warn("没有预览图片，无法下载");
      return;
    }
    await downloadMindMapImage(previewImage, elementId);
  });

  return (
    <>
      <div className="h-[53px] flex gap-[10px] items-center">
        <PanelLargeButton
          icon={<Editor theme="outline" size="16" fill="#333" />}
          title="编辑"
          onClick={handleEdit}
        />
        <PanelLargeButton
          icon={<Download theme="outline" size="16" fill="#333" />}
          title="下载图片"
          onClick={handleDownloadImage}
          aspectRatio={false}
        />
        <PanelSplitLine />
        <PanelCommonSetting
          onPositionChange={(key) => positionHandle(key as Position)}
          onZIndexChange={onZIndexChange}
        />
      </div>
      <MindMapModal {...modalProps} />
    </>
  );
});

export const MindMapPanel = MindMapPanelComponent;
