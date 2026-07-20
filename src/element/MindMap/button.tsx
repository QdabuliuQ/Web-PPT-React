import { PanelButton } from "@/components/PanelButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { MindmapMap } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { CreateMindMap } from ".";

export default function MindMapButton() {
  const { t } = useTranslation();
  const pageId = pageActiveStore.getPageActive() as string;

  const handleCreateMindMap = useMemoizedFn(() => {
    const option = CreateMindMap();
    const ok = pptStore.addElementInfo(pageId, option);
    if (ok && pageActiveStore.getPageActive()) {
      elementActiveStore.setElementActive(option.id);
    }
  });

  return (
    <PanelButton 
      icon={<MindmapMap theme="outline" size="24" fill="currentColor" />}
      title={t('elements.mindMap.button')}
      onClick={handleCreateMindMap}
    />
  );
}

export const MindMapButtonComponent = memo(MindMapButton);
