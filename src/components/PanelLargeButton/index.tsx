import { useMemoizedFn } from "ahooks";
import { Button } from "antd";
import { cloneElement, isValidElement, useMemo, type FC } from "react";
interface IPanelLargeButtonProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

export const PanelLargeButton: FC<IPanelLargeButtonProps> = ({
  title,
  icon,
  onClick,
  active = false,
  disabled = false,
}) => {
  const clickHandle = useMemoizedFn(() => {
    if (!disabled) {
      onClick?.();
    }
  });

  const styles = useMemo(() => {
    const baseStyles = {
      width: "auto",
      height: "100%",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      aspectRatio: "1/1",
      fontSize: "12px",
      gap: "0px",
      lineHeight: "1",
      padding: "0px",
    };

    if (active) {
      return {
        ...baseStyles,
        backgroundColor: "#f0f0f0",
        color: "#333",
        border: "1px solid #d9d9d9",
        borderRadius: "6px",
      };
    }

    return {
      ...baseStyles,
      borderRadius: "6px",
    };
  }, [active]);

  // 处理禁用状态下的icon颜色
  const renderIcon = useMemo(() => {
    if (!isValidElement(icon)) return icon;

    // 如果是禁用状态，修改icon的fill颜色为灰色
    if (disabled) {
      return cloneElement(icon, {
        ...icon.props,
        fill: "#bbb", // 禁用状态的灰色
      });
    }

    return icon;
  }, [icon, disabled]);

  return (
    <Button
      style={styles}
      onClick={clickHandle}
      type="text"
      disabled={disabled}
    >
      <i
        style={{
          marginBottom: "6px",
        }}
      >
        {renderIcon}
      </i>
      {title}
    </Button>
  );
};
