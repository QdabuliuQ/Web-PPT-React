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
  const pages = pptStore.getPages();

  const [elementPanel, setElementPanel] = useState<{
    key: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (pageActive && elementActive) {
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].id === pageActive) {
          for (let j = 0; j < pages[i].elements.length; j++) {
            if (pages[i].elements[j].id === elementActive) {
              if (MenuMapped[pages[i].elements[j].type]) {
                setElementPanel(MenuMapped[pages[i].elements[j].type]);
                return;
              }
            }
          }
        }
      }
    }
    setElementPanel(null);
  }, [elementActive, pageActive, pages]);

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
