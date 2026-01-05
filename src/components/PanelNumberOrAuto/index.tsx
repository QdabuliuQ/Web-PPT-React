import { HorizontallyCentered } from "@icon-park/react";
import { InputNumber } from "antd";
import { type FC, useMemo } from "react";
import styles from "./index.module.less";

export interface IPanelNumberOrAutoProps {
  /** 当前值，可以是数字或字符串 "center" */
  value?: number | string;
  /** 值变化回调 */
  onChange?: (value: number | string) => void;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 样式 */
  style?: React.CSSProperties;
  /** 占位符 */
  placeholder?: string;
  /** 格式化显示（例如添加单位） */
  formatter?: (value: number | undefined) => string;
  /** 解析输入值 */
  parser?: (value: string | undefined) => number;
}

/**
 * 支持数字输入或 "center" 的组件
 * 用于 ECharts grid 配置中的 left、right、top、bottom 等属性
 */
export const PanelNumberOrAuto: FC<IPanelNumberOrAutoProps> = ({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  style,
  placeholder,
  formatter,
  parser,
}) => {
  // 判断当前是否为 "center" 模式
  const isCenter = value === "center";

  // 获取数字值（如果不是 center）
  const numericValue = useMemo(() => {
    if (typeof value === "number") return value;
    if (isCenter) return 0; // center 模式下显示 0
    return Number(value) || 0;
  }, [value, isCenter]);

  // 切换 center 模式
  const handleCenterToggle = () => {
    if (disabled) return;

    if (isCenter) {
      // 取消 center，设置为 0
      onChange?.(0);
    } else {
      // 设置为 center
      onChange?.("center");
    }
  };

  // 数字输入变化
  const handleNumberChange = (val: number | null) => {
    if (disabled || isCenter) return;

    if (val === null) {
      onChange?.(0);
    } else {
      onChange?.(val);
    }
  };

  return (
    <div className={styles.container} style={style}>
      <button
        type="button"
        className={`${styles.autoButton} ${isCenter ? styles.autoButtonActive : ""}`}
        onClick={handleCenterToggle}
        disabled={disabled}
        title={isCenter ? "点击取消自动居中" : "点击开启自动居中"}
      >
        <HorizontallyCentered
          theme="outline"
          size="16"
          fill={isCenter ? "#fff" : "#333"}
          className={styles.icon}
        />
      </button>
      <InputNumber
        value={isCenter ? 0 : numericValue}
        onChange={handleNumberChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled || isCenter}
        placeholder={isCenter ? "center" : placeholder}
        formatter={formatter}
        parser={parser}
        className={styles.inputNumber}
        controls={!isCenter}
      />
    </div>
  );
};
