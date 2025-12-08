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
import { FileJpg, FilePdf, FileSettings } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Button, Tooltip } from "antd";
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
      {
        label: "切换",
        key: "toggle",
      },
      {
        label: "视图",
        key: "view",
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
    const menuActive = menuActiveStore.getMenuActive();
    if (
      menuActive !== "start" &&
      menuActive !== "insert" &&
      menuActive !== "toggle" &&
      menuActive !== "view"
    ) {
      menuActiveStore.setActiveMenu("start");
    }
  }, [elementActive, pageActive]);

  const otherPanelClick = useMemoizedFn(() => {
    menuActiveStore.setActiveMenu(elementPanel?.key || "");
  });

  return (
    <div className="px-[20px] pt-[10px] pb-[12px] flex items-center justify-between">
      <div className="flex gap-[10px]">
        <Tooltip placement="bottomLeft" title="导出配置文件">
          <Button
            size="small"
            type="text"
            icon={<FileSettings theme="outline" size="17" fill="#5e5e5e" />}
          />
        </Tooltip>
        <Tooltip placement="bottom" title="导出PDF">
          <Button
            size="small"
            type="text"
            icon={<FilePdf theme="outline" size="17" fill="#5e5e5e" />}
          />
        </Tooltip>
        <Tooltip placement="bottom" title="导出JPG图片">
          <Button
            size="small"
            type="text"
            icon={<FileJpg theme="outline" size="17" fill="#5e5e5e" />}
          />
        </Tooltip>
      </div>
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
        {elementActive && (
          <div
            className={`text-[13px] cursor-pointer transition-colors duration-200 ease-in-out ${
              menuActiveStore.isActive("animation")
                ? `text-[var(--primary-color)] font-bold ${styles.activeItem}`
                : "text-gray-600 hover:text-[var(--primary-color)]"
            }`}
            onClick={() => menuActiveStore.setActiveMenu("animation")}
          >
            动画
          </div>
        )}
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
      <div>12</div>
    </div>
  );
});
