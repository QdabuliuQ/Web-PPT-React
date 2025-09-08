import { useMemoizedFn } from "ahooks";
import { Button } from "antd";
import { useMemo, type FC } from "react";
interface IPanelLargeButtonProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export const PanelLargeButton: FC<IPanelLargeButtonProps> = ({
  title,
  icon,
  onClick,
  active = false,
}) => {
  const clickHandle = useMemoizedFn(() => {
    onClick?.();
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

  return (
    <Button style={styles} onClick={clickHandle} type="text">
      <i
        style={{
          marginBottom: "6px",
        }}
      >
        {icon}
      </i>
      {title}
    </Button>
  );
};
