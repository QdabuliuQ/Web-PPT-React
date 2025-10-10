import {
  AlignBottom,
  AlignLeft,
  AlignLeftOne,
  AlignRight,
  AlignTop,
  AlignVertically,
  BringForward,
  BringToFront,
  SendBackward,
  SentToBack,
} from "@icon-park/react";
import { type FC } from "react";
import { PanelDropdownButton } from "../PanelDropdownButton";
import { PanelLargeButton } from "../PanelLargeButton";
interface IPanelCommonSettingProps {
  onPositionChange: (key: string) => void;
  onZIndexChange: (key: string) => void;
}

export const PanelCommonSetting: FC<IPanelCommonSettingProps> = (props) => {
  return (
    <div className="h-full flex gap-[5px]">
      <PanelDropdownButton
        onSelect={(key) => {
          props.onPositionChange(key);
        }}
        menu={{
          items: [
            {
              key: "left",
              label: "左对齐",
              icon: <AlignLeft theme="outline" size="13" fill="#333" />,
            },
            {
              key: "right",
              label: "右对齐",
              icon: <AlignRight theme="outline" size="13" fill="#333" />,
            },
            {
              key: "center",
              label: "水平垂直对齐",
              icon: <AlignVertically theme="outline" size="13" fill="#333" />,
            },
            {
              key: "top",
              label: "上对齐",
              icon: <AlignTop theme="outline" size="13" fill="#333" />,
            },
            {
              key: "bottom",
              label: "下对齐",
              icon: <AlignBottom theme="outline" size="13" fill="#333" />,
            },
          ],
        }}
        button={
          <PanelLargeButton
            title="对齐"
            type="text"
            icon={<AlignLeftOne theme="outline" size="18" fill="#333" />}
          />
        }
      />
      <div className="h-full flex flex-col gap-[5px]">
        <PanelDropdownButton
          onSelect={(key) => {
            props.onZIndexChange(key);
          }}
          title="上移"
          menu={{
            items: [
              {
                key: "sendForward",
                label: "上移一层",
                icon: <BringForward theme="outline" size="13" fill="#333" />,
              },
              {
                key: "toFront",
                label: "移至顶层",
                icon: <BringToFront theme="outline" size="13" fill="#333" />,
              },
            ],
          }}
          icon={<BringForward theme="outline" size="13" fill="#333" />}
        />
        <PanelDropdownButton
          title="下移"
          onSelect={(key) => {
            props.onZIndexChange(key);
          }}
          menu={{
            items: [
              {
                key: "sendBackward",
                label: "下移一层",
                icon: <SendBackward theme="outline" size="13" fill="#333" />,
              },
              {
                key: "toBack",
                label: "移至底层",
                icon: <SentToBack theme="outline" size="13" fill="#333" />,
              },
            ],
          }}
          icon={<SendBackward theme="outline" size="13" fill="#333" />}
        />
      </div>
    </div>
  );
};
