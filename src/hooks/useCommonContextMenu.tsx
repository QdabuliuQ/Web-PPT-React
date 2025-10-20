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
  Layers,
  SendBackward,
  SentToBack,
} from "@icon-park/react";
import { useMemo } from "react";
import type { Menu } from "./useContextMenu";
import useOperationElement from "./useOperationElement";
import { usePositionElement } from "./usePositionElement";
import { useZIndexElement } from "./useZIndexElement";

export default function useCommonContextMenu(
  pageActive: string,
  elementActive: string
) {
  const { positionHandle } = usePositionElement(pageActive, elementActive);
  const { toFrontHandle, sendForwardHandle, sendBackwardHandle, toBackHandle } =
    useZIndexElement(pageActive, elementActive);
  const { copyHandle, cutHandle, deleteHandle } = useOperationElement(
    pageActive,
    elementActive
  );

  const commonMenu = useMemo<Menu>(
    () => [
      {
        type: "item",
        label: "复制",
        icon: <Copy theme="outline" size="13" fill="#333" />,
        onClick: copyHandle,
      },
      {
        type: "item",
        label: "剪切",
        icon: <CuttingOne theme="outline" size="13" fill="#333" />,
        onClick: cutHandle,
      },
      {
        type: "item",
        label: "删除",
        icon: <Delete theme="outline" size="13" fill="#333" />,
        onClick: deleteHandle,
      },
      {
        type: "separator",
      },
      {
        type: "submenu",
        label: "对齐",
        icon: <AlignLeftOne theme="outline" size="13" fill="#333" />,
        children: [
          {
            type: "item",
            label: "左对齐",
            icon: <AlignLeft theme="outline" size="13" fill="#333" />,
            onClick: () => positionHandle("left"),
          },
          {
            type: "item",
            label: "右对齐",
            icon: <AlignRight theme="outline" size="13" fill="#333" />,
            onClick: () => positionHandle("right"),
          },
          {
            type: "item",
            label: "水平垂直居中",
            icon: <AlignVertically theme="outline" size="13" fill="#333" />,
            onClick: () => positionHandle("center"),
          },
          {
            type: "item",
            label: "上对齐",
            icon: <AlignTop theme="outline" size="13" fill="#333" />,
            onClick: () => positionHandle("top"),
          },
          {
            type: "item",
            label: "下对齐",
            icon: <AlignBottom theme="outline" size="13" fill="#333" />,
            onClick: () => positionHandle("bottom"),
          },
        ],
      },
      {
        type: "submenu",
        label: "层级",
        icon: <Layers theme="outline" size="13" fill="#333" />,
        children: [
          {
            type: "item",
            label: "上移一层",
            icon: <BringForward theme="outline" size="13" fill="#333" />,
            onClick: sendForwardHandle,
          },
          {
            type: "item",
            label: "移至顶层",
            icon: <BringToFront theme="outline" size="13" fill="#333" />,
            onClick: toFrontHandle,
          },
          {
            type: "item",
            label: "下移一层",
            icon: <SendBackward theme="outline" size="13" fill="#333" />,
            onClick: sendBackwardHandle,
          },
          {
            type: "item",
            label: "移至底层",
            icon: <SentToBack theme="outline" size="13" fill="#333" />,
            onClick: toBackHandle,
          },
        ],
      },
    ],
    [
      positionHandle,
      sendBackwardHandle,
      sendForwardHandle,
      toBackHandle,
      toFrontHandle,
    ]
  );

  return {
    commonMenu,
  };
}
