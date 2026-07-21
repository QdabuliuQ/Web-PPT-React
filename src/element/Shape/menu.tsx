import type { Menu } from "@/hooks/useContextMenu";
import i18n from "@/i18n";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { GraphicDesign } from "@icon-park/react";
import type { IShapeProps } from "./index";
import { SHAPE_TYPES } from "./shapes";

const getShapeElementInfo = () => {
  const pageActive = pageActiveStore.getPageActive();
  const elementActive = elementActiveStore.getElementActive();

  if (!pageActive || !elementActive) {
    return null;
  }

  const shapeElement = pptStore.getElementInfo(pageActive, elementActive);
  if (!shapeElement || shapeElement.type !== "shape") {
    return null;
  }

  return shapeElement as IShapeProps;
};

export const getShapeMenuItems = (): Menu => {
  const t = i18n.t.bind(i18n);

  return [
    {
      type: "submenu",
      label: t("elements.shape.shapeType"),
      icon: (
        <GraphicDesign
          theme="outline"
          size="13"
          fill="var(--icon-color)"
        />
      ),
      children: SHAPE_TYPES.map((shapeType) => ({
        type: "item" as const,
        label: t(`elements.shape.types.${shapeType}`),
        onClick: () => {
          const shapeElement = getShapeElementInfo();
          if (!shapeElement) return;

          const pageActive = pageActiveStore.getPageActive();
          const elementActive = elementActiveStore.getElementActive();
          if (!pageActive || !elementActive) return;

          pptStore.setElementInfo(pageActive, elementActive, {
            ...shapeElement,
            shapeType,
          });
        },
      })),
    },
    {
      type: "separator",
    },
  ];
};
