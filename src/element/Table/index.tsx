import { MovableWrapper } from "@/components";
import { elementActiveStore, pageActiveStore, pptStore } from "@/store";
import type { ICommonElementProps } from "@/types/element";
import { getRandomId, placementConvey } from "@/utils";
import { observer } from "mobx-react-lite";
import { memo, useCallback, useEffect, useRef, useState, type FC } from "react";
import { useMovableElement } from "../../hooks/useMovableElement";
import type { PlacementMapped } from "../Text/constant";
import styles from "./index.module.less";

export interface ITableProps extends ICommonElementProps {
  type: "table";
  dataSource: Array<
    Array<{
      fontSize: number;
      color: string;
      backgroundColor: string;
      bold: boolean;
      value: string | number;
      placement: keyof typeof PlacementMapped;
    }>
  >;
  columnWidths: number[]; // 列宽百分比 [25, 25, 50] (总和应为100)
  rowHeights?: number[]; // 行高百分比，可选，默认auto
  fontSize: number;
  fontFamily?: string;
}

const Component: FC<ITableProps> = (props) => {
  const {
    dataSource,
    id,
    fontSize,
    fontFamily = "Arial, sans-serif",
    columnWidths,
    rowHeights,
    onSelect,
  } = props;
  const tableRef = useRef<HTMLTableElement>(null);
  const tableData = dataSource;

  // 表格调整相关状态
  const [resizing, setResizing] = useState<{
    type: "column" | "row";
    index: number;
    startPos: number;
    startSize: number;
  } | null>(null);
  const [currentColumnWidths, setCurrentColumnWidths] = useState(columnWidths);
  const [currentRowHeights, setCurrentRowHeights] = useState(rowHeights || []);

  // 当props变化时更新本地状态
  useEffect(() => {
    setCurrentColumnWidths(columnWidths);
    setCurrentRowHeights(rowHeights || []);
  }, [columnWidths, rowHeights]);

  // 表格调整功能相关回调
  const handleColumnResize = useCallback(
    (colIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setResizing({
        type: "column",
        index: colIndex,
        startPos: e.clientX,
        startSize: currentColumnWidths[colIndex],
      });
    },
    [currentColumnWidths]
  );

  const handleRowResize = useCallback(
    (rowIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setResizing({
        type: "row",
        index: rowIndex,
        startPos: e.clientY,
        startSize: currentRowHeights[rowIndex] || 25, // 默认25%
      });
    },
    [currentRowHeights]
  );

  // 监听全局鼠标事件处理调整
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing || !tableRef.current) return;

      const containerRect = tableRef.current.getBoundingClientRect();

      if (resizing.type === "column") {
        // 计算列宽变化
        const deltaX = e.clientX - resizing.startPos;
        const containerWidth = containerRect.width;
        const deltaPercent = (deltaX / containerWidth) * 100;

        const newWidths = [...currentColumnWidths];
        const nextIndex = resizing.index + 1;

        // 确保不会超出边界
        const newCurrentWidth = Math.max(
          5,
          Math.min(90, resizing.startSize + deltaPercent)
        );
        const widthDiff = newCurrentWidth - newWidths[resizing.index];

        if (nextIndex < newWidths.length) {
          const newNextWidth = Math.max(5, newWidths[nextIndex] - widthDiff);
          newWidths[resizing.index] = newCurrentWidth;
          newWidths[nextIndex] = newNextWidth;
          setCurrentColumnWidths(newWidths);
        }
      } else if (resizing.type === "row") {
        // 计算行高变化
        const deltaY = e.clientY - resizing.startPos;
        const containerHeight = containerRect.height;
        const deltaPercent = (deltaY / containerHeight) * 100;

        const newHeights = [...currentRowHeights];
        if (newHeights.length === 0) {
          // 如果没有设置行高，初始化为平均分布
          const avgHeight = 100 / tableData.length;
          for (let i = 0; i < tableData.length; i++) {
            newHeights[i] = avgHeight;
          }
        }

        const nextIndex = resizing.index + 1;
        const newCurrentHeight = Math.max(
          10,
          Math.min(80, resizing.startSize + deltaPercent)
        );
        const heightDiff = newCurrentHeight - newHeights[resizing.index];

        if (nextIndex < newHeights.length) {
          const newNextHeight = Math.max(
            10,
            newHeights[nextIndex] - heightDiff
          );
          newHeights[resizing.index] = newCurrentHeight;
          newHeights[nextIndex] = newNextHeight;
          setCurrentRowHeights(newHeights);
        }
      }
    };

    const handleMouseUp = () => {
      // 拖拽结束时，将最新的大小数据保存到MobX store
      if (resizing) {
        // 保存调整后的大小数据到MobX store
        pptStore.setElementInfo(
          pageActiveStore.getPageActive() as string,
          id,
          {
            ...props,
            columnWidths: currentColumnWidths,
            rowHeights:
              currentRowHeights.length > 0 ? currentRowHeights : undefined,
          } as any // 使用any避免类型冲突
        );
      }
      setResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    resizing,
    currentColumnWidths,
    currentRowHeights,
    tableData.length,
    id,
    props,
  ]);

  // 使用通用的可移动元素hook
  const {
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleResizeStart,
    handleResize,
    handleResizeEnd,
    handleRotateStart,
    handleRotate,
    handleRotateEnd,
  } = useMovableElement({
    id,
    props,
  });

  // 从 MobX store 中获取选中状态
  const isSelected = elementActiveStore.isElementActive(id);

  // 直接使用百分比，无需计算
  // columnWidths 和 rowHeights 已经是百分比数组

  // 处理点击事件，激活movable
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡到Canvas
      onSelect?.();
    },
    [onSelect]
  );

  return (
    <>
      <div
        className={styles.tableContainer}
        id={id}
        style={{
          width: `${props.width}px`,
          height: `${props.height}px`,
        }}
        onClick={handleClick}
      >
        <table
          ref={tableRef}
          className={styles.table}
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: fontFamily,
          }}
        >
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex === 0 ? styles.headerRow : styles.dataRow}
              >
                {row.map((cell, colIndex) => {
                  return (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className={`${
                        rowIndex === 0 ? styles.headerCell : styles.dataCell
                      } ${styles.cellBase}`}
                      style={{
                        width: `${currentColumnWidths[colIndex]}%`, // 应用列宽比例
                        height:
                          currentRowHeights.length > 0
                            ? `${currentRowHeights[rowIndex]}%`
                            : "auto", // 应用行高比例
                      }}
                    >
                      <div
                        className={styles.cellContent}
                        style={{
                          fontSize: `${cell.fontSize}px`,
                          color: cell.color,
                          fontWeight: cell.bold ? "bold" : "normal",
                          backgroundColor: cell.backgroundColor,
                          ...placementConvey(cell.placement), // flex布局应用到wrapper
                        }}
                      >
                        {cell.value || ""}
                      </div>

                      {/* 列调整句柄 - 不在最后一列显示 */}
                      {colIndex < row.length - 1 && (
                        <div
                          className={`${styles.columnResizeHandle} ${
                            resizing?.type === "column" &&
                            resizing.index === colIndex
                              ? styles.resizing
                              : ""
                          }`}
                          onMouseDown={(e) => handleColumnResize(colIndex, e)}
                        />
                      )}

                      {/* 行调整句柄 - 不在最后一行显示 */}
                      {rowIndex < tableData.length - 1 && (
                        <div
                          className={`${styles.rowResizeHandle} ${
                            resizing?.type === "row" &&
                            resizing.index === rowIndex
                              ? styles.resizing
                              : ""
                          }`}
                          onMouseDown={(e) => handleRowResize(rowIndex, e)}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MovableWrapper
        id={id}
        active={isSelected && !resizing} // 选中且不在调整状态时才激活拖拽
        bounds={{ left: 0, top: 0, right: 1000, bottom: 700 }}
        dragOnlyButton={false} // 可以直接拖拽表格
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
        onRotateStart={handleRotateStart}
        onRotate={handleRotate}
        onRotateEnd={handleRotateEnd}
      />
    </>
  );
};

export const Table = memo(observer(Component));

export const CreateTable = (props: Partial<ITableProps> = {}) => {
  const defaultProps: Omit<ITableProps, "type" | "id"> = {
    dataSource: [
      [
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#f5f5f5",
          bold: true,
          value: "姓名",
          placement: "center-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#f5f5f5",
          bold: true,
          value: "年龄",
          placement: "center-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#f5f5f5",
          bold: true,
          value: "职位",
          placement: "center-center",
        },
      ],
      [
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          value: "张三",
          placement: "left-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          value: 25,
          placement: "center-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          value: "开发工程师",
          placement: "left-center",
        },
      ],
      [
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          value: "李四",
          placement: "left-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          value: 30,
          placement: "center-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          value: "产品经理",
          placement: "left-center",
        },
      ],
      [
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          value: "王五",
          placement: "left-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          value: 28,
          placement: "center-center",
        },
        {
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          bold: false,
          value: "设计师",
          placement: "left-center",
        },
      ],
    ],
    columnWidths: [25, 25, 50], // 第一列25%, 第二列25%, 第三列50%
    rowHeights: [25, 25, 25, 25], // 四行各占25%（包括表头）
    fontSize: 14,
    fontFamily: "Arial, sans-serif",
    x: 0,
    y: 0,
    width: 300,
    height: 150,
    rotate: 0,
    zIndex: 0,
  };
  return {
    ...defaultProps,
    ...props,
    id: `table_${getRandomId()}`,
    type: "table" as const,
  };
};
