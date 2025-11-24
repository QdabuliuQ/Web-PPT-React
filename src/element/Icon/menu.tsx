import type { Menu } from "@/hooks/useContextMenu";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import { AllApplication } from "@icon-park/react";
import type { IIconProps } from "./index";

// 获取图标元素信息的函数
const getIconElementInfo = () => {
  const pageActive = pageActiveStore.getPageActive();
  const elementActive = elementActiveStore.getElementActive();

  if (!pageActive || !elementActive) {
    return null;
  }

  const iconElement = pptStore.getElementInfo(pageActive, elementActive);
  if (!iconElement || iconElement.type !== "icon") {
    return null;
  }

  return iconElement as IIconProps;
};

// 导出图标菜单项获取函数
export const getIconMenuItems = (): Menu => {
  return [
    {
      type: "submenu",
      label: "图标风格",
      icon: <AllApplication theme="outline" size="13" fill="#333" />,
      children: [
        {
          type: "item",
          label: "线性",
          onClick: () => {
            const iconElement = getIconElementInfo();
            if (!iconElement) return;

            const pageActive = pageActiveStore.getPageActive();
            const elementActive = elementActiveStore.getElementActive();
            if (!pageActive || !elementActive) return;

            pptStore.setElementInfo(pageActive, elementActive, {
              ...iconElement,
              theme: "outline",
              fill: ["#333333"],
            });
          },
        },
        {
          type: "item",
          label: "填充",
          onClick: () => {
            const iconElement = getIconElementInfo();
            if (!iconElement) return;

            const pageActive = pageActiveStore.getPageActive();
            const elementActive = elementActiveStore.getElementActive();
            if (!pageActive || !elementActive) return;

            pptStore.setElementInfo(pageActive, elementActive, {
              ...iconElement,
              theme: "filled",
              fill: ["#333333"],
            });
          },
        },
        {
          type: "item",
          label: "双色",
          onClick: () => {
            const iconElement = getIconElementInfo();
            if (!iconElement) return;

            const pageActive = pageActiveStore.getPageActive();
            const elementActive = elementActiveStore.getElementActive();
            if (!pageActive || !elementActive) return;

            pptStore.setElementInfo(pageActive, elementActive, {
              ...iconElement,
              theme: "two-tone",
              fill: ["#333333", "#2F88FF"],
            });
          },
        },
        {
          type: "item",
          label: "多色",
          onClick: () => {
            const iconElement = getIconElementInfo();
            if (!iconElement) return;

            const pageActive = pageActiveStore.getPageActive();
            const elementActive = elementActiveStore.getElementActive();
            if (!pageActive || !elementActive) return;

            pptStore.setElementInfo(pageActive, elementActive, {
              ...iconElement,
              theme: "multi-color",
              fill: ["#333333", "#2F88FF", "#ffffff", "#43CCF8"],
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
