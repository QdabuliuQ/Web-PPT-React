import type { MenuItem } from "@/hooks/useContextMenu";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { Download, EditOne, PreviewOpen } from "@icon-park/react";
import type { IMindMapProps } from "./index";

export interface MindMapMenuProps {
  onEdit: () => void;
  onPreview: () => void;
  onDownload?: () => void;
}

export const getMindMapMenuItems = ({
  onEdit,
  onPreview,
  onDownload,
}: MindMapMenuProps): MenuItem[] => {
  const pageId = pageActiveStore.getPageActive();
  const elementId = elementActiveStore.getElementActive();

  if (!pageId || !elementId) return [];

  const mindMapInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IMindMapProps | null;

  if (!mindMapInfo) return [];

  const menuItems: MenuItem[] = [
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
  ];

  // 如果有预览图片且提供了下载回调，添加下载选项
  const previewImage = (mindMapInfo as any)?.previewImage;
  if (previewImage && onDownload) {
    menuItems.push({
      type: "item",
      label: "下载图片",
      icon: <Download theme="outline" size="13" fill="#333" />,
      onClick: onDownload,
    });
  }

  menuItems.push({
    type: "separator",
  });

  return menuItems;
};
