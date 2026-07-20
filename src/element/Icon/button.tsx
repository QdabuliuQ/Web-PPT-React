import { PanelButton } from "@/components/PanelButton";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { DiamondThree } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { CreateIcon } from ".";
import { IconPicker } from "./IconPicker";

export default function IconButton() {
  const { t } = useTranslation();
  const pageId = pageActiveStore.getPageActive() as string;

  const handleIconSelect = useMemoizedFn((iconName: string) => {
    const option = CreateIcon({ iconName });
    const ok = pptStore.addElementInfo(pageId, option);
    if (ok && pageActiveStore.getPageActive()) {
      elementActiveStore.setElementActive(option.id);
    }
  });

  return (
    <IconPicker onIconSelect={handleIconSelect}>
      <PanelButton
        icon={<DiamondThree theme="outline" size="24" fill="currentColor" />}
        title={t('elements.icon.button')}
      />
    </IconPicker>
  );
}

export const IconButtonComponent = memo(IconButton);
