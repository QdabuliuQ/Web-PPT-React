import type { MenuItem } from "@/hooks/useContextMenu";
import { useContextMenu } from "@/hooks/useContextMenu";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import {
  Add,
  ArrowDown,
  ArrowUp,
  BringForward,
  Copy,
  Delete,
  PreviewCloseOne,
  PreviewOpen,
  SendBackward,
} from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { useEffect, useState } from "react";

interface UsePageContextMenuOptions {
  onScrollToBottom?: () => void;
}

export const usePageContextMenu = (options?: UsePageContextMenuOptions) => {
  const { onScrollToBottom } = options || {};
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const pages = pptStore.getPages();
  const pageActive = pageActiveStore.getPageActive();

  // 创建右键菜单
  const { ContextMenu, show } = useContextMenu(menuItems, "page-context-menu");

  // 手动关闭菜单的函数
  const closeMenu = useMemoizedFn(() => {
    setMenuItems([]);
  });

  // 添加全局点击事件监听器来关闭菜单
  useEffect(() => {
    const handleGlobalClick = () => {
      closeMenu();
    };

    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [closeMenu]);

  // 处理右键菜单
  const handleContextMenu = useMemoizedFn(
    (e: React.MouseEvent, pageId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const pageIndex = pages.findIndex((p) => p.id === pageId);
      const currentPage = pages[pageIndex];
      const isFirstPage = pageIndex === 0;
      const isLastPage = pageIndex === pages.length - 1;
      const isVisible = currentPage?.visible !== false;

      const items: MenuItem[] = [
        {
          type: "item" as const,
          label: "新建幻灯片",
          icon: <Add theme="outline" size="13" fill="#333" />,
          onClick: () => {
            const newPageId = pptStore.addPage(pageId);
            // 清空选中的元素
            elementActiveStore.resetElementActive();
            // 切换到新建的页面
            pageActiveStore.setPageActive(newPageId);
            closeMenu();
            // 滚动到底部
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
              // 清空选中的元素
              elementActiveStore.resetElementActive();
              // 切换到复制的页面
              pageActiveStore.setPageActive(newPageId);
            }
            closeMenu();
            // 滚动到底部
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
              // 清空选中的元素
              elementActiveStore.resetElementActive();
              // 如果删除的是当前激活页面，切换到第一个页面
              if (pageActive === pageId) {
                const remainingPages = pptStore.getPages();
                if (remainingPages.length > 0) {
                  pageActiveStore.setPageActive(remainingPages[0].id);
                }
              }
            }
            closeMenu();
          },
          disabled: pages.length <= 1, // 至少保留一个页面
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
            closeMenu();
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
            closeMenu();
          },
          disabled: isFirstPage,
        },
        {
          type: "item" as const,
          label: "下移",
          icon: <ArrowDown theme="outline" size="13" fill="#333" />,
          onClick: () => {
            pptStore.movePage(pageId, "down");
            closeMenu();
          },
          disabled: isLastPage,
        },
        {
          type: "item" as const,
          label: "移动到最前",
          icon: <BringForward theme="outline" size="13" fill="#333" />,
          onClick: () => {
            pptStore.movePage(pageId, "first");
            closeMenu();
          },
          disabled: isFirstPage,
        },
        {
          type: "item" as const,
          label: "移动到最后",
          icon: <SendBackward theme="outline" size="13" fill="#333" />,
          onClick: () => {
            pptStore.movePage(pageId, "last");
            closeMenu();
          },
          disabled: isLastPage,
        },
      ];

      setMenuItems(items);
      show({ event: e });
    }
  );

  return {
    ContextMenu,
    handleContextMenu,
  };
};
