import KeyboardIcon from "@/components/KeyboardIcon";
import type { MenuItem } from "@/hooks/useContextMenu";
import { contextMenuStore, fullscreenStore, pptStore } from "@/store";
import {
  addPageAndActivate,
  deletePageAndFallback,
  duplicatePageAndActivate,
  resetPageElements,
} from "@/utils/operate";
import {
  Add,
  ArrowDown,
  ArrowUp,
  BringForward,
  Clear,
  Copy,
  Delete,
  Export,
  Play,
  PreviewCloseOne,
  PreviewOpen,
  SendBackward,
} from "@icon-park/react";
import { downloadImage, exportPageAsImage, formatKeysForDevice } from "./tool";

interface ShowPageContextMenuOptions {
  pageId: string;
  event: React.MouseEvent;
  onScrollToBottom?: () => void;
}

/**
 * 显示页面右键菜单
 * @param options - 菜单选项
 */
export const showPageContextMenu = (options: ShowPageContextMenuOptions) => {
  const { pageId, event, onScrollToBottom } = options;

  event.preventDefault();
  event.stopPropagation();

  const pages = pptStore.getPages();
  const pageIndex = pages.findIndex((p) => p.id === pageId);
  const currentPage = pages[pageIndex];
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex === pages.length - 1;
  const isVisible = currentPage?.visible !== false;

  const menuItems: MenuItem[] = [
    {
      type: "item" as const,
      label: "新建幻灯片",
      icon: <Add theme="outline" size="13" fill="#333" />,
      onClick: () => {
        addPageAndActivate(pageId);
        contextMenuStore.hideMenu();
        onScrollToBottom?.();
      },
    },
    {
      type: "item" as const,
      label: "复制幻灯片",
      icon: <Copy theme="outline" size="13" fill="#333" />,
      onClick: () => {
        duplicatePageAndActivate(pageId);
        contextMenuStore.hideMenu();
        onScrollToBottom?.();
      },
      tip: <KeyboardIcon keys={formatKeysForDevice(["Ctrl", "C"])} />,
    },
    {
      type: "item" as const,
      label: "删除幻灯片",
      icon: <Delete theme="outline" size="13" fill="#333" />,
      onClick: () => {
        deletePageAndFallback(pageId);
        contextMenuStore.hideMenu();
      },
      disabled: pages.length <= 1,
      tip: <KeyboardIcon keys={formatKeysForDevice(["Ctrl", "D"])} />,
    },
    {
      type: "item" as const,
      label: isVisible ? "隐藏幻灯片" : "显示幻灯片",
      icon: isVisible ? (
        <PreviewCloseOne theme="outline" size="13" fill="#333" />
      ) : (
        <PreviewOpen theme="outline" size="13" fill="#333" />
      ),
      onClick: () => {
        pptStore.togglePageVisible(pageId);
        contextMenuStore.hideMenu();
      },
      tip: <KeyboardIcon keys={formatKeysForDevice(["Ctrl", "H"])} />,
    },
    {
      type: "separator",
    },
    {
      type: "item" as const,
      label: "播放幻灯片",
      icon: <Play theme="outline" size="13" fill="#333" />,
      onClick: () => {
        fullscreenStore.enterFullscreen(pageId);
        contextMenuStore.hideMenu();
      },
      tip: <KeyboardIcon keys={formatKeysForDevice(["Ctrl", "P"])} />,
    },
    {
      type: "item" as const,
      label: "重置幻灯片",
      icon: <Clear theme="outline" size="13" fill="#333" />,
      onClick: () => {
        resetPageElements(pageId);
        contextMenuStore.hideMenu();
      },
      tip: <KeyboardIcon keys={formatKeysForDevice(["Ctrl", "R"])} />,
    },
    {
      type: "item" as const,
      label: "导出图片",
      icon: <Export theme="outline" size="13" fill="#333" />,
      onClick: async () => {
        const dataUrl = await exportPageAsImage(pageId);
        if (dataUrl) {
          const name = pptStore.getName();
          downloadImage(dataUrl, `${name || "未命名"}_${pageId}.png`);
        }
        contextMenuStore.hideMenu();
      },
    },
    {
      type: "separator",
    },
    {
      type: "item" as const,
      label: "上移",
      icon: <ArrowUp theme="outline" size="13" fill="#333" />,
      onClick: () => {
        pptStore.movePage(pageId, "up");
        contextMenuStore.hideMenu();
      },
      disabled: isFirstPage,
    },
    {
      type: "item" as const,
      label: "下移",
      icon: <ArrowDown theme="outline" size="13" fill="#333" />,
      onClick: () => {
        pptStore.movePage(pageId, "down");
        contextMenuStore.hideMenu();
      },
      disabled: isLastPage,
    },
    {
      type: "item" as const,
      label: "移动到最前",
      icon: <BringForward theme="outline" size="13" fill="#333" />,
      onClick: () => {
        pptStore.movePage(pageId, "first");
        contextMenuStore.hideMenu();
      },
      disabled: isFirstPage,
    },
    {
      type: "item" as const,
      label: "移动到最后",
      icon: <SendBackward theme="outline" size="13" fill="#333" />,
      onClick: () => {
        pptStore.movePage(pageId, "last");
        contextMenuStore.hideMenu();
      },
      disabled: isLastPage,
    },
  ];

  contextMenuStore.showMenu(menuItems, event);
};
