import { useMemoizedFn } from "ahooks";
import { Button, type ButtonProps } from "antd";
import { cloneElement, isValidElement, useMemo, type FC, type ReactElement } from "react";
interface IPanelLargeButtonProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  type?: ButtonProps["type"];
  aspectRatio?: boolean;
}

export const PanelLargeButton: FC<IPanelLargeButtonProps> = ({
  title,
  icon,
  onClick,
  active = false,
  disabled = false,
  type = "text",
  aspectRatio = true,
}) => {
  const clickHandle = useMemoizedFn(() => {
    if (!disabled) {
      onClick?.();
    }
  });

  const styles = useMemo(() => {
    const baseStyles: React.CSSProperties = {
      width: "auto",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      gap: "0px",
      lineHeight: "1",
      padding: "0px",
    };

    if (aspectRatio) {
      baseStyles.aspectRatio = "1/1";
    } else {
      baseStyles.padding = "0 8px";
    }

    if (active) {
      return {
        ...baseStyles,
        backgroundColor: "#fff2e6",
        color: "#f25f00",
        border: "1px solid transparent",
        borderRadius: "6px",
      };
    }

    return {
      ...baseStyles,
      borderRadius: "6px",
      border: "1px solid transparent",
    };
  }, [active, aspectRatio]);

  // 处理禁用状态下的icon颜色
  const renderIcon = useMemo(() => {
    if (!isValidElement(icon)) return icon;

    // 如果是禁用状态，修改icon的fill颜色为灰色
    if (disabled) {
      return cloneElement(icon as ReactElement<{ fill?: string }>, {
        fill: "#bbb", // 禁用状态的灰色
      });
    }

    return icon;
  }, [icon, disabled]);

  return (
    <Button
      style={styles}
      onClick={clickHandle}
      type={type}
      disabled={disabled}
    >
      <i className="mb-[6px]">{renderIcon}</i>
      <span className={`${disabled ? "text-gray-400" : ""} text-[12px]`}>
        {title}
      </span>
    </Button>
  );
};
