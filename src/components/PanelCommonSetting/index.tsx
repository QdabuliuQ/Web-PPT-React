import {
  copyActiveElement,
  cutActiveElement,
  deleteActiveElement,
} from "@/utils/operate";
import {
  AlignBottom,
  AlignLeft,
  AlignLeftOne,
  AlignRight,
  AlignTop,
  AlignVertically,
  BringForward,
  BringToFront,
  Copy,
  CuttingOne,
  Delete,
  SendBackward,
  SentToBack,
} from "@icon-park/react";
import { message } from "antd";
import { type FC } from "react";
import { useTranslation } from "react-i18next";
import { PanelDropdownButton } from "../PanelDropdownButton";
import { PanelLargeButton } from "../PanelLargeButton";
interface IPanelCommonSettingProps {
  onPositionChange: (key: string) => void;
  onZIndexChange: (key: string) => void;
  onOperationChange?: (key: string) => void;
}

export const PanelCommonSetting: FC<IPanelCommonSettingProps> = (
  (props) => {
    const { t } = useTranslation();
    
    // 如果没有传入 onOperationChange，则使用 hook
    const handleOperation = (key: string) => {
      if (props.onOperationChange) {
        props.onOperationChange(key);
      } else {
        switch (key) {
          case "copy":
            copyActiveElement();
            message.success(t('component.operation.copySuccess'));
            break;
          case "cut":
            cutActiveElement();
            message.success(t('component.operation.cutSuccess'));
            break;
          case "delete":
            deleteActiveElement();
            message.success(t('component.operation.deleteSuccess'));
            break;
        }
      }
    };

    return (
      <div className="h-full flex gap-[5px]">
        <div className="h-full flex flex-col gap-[5px]">
          <PanelLargeButton
            title={t('component.operation.copy')}
            icon={<Copy theme="outline" size="18" fill="#333" />}
            onClick={() => handleOperation("copy")}
          />
        </div>
        <div className="h-full flex flex-col gap-[5px]">
          <PanelLargeButton
            title={t('component.operation.cut')}
            icon={<CuttingOne theme="outline" size="18" fill="#333" />}
            onClick={() => handleOperation("cut")}
          />
        </div>
        <div className="h-full flex flex-col gap-[5px]">
          <PanelLargeButton
            title={t('component.operation.delete')}
            icon={<Delete theme="outline" size="18" fill="#333" />}
            onClick={() => handleOperation("delete")}
          />
        </div>
        <PanelDropdownButton
          onSelect={(key) => {
            props.onPositionChange(key);
          }}
          menu={{
            items: [
              {
                key: "left",
                label: t('component.alignment.left'),
                icon: <AlignLeft theme="outline" size="13" fill="#333" />,
              },
              {
                key: "right",
                label: t('component.alignment.right'),
                icon: <AlignRight theme="outline" size="13" fill="#333" />,
              },
              {
                key: "center",
                label: t('component.alignment.centerHorizontalVertical'),
                icon: <AlignVertically theme="outline" size="13" fill="#333" />,
              },
              {
                key: "top",
                label: t('component.alignment.top'),
                icon: <AlignTop theme="outline" size="13" fill="#333" />,
              },
              {
                key: "bottom",
                label: t('component.alignment.bottom'),
                icon: <AlignBottom theme="outline" size="13" fill="#333" />,
              },
            ],
          }}
          button={
            <PanelLargeButton
              title={t('component.alignment.align')}
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
            title={t('component.zIndex.moveUp')}
            menu={{
              items: [
                {
                  key: "sendForward",
                  label: t('component.zIndex.bringForward'),
                  icon: <BringForward theme="outline" size="13" fill="#333" />,
                },
                {
                  key: "toFront",
                  label: t('component.zIndex.bringToFront'),
                  icon: <BringToFront theme="outline" size="13" fill="#333" />,
                },
              ],
            }}
            icon={<BringForward theme="outline" size="13" fill="#333" />}
          />
          <PanelDropdownButton
            title={t('component.zIndex.moveDown')}
            onSelect={(key) => {
              props.onZIndexChange(key);
            }}
            menu={{
              items: [
                {
                  key: "sendBackward",
                  label: t('component.zIndex.sendBackward'),
                  icon: <SendBackward theme="outline" size="13" fill="#333" />,
                },
                {
                  key: "toBack",
                  label: t('component.zIndex.sendToBack'),
                  icon: <SentToBack theme="outline" size="13" fill="#333" />,
                },
              ],
            }}
            icon={<SendBackward theme="outline" size="13" fill="#333" />}
          />
        </div>
      </div>
    );
  }
);
