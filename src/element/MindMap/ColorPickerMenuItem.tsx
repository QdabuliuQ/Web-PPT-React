import { useDebounceFn, useMemoizedFn } from "ahooks";
import { ColorPicker } from "antd";
import type { Color } from "antd/es/color-picker";
import { useState, type FC } from "react";

interface ColorPickerMenuItemProps {
  title: string;
  value?: string;
  onChange?: (color: string) => void;
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight";
  trigger?: "hover" | "click";
  disabled?: boolean;
  className?: string;
}

export const ColorPickerMenuItem: FC<ColorPickerMenuItemProps> = ({
  title,
  value = "#000000",
  onChange,
  placement = "bottom",
  trigger = "hover",
  disabled = false,
  className,
}) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // 防抖处理颜色变化
  const { run: debouncedOnChange } = useDebounceFn(
    (color: string) => {
      onChange?.(color);
    },
    { wait: 100 }
  );

  // 处理颜色变化
  const handleColorChange = useMemoizedFn((color: Color) => {
    debouncedOnChange(color.toHexString());
  });

  // 自定义触发元素
  const triggerElement = (
    <div
      className={`whitespace-nowrap select-none inline-flex items-center gap-2 px-[10px] py-[7px] rounded-[6px] ${
        colorPickerOpen ? "bg-gray-100" : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className="text-[13px]">{title}</span>
      <div
        className="w-[20px] h-[20px] rounded border border-gray-300"
        style={{ backgroundColor: value }}
      />
    </div>
  );

  return (
    <ColorPicker
      value={value}
      onChange={handleColorChange}
      open={colorPickerOpen}
      onOpenChange={setColorPickerOpen}
      placement={placement}
      disabled={disabled}
      className={className}
      trigger={trigger}
      panelRender={(panel, _extra) => {
        // 使用 panelRender 包装面板，确保 hover 时不会关闭
        return (
          <div
            onMouseEnter={() => {
              if (trigger === "hover") {
                setColorPickerOpen(true);
              }
            }}
            onMouseLeave={() => {
              if (trigger === "hover") {
                // 延迟关闭，给用户时间移动到面板
                setTimeout(() => {
                  setColorPickerOpen(false);
                }, 100);
              }
            }}
          >
            {panel}
          </div>
        );
      }}
    >
      {triggerElement}
    </ColorPicker>
  );
};
