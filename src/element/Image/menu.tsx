import type { MenuItem } from "@/hooks/useContextMenu";
import { Download, PreviewOpen } from "@icon-park/react";

export interface ImageMenuProps {
  onPreview: () => void;
  onDownload: () => void;
}

export const getImageMenuItems = ({
  onPreview,
  onDownload,
}: ImageMenuProps): MenuItem[] => {
  return [
    {
      type: "item",
      label: "预览",
      icon: <PreviewOpen theme="outline" size="13" fill="#333" />,
      onClick: () => {
        onPreview();
      },
    },
    {
      type: "item",
      label: "下载图片",
      icon: <Download theme="outline" size="13" fill="#333" />,
      onClick: () => {
        onDownload();
      },
    },
    {
      type: "separator",
    },
  ];
};
