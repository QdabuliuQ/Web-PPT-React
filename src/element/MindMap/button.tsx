import { PanelButton } from "@/components/PanelButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { MindmapMap } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { memo } from "react";
import { CreateMindMap } from ".";

export default function MindMapButton() {
  const pageId = pageActiveStore.getPageActive() as string;

  const handleCreateMindMap = useMemoizedFn(() => {
    const option = CreateMindMap();
    pptStore.addElementInfo(pageId, option);
    if (pageActiveStore.getPageActive()) {
      elementActiveStore.setElementActive(option.id);
    }
  });

  return (
    <PanelButton 
      icon={<MindmapMap theme="outline" size="24" fill="#333" />}
      title="思维导图"
      onClick={handleCreateMindMap}
    />
  );
}

export const MindMapButtonComponent = memo(observer(MindMapButton));
