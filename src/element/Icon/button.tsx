import { PanelButton } from "@/components/PanelButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { DiamondThree } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { memo } from "react";
import { CreateIcon } from ".";
import { IconPicker } from "./IconPicker";

export default function IconButton() {
  const pageId = pageActiveStore.getPageActive() as string;

  const handleIconSelect = useMemoizedFn((iconName: string) => {
    const option = CreateIcon({ iconName });
    pptStore.addElementInfo(pageId, option);
    if (pageActiveStore.getPageActive()) {
      elementActiveStore.setElementActive(option.id);
    }
  });

  return (
    <IconPicker onIconSelect={handleIconSelect}>
      <PanelButton
        icon={<DiamondThree theme="outline" size="24" fill="#333" />}
        title="图标"
      />
    </IconPicker>
  );
}

export const IconButtonComponent = memo(IconButton);
