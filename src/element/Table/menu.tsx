import type { Menu } from "@/hooks/useContextMenu";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import {
  BottomBar,
  EditOne,
  LeftBar,
  RightBar,
  TopBar,
} from "@icon-park/react";
import i18n from "@/i18n";

// 获取表格元素信息的函数
const getTableElementInfo = () => {
  const pageActive = pageActiveStore.getPageActive();
  const elementActive = elementActiveStore.getElementActive();

  if (!pageActive || !elementActive) {
    return null;
  }

  const tableElement = pptStore.getElementInfo(pageActive, elementActive);
  if (!tableElement || tableElement.type !== "table") {
    return null;
  }

  return tableElement;
};

// 导出表格菜单项获取函数
export const getTableMenuItems = ({ onEdit }): Menu => {
  const t = i18n.t.bind(i18n);
  
  // 创建新的空单元格
  const createEmptyCell = () => ({
    fontSize: 14,
    color: "#000",
    backgroundColor: "#fff",
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    value: "",
    placement: "center-center" as const,
  });

  return [
    {
      type: "item",
      label: t('elements.table.editData'),
      icon: <EditOne theme="outline" size="13" fill="var(--icon-color)" />,
      onClick: onEdit,
    },
    {
      type: "separator",
    },
    {
      type: "item",
      label: t('elements.table.insertRow.top'),
      icon: <TopBar theme="outline" size="13" fill="var(--icon-color)" />,
      onClick: () => {
        const tableElement = getTableElementInfo();
        if (!tableElement) return;

        const { dataSource, rowHeights } = tableElement;
        const rowCount = dataSource.length;
        const colCount = dataSource[0]?.length || 0;

        if (!rowHeights || rowHeights.length === 0) return;

        // 在顶部插入一行
        const newRow = Array(colCount)
          .fill(null)
          .map(() => createEmptyCell());
        const newDataSource = [newRow, ...dataSource];

        // 重新计算行高
        const newRowHeights = [
          100 / (rowCount + 1),
          ...rowHeights.map((h) => (h * rowCount) / (rowCount + 1)),
        ];

        pptStore.setElementInfo(
          pageActiveStore.getPageActive()!,
          elementActiveStore.getElementActive()!,
          {
            ...tableElement,
            dataSource: newDataSource,
            rowHeights: newRowHeights,
          }
        );
      },
    },
    {
      type: "item",
      label: t('elements.table.insertRow.bottom'),
      icon: <BottomBar theme="outline" size="13" fill="var(--icon-color)" />,
      onClick: () => {
        const tableElement = getTableElementInfo();
        if (!tableElement) return;

        const { dataSource, rowHeights } = tableElement;
        const rowCount = dataSource.length;
        const colCount = dataSource[0]?.length || 0;

        if (!rowHeights || rowHeights.length === 0) return;

        // 在底部插入一行
        const newRow = Array(colCount)
          .fill(null)
          .map(() => createEmptyCell());
        const newDataSource = [...dataSource, newRow];

        // 重新计算行高
        const newRowHeights = [
          ...rowHeights.map((h) => (h * rowCount) / (rowCount + 1)),
          100 / (rowCount + 1),
        ];

        pptStore.setElementInfo(
          pageActiveStore.getPageActive()!,
          elementActiveStore.getElementActive()!,
          {
            ...tableElement,
            dataSource: newDataSource,
            rowHeights: newRowHeights,
          }
        );
      },
    },
    {
      type: "item",
      label: t('elements.table.insertColumn.left'),
      icon: <LeftBar theme="outline" size="13" fill="var(--icon-color)" />,
      onClick: () => {
        const tableElement = getTableElementInfo();
        if (!tableElement) return;

        const { dataSource, columnWidths } = tableElement;
        const colCount = dataSource[0]?.length || 0;

        // 在左边插入一列
        const newDataSource = dataSource.map((row) => [
          createEmptyCell(),
          ...row,
        ]);

        // 重新计算列宽
        const newColumnWidths = [
          100 / (colCount + 1),
          ...columnWidths.map((w) => (w * colCount) / (colCount + 1)),
        ];

        pptStore.setElementInfo(
          pageActiveStore.getPageActive()!,
          elementActiveStore.getElementActive()!,
          {
            ...tableElement,
            dataSource: newDataSource,
            columnWidths: newColumnWidths,
          }
        );
      },
    },
    {
      type: "item",
      label: t('elements.table.insertColumn.right'),
      icon: <RightBar theme="outline" size="13" fill="var(--icon-color)" />,
      onClick: () => {
        const tableElement = getTableElementInfo();
        if (!tableElement) return;

        const { dataSource, columnWidths } = tableElement;
        const colCount = dataSource[0]?.length || 0;

        // 在右边插入一列
        const newDataSource = dataSource.map((row) => [
          ...row,
          createEmptyCell(),
        ]);

        // 重新计算列宽
        const newColumnWidths = [
          ...columnWidths.map((w) => (w * colCount) / (colCount + 1)),
          100 / (colCount + 1),
        ];

        pptStore.setElementInfo(
          pageActiveStore.getPageActive()!,
          elementActiveStore.getElementActive()!,
          {
            ...tableElement,
            dataSource: newDataSource,
            columnWidths: newColumnWidths,
          }
        );
      },
    },
    {
      type: "separator",
    },
  ];
};
