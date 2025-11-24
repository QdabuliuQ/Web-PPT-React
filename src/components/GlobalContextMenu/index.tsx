import { useContextMenu } from "@/hooks/useContextMenu";
import { contextMenuStore } from "@/store";
import { observer } from "mobx-react-lite";
import { useEffect, type FC } from "react";

export const GlobalContextMenu: FC<{ parentSelector?: string }> = observer(
  ({ parentSelector }) => {
    const menuItems = contextMenuStore.getMenuItems();
    const visible = contextMenuStore.isVisible();
    const position = contextMenuStore.getPosition();

    // 使用 useContextMenu hook
    const { ContextMenu, show } = useContextMenu(
      menuItems,
      "global-context-menu",
      parentSelector
    );

    // 监听 store 的变化，当需要显示菜单时调用 show
    useEffect(() => {
      if (visible && position) {
        // 创建一个模拟的 event 对象
        const mockEvent = {
          clientX: position.x,
          clientY: position.y,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as React.MouseEvent;

        // 延迟到下一个事件循环，避免在 React 渲染过程中同步调用 flushSync
        const timer = setTimeout(() => {
          show({ event: mockEvent });
        }, 0);

        return () => {
          clearTimeout(timer);
        };
      }
    }, [visible, position, show]);

    // 监听全局点击事件，关闭菜单
    useEffect(() => {
      const handleGlobalClick = () => {
        contextMenuStore.hideMenu();
      };

      document.addEventListener("click", handleGlobalClick);
      return () => {
        document.removeEventListener("click", handleGlobalClick);
      };
    }, []);

    return <ContextMenu />;
  }
);
