import type { MenuItem } from "@/hooks/useContextMenu";
import { Download, PreviewOpen } from "@icon-park/react";
import i18n from "@/i18n";

export interface ImageMenuProps {
  onPreview: () => void;
  onDownload: () => void;
}

export const getImageMenuItems = ({
  onPreview,
  onDownload,
}: ImageMenuProps): MenuItem[] => {
  const t = i18n.t.bind(i18n);
  
  return [
    {
      type: "item",
      label: t('elements.image.preview'),
      icon: <PreviewOpen theme="outline" size="13" fill="var(--icon-color)" />,
      onClick: () => {
        onPreview();
      },
    },
    {
      type: "item",
      label: t('elements.image.downloadImage'),
      icon: <Download theme="outline" size="13" fill="var(--icon-color)" />,
      onClick: () => {
        onDownload();
      },
    },
    {
      type: "separator",
    },
  ];
};
