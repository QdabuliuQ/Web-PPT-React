import { Down } from "@icon-park/react";
import { Button, Dropdown, type DropDownProps } from "antd";
import { type FC } from "react";
interface IPanelDropdownButtonProps {
  icon?: React.ReactNode;
  title?: string;
  menu?: DropDownProps["menu"];
  dropdownRender?: () => React.ReactNode;
  content?: React.ReactNode;
  value?: string; // 当前选中的key
  onSelect?: (key: string) => void; // 选择回调
  disabled?: boolean;
  button?: React.ReactNode;
}

export const PanelDropdownButton: FC<IPanelDropdownButtonProps> = ({
  icon,
  title,
  menu,
  dropdownRender,
  content,
  value,
  onSelect,
  disabled,
  button,
}) => {
  // 处理菜单选中状态和样式
  const enhancedMenu = menu
    ? {
        ...menu,
        // 只有当有value时才设置selectedKeys
        ...(value ? { selectedKeys: [value] } : {}),
        // 总是设置onClick处理函数
        onClick: (info: any) => {
          console.log(info, "info");

          onSelect?.(info.key);
          menu.onClick?.(info); // 保持原有的onClick逻辑
        },
        // 如果是 items 格式且有value，需要特殊处理选中样式
        items:
          menu.items && value
            ? menu.items.map((item: any) => ({
                ...item,
                className:
                  `${item.className || ""} ${item.key === value ? "ant-menu-item-selected" : ""}`.trim(),
                style: {
                  ...item.style,
                  ...(item.key === value
                    ? {
                        backgroundColor: "#fff2e6", // 主题色 #f25f00 的浅色版本
                        color: "#f25f00", // 主题色
                        fontWeight: 600,
                      }
                    : {}),
                },
              }))
            : menu.items,
      }
    : undefined;

  const dropdownProps = content
    ? { dropdownRender: () => content }
    : dropdownRender
      ? { dropdownRender }
      : { menu: enhancedMenu };

  return (
    <Dropdown {...dropdownProps}>
      <div className="inline-block">
        {button ? (
          button
        ) : (
          <Button size="small" type="text" disabled={disabled}>
            <div className="flex items-center gap-[4px]">
              {icon}
              <span>{title}</span>
              <Down theme="outline" size="10" fill="#333" />
            </div>
          </Button>
        )}
      </div>
    </Dropdown>
  );
};
