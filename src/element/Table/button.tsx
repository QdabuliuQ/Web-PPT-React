import { PanelButton } from "@/components/PanelButton";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  getCenteredElementPosition,
} from "@/constants/canvas";
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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const cols = columnIndex + 1;
      const rows = rowIndex + 1;
      const width = Math.min(
        Math.round(CANVAS_WIDTH * 0.8),
        Math.max(300, cols * 80)
      );
      const height = Math.min(
        Math.round(CANVAS_HEIGHT * 0.8),
        Math.max(150, rows * 36)
      );

      const table = CreateTable({
        dataSource: Array.from({ length: rows }).map(() =>
          Array.from({ length: cols }).map(() => ({
            fontSize: 14,
            color: "#000000",
            backgroundColor: "#ffffff",
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
            value: "",
            placement: "center-center" as const,
          }))
        ),
        columnWidths: Array.from({ length: cols }).map(() => 100 / cols),
        rowHeights: Array.from({ length: rows }).map(() => 100 / rows),
        width,
        height,
        ...getCenteredElementPosition(width, height),
      });

      const activePageId = pageActiveStore.getPageActive();
      if (activePageId && table) {
        pptStore.addElementInfo(activePageId, table);
      }

      setOpen(false);
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
      t,
    ]
  );

  return (
    <Popover
      open={open}
      placement="bottom"
      content={content}
      styles={{
        body: {
          background: "var(--panel-bg-solid)",
          boxShadow: "var(--panel-shadow)",
        },
      }}
    >
      <div onMouseEnter={handleOpen} onMouseLeave={handleClose}>
        <PanelButton
          active={open}
          icon={<TableFile theme="outline" size="22" fill="currentColor" />}
          title={t('elements.table.button')}
        />
      </div>
    </Popover>
  );
}
