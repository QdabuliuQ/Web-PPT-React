import { useContextMenu } from "@/hooks/useContextMenu";
import { contextMenuStore } from "@/store";
import { observer } from "mobx-react-lite";
import { useEffect, type FC } from "react";

export const GlobalContextMenu: FC = observer(() => {
  const menuItems = contextMenuStore.getMenuItems();
  const visible = contextMenuStore.isVisible();
  const position = contextMenuStore.getPosition();

  // 使用 useContextMenu hook
  const { ContextMenu, show } = useContextMenu(
    menuItems,
    "global-context-menu"
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

      show({ event: mockEvent });
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
});
