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
import type { ITextProps } from "./index";

export const getTextMenuItems = (): MenuItem[] => {
  const pageId = pageActiveStore.getPageActive();
  const elementId = elementActiveStore.getElementActive();

  if (!pageId || !elementId) return [];

  const textInfo = pptStore.getElementInfo(pageId, elementId) as ITextProps;

  if (!textInfo) return [];

  return [
    {
      type: "submenu",
      label: "文字样式",
      icon: <FontSize theme="outline" size="13" fill="#333" />,
      children: [
        {
          type: "item",
          label: "粗体",
          icon: <TextBold theme="outline" size="13" fill="#333" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              bold: !textInfo.bold,
            });
          },
        },
        {
          type: "item",
          label: "斜体",
          icon: <TextItalic theme="outline" size="13" fill="#333" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              italic: !textInfo.italic,
            });
          },
        },
        {
          type: "item",
          label: "下划线",
          icon: <TextUnderline theme="outline" size="13" fill="#333" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              underline: !textInfo.underline,
            });
          },
        },
        {
          type: "item",
          label: "删除线",
          icon: <Strikethrough theme="outline" size="13" fill="#333" />,
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
      label: "文字对齐",
      icon: <AlignmentHorizontalCenter theme="outline" size="13" fill="#333" />,
      children: [
        {
          type: "item",
          label: "左上对齐",
          icon: <AlignmentLeftTop theme="outline" size="13" fill="#333" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "left-top",
            });
          },
        },
        {
          type: "item",
          label: "左中对齐",
          icon: <AlignmentLeftCenter theme="outline" size="13" fill="#333" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "left-center",
            });
          },
        },
        {
          type: "item",
          label: "左下对齐",
          icon: <AlignmentLeftBottom theme="outline" size="13" fill="#333" />,
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
          label: "中上对齐",
          icon: (
            <AlignmentHorizontalTop theme="outline" size="13" fill="#333" />
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
          label: "水平垂直居中",
          icon: (
            <AlignmentHorizontalCenter theme="outline" size="13" fill="#333" />
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
          label: "中下对齐",
          icon: (
            <AlignmentHorizontalBottom theme="outline" size="13" fill="#333" />
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
          label: "右上对齐",
          icon: <AlignmentRightTop theme="outline" size="13" fill="#333" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "right-top",
            });
          },
        },
        {
          type: "item",
          label: "右中对齐",
          icon: <AlignmentRightCenter theme="outline" size="13" fill="#333" />,
          onClick: () => {
            pptStore.setElementInfo(pageId, elementId, {
              ...textInfo,
              placement: "right-center",
            });
          },
        },
        {
          type: "item",
          label: "右下对齐",
          icon: <AlignmentRightBottom theme="outline" size="13" fill="#333" />,
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
