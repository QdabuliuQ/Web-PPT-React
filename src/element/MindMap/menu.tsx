import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { Delete, Copy, Lock, Unlock } from "@icon-park/react";
import type { MenuItem } from "@/hooks/useContextMenu";
import type { IMindMapProps } from "./index";

export const getMindMapMenuItems = (): MenuItem[] => {
  const pageId = pageActiveStore.getPageActive();
  const elementId = elementActiveStore.getElementActive();

  if (!pageId || !elementId) return [];

  const mindMapInfo = pptStore.getElementInfo(
    pageId,
    elementId
  ) as IMindMapProps | null;

  if (!mindMapInfo) return [];

  const handleDelete = () => {
    if (pageId && elementId) {
      pptStore.removeElementInfo(pageId, elementId);
      elementActiveStore.resetElementActive();
    }
  };

  const handleCopy = () => {
    if (pageId && elementId) {
      const newElement = {
        ...mindMapInfo,
        id: `mindmap_${Date.now()}`,
        x: mindMapInfo.x + 20,
        y: mindMapInfo.y + 20,
      };
      pptStore.addElementInfo(pageId, newElement);
      elementActiveStore.setElementActive(newElement.id);
    }
  };

  const handleToggleReadonly = () => {
    if (pageId && elementId) {
      const updated = {
        ...mindMapInfo,
        readonly: !mindMapInfo.readonly,
      };
      pptStore.updateElementInfo(pageId, elementId, updated);
    }
  };

  return [
    {
      type: "item",
      label: "复制",
      icon: <Copy theme="outline" size="13" fill="#333" />,
      onClick: handleCopy,
    },
    {
      type: "item",
      label: mindMapInfo.readonly ? "取消只读" : "设为只读",
      icon: mindMapInfo.readonly ? (
        <Unlock theme="outline" size="13" fill="#333" />
      ) : (
        <Lock theme="outline" size="13" fill="#333" />
      ),
      onClick: handleToggleReadonly,
    },
    {
      type: "separator",
    },
    {
      type: "item",
      label: "删除",
      icon: <Delete theme="outline" size="13" fill="#333" />,
      onClick: handleDelete,
    },
  ];
};

