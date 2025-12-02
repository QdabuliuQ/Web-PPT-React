import type { MenuItem } from "@/hooks/useContextMenu";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { EditOne, PreviewOpen } from "@icon-park/react";
import type { IMindMapProps } from "./index";

export interface MindMapMenuProps {
  onEdit: () => void;
  onPreview: () => void;
}

export const getMindMapMenuItems = ({
  onEdit,
  onPreview,
}: MindMapMenuProps): MenuItem[] => {
  const pageId = pageActiveStore.getPageActive();
  const elementId = elementActiveStore.getElementActive();

  if (!pageId || !elementId) return [];

  const mindMapInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IMindMapProps | null;

  if (!mindMapInfo) return [];

  return [
    {
      type: "item",
      label: "编辑",
      icon: <EditOne theme="outline" size="13" fill="#333" />,
      onClick: onEdit,
    },
    {
      type: "item",
      label: "预览",
      icon: <PreviewOpen theme="outline" size="13" fill="#333" />,
      onClick: onPreview,
    },
    {
      type: "separator",
    },
  ];
};
