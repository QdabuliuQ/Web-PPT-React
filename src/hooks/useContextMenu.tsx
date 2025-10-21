import { useMemo } from "react";
import {
  Item,
  Menu,
  Separator,
  Submenu,
  useContextMenu as useContextMenuReact,
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { createPortal } from "react-dom";

export type MenuItem = {
  type: "separator" | "item" | "submenu";
  onClick?: (payload?: unknown) => void;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: Menu;
};
export type Menu = Array<MenuItem>;

export const useContextMenu = (menu: Menu, menuId: string) => {
  const { show, hideAll } = useContextMenuReact({ id: menuId });

  const contextMenu = useMemo(() => {
    // 递归渲染菜单项
    const renderMenuItems = (items: Menu): React.ReactNode[] => {
      return items.map((item, index) => {
        const key = `menu-item-${index}`;

        switch (item.type) {
          case "separator":
            return <Separator key={key} />;

          case "item":
            return (
              <Item
                key={key}
                onClick={(args) => {
                  item.onClick?.(args);
                  hideAll();
                }}
                disabled={item.disabled}
              >
                {item.icon && (
                  <span style={{ marginRight: 8 }}>{item.icon}</span>
                )}
                {item.label}
              </Item>
            );

          case "submenu":
            return (
              <Submenu
                key={key}
                label={
                  <>
                    {item.icon && (
                      <span style={{ marginRight: 8 }}>{item.icon}</span>
                    )}
                    {item.label}
                  </>
                }
                disabled={item.disabled}
              >
                {item.children ? renderMenuItems(item.children) : null}
              </Submenu>
            );

          default:
            return null;
        }
      });
    };

    return renderMenuItems(menu);
  }, [menu, hideAll]);

  const ContextMenu = useMemo(() => {
    return () =>
      createPortal(
        <Menu animation="none" id={menuId}>
          {contextMenu}
        </Menu>,
        document.body
      );
  }, [contextMenu, menuId]);

  return {
    ContextMenu,
    show,
  };
};
