import type { MenuItem } from "@/hooks/useContextMenu";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import {
  AlignmentHorizontalBottom,
  AlignmentHorizontalCenter,
  AlignmentHorizontalTop,
  AlignmentLeftBottom,
  AlignmentLeftCenter,
  AlignmentLeftTop,
  AlignmentRightBottom,
  AlignmentRightCenter,
  AlignmentRightTop,
  FontSize,
  Strikethrough,
  TextBold,
  TextItalic,
  TextUnderline,
} from "@icon-park/react";
import i18n from "@/i18n";
import type { ITextProps } from "./index";

export const getTextMenuItems = (): MenuItem[] => {
  const t = i18n.t.bind(i18n);
  const pageId = pageActiveStore.getPageActive();
  const elementId = elementActiveStore.getElementActive();

  if (!pageId || !elementId) return [];

  const textInfo = pptStore.getElementInfo(pageId, elementId) as ITextProps;

  if (!textInfo) return [];

  return [
    {
      type: "submenu",
      label: t('elements.text.style'),
      icon: <FontSize theme="outline" size="13" fill="var(--icon-color)" />,
      children: [
        {
          type: "item",
          label: t('elements.text.format.bold'),
          icon: <TextBold theme="outline" size="13" fill="var(--icon-color)" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              bold: !textInfo.bold,
            });
          },
        },
        {
          type: "item",
          label: t('elements.text.format.italic'),
          icon: <TextItalic theme="outline" size="13" fill="var(--icon-color)" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              italic: !textInfo.italic,
            });
          },
        },
        {
          type: "item",
          label: t('elements.text.format.underline'),
          icon: <TextUnderline theme="outline" size="13" fill="var(--icon-color)" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              underline: !textInfo.underline,
            });
          },
        },
        {
          type: "item",
          label: t('elements.text.format.strikethrough'),
          icon: <Strikethrough theme="outline" size="13" fill="var(--icon-color)" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              strikethrough: !textInfo.strikethrough,
            });
          },
        },
      ],
    },
    {
      type: "submenu",
      label: t('elements.text.alignment'),
      icon: <AlignmentHorizontalCenter theme="outline" size="13" fill="var(--icon-color)" />,
      children: [
        {
          type: "item",
          label: t('component.alignment.leftTop'),
          icon: <AlignmentLeftTop theme="outline" size="13" fill="var(--icon-color)" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "left-top",
            });
          },
        },
        {
          type: "item",
          label: t('component.alignment.leftCenter'),
          icon: <AlignmentLeftCenter theme="outline" size="13" fill="var(--icon-color)" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "left-center",
            });
          },
        },
        {
          type: "item",
          label: t('component.alignment.leftBottom'),
          icon: <AlignmentLeftBottom theme="outline" size="13" fill="var(--icon-color)" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "left-bottom",
            });
          },
        },
        {
          type: "separator",
        },
        {
          type: "item",
          label: t('component.alignment.centerTop'),
          icon: (
            <AlignmentHorizontalTop theme="outline" size="13" fill="var(--icon-color)" />
          ),
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "center-top",
            });
          },
        },
        {
          type: "item",
          label: t('component.alignment.centerCenter'),
          icon: (
            <AlignmentHorizontalCenter theme="outline" size="13" fill="var(--icon-color)" />
          ),
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "center-center",
            });
          },
        },
        {
          type: "item",
          label: t('component.alignment.centerBottom'),
          icon: (
            <AlignmentHorizontalBottom theme="outline" size="13" fill="var(--icon-color)" />
          ),
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "center-bottom",
            });
          },
        },
        {
          type: "separator",
        },
        {
          type: "item",
          label: t('component.alignment.rightTop'),
          icon: <AlignmentRightTop theme="outline" size="13" fill="var(--icon-color)" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "right-top",
            });
          },
        },
        {
          type: "item",
          label: t('component.alignment.rightCenter'),
          icon: <AlignmentRightCenter theme="outline" size="13" fill="var(--icon-color)" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "right-center",
            });
          },
        },
        {
          type: "item",
          label: t('component.alignment.rightBottom'),
          icon: <AlignmentRightBottom theme="outline" size="13" fill="var(--icon-color)" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "right-bottom",
            });
          },
        },
      ],
    },
    {
      type: "separator",
    },
  ];
};
