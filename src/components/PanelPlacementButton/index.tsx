import {
  AlignTextLeft,
  AlignmentHorizontalBottom,
  AlignmentHorizontalCenter,
  AlignmentHorizontalTop,
  AlignmentLeftBottom,
  AlignmentLeftCenter,
  AlignmentLeftTop,
  AlignmentRightBottom,
  AlignmentRightCenter,
  AlignmentRightTop,
} from "@icon-park/react";
import { type FC } from "react";
import { useTranslation } from "react-i18next";
import { PanelDropdownButton } from "../PanelDropdownButton";
interface IPanelPlacementButtonProps {
  value?: string;
  onSelect: (key: string) => void;
  disabled?: boolean;
}

export const PanelPlacementButton: FC<IPanelPlacementButtonProps> = ({
  value,
  onSelect,
  disabled = false,
}) => {
  const { t } = useTranslation();
  
  return (
    <PanelDropdownButton
      title={t('component.alignment.align')}
      value={value}
      icon={
        <AlignTextLeft
          theme="outline"
          size="14"
          fill={disabled ? "#bbb" : "#333"}
        />
      }
      onSelect={(key) => {
        onSelect(key);
      }}
      disabled={disabled}
      menu={{
        items: disabled
          ? []
          : [
              {
                key: "left-top",
                label: t('component.alignment.leftTop'),
                icon: (
                  <AlignmentLeftTop theme="outline" size="15" fill="#333" />
                ),
              },
              {
                key: "left-center",
                label: t('component.alignment.leftCenter'),
                icon: (
                  <AlignmentLeftCenter theme="outline" size="15" fill="#333" />
                ),
              },
              {
                key: "left-bottom",
                label: t('component.alignment.leftBottom'),
                icon: (
                  <AlignmentLeftBottom theme="outline" size="15" fill="#333" />
                ),
              },
              {
                key: "center-top",
                label: t('component.alignment.centerTop'),
                icon: (
                  <AlignmentHorizontalTop
                    theme="outline"
                    size="15"
                    fill="#333"
                  />
                ),
              },
              {
                key: "center-center",
                label: t('component.alignment.centerCenter'),
                icon: (
                  <AlignmentHorizontalCenter
                    theme="outline"
                    size="15"
                    fill="#333"
                  />
                ),
              },
              {
                key: "center-bottom",
                label: t('component.alignment.centerBottom'),
                icon: (
                  <AlignmentHorizontalBottom
                    theme="outline"
                    size="15"
                    fill="#333"
                  />
                ),
              },
              {
                key: "right-top",
                label: t('component.alignment.rightTop'),
                icon: (
                  <AlignmentRightTop theme="outline" size="15" fill="#333" />
                ),
              },
              {
                key: "right-center",
                label: t('component.alignment.rightCenter'),
                icon: (
                  <AlignmentRightCenter theme="outline" size="15" fill="#333" />
                ),
              },
              {
                key: "right-bottom",
                label: t('component.alignment.rightBottom'),
                icon: (
                  <AlignmentRightBottom theme="outline" size="15" fill="#333" />
                ),
              },
            ],
      }}
    />
  );
};
