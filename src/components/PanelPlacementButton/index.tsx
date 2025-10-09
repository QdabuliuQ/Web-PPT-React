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
  return (
    <PanelDropdownButton
      title="对齐"
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
                label: "左上对齐",
                icon: (
                  <AlignmentLeftTop theme="outline" size="15" fill="#333" />
                ),
              },
              {
                key: "left-center",
                label: "左中对齐",
                icon: (
                  <AlignmentLeftCenter theme="outline" size="15" fill="#333" />
                ),
              },
              {
                key: "left-bottom",
                label: "左下对齐",
                icon: (
                  <AlignmentLeftBottom theme="outline" size="15" fill="#333" />
                ),
              },
              {
                key: "center-top",
                label: "中上对齐",
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
                label: "水平垂直居中",
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
                label: "中下对齐",
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
                label: "右上对齐",
                icon: (
                  <AlignmentRightTop theme="outline" size="15" fill="#333" />
                ),
              },
              {
                key: "right-center",
                label: "右中对齐",
                icon: (
                  <AlignmentRightCenter theme="outline" size="15" fill="#333" />
                ),
              },
              {
                key: "right-bottom",
                label: "右下对齐",
                icon: (
                  <AlignmentRightBottom theme="outline" size="15" fill="#333" />
                ),
              },
            ],
      }}
    />
  );
};
