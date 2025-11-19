import { Select, type SelectProps } from "antd";
import { type FC, useEffect, useRef, useState } from "react";

type TriggerType = "click" | "hover";

interface IPanelSelectProps extends Omit<SelectProps, "open" | "onOpenChange"> {
  /** 触发方式 */
  trigger?: TriggerType;
  /** 悬停延时关闭时间（毫秒） */
  hoverDelay?: number;
}

export const PanelSelect: FC<IPanelSelectProps> = ({
  trigger = "hover",
  hoverDelay = 150,
  ...selectProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 组件卸载时清理定时器，防止内存泄漏
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      // 清除可能存在的关闭定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      // 延时关闭，给用户时间移动到下拉选项
      timerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, hoverDelay);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // 如果用户点击或选择了选项，立即更新状态并清除定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // 当下拉框可见状态改变时，清除定时器
    if (open && timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsOpen(open);
  };

  const wrapperProps =
    trigger === "hover"
      ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }
      : {};

  return (
    <div {...wrapperProps} style={{ display: "inline-block", lineHeight: 1 }}>
      <Select {...selectProps} open={isOpen} onOpenChange={handleOpenChange} />
    </div>
  );
};
