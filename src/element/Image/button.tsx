import { PanelButton } from "@/components/PanelButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { ImageFiles } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { memo } from "react";
import { CreateImage } from ".";

export default function ImageButton() {
  const handleClick = useMemoizedFn(() => {
    const pageId = pageActiveStore.getPageActive();
    if (!pageId) return;

    const option = CreateImage();
    pptStore.addElementInfo(pageId, option);
    elementActiveStore.setElementActive(option.id);
  });

  return (
    <PanelButton
      icon={<ImageFiles theme="outline" size="24" fill="#333" />}
      title="图片"
      onClick={handleClick}
    />
  );
}

export const ImageButtonComponent = memo(ImageButton);

