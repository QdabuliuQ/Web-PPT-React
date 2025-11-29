import { Up } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Popover } from "antd";
import { useRef, useState, type FC, type ReactNode } from "react";

export interface SelectMenuItemOption {
  label?: string;
  value: string | number;
  disabled?: boolean;
  children?: ReactNode;
  [key: string]: any;
}

interface SelectMenuIitemProps {
  options: SelectMenuItemOption[];
  value?: string | number | null | undefined;
  onSelect?: (value: string | number, option: SelectMenuItemOption) => void;
  title: string;
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight";
  trigger?: "hover" | "click" | "focus";
  renderItem?: (option: SelectMenuItemOption, isSelected: boolean) => ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SelectMenuIitem: FC<SelectMenuIitemProps> = ({
  options,
  value,
  onSelect,
  title,
  placement = "bottom",
  trigger = "hover",
  renderItem,
  className,
  disabled = false,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清除关闭定时器
  const clearCloseTimer = useMemoizedFn(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  });

  // 延迟关闭 Popover（用于 hover 模式）
  const handleClosePopover = useMemoizedFn(() => {
    if (trigger === "hover") {
      clearCloseTimer();
      closeTimerRef.current = setTimeout(() => {
        setPopoverOpen(false);
      }, 200);
    } else {
      setPopoverOpen(false);
    }
  });

  // 保持 Popover 打开（用于 hover 模式）
  const handleKeepPopoverOpen = useMemoizedFn(() => {
    if (trigger === "hover") {
      clearCloseTimer();
      setPopoverOpen(true);
    }
  });

  // 处理选项点击
  const handleOptionClick = useMemoizedFn((option: SelectMenuItemOption) => {
    if (option.disabled) return;
    onSelect?.(option.value, option);
    // 点击后总是关闭 popover
    setPopoverOpen(false);
  });

  // 默认渲染选项
  const defaultRenderItem = (
    option: SelectMenuItemOption,
    isSelected: boolean
  ) => (
    <div
      className={`px-[10px] py-[8px] cursor-pointer transition-colors rounded-[6px] text-[12px] ${
        option.disabled
          ? "opacity-50 cursor-not-allowed"
          : isSelected
            ? "bg-[#f25f00]/10 text-primary"
            : "hover:bg-gray-100"
      }`}
      onClick={() => handleOptionClick(option)}
      onMouseEnter={trigger === "hover" ? handleKeepPopoverOpen : undefined}
      onMouseLeave={trigger === "hover" ? handleClosePopover : undefined}
    >
      {option.children || option.label}
    </div>
  );

  // Popover 内容
  const popoverContent = (
    <div
      className="min-w-[120px] max-h-[300px] overflow-y-auto"
      onMouseEnter={trigger === "hover" ? handleKeepPopoverOpen : undefined}
      onMouseLeave={trigger === "hover" ? handleClosePopover : undefined}
    >
      {options.map((option) => {
        const isSelected =
          value !== null && value !== undefined && value === option.value;
        return (
          <div key={option.value}>
            {renderItem
              ? renderItem(option, isSelected)
              : defaultRenderItem(option, isSelected)}
          </div>
        );
      })}
    </div>
  );

  return (
    <Popover
      open={disabled ? false : popoverOpen}
      onOpenChange={(open) => {
        if (disabled) return;
        if (trigger === "hover") {
          if (open) {
            handleKeepPopoverOpen();
          } else {
            handleClosePopover();
          }
        } else {
          setPopoverOpen(open);
        }
      }}
      placement={placement}
      content={popoverContent}
      trigger={disabled ? [] : trigger === "hover" ? [] : trigger}
      overlayClassName={className}
      styles={{ body: { padding: "8px" } }}
    >
      <div
        className={`whitespace-nowrap select-none inline-flex items-center gap-2 px-[10px] py-[7px] rounded-[6px] ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : popoverOpen
              ? "bg-gray-100 cursor-pointer"
              : "cursor-pointer"
        }`}
        onMouseEnter={
          disabled
            ? undefined
            : trigger === "hover"
              ? handleKeepPopoverOpen
              : undefined
        }
        onMouseLeave={
          disabled
            ? undefined
            : trigger === "hover"
              ? handleClosePopover
              : undefined
        }
        onClick={
          disabled
            ? undefined
            : trigger === "click"
              ? () => setPopoverOpen(!popoverOpen)
              : undefined
        }
      >
        <span className="text-[13px]">{title}</span>
        <Up
          theme="outline"
          size="13"
          fill="#333"
          className={`transition-transform duration-200 ${
            popoverOpen ? "rotate-180" : ""
          }`}
        />
      </div>
    </Popover>
  );
};
