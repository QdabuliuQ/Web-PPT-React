import type { MenuItem } from "@/hooks/useContextMenu";
import {
  contextMenuStore,
  elementActiveStore,
  fullscreenStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import {
  Add,
  ArrowDown,
  ArrowUp,
  BringForward,
  Copy,
  Delete,
  Play,
  PreviewCloseOne,
  PreviewOpen,
  SendBackward,
} from "@icon-park/react";

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
  const pageActive = pageActiveStore.getPageActive();
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
        const newPageId = pptStore.addPage(pageId);
        elementActiveStore.resetElementActive();
        pageActiveStore.setPageActive(newPageId);
        contextMenuStore.hideMenu();
        onScrollToBottom?.();
      },
    },
    {
      type: "item" as const,
      label: "复制幻灯片",
      icon: <Copy theme="outline" size="13" fill="#333" />,
      onClick: () => {
        const newPageId = pptStore.duplicatePage(pageId);
        if (newPageId) {
          elementActiveStore.resetElementActive();
          pageActiveStore.setPageActive(newPageId);
        }
        contextMenuStore.hideMenu();
        onScrollToBottom?.();
      },
    },
    {
      type: "item" as const,
      label: "删除幻灯片",
      icon: <Delete theme="outline" size="13" fill="#333" />,
      onClick: () => {
        const success = pptStore.deletePage(pageId);
        if (success) {
          elementActiveStore.resetElementActive();
          if (pageActive === pageId) {
            const remainingPages = pptStore.getPages();
            if (remainingPages.length > 0) {
              pageActiveStore.setPageActive(remainingPages[0].id);
            }
          }
        }
        contextMenuStore.hideMenu();
      },
      disabled: pages.length <= 1,
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
    },
    {
      type: "item" as const,
      label: "播放幻灯片",
      icon: <Play theme="outline" size="13" fill="#333" />,
      onClick: () => {
        fullscreenStore.enterFullscreen(pageId);
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
