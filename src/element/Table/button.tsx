import { PanelButton } from "@/components/PanelButton";
import { pageActiveStore, pptStore } from "@/store";
import { TableFile } from "@icon-park/react";
import { useMemoizedFn } from "ahooks";
import { Popover } from "antd";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateTable } from ".";
import styles from "./button.module.less";

const GirdRowCount = 10;
const GridColumnCount = 10;

export default function TableButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [indexs, setIndexs] = useState([-1, -1]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = useMemoizedFn(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(true);
  });

  const handleClose = useMemoizedFn(() => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
      setIndexs([-1, -1]);
    }, 100);
  });

  const handleMouseEnter = useMemoizedFn(
    (rowIndex: number, columnIndex: number) => {
      setIndexs([rowIndex, columnIndex]);
    }
  );

  const handleMouseLeave = useMemoizedFn(() => {
    setIndexs([-1, -1]);
  });

  const handleGridItemClick = useMemoizedFn(
    (rowIndex: number, columnIndex: number) => {
      // 清除延迟关闭的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const table = CreateTable({
        dataSource: Array.from({ length: rowIndex + 1 }).map(() =>
          Array.from({ length: columnIndex + 1 }).map(() => ({
            fontSize: 14,
            color: "#000000",
            backgroundColor: "#ffffff",
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            value: "",
            placement: "center-center",
          }))
        ),
        columnWidths: Array.from({ length: columnIndex + 1 }).map(
          () => 100 / (columnIndex + 1)
        ),
        rowHeights: Array.from({ length: rowIndex + 1 }).map(
          () => 100 / (rowIndex + 1)
        ),
      });

      // 添加表格到 mobx store
      const activePageId = pageActiveStore.getPageActive();
      if (activePageId && table) {
        pptStore.addElementInfo(activePageId, table);
      }

      // 立即关闭 Popover
      setOpen(false);
      // 重置索引
      setIndexs([-1, -1]);
    }
  );

  const content = useMemo(
    () => (
      <div
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        className={styles.tableButtonContainer}
      >
        <div className={styles.title}>
          {indexs[0] === -1 && indexs[1] === -1
            ? t('elements.table.insertTable')
            : t('elements.table.tableDimension', { row: indexs[0] + 1, col: indexs[1] + 1 })}
        </div>
        <div className={styles.gridContainer}>
          {Array.from({ length: GirdRowCount }).map((_, rowIndex) => (
            <div className={styles.gridRow} key={rowIndex}>
              {Array.from({ length: GridColumnCount }).map((_, columnIndex) => (
                <div
                  onMouseLeave={handleMouseLeave}
                  onMouseEnter={() => handleMouseEnter(rowIndex, columnIndex)}
                  onClick={() => handleGridItemClick(rowIndex, columnIndex)}
                  className={`${styles.gridItem} ${indexs[0] >= rowIndex && indexs[1] >= columnIndex ? styles.activeGridItem : ""}`}
                  key={columnIndex}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    [
      handleMouseEnter,
      handleMouseLeave,
      handleGridItemClick,
      handleOpen,
      handleClose,
      indexs,
    ]
  );

  return (
    <Popover open={open} placement="bottom" content={content}>
      <div onMouseEnter={handleOpen} onMouseLeave={handleClose}>
        <PanelButton
          icon={<TableFile theme="outline" size="22" fill="#333" />}
          title={t('elements.table.button')}
        />
      </div>
    </Popover>
  );
}
