import { PanelLargeButton } from "@/components/PanelLargeButton";
import { DropShadowDown } from "@icon-park/react";
import { ColorPicker, Slider } from "antd";
import { type FC } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

interface IPanelShadowSettingProps {
  shadow: boolean;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowColor: string;
  shadowType?: "text-shadow" | "box-shadow"; // 阴影类型，默认为 box-shadow
  shadowBlur?: number; // 模糊半径，仅 box-shadow 需要
  shadowSpread?: number; // 扩张半径，仅 box-shadow 需要
  onShadowChange: (value: boolean) => void;
  onShadowOffsetXChange: (value: number) => void;
  onShadowOffsetYChange: (value: number) => void;
  onShadowColorChange: (value: string) => void;
  onShadowBlurChange?: (value: number) => void; // 仅 box-shadow 需要
  onShadowSpreadChange?: (value: number) => void; // 仅 box-shadow 需要
}

export const PanelShadowSetting: FC<IPanelShadowSettingProps> = ({
  shadow,
  shadowOffsetX,
  shadowOffsetY,
  shadowColor,
  shadowType = "box-shadow",
  shadowBlur = 0,
  shadowSpread = 0,
  onShadowChange,
  onShadowOffsetXChange,
  onShadowOffsetYChange,
  onShadowColorChange,
  onShadowBlurChange,
  onShadowSpreadChange,
}) => {
  const { t } = useTranslation();
  const isBoxShadow = shadowType === "box-shadow";
  
  return (
    <div className="h-full flex items-center gap-[8px] flex-shrink-0">
      <PanelLargeButton
        title={t('component.shadow.title')}
        active={shadow}
        icon={<DropShadowDown theme="outline" size="18" fill="var(--icon-color)" />}
        onClick={() => onShadowChange(!shadow)}
      />
      <div className="flex flex-col justify-center gap-[10px]">
        <div className="flex items-center gap-[10px]">
          <span className="text-[12px] text-gray-500 min-w-[8px]">X</span>
          <Slider
            style={{ width: 90, margin: 0 }}
            min={-100}
            max={100}
            value={shadowOffsetX}
            onChange={onShadowOffsetXChange}
            disabled={!shadow}
          />
        </div>
        <div className="flex items-center gap-[10px]">
          <span className="text-[12px] text-gray-500 min-w-[8px]">Y</span>
          <Slider
            style={{ width: 90, margin: 0 }}
            min={-100}
            max={100}
            value={shadowOffsetY}
            onChange={onShadowOffsetYChange}
            disabled={!shadow}
          />
        </div>
      </div>
      <ColorPicker
        className={styles.colorPicker}
        value={shadowColor}
        onChange={(value) => onShadowColorChange(value.toHexString())}
        disabled={!shadow}
      />
      {isBoxShadow && (
        <div className="flex flex-col justify-center gap-[10px] ml-[5px]">
          <div className="flex items-center gap-[6px]">
            <span className="text-[12px] text-gray-500 w-[40px]">{t('component.shadow.blur')}</span>
            <Slider
              style={{ width: 90, margin: 0 }}
              min={0}
              max={100}
              value={shadowBlur}
              onChange={onShadowBlurChange}
              disabled={!shadow}
            />
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="text-[12px] text-gray-500 w-[40px]">{t('component.shadow.spread')}</span>
            <Slider
              style={{ width: 90, margin: 0 }}
              min={0}
              max={100}
              value={shadowSpread}
              onChange={onShadowSpreadChange}
              disabled={!shadow}
            />
          </div>
        </div>
      )}
    </div>
  );
};
