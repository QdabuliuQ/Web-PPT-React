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
                // 尽早关闭，避免后续逻辑阻止关闭（某些版本不支持也不影响）
                onMouseDown={() => {
                  const apiAny = menuApi as unknown as {
                    hide?: () => void;
                    hideAll?: () => void;
                  };
                  apiAny.hideAll?.();
                  apiAny.hide?.();
                }}
                onClick={(args) => {
                  // 始终在点击后关闭菜单，避免个别项不自动关闭
                  try {
                    item.onClick?.(args);
                  } finally {
                    // 先尝试通过实例 API 关闭（兼容不同版本）
                    const apiAny = menuApi as unknown as {
                      hide?: () => void;
                      hideAll?: () => void;
                    };
                    apiAny.hideAll?.();
                    apiAny.hide?.();

                    // 动态导入以避免类型提示与导出差异导致的编译问题
                    // 兼容旧版本可能未导出 hideAll 的情况
                    void import("react-contexify").then((m) => {
                      // @ts-expect-error 兼容不同版本导出差异
                      (m.hideAll ?? m.closeAll ?? (() => {}))();
                    });
                  }
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
  }, [menu]);

  const menuApi = useContextMenuReact({ id: menuId });
  const { show } = menuApi;

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
