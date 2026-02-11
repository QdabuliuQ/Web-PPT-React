import { PanelLargeButton } from "@/components/PanelLargeButton";
import { PanelSelect } from "@/components/PanelSelect";
import { Square } from "@icon-park/react";
import { ColorPicker, InputNumber, Popover, Tooltip } from "antd";
import { type FC } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

interface IPanelBorderSettingProps {
  border: boolean;
  borderWidth: number;
  borderStyle: string;
  borderColor: string;
  onBorderChange: (value: boolean) => void;
  onBorderWidthChange: (value: number | null) => void;
  onBorderStyleChange: (value: string) => void;
  onBorderColorChange: (value: string) => void;
}

export const PanelBorderSetting: FC<IPanelBorderSettingProps> = ({
  border,
  borderWidth,
  borderStyle,
  borderColor,
  onBorderChange,
  onBorderWidthChange,
  onBorderStyleChange,
  onBorderColorChange,
}) => {
  const { t } = useTranslation();
  
  const borderOptions = [
    { label: t('component.border.solid'), value: "solid" },
    { label: t('component.border.dashed'), value: "dashed" },
    { label: t('component.border.dotted'), value: "dotted" },
    { label: t('component.border.double'), value: "double" },
  ];

  return (
    <div className="h-full flex justify-center gap-[10px] flex-shrink-0">
      <PanelLargeButton
        title={t('component.border.title')}
        active={border}
        icon={<Square theme="outline" size="18" fill="#333" />}
        onClick={() => onBorderChange(!border)}
      />
      <div className="flex gap-[8px]">
        <div className="flex h-full flex-col justify-between">
          <Tooltip title={t('component.border.width')} placement="top">
            <InputNumber
              value={borderWidth}
              style={{ width: "85px" }}
              size="small"
              onChange={onBorderWidthChange}
              disabled={!border}
            />
          </Tooltip>
          <Tooltip title={t('component.border.style')} placement="top">
            <PanelSelect
              value={borderStyle}
              style={{ width: "85px" }}
              size="small"
              options={borderOptions}
              onChange={onBorderStyleChange}
              disabled={!border}
            />
          </Tooltip>
        </div>
        <Popover>
          <ColorPicker
            size="small"
            className={styles.colorPicker}
            value={borderColor}
            disabled={!border}
            onChange={(value) => onBorderColorChange(value.toHexString())}
          />
        </Popover>
      </div>
    </div>
  );
};
