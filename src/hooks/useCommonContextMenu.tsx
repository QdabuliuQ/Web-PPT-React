import KeyboardIcon from "@/components/KeyboardIcon";
import { pptStore } from "@/store";
import { formatKeysForDevice } from "@/utils";
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
  Layers,
  Redo,
  SendBackward,
  SentToBack,
  Undo,
} from "@icon-park/react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Menu } from "./useContextMenu";
import { usePositionElement } from "./usePositionElement";
import { useZIndexElement } from "./useZIndexElement";

export default function useCommonContextMenu(
  pageActive: string,
  elementActive: string
) {
  const { t } = useTranslation();
  const { positionHandle } = usePositionElement(pageActive, elementActive);
  const { toFrontHandle, sendForwardHandle, sendBackwardHandle, toBackHandle } =
    useZIndexElement(pageActive, elementActive);
  // 左旋转处理函数
  const rotateLeftHandle = useCallback(() => {
    const element = pptStore.getElementInfo(pageActive, elementActive);
    if (!element) return;

    // 旋转 -90 度
    const newRotate = (element.rotate - 90 + 360) % 360;

    pptStore.setElementInfo(pageActive, elementActive, {
      ...element,
      rotate: newRotate,
    });
  }, [pageActive, elementActive]);

  // 右旋转处理函数
  const rotateRightHandle = useCallback(() => {
    const element = pptStore.getElementInfo(pageActive, elementActive);
    if (!element) return;

    // 旋转 90 度
    const newRotate = (element.rotate + 90) % 360;

    pptStore.setElementInfo(pageActive, elementActive, {
      ...element,
      rotate: newRotate,
    });
  }, [pageActive, elementActive]);

  const commonMenu = useMemo<Menu>(
    () => [
      {
        type: "item",
        label: t('hooks.contextMenu.copy'),
        icon: <Copy theme="outline" size="13" fill="var(--icon-color)" />,
        onClick: () => {
          if (!elementActive) return;
          copyActiveElement();
        },
        tip: <KeyboardIcon keys={formatKeysForDevice(["Shift", "C"])} />,
      },
      {
        type: "item",
        label: t('hooks.contextMenu.cut'),
        icon: <CuttingOne theme="outline" size="13" fill="var(--icon-color)" />,
        onClick: () => {
          if (!elementActive) return;
          cutActiveElement();
        },
        tip: <KeyboardIcon keys={formatKeysForDevice(["Shift", "X"])} />,
      },
      {
        type: "item",
        label: t('hooks.contextMenu.delete'),
        icon: <Delete theme="outline" size="13" fill="var(--icon-color)" />,
        onClick: () => {
          if (!elementActive) return;
          deleteActiveElement();
        },
        tip: <KeyboardIcon keys={formatKeysForDevice(["Shift", "D"])} />,
      },
      {
        type: "separator",
      },
      {
        type: "item",
        label: t('hooks.contextMenu.rotateLeft'),
        icon: <Undo theme="outline" size="13" fill="var(--icon-color)" />,
        onClick: rotateLeftHandle,
      },
      {
        type: "item",
        label: t('hooks.contextMenu.rotateRight'),
        icon: <Redo theme="outline" size="13" fill="var(--icon-color)" />,
        onClick: rotateRightHandle,
      },
      {
        type: "separator",
      },
      {
        type: "submenu",
        label: t('hooks.contextMenu.align'),
        icon: <AlignLeftOne theme="outline" size="13" fill="var(--icon-color)" />,
        children: [
          {
            type: "item",
            label: t('component.alignment.left'),
            icon: <AlignLeft theme="outline" size="13" fill="var(--icon-color)" />,
            onClick: () => positionHandle("left"),
          },
          {
            type: "item",
            label: t('component.alignment.right'),
            icon: <AlignRight theme="outline" size="13" fill="var(--icon-color)" />,
            onClick: () => positionHandle("right"),
          },
          {
            type: "item",
            label: t('component.alignment.centerHorizontalVertical'),
            icon: <AlignVertically theme="outline" size="13" fill="var(--icon-color)" />,
            onClick: () => positionHandle("center"),
          },
          {
            type: "item",
            label: t('component.alignment.top'),
            icon: <AlignTop theme="outline" size="13" fill="var(--icon-color)" />,
            onClick: () => positionHandle("top"),
          },
          {
            type: "item",
            label: t('component.alignment.bottom'),
            icon: <AlignBottom theme="outline" size="13" fill="var(--icon-color)" />,
            onClick: () => positionHandle("bottom"),
          },
        ],
      },
      {
        type: "submenu",
        label: t('hooks.contextMenu.layer'),
        icon: <Layers theme="outline" size="13" fill="var(--icon-color)" />,
        children: [
          {
            type: "item",
            label: t('component.zIndex.bringForward'),
            icon: <BringForward theme="outline" size="13" fill="var(--icon-color)" />,
            onClick: sendForwardHandle,
          },
          {
            type: "item",
            label: t('component.zIndex.bringToFront'),
            icon: <BringToFront theme="outline" size="13" fill="var(--icon-color)" />,
            onClick: toFrontHandle,
          },
          {
            type: "item",
            label: t('component.zIndex.sendBackward'),
            icon: <SendBackward theme="outline" size="13" fill="var(--icon-color)" />,
            onClick: sendBackwardHandle,
          },
          {
            type: "item",
            label: t('component.zIndex.sendToBack'),
            icon: <SentToBack theme="outline" size="13" fill="var(--icon-color)" />,
            onClick: toBackHandle,
          },
        ],
      },
    ],
    [
      t,
      positionHandle,
      rotateLeftHandle,
      rotateRightHandle,
      sendBackwardHandle,
      sendForwardHandle,
      toBackHandle,
      toFrontHandle,
      elementActive,
    ]
  );

  return {
    commonMenu,
  };
}
