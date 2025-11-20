import { IconPanelKey, IconPanelTitle } from "@/element/Icon";
import { ImagePanelKey, ImagePanelTitle } from "@/element/Image";
import { TablePanelKey, TablePanelTitle } from "@/element/Table";
import { TextPanelKey, TextPanelTitle } from "@/element/Text";
import {
  elementActiveStore,
  menuActiveStore,
  pageActiveStore,
  pptStore,
} from "@/store";
import { useMemoizedFn } from "ahooks";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState, type FC } from "react";
import styles from "./index.module.less";

const MenuMapped = {
  text: {
    key: TextPanelKey,
    title: TextPanelTitle,
  },
  table: {
    key: TablePanelKey,
    title: TablePanelTitle,
  },
  icon: {
    key: IconPanelKey,
    title: IconPanelTitle,
  },
  image: {
    key: ImagePanelKey,
    title: ImagePanelTitle,
  },
};

export const Header: FC = observer(() => {
  const menuItems = useMemo(
    () => [
      {
        label: "开始",
        key: "start",
      },
      {
        label: "插入",
        key: "insert",
      },
    ],
    []
  );

  const pageActive = pageActiveStore.getPageActive();
  const elementActive = elementActiveStore.getElementActive();

  const [elementPanel, setElementPanel] = useState<{
    key: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (pageActive && elementActive) {
      // 使用store的getElementInfo方法来获取元素信息
      const element = pptStore.getElementInfo(pageActive, elementActive);

      if (element && MenuMapped[element.type as keyof typeof MenuMapped]) {
        const panel = MenuMapped[element.type as keyof typeof MenuMapped];
        setElementPanel(panel);
        // 自动切换到对应的panel
        menuActiveStore.setActiveMenu(panel.key);
        return;
      }
    }

    // 没有选中元素时，切换回开始页面
    setElementPanel(null);
    menuActiveStore.setActiveMenu("start");
  }, [elementActive, pageActive]);

  const otherPanelClick = useMemoizedFn(() => {
    menuActiveStore.setActiveMenu(elementPanel?.key || "");
  });

  return (
    <div className="px-[20px] pt-[10px] pb-[15px] flex items-center justify-center">
      <div className="flex items-center gap-[30px]">
        {menuItems.map((item) => (
          <div
            className={`text-[13px] cursor-pointer transition-colors duration-200 ease-in-out ${
              menuActiveStore.isActive(item.key)
                ? `text-[var(--primary-color)] font-bold ${styles.activeItem}`
                : "text-gray-600 hover:text-[var(--primary-color)]"
            }`}
            key={item.key}
            onClick={() => menuActiveStore.setActiveMenu(item.key)}
          >
            {item.label}
          </div>
        ))}
        {elementPanel && (
          <div
            className={`text-[13px] cursor-pointer transition-colors duration-200 ease-in-out ${
              menuActiveStore.isActive(elementPanel.key)
                ? `text-[var(--primary-color)] font-bold ${styles.activeItem}`
                : "text-gray-600 hover:text-[var(--primary-color)]"
            }`}
            onClick={otherPanelClick}
          >
            {elementPanel.title}
          </div>
        )}
      </div>
    </div>
  );
});
