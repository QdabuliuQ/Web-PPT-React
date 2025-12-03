import type { MenuItem } from "@/hooks/useContextMenu";
import { PreviewOpen } from "@icon-park/react";

export interface ImageMenuProps {
  onPreview: () => void;
}

export const getImageMenuItems = ({
  onPreview,
}: ImageMenuProps): MenuItem[] => {
  return [
    {
      type: "item",
      label: "预览",
      icon: <PreviewOpen theme="outline" size="13" fill="#333" />,
      onClick: () => {
        console.log("123123");

        onPreview();
      },
    },
    {
      type: "separator",
    },
  ];
};
